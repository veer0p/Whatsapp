require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = 5000;

// MongoDB URI and collection details
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://veer:%40Veer.idk@whatsapp.3bc95.mongodb.net/";
const DATABASE_NAME = "Chats";
const COLLECTION_NAME = "Bn";

// MongoDB client setup
let db;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(MONGO_URI);
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

// API to fetch messages with search functionality
app.get("/api/messages", async (req, res) => {
  try {
    if (!db) {
      return res
        .status(500)
        .json({ message: "Database connection not initialized." });
    }

    const { search = "" } = req.query; // Get search query parameter

    // Fetch all documents from the 'Bn' collection
    const chats = await db.collection(COLLECTION_NAME).find().toArray();

    if (!chats || chats.length === 0) {
      return res.status(404).json({ message: "No chats found." });
    }

    // Flatten and filter messages based on the search query
    let allMessages = chats.flatMap((chat) => {
      return chat.messages
        .filter((msg) =>
          msg.content.toLowerCase().includes(search.toLowerCase())
        ) // Filter messages by search term
        .map((msg) => ({
          ...msg,
          date: chat.date,
          name: chat.name,
          whatsapp_name: chat.whatsapp_name,
          conversation_id: chat.conversation_id,
        }));
    });

    if (allMessages.length === 0) {
      return res
        .status(404)
        .json({ message: "No messages found matching the search criteria." });
    }

    // Group messages by date
    const messagesByDate = allMessages.reduce((acc, msg) => {
      const messageDate = new Date(msg.date);
      const formattedDate = `${
        messageDate.getMonth() + 1
      }/${messageDate.getDate()}/${messageDate.getFullYear()}`;
      if (!acc[formattedDate]) acc[formattedDate] = [];
      acc[formattedDate].push({
        content: msg.content,
        sender: msg.sender,
        time: msg.time,
        status: msg.status,
      });
      return acc;
    }, {});

    // Count unread messages
    const unreadCount = allMessages.filter(
      (msg) => msg.status === "unread"
    ).length;

    // Build the response
    const response = {
      id: chats[0].conversation_id,
      profile_picture: "", // Ignored for now
      name: chats[0].name,
      phone_number: "+91 8487005334", // Replace with actual phone number if available
      whatsapp_name: chats[0].whatsapp_name,
      unread: unreadCount,
      messages: messagesByDate,
      group: false, // Default group status
      pinned: false, // Default pinned status
      typing: false, // Default typing status
    };

    res.json(response);
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
