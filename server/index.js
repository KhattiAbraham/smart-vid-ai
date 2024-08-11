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
  const apiKey = 'AIzaSyBxYc3ZmzHSPqk3ruJdADNr4o4NK_APeI0';

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

      allComments = [...allComments, ...response.data.items];
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

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
