import { generateUUID, autoResizeTextarea } from './utils.js';
import { defaultConfig } from './config.js';

(function() {
    // Load required resources
    function loadResources() {
        // Load Inter font
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
        document.head.appendChild(fontLink);

        // Load styles
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = './styles.css';
        document.head.appendChild(styleLink);
    }

    // Initialize chat widget
    function initChatWidget() {
        // Prevent multiple initializations
        if (window.N8NChatWidgetInitialized) return;
        window.N8NChatWidgetInitialized = true;

        // Merge user config with defaults
        const config = window.ChatWidgetConfig ? 
            {
                webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
                branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
                style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
            } : defaultConfig;

        createChatWidget(config);
    }

    // Create chat widget DOM elements
    function createChatWidget(config) {
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'n8n-chat-widget';
        
        // Set CSS variables for colors
        setThemeColors(widgetContainer, config.style);

        const chatContainer = createChatContainer(config);
        const toggleButton = createToggleButton(config);
        
        widgetContainer.appendChild(chatContainer);
        widgetContainer.appendChild(toggleButton);
        document.body.appendChild(widgetContainer);

        setupEventListeners(chatContainer, config);
    }

    // Set theme colors
    function setThemeColors(container, style) {
        container.style.setProperty('--n8n-chat-primary-color', style.primaryColor);
        container.style.setProperty('--n8n-chat-secondary-color', style.secondaryColor);
        container.style.setProperty('--n8n-chat-background-color', style.backgroundColor);
        container.style.setProperty('--n8n-chat-font-color', style.fontColor);
    }

    // Create chat container
    function createChatContainer(config) {
        const chatContainer = document.createElement('div');
        chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;
        chatContainer.innerHTML = `
            ${createNewConversationHTML(config)}
            ${createChatInterfaceHTML(config)}
        `;
        return chatContainer;
    }

    // Create toggle button
    function createToggleButton(config) {
        const toggleButton = document.createElement('button');
        toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
        toggleButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
            </svg>`;
        return toggleButton;
    }

    // Setup event listeners
    function setupEventListeners(chatContainer, config) {
        const elements = {
            newChatBtn: chatContainer.querySelector('.new-chat-btn'),
            chatInterface: chatContainer.querySelector('.chat-interface'),
            messagesContainer: chatContainer.querySelector('.chat-messages'),
            textarea: chatContainer.querySelector('textarea'),
            sendButton: chatContainer.querySelector('button[type="submit"]'),
            toggleButton: chatContainer.querySelector('.chat-toggle'),
            closeButtons: chatContainer.querySelectorAll('.close-button')
        };

        elements.newChatBtn.addEventListener('click', () => startNewConversation(elements, config));
        elements.textarea.addEventListener('input', () => autoResizeTextarea(elements.textarea));
        elements.sendButton.addEventListener('click', () => handleSendMessage(elements, config));
        elements.textarea.addEventListener('keypress', (e) => handleEnterPress(e, elements, config));
        elements.toggleButton.addEventListener('click', () => toggleChat(elements.chatContainer));
        elements.closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleChat(elements.chatContainer);
            });
        });
    }

    // Start new conversation
    async function startNewConversation(elements, config) {
        const sessionId = generateUUID();
        // ... rest of the startNewConversation function
    }

    // Handle send message
    async function handleSendMessage(elements, config) {
        const message = elements.textarea.value.trim();
        if (message) {
            await sendMessage(message, elements, config);
            elements.textarea.value = '';
            elements.textarea.style.height = 'auto';
        }
    }

    // Handle enter press
    function handleEnterPress(e, elements, config) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(elements, config);
        }
    }

    // Toggle chat visibility
    function toggleChat(chatContainer) {
        const isOpen = chatContainer.classList.contains('open');
        if (isOpen) {
            chatContainer.classList.remove('open');
            setTimeout(() => {
                chatContainer.style.display = 'none';
            }, 300);
        } else {
            chatContainer.style.display = 'flex';
            setTimeout(() => {
                chatContainer.classList.add('open');
            }, 10);
        }
    }

    // Initialize the widget
    loadResources();
    initChatWidget();
})();