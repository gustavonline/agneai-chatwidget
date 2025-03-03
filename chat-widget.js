(function() {
    // Inject styles dynamically
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Inter', sans-serif;
        }
        
        .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            width: 380px;
            height: 600px;
            max-height: 80vh;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            display: none;
            flex-direction: column;
            transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        }
        
        .chat-container.open {
            display: flex;
            opacity: 1;
            transform: translateY(0);
        }
        
        .chat-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--chat--color-primary), var(--chat--color-secondary));
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.3s;
        }

        .chat-toggle:hover {
            transform: scale(1.1);
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
        }

        .chat-input {
            display: flex;
            padding: 16px;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            position: sticky;
            bottom: 0;
            background: var(--chat--color-background);
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Load Configurations
    const config = window.ChatWidgetConfig || {};

    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';

    // Create Widget
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';

    const chatMessages = document.createElement('div');
    chatMessages.className = 'chat-messages';

    const chatInput = document.createElement('div');
    chatInput.className = 'chat-input';
    chatInput.innerHTML = `
        <textarea placeholder="Type your message..." rows="1"></textarea>
        <button type="submit">Send</button>
    `;

    chatContainer.appendChild(chatMessages);
    chatContainer.appendChild(chatInput);
    widgetContainer.appendChild(chatContainer);

    const toggleButton = document.createElement('button');
    toggleButton.className = 'chat-toggle';
    toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
    </svg>`;

    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    // Event Listeners
    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
    });

    const sendButton = chatInput.querySelector('button[type="submit"]');
    sendButton.addEventListener('click', () => {
        sendMessage(chatInput.querySelector('textarea').value);
    });

    async function sendMessage(message) {
        if (!message.trim()) return;
        chatMessages.innerHTML += `<div class='user-message'>${message}</div>`;
        chatInput.querySelector('textarea').value = '';

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message })
            });
            const data = await response.json();
            chatMessages.innerHTML += `<div class='bot-message'>${data.response || 'Error processing request'}</div>`;
        } catch (error) {
            chatMessages.innerHTML += `<div class='bot-message error'>Error sending message</div>`;
        }
    }
})();
