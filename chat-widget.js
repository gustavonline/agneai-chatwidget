(function() {
    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    // Inject styles (using system fonts and matching the screenshot)
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: #4CAF50; /* Green for Send button and bot messages */
            --chat--color-secondary: #e8f5e9; /* Light green for user messages */
            --chat--color-background: #ffffff; /* White background */
            --chat--color-font: #333333; /* Dark gray text */
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .n8n-chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            width: 360px; /* Slightly adjusted to match screenshot */
            height: 500px; /* Adjusted height to match screenshot */
            max-height: 80vh;
            background: var(--chat--color-background);
            border-radius: 8px; /* Smaller radius for a cleaner look */
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Subtle shadow */
            border: 1px solid rgba(0, 0, 0, 0.1);
            overflow: hidden;
            font-family: inherit;
            display: none;
            flex-direction: column;
        }

        .n8n-chat-widget .chat-container.open {
            display: flex;
        }

        .n8n-chat-widget .brand-header {
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            background: var(--chat--color-background);
            z-index: 2;
            position: sticky;
            top: 0;
            width: 100%;
        }

        .n8n-chat-widget .chat-interface {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .n8n-chat-widget .chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
        }

        .n8n-chat-widget .chat-message {
            margin-bottom: 12px;
            padding: 10px 12px;
            border-radius: 6px; /* Smaller radius for messages */
            max-width: 70%;
            font-size: 14px;
            line-height: 1.5;
        }

        .n8n-chat-widget .chat-message.bot {
            background: var(--chat--color-primary);
            color: #ffffff;
            margin-left: 0;
            align-self: flex-start;
        }

        .n8n-chat-widget .chat-message.user {
            background: var(--chat--color-secondary);
            color: var(--chat--color-font);
            margin-right: 0;
            align-self: flex-end;
        }

        .n8n-chat-widget .chat-input {
            padding: 12px 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            display: flex;
            gap: 8px;
            position: sticky;
            bottom: 0;
            z-index: 3;
        }

        .n8n-chat-widget .chat-input textarea {
            flex: 1;
            padding: 10px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 6px;
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            resize: vertical;
            font-family: inherit;
            font-size: 14px;
            min-height: 40px;
        }

        .n8n-chat-widget .chat-input textarea::placeholder {
            color: var(--chat--color-font);
            opacity: 0.6;
        }

        .n8n-chat-widget .chat-input button {
            background: var(--chat--color-primary);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            cursor: pointer;
            transition: transform 0.2s;
            font-family: inherit;
            font-weight: 500;
            font-size: 14px;
            height: 40px; /* Match textarea height */
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
            background: var(--chat--color-primary);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            z-index: 999;
            transition: transform 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
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
            border-top: 1px solid rgba(0, 0, 0, 0.1);
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

        .n8n-chat-widget .loading {
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }

        .n8n-chat-widget .typing-indicator {
            display: flex;
            gap: 4px;
        }

        .n8n-chat-widget .typing-indicator span {
            width: 8px;
            height: 8px;
            background: #ffffff;
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
    `;

    // Inject styles (no font dependency)
    if (!document.querySelector('style[data-n8n-chat]')) {
        const styleSheet = document.createElement('style');
        styleSheet.setAttribute('data-n8n-chat', 'true');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Default configuration
    const defaultConfig = {
        webhook: {
            url: '',
            route: ''
        },
        branding: {
            logo: '',
            name: 'Agne AI',
            welcomeText: '',
            responseTimeText: '',
            poweredBy: {
                text: 'Powered by Agne AI',
                link: 'https://agneai.com/'
            }
        },
        style: {
            primaryColor: '#4CAF50',
            secondaryColor: '#e8f5e9',
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

    // Validate webhook URL
    if (!config.webhook.url) {
        console.error('Webhook URL is required. Please configure window.ChatWidgetConfig.webhook.url.');
        return;
    }

    let currentSessionId = localStorage.getItem('chatSessionId') || crypto.randomUUID();
    localStorage.setItem('chatSessionId', currentSessionId);

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
    chatContainer.setAttribute('role', 'dialog');
    chatContainer.setAttribute('aria-label', 'Chat with Agne AI');

    const chatInterfaceHTML = `
        <div class="brand-header">
            <img src="${config.branding.logo || ''}" alt="${config.branding.name}">
            <span>${config.branding.name}</span>
            <button class="close-button" aria-label="Close chat">×</button>
        </div>
        <div class="chat-interface">
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Type your message here..." aria-label="Chat input"></textarea>
                <button type="submit" aria-label="Send message">Send</button>
            </div>
            <div class="chat-footer">
                <a href="${config.branding.poweredBy.link || '#'}">${config.branding.poweredBy.text}</a>
            </div>
        </div>
    `;
    
    chatContainer.innerHTML = chatInterfaceHTML;
    
    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.setAttribute('aria-label', 'Open chat');
    toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>`;
    
    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');
    const closeButton = chatContainer.querySelector('.close-button');

    async function startNewConversation() {
        messagesContainer.innerHTML = '';
        
        const welcomeMessageDiv = document.createElement('div');
        welcomeMessageDiv.className = 'chat-message bot';
        welcomeMessageDiv.innerHTML = `Hello! 👋 Welcome to ${config.branding.name}. How can I assist you today?`;
        messagesContainer.appendChild(welcomeMessageDiv);
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
                timeout: 10000, // 10-second timeout
                body: JSON.stringify({
                    action: "loadPreviousSession",
                    sessionId: currentSessionId,
                    route: config.webhook.route,
                    metadata: { userId: "" }
                })
            });

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
            console.error('Webhook Error:', error.message);
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.className = 'chat-message bot';
            errorMessageDiv.textContent = 'Sorry, there was an error connecting to our AI. Please try again later or contact support.';
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
                timeout: 10000, // 10-second timeout
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
            console.error('Send Message Error:', error.message);
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.textContent = 'Sorry, there was an error processing your message. Please try again.';
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Initialize chat on toggle button click
    toggleButton.addEventListener('click', () => {
        const isOpen = chatContainer.classList.contains('open');
        chatContainer.classList.toggle('open');
        if (!isOpen) {
            startNewConversation();
        }
    });

    // Send message on button click or Enter key
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

    // Close chat
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        chatContainer.classList.remove('open');
    });

    // Keyboard navigation for accessibility
    toggleButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleButton.click();
        }
    });

    closeButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeButton.click();
        }
    });
})();
