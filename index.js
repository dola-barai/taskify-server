const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

require('dotenv').config()
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dkm5by0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const taskCollection = client.db('taskifyDB').collection('alltasks');

    app.get('/alltasks', async (req, res) => {
        const result = await taskCollection.find().toArray();
        res.send(result)
    })

    app.get('/alltasks/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await taskCollection.findOne(query);
        res.send(result);
    });

    app.post('/alltasks', async(req, res) => {
        const alltasks = req.body;
        console.log(alltasks);
        const result = await taskCollection.insertOne(alltasks);
        res.send(result)
    })

    app.put('/alltasks/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = { upsert: true };
        const updatedTask = req.body;
  
        const task = {
            $set: {
                description: updatedTask.description, 
                status: updatedTask.status, 
                deadline: updatedTask.deadline, 
            }
        }
  
        const result = await taskCollection.updateOne(filter, task, options);
        res.send(result);
    })

    app.patch('/alltasks/completed/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            status: 'Completed'
          },
        }
        const result = await taskCollection.updateOne(filter, updateDoc)
        res.send(result)
    })

    app.delete('/alltasks/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await taskCollection.deleteOne(query);
        res.send(result)
        console.log(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Taskify is Running')
})

app.listen(port, () => {
    console.log(`Taskify is Running on port: ${port}`);
})