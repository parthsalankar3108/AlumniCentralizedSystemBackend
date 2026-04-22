import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    mode: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "internship"],
    },
    description: { type: String },
    applyLink: { type: String },
    contact: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("Job", jobSchema);
