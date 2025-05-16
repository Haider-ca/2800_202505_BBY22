const Post = require('../../models/post');
const User = require('../../models/user');

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

// Fetch All posts with pagination, sorting, filtering, and optional search
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

  // If filters are provided, match posts with any of the specified tags
  if (filters.length > 0) {
    filterQuery.tags = { $in: filters };
  }

  // If search term is provided, perform a case-insensitive search in title or body
  if (search) {
    filterQuery.$or = [
      { title: { $regex: search, $options: 'i' } },
      { body:  { $regex: search, $options: 'i' } }
    ];
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

// Fetch saved posts with pagination, sorting, filtering, and optional search
exports.fetchSavedPosts = async ({ userId, page, limit, sort, search }) => {
  const user = await User.findById(userId);
  const savedPostIds = user.savedPosts || [];
  const skip = (page - 1) * limit;
  const sortOption = sort === 'likes' ? { likes: -1 } : { createdAt: -1 };

  const query = { _id: { $in: savedPostIds } };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { body: { $regex: search, $options: 'i' } }
    ];
  }

  const posts = await Post.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean();

  await Post.populate(posts, { path: 'userId', select: 'avatar' });

  // Mark saved flag
  const savedSet = new Set(savedPostIds.map(p => p.toString()));
  posts.forEach(post => {
    post.isSaved = savedSet.has(post._id.toString());
  });

  return posts;
};
