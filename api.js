//DB CONNECTION

const { Pool, Client } = require('pg')


const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'world_of_commits_db',
  password: 'hercules1',
  port: 5432,
})

client.connect();

//--------------------------------------------------------------------------------------------------------//
//API


//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.  
var express = require('express'); 
// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost'; 
var port = 3000; 
 
// Nous créons un objet de type Express. 
var app = express(); 

var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
 
 
var myRouter = express.Router(); 
 
myRouter.route('/projects')

// GET
.get(function(req,response){
	var requeteSelectionProjet = "SELECT * from project";
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
			res.json({message : "Erreur pendant la récupération de tous les projets.", methode : req.method});
		} else {
			var jsonObject={};
			var key = 'project';
			var rows = res.rows;
			jsonObject[key] = [];
			for (var i = 0; i < rows.length; i++) { 
				var projects={
					"project_id":rows[i].project_id,
					"owner_id" :rows[i].owner_id,
					"created_at":rows[i].created_at,
					"created_at":rows[i].project_name
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
	var user_id =req.body.owner.user_id;
	var name=req.body.owner.name;
	var username=req.body.owner.username;
	var requeteInsertionUser = "INSERT INTO gitlab_user(user_id,name,username) values (" + user_id + ",'"+name+"','"+username+"');";

	var project_name =req.body.project_name;
	var owner_id=req.body.owner.user_id;
	var created_at=req.body.created_at;
	var requeteInsertionProjet = "INSERT INTO project(project_id,project_name,owner_id,created_at) values (nextval('projects_sequence'),'" + project_name + "',"+owner_id+",'"+created_at+"');";
	
	//création de le requête commit.
	var requeteCommit = "commit;";
	
	//création de la requete complete
	var requeteComplete = requeteInsertionUser + requeteInsertionProjet + requeteCommit;
	
	//execution de la requete d'insertion
	client.query(requeteComplete, (err, res) => {
		//si on a une erreur c que user peut etre deja present en bdd donc on test sans insertion user
		if(err){
				var requeteLimitee = requeteInsertionProjet + requeteCommit;
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



myRouter.route('/')
// all permet de prendre en charge toutes les méthodes. 
.all(function(req,res){ 
      res.json({message : "Bienvenue sur l'api de worldOfCommits", methode : req.method});
});
 

 
// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);  
 
// Démarrer le serveur 
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port); 
});

