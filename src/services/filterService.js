/**
 * Advanced filter to remove spam, attendance jokes, and timestamp dumps.
 * @param {Array<string>} comments - The raw array of comment strings.
 * @returns {Array<string>} - The highly cleaned array of useful comments.
 */
const filterComments = (comments) => {
    // 1. Define our blacklist of useless phrases
    const bannedPhrases = [
        'attendance', 'attandance', 'attendence', // Catching spelling mistakes!
        'who is watching', 'who can watch', 'hit like',
        '2024', '2025', '2026', 'freshers', 'mid sem', 'end sem'
    ];

    // Regex to detect standard timestamp formats (e.g., 10:15 or 1:04:30)
    const timestampRegex = /\d{1,2}:\d{2}(:\d{2})?/g;

    const cleanComments = comments.filter(comment => {
        const lowerCaseComment = comment.toLowerCase();

        // Rule 1: Drop extremely short comments (under 15 characters)
        if (comment.length < 15) return false;

        // Rule 2: Drop comments containing any blacklisted phrases
        const isBanned = bannedPhrases.some(phrase => lowerCaseComment.includes(phrase));
        if (isBanned) return false;

        // Rule 3: Drop Timestamp Dumps 
        // If a comment has 3 or more timestamps, it's just an index/menu, not a real review.
        const timestampCount = (comment.match(timestampRegex) || []).length;
        if (timestampCount >= 3) return false;

        // Rule 4: Drop URL spam
        if (comment.includes("http://") || comment.includes("https://")) return false;

        // If it survives all the rules, it's a high-quality comment!
        return true;
    });

    return cleanComments;
};

module.exports = { filterComments };