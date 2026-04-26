const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  try {
    const code = req.body.code;

    if (!code) {
      return res.status(400).send("Code is required");
    }

    const response = await aiService.generateContent(code);
    return res.send(response);
  } catch (error) {
    console.error("Gemini error:", error?.message);
    console.error("Gemini details:", error);

    if (error.status === 429 || error?.message?.includes("429")) {
      return res.status(429).json({
        message: "Too many requests. Please wait a bit and try again.",
      });
    }

    return res.status(500).json({
      message: "Something went wrong while generating the review.",
    });
  }
};

module.exports.streamReview = async (req, res) => {
  try {
    const code = req.body.code;

    if (!code) {
      return res.status(400).send("Code is required");
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

    const fullReview = await aiService.generateContent(code);
    const chunkSize = 1024;

    for (let i = 0; i < fullReview.length; i += chunkSize) {
      res.write(fullReview.slice(i, i + chunkSize));
    }

    res.end();
  } catch (error) {
    console.error("Gemini error:", error?.message);
    console.error("Gemini details:", error);

    if (!res.headersSent) {
      if (error.status === 429 || error?.message?.includes("429")) {
        return res.status(429).json({
          message: "Too many requests. Please wait a bit and try again.",
        });
      }
      return res.status(500).json({
        message: "Something went wrong while generating the review.",
      });
    } else {
      res.end();
    }
  }
};
