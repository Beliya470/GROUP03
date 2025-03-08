document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const totalConnectionsElement = document.getElementById("total-connections")
    const activeUsersElement = document.getElementById("active-users")
    const messagesSentElement = document.getElementById("messages-sent")
  
    // Fetch initial stats
    fetchStats()
  
    // Connect to WebSocket for real-time updates
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.host}`
    const socket = new WebSocket(wsUrl)
  
    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data)
  
      if (data.type === "stats") {
        updateStats(data.data)
      } else if (data.type === "userCount") {
        activeUsersElement.textContent = data.count
      }
    })
  
    // Fetch stats from API
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats")
        const data = await response.json()
  
        if (response.ok) {
          updateStats(data.stats)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }
  
    // Update stats on the page
    function updateStats(stats) {
      totalConnectionsElement.textContent = stats.totalConnections
      activeUsersElement.textContent = stats.activeUsers
      messagesSentElement.textContent = stats.messagesSent
  
      // Add animation effect
      animateValue(totalConnectionsElement)
      animateValue(activeUsersElement)
      animateValue(messagesSentElement)
    }
  
    // Add animation to stat values
    function animateValue(element) {
      element.classList.add("animate-value")
      setTimeout(() => {
        element.classList.remove("animate-value")
      }, 500)
    }
  
    // Refresh stats every 30 seconds
    setInterval(fetchStats, 30000)
  })
  
  