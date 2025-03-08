# Multi-Servlet Chat Application

A real-time chat application built with Node.js, Express, and WebSockets that allows multiple users to communicate in a shared chat room with persistent message storage.

## Features

- **Real-time Communication**: Instant message delivery using WebSockets
- **Persistent Message Storage**: Chat history is preserved across server restarts
- **User Authentication**: Simple username-based authentication
- **Chat History**: New users automatically receive complete chat history
- **System Notifications**: Displays when users join the chat
- **User Statistics**: Tracks active users, total connections, and messages
- **Responsive Design**: Works on both desktop and mobile devices
- **Dashboard**: Real-time statistics about the chat application

## Technologies Used

- **Backend**: Node.js, Express.js
- **Real-time Communication**: WebSockets (`ws`)
- **Frontend**: HTML, CSS, JavaScript
- **Data Storage**: File system (JSON)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Beliya470/GROUP03.git
cd GROUP03
```

2. Install dependencies:

```bash
npm install
```

## Running the Application

1. Start the server:

```bash
npm start
```

Or directly with Node:

```bash
node server.js
```

2. The server will start on port 3000 by default (or the port specified in your environment variables).
3. Open your browser and navigate to:

```
http://localhost:3000
```

## Usage Instructions

### Login Page

- Enter any username to join the chat
- No password required

### Chat Page

- Type messages in the input field at the bottom
- Press Enter or click Send to send messages
- All users in the chat will see your messages in real-time
- Previous chat history is automatically loaded
- The sidebar shows how many users are currently online

### Dashboard Page

- View real-time statistics about the chat application
- See total connections, active users, and messages sent

## Project Structure

```
├── data/
│   └── messages.json       # Persistent storage for chat messages
├── public/                 # Static files
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side JavaScript
│   │   ├── chat.js         # Chat functionality
│   │   ├── dashboard.js    # Dashboard functionality
│   │   └── login.js        # Login functionality
│   ├── chat.html           # Chat page
│   ├── dashboard.html      # Dashboard page
│   └── index.html          # Login page
├── server.js               # Main server file
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## How It Works

### Server Initialization

- Express server handles HTTP requests
- WebSocket server manages real-time communication
- Messages are stored in a JSON file for persistence

### User Authentication

- Users enter a username on the login page
- Server creates or retrieves user session
- User is redirected to the chat page

### Real-time Chat

- WebSocket connection established between client and server
- Server sends complete chat history to new users
- Messages are broadcast to all connected clients
- All messages are stored persistently

### Dashboard

- Real-time statistics are updated via WebSocket
- Shows active users, total connections, and messages sent

## Troubleshooting

- If the application doesn't start, check if port 3000 is already in use
- If messages aren't loading, check if the data directory exists and is writable
- If WebSocket connection fails, try refreshing the page

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributors

- Stacy Wambui (22/04134)
- Gerry Odhiambo (22/05474)
- Kipronoh Mathew (22/05361)
- Benjamin Mutate (22/0588)
- Anne Beliya Anziya (23/02145)

