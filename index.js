const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const db = client.db('waderlust_db');
        const destinationsCollection = db.collection('destinations');

        // add destination
        app.post('/add-destination', async (req, res) => {
            const newDestination = req.body;
            // console.log('Received new destination:', newDestination);

            const result = await destinationsCollection.insertOne(newDestination);
            res.json(result);
        })

        // get single destination
        app.get('/destinations/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const destination = await destinationsCollection.findOne(query);

            console.log('Fetched destination:', destination);
            res.json(destination);
        })

        // get all destinations
        app.get('/destinations', async (req, res) => {
            const cursor = destinationsCollection.find();
            const destinations = await cursor.toArray();

            // console.log('Fetched destinations:', destinations);
            res.json(destinations)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Hello from Node.js and Express!');
})

app.listen(PORT, () => {
    console.log(`Server is running. Click: http://localhost:${PORT}/`);
})