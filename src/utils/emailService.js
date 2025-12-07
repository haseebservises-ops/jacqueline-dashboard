import emailjs from '@emailjs/browser';

/**
 * Sends an email using EmailJS.
 * Requires configuration object with { serviceId, templateId, publicKey }.
 */
export const sendOrderEmail = async (orderData, config) => {
    if (!config?.serviceId || !config?.templateId || !config?.publicKey) {
        console.warn("EmailJS not configured.");
        return; // Fail silently if not configured
    }

    try {
        const templateParams = {
            to_name: "Admin",
            customer_name: orderData.name,
            customer_email: orderData.email,
            transaction_id: orderData.transactionId,
            order_date: new Date().toLocaleDateString(),
            // Keep generic message just in case
            message: `New Order from ${orderData.name} (${orderData.email}). Transaction: ${orderData.transactionId}`
        };

        await emailjs.send(
            config.serviceId,
            config.templateId,
            templateParams,
            config.publicKey
        );
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Failed to send email:", error);
        // We don't throw here to avoid blocking the user flow
    }
};
