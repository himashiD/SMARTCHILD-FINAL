// routes/chatbotRoutes.js
import express from "express";
import axios from "axios";

const router = express.Router();

// URL of the Python FastAPI service
// (Change host/port if Python runs on another machine or Docker container)
const PYTHON_API = process.env.PYTHON_CHATBOT_URL || "http://localhost:8000/ask";

/**
 * @route   POST /api/chatbot/ask
 * @desc    Proxy SmartChild chatbot request to Python service
 * @access  Public (you can wrap with auth if needed)
 */
router.post("/ask", async (req, res) => {
  try {
    const { question, history } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, error: "Question is required" });
    }

    // Forward request to Python FastAPI
    const pythonRes = await axios.post(PYTHON_API, {
      question,
      history: history || []
    });

    return res.json({
      success: true,
      answer: pythonRes.data.answer,
      context: pythonRes.data.context
    });
  } catch (err) {
    console.error("❌ Chatbot API error:", err.message);

    // Handle Axios errors properly
    if (err.response) {
      return res.status(err.response.status).json({
        success: false,
        error: err.response.data || "Error from Python chatbot service"
      });
    }

    return res.status(500).json({
      success: false,
      error: "Chatbot service unavailable"
    });
  }
});

export default router;
