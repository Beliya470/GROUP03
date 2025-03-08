document.addEventListener("DOMContentLoaded", () => {
  // Check if user has a name
  const username = localStorage.getItem("username");
  if (!username) {
    // Redirect to login page to enter a name
    window.location.href = "/";
    return;
  }

  // DOM elements
  const currentUserElement = document.getElementById("current-user");
  const userCountElement = document.getElementById("user-count");
  const chatMessages = document.getElementById("chat-messages");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  const logoutButton = document.getElementById("logout-button");
  const loginLink = document.getElementById("login-link");

  // Set current user
  currentUserElement.textContent = username;

  // Logout function (just clears the name)
  function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    window.location.href = "/";
  }

  // Add logout event listener
  logoutButton.addEventListener("click", logout);

  // Make login link work as logout
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  // Flag to track if we've received chat history
  let receivedChatHistory = false;

  // Connect to WebSocket
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}`;
  let socket = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  // Fetch chat history via REST API as a fallback
  async function fetchChatHistory() {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          // Clear any welcome messages
          chatMessages.innerHTML = "";
          // Add each message from history
          data.messages.forEach((message) => {
            addChatMessage(message);
          });
          // Scroll to bottom after adding history
          scrollToBottom();
          addSystemMessage("Loaded chat history via API");
          receivedChatHistory = true;
        }
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  }

  function connectWebSocket() {
    socket = new WebSocket(wsUrl);

    socket.addEventListener("open", () => {
      console.log("Connected to chat server");
      addSystemMessage("Connected to chat server");
      reconnectAttempts = 0;

      // Send join message
      socket.send(
        JSON.stringify({
          type: "join",
          data: { username },
        }),
      );
    });

    socket.addEventListener("message", (event) => {
      console.log("Received message:", event.data); // Debug log
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "chat":
            addChatMessage(data.data);
            break;
          case "chatHistory":
            // Handle chat history
            if (Array.isArray(data.data) && data.data.length > 0 && !receivedChatHistory) {
              // Clear any welcome messages
              chatMessages.innerHTML = "";
              // Add each message from history
              data.data.forEach((message) => {
                addChatMessage(message);
              });
              // Scroll to bottom after adding history
              scrollToBottom();
              addSystemMessage("Loaded chat history");
              receivedChatHistory = true;
            }
            break;
          case "userCount":
            updateUserCount(data.count);
            break;
          case "stats":
            // Handle stats if needed
            break;
          default:
            console.log("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    socket.addEventListener("close", () => {
      console.log("Disconnected from chat server");
      addSystemMessage("Disconnected from chat server");

      // Attempt to reconnect
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        setTimeout(connectWebSocket, 2000 * reconnectAttempts);
        addSystemMessage(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
      }
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      addSystemMessage("Error connecting to chat server");
      
      // Try to fetch chat history via REST API if WebSocket fails
      if (!receivedChatHistory) {
        fetchChatHistory();
      }
    });
  }

  // Initial connection
  connectWebSocket();

  // Also fetch chat history via REST API as a fallback
  // This ensures we get the history even if the WebSocket message is missed
  setTimeout(() => {
    if (!receivedChatHistory) {
      fetchChatHistory();
    }
  }, 2000);

  // Form submission
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const messageText = messageInput.value.trim();
    if (!messageText) return;

    // Create message object
    const message = {
      text: messageText,
      username: username,
      timestamp: new Date().toISOString(),
    };

    // Send message to server
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "chat",
          data: message,
        }),
      );
    } else {
      addSystemMessage("Cannot send message: Not connected to server");
      // Try to reconnect
      connectWebSocket();
    }

    // Clear input
    messageInput.value = "";
  });

  // Helper functions
  function addChatMessage(message) {
    console.log("Adding chat message:", message); // Debug log

    const messageElement = document.createElement("div");

    // Check if it's a system message
    if (message.isSystem) {
      messageElement.className = "system-message";
      messageElement.textContent = message.text;
    } else {
      messageElement.className = `message ${message.username === username ? "message-outgoing" : "message-incoming"}`;

      const messageContent = document.createElement("div");
      messageContent.className = "message-content";
      messageContent.textContent = message.text;

      const messageMeta = document.createElement("div");
      messageMeta.className = "message-meta";

      const usernameSpan = document.createElement("span");
      usernameSpan.className = "message-username";
      usernameSpan.textContent = message.username === username ? "You" : message.username;

      const timeSpan = document.createElement("span");
      timeSpan.className = "message-time";
      timeSpan.textContent = formatTime(new Date(message.timestamp));

      messageMeta.appendChild(usernameSpan);
      messageMeta.appendChild(timeSpan);

      messageElement.appendChild(messageContent);
      messageElement.appendChild(messageMeta);
    }

    chatMessages.appendChild(messageElement);
    scrollToBottom();
  }

  function addSystemMessage(text) {
    const messageElement = document.createElement("div");
    messageElement.className = "system-message";
    messageElement.textContent = text;

    chatMessages.appendChild(messageElement);
    scrollToBottom();
  }

  function updateUserCount(count) {
    userCountElement.textContent = count;
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Handle page unload
  window.addEventListener("beforeunload", () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "leave",
          data: { username },
        }),
      );
    }
  });

  // Focus input field
  messageInput.focus();

  // Add keyboard shortcut for sending messages
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      messageForm.dispatchEvent(new Event("submit"));
    }
  });
});