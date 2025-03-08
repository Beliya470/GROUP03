document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    const username = localStorage.getItem("username")
    if (username) {
      // Redirect to chat page if already logged in
      window.location.href = "/chat"
      return
    }
  
    const loginForm = document.getElementById("login-form")
    const errorMessage = document.getElementById("error-message")
  
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()
  
      const usernameInput = document.getElementById("username")
      const username = usernameInput.value.trim()
  
      if (!username) {
        showError("Username cannot be empty")
        return
      }
  
      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        })
  
        const data = await response.json()
  
        if (!response.ok) {
          showError(data.error || "Failed to login")
          return
        }
  
        // Save user data to localStorage
        localStorage.setItem("username", data.user.username)
        localStorage.setItem("userId", data.user.id)
  
        // Redirect to chat page
        window.location.href = "/chat"
      } catch (error) {
        showError("An error occurred. Please try again.")
        console.error("Login error:", error)
      }
    })
  
    function showError(message) {
      errorMessage.textContent = message
  
      // Clear error after 3 seconds
      setTimeout(() => {
        errorMessage.textContent = ""
      }, 3000)
    }
  })
  
  