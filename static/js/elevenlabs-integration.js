// ElevenLabs Conversational AI Integration

// Streaming TTS class for real-time voice streaming
class StreamingTTS {
    constructor(apiKey, voiceId, modelId) {
        this.apiKey = apiKey;
        this.voiceId = voiceId;
        this.modelId = modelId;
        this.ws = null;
        this.audioContext = null;
    }
    
    async start() {
        try {
    
            
            // Initialize audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Ensure audio context is resumed for mobile browsers
            if (this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
        
                } catch (error) {
                    console.warn('⚠️ Streaming TTS: Could not resume audio context:', error);
                }
            }
            
            // Connect to ElevenLabs WebSocket
            const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream-input?model_id=${this.modelId}&output_format=pcm_22050&xi-api-key=${this.apiKey}`;
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
    
                
                // Send initialization message
                this.ws.send(JSON.stringify({
                    text: " ",
                    voice_settings: {
                        stability: 0.7,
                        similarity_boost: 0.7,
                        use_speaker_boost: true
                    },
                    generation_config: {
                        chunk_length_schedule: [50, 90, 120, 150, 200]
                    }
                }));
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                if (data.audio) {
                    // Decode base64 audio and play immediately
                    const audioData = atob(data.audio);
                    const audioArray = new Uint8Array(audioData.length);
                    for (let i = 0; i < audioData.length; i++) {
                        audioArray[i] = audioData.charCodeAt(i);
                    }
                    
                    this.playAudioChunk(audioArray);
                }
                
                if (data.isFinal) {
        
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                // Fallback to regular TTS if WebSocket fails
    
            };
            
            this.ws.onclose = () => {
    
            };
            
        } catch (error) {
            console.error('❌ Error starting streaming TTS:', error);
        }
    }
    
    async sendText(text) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ text: text }));
        }
    }
    
    async playAudioChunk(audioArray) {
        try {
            // Convert PCM data to audio buffer
            const audioBuffer = this.audioContext.createBuffer(1, audioArray.length / 2, 22050);
            const channelData = audioBuffer.getChannelData(0);
            
            // Convert 16-bit PCM to float32
            for (let i = 0; i < audioArray.length; i += 2) {
                const sample = (audioArray[i] | (audioArray[i + 1] << 8)) / 32768.0;
                channelData[i / 2] = sample;
            }
            
            // Create audio source and play
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();
            
        } catch (error) {
            console.error('❌ Error playing audio chunk:', error);
        }
    }
    
    async close() {
        if (this.ws) {
            this.ws.send(JSON.stringify({ text: "", flush: true }));
            this.ws.close();
        }
    }
}

class ElevenLabsConversationalAI {
    constructor() {
        this.isConnected = false;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.mediaStream = null;
        this.audioChunks = [];
        this.websocket = null;
        this.audioContext = null;
        this.audioQueue = [];
        this.isPlaying = false;
        this.audioUnlocked = false; // Track if audio has been unlocked
        this.unlockedAudio = null; // Store unlocked audio element
        
        // ElevenLabs Configuration
        this.elevenLabsApiKey = 'sk_e7a2441a1a89bdf683388edc0083242104e50e6aaf4ec79c';
        this.elevenLabsVoiceId = 'foB7BprNxwUpIFQmq811'; // Default voice ID (Rachel)
        this.elevenLabsModel = 'eleven_multilingual_v2';
        
        // RAG Backend Configuration
        this.ragBackendUrl = 'https://mrparracho-github-io.onrender.com';
        
        this.init();
    }
    
    async init() {
        // Check browser compatibility
        if (!this.checkCompatibility()) {
            console.error('❌ Browser not compatible with ElevenLabs features');
            return;
        }
        
        // Initialize audio context (but don't resume until user interaction)
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Listen for user interaction to resume audio context
            this.setupAudioContextResume();
        } catch (error) {
            console.error('❌ Failed to initialize audio context:', error);
            return;
        }
        
        // Set up the sphere click handler
        this.setupSphereInteraction();
        
        // Check RAG backend health
        this.checkRAGHealth();
    }
    
    checkCompatibility() {
        const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
        const hasWebSocket = typeof WebSocket !== 'undefined';
        const hasAudioContext = typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined';
        
        return hasMediaRecorder && hasWebSocket && hasAudioContext;
    }
    
    setupSphereInteraction() {
        const sphere = document.getElementById('threejs-container');
        
        if (!sphere) {
            console.error('❌ Required elements not found');
            return;
        }
        
        // Remove any existing click handlers from this script
        sphere.removeEventListener('click', this.handleSphereClick);
    }
    
    setupAudioContextResume() {
        // Set up comprehensive audio unlock for mobile browsers
        const unlockAudio = async () => {
            if (this.audioUnlocked) return;
            
            try {
                // Resume AudioContext
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
                
                // Create and play a silent audio file to unlock HTML5 Audio
                const silentAudio = new Audio();
                silentAudio.src = 'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAAAAAAAAAAAAAAAAAAA=';
                silentAudio.volume = 0;
                silentAudio.preload = 'auto';
                
                // Attempt to play the silent audio
                try {
                    const playPromise = silentAudio.play();
                    if (playPromise !== undefined) {
                        await playPromise;
                    }
                    this.audioUnlocked = true;
                    this.unlockedAudio = silentAudio;
                } catch (playError) {
                    // Silent audio play blocked, will try again on next interaction
                }
                
            } catch (error) {
                console.warn('⚠️ Audio unlock attempt failed:', error);
            }
        };
        
        // Add listeners for both mouse and touch events
        const events = ['click', 'touchstart', 'touchend', 'mousedown', 'keydown'];
        const onFirstInteraction = () => {
            unlockAudio();
            // Don't remove listeners - we might need multiple attempts
        };
        
        events.forEach(event => {
            document.addEventListener(event, onFirstInteraction, { once: false, passive: true });
        });
    }
    
    async handleSphereClick(e) {
        // Prevent event bubbling
        e.preventDefault();
        e.stopPropagation();
        
        if (this.isRecording) {
            // If already recording, stop
            await this.stopRecording();
        } else {
            // Start recording
            await this.startRecording();
        }
    }
    
    async startRecording() {
        try {
            // Trigger sphere listening animation
            if (window.sphereAnimationController) {
                window.sphereAnimationController.setListening();
            }
            
            // Update status indicator to show listening mode
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Listening...';
            }
            
            // Get microphone access with basic audio settings
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
            
            // Find supported audio format
            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                mimeType = 'audio/webm';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
                mimeType = 'audio/ogg;codecs=opus';
            }
            
            // Create MediaRecorder with supported format
            this.mediaRecorder = new MediaRecorder(this.mediaStream, {
                mimeType: mimeType
            });
            
            this.audioChunks = [];
            this.recordingStartTime = Date.now(); // Track when recording started
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                await this.processAudioRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            this.resetSphereLabel();
            
            // Clean up any partially created media stream
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => {
                    track.stop();
                });
                this.mediaStream = null;
            }
            
            if (error.name === 'NotAllowedError') {
                alert('Microphone access denied. Please:\n1. Click the microphone icon in your browser address bar\n2. Select "Allow" for microphone access\n3. Refresh the page and try again');
            } else if (error.name === 'NotSupportedError') {
                alert('Audio recording not supported in this browser. Please try Chrome, Firefox, or Edge.');
            } else {
                alert(`Error: ${error.message}. Please check your microphone settings and try again.`);
            }
        }
    }
    
    async stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Stop all media tracks to release microphone
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => {
                    track.stop();
                });
                this.mediaStream = null;
            }
        }
    }
    
    async processAudioRecording() {
        try {
            // Check if we have any audio data
            if (!this.audioChunks || this.audioChunks.length === 0) {
                console.warn('⚠️ No audio data captured');
                this.handleNoAudioCaptured();
                return;
            }
            
            // Check recording duration (minimum 500ms to avoid accidental clicks)
            const recordingDuration = Date.now() - this.recordingStartTime;
            if (recordingDuration < 500) {
                console.warn('⚠️ Recording too short:', recordingDuration + 'ms');
                this.handleShortRecording();
                return;
            }
            
            // Create audio blob and check if it has meaningful content
            const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
            
            // Check if the blob has actual content (not just empty data)
            if (audioBlob.size < 100) { // Less than 100 bytes is likely empty
                console.warn('⚠️ Audio blob too small:', audioBlob.size + ' bytes');
                this.handleNoAudioCaptured();
                return;
            }
            
            // Update status to show processing
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Processing question...';
            }
            
            // Create an actual audio file from the blob
            const audioFile = await this.createAudioFile(audioBlob);
            
            if (this.elevenLabsApiKey) {
                // Send to real ElevenLabs API
                await this.sendToElevenLabs(audioFile);
            } else {
                // Demo mode
                setTimeout(() => {
                    this.handleAIResponse('Demo mode: No API key configured. Please add your ElevenLabs API key for real AI responses.');
                }, 2000);
            }
            
        } catch (error) {
            console.error('❌ Failed to process audio:', error);
            this.handleAIResponse('Sorry, I encountered an error processing your audio. Please try again.');
        }
    }
    
    async createAudioFile(audioBlob) {
        try {
            // Create a File object from the blob with correct extension
            const extension = this.getFileExtension(this.mediaRecorder.mimeType);
            const audioFile = new File([audioBlob], `recording.${extension}`, {
                type: this.mediaRecorder.mimeType,
                lastModified: Date.now()
            });
            
            return audioFile;
            
        } catch (error) {
            console.error('❌ Error creating audio file:', error);
            throw error;
        }
    }
    
    getFileExtension(mimeType) {
        if (mimeType.includes('webm')) return 'webm';
        if (mimeType.includes('mp4')) return 'mp4';
        if (mimeType.includes('ogg')) return 'ogg';
        return 'webm'; // default fallback
    }
    
    async sendToElevenLabs(audioFile) {
        try {

            

            
            // Create FormData for multipart/form-data request
            const formData = new FormData();
            formData.append('file', audioFile);
            formData.append('model_id', 'scribe_v1');
            
            // Make the API call to ElevenLabs
            const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
                method: 'POST',
                headers: {
                    'xi-api-key': this.elevenLabsApiKey
                },
                body: formData
            });
            
            if (!response.ok) {
                let errorMessage = `ElevenLabs API error: ${response.status} ${response.statusText}`;
                
                try {
                    const errorData = await response.text();
                    errorMessage += ` - ${errorData}`;
                } catch (e) {
                    // Could not read error response body
                }
                
                throw new Error(errorMessage);
            }
            
            const result = await response.json();
            
            // Handle the transcription and generate response
            if (result.text) {
                const userMessage = result.text;
                
                // Now generate AI response using ElevenLabs text-to-speech
                await this.generateAIResponse(userMessage);
            } else if (result.transcription) {
                // Alternative response format
                const userMessage = result.transcription;
                await this.generateAIResponse(userMessage);
            } else {
                throw new Error('No transcription text received from ElevenLabs API');
            }
            
        } catch (error) {
            console.error('❌ ElevenLabs API error:', error);
            
            // Update status to show voice not available
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Voice not available';
            }
            
            this.handleAIResponse(`Voice service unavailable: ${error.message}. Please try the text chat instead.`);
        }
    }
    
    async generateAIResponse(userMessage) {
        try {
            // Trigger sphere speaking animation
            if (window.sphereAnimationController) {
                window.sphereAnimationController.setSpeaking();
            }
            
            // Send question to RAG backend
            const ragResponse = await this.askRAG(userMessage);
            
            // Convert AI response to speech using ElevenLabs TTS
            await this.textToSpeech(ragResponse);
            
        } catch (error) {
            console.error('❌ Error generating AI response:', error);
            this.handleAIResponse('Sorry, I had trouble generating a response. Please try again.');
        }
    }
    
    async checkRAGHealth() {
        try {
            const response = await fetch(`${this.ragBackendUrl}/health`);
            
            if (response.ok) {
                const health = await response.json();
                
                if (health.openai_configured) {
                    // OpenAI configured for RAG
                } else {
                    console.warn('⚠️ OpenAI not configured for RAG');
                }
            } else {
                console.warn('⚠️ RAG backend health check failed');
            }
        } catch (error) {
            console.warn('⚠️ RAG backend not accessible:', error.message);
        }
    }
    
    async askRAG(question) {
        try {
            // Update status text to show RAG processing
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Searching knowledge...';
            }
            
            const response = await fetch(`${this.ragBackendUrl}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: question
                })
            });
            
            if (!response.ok) {
                throw new Error(`RAG API error: ${response.status} ${response.statusText}`);
            }
            
            // Handle Server-Sent Events (SSE) response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            let tokenCount = 0;
            let isComplete = false;
            let ttsStarted = false;
            
            // Initialize streaming TTS
            let streamingTTS = null;
            
            while (!isComplete) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.token) {
                                // Stream token received
                                fullResponse += data.token;
                                tokenCount++;
                    
                                
                                // Start streaming TTS as soon as we have 5 tokens
                                if (tokenCount >= 5 && !ttsStarted) {
                        
                                    ttsStarted = true;
                                    
                                    try {
                                        // Initialize streaming TTS
                                        streamingTTS = new StreamingTTS(this.elevenLabsApiKey, this.elevenLabsVoiceId, this.elevenLabsModel);
                                        await streamingTTS.start();
                                        
                                        // Send initial text
                                        await streamingTTS.sendText(fullResponse);
                                        
                                        // Update status text to show TTS is starting
                                        const statusText = document.querySelector('.status-text');
                                        if (statusText) {
                                            statusText.textContent = 'Speaking...';
                                        }
                                    } catch (error) {
                                        console.error('❌ Streaming TTS failed, falling back to regular TTS:', error);
                                        streamingTTS = null;
                                        this.textToSpeech(fullResponse);
                                    }
                                } else if (ttsStarted && streamingTTS) {
                                    // Send new tokens to streaming TTS
                                    try {
                                        await streamingTTS.sendText(data.token);
                                    } catch (error) {
                                        console.error('❌ Error sending text to streaming TTS:', error);
                                        // Fallback to regular TTS
                                        streamingTTS = null;
                                        this.textToSpeech(fullResponse);
                                    }
                                }
                                
                                // Keep status text showing "RAG Thinking..." during streaming
                                const statusText = document.querySelector('.status-text');
                                if (statusText && !ttsStarted) {
                                    statusText.textContent = 'RAG thinking...';
                                }
                            } else if (data.text) {
                                // Final response received
                                fullResponse = data.text;
                                isComplete = true;
                    
                                
                                // If TTS hasn't started yet, start it now with the full response
                                if (!ttsStarted) {
                                    this.textToSpeech(fullResponse);
                                } else if (streamingTTS) {
                                    // Close streaming TTS
                                    await streamingTTS.close();
                                }
                            }
                        } catch (e) {
                            // Raw SSE data parsing error
                        }
                    }
                }
            }
            
            return fullResponse || 'I apologize, but I could not generate a response at this time.';
            
        } catch (error) {
            console.error('❌ RAG API error:', error);
            return `I'm sorry, but I'm having trouble connecting to my knowledge base. Error: ${error.message}`;
        }
    }
    
    async textToSpeech(text) {
        try {
            // Update status to show TTS starting
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Creating speech...';
            }
            
            // Add to audio queue
            this.audioQueue.push(text);
            
            // If not currently playing, start processing the queue
            if (!this.isPlaying) {
                this.processAudioQueue();
            }
            
        } catch (error) {
            console.error('❌ TTS API error:', error);
            
            // Update status to show voice not available
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Voice not available';
            }
            
            this.handleAIResponse(`Voice service unavailable: ${error.message}. Please try the text chat instead.`);
        }
    }
    

    
    async processAudioQueue() {
        if (this.audioQueue.length === 0 || this.isPlaying) {
            return;
        }
        
        this.isPlaying = true;
        const text = this.audioQueue.shift();
        
        // Update status text to show TTS processing
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = 'Creating speech...';
        }
        
        try {
            // Try streaming TTS first for better quality
            try {
                await this.streamingTTS(text);
                return;
            } catch (streamError) {
                // Streaming TTS failed, falling back to regular TTS
            }
            
            // Fallback to regular TTS
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.elevenLabsVoiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.elevenLabsApiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: this.elevenLabsModel,
                    voice_settings: {
                        stability: 0.7,
                        similarity_boost: 0.7,
                        style: 0.0,
                        use_speaker_boost: true
                    },
                    generation_config: {
                        chunk_length_schedule: [50, 90, 120, 150, 200],
                        temperature: 0.7,
                        length_penalty: 1.0,
                        repetition_penalty: 1.0,
                        top_p: 0.8,
                        top_k: 40
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
            }
            
            const audioBlob = await response.blob();
            
            // Play the audio response
            await this.playAudioResponse(audioBlob, text);
            
        } catch (error) {
            console.error('❌ TTS API error:', error);
            
            // Update status to show voice not available
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Voice not available';
            }
            
            this.isPlaying = false;
            // Continue with next item in queue
            this.processAudioQueue();
        }
    }
    
    async streamingTTS(text) {
        try {
            // Update status text
            const statusText = document.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Answering...';
            }
            
            // Use streaming TTS endpoint
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.elevenLabsVoiceId}/stream`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.elevenLabsApiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: this.elevenLabsModel,
                    voice_settings: {
                        stability: 0.7,
                        similarity_boost: 0.7,
                        style: 0.0,
                        use_speaker_boost: true
                    },
                    generation_config: {
                        chunk_length_schedule: [50, 90, 120, 150, 200],
                        temperature: 0.7,
                        length_penalty: 1.0,
                        repetition_penalty: 1.0,
                        top_p: 0.8,
                        top_k: 40
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`Streaming TTS API error: ${response.status} ${response.statusText}`);
            }
            
            const audioBlob = await response.blob();
            
            // Play the audio response
            await this.playAudioResponse(audioBlob, text);
            
        } catch (error) {
            throw error;
        }
    }
    
    async playAudioResponse(audioBlob, text) {
        try {
            // Update UI to responding state first
            this.updateUIToResponding();
            
            // Try multiple approaches for seamless mobile audio
            let audioPlayed = false;
            
            // Approach 1: Try direct audio playback (works if audio is unlocked)
            if (this.audioUnlocked) {
                audioPlayed = await this.tryDirectAudioPlayback(audioBlob, text);
            }
            
            // Approach 2: Try with audio context unlock
            if (!audioPlayed) {
                audioPlayed = await this.tryAudioWithUnlock(audioBlob, text);
            }
            
            // Approach 3: Use the pre-unlocked audio element (most reliable on mobile)
            if (!audioPlayed && this.unlockedAudio) {
                audioPlayed = await this.tryUnlockedAudioPlayback(audioBlob, text);
            }
            
            // Approach 4: Only as last resort, show the tap prompt
            if (!audioPlayed) {
                this.createMobileAudioPrompt(audioBlob, text);
            }
            
        } catch (error) {
            console.error('❌ Error in audio playback system:', error);
            this.handleAIResponse('Voice service temporarily unavailable. Here is the text: ' + text);
        }
    }
    
    updateUIToResponding() {
        // Update talk button to responding state (no text change)
        const talkButton = document.getElementById('talk-button');
        if (talkButton) {
            talkButton.classList.remove('thinking');
            talkButton.classList.add('responding');
        }
        
        // Update status indicator to show playing
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = 'Answering...';
        }
    }
    
    async tryDirectAudioPlayback(audioBlob, text) {
        try {

            
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            // Configure audio for mobile compatibility
            audio.preload = 'auto';
            audio.volume = 1.0;
            audio.playbackRate = 1.1;
            
            this.setupAudioEventHandlers(audio, audioUrl, text);
            
            await audio.play();

            return true;
            
        } catch (error) {

            return false;
        }
    }
    
    async tryAudioWithUnlock(audioBlob, text) {
        try {

            
            // Force unlock attempt
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.preload = 'auto';
            audio.volume = 1.0;
            audio.playbackRate = 1.1;
            
            this.setupAudioEventHandlers(audio, audioUrl, text);
            
            await audio.play();
            this.audioUnlocked = true;
            return true;
            
        } catch (error) {
            return false;
        }
    }
    
    async tryUnlockedAudioPlayback(audioBlob, text) {
        try {
            // Reuse the unlocked audio element with new source
            const audioUrl = URL.createObjectURL(audioBlob);
            this.unlockedAudio.src = audioUrl;
            this.unlockedAudio.volume = 1.0;
            this.unlockedAudio.playbackRate = 1.1;
            
            this.setupAudioEventHandlers(this.unlockedAudio, audioUrl, text);
            
            await this.unlockedAudio.play();
            return true;
            
        } catch (error) {
            return false;
        }
    }
    
    setupAudioEventHandlers(audio, audioUrl, text) {
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            this.onAudioComplete();
        };
        
        audio.onerror = (error) => {
            console.error('❌ Audio playback error:', error);
            URL.revokeObjectURL(audioUrl);
            this.handleAIResponse('Audio error. Here is the text: ' + text);
        };
    }
    
    onAudioComplete() {
        // Trigger sphere idle animation
        if (window.sphereAnimationController) {
            window.sphereAnimationController.setIdle();
        }
        
        // Reset talk button to ready state
        const talkButton = document.getElementById('talk-button');
        if (talkButton) {
            talkButton.classList.remove('listening', 'processing');
            talkButton.disabled = false;
            talkButton.querySelector('i').className = 'fas fa-microphone';
            talkButton.querySelector('.button-text').textContent = 'Click & hold to speak';
            
            if (window.isPlayingWelcome) {
                // Reset welcome flag
                window.isPlayingWelcome = false;
            }
        }
        
        // Dispatch global event for main.js to catch
        const isWelcome = window.isPlayingWelcome || false;
        document.dispatchEvent(new CustomEvent('audioCompleted', {
            detail: {
                isWelcome: isWelcome,
                timestamp: Date.now()
            }
        }));
        
        // Mark as not playing and continue with queue
        this.isPlaying = false;
        
        // Process next item in queue if any
        if (this.audioQueue.length > 0) {
            this.processAudioQueue();
        } else {
            // No more items, reset to ready state
            this.resetSphereLabel();
        }
    }
    
    createMobileAudioPrompt(audioBlob, text) {
        // Update the status text to show tap instruction
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = 'Tap sphere for audio';
        }
        
        // Create audio element
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.preload = 'auto';
        audio.volume = 1.0;
        audio.playbackRate = 1.1;
        
        // Add click handler to sphere container
        const sphereContainer = document.getElementById('threejs-container');
        const playAudio = async () => {
            try {
                await audio.play();
                
                // Set up normal audio event handlers
                this.setupAudioEventHandlers(audio, audioUrl, text);
                
                // Remove the click handler
                if (sphereContainer) {
                    sphereContainer.removeEventListener('click', playAudio);
                }
                
                // Reset status text
                if (statusText) {
                    statusText.textContent = 'Ready to chat';
                }
                
            } catch (error) {
                console.error('❌ Mobile audio prompt failed:', error);
                this.handleAIResponse(text);
                
                // Clean up
                URL.revokeObjectURL(audioUrl);
                if (sphereContainer) {
                    sphereContainer.removeEventListener('click', playAudio);
                }
                if (statusText) {
                    statusText.textContent = 'Ready to chat';
                }
            }
        };
        
        if (sphereContainer) {
            sphereContainer.addEventListener('click', playAudio, { once: true });
        }
        
        // Auto-fallback after 8 seconds
        setTimeout(() => {
            if (sphereContainer) {
                sphereContainer.removeEventListener('click', playAudio);
            }
            if (statusText && statusText.textContent === 'Tap sphere for audio') {
                this.handleAIResponse(text);
                statusText.textContent = 'Ready to chat';
            }
            URL.revokeObjectURL(audioUrl);
        }, 8000);
    }
    
    handleAIResponse(responseText) {
        // Don't display text on sphere - just log it
        // The sphere will show status updates only
    }
    
    resetSphereLabel() {
        // Trigger sphere idle animation
        if (window.sphereAnimationController) {
            window.sphereAnimationController.setIdle();
        }
        
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = 'Ready to chat';
        }
    }
    
    // Handle cases where no audio was captured
    handleNoAudioCaptured() {
        console.log('ℹ️ No audio captured - resetting state');
        
        // Update status to show no audio captured
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = 'No audio captured. Please try again.';
        }
        
        // Reset sphere animation
        if (window.sphereAnimationController) {
            window.sphereAnimationController.setIdle();
        }
        
        // Emit event to reset main.js states
        document.dispatchEvent(new CustomEvent('audioCompleted'));
        
        // Reset internal state
        this.isRecording = false;
        this.audioChunks = [];
    }
    
    // Handle cases where recording was too short
    handleShortRecording() {
        console.log('ℹ️ Recording too short - resetting state');
        
        // Update status to show recording too short
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = 'Recording too short. Please hold the button while speaking.';
        }
        
        // Reset sphere animation
        if (window.sphereAnimationController) {
            window.sphereAnimationController.setIdle();
        }
        
        // Emit event to reset main.js states
        document.dispatchEvent(new CustomEvent('audioCompleted'));
        
        // Reset internal state
        this.isRecording = false;
        this.audioChunks = [];
    }
    
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create global instance
    window.elevenLabsAI = new ElevenLabsConversationalAI();
});
