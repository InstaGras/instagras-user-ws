/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 *
 * @apiError UserNotFound The id of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */




//--------------------------------------------------------------------------------------------------------//
//GESTION DES VARIABLES D ENVIRONNEMENT

require('dotenv').config({path: __dirname + '/.env'})


//--------------------------------------------------------------------------------------------------------//
//DB CONNECTION

const { Pool, Client } = require('pg')


const client = new Client({
  user: process.env['client.user'],
  host: process.env['client.host'],
  database: process.env['client.database'],
  password: process.env['client.password'],
  port: process.env['client.port']
})

client.connect();


//--------------------------------------------------------------------------------------------------------//
//API


//L'application requiert l'utilisation du module Express.
//La constiable express nous permettra d'utiliser les fonctionnalités du module Express.  
const express = require('express'); 
// Nous définissons ici les paramètres du serveur.
const hostname = process.env['app.hostname'];
const port = process.env['app.port']; 
 
// Nous créons un objet de type Express. 
const app = express(); 

const bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
 
 
const myRouter = express.Router(); 


myRouter.route('/')
//permet de prendre en charge toutes les méthodes. 
.all(function(req,res){ 
      res.json({message : "Bienvenue sur l'api de worldOfCommits", methode : req.method});
});


/*
	/PROJECTS
*/

myRouter.route('/projects')
// GET
.get(function(req,response){
	const requeteSelectionProjet = "SELECT * from project";
	const query = {
		text: requeteSelectionProjet,
		types: {
			getTypeParser: () => val => val,
		},
	}
	// callback
	client.query(query, (err, res) => {
		if (err) {
			console.log(err.stack);
			response.send({
				success: false,
				code: 400
			});
		} else {
			const jsonObject={};
			const key = 'project';
			const rows = res.rows;
			jsonObject[key] = [];
			for (var i = 0; i < rows.length; i++) { 
				var projects={
					"project_id":rows[i].project_id,
					"owner_id" :rows[i].owner_id,
					"created_at":rows[i].created_at,
					"project_name":rows[i].project_name
				};
				jsonObject[key].push(projects);
			}
			response.send({
				success: true,
				code: 200,
				data :jsonObject
			});
		}
	})
})
//POST
.post(function(req,res){
	const user_id =req.body.owner.user_id;
	const name=req.body.owner.name;
	const username=req.body.owner.username;
	const requeteInsertionUser = "INSERT INTO gitlab_user(user_id,name,username) values (" + user_id + ",'"+name+"','"+username+"');";

	const project_id =req.body.project_id;
	const project_name =req.body.project_name;
	const owner_id=req.body.owner.user_id;
	const created_at=req.body.created_at;
	const requeteInsertionProjet = "INSERT INTO project(project_id,project_name,owner_id,created_at) values ("+ project_id +",'" + project_name + "',"+owner_id+",'"+created_at+"');";
	
	//création de le requête commit.
	const requeteCommit = "commit;";
	
	//création de la requete complete
	const requeteComplete = requeteInsertionUser + requeteInsertionProjet + requeteCommit;
	
	//execution de la requete d'insertion
	client.query(requeteComplete, (err, res) => {
		//si on a une erreur c que user peut etre deja present en bdd donc on test sans insertion user
		if(err){
				const requeteLimitee = requeteInsertionProjet + requeteCommit;
				//execution de la requete d'insertion
				client.query(requeteLimitee, (err, res) => {
					console.log(err, res)
				});

		}else{
			console.log(err, res);
		}
	});
	
	res.json({message : "L'insertion du projet et de l'utilisateur associé est un succès !", methode : req.method});
})



/*
	/USERS
*/

myRouter.route('/users')
// GET
.get(function(req,response){
	const requeteSelectionUser = "SELECT * from gitlab_user";
	const query = {
		text: requeteSelectionUser,
		types: {
			getTypeParser: () => val => val,
		},
	}
	// callback
	client.query(query, (err, res) => {
		if (err) {
			console.log(err.stack);
			response.send({
				success: false,
				code: 400
			});
		} else {
			const jsonObject={};
			const key = 'user';
			const rows = res.rows;
			jsonObject[key] = [];
			for (var i = 0; i < rows.length; i++) { 
				var users={
					"user_id":rows[i].user_id,
					"name" :rows[i].name,
					"username":rows[i].username,
				};
				jsonObject[key].push(users);
			}
			response.send({
				success: true,
				code: 200,
				data :jsonObject
			});
		}
	})
})

/*
	/USERS/:ID
*/

myRouter.route('/users/:id')
// GET
.get(function(req,response){
	const user_id = req.params.id;
	const requeteSelectionUser = "SELECT * from gitlab_user where user_id ="+user_id+";";
	const query = {
		text: requeteSelectionUser,
		types: {
			getTypeParser: () => val => val,
		},
	}
	// callback
	client.query(query, (err, res) => {
		if (err) {
			console.log(err.stack);
			response.send({
				success: false,
				code: 400
			});
		} else {
			const jsonObject={};
			const key = 'user';
			const rows = res.rows;
			jsonObject[key] = [];
			for (var i = 0; i < rows.length; i++) { 
				var users={
					"user_id":rows[i].user_id,
					"name" :rows[i].name,
					"username":rows[i].username,
				};
				jsonObject[key].push(users);
			}
			response.send({
				success: true,
				code: 200,
				data :jsonObject
			});
		}
	})
})

/*
	/USERS/:ID/PROJECTS
*/

myRouter.route('/users/:id/projects')
// GET
.get(function(req,response){
	const user_id = req.params.id;
	const requeteSelectionProjetsDeUser = "SELECT * from project where owner_id ="+user_id+";";
	const query = {
		text: requeteSelectionProjetsDeUser,
		types: {
			getTypeParser: () => val => val,
		},
	}
	// callback
	client.query(query, (err, res) => {
		if (err) {
			console.log(err.stack);
			response.send({
				success: false,
				code: 400
			});
		} else {
			const jsonObject={};
			const key = 'project';
			const rows = res.rows;
			jsonObject[key] = [];
			for (var i = 0; i < rows.length; i++) { 
				var projects={
					"project_id":rows[i].project_id,
					"owner_id" :rows[i].owner_id,
					"created_at":rows[i].created_at,
					"project_name":rows[i].project_name
				};
				jsonObject[key].push(projects);
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

 
// Nous demandons à l'application d'utiliser notre routeur avec le rate limiting
app.use(myRouter,limit);  
 
// Démarrer le serveur 
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port); 
});


//--------------------------------------------------------------------------------------------------------//
//GENERATION AUTOMATIQUE DE LA DOC DE L API


const nodeApiDocGenerator = require('node-api-doc-generator')
nodeApiDocGenerator(app,process.env['app.hostname'],process.env['app.port'])



