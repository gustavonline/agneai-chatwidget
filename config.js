export const defaultConfig = {
    webhook: {
        url: '',
        route: ''
    },
    branding: {
        name: 'Agne AI',
        logo: 'https://cdn.jsdelivr.net/gh/gustavonline/agneai-chatwidget@main/logo.png',
        poweredBy: {
            text: 'Powered by Agne AI',
            link: 'https://agneai.com'
        },
        welcomeText: 'Hello! 👋 Welcome to Agne AI. How can I assist you today?'
    },
    style: {
        primaryColor: '#eff6e0',
        secondaryColor: '#d2ec0b',
        backgroundColor: '#ffffff',
        fontColor: '#333333',
        position: 'right'
    },
    starterButtons: [
        {
            text: 'What is Indlejning og besparelsen?',
            message: 'Hvad er Indlejning og besparelsen?',
            icon: '💰'
        },
        {
            text: 'What is the price of Husbatteri?',
            message: 'Hvad er prisen på Husbatteri?',
            icon: '💰'
        },
        {
            text: 'How do I get an offer?',
            message: 'Hvordan får jeg et tilbud?',
            icon: '📝'
        },
        {
            text: 'How can I contact you?',
            message: 'Hvordan kan jeg kontakte jer?',
            icon: '👍'
        }
    ]
};