// Chat Widget Script
(function() {
    // Create and inject styles
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #d2ec0b);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #eff6e0);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .n8n-chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            width: 380px;
            max-width: 90vw;
            height: 600px;
            max-height: 80vh;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
            display: none;
            flex-direction: column;
        }

        .n8n-chat-widget .chat-container.open {
            display: flex;
        }

        .n8n-chat-widget .brand-header {
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            background: var(--chat--color-background);
            z-index: 2;
            position: sticky;
            top: 0;
            width: 100%;
        }

        .n8n-chat-widget .brand-header img {
            max-width: 40px;
            max-height: 40px;
            object-fit: contain;
        }

        .n8n-chat-widget .new-conversation {
            position: relative;
            padding: 20px;
            text-align: center;
            width: 100%;
            max-width: 300px;
            margin: auto;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .n8n-chat-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }

        .n8n-chat-widget .chat-message {
            margin-bottom: 12px;
            max-width: 70%;
        }

        .n8n-chat-widget .chat-message.user {
            background: var(--chat--color-primary);
            color: #ffffff;
            border-radius: 8px 8px 0 8px;
            padding: 10px;
            margin-left: auto;
        }

        .n8n-chat-widget .chat-message.bot {
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            border-radius: 8px 8px 8px 0;
            padding: 10px;
            margin-right: auto;
        }

        .n8n-chat-widget .chat-message.loading {
            opacity: 0.7;
        }

        .n8n-chat-widget .typing-indicator {
            display: flex;
            gap: 4px;
        }

        .n8n-chat-widget .typing-indicator span {
            width: 8px;
            height: 8px;
            background: var(--chat--color-primary);
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out;
        }

        .n8n-chat-widget .typing-indicator span:nth-child(2) {
            animation-delay: -0.2s;
        }

        .n8n-chat-widget .typing-indicator span:nth-child(3) {
            animation-delay: -0.4s;
        }

        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        .n8n-chat-widget .chat-input {
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
            position: sticky;
            bottom: 0;
            z-index: 3;
        }

        .n8n-chat-widget .chat-input textarea {
            flex: 1;
            padding: 12px;
            border: 1px solid rgba(133, 79, 255, 0.2);
            border-radius: 8px;
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            resize: none;
            font-family: inherit;
            font-size: 14px;
        }

        .n8n-chat-widget .chat-input textarea::placeholder {
            color: var(--chat--color-font);
            opacity: 0.6;
        }

        .n8n-chat-widget .chat-input button {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0 20px;
            cursor: pointer;
            transition: transform 0.2s;
            font-family: inherit;
            font-weight: 500;
        }

        .n8n-chat-widget .chat-input button:hover {
            transform: scale(1.05);
        }

        .n8n-chat-widget .chat-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
            z-index: 999;
            transition: transform 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .n8n-chat-widget .chat-toggle.position-left {
            right: auto;
            left: 20px;
        }

        .n8n-chat-widget .chat-toggle:hover {
            transform: scale(1.05);
        }

        .n8n-chat-widget .chat-toggle svg {
            width: 24px;
            height: 24px;
            fill: currentColor;
        }

        .n8n-chat-widget .chat-footer {
            padding: 8px;
            text-align: center;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
        }

        .n8n-chat-widget .chat-footer a {
            color: var(--chat--color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: inherit;
        }

        .n8n-chat-widget .chat-footer a:hover {
            opacity: 1;
        }

        @media (max-width: 768px) {
            .n8n-chat-widget .chat-container {
                width: 85vw;
                height: 70vh;
                bottom: 10px;
                right: 10px;
            }

            .n8n-chat-widget .chat-toggle {
                width: 50px;
                height: 50px;
                bottom: 10px;
                right: 10px;
            }

            .n8n-chat-widget .brand-header img {
                max-width: 30px;
                max-height: 30px;
            }

            .n8n-chat-widget .chat-input textarea {
                font-size: 12px;
            }
        }

        @media (max-width: 480px) {
            .n8n-chat-widget .chat-container {
                width: 90vw;
                height: 65vh;
            }
        }
    `;

    // Load Geist font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Default configuration
    const defaultConfig = {
        webhook: {
            url: '',
            route: ''
        },
        branding: {
            logo: '',
            name: '',
            welcomeText: '',
            responseTimeText: '',
            poweredBy: {
                text: 'Powered by n8n',
                link: 'https://n8n.partnerlinks.io/m8a94i19zhqq?utm_source=nocodecreative.io'
            }
        },
        style: {
            primaryColor: '',
            secondaryColor: '',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        }
    };

    // Merge user config with defaults
    const config = window.ChatWidgetConfig ? 
        {
            webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
        } : defaultConfig;

    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    
    // Set CSS variables for colors
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;
    chatContainer.style.display = 'none';
    
    const newConversationHTML = `
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <span>${config.branding.name}</span>
            <button class="close-button">×</button>
        </div>
        <div class="new-conversation">
            <h2 class="welcome-text">${config.branding.welcomeText}</h2>
            <button class="new-chat-btn">
                <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
                </svg>
                Send us a message
            </button>
            <p class="response-text">${config.branding.responseTimeText}</p>
        </div>
    `;

    const chatInterfaceHTML = `
        <div class="chat-interface">
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Type your message here..." rows="1"></textarea>
                <button type="submit">Send</button>
            </div>
            <div class="chat-footer">
                <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
            </div>
        </div>
    `;
    
    chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;
    
    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>`;
    
    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');

    function generateUUID() {
        return crypto.randomUUID();
    }

    async function startNewConversation() {
        currentSessionId = generateUUID();
        
        messagesContainer.innerHTML = '';
        const welcomeScreen = chatContainer.querySelector('.new-conversation');
        const initialHeader = chatContainer.querySelector('.brand-header');
        
        welcomeScreen.style.display = 'none';
        initialHeader.style.display = 'flex';
        chatInterface.classList.add('active');

        const welcomeMessageDiv = document.createElement('div');
        welcomeMessageDiv.className = 'chat-message bot';
        welcomeMessageDiv.innerHTML = `Hello! 👋 Welcome to ${config.branding.name}. How can I assist you today?`;
        messagesContainer.appendChild(welcomeMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message bot loading';
        loadingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': window.location.origin
                },
                mode: 'cors',
                body: JSON.stringify({
                    action: "loadPreviousSession",
                    sessionId: currentSessionId,
                    route: config.webhook.route,
                    metadata: { userId: "" }
                })
            });

            loadingDiv.remove();

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            if (responseData.output || responseData.message) {
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot';
                botMessageDiv.innerHTML = responseData.output || responseData.message;
                messagesContainer.appendChild(botMessageDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        } catch (error) {
            console.error('Error:', error);
            loadingDiv.remove();
            
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.className = 'chat-message bot';
            errorMessageDiv.textContent = 'I\'m ready to help! What would you like to know about our services?';
            messagesContainer.appendChild(errorMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    async function sendMessage(message) {
        if (!message.trim()) return;

        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message bot loading';
        loadingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': window.location.origin
                },
                mode: 'cors',
                body: JSON.stringify({
                    action: "sendMessage",
                    sessionId: currentSessionId,
                    route: config.webhook.route,
                    chatInput: message,
                    metadata: { userId: "" }
                })
            });
            
            loadingDiv.remove();

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.innerHTML = data.output || data.message || 'I received your message';
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            loadingDiv.remove();

            console.error('Error:', error);
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.textContent = 'Sorry, there was an error processing your message. Please try again.';
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    newChatBtn.addEventListener('click', startNewConversation);
    
    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) {
            sendMessage(message);
            textarea.value = '';
        }
    });
    
    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message) {
                sendMessage(message);
                textarea.value = '';
            }
        }
    });
    
    toggleButton.addEventListener('click', () => {
        const isOpen = chatContainer.classList.contains('open');
        chatContainer.classList.toggle('open');
        chatContainer.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) {
            chatContainer.focus();
        }
    });

    // Update close button handlers
    const closeButtons = chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            chatContainer.classList.remove('open');
            chatContainer.style.display = 'none';
        });
    });

    console.log('Chat widget initialized with config:', config);
})();
