const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Key
const apiKey = "AIzaSyBxYc3ZmzHSPqk3ruJdADNr4o4NK_APeI0";
if (!apiKey) {
  console.error('YouTube API key is missing in environment variables.');
  process.exit(1); // Exit if API key is not set
}

// Endpoint to fetch YouTube comments and video details
app.get('/api/comments', async (req, res) => {
  let predictedViews2Months = null;
  let predictedViews4Months = null;
  let predictedViews6Months = null;
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    let allComments = [];
    let nextPageToken = '';

    // Fetch video details (snippet for upload time, statistics for views)
    const videoResponse = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet,statistics',
        id: videoId,
        key: apiKey,
      },
    });

    // Check if video details exist
    if (!videoResponse.data.items.length) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoDetails = videoResponse.data.items[0].snippet;
    const videoStats = videoResponse.data.items[0].statistics;

    const title = videoDetails.title;
    const description = videoDetails.description;
    const views = videoStats.viewCount; // Fetch views count
    const likes = videoStats.likeCount; // Fetch likes count
    const uploadTime = videoDetails.publishedAt; // Fetch upload time
    const channelId = videoDetails.channelId; // Get the channel ID

    console.log('Title:', title);
    console.log('Views:', views);
    console.log('Likes:', likes);
    console.log('Upload Time:', uploadTime);

    // Fetch channel details to get total videos count and total views
    const channelResponse = await axios.get(`https://youtube.googleapis.com/youtube/v3/channels`, {
      params: {
        part: 'statistics',
        id: channelId,
        key: apiKey,
      },
    });

    // Check if channel stats exist
    if (!channelResponse.data.items.length) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channelStats = channelResponse.data.items[0].statistics;
    const videosCount = channelStats.videoCount; // Fetch total videos count
    const totalViews = channelStats.viewCount; // Fetch total views of the channel
    const subscriberCount = channelStats.subscriberCount || 0; // Fallback to 0 if not available

    // Extract keywords (simple approach)
    const keywords = [...new Set(title.split(' ').concat(description.split(' ')))];

    // Use keywords to search for similar content
    const searchResponse = await axios.get(`https://youtube.googleapis.com/youtube/v3/search`, {
      params: {
        part: 'snippet',
        q: keywords.join(' '), // Join keywords to create a search query
        type: 'video',
        maxResults: 5, // You can adjust this
        key: apiKey,
      },
    });

    const similarVideos = searchResponse.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
    }));

    // Fetch comments
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

      const comments = response.data.items.map(comment => comment.snippet.topLevelComment.snippet.textDisplay);
      const authors = response.data.items.map(comment => comment.snippet.topLevelComment.snippet.authorDisplayName);

      // Send comments to Python API for category prediction
      try {
        const predictionsResponse = await axios.post('http://localhost:5001/predict_comments', {
          comments: comments,
        });

        const categories = predictionsResponse.data;

        // Combine author, comment, and category into one object
        const Data = comments.map((comment, index) => ({
          author: authors[index],
          comment: comment,
          category: categories[index] || 'Unknown', // Handle cases where category might be missing
        }));

        allComments = [...allComments, ...Data];
        nextPageToken = response.data.nextPageToken;
      } catch (error) {
        console.error('Error calling Python API:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: 'Failed to get predictions from Python API' });
      }
    } while (nextPageToken);

    // Now send the total views and total videos count to the Python API for prediction
    try {
      const viewsPredictionResponse = await axios.post('http://localhost:5001/predict_views', {
        views_count: totalViews, // Changed to total views of the channel
        videos_count: videosCount, // Total videos count
      });
    
      const next2MonthsViews = viewsPredictionResponse.data.next_2_months_views;
      const parsedTotalViews = parseFloat(totalViews);
      const parsedNext2MonthsViews = parseFloat(next2MonthsViews);

      // Adjusted calculations based on growth percentage instead of direct multiplication
      const growth = (parsedNext2MonthsViews - parsedTotalViews) / parsedTotalViews;

      predictedViews2Months = Math.floor(parsedNext2MonthsViews);
      predictedViews4Months = Math.floor(parsedNext2MonthsViews * (1 + growth)); // assumes constant growth
      predictedViews6Months = Math.floor(parsedNext2MonthsViews * (1 + growth * 2)); // double the growth

      console.log("Predicted Views for 2 months:", predictedViews2Months);
      console.log("Predicted Views for 4 months:", predictedViews4Months);
      console.log("Predicted Views for 6 months:", predictedViews6Months);

    } catch (error) {
      console.error('Error calling Python API for views prediction:', error.response ? error.response.data : error.message);
      return res.status(500).json({ error: 'Failed to get views prediction from Python API' });
    }

    // Send the combined data to the client
    res.json({
      views, // Send the views count with the response
      likes,
      title,
      subscriberCount,
      uploadTime, // Send the upload time with the response
      videosCount, // Send the total videos count with the response
      totalViews, // Send the total views of the channel with the response
      predictedViews2Months,
      predictedViews4Months,
      predictedViews6Months,
      comments: allComments,
      totalComments: allComments.length,
      similarVideos: similarVideos, // Include similar videos in the response
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
