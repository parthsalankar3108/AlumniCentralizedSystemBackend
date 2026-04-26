import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "rejected", "rescheduled"],
    default: "pending",
  },
  proposedTime: {
    type: Date,
    required: true,
  },
  confirmedTime: {
    type: Date,
  },
  roomId: {
    type: String,
  },
  message: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Meeting", meetingSchema);