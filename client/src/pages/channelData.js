import React, { useState } from "react";
import axios from "axios";

const YouTubeChannelInfo = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = "AIzaSyAlN_hNqQ5pnwJZVIQ4A-F4qcAgEVPxSbc";  // Replace with your YouTube Data API Key

  // Function to extract video ID from the YouTube URL
  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const fetchChannelData = async (channelId) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`
      );
      const data = response.data.items[0];
      setChannelData(data);
      console.log(channelData);
    } catch (error) {
      setError("Error fetching channel data");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchVideoDetails = async () => {
    setLoading(true);
    setError(null);
    setChannelData(null);

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError("Invalid YouTube video URL");
      setLoading(false);
      return;
    }

    try {
      // Fetch video details to extract channel ID
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
      );
      const videoData = response.data.items[0];
      const channelId = videoData.snippet.channelId;

      // Fetch channel details using the channel ID
      fetchChannelData(channelId);
    } catch (error) {
      setError("Error fetching video details");
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Enter YouTube Video URL</h2>
      <input
        type="text"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Enter YouTube video URL"
      />
      <button onClick={handleFetchVideoDetails}>Get Channel Info</button>

      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}

      {channelData && (
        <div>
          <h1>{channelData.snippet.title}</h1>
          <img src={channelData.snippet.thumbnails.default.url} alt="Channel Logo" />
          <p>{channelData.snippet.description}</p>
          <p>Subscribers: {channelData.statistics.subscriberCount}</p>
          <p>Total Views: {channelData.statistics.viewCount}</p>
          <p>Videos: {channelData.statistics.videoCount}</p>
        </div>
      )}
    </div>
  );
};

export default YouTubeChannelInfo;
