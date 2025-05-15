const Post = require('../../models/post');
const User = require('../../models/User');

exports.createPost = async ({ title, body, mediaUrl, mediaType, userId, username }) => {
  const post = new Post({
    title,
    body,
    mediaUrl,
    mediaType,
    userId,
    username
  });

  return await post.save();
};

// Fetch Posts with pagination, sorting, filtering, and optional search
exports.fetchPosts = async ({ page, limit, sort, filter, search, userId }) => {
  // Calculate how many documents to skip for pagination
  const skip = (page - 1) * limit;
  // Determine sort order: by likes or by creation date
  const sortOption = sort === 'likes' ? { likes: -1 } : { createdAt: -1 };

  // Parse filter tags (comma-separated list)
  const filters = filter
    ? filter.split(',').map(f => f.trim().toLowerCase())
    : [];

  const filterQuery = {};

  // If filters are provided, match POIs with any of the specified tags
  if (filters.length > 0) {
    filterQuery.tags = { $in: filters };
  }

  const posts = await Post.find(filterQuery)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)

  // Add isSaved flag if logged in
  if (userId) {
    const user = await User.findById(userId);
    const savedSet = new Set(user.savedPosts.map(p => p.toString()));
    posts.forEach(post => {
      post.isSaved = savedSet.has(post._id.toString());
    });
  }

  return posts;
};
