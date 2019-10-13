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
 
 
//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes. 
var myRouter = express.Router(); 
 
// Je vous rappelle notre route (/piscines).  
myRouter.route('/projects')
// J'implémente les méthodes GET, PUT, UPDATE et DELETE
// GET
.get(function(req,res){ 
	res.json({message : "Liste toutes le projets", methode : req.method});
})
//POST
.post(function(req,res){
	//connexion à la bdd
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

