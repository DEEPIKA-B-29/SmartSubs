import express from "express";
import axios from "axios";
import auth from "../middleware/authMiddleware.js";
import { generateMovieInfo } from "../utils/gemini.js"; // optional

const router = express.Router();

router.post("/search", auth, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: "Title required" });

  try {
    // 1) Fuzzy search
    const searchRes = await axios.get("http://www.omdbapi.com/", {
      params: { s: title, apikey: process.env.OMDB_API_KEY },
    });

    if (searchRes.data.Response === "False")
      return res.status(404).json({ message: "No movies found" });

    // 2) Fetch details for each movie
    const moviesWithProviders = await Promise.all(
      searchRes.data.Search.map(async (movie) => {
        const detailRes = await axios.get("http://www.omdbapi.com/", {
          params: { i: movie.imdbID, apikey: process.env.OMDB_API_KEY },
        });
        const data = detailRes.data;

        const movieData = {
          title: data.Title,
          year: data.Year,
          genre: data.Genre,
          plot: data.Plot,
          actors: data.Actors,
          imdbRating: data.imdbRating,
          poster: data.Poster,
        };

        let ottProviders = [];
        if (generateMovieInfo) {
          try {
            const infoText = await generateMovieInfo(movieData.title);
            ottProviders = infoText
              .replace(/\*\*/g, "")
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean);
          } catch (err) {
            console.error("Gemini OTT fetch failed:", err.message);
          }
        }

        return { movie: movieData, providers: ottProviders };
      })
    );

    res.json({ results: moviesWithProviders });
  } catch (err) {
    console.error("Movie search error:", err.message);
    res
      .status(500)
      .json({ message: "Movie search failed", error: err.message });
  }
});

export default router;
