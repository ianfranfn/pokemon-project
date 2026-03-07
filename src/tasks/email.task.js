import * as restate from "@restatedev/restate-sdk";

export const emailService = restate.service({
    name: "EmailService",
    handlers: {
        sendWelcomeEmail: async (ctx, data) => {
            const { email } = data;
            await ctx.sleep(5000);
            
            console.log(`[Email Task] Welcome email successfully sent to: ${email}`);
            
            return true;
        },
    },
});