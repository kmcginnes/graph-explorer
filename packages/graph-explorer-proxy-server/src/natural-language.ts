import express, { Router } from "express";
import ollama from "ollama";
import { logger } from "./logging.js";

const router: Router = express.Router();

router.post("/ask", async (req, res) => {
  const { query } = req.body;

  console.log("Received a natural language query to process:", query);

  try {
    const response = await ollama.chat({
      model: "gx-gremlin",
      messages: [{ role: "user", content: query }],
    });

    const sanitizedContent = response.message.content
      .replace("```gremlin", "")
      .replace("```", "")
      .replace(/^\s*\n/gm, "");

    res.json({ message: sanitizedContent });
  } catch (error) {
    logger.error("Failed to process query: %s", query);
    logger.error(error);
    res.status(500).send({ message: "Error interacting with the model" });
  }
});

export { router as naturalLanguageRouter };
