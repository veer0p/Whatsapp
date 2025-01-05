require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = 5000;

// MongoDB URI and collection details
const MONGO_URI = process.env.MONGO_URI;
const DATABASE_NAME = "Chats";
const COLLECTION_NAME = "Bn";

// MongoDB client setup
let db;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(
      "mongodb+srv://veer:%40Veer.idk@whatsapp.3bc95.mongodb.net/"
    );
    db = client.db(DATABASE_NAME);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if the connection fails
  }
}

// Call the connection function
connectToMongoDB();

// Root route to display a welcome message
app.get("/", (req, res) => {
  res.send("Hello, this is Bn server");
});

// API to fetch all messages from the 'Bn' collection
app.get("/api/messages", async (req, res) => {
  try {
    if (!db) {
      return res
        .status(500)
        .json({ message: "Database connection not initialized." });
    }

    // Fetch all documents from the 'Bn' collection
    const chats = await db.collection(COLLECTION_NAME).find().toArray();

    if (!chats || chats.length === 0) {
      return res.status(404).json({ message: "No chats found." });
    }

    // Flatten the messages from all conversations
    const allMessages = chats.flatMap((chat) => chat.messages || []);

    res.json(allMessages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res
      .status(500)
      .json({ message: "An error occurred while fetching messages." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
