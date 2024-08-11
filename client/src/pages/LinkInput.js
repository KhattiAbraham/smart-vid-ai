import React, { useState } from "react";
import useFetchYouTubeComments from "../components/hooks/useFetchYouTubeComments";

const LinkInput = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState(null);

  const { data, loading, error } = useFetchYouTubeComments(videoId);

  const getVideoId = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("v");
    } catch (error) {
      console.error("Invalid URL");
      return null;
    }
  };

  const handleFetchComments = () => {
    const id = getVideoId(videoUrl);
    if (id) {
      setVideoId(id);
    } else {
      alert("Please enter a valid YouTube video URL.");
    }
  };

  return (
    <div className="youtube-comments max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">YouTube Comments Fetcher</h2>
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter YouTube video URL"
          className="flex-grow p-2 border border-gray-300 rounded-md mr-2"
        />
        <button
          onClick={handleFetchComments}
          className="p-2 bg-blue-500 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Fetching..." : "Fetch Comments"}
        </button>
      </div>
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {data && (
        <>
          <h3 className="text-lg font-semibold mb-4">
            Total Comments: {data.totalComments}
          </h3>
          <div className="comments space-y-4">
            {data.comments.map((comment) => (
              <div key={comment.id} className="comment p-4 border border-gray-300 rounded-md">
                <p className="font-bold">{comment.snippet.topLevelComment.snippet.authorDisplayName}:</p>
                <div>{comment.snippet.topLevelComment.snippet.textDisplay}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LinkInput;
