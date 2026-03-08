import * as restate from "@restatedev/restate-sdk";
import nodemailer from "nodemailer";
import logger from "../../utils/logger.js";
import { EmailLogModel } from "../../models/emailLog.model.js";

export const emailService = restate.service({
    name: "EmailService",
    handlers: {
        sendWelcomeEmail: async (ctx, data) => {
            const { email, logId } = data;

            const startedAt = new Date();
            await ctx.run("update-start-status", () =>
                EmailLogModel.updateStatus(logId, 'pending', startedAt, null)
            );

            await ctx.sleep(5000);

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Welcome to the world of Pokémon!',
                text: `Hello! Your registration was successful with the email ${email}.`
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                logger.info(`[Email Task] Email sent. Recipient: ${email} - Reply: ${info.response}`);
                const completedAt = new Date();
                await ctx.run("update-success-status", () =>
                    EmailLogModel.updateStatus(logId, 'sent', startedAt, completedAt)
                );

            } catch (error) {
                logger.error(`[Email Task] Fatal error sending email to ${email}:`, error);

                const completedAt = new Date();
                await ctx.run("update-error-status", () =>
                    EmailLogModel.updateStatus(logId, 'error', startedAt, completedAt)
                );
            }

            return true;
        },
    },
});