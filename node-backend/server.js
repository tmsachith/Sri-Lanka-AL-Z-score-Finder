require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const uri = process.env.MONGODB_URI; // Replace with your MongoDB connection string
const client = new MongoClient(uri);

async function connectToMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToMongo();

app.get('/years', async (req, res) => {
  try {
    const db = client.db('zscores');
    const collections = await db.listCollections().toArray();
    const years = collections.map(collection => collection.name);
    res.json(years);
  } catch (error) {
    console.error('Error fetching years:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/districts/:year', async (req, res) => {
  try {
    const year = req.params.year;
    const db = client.db('zscores');
    const collection = db.collection(year);

    // Fetch all documents for the given year
    const documents = await collection.find({}).toArray();

    // Extract district names from the value of the second field of each document
    const districts = documents.map(doc => {
        const keys = Object.keys(doc);
        return keys.length > 1 ? doc[keys[1]] : null;
      }).filter(district => district !== null);

    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/courses/:year/:district', async (req, res) => {
    try {
      const { year, district } = req.params;
      const db = client.db('zscores');
      const collection = db.collection(year);
  
      const documents = await collection.find({}).toArray();
      const targetDocument = documents.find(doc => {
        const keys = Object.keys(doc);
        return keys.length > 1 && doc[keys[1]] === district;
      });
  
      if (!targetDocument) {
        return res.status(404).json({ error: 'District not found' });
      }
  
      const keys = Object.keys(targetDocument);
      const coursesDict = {};
      for (let i = 2; i < keys.length; i++) {
        coursesDict[keys[i]] = targetDocument[keys[i]];
      }
  
      res.json(coursesDict);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;