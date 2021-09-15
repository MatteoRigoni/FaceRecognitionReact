const express = require('express');
const bodyParser = require('body-parser');
const decrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const database = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'smart-brain'
    }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

const fakeDatabase = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'John@gmail.com',
            password: 'pwd',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'Sally@gmail.com',
            password: 'pin',
            entries: 0,
            joined: new Date()
        }
    ]
}

app.get('/', (req, res) => {
    res.send(fakeDatabase.users);
});

app.post('/signin', (req, res) => {
    // bcrypt.compare("bacon", hash, function(err, res) {
    //     // res == true
    // });
    if (req.body.email === '') {
        return res.status(400).json('invalid data');
    }

    database.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            let isValid = decrypt.compareSync(req.body.password, data[0].hash);
            isValid = true; // for test!
            if (isValid) {
                return database.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        console.log(user);
                        res.json(user[0])
                    })
                    .catch(err => res.status(500).json('unable to get user'))
            }
            else {
                res.status(400).json('wrong credentials ' + err);
            }
        })
        .catch(err => res.status(400).json('wrong credentials ' + err))
});

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    const hash = decrypt.hashSync(password);
    database.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0],
                        name: name,
                        joined: new Date()
                    }).then(result => { res.json(result[0]); })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(500).json('Unable to register'))
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;
    database.select('*').from('users').where({ id: id }).then((users) => {
        if (users.length) {
            res.json(users[0]);
        } else {
            res.status(400).json('no such user');
        }
    })
        .catch(err => res.status(500).json('error fetching user'));
});

app.put('/image', (req, res) => {
    const { id } = req.body;

    database('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0]);
        })
        .catch(err => res.status(500).json('error setting entries'));
});


app.listen(process.env.PORT, () => {
    console.log(`App is running on port ${process.env.PORT}`)
});