/**
 * Filters out spam, links, and overly short comments.
 * @param {Array<string>} comments - The raw array of comment strings.
 * @returns {Array<string>} - The cleaned array of comments.
 */
const filterComments = (comments) => {
    // We use the JavaScript .filter() method to keep only the good comments
    const cleanComments = comments.filter(comment => {
        
        // 1. Remove comments that are too short (e.g., "nice", "first", "🔥🔥")
        if (comment.length < 10) {
            return false; // Drop this comment
        }
        
        // 2. Remove comments that contain URLs (likely spam)
        if (comment.includes("http://") || comment.includes("https://")) {
            return false; // Drop this comment
        }
        
        // If it passes all checks, keep it!
        return true;
    });

    return cleanComments;
};

// Export the function so the controller can use it
module.exports = { filterComments };