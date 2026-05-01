import express from "express";
import multer from "multer";
import path from "path";
import { createPost, getPostsByUser, getAllPosts, updatePost, deletePost } from "../controllers/postController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), createPost);
router.get("/", getAllPosts);
router.get("/user/:userId", getPostsByUser);
router.patch("/:id", authMiddleware, upload.single("image"), updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;
