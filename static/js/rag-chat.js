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
        startChatButton.addEventListener('click', () => {
            modal.classList.add('active');
            modalChatInput.focus();
        });
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
        const message = modalChatInput.value.trim();
        
        if (!message || isStreaming) {
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
        
        try {
            // Connect to RAG API from config
            const ragBackendUrl = window.getConfig('ragBackendUrl', 'http://localhost:8000');
            const response = await fetch(`${ragBackendUrl}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message })
            });

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
