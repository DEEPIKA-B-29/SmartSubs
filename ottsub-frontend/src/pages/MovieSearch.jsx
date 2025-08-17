import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";

export default function MovieSearch() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    if (!token) {
      alert("You must be logged in to search movies");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/movies/search",
        { title: query },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Search failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movie title..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={search}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {result ? (
        result?.results?.length > 0 ? (
          result.results.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded shadow mb-4">
              <h3 className="text-xl font-bold">
                {item.movie.title} ({item.movie.year})
              </h3>
              <p className="text-sm text-gray-600">{item.movie.genre}</p>
              <p className="mt-2">{item.movie.plot}</p>

              {item.movie.actors && (
                <p className="mt-1 text-gray-700">
                  <span className="font-semibold">Cast:</span>{" "}
                  {item.movie.actors}
                </p>
              )}

              {item.movie.poster && (
                <img
                  src={item.movie.poster}
                  alt="poster"
                  className="mt-3 w-40 border rounded"
                />
              )}

              <div className="mt-4">
                <h4 className="font-semibold">Available on:</h4>
                {item.providers.length > 0 ? (
                  <p className="text-green-700">{item.providers.join(", ")}</p>
                ) : (
                  <p className="text-gray-500">No providers listed</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 mt-2">No movies found</p>
        )
      ) : null}
    </div>
  );
}
