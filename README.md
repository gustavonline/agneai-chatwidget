# Agne AI Chat Widget Integration

## Overview
The **Agne AI Chat Widget** allows you to embed a chatbot on your website, powered by n8n. This widget is customizable and integrates seamlessly with your site for real-time user interaction.

## Installation
To integrate the Agne AI Chat Widget into your website, add the following script to the `<head>` or `<body>` section of your HTML file:

```html
<!-- n8n Chat Widget Embed Script -->
<script>
  window.ChatWidgetConfig = {
    webhook: {
      url: '',
      route: ''
    },
    branding: {
      logo: 'https://assets.zyrosite.com/AQEyo3nv9OSDvjb5/remove-background-preview-YbNv0D12bwTPQJoz.png',
      name: 'Agne AI',
      welcomeText: 'Hello! How can I help you today?',
      responseTimeText: 'We typically reply within a few minutes',
      poweredBy: {
        text: 'Powered by Agne AI',
        link: 'https://agneai.com/'
      }
    },
    style: {
      primaryColor: '#4F46E5',
      secondaryColor: '#818CF8',
      position: 'right',
      backgroundColor: '#ffffff',
      fontColor: '#333333'
    }
  };
</script>

<!-- Load the required files -->
<script type="module" src="https://your-cdn-url/utils.js"></script>
<script type="module" src="https://your-cdn-url/config.js"></script>
<script type="module" src="https://your-cdn-url/chat-widget.js"></script>
```

## Configuration
The chat widget is configurable through the `ChatWidgetConfig` object. Below are the main customization options:

### 1. Webhook Configuration
- **`url`**: The webhook URL that handles the chat requests.
- **`route`**: Can be set to a specific path if needed (leave empty for default routing).

### 2. Branding
- **`logo`**: URL for the company logo displayed in the chat widget.
- **`name`**: Name of the chatbot displayed in the widget.
- **`welcomeText`**: The greeting message shown when the user opens the chat.
- **`responseTimeText`**: Message indicating expected response time.
- **`poweredBy`**: A branding link to Agne AI.

### 3. Styling
- **`primaryColor`**: Main accent color of the widget.
- **`secondaryColor`**: Secondary color used for UI elements.
- **`position`**: Placement of the chat widget (`right` or `left`).
- **`backgroundColor`**: Background color of the chat box.
- **`fontColor`**: Text color inside the chat.

## Deployment
Once the script is embedded in your site, the chat widget should automatically load and function based on the provided configuration. 

## Support
For any issues or customization needs, visit [Agne AI](https://agneai.com/) or contact support.
