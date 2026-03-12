import * as restate from "@restatedev/restate-sdk";
import nodemailer from "nodemailer";
import * as cheerio from "cheerio"
import axios from "axios"
import logger from "../../utils/logger.js";
import { EmailLogModel } from "../../models/emailLog.model.js";

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
              // executes the send
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

export const scrapeService = restate.service({
    name: "ScrapeService",
    handlers: {
        scrapePokemonData: async (ctx, data) => {
            const { pokemonName } = data;
            const startTime = Date.now();

            logger.info(`[Scrape Task] Starting data search for: ${pokemonName}`);

            try {
                const htmlData = await ctx.run("fetch-html", async () => {
                    const response = await axios.get(`https://pokemondb.net/pokedex/${pokemonName.toLowerCase()}`);
                    return response.data;
                });
                const extractedData = await ctx.run("parse-html", () => {
                    const $ = cheerio.load(htmlData);
                    const type = $('.itype').first().text();
                    const species = $('th:contains("Species")').next('td').text();
                    return { type, species };
                });

                const endTime = Date.now();
                const duration = endTime - startTime;

                logger.info(`[Scrape Task] Success: ${pokemonName} is the species ${extractedData.species} of type ${extractedData.type}. Processed in ${duration}ms`);

                return { success: true, data: extractedData, duration };
            } catch (error) {
                logger.error(`[Scrape Task] Search error ${pokemonName}:`, error.message);
                return { success: false, error: error.message };
            }
        },
    },
});