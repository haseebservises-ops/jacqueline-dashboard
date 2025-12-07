/**
 * EMAIL POOL CONFIGURATION
 * 
 * The system will randomly pick one of these accounts for every email.
 * If one fails (e.g. quota limit reached), it will automatically try another one.
 */

export const EMAIL_POOL = [
    // Account 1 (Generic)
    {
        serviceId: 'service_558cphs',
        templateId: 'template_6dhgaaw',
        publicKey: 'wXvJlNCb9dYZFu7ck'
    },
    // Account 2 (mon840830)
    {
        serviceId: 'service_sfi4ofe',
        templateId: 'template_honqbhj',
        publicKey: 'SLMsMn-WcjPQCTh9y'
    },
    // Account 3 (Contact Us)
    {
        serviceId: 'service_at7j2nt',
        templateId: 'template_6h25enw',
        publicKey: 'cNbQGcv0mlbc7et2g'
    },
    // Account 4 (ah0063725)
    {
        serviceId: 'service_xliz6wh',
        templateId: 'template_0d2rziq',
        publicKey: 'de1Blu50SkfII7uNQ'
    },
    // Add more accounts here...
];
