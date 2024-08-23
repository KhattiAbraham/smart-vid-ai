require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint to fetch YouTube comments
app.get('/api/comments', async (req, res) => {
  const { videoId } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY; // Use environment variable for API key

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    let allComments = [];
    let nextPageToken = "";

    do {
      const response = await axios.get(
        `https://youtube.googleapis.com/youtube/v3/commentThreads`,
        {
          params: {
            part: 'snippet',
            videoId: videoId,
            maxResults: 100,
            key: apiKey,
            pageToken: nextPageToken,
          },
        }
      );

      const comments = response.data.items.map(comment => {
        return comment.snippet.topLevelComment.snippet.textDisplay;
      });

      const authors = response.data.items.map(comment => {
        return comment.snippet.topLevelComment.snippet.authorDisplayName;
      });

      // Send comments to Python API for category prediction
      const predictionsResponse = await axios.post('http://localhost:5001/predict', {
        comments: comments,
      });

      const categories = predictionsResponse.data;

      // Combine author, comment, and category into one object
      const Data = comments.map((comment, index) => {
        return {
          author: authors[index],
          comment: comment,
          category: categories[index] || 'Unknown' // Handle cases where category might be missing
        };
      });

      allComments = [...allComments, ...Data];
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    // Send the combined data to the client
    res.json({
      comments: allComments,
      totalComments: allComments.length,
    });

  } catch (error) {
    console.error('Error fetching comments:', error.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
