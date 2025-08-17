// controllers/movieController.js
import { generateMovieInfo } from "../utils/gemini.js";

export const getMovieInfo = async (req, res) => {
  const { movieName } = req.body;

  if (!movieName) {
    return res.status(400).json({ error: "Movie name is required." });
  }

  try {
    const info = await generateMovieInfo(movieName);
    res.json({ info });
  } catch (err) {
    console.error("Movie info fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch movie info with AI." });
  }
};
