'use strict';

const express = require('express');
const cors = require('cors');
const execute = require('./sandbox').execute;
const { uuid } = require('uuidv4');
const {codeSchema} = require("./codeSchema");
const mongoose = require('mongoose');
// Constants
const PORT =  process.env.PORT || '5000';
const HOST = '0.0.0.0';

//App
const app = express();

// ***connection with DB ***
const mongoConnectionURL = "mongodb+srv://rishav:helloworld@cluster0-1zq8a.mongodb.net/code?retryWrites=true&w=majority";
// TODO change database name to the name you chose
const databaseName = "code"
mongoose
  .connect(mongoConnectionURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: databaseName,
  })
  .then(() =>{ console.log("Connected to MongoDB")})
  .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));

//Middlewares
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use((req, res, next) => {  
  req.id = uuid();  //assign unique id to each request
  next();
});

//Routes
app.post('/dryRun', async(req, res) => {
  console.log("***Started***",Date(Date.now()))
  const {code,lang,vars} = req.body;
  res.send(await execute(code, lang, vars, req.id));
});

app.post('/runInFlow',async(req, res)=>{
//   req.body._id will be id for the given code(flow id)
//    const code = from DB
//    const lang = from DB
   const vars = req.body.vars;
   res.send(await execute(code, lang, vars, req.id));
});

app.post('/uploadCode', async(req, res)=>{
  const id = req.body.id //code in string
  const lang = req.body.lang //string
  const code = req.body.code //flowid + stepid
  const result = await codeSchema.updateOne({id:id},{$set:{code:code,lang:lang}},{upsert:true})
  res.send(result)
})

app.get('/',async(req,res)=>{
   console.log('get api to see all codes')
   const result = await codeSchema.find();
   res.send(result);
})

app.listen(PORT, HOST, () => {
  console.log(`Running at http://${HOST}:${PORT}`);
});
