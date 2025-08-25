# realtime_tts_play.py
import os, json, base64, asyncio, contextlib
from dotenv import load_dotenv
import websockets
import pyaudio

load_dotenv()
ELEVEN_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID       = os.getenv("ELEVENLABS_VOICE_ID")  # your cloned voice id
MODEL_ID       = "eleven_flash_v2_5"               # low-latency model
OUTPUT_FORMAT  = "pcm_22050"                       # raw 16-bit PCM (mono)

# ---- audio sink (PyAudio) ----
class LivePlayer:
    def __init__(self, sample_rate=22050, channels=1):
        self.p = pyaudio.PyAudio()
        self.stream = self.p.open(
            format=pyaudio.paInt16,
            channels=channels,
            rate=sample_rate,
            output=True,
            frames_per_buffer=1024,
        )

    def write(self, pcm_bytes: bytes):
        if pcm_bytes:
            # write blocks until the device buffer can accept more
            self.stream.write(pcm_bytes, exception_on_underflow=False)

    def close(self):
        with contextlib.suppress(Exception):
            self.stream.stop_stream()
            self.stream.close()
            self.p.terminate()

async def elevenlabs_ws_tts_play(text_chunks_async_iter, voice_id=VOICE_ID, model_id=MODEL_ID, output_format=OUTPUT_FORMAT):
    # derive sample rate from 'pcm_22050'
    assert output_format.startswith("pcm_"), "Use PCM for easiest live playback"
    sample_rate = int(output_format.split("_")[1])

    # Build WS URL with model + output format (PCM)
    uri = f"wss://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream-input"
    uri += f"?model_id={model_id}&output_format={output_format}"

    # Connect (auth via header)
    headers = [("xi-api-key", ELEVEN_API_KEY)]
    async with websockets.connect(uri, additional_headers=headers, max_size=None) as ws:
        # 1) Initialize connection (voice settings + optional buffering strategy)
        init_msg = {
            "text": " ",  # keep-alive seed; a single space keeps the WS open
            "voice_settings": {
                "stability": 0.45,
                "similarity_boost": 0.9,
                "use_speaker_boost": False
            },
            # fine-tune latency vs quality; defaults are OK
            "generation_config": {
                # how many chars to buffer before first audio; smaller -> lower TTFB (may reduce quality)
                "chunk_length_schedule": [80, 120, 180, 220]
            }
        }
        await ws.send(json.dumps(init_msg))

        player = LivePlayer(sample_rate=sample_rate, channels=1)

        async def reader():
            """Receive base64 audio frames and play immediately."""
            try:
                while True:
                    msg = await ws.recv()
                    data = json.loads(msg)

                    # Each message may contain an `audio` field (base64) and flags
                    if data.get("audio"):
                        pcm = base64.b64decode(data["audio"])
                        player.write(pcm)

                    # When ElevenLabs signals finalization, we can exit
                    if data.get("isFinal"):
                        break
            except websockets.exceptions.ConnectionClosed:
                pass
            finally:
                player.close()

        async def writer():
            """Send text chunks from your RAG as they’re produced."""
            async for chunk, is_final in text_chunks_async_iter:
                # Send each sentence/phrase as it’s ready
                await ws.send(json.dumps({"text": chunk}))

                # On the last chunk of a turn, force-flush buffered text for snappier ending
                if is_final:
                    await ws.send(json.dumps({"text": "", "flush": True}))  # empty string closes the WS per docs

        # Run both concurrently
        await asyncio.gather(reader(), writer())

# ---- Example: pretend this is your RAG's streamed output
async def fake_rag_stream():
    # yield (text_chunk, is_final)
    yield ("My expected salary range is between £95,000 to £120,000", False) 
    yield ("depending on factors like responsibilities, product type, and potential bonuses or equity.", False)
    yield ("I'm flexible and open to discussing this further.", True)

async def main():
    await elevenlabs_ws_tts_play(fake_rag_stream())

if __name__ == "__main__":
    asyncio.run(main())
