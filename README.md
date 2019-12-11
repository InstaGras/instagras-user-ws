# Instagras User Webservice

This project is an api used by instagras-client's project. It interacts with a postgresql database to get, put or post users' data.

## Getting Startedd

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

To launch this api you will need to have node.js installed on your machine.
```

### Installing
```

npm install
node api.js

### How to use it 

You can send http requests to diffent routes :


POST

/userws/users : create a new user
/userws/followers : create a new follower

PUT
/userws/users/:username : update an user by his username

GET
/userws/users : get all users
/userws/users/:username : get an user by his username
/userws/followers/:username : get all followers of an user by his username
/userws/followed/:username : get all the users followed by an user by his username


// DELETE
/userws/followers/ : delete a follower by followed username and follower username


## Running the tests

There is no tests to be run yet.
```

## Deployment

A dockerfile example to create an image of Instagras User Webservice : 

FROM node:10
COPY . /instagras-user-ws
WORKDIR /instagras-user-ws
RUN npm install
EXPOSE 3000
CMD [ "node", "api.js" ]

## Built With

* [Express](https://expressjs.com/fr/api.html) - The web framework used
* [npm](https://docs.npmjs.com/) - Dependency Management

## Authors

* **Enki MICHEL** - *Initial work* 


## License

This project is free to use: there is no licence