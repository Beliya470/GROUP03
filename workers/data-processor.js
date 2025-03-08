import { parentPort } from "worker_threads"

// This worker processes data in a separate thread
parentPort.on("message", (data) => {
  console.log(`Worker processing data: ${data}`)

  // Simulate data processing
  const result = {
    strings: data.filter((item) => typeof item === "string"),
    numbers: data.filter((item) => typeof item === "number"),
    total: data.length,
  }

  // Send processed result back to main thread
  parentPort.postMessage(result)
})

