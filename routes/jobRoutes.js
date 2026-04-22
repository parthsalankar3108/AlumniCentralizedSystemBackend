import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createJob, getJobs, deleteJob } from "../controllers/jobController.js";

const router = express.Router();

router.post("/", authMiddleware, createJob);
router.get("/", getJobs);
router.delete("/:id", authMiddleware, deleteJob);

export default router;
