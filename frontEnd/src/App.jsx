import { useState, useEffect } from "react"
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import "./App.css"

function App() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1
}`)
  const [review, setReview] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastRequestTime, setLastRequestTime] = useState(0)

  useEffect(() => {
    prism.highlightAll()
  }, [])

  async function reviewCode() {
    if (loading) return

    // Prevent requests more frequent than every 5 seconds
    const now = Date.now()
    if (now - lastRequestTime < 5000) {
      setReview("Please wait 5 seconds between requests.")
      return
    }

    try {
      setLoading(true)
      setLastRequestTime(now)
      setReview("Reviewing...")

      const backendUrl = import.meta.env.VITE_BACKEND_URL 
        ? `${import.meta.env.VITE_BACKEND_URL}/ai/get-review-stream` 
        : "/api/get-review-stream";

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        console.error("Review error:", response.status)
        let message = "Something went wrong while fetching the review."
        try {
          const errorBody = await response.json()
          message = errorBody?.message || message
        } catch {
          message = await response.text().catch(() => "Unknown error")
        }
        setReview(message)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setReview(accumulated)
      }

      // Flush any remaining buffered data from the decoder
      const remaining = decoder.decode(new Uint8Array(), { stream: false })
      if (remaining) {
        accumulated += remaining
        setReview(accumulated)
      }
    } catch (error) {
      setReview("Something went wrong while fetching the review.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="left">
        <div className="code">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={(code) =>
              prism.highlight(code, prism.languages.javascript, "javascript")
            }
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 16,
              border: "1px solid #ddd",
              borderRadius: "5px",
              height: "100%",
              width: "100%",
            }}
          />
        </div>

        <div
          onClick={reviewCode}
          className="review"
          style={{
            pointerEvents: loading ? "none" : "auto",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Reviewing..." : "Review"}
        </div>
      </div>

      <div className="right">
        <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
      </div>
    </main>
  )
}

export default App
