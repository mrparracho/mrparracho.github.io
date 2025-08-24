// ElevenLabs Conversational AI Integration - Audio File Mode
console.log('🚀 ELEVENLABS CONVERSATIONAL AI LOADING...');

class ElevenLabsConversationalAI {
    constructor() {
        this.isConnected = false;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.websocket = null;
        this.audioContext = null;
        this.audioQueue = [];
        this.isPlaying = false;
        this.currentAudio = null;
        
        // ElevenLabs Configuration
        this.elevenLabsApiKey = 'sk_e7a2441a1a89bdf683388edc0083242104e50e6aaf4ec79c';
        this.elevenLabsVoiceId = 'foB7BprNxwUpIFQmq811'; // Default voice ID (Rachel)
        this.elevenLabsModel = 'eleven_multilingual_v2';
        
        // RAG Backend Configuration
        this.ragBackendUrl = 'http://localhost:8001';
        
        this.init();
    }
    
    async init() {
        console.log('🎯 Initializing ElevenLabs AI...');
        
        // Check browser compatibility
        if (!this.checkCompatibility()) {
            console.error('❌ Browser not compatible with ElevenLabs features');
            return;
        }
        
        // Initialize audio context
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✅ Audio context initialized');
        } catch (error) {
            console.error('❌ Failed to initialize audio context:', error);
            return;
        }
        
        // Set up the sphere click handler
        this.setupSphereInteraction();
        
        // Check RAG backend health
        this.checkRAGHealth();
        
