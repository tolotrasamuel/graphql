var express = require('express');
var graphqlHTTP = require('express-graphql');
var {buildSchema} = require('graphql');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
    type Query {
        team(id: Int!): Team
        teams: [Team]
        exercices:[Exercice]
        exercicesOfTeam(id:Int!):[Exercice]
    }
    type Mutation{
        createTeam(name:String, iconUrl:String):Team
        updateTeam(id:Int!, name:String, iconUrl:String):Team
        deleteTeam(id:Int!): Boolean
        
        updateScore(id:Int!, score:Int): Boolean
        
        createExo(title:String, scoreValue:Int):Exercice
        updateExo(id:Int!, title:String, scoreValue:Int):Exercice
        deleteExo(id:Int!): Boolean
    }
    type Team {
        id: Int
        name: String
        iconUrl: String
        score: Int
        exercicesId: [String]
    }
    type Exercice {
        id:Int
        title: String
        scoreValue: Int
    }
`);
const exercices = [
    {
        id: 0,
        title: "Kraken exo 00",
        scoreValue: 100,
    }, {
        id: 1,
        title: "Kraken exo 01",
        scoreValue: 110,
    }, {
        id: 2,
        title: "Kraken exo 02",
        scoreValue: 120,
    },
]
const teams = [
    {
        id: 0,
        name: 'Lorem Upsm name',
        iconUrl: 'Lorem Upsm iconUrl',
        score: 1000,
        exercicesId: [0]
    }, {
        id: 1,
        name: 'Lorem Upsm name',
        iconUrl: 'Lorem Upsm iconUrl',
        score: 1100,
        exercicesId: [0, 1, 2]
    }, {
        id: 2,
        name: 'Lorem Upsm name',
        iconUrl: 'Lorem Upsm iconUrl',
        score: 1200,
        exercicesId: [2]
    },
]

function getTeamById(id) {
    return teams.filter(e => e.id == id)[0]
}
function getexoById(id) {
    return exercices.filter(e => e.id == id)[0]
}

function loggingMiddleware(req, res, next) {
    console.log('query:', req.headers);
    if(req.headers.bearer!=="authtoken"){
        next(401)
    }else{
        next();
    }
}

// The root provides a resolver function for each API endpoint
var root = {
    team: (args) => {
        return getTeamById(args.id)
    },
    createTeam: (args)=>{
        const id = teams[teams.length-1].id +1
        const {name, iconUrl} = args
        const team ={id, name, iconUrl}
        teams.push(team)
        return team

    },

    updateTeam: (args)=>{
        const team = getTeamById(args.id)
        Object.assign(team, args)
        // const newId = teams[teams.length-1].id +1
        // const {name, iconUrl} = args
        // {id, name, iconUrl}
        // teams.push(team)
        return team

    },
    updateScore: (args)=>{
        const team = getTeamById(args.id)
        Object.assign(team, args)
        return true

    },
    deleteTeam: (args) => {
        const team =  getTeamById(args.id)
        delete teams[teams.indexOf(team)]
        return true
    },
    createExo: (args)=>{
        const id = exercices[exercices.length-1].id +1
        const {title, scoreValue} = args
        const exo ={id, title, scoreValue}
        exercices.push(exo)
        return exo

    },
    updateExo: (args)=>{
        const exo = getexoById(args.id)
        Object.assign(exo, args)
        return exo

    },
    deleteExo: (args) => {
        const exo =  getexoById(args.id)
        delete exercices[exercices.indexOf(exo)]
        return true
    },
    teams: () => {
        return teams
    },
    exercices: () => {
        return exercices
    },
    exercicesOfTeam: (args) => {

        const team = getTeamById(args.id)
        return team.exercicesId.map(e=>getexoById(e))

    }
};

var app = express();
// app.use(loggingMiddleware)
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
