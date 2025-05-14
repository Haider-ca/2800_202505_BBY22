const Post = require('../../models/post');

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

// // Fetch POIs with pagination, sorting, filtering, and optional search
// exports.fetchPOIs = async ({ page, limit, sort, filter, search }) => {
//   // Calculate how many documents to skip for pagination
//   const skip = (page - 1) * limit;
//   // Determine sort order: by likes or by creation date
//   const sortOption = sort === 'likes' ? { likes: -1 } : { createdAt: -1 };

//   // Parse filter tags (comma-separated list)
//   const filters = filter
//     ? filter.split(',').map(f => f.trim().toLowerCase())
//     : [];

//   const filterQuery = {};

//   // If filters are provided, match POIs with any of the specified tags
//   if (filters.length > 0) {
//     filterQuery.tags = { $in: filters };
//   }

//   // If search term is provided, perform a case-insensitive search in title or description
//   if (search) {
//     filterQuery.$or = [
//       { title: { $regex: search, $options: 'i' } },
//       { description: { $regex: search, $options: 'i' } },
//     ];
//   }

//   // Execute query
//   return await POI.find(filterQuery)
//     .sort(sortOption)
//     .skip(skip)
//     .limit(limit);
// };