const postService = require('../services/postService');
const User = require('../../models/user');
const Post = require('../../models/post');

exports.createPost = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }
    const userId = req.session.userId;
    const username = req.session.name;

    const { title, body } = req.body;
    const file = req.file;

    const mediaUrl = file?.path || null;
    const mediaType = file?.mimetype?.startsWith('video/') ? 'video' : (file ? 'image' : null);

    const newPost = await postService.createPost({
      title,
      body,
      mediaUrl,
      mediaType,
      userId,
      username
    });

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Server error while creating post' });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    // Extract query parameters
    const page   = parseInt(req.query.page) || 1;
    const limit  = parseInt(req.query.limit) || 5;
    const sort   = req.query.sort;
    const filter = req.query.filter;
    const search = req.query.q;

    const posts = await postService.fetchPosts({
      page, limit, sort, filter, search,
      userId: req.session?.userId || null
    });

    // Get user avatar
    await Post.populate(posts, { path: 'userId', select: 'avatar' });

    res.json(posts);
  } catch (err) {
    console.error('Failed to fetch posts:', err);
    res.status(500).json({ error: 'Server error while fetching posts' });
  }
};

exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Not logged in' });

    try {
      const user = await User.findById(userId).populate('savedPosts');
      res.json(user.savedPosts);
    } catch (err) {
      console.error('Failed to fetch saved posts:', err);
      res.status(500).json({ error: 'Server error' });
    }
  } catch (err) {
    console.error('Error fetching saved posts:', err);
    res.status(500).json({ error: 'Failed to fetch saved posts' });
  }
};