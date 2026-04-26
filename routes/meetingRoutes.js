import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createMeeting,
  getReceivedMeetings,
  getSentMeetings,
  acceptMeeting,
  rejectMeeting,
  rescheduleMeeting,
  confirmReschedule,
  getUpcomingMeetings,
  getMeetingAccess,
  deleteMeeting,
} from "../controllers/meetingController.js";

const router = express.Router();

router.post("/create", authMiddleware, createMeeting);

router.get("/received", authMiddleware, getReceivedMeetings);
router.get("/sent", authMiddleware, getSentMeetings);

router.post("/accept", authMiddleware, acceptMeeting);
router.post("/reject", authMiddleware, rejectMeeting);
router.post("/reschedule", authMiddleware, rescheduleMeeting);
router.post("/confirm", authMiddleware, confirmReschedule);
router.delete("/:id", authMiddleware, deleteMeeting);

router.get("/upcoming", authMiddleware, getUpcomingMeetings);

router.get("/access/:roomId", authMiddleware, getMeetingAccess);

export default router;