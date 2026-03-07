import 'dotenv/config' // Load environment variables from .env file
import { config } from 'dotenv'
import { app } from './app.js' // Importing the Express app
import logger from './utils/logger.js'
import * as restate from "@restatedev/restate-sdk";
import { emailService } from "./src/tasks/email.task.js";

const port = config.port || 3000 // Use the port from environment variables or default to 3000

app.listen(port, () => {
    logger.info(`server listening in http://localhost:${port}`)
})

restate.endpoint().bind(emailService).listen(9080);