        console.log('✅ ElevenLabs AI initialized successfully');
    }
    
    checkCompatibility() {
        const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
        const hasWebSocket = typeof WebSocket !== 'undefined';
        const hasAudioContext = typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined';
        
        console.log('🔍 Browser compatibility check:', {
            MediaRecorder: hasMediaRecorder,
            WebSocket: hasWebSocket,
            AudioContext: hasAudioContext
        });
        
        return hasMediaRecorder && hasWebSocket && hasAudioContext;
    }
    
    setupSphereInteraction() {
        const sphere = document.getElementById('threejs-container');
        const label = document.querySelector('.sphere-label');
        
        if (!sphere || !label) {
            console.error('❌ Required elements not found');
            return;
        }
        
        console.log('🎯 Setting up sphere interaction...');
        
        // Remove any existing click handlers from this script
        sphere.removeEventListener('click', this.handleSphereClick);
        
        // Add our click handler
        sphere.addEventListener('click', this.handleSphereClick.bind(this));
        
        // Update label to indicate it's ready
        label.textContent = 'Ask me anything (Click to Speak)';
        label.style.cursor = 'pointer';
        label.style.color = '#1e40af'; // Deep blue
        
        console.log('✅ Sphere interaction setup complete');
    }
    
    async handleSphereClick(e) {
        console.log('🎯 Sphere clicked - starting voice capture');
        
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
            console.log('🎤 Starting voice recording...');
            
            // Update sphere label to show listening mode
            const label = document.querySelector('.sphere-label');
            if (label) {
                label.textContent = 'Listening...';
                label.style.color = '#3b82f6'; // Bright blue
                label.style.fontWeight = 'bold';
            }
            
            // Get microphone access with basic audio settings
            const stream = await navigator.mediaDevices.getUserMedia({ 
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
            
            console.log('🎵 Using audio format:', mimeType);
            
            // Create MediaRecorder with supported format
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType
            });
            
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                await this.processAudioRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            console.log('✅ Voice recording started');
            
        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            this.resetSphereLabel();
            
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
            console.log('🛑 Stopping voice recording...');
            
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Update sphere label to show processing
            const label = document.querySelector('.sphere-label');
            if (label) {
                label.textContent = 'Processing...';
                label.style.color = '#60a5fa'; // Light blue
            }
            
            console.log('✅ Voice recording stopped');
        }
    }
    
    async processAudioRecording() {
        console.log('🔊 Processing audio recording...');
        
        try {
            // Create audio blob with the recorded format
            const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
            console.log('📁 Audio blob created:', audioBlob);
            
            // Create an actual audio file from the blob
            const audioFile = await this.createAudioFile(audioBlob);
            console.log('📄 Audio file created:', audioFile);
            
            // Update sphere label to show AI thinking
            const label = document.querySelector('.sphere-label');
            if (label) {
                label.textContent = 'AI Thinking...';
                label.style.color = '#1d4ed8'; // Medium blue
            }
            
            console.log('📤 Audio file ready for ElevenLabs API:', audioFile);
            
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
            console.log('🔧 Creating audio file from blob...');
            
            // Create a File object from the blob with correct extension
            const extension = this.getFileExtension(this.mediaRecorder.mimeType);
            const audioFile = new File([audioBlob], `recording.${extension}`, {
                type: this.mediaRecorder.mimeType,
                lastModified: Date.now()
            });
            
            console.log('✅ Audio file created:', {
                name: audioFile.name,
                size: audioFile.size,
                type: audioFile.type,
                lastModified: audioFile.lastModified
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
            console.log('🚀 Sending audio file to ElevenLabs API...');
            
            console.log('📡 Sending request to ElevenLabs...');
            
            // Create FormData for multipart/form-data request
            const formData = new FormData();
            formData.append('file', audioFile);
            formData.append('model_id', 'scribe_v1');
            
            console.log('🔍 FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}:`, value);
            }
            
            // Make the API call to ElevenLabs
            const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
                method: 'POST',
                headers: {
                    'xi-api-key': this.elevenLabsApiKey
                },
                body: formData
            });
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', response.headers);
            
            if (!response.ok) {
                let errorMessage = `ElevenLabs API error: ${response.status} ${response.statusText}`;
                
                try {
                    const errorData = await response.text();
                    console.log('❌ Error response body:', errorData);
                    errorMessage += ` - ${errorData}`;
                } catch (e) {
                    console.log('❌ Could not read error response body');
                }
                
                throw new Error(errorMessage);
            }
            
            const result = await response.json();
            console.log('✅ ElevenLabs API response:', result);
            
            // Handle the transcription and generate response
            if (result.text) {
                const userMessage = result.text;
                console.log('👤 User said:', userMessage);
                
                // Now generate AI response using ElevenLabs text-to-speech
                await this.generateAIResponse(userMessage);
            } else if (result.transcription) {
                // Alternative response format
                const userMessage = result.transcription;
                console.log('👤 User said:', userMessage);
                await this.generateAIResponse(userMessage);
            } else {
                console.log('🔍 Full API response:', result);
                throw new Error('No transcription text received from ElevenLabs API');
            }
            
        } catch (error) {
            console.error('❌ ElevenLabs API error:', error);
            this.handleAIResponse(`API Error: ${error.message}. Please check your API key and try again.`);
        }
    }
    
    async generateAIResponse(userMessage) {
        try {
            console.log('🤖 Generating AI response using RAG system for:', userMessage);
            
            // Update label to show generating response
            const label = document.querySelector('.sphere-label');
            if (label) {
                label.textContent = 'RAG Thinking...';
                label.style.color = '#2196F3';
            }
            
            // Send question to RAG backend
            const ragResponse = await this.askRAG(userMessage);
            console.log('🤖 RAG Response received:', ragResponse);
            
            // Convert AI response to speech using ElevenLabs TTS
            await this.textToSpeech(ragResponse);
            
        } catch (error) {
            console.error('❌ Error generating AI response:', error);
            this.handleAIResponse('Sorry, I had trouble generating a response. Please try again.');
        }
    }
    
    async checkRAGHealth() {
        try {
            console.log('🏥 Checking RAG backend health...');
            const response = await fetch(`${this.ragBackendUrl}/health`);
            
            if (response.ok) {
                const health = await response.json();
                console.log('✅ RAG backend healthy:', health);
                
                if (health.openai_configured) {
                    console.log('✅ OpenAI configured for RAG');
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
            console.log('🔍 Asking RAG system:', question);
            
            // Update label to show RAG processing
            const label = document.querySelector('.sphere-label');
            if (label) {
                label.textContent = 'Searching Knowledge...';
                label.style.color = '#2563eb'; // Royal blue
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
            let isComplete = false;
            
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
                                console.log('📝 Token received:', data.token);
                                
                                            // Keep label showing "RAG Thinking..." during streaming
            const label = document.querySelector('.sphere-label');
            if (label) {
                label.textContent = 'RAG Thinking...';
                label.style.color = '#0ea5e9'; // Sky blue
            }
                            } else if (data.text) {
                                // Final response received
                                fullResponse = data.text;
                                isComplete = true;
                                console.log('✅ Final RAG response:', fullResponse);
                            }
                        } catch (e) {
                            console.log('📝 Raw SSE data:', line);
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
            console.log('🎤 Converting text to speech:', text);
            
            // Add to audio queue
            this.audioQueue.push(text);
            console.log('📋 Added to audio queue. Queue length:', this.audioQueue.length);
            
            // If not currently playing, start processing the queue
            if (!this.isPlaying) {
                this.processAudioQueue();
            }
            
        } catch (error) {
            console.error('❌ TTS API error:', error);
            this.handleAIResponse(`TTS Error: ${error.message}. Please check your API key and try again.`);
        }
    }
    
    async processAudioQueue() {
        if (this.audioQueue.length === 0 || this.isPlaying) {
            return;
        }
        
        this.isPlaying = true;
        const text = this.audioQueue.shift();
        console.log('🎤 Processing audio queue. Text:', text);
        
                    // Update label to show TTS processing
            const label = document.querySelector('.sphere-label');
            if (label) {
                label.textContent = 'Creating Speech...';
                label.style.color = '#0284c7'; // Darker blue
            }
        
        try {
            // Try streaming TTS first for better quality
            try {
                await this.streamingTTS(text);
                return;
            } catch (streamError) {
                console.log('⚠️ Streaming TTS failed, falling back to regular TTS:', streamError.message);
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
            console.log('✅ TTS audio received:', audioBlob);
            
            // Play the audio response
            await this.playAudioResponse(audioBlob, text);
            
        } catch (error) {
            console.error('❌ TTS API error:', error);
            this.isPlaying = false;
            // Continue with next item in queue
            this.processAudioQueue();
        }
    }
    
    async streamingTTS(text) {
        try {
            console.log('🎤 Using streaming TTS for better quality...');
            
            // Update label
            const label = document.querySelector('.sphere-label');
            if (label) {
                label.textContent = 'Streaming Speech...';
                label.style.color = '#0ea5e9';
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
            console.log('✅ Streaming TTS audio received:', audioBlob);
            
            // Play the audio response
            await this.playAudioResponse(audioBlob, text);
            
        } catch (error) {
            throw error;
        }
    }
    
    async playAudioResponse(audioBlob, text) {
        try {
            console.log('🔊 Playing audio response...');
            
            // Update label to show playing
            const label = document.querySelector('.sphere-label');
            if (label) {
                label.textContent = 'Answering...';
                label.style.color = '#0369a1'; // Deep blue
            }
            
            // Create audio element and play
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            // Set playback speed (1.0 = normal, 1.2 = 20% faster, 1.5 = 50% faster)
            audio.playbackRate = 1.1;
            
            audio.onended = () => {
                console.log('✅ Audio response finished playing');
                URL.revokeObjectURL(audioUrl);
                
                // Mark as not playing and continue with queue
                this.isPlaying = false;
                
                // Process next item in queue if any
                if (this.audioQueue.length > 0) {
                    console.log('📋 Processing next item in audio queue...');
                    this.processAudioQueue();
                } else {
                    // No more items, reset to ready state
                    this.resetSphereLabel();
                }
            };
            
            audio.onerror = (error) => {
                console.error('❌ Audio playback error:', error);
                this.handleAIResponse('Error playing audio response. Here is the text: ' + text);
            };
            
            // Play the audio
            await audio.play();
            
        } catch (error) {
            console.error('❌ Error playing audio:', error);
            this.handleAIResponse('Error playing audio. Here is the text: ' + text);
        }
    }
    
    handleAIResponse(responseText) {
        console.log('🤖 AI Response:', responseText);
        
        // Don't display text on sphere - just log it
        // The sphere will show status updates only
    }
    
    resetSphereLabel() {
        const label = document.querySelector('.sphere-label');
        if (label) {
            label.textContent = 'Ask me anything (Click to Speak)';
            label.style.color = '#1e40af'; // Deep blue
            label.style.fontWeight = '';
        }
    }
    
    closeChat() {
        console.log('🚪 Closing AI session...');
        
        // Stop recording if active
        if (this.isRecording) {
            this.stopRecording();
        }
        
        // Close WebSocket if connected
        if (this.websocket) {
            this.websocket.close();
        }
        
        // Reset sphere label
        this.resetSphereLabel();
        
        console.log('✅ AI session closed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 DOM loaded - initializing ElevenLabs AI...');
    
    // Create global instance
    window.elevenLabsAI = new ElevenLabsConversationalAI();
    
    console.log('✅ ElevenLabs AI ready!');
});

console.log('🚀 ElevenLabs Conversational AI script loaded');
