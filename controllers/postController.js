import Post from "../models/Post.js";

const createPost = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await Post.create({
      author: req.user.id,
      title,
      description,
      image,
    });

    const populated = await post.populate("author", "name");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
};

const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ author: userId })
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : post.image;

    const updated = await Post.findByIdAndUpdate(
      id,
      { title, description, image },
      { new: true }
    ).populate("author", "name");

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update post" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: "Post deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete post" });
  }
};

export { createPost, getPostsByUser, getAllPosts, updatePost, deletePost };
