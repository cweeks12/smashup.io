const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('static'));

// Knex Setup //
const env = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[env];  
const knex = require('knex')(config);

// bcrypt setup
let bcrypt = require('bcrypt');
const saltRounds = 10;

// jwt setup
const jwt = require('jsonwebtoken');
let jwtSecret = process.env.jwtSecret;
if (jwtSecret === undefined) {
    console.log("You need to define a jwtSecret environment variable to continue.");
    knex.destroy();
    process.exit();
}

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token)
        return res.status(403).send({ error: 'No token provided.' });
    jwt.verify(token, jwtSecret, function(err, decoded) {
        if (err)
            return res.status(500).send({ error: 'Failed to authenticate token.' });
        // if everything good, save to request for use in other routes
        req.userID = decoded.id;
        next();
    });
}

// Login //

app.post('/api/login', (req, res) => {
    if (!req.body.email || !req.body.password)
        return res.status(400).send();
    knex('users').where('email',req.body.email).first().then(user => {
        if (user === undefined) {
            res.status(403).send("Invalid credentials");
            throw new Error('abort');
        }
        return [bcrypt.compare(req.body.password, user.hashed_password),user];
    }).spread((result,user) => {
        if (result) {
            let token = jwt.sign({ id: user.id }, jwtSecret, {
                expiresIn: '24h' // expires in 24 hours
            });
            console.log(token);
            res.status(200).json({user:{username:user.username,id:user.id},token:token});
        } else {
            res.status(403).send("Invalid credentials");
        }
        return;
    }).catch(error => {
        if (error.message !== 'abort') {
            console.log(error);
            res.status(500).json({ error });
        }
    });
});

// Registration //

app.post('/api/register', (req, res) => {
    if (!req.body.email || !req.body.password || !req.body.username)
        return res.status(400).send();
    knex('users').where('email',req.body.email).first().then(user => {
        if (user !== undefined) {
            res.status(403).send("Email address already exists");
            throw new Error('abort');
        }
        return knex('users').where('username',req.body.username).first();
    }).then(user => {
        if (user !== undefined) {
            res.status(409).send("User name already exists");
            throw new Error('abort');
        }
        return bcrypt.hash(req.body.password, saltRounds);
    }).then(hash => {
        return knex('users').insert({email: req.body.email, hashed_password: hash, username:req.body.username,
            role: 'user'});
    }).then(ids => {
        return knex('users').where('id',ids[0]).first().select('username','id');
    }).then(user => {
        let token = jwt.sign({ id: user.id }, jwtSecret, {
            expiresIn: '24h' // expires in 24 hours
        });
        res.status(200).json({user:user,token:token});
        return;
    }).catch(error => {
        if (error.message !== 'abort') {
            console.log(error);
            res.status(500).json({ error });
        }
    });
});


// Get all Expansions
app.get('/api/expansions', (req, res) => {
    knex.select('id', 'name').from('expansions').then(names => {
        res.status(200).send(names);
    });
});


// Get your Expansions
app.get('/api/expansions/:id', verifyToken, (req, res) => {
    let userId = parseInt(req.params.id);
    if (userId !== req.userID){
        res.status(403).send();
        return;
    }
    knex.select('expansions.id', 'expansions.name').from('expansions').leftJoin('ownedExpansions', 'expansions.id', 'ownedExpansions.expansion_id').where('ownedExpansions.user_id', userId).then(results => {
        res.status(200).send(results);
    }).catch(error => {
        res.status(500).send();
        console.log(error);
    });
});

// Set your Expansions
app.post('/api/expansions/:id', verifyToken, (req, res) => {
    let userId = parseInt(req.params.id);
    if (!req.body.expansion)
        res.status(400).send();
    if (userId !== req.userID){
        res.status(403).send();
        return;
    }
    knex.select('expansion_id', 'user_id').from('ownedExpansions').where({user_id: userId, expansion_id: req.body.expansion}).then(result => {
        console.log(result);
        if (result.length === 0 ){
            console.log('hi');
            return knex.insert({expansion_id: req.body.expansion, user_id: userId}, 'user_id').into('ownedExpansions');
        }
        else {
            return knex('ownedExpansions').where({'expansion_id': req.body.expansion, 'user_id': userId}).del();
        }
    })
    .then(nothing => {
        return knex.select('expansions.id', 'expansions.name').from('expansions').leftJoin('ownedExpansions', 'expansions.id', 'ownedExpansions.expansion_id').where('ownedExpansions.user_id', userId);
    }).then(results => {
        res.status(200).send(results);
    }).catch(error => {
        console.log(error);
        res.status(500).send();
    });
});

