import * as restate from "@restatedev/restate-sdk";
import nodemailer from "nodemailer"

export const emailService = restate.service({
    name: "EmailService",
    handlers: {
        sendWelcomeEmail: async (ctx, data) => {
            const { email } = data;
            await ctx.sleep(5000);

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            })

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Welcome to the Pokémon world!',
                text: `Hello! Your registration was successful with the email ${email}.`
            }

            try {
                // Ejecutamos el envío
                const info = await transporter.sendMail(mailOptions);
                console.log(`[Email Task] Actual email sent! Recipient: ${email} - Response: ${info.response}`);
            } catch (error) {
                console.error(`[Email Task] Fatal error sending email to ${email}:`, error);
            }
            
            console.log(`[Email Task] Welcome email successfully sent to: ${email}`);
            
            return true;
        },
    },
});