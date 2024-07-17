import pg from 'pg';
import express from 'express';
import cors from 'cors';

import session from 'express-session';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';

// const session = require('express-session');
// const passport = require('passport');
// const OAuth2Strategy = require('passport-oauth2');
// const axios = require('axios');

const corsOptions = {
  origin: 'https://frontend-app.cmrinfo.in/',
  credentials: true,
  optionSuccessStatus: 200
}


const { Client } = pg;

//to be used for local
// const client = new Client({
//   user: 'postgres',
//   host: 'db',
//   database: 'postgres',
//   password: '1234',
//   port: 5432,
// });

const client = new Client({
  user: 'postgres',
  host: 'poc-stag-db.ch3gxhmoa0nu.ap-south-1.rds.amazonaws.com',
  database: 'postgres',
  password: 'qwertyuhgfde5dfw',
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

// Configure session middleware
app.use(session({ secret: 'your_secret_here', resave: false, saveUninitialized: false }));
// Initialize Passport and session middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "https://frontend-app.cmrinfo.in");
  res.header('Access-Control-Allow-Headers', true);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});
app.get('/api', (req, res) => res.send('Hello World!'));

app.get('/api/all', async (req, res) => {
  console.info("Request to fetch all");
  try {
      const response = await client.query(`SELECT * FROM users`);
      
      if(response){
        console.log(response.rows);
        res.status(200).send(response.rows);
      }
      
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    } 
  });

  app.post('/api/form', async (req, res) => {
  console.info("Request to save");
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

  passport.use('nhs-login', new OAuth2Strategy({
    authorizationURL: 'https://auth.sandpit.signin.nhs.uk/as/authorization.oauth2',
    tokenURL: 'https://auth.sandpit.signin.nhs.uk/as/token.oauth2',
    clientID: 'your_client_id_here',
    clientSecret: 'your_client_secret_here',
    callbackURL: 'http://localhost:3000/auth/nhs-login/callback'
  },
  // Verify callback
  async function(accessToken, refreshToken, profile, cb) {
    // Here you can optionally fetch user profile details from NHS login
    // Store tokens securely, for example in session or database
    return cb(null, { accessToken, refreshToken });
  }
));

// Serialize user into session
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

// Deserialize user from session
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Endpoint to initiate NHS login authentication
app.get('/auth/nhs-login',  passport.authenticate('nhs-login', { scope: ['profile'] }));

// Callback endpoint after NHS login authentication
app.get('/auth/nhs-login/callback',
  passport.authenticate('nhs-login', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect to frontend or send response
    res.redirect('http://localhost:3001/profile');
  });

  app.listen(3000, () => console.log(`App running on port 3000.`));
  