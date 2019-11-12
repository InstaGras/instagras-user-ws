//--------------------------------------------------------------------------------------------------------//
//GESTION DES VARIABLES D ENVIRONNEMENT

require('dotenv').config({path:'./.env'})

//--------------------------------------------------------------------------------------------------------//
//DB CONNECTION

const { Pool, Client } = require('pg');


const client = new Client({
  user: process.env['client.user'],
  host: process.env['client.host'],
  database: process.env['client.database'],
  password: process.env['client.password'],
  port: process.env['client.port'],
})

client.connect();

//--------------------------------------------------------------------------------------------------------//
//API

const express = require('express'); 
const hostname = process.env['app.hostname'];
const port = process.env['app.port'];  
const app = express(); 
const bodyParser = require("body-parser");
const myRouter = express.Router(); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
myRouter.route('/')
//permet de prendre en charge toutes les méthodes. 
.all(function(req,res){ 
      res.json({message : "Welcome to Instagras user web service", methode : req.method});
});

/*
	/USERS
*/

myRouter.route('/userws/users')
//POST
.post(function(req,response){
	const username = req.body.username;
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const verifQuery = {
		text: 'SELECT "user"."users"."username" FROM "user"."users" WHERE "user"."users"."username"=$1',
		values: [username]
	}
	//verification if the users exists in db
	client.query(verifQuery, (err, res) => {
		if (err) {
			console.log(err);
			response.send({
				success: false,
				code: 400,
				message: "Error while verifying if the user "+username+" exists in db"
			});
		} else {
			const rows = res.rows;
			//the user doesn't exist in db : he is inserted
			if(rows.length==0){
				 const userInsertionQuery = {
					text: 'INSERT INTO "user".users(username,lastname,firstname) values ($1,$2,$3)',
					 values: [username,lastname,firstname]
				}
				client.query(userInsertionQuery, (err, res) => {
					if (err) {
						console.log(err.stack);
						response.send({
							success: false,
							code: 400,
							message: "Error during user creation."
						});
					} else {
						response.send({
							success: true,
							code: 200,
							message: 'The user '+username+' has been inserted in db'
						});
					}
				});
			//the user already exists in db : not
			}else{
				response.send({
					success: true,
					code: 200,
					message: 'The user '+username+' already exists in db'
				});
			}
		}
	})
});


myRouter.route('/userws/users/:username')
//PUT
.put(function(req,response){
	const username = req.params.username;
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const verifQuery = {
		text: 'SELECT "user"."users"."username" FROM "user"."users" WHERE "user"."users"."username"=$1',
		values: [username]
	}
	//verification if the users exists in db
	client.query(verifQuery, (err, res) => {
		if (err) {
			console.log(err);
			response.send({
				success: false,
				code: 400,
				message: "Error while verifying if the user "+username+" exists in db"
			});
		} else {
			const rows = res.rows;
			//the user doesn't exist in db : he is inserted
			if(rows.length==0){
				response.send({
					success: false,
					code: 200,
					message: 'The user '+username+' doesn\'t exist in db'
			});
			//the user already exists in db : he is updated
			}else{
				const userUpdateQuery = {
					text: 'UPDATE "user".users set lastname=$1, firstname=$2 where username = $3',
					 values: [lastname,firstname,username]
				};
				client.query(userUpdateQuery, (err, res) => {
					if (err) {
						console.log(err.stack);
						response.send({
							success: false,
							code: 400,
							message: "Error during user update."
						});
					} else {
						response.send({
							success: true,
							code: 200,
							message: 'The user '+username+' has been updated in db'
						});
					}
				});
			}
		}
	})
});

/*
	/USERS/USER:USERNAME
*/
myRouter.route('/userws/users/:username')
// GET
.get(function(req,response){
	const username = req.params.username;
	const userSelectionQuery = {
		text: 'SELECT * FROM "user"."users" where "user"."users"."username" = $1',
		values: [username]
	}
	// callback
	client.query(userSelectionQuery, (err, res) => {
		if (err) {
			console.log(err.stack);
			response.send({
				success: false,
				code: 400,
				message: 'Error while getting the user '+username+' in db.'
			});
		} else {
			const jsonObject={};
			const key = 'users';
			const rows = res.rows;
			jsonObject[key] = [];
			for (var i = 0; i < rows.length; i++) { 
				var user={
					"username":rows[i].username,
					"firstname" :rows[i].firstname,
					"lastname":rows[i].lastname,
				};
				jsonObject[key].push(user);
			}
			response.send({
				success: true,
				code: 200,
				data :jsonObject
			});
		}
	})
})


//--------------------------------------------------------------------------------------------------------//
//PREVENTING ATTACKS

 
 // Importing Dependencies
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Helmet
app.use(helmet());

// Rate Limiting
const limit = rateLimit({
    max: 100,// max requests
    windowMs: 60 * 60 * 1000, // 1 Hour of 'ban' / lockout 
    message: 'Too many requests' // message to send
});

// Body Parser
app.use(express.json({ limit: '10kb' })); // Body limit is 10

// Data Sanitization against NoSQL Injection Attacks
app.use(mongoSanitize());

// Data Sanitization against XSS attacks
app.use(xss());

 
// asking for the ap to use ratelimiting
app.use(myRouter,limit);  
 
// Starting server
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port); 
});


