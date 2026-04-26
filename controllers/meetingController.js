import Meeting from "../models/Meeting.js";
import crypto from "crypto";
import User from "../models/User.js";

// ================= CREATE =================
export const createMeeting = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, proposedTime, message } = req.body;

    const existing = await Meeting.findOne({
      senderId,
      receiverId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ error: "Request already sent" });
    }

    const meeting = await Meeting.create({
      senderId,
      receiverId,
      proposedTime,
      message,
    });

    res.json(meeting);
  } catch {
    res.status(500).json({ error: "Failed to create meeting" });
  }
};

// ================= RECEIVED =================
export const getReceivedMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      receiverId: req.user.id,
    }).populate("senderId", "name email");

    res.json(meetings);
  } catch {
    res.status(500).json({ error: "Failed to fetch received meetings" });
  }
};

// ================= SENT =================
export const getSentMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      senderId: req.user.id,
    }).populate("receiverId", "name email");

    res.json(meetings);
  } catch {
    res.status(500).json({ error: "Failed to fetch sent meetings" });
  }
};

// ================= ACCEPT =================
export const acceptMeeting = async (req, res) => {
  try {
    const { meetingId } = req.body;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) return res.status(404).json({ error: "Meeting not found" });

    if (meeting.receiverId.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    const roomId = crypto.randomBytes(8).toString("hex");

    meeting.status = "confirmed";
    meeting.confirmedTime = meeting.proposedTime;
    meeting.roomId = roomId;

    await meeting.save();

    res.json(meeting);
  } catch {
    res.status(500).json({ error: "Failed to accept meeting" });
  }
};

// ================= REJECT =================
export const rejectMeeting = async (req, res) => {
  try {
    const { meetingId } = req.body;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) return res.status(404).json({ error: "Meeting not found" });

    if (meeting.receiverId.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    meeting.status = "rejected";

    await meeting.save();

    res.json({ message: "Meeting rejected" });
  } catch {
    res.status(500).json({ error: "Failed to reject meeting" });
  }
};

// ================= RESCHEDULE =================
export const rescheduleMeeting = async (req, res) => {
  try {
    const { meetingId, newTime } = req.body;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) return res.status(404).json({ error: "Meeting not found" });

    if (meeting.receiverId.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    meeting.status = "rescheduled";
    meeting.proposedTime = newTime;

    await meeting.save();

    res.json(meeting);
  } catch {
    res.status(500).json({ error: "Failed to reschedule" });
  }
};

// ================= CONFIRM RESCHEDULE =================
export const confirmReschedule = async (req, res) => {
  try {
    const { meetingId } = req.body;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) return res.status(404).json({ error: "Meeting not found" });

    if (meeting.senderId.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    const roomId = crypto.randomBytes(8).toString("hex");

    meeting.status = "confirmed";
    meeting.confirmedTime = meeting.proposedTime;
    meeting.roomId = roomId;

    await meeting.save();

    res.json(meeting);
  } catch {
    res.status(500).json({ error: "Failed to confirm reschedule" });
  }
};

// ================= UPCOMING =================
export const getUpcomingMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      status: "confirmed",
      $or: [
        { senderId: req.user.id },
        { receiverId: req.user.id },
      ],
    }).sort({ confirmedTime: 1 });

    res.json(meetings);
  } catch {
    res.status(500).json({ error: "Failed to fetch upcoming meetings" });
  }
};

// ================= TOKEN (NO ZEGO HERE) =================
export const getMeetingAccess = async (req, res) => {
  try {
    const { roomId } = req.params;
    const us = await User.findById(req.user.id)

    const meeting = await Meeting.findOne({ roomId });

    if (!meeting || meeting.status !== "confirmed") {
      return res.status(400).json({ error: "Invalid meeting" });
    }

    // Only participants allowed
    if (
      meeting.senderId.toString() !== req.user.id &&
      meeting.receiverId.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Time restriction (5 min before)
    const now = new Date();
    const allowedTime = new Date(
      meeting.confirmedTime.getTime() - 5 * 60000
    );

    if (now < allowedTime) {
      return res.status(403).json({ error: "Too early to join" });
    }

    res.json({
      roomId: meeting.roomId,
      userID: req.user.id,
      userName: us.name || "User_" + req.user.id.slice(-4),
    });

  } catch (err) {
    console.log(err); // IMPORTANT for debugging
    res.status(500).json({ error: "Failed to get access" });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // Only sender can delete
    if (meeting.senderId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await meeting.deleteOne();

    res.json({ message: "Request revoked" });
  } catch {
    res.status(500).json({ error: "Failed to delete" });
  }
};