// Delete your expansions

app.delete('/api/expansions/:id', verifyToken, (req, res) => {
    let userId = parseInt(req.params.id);
    if (!req.body.expansion)
        res.status(400).send();
    if (userId !== req.userID){
        res.status(403).send();
        return;
    }
    /*.then(unused => {
        return knex.select('expansions.id', 'expansions.name').from('expansions').leftJoin('ownedExpansions', 'expansions.id', 'ownedExpansions.expansion_id').where('ownedExpansions.user_id', userId);
    }).then(results => {
        res.status(200).send(results);
    }).catch(error => {
        console.log(error);
        res.status(500).send();
    });*/
});

// Get all factions

app.get('/api/factions', (req, res) => {
    knex.select('factions.id', 'factions.name as faction', 'expansions.name as expansion').from('factions').leftJoin('expansions', 'factions.expansion_id', 'expansions.id').then(factions => {
        res.status(200).send(factions);
    });
});

// Get your factions
app.get('/api/expansions/:id', verifyToken, (req, res) => {
    let userId = parseInt(req.params.id);
    if (userId !== req.userID){
        res.status(403).send();
        return;
    }
    knex.select('factions.id', 'factions.name').from('factions').leftJoin('chosenFactions', 'factions.id', 'chosenFactions.faction_id').where('chosenFactions.user_id', userId).then(results => {
        res.status(200).send(results);
    }).catch(error => {
        res.status(500).send();
        console.log(error);
    });
});



// Set your factions
app.post('/api/factions/:id', verifyToken, (req, res) => {
    let userId = parseInt(req.params.id);
    if (!req.body.faction)
        res.status(400).send();
    if (userId !== req.userID){
        res.status(403).send();
        return;
    }
    knex.insert({faction_id: req.body.faction, user_id: userId}, 'user_id').into('chosenFactions').then(userId => {
        return knex.select('factions.id', 'factions.name').from('factions').leftJoin('chosenFactions', 'factions.id', 'chosenFactions.faction_id').where('chosenFactions.user_id', userId);
    }).then(results => {
        res.status(200).send(results);
    }).catch(error => {
        console.log(error);
        res.status(500).send();
    });
});

// Unset a faction
app.delete('/api/factions/:id', verifyToken, (req, res) => {
    let userId = parseInt(req.params.id);
    if (!req.body.faction)
        res.status(400).send();
    if (userId !== req.userID){
        res.status(403).send();
        return;
    }
    knex('chosenFactions').where({'faction_id': req.body.faction, 'user_id': userId}).del().then(unused => {
        return knex.select('factions.id', 'factions.name').from('factions').leftJoin('chosenFactions', 'factions.id', 'chosenFactions.faction_id').where('chosenFactions.user_id', userId);
    }).then(results => {
        res.status(200).send(results);
    }).catch(error => {
        console.log(error);
        res.status(500).send();
    });
});

// Get random factions (from yours)
app.get('/api/factions/:id/:players', verifyToken, (req, res) => {
    let userId = parseInt(req.params.id);
    let playerNumber = parseInt(req.params.players);
    if (userId !== req.userID){
        res.status(403).send();
        return;
    }
    knex.select('factions.name', 'factions.id').from('factions').leftJoin('ownedExpansions', 'factions.expansion_id', 'ownedExpansions.expansion_id').where('ownedExpansions.user_id', userId)

    .then(result => { 
        stuff = []
        for (let i = 0; i < playerNumber; i++){
            stuff.push({first: result[Math.floor(Math.random() * result.length)],
                        second: result[Math.floor(Math.random() * result.length)]});
        }
        res.status(200).send(stuff);
    });
});

// Get your created factions
app.get('/api/factions/custom/:id', (req, res) => {
    let userId = parseInt(req.params.id);
    knex.select('');
});


app.listen(3000, () => console.log('Server listening on port 3000!'));
