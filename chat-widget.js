import { generateUUID, autoResizeTextarea, createNewConversationHTML, createChatInterfaceHTML } from './utils.js';
import { defaultConfig } from './config.js';

(function() {
    let currentSessionId = '';
    let isInitialized = false;
    // We'll keep this flag but use it differently
    let isConversationStarted = false;

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
        
        // Load marked.js for markdown parsing
        const markedScript = document.createElement('script');
        markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        document.head.appendChild(markedScript);
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
        
        // Create the chat interface HTML with starter buttons
        let chatHTML = `
            <div class="brand-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${config.branding.logo}" alt="${config.branding.name}">
                    <span style="font-weight: 600;">${config.branding.name}</span>
                </div>
                <button class="close-button">×</button>
            </div>
            <div class="chat-interface active">
                <div class="chat-messages"></div>`;

        // Add starter buttons if configured
        if (config.starterButtons && config.starterButtons.length > 0) {
            chatHTML += '<div class="starter-buttons">';
            config.starterButtons.forEach(button => {
                chatHTML += `
                    <button class="starter-button" data-message="${button.message}">
                        ${button.icon ? `<span class="button-icon">${button.icon}</span>` : ''}
                        ${button.text}
                    </button>`;
            });
            chatHTML += '</div>';
        }

        chatHTML += `
                <div class="chat-input">
                    <textarea placeholder="Type your message here..." rows="1"></textarea>
                    <button type="submit">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
                <div class="chat-footer">
                    <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
                </div>
            </div>
        `;

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

    // New function to create starter buttons
    function createStarterButtons(config) {
        if (!config.starterButtons || !config.starterButtons.length) {
            return '';
        }

        let buttonsHtml = '<div class="starter-buttons">';
        config.starterButtons.forEach(button => {
            buttonsHtml += `
                <button class="starter-button" data-message="${button.message}">
                    ${button.icon ? `<span class="button-icon">${button.icon}</span>` : ''}
                    ${button.text}
                </button>
            `;
        });
        buttonsHtml += '</div>';
        return buttonsHtml;
    }

    // Function to safely parse markdown
    function parseMarkdown(text) {
        if (typeof marked !== 'undefined') {
            try {
                // Configure marked options for safety
                marked.setOptions({
                    breaks: true,
                    sanitize: false,
                    smartLists: true,
                    smartypants: true,
                    xhtml: false
                });
                return marked.parse(text);
            } catch (e) {
                console.error('Error parsing markdown:', e);
                return text;
            }
        } else {
            // Fallback if marked is not loaded
            return text;
        }
    }

    async function startNewConversation(elements, config) {
        if (isConversationStarted) return;
        
        currentSessionId = generateUUID();
        isConversationStarted = true;
        
        const { messagesContainer } = elements;
        
        // Hide starter buttons after conversation starts
        const starterButtons = document.querySelector('.starter-buttons');
        if (starterButtons) {
            starterButtons.style.display = 'none';
        }

        const welcomeMessageDiv = document.createElement('div');
        welcomeMessageDiv.className = 'chat-message bot';
        welcomeMessageDiv.innerHTML = `Hello! 👋 Welcome to ${config.branding.name}. How can I assist you today?`;
        messagesContainer.appendChild(welcomeMessageDiv);

        try {
            // Only make the API call if webhook URL is provided
            if (config.webhook.url) {
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
                        route: config.webhook.route || '',
                        metadata: { userId: "" }
                    })
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                if (data.output || data.message) {
                    const botMessageDiv = document.createElement('div');
                    botMessageDiv.className = 'chat-message bot';
                    botMessageDiv.innerHTML = parseMarkdown(data.output || data.message);
                    messagesContainer.appendChild(botMessageDiv);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function sendMessage(message, elements, config) {
        if (!message.trim() || !isConversationStarted) return;

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
            // Only make the API call if webhook URL is provided
            if (config.webhook.url) {
                // Remove any trailing slashes from the webhook URL
                const baseUrl = config.webhook.url.replace(/\/+$/, '');
                
                const response = await fetch(`${baseUrl}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Origin': window.location.origin
                    },
                    body: JSON.stringify({
                        action: "sendMessage",
                        sessionId: currentSessionId,
                        route: config.webhook.route || '',
                        chatInput: message,
                        metadata: { userId: "" }
                    })
                });

                loadingDiv.remove();

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot';
                botMessageDiv.innerHTML = parseMarkdown(data.output || data.message || 'I received your message');
                messagesContainer.appendChild(botMessageDiv);
            } else {
                // If no webhook URL, show a fallback message
                loadingDiv.remove();
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'chat-message bot';
                fallbackDiv.textContent = 'No webhook URL configured. Please set up the webhook to enable chat functionality.';
                messagesContainer.appendChild(fallbackDiv);
            }
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
                style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style },
                starterButtons: window.ChatWidgetConfig.starterButtons || []
            } : defaultConfig;

        loadResources();
        const { chatContainer, toggleButton } = createChatWidget(config);

        const elements = {
            chatInterface: chatContainer.querySelector('.chat-interface'),
            messagesContainer: chatContainer.querySelector('.chat-messages'),
            textarea: chatContainer.querySelector('textarea'),
            sendButton: chatContainer.querySelector('button[type="submit"]'),
            initialHeader: chatContainer.querySelector('.brand-header'),
        };

        // Add event listeners for starter buttons
        const starterButtons = chatContainer.querySelectorAll('.starter-button');
        starterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const message = button.getAttribute('data-message');
                if (message) {
                    sendMessage(message, elements, config);
                    // Hide all starter buttons after one is clicked
                    document.querySelector('.starter-buttons').style.display = 'none';
                }
            });
        });
        
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
                
                // Start conversation when chat is opened if not already started
                if (!isConversationStarted) {
                    startNewConversation(elements, config);
                }
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
