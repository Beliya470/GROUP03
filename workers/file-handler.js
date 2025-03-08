import { parentPort } from "worker_threads"

// This worker simulates file handling operations
parentPort.on("message", (filename) => {
  // Simulate file processing
  console.log(`Worker handling file: ${filename}`)

  // Simulate some work
  setTimeout(() => {
    // Send result back to main thread
    parentPort.postMessage(`File ${filename} processed successfully`)
  }, 1000)
})

