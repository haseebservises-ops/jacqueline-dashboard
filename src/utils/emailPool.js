import emailjs from '@emailjs/browser';
import { EMAIL_POOL } from '../config/emailKeys';

/**
 * Sends an email using a random key from the pool to distribute load.
 * @param {object} templateParams - The variables to pass to the template (to_email, name, message, etc.)
 * @returns {Promise}
 */
export const sendEmailFromPool = async (templateParams) => {
    if (!EMAIL_POOL || EMAIL_POOL.length === 0) {
        throw new Error("Email Pool is empty! Please configure src/config/emailKeys.js");
    }

    // 1. Pick a Random Key
    const randomIndex = Math.floor(Math.random() * EMAIL_POOL.length);
    const keySet = EMAIL_POOL[randomIndex];

    console.log(`[EmailPool] Sending using Account #${randomIndex + 1} (${keySet.serviceId})`);

    // 2. Send via EmailJS
    try {
        const response = await emailjs.send(
            keySet.serviceId,
            keySet.templateId,
            templateParams,
            keySet.publicKey
        );
        return response;
    } catch (error) {
        console.error(`[EmailPool] Failed with Account #${randomIndex + 1}`, error);
        // Optional: Retry with another key? For now, we just throw to keep it simple.
        throw error;
    }
};
