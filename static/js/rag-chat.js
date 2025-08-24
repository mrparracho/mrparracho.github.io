// RAG Chat Modal Integration
document.addEventListener('DOMContentLoaded', function() {
    const startChatButton = document.getElementById('start-ai-chat');
    const modal = document.getElementById('rag-chat-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const modalChatInput = document.getElementById('modal-chat-input');
    const modalSendButton = document.getElementById('modal-send-message');
    const modalChatMessages = document.getElementById('modal-chat-messages');
    
    let isStreaming = false;
    
    // Open modal when Start Conversation is clicked
    if (startChatButton) {
        console.log('🎯 Start chat button found:', startChatButton);
        startChatButton.addEventListener('click', () => {
            console.log('🚀 Opening modal...');
            modal.classList.add('active');
            modalChatInput.focus();
            console.log('✅ Modal opened, input focused');
        });
    } else {
        console.error('❌ Start chat button not found!');
    }
    
    // Close modal when overlay or close button is clicked
    modalOverlay.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Send message when Enter is pressed
    modalChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send message when send button is clicked
    modalSendButton.addEventListener('click', sendMessage);
    
    function closeModal() {
        modal.classList.remove('active');
        modalChatInput.value = '';
    }
    
    async function sendMessage() {
        console.log('📤 Send message called');
        const message = modalChatInput.value.trim();
        console.log('📝 Message:', message);
        
        if (!message || isStreaming) {
            console.log('❌ Message empty or already streaming');
            return;
        }
        
        // Add user message
        addMessage(message, 'user');
        modalChatInput.value = '';
        
        // Disable input during streaming
        isStreaming = true;
        modalChatInput.disabled = true;
        modalSendButton.disabled = true;
        
        // Add typing indicator
        addTypingIndicator();
        console.log('🔄 Starting API request...');
        
        try {
            console.log('🌐 Making fetch request to:', 'http://localhost:8001/ask');
            // Connect to your local RAG API
            const response = await fetch('http://localhost:8001/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message })
            });
            console.log('📡 Response received:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.token) {
                                if (fullResponse === '') {
                                    removeTypingIndicator();
                                    addMessage('', 'assistant');
                                }
                                fullResponse += data.token;
                                const lastMessage = modalChatMessages.querySelector('.message.assistant:last-child .message-content');
                                if (lastMessage) {
                                    lastMessage.textContent = fullResponse;
                                }
                            } else if (data.text) {
                                // Final response
                                const lastMessage = modalChatMessages.querySelector('.message.assistant:last-child .message-content');
                                if (lastMessage) {
                                    lastMessage.textContent = data.text;
                                }
                            }
                        } catch (e) {
                            // Ignore parsing errors for incomplete chunks
                        }
                    }
                }
            }

            // Context sources removed for cleaner interface

        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessage(`Error: ${error.message}`, 'assistant');
        } finally {
            // Re-enable input
            isStreaming = false;
            modalChatInput.disabled = false;
            modalSendButton.disabled = false;
            modalChatInput.focus();
        }
    }
    
    function addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (type === 'context') {
            contentDiv.classList.add('context');
            contentDiv.innerHTML = content;
        } else {
            contentDiv.textContent = content;
        }
        
        messageDiv.appendChild(contentDiv);
        modalChatMessages.appendChild(messageDiv);
        modalChatMessages.scrollTop = modalChatMessages.scrollHeight;
    }
    
    function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';
        typingDiv.id = 'typingIndicator';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = 'Miguel is thinking...';
        
        typingDiv.appendChild(contentDiv);
        modalChatMessages.appendChild(typingDiv);
        modalChatMessages.scrollTop = modalChatMessages.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
});
