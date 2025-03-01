(function() {
    // Load Geist font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Create and inject styles
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Default configuration
    const defaultConfig = {
        webhookUrl: '',
        mode: 'window',
        style: {
            position: 'right',
            primaryColor: '#854fff',
            secondaryColor: '#6b3fd4'
        },
        initialMessages: [
            'Hi there! 👋',
            'How can I assist you today?'
        ],
        i18n: {
            en: {
                title: 'Chat Assistant',
                subtitle: "I'm here to help you 24/7",
                inputPlaceholder: 'Type your message...',
            }
        }
    };

    class ChatWidget {
        constructor(config) {
            this.config = { ...defaultConfig, ...config };
            this.init();
        }

        init() {
            const container = document.createElement('div');
            container.className = 'n8n-chat-widget';
            
            const chatWindow = document.createElement('div');
            chatWindow.className = `chat-container${this.config.style.position === 'left' ? ' position-left' : ''}`;
            
            // Add chat header
            const header = document.createElement('div');
            header.className = 'brand-header';
            header.innerHTML = `
                <span>${this.config.i18n.en.title}</span>
                <button class="close-button">×</button>
            `;

            // Add chat messages container
            const messagesContainer = document.createElement('div');
            messagesContainer.className = 'chat-messages';

            // Add chat input
            const input = document.createElement('div');
            input.className = 'chat-input';
            input.innerHTML = `
                <textarea placeholder="${this.config.i18n.en.inputPlaceholder}" rows="1"></textarea>
                <button type="submit">Send</button>
            `;

            // Assemble chat window
            chatWindow.appendChild(header);
            chatWindow.appendChild(messagesContainer);
            chatWindow.appendChild(input);

            // Create toggle button
            const toggleButton = document.createElement('button');
            toggleButton.className = `chat-toggle${this.config.style.position === 'left' ? ' position-left' : ''}`;
            toggleButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
            `;

            // Event handlers
            toggleButton.addEventListener('click', () => {
                chatWindow.classList.toggle('open');
            });

            const closeButton = header.querySelector('.close-button');
            closeButton.addEventListener('click', () => {
                chatWindow.classList.remove('open');
            });

            const textarea = input.querySelector('textarea');
            const sendButton = input.querySelector('button');

            const sendMessage = () => {
                const message = textarea.value.trim();
                if (message) {
                    this.sendMessage(message, messagesContainer);
                    textarea.value = '';
                }
            };

            textarea.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            sendButton.addEventListener('click', sendMessage);

            // Append elements
            container.appendChild(chatWindow);
            container.appendChild(toggleButton);
            document.body.appendChild(container);

            // Show initial messages
            if (this.config.initialMessages) {
                this.config.initialMessages.forEach(msg => {
                    this.addBotMessage(msg, messagesContainer);
                });
            }
        }

        async sendMessage(message, container) {
            // Add user message to chat
            this.addUserMessage(message, container);

            try {
                // Send message to n8n webhook
                const response = await fetch(this.config.webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'sendMessage',
                        chatInput: message,
                        sessionId: Date.now().toString()
                    })
                });

                const data = await response.json();
                
                // Add bot response to chat
                if (data.message) {
                    this.addBotMessage(data.message, container);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                this.addBotMessage('Sorry, I encountered an error. Please try again.', container);
            }
        }

        addUserMessage(message, container) {
            const msgElement = document.createElement('div');
            msgElement.style.cssText = `
                margin: 10px 0;
                text-align: right;
            `;
            msgElement.innerHTML = `
                <span style="
                    background: #20b69e;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 15px;
                    display: inline-block;
                    max-width: 80%;
                    word-wrap: break-word;
                ">${message}</span>
            `;
            container.appendChild(msgElement);
            container.scrollTop = container.scrollHeight;
        }

        addBotMessage(message, container) {
            const msgElement = document.createElement('div');
            msgElement.style.cssText = `
                margin: 10px 0;
            `;
            msgElement.innerHTML = `
                <span style="
                    background: #f0f0f0;
                    color: #333;
                    padding: 8px 12px;
                    border-radius: 15px;
                    display: inline-block;
                    max-width: 80%;
                    word-wrap: break-word;
                ">${message}</span>
            `;
            container.appendChild(msgElement);
            container.scrollTop = container.scrollHeight;
        }
    }

    if (typeof window !== 'undefined') {
        window.ChatWidget = ChatWidget;
    }
})();
