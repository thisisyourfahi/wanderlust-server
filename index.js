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
        const usersCollection = db.collection('user');
        const bookingsCollection = db.collection('bookings');

        // get user
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const user = await usersCollection.findOne(query);

            res.send(user);
        })

        // add booking
        app.post('/destinations/:id/book', async (req, res) => {
            const bookingInfo = req.body;
            const result = await bookingsCollection.insertOne(bookingInfo);
            res.json(result);
        })

        // get all bookings
        app.get('/my-bookings', async(req, res) => {
            const cursor = bookingsCollection.find();
            const allBookings = await cursor.toArray();

            res.json(allBookings);
        })

        // get all bookings of a user
        app.get('/my-bookings/:id', async (req, res) => {
            const reqUser = req.params.id;
            const cursor = bookingsCollection.find({userID: reqUser})
            const bookings = await cursor.toArray();
            res.json(bookings);
        })

        // delete a particular booking
        app.delete('/my-bookings/delete/:id', async (req, res) => {
            const id = req.params.id;
            const deleteBooking = { _id: new ObjectId(id)};
            // console.log('delete booking:', bookingInfo);
            const result = await bookingsCollection.deleteOne(deleteBooking);
            res.json(result)
        })

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

            res.json(destination);
        })

        // get all destinations
        app.get('/destinations', async (req, res) => {
            const cursor = destinationsCollection.find();
            const destinations = await cursor.toArray();

            // console.log('Fetched destinations:', destinations);
            res.json(destinations)
        })

        // update destination
        app.patch('/destinations/:id', async (req, res) => {
            const { id } = req.params;
            const updatedDestination = req.body;
            

            const result = await destinationsCollection.updateOne({
                _id: new ObjectId(id)
            }, {
                $set: updatedDestination
            })
            res.json(result);
        })

        // delete destination
        app.delete('/destinations/:id', async (req, res) => {
            const {id} = req.params;
            console.log('requested delete for id:', id);

            const result = await destinationsCollection.deleteOne({ _id: new ObjectId(id) });
            console.log('Delete result:', result);
            res.json(result);
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