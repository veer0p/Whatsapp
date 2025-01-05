require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const port = 5000;

// MongoDB URI from .env file
const MONGO_URI = process.env.MONGO_URI;
const DATABASE_NAME = "Chats";
const COLLECTION_NAME = "Bn";

// MongoDB client setup
let db;
MongoClient.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    db = client.db(DATABASE_NAME);
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

// API to fetch all messages from the 'Bn' collection
app.get("/api/messages", async (req, res) => {
  try {
    // Fetch all documents from the 'Bn' collection
    const chats = await db.collection(COLLECTION_NAME).find().toArray();

    console.log("Fetched chats from DB:", chats); // Log the entire response

    if (chats.length === 0) {
      return res.status(404).json({ message: "No chats found." });
    }

    // Flatten the messages from all conversations
    const allMessages = chats.flatMap((chat) => chat.messages);

    console.log("Flattened messages:", allMessages); // Log the flattened messages

    // Return the flattened list of all messages
    res.json(allMessages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
