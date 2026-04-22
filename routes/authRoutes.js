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
  getRequests,
  respondRequest,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { get } from "mongoose";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.get("/allprofile", getAllProfile);
router.patch("/profile", authMiddleware, updateProfile);
router.get("/profile/:id", getProfileById);
router.patch("/approve/:id", updateApproval);
router.post("/connect", authMiddleware, sendRequest);
router.get("/connect/requests", authMiddleware, getRequests);
router.patch("/connect/respond", authMiddleware, respondRequest);

export default router;
