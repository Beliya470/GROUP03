import express from "express"
import http from "http"
import { WebSocketServer } from "ws"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create messages directory if it doesn't exist
const MESSAGES_DIR = path.join(__dirname, 'data');
const MESSAGES_FILE = path.join(MESSAGES_DIR, 'messages.json');

if (!fs.existsSync(MESSAGES_DIR)){
    fs.mkdirSync(MESSAGES_DIR);
}

// Initialize messages file if it doesn't exist
if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create a persistent message store with file system backing
const messageStore = {
  messages: [],
  
  init() {
    try {
      this.messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
      console.log(`Loaded ${this.messages.length} messages from storage`);
    } catch (error) {
      console.error('Error loading messages:', error);
      this.messages = [];
      // Create a fresh file
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
    }
  },
  
  addMessage(message) {
    this.messages.push(message);
    // Save to file
    try {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(this.messages));
      console.log(`Added message. Total messages: ${this.messages.length}`);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  },
  
  getMessages() {
    // Read from file to ensure we have latest messages
    try {
      this.messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    } catch (error) {
      console.error('Error reading messages:', error);
      // If there's an error, use the in-memory messages
    }
    return this.messages;
  }
};

// Initialize message store
messageStore.init();

// Stats tracking
const stats = {
  totalConnections: 0,
  activeUsers: 0,
  messagesSent: messageStore.messages.length, // Initialize with stored message count
}

// WebSocket connection handling
wss.on("connection", async (ws) => {
  console.log("New client connected");
  stats.totalConnections++;
  stats.activeUsers++;

  // First, send stored messages
  const storedMessages = messageStore.getMessages();
  console.log(`Sending ${storedMessages.length} stored messages to new client`);
  
  // Ensure we send the chat history immediately
  ws.send(
    JSON.stringify({
      type: "chatHistory",
      data: storedMessages
    })
  );

  // Then send stats
  ws.send(
    JSON.stringify({
      type: "stats",
      data: stats,
    })
  );

  broadcastUserCount();

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);
      console.log("Received message type:", message.type);

      if (message.type === "chat") {
        // Store the message first
        messageStore.addMessage(message.data);
        stats.messagesSent++;

        // Then broadcast to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(message));
          }
        });
      } else if (message.type === "join") {
        const joinMessage = {
          type: "chat",
          data: {
            text: `${message.data.username} has joined the chat`,
            username: "System",
            timestamp: new Date().toISOString(),
            isSystem: true,
          },
        };

        // Store join message
        messageStore.addMessage(joinMessage.data);

        // Broadcast join message
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(joinMessage));
          }
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    stats.activeUsers--;
    broadcastUserCount();
  });
});

function broadcastUserCount() {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(
        JSON.stringify({
          type: "userCount",
          count: stats.activeUsers,
        })
      );
    }
  });
}

// Simplified auth endpoint
app.post("/api/auth", (req, res) => {
  const { username } = req.body;
  
  console.log("Auth request:", { username });
  
  if (!username || username.trim() === "") {
    return res.status(400).json({ error: "Username is required" });
  }
  
  // Create user session
  const user = {
    id: Date.now().toString(),
    username,
    joinedAt: new Date(),
  };
  
  return res.status(200).json({ user });
});

// For backward compatibility
app.post("/api/login", (req, res) => {
  req.url = "/api/auth";
  app._router.handle(req, res);
});

app.post("/api/register", (req, res) => {
  req.url = "/api/auth";
  app._router.handle(req, res);
});

app.get("/api/messages", (req, res) => {
  const messages = messageStore.getMessages();
  console.log(`Sending ${messages.length} messages via API`);
  res.json({ messages });
});

app.get("/api/stats", (req, res) => {
  res.json({ stats });
});

// Static files
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Catch-all route for any other requests
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});