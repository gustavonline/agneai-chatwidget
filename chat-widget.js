(function() {
    // Default configuration
    const defaultConfig = {
        webhookUrl: '',
        mode: 'window', // 'window' or 'fullscreen'
        showWelcomeScreen: true,
        defaultLanguage: 'en',
        initialMessages: [
            'Hi there! 👋',
            'How can I assist you today?'
        ],
        i18n: {
            en: {
                title: 'Chat Assistant',
                subtitle: "I'm here to help you 24/7",
                footer: '',
                getStarted: 'New Conversation',
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
            // Create chat container
            const container = document.createElement('div');
            container.id = 'n8n-chat-widget';
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
            `;

            // Create chat button
            const button = document.createElement('button');
            button.innerHTML = '💬';
            button.style.cssText = `
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: #20b69e;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            `;

            // Create chat window
            const chatWindow = document.createElement('div');
            chatWindow.style.cssText = `
                display: none;
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                overflow: hidden;
            `;

            // Add chat header
            const header = document.createElement('div');
            header.style.cssText = `
                padding: 15px;
                background: #101330;
                color: white;
            `;
            header.innerHTML = `
                <h3 style="margin: 0;">${this.config.i18n.en.title}</h3>
                <p style="margin: 5px 0 0;">${this.config.i18n.en.subtitle}</p>
            `;

            // Add chat messages container
            const messagesContainer = document.createElement('div');
            messagesContainer.style.cssText = `
                height: calc(100% - 120px);
                overflow-y: auto;
                padding: 15px;
            `;

            // Add chat input
            const input = document.createElement('div');
            input.style.cssText = `
                padding: 15px;
                border-top: 1px solid #eee;
            `;
            input.innerHTML = `
                <input type="text" placeholder="${this.config.i18n.en.inputPlaceholder}" style="
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                ">
            `;

            // Assemble chat window
            chatWindow.appendChild(header);
            chatWindow.appendChild(messagesContainer);
            chatWindow.appendChild(input);

            // Add click handler for toggle
            button.addEventListener('click', () => {
                chatWindow.style.display = chatWindow.style.display === 'none' ? 'block' : 'none';
            });

            // Add message handling
            const inputField = input.querySelector('input');
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && inputField.value.trim()) {
                    this.sendMessage(inputField.value.trim(), messagesContainer);
                    inputField.value = '';
                }
            });

            // Append elements to container
            container.appendChild(chatWindow);
            container.appendChild(button);
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

    // Make ChatWidget available globally
    window.ChatWidget = ChatWidget;
})();
