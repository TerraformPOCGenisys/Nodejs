import pg from 'pg';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
// const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:5173/',
  credentials: true,
  optionSuccessStatus: 200
}


const { Client } = pg;

const client = new Client({
  user: 'postgres',
  host: 'db',
  database: 'postgres',
  password: '1234',
  port: 5432,
});

client.connect();

const createTable = async () => { 
    await client.query(`CREATE TABLE IF NOT EXISTS users 
    (id serial PRIMARY KEY, name VARCHAR (255) UNIQUE NOT NULL, 
    email VARCHAR (255) UNIQUE NOT NULL, age INT NOT NULL);`)
  };
  
createTable();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "http://localhost:5173");
  res.header('Access-Control-Allow-Headers', true);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});
app.get('/api', (req, res) => res.send('Hello World!'));

app.get('/api/all', async (req, res) => {
    try {
      const response = await client.query(`SELECT * FROM users`);
      
      if(response){
        res.status(200).send(response.rows);
      }
      
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    } 
  });

  app.post('/api/form', async (req, res) => {
    try {
      const name  = req.body.name;
      const email = req.body.email;
      const age   = req.body.age;
  
      const response = await client.query(`INSERT INTO users(name, email, age) VALUES ('${name}', '${email}', ${age});`);
  
      if(response){
        res.status(200).send(req.body);
      }
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }    
  });

  app.listen(3000, () => console.log(`App running on port 3000.`));
  