/**
 * postController.js
 * 
 * This controller handles all HTTP operations related to general (non-POI) community posts.
 * It manages post creation, retrieval, and fetching saved posts. All actions support JSON responses,
 * and login checks are applied where necessary.
 * 
 * Exported Functions:
 * - createPost: Handles creation of a new text or media post by a logged-in user.
 * - getAllPosts: Retrieves a paginated and optionally filtered/sorted list of general posts.
 * - getSavedPosts: Fetches posts saved by the current user.
 * 
 * Media uploads are processed via middleware before reaching this controller.
 */

const postService = require('../services/postService');
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort;
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort;
    const search = req.query.q;

    const posts = await postService.fetchSavedPosts({ userId, page, limit, sort, search });
    res.json(posts);

  } catch (err) {
    console.error('Error fetching saved posts:', err);
    res.status(500).json({ error: 'Failed to fetch saved posts' });
  }
};