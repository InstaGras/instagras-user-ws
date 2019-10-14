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
const hostname = 'localhost'; 
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
			console.log(projects);
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

	const project_name =req.body.project_name;
	const owner_id=req.body.owner.user_id;
	const created_at=req.body.created_at;
	const requeteInsertionProjet = "INSERT INTO project(project_id,project_name,owner_id,created_at) values (nextval('projects_sequence'),'" + project_name + "',"+owner_id+",'"+created_at+"');";
	
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
	
	res.json({message : "L'insertion du projet et de l'utilisateur associé est un succès ! Requete : "+requeteComplete, methode : req.method});
})

//GET

 

 
// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);  
 
// Démarrer le serveur 
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port); 
});

