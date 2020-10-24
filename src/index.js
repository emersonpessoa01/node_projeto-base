import express from 'express';
import { promises } from 'fs';
import winston from 'winston'
import accountsRouter from './accounts.js'
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from "./docs.js";
import cors from 'cors';

const readFile = promises.readFile
const writeFile = promises.writeFile
const app = express();
const port = 3001;

global.fileName = "accounts.json";

const leftPad = (value, count = 2, char = "0") => {
  let stringValue = value.toString();
  let newValue = stringValue;

  if (stringValue.length < count || stringValue.length % 10 === 0) {
    for (let i = 0; i < count - stringValue.length; i++) {
      newValue = char + stringValue;
    }
  }
  return newValue;
};

const now = new Date()
const timer = `${leftPad(now.getDate())}/${leftPad(now.getMonth() + 1)}/${leftPad(now.getFullYear())}`;
const hours = leftPad(now.getHours());
const minutes = leftPad(now.getMinutes());
const seconds = leftPad(now.getSeconds());

const formatter = `${hours}:${minutes}:${seconds}`;
const tt = formatter.split(":");
const sec = tt[0] * 3600 + tt[1] * 60 + tt[2] * 1;
const display = `${timer} ${formatter}`

const { combine, timestamp, label, printf } = winston.format;


const myFormat = printf(({ timestamp, label, level, message }) => {
  return `${display} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: "silly",
  //local para onde serão transportados
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: "new-api.log" })
  ],
  //impressão dos logs
  format: combine(
    label({ label: "new-api" }),
    timestamp(display),
    myFormat
  )

});

app.use(express.json());
//com use cors libera todos os endpoints
//app.use(cors());
app.use("/account", accountsRouter);
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, async () => {
  try {
    await readFile(global.fileName, "utf8");
    logger.info("API started! DEV");
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };
    writeFile(global.fileName, JSON.stringify(initialJson)).catch((err) => {
      logger.error(err);
    });
  }
});
