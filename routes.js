var nbFollowers;
var nbFollowed;

function createUser(req,response,client){
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
};

function updateUserByUsername(req,response,client){
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
};

function getUserByUsername(req,response,client){
	const username = req.params.username;
	const countFollowersQuerry = {
		text: 'SELECT count(*) as nb_followers FROM "user"."followers" where "user"."followers"."followed_username" = $1',
		values: [username]
	}
	client.query(countFollowersQuerry, (err, res) => {
		if (err) {
			console.log(err.stack);
			response.send({
				success: false,
				code: 400,
				message: 'Error while getting the number of followers of '+username+' in db.'
			});
		} else {
			const nbFollowers=res.rows[0].nb_followers;
			const countFollowedQuerry = {
				text: 'SELECT count(*) as nb_followed FROM "user"."followers" where "user"."followers"."follower_username" = $1',
				values: [username]
			}
			client.query(countFollowedQuerry, (err, res) => {
				if (err) {
					console.log(err.stack);
					response.send({
						success: false,
						code: 400,
						message: 'Error while getting the number of followed of '+username+' in db.'
					});
				} else {
					const nbFollowed=res.rows[0].nb_followed;
					const userSelectionQuery = {
						text: 'SELECT * FROM "user"."users" where "user"."users"."username" = $1',
						values: [username]
					}
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
							var user={
								"username":rows[0].username,
								"firstname" :rows[0].firstname,
								"lastname":rows[0].lastname,
								"nbFollowers":nbFollowers,
								"nbFollowed":nbFollowed,
							};
							jsonObject[key].push(user);
							response.send({
								success: true,
								code: 200,
								data :jsonObject
							});
						}
					})
				}
			});
		}
	});
}

function createFollower(req,response,client){
	const followerUsername = req.body.follower_username;
	const followedUsername = req.body.followed_username;
	const followerInsertionQuery = {
		text: 'INSERT INTO "user".followers(follower_username,followed_username) values ($1,$2)',
		values: [followerUsername,followedUsername]
	}
	client.query(followerInsertionQuery, (err, res) => {
		if (err) {
			console.log(err.stack);
			response.send({
				success: false,
				code: 400,
				message: "Error during follower creation."
			});
		} else {
			response.send({
				success: true,
				code: 200,
				message: 'The user '+followedUsername+' is now followed by '+followerUsername,
			});
		}
	})
};

function deleteFollower(req,response,client){
	const followerUsername = req.body.follower_username;
	const followedUsername = req.body.followed_username;
	const followerDeletionQuery = {
		text: 'DELETE from "user"."followers" where "user"."followers"."follower_username" = $1 and "user"."followers"."followed_username" = $2',
		values: [followerUsername,followedUsername]
	}
	client.query(followerDeletionQuery, (err, res) => {
		if (err) {
			console.log(err.stack);
			response.send({
				success: false,
				code: 400,
				message: "Error during follower deletion."
			});
		} else {
			response.send({
				success: true,
				code: 200,
				message: 'The user '+followedUsername+' doesn\'t follow anymore '+followerUsername,
			});
		}
	})
};

module.exports = {
    createUser,
	updateUserByUsername,
	getUserByUsername,
	createFollower,
	deleteFollower,
}


