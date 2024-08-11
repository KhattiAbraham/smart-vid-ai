import { useState, useEffect } from "react";
import axios from "axios";

const useFetchYouTubeComments = (videoId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId) return;

    const fetchComments = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:5000/api/comments`,
          {
            params: {
              videoId: videoId,
            },
          }
        );

        setData(response.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [videoId]);

  return { data, loading, error };
};

export default useFetchYouTubeComments;
