import React, { useState } from "react";
import useFetchYouTubeComments from "../components/hooks/useFetchYouTubeComments";

// Function to clean comments
const cleanComment = (comment) => {
  // Remove <br> tags and trim the comment
  return comment.replace(/<br\s*\/?>/gi, ' ').trim();
};

// Function to filter comments based on length
const filterCommentsByLength = (comments, maxLength) => {
  return comments.filter(comment => comment.comment.length <= maxLength);
};

const LinkInput = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState(null);
  const maxLength = 100; // Set your desired maximum length here

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

  // Categorize and clean comments
  const categorizeComments = (comments) => {
    const categories = ["Questions", "Appreciating", "Abusive"];
    const categorized = {
      Questions: [],
      Appreciating: [],
      Abusive: []
    };

    comments.forEach(comment => {
      const cleanedComment = cleanComment(comment.comment);
      if (categories.includes(comment.category)) {
        categorized[comment.category].push({ ...comment, comment: cleanedComment });
      }
    });

    return categorized;
  };

  const filteredData = data ? filterCommentsByLength(data.comments, maxLength) : [];
  const categorizedComments = categorizeComments(filteredData);

  return (
    <div className="youtube-comments max-w-6xl mx-auto p-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="category-section p-4 border border-gray-300 rounded-md">
              <h4 className="text-xl font-semibold mb-2">Questions</h4>
              {categorizedComments.Questions.map((comment, index) => (
                <div key={index} className="comment p-2 border-b border-gray-200">
                  <p className="font-bold">{comment.author}:</p>
                  <p>{comment.comment}</p>
                </div>
              ))}
            </div>
            <div className="category-section p-4 border border-gray-300 rounded-md">
              <h4 className="text-xl font-semibold mb-2">Appreciating</h4>
              {categorizedComments.Appreciating.map((comment, index) => (
                <div key={index} className="comment p-2 border-b border-gray-200">
                  <p className="font-bold">{comment.author}:</p>
                  <p>{comment.comment}</p>
                </div>
              ))}
            </div>
            <div className="category-section p-4 border border-gray-300 rounded-md">
              <h4 className="text-xl font-semibold mb-2">Abusive</h4>
              {categorizedComments.Abusive.map((comment, index) => (
                <div key={index} className="comment p-2 border-b border-gray-200">
                  <p className="font-bold">{comment.author}:</p>
                  <p>{comment.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LinkInput;
