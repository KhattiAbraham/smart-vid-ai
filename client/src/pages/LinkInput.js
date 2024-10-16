import React, { useState } from "react";
import useFetchYouTubeComments from "../components/hooks/useFetchYouTubeComments";
import BarGraph from "./BarGraph"; // Import the BarGraph component

// Function to clean comments
const cleanComment = (comment) => {
  return comment
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<a[^>]*>([^<]*)<\/a>/gi, '$1')
    .trim();
};

// Function to filter comments based on length and links
const filterComments = (comments, maxLength) => {
  return comments
    .filter(comment => !/<a\s+href=[^>]+>.*<\/a>/i.test(comment.comment))
    .filter(comment => comment.comment.length <= maxLength);
};

const LinkInput = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState(null);
  const maxLength = 500; // Set your desired maximum length here

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

  const filteredData = data ? filterComments(data.comments || [], maxLength) : []; // Safeguard against undefined
  const categorizedComments = categorizeComments(filteredData);

  return (
    <div className="youtube-comments max-w-6xl mx-auto p-4 bg-gradient-to-r from-purple-400 to-blue-500 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-white">YouTube Video Analyzer</h2>
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter YouTube video URL"
          className="flex-grow p-2 border border-gray-300 rounded-md mr-2 bg-white"
        />
        <button
          onClick={handleFetchComments}
          className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-300"
          disabled={loading}
        >
          {loading ? "Fetching..." : "Fetch Comments"}
        </button>
      </div>
      {error && <p className="text-red-300">{error.message}</p>}
      
      {data && (
        <>
          {/* Display total views and predicted views graph */}
          <BarGraph 
            totalViews={data.totalViews} 
            predictedViews2Months={data.predictedViews2Months} 
            predictedViews4Months={data.predictedViews4Months} 
            predictedViews6Months={data.predictedViews6Months} 
          />

          {/* Display total videos */}
          <div className="flex flex-col items-center mb-4 p-6 bg-white rounded-lg shadow-md text-gray-800">
            <h3 className="text-3xl font-bold mb-4">Video Details</h3>
            <div className="flex flex-col space-y-4">
              <div className="p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 bg-purple-200">
                <p className="text-xl">
                  <span className="font-semibold">Title: </span> {data.title}
                </p>
              </div>
              
              <div className="p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 bg-purple-200">
                <p className="text-xl">
                  <span className="font-semibold">Views: </span> {data.views}
                </p>
              </div>

              <div className="p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 bg-purple-200">
                <p className="text-xl">
                  <span className="font-semibold">Likes: </span> {data.likes}
                </p>
              </div>

              <div className="p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 bg-purple-200">
                <p className="text-xl">
                <span className="font-semibold">Upload Time: </span> 
                {data.uploadTime ? new Date(data.uploadTime).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 bg-purple-200">
                <p className="text-xl">
                  <span className="font-semibold">Subscribers:</span> {data.subscriberCount}
                </p>
              </div>
            </div>
          </div>

          {/* Display similar videos */}
          {data.similarVideos && data.similarVideos.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-4 text-white">Recommended Videos:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {data.similarVideos.map((video) => (
                  <div key={video.videoId} className="video-card p-2 border border-gray-300 rounded-md bg-white">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-auto" />
                    <h4 className="text-md font-semibold mt-2">{video.title}</h4>
                    <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      Watch Video
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}

          <h3 className="text-lg font-semibold mb-4 text-white">
            Total Comments: {data.totalComments || 0} {/* Fallback to 0 if undefined */}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="category-section p-4 border border-gray-300 rounded-md bg-white">
              <h4 className="text-xl font-semibold mb-2">Questions</h4>
              {categorizedComments.Questions.map((comment, index) => (
                <div key={index} className="comment p-2 border-b border-gray-200">
                  <p className="font-bold">{comment.author}:</p>
                  <p>{comment.comment}</p>
                </div>
              ))}
            </div>
            <div className="category-section p-4 border border-gray-300 rounded-md bg-white">
              <h4 className="text-xl font-semibold mb-2">Appreciating</h4>
              {categorizedComments.Appreciating.map((comment, index) => (
                <div key={index} className="comment p-2 border-b border-gray-200">
                  <p className="font-bold">{comment.author}:</p>
                  <p>{comment.comment}</p>
                </div>
              ))}
            </div>
            <div className="category-section p-4 border border-gray-300 rounded-md bg-white">
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
