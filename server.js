import 'dotenv/config' // Load environment variables from .env file
import { config } from 'dotenv'
import { app } from './app.js' // Importing the Express app
import logger from './utils/logger.js'
import * as restate from "@restatedev/restate-sdk";
import { emailService } from "./src/tasks/email.task.js"
import { scrapeService } from "./src/tasks/email.task.js"

const port = config.env.PORT || 4000 // Use the port from environment variables or default to 4000

app.listen(port, () => {
    logger.info(`server listening in http://localhost:${port}`)
})

restate.endpoint().bind(emailService).bind(scrapeService).listen(9080);
