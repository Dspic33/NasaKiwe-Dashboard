import emailjs from '@emailjs/browser';

/**
 * Servicio centralizado para el envío de notificaciones.
 * Nota: Debe configurarse EmailJS creando un Service, un Template y obteniendo la Public Key.
 */
export const NotificationService = {
    /**
     * Envía una notificación por correo.
     */
    sendEmailNotification: async (to_name, to_email, subject, message) => {
        try {
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

            if (!serviceId || !templateId || !publicKey) {
                console.warn("⚠️ EmailJS no configurado. Faltan variables de entorno VITE_EMAILJS_...");
                console.log(`[Mock Email a ${to_email}] ${subject}: ${message}`);
                return { success: false, error: 'Configuración faltante. Variables de entorno no definidas.' };
            }

            const templateParams = {
                to_name: to_name,
                to_email: to_email,
                subject: subject,
                message: message
            };

            await emailjs.send(serviceId, templateId, templateParams, {
                publicKey: publicKey,
            });

            console.log(`✅ Correo enviado exitosamente a ${to_email}`);
            return { success: true };
        } catch (error) {
            console.error("❌ Error enviando correo:", error);
            return { success: false, error: error.message };
        }
    }
}
