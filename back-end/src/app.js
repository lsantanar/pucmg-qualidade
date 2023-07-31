const express = require('express');
const EventRepository = require("./repository");
const {MongoClient} = require('mongodb');
const cors = require('cors')

const app = express();
app.use(express.json());
app.use(cors({
    exposedHeaders: ['x-total-count']
}));

const dns = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(dns);

app.get('/users', async (req, res) => {
    await client.connect();
    const collection = client.db('app_db').collection('users');
    const repository = new EventRepository(collection);

    const users = (await repository.findAll()).map(usr => {
        usr.id = usr._id;
        delete usr._id;
        return usr;
    });

    res.set('X-Total-Count', users.length)
    await client.close();
    res.json(users);
});

app.post('/users', async (req, res) =>{
    await client.connect();

    const collection = client.db('app_db').collection('users');
    const repository = new EventRepository(collection)
    const user = await repository.create(req.body);

    res.status(201).json(user)

    await client.close();
});

app.get('/users/:id', async (req,res) =>{
    await client.connect();
    const collection = client.db('app_db').collection('users');
    const repository = new EventRepository(collection)

    const user = await repository.findById(req.params.id)
    if (user === null) {
            res.status(404).json({
                status: 404,
                error: 'Usuário não encontrado'
            }); 
    } else {
        res.json(user)
    }

    await client.close();
});

app.put('/users/:id', async (req, res) => {
    await client.connect();
    const collection = client.db('app_db').collection('users');
    const repository = new EventRepository(collection)

    const user = await repository.findById(req.params.id);

    if (user === null) {
        res.status(404).json({
            "error": "Usuário não encontrado", 
            "status": 404
        })
    } else {
        const newEvent = {...user, ...req.body};
        await repository.update(newEvent)
        res.json(newEvent);
    }
    await client.close();
})

app.delete('/users/:id', async (req, res) => {
    await client.connect();
    const collection = client.db('app_db').collection('users');
    const repository = new EventRepository(collection)

    const user = await repository.findById(req.params.id);

    if (user === null) {
        res.status(404).json({
            "error": "Usuário não encontrado", 
            "status": 404
        })
    } else {
        await repository.delete(user)

        res.status(204).send(user);
    }
    await client.close();
})

module.exports = app;