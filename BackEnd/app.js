const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;

// MongoDB Atlas connection
mongoose
  .connect("mongodb+srv://veer:%40Veer.idk@whatsapp.3bc95.mongodb.net/Chats", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Define the message schema and model, pointing to the "Bn" collection
const messageSchema = new mongoose.Schema(
  {
    date: String,
    conversation_id: Number,
    messages: [
      {
        time: String,
        sender: String,
        content: String,
        status: String,
      },
    ],
  },
  { collection: "Bn" }
);

const Message = mongoose.model("Message", messageSchema);

// Middleware to parse JSON requests
app.use(express.json());

// Search API
app.post("/search", async (req, res) => {
  const query = req.body.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const messages = await Message.aggregate([
      {
        $unwind: "$messages", // Flatten the messages array
      },
      {
        $match: {
          "messages.content": {
            $regex: `\\b${query}\\b`, // Matches whole words only
            $options: "i", // Case-insensitive search
          },
        },
      },
      {
        $group: {
          _id: "$date",
          date: { $first: "$date" },
          messages: {
            $push: {
              time: "$messages.time",
              sender: "$messages.sender",
              content: "$messages.content",
              status: "$messages.status",
            },
          },
        },
      },
      {
        $project: {
          // Exclude _id and name fields
          _id: 0,
          date: 1,
          messages: 1,
        },
      },
      {
        $sort: { date: 1 }, // Sort results by date (optional)
      },
    ]);

    if (messages.length === 0) {
      return res.status(404).json({ message: "No messages found" });
    }

    res.json(messages);
  } catch (error) {
    console.error("Error searching messages:", error);
    res
      .status(500)
      .json({ error: "An error occurred while searching for messages" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
