import express from 'express';
import { promises } from 'fs';
//para controla acesso dos endpoints
import cors from 'cors'

const router = express.Router();
const readFile = promises.readFile
const writeFile = promises.writeFile

//para converter o timestamp para horário da máquina local
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



router.post("/", async (req, res) => {
  let account = req.body;
  try {
    let data = await readFile(global.fileName, "utf8");
    let json = JSON.parse(data);

    account = {
      id: json.nextId++,
      ...account, timestamp: display,
    };
    json.accounts.push(account);

    await writeFile(global.fileName, JSON.stringify(json));
    res.send("Inclusão confirmada");
    logger.info(`POST /account - ${JSON.stringify(account)}`);

  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
    logger.info(`POST /account - ${err.message}`);

  }
});

//para controla acesso dos endpoints
// router.get("/", async (_, res) => {
router.get("/",cors(), async (_, res) => {
  try {
    let data = await readFile(global.fileName, "utf8");
    let json = JSON.parse(data);
    delete json.nextId;
    res.send(json);
    logger.info("GET /account");

  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
    logger.info(`GET /account - ${err.message}`);

  }
});

//para controlar acesso dos endpoints
// router.get("/:id/", async (req, res) => {
router.get("/:id/",cors(), async (req, res) => {
  try {
    let data = await readFile(global.fileName, "utf8");
    let json = JSON.parse(data);

    delete json.nextId;
    const account = json.accounts.find((account) => {
      return account.id === parseInt(req.params.id, 10);
    });
    // res.send(json);
    res.send(account);
    logger.info(`GET /account/:id - ${JSON.stringify(account)}`);

  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
    logger.info(`GET /account/:id - ${err.message}`);

  }
});

router.delete("/:id", async (req, res) => {
  try {
    let data = await readFile(global.fileName, "utf8");
    let json = JSON.parse(data);

    delete json.nextId;
    let account = json.accounts.filter((account) => {
      return account.id !== parseInt(req.params.id, 10);
    });
    json.accounts = account;
    // res.send(account);


    await writeFile(global.fileName, JSON.stringify(json));
    res.send("Exclusão confirmada");
    logger.info(`DELETE /account/:id - ${JSON.stringify(req.params.id)}`);
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
    logger.info(`DELETE /account/ - ${err.message}`);

  }
});

router.put("/", async (req, res) => {
  try {
    let newAccount = req.body;
    let data = await readFile(global.fileName, "utf8");

    let json = JSON.parse(data);
    let oldIndex = json.accounts.findIndex(
      (account) => account.id === newAccount.id
    );
    // res.send(oldIndex);
    // json.accounts[oldIndex] = newAccount; //acrescenta em todos mediante o id
    json.accounts[oldIndex].name = newAccount.name;
    json.accounts[oldIndex] = newAccount;
    //acrescenta somente na propriedade name

    await writeFile(global.fileName, JSON.stringify(json));
    res.send("Atualização confirmada");
    logger.info(`PUT /account/ - ${JSON.stringify(newAccount)}`);

    // res.end();
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
    logger.info(`PUT /account/ - ${err.message}`);

  }
});

router.post("/transaction", async (req, res) => {
  try {
    let params = req.body;
    let data = await readFile(global.fileName, "utf8");

    let json = JSON.parse(data);
    let index = json.accounts.findIndex((account) => account.id === params.id);

    if (params.value < 0 && json.accounts[index].balance + params.value < 0) {
      throw new Error("Não há saldo suficiente");
    }
    // res.send(index);
    json.accounts[index].balance += params.value; //altera o balance
    // json.accounts[index].age += params.value; //altera o age
    // json.accounts[index].altura = params.value; //altera altura
    //importante identificar o id para alteração

    await writeFile(global.fileName, JSON.stringify(json));
    res.send(json.accounts[index]);
    logger.info(`POST /account/transaction - ${JSON.stringify(params)}`);

    // res.end();
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
    logger.info(`POST /account/transaction - ${err.message}`);

  }
});

// module.exports = router;
export default router;