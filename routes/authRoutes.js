import express from "express";
import {
  signup,
  login,
  updateProfile,
  getProfile,
  getAllProfile,
  getProfileById,
  updateApproval,
  sendRequest,
  respondRequest,
  getConnections,
  getSuggestions,
  followUser,
  unfollowUser,
  checkFollowStatus,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { get } from "mongoose";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.get("/allprofile", getAllProfile);
router.patch("/profile",  updateProfile);
router.get("/profile/:id", getProfileById);
router.get("/suggestions", authMiddleware, getSuggestions);
router.patch("/approve/:id", updateApproval);
router.post("/connect", authMiddleware, sendRequest);
router.get("/connect/requests", authMiddleware, getConnections);
router.patch("/connect/respond", authMiddleware, respondRequest);
router.post("/follow", authMiddleware, followUser);
router.post("/unfollow", authMiddleware, unfollowUser);
router.get("/followstatus", authMiddleware, checkFollowStatus);

export default router;
