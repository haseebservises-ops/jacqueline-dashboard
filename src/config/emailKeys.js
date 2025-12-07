/**
 * EMAIL POOL CONFIGURATION
 * 
 * Instructions for User:
 * 1. Create accounts on EmailJS (Free Tier allows 200/month).
 * 2. For each account, get the:
 *    - Service ID (e.g., service_xyz)
 *    - Template ID (e.g., template_xyz)
 *    - Public Key (e.g., user_xyz or unique_string)
 * 3. Add them to this list. The system will randomly pick one for each email sent.
 */

export const EMAIL_POOL = [
    // Account 1
    {
        serviceId: 'service_EXAMPLE1',
        templateId: 'template_EXAMPLE1',
        publicKey: 'key_EXAMPLE1'
    },
    // Account 2
    {
        serviceId: 'service_EXAMPLE2',
        templateId: 'template_EXAMPLE2',
        publicKey: 'key_EXAMPLE2'
    },
    // ... Add as many as you want
];
