const axios = require('axios');

/**
 * Fetches the top comments for a given YouTube video.
 * @param {string} videoId - The extracted YouTube Video ID.
 * @returns {Promise<Array<string>>} - An array of raw comment strings.
 */
const fetchYouTubeComments = async (videoId) => {
    try {
        const API_KEY = process.env.YOUTUBE_API_KEY; 
        
        // Call the YouTube Data API v3
        const response = await axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
            params: {
                part: 'snippet',
                videoId: videoId,
                maxResults: 100, // Fetch up to 100 comments
                key: API_KEY,
                order: 'relevance' // Get the most relevant/top comments
            }
        });

        // Extract just the text from the complex JSON response
        const rawComments = response.data.items.map(item => {
            return item.snippet.topLevelComment.snippet.textOriginal;
        });

        return rawComments;

    } catch (error) {
        console.error("YouTube API Error:", error.message);
        throw new Error("Failed to fetch comments. Check your Video ID or API Key.");
    }
};

// Export the function so the controller can use it
module.exports = { fetchYouTubeComments };