import { generateUUID, autoResizeTextarea, createNewConversationHTML, createChatInterfaceHTML } from './utils.js';
import { defaultConfig } from './config.js';

(function() {
    let currentSessionId = '';
    let isInitialized = false;

    function loadResources() {
        // Load Inter font
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
        document.head.appendChild(fontLink);

        // Load styles
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = 'https://cdn.jsdelivr.net/gh/gustavonline/agneai-chatwidget@main/styles.css';
        document.head.appendChild(styleLink);
    }

    function createChatWidget(config) {
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'n8n-chat-widget';
        
        // Set CSS variables for colors
        widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
        widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
        widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
        widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

        const chatContainer = document.createElement('div');
        chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;
        chatContainer.innerHTML = createNewConversationHTML(config) + createChatInterfaceHTML(config);

        const toggleButton = document.createElement('button');
        toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
        toggleButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
            </svg>`;

        widgetContainer.appendChild(chatContainer);
        widgetContainer.appendChild(toggleButton);
        document.body.appendChild(widgetContainer);

        return { chatContainer, toggleButton };
    }

    async function startNewConversation(elements, config) {
        currentSessionId = generateUUID();
        
        const { messagesContainer, welcomeScreen, initialHeader, chatInterface } = elements;
        messagesContainer.innerHTML = '';
        welcomeScreen.style.display = 'none';
        initialHeader.style.display = 'flex';
        chatInterface.classList.add('active');

        const welcomeMessageDiv = document.createElement('div');
        welcomeMessageDiv.className = 'chat-message bot';
        welcomeMessageDiv.innerHTML = `Hello! 👋 Welcome to ${config.branding.name}. How can I assist you today?`;
        messagesContainer.appendChild(welcomeMessageDiv);

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({
                    action: "loadPreviousSession",
                    sessionId: currentSessionId,
                    route: config.webhook.route,
                    metadata: { userId: "" }
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            if (data.output || data.message) {
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot';
                botMessageDiv.innerHTML = data.output || data.message;
                messagesContainer.appendChild(botMessageDiv);
            }
        } catch (error) {
            console.error('Error:', error);
        }
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function sendMessage(message, elements, config) {
        if (!message.trim()) return;

        const { messagesContainer } = elements;
        
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message bot loading';
        loadingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>`;
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
                body: JSON.stringify({
                    action: "sendMessage",
                    sessionId: currentSessionId,
                    route: config.webhook.route,
                    chatInput: message,
                    metadata: { userId: "" }
                })
            });

            loadingDiv.remove();

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.innerHTML = data.output || data.message || 'I received your message';
            messagesContainer.appendChild(botMessageDiv);
        } catch (error) {
            console.error('Error:', error);
            loadingDiv.remove();
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chat-message bot';
            errorDiv.textContent = 'Sorry, there was an error processing your message. Please try again.';
            messagesContainer.appendChild(errorDiv);
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function initChatWidget() {
        if (isInitialized) return;
        isInitialized = true;

        const config = window.ChatWidgetConfig ? 
            {
                webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
                branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
                style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
            } : defaultConfig;

        loadResources();
        const { chatContainer, toggleButton } = createChatWidget(config);

        const elements = {
            newChatBtn: chatContainer.querySelector('.new-chat-btn'),
            chatInterface: chatContainer.querySelector('.chat-interface'),
            messagesContainer: chatContainer.querySelector('.chat-messages'),
            textarea: chatContainer.querySelector('textarea'),
            sendButton: chatContainer.querySelector('button[type="submit"]'),
            welcomeScreen: chatContainer.querySelector('.new-conversation'),
            initialHeader: chatContainer.querySelector('.brand-header'),
        };

        elements.newChatBtn.addEventListener('click', () => startNewConversation(elements, config));
        elements.textarea.addEventListener('input', () => autoResizeTextarea(elements.textarea));
        
        elements.sendButton.addEventListener('click', () => {
            const message = elements.textarea.value.trim();
            if (message) {
                sendMessage(message, elements, config);
                elements.textarea.value = '';
                elements.textarea.style.height = 'auto';
            }
        });

        elements.textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = elements.textarea.value.trim();
                if (message) {
                    sendMessage(message, elements, config);
                    elements.textarea.value = '';
                    elements.textarea.style.height = 'auto';
                }
            }
        });

        toggleButton.addEventListener('click', () => {
            const isOpen = chatContainer.classList.contains('open');
            if (isOpen) {
                chatContainer.classList.remove('open');
                setTimeout(() => chatContainer.style.display = 'none', 300);
            } else {
                chatContainer.style.display = 'flex';
                setTimeout(() => chatContainer.classList.add('open'), 10);
            }
        });

        const closeButtons = chatContainer.querySelectorAll('.close-button');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                chatContainer.classList.remove('open');
                setTimeout(() => chatContainer.style.display = 'none', 300);
            });
        });
    }

    // Initialize when the script loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatWidget);
    } else {
        initChatWidget();
    }
})();
