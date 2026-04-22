import mongoose, { connections } from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String },
  graduationYear: { type: Number, required: true },
  about: {type:String},
  role:{
    type:String,
    enum: ["student", "alumni", "admin"],
    default: "student"
  },
  isApproved: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  education: [
    {
      institution: String,
      course: String,
      branch: String,
      status: {
        type: String,
        enum: ["completed", "in-progress"],
        default: "in-progress",
      },
      yearofPassing: String,
    },
  ],

  experience: [
    {
      company: String,
      designation: String,
      description: String,
      startDate: Date,
      endDate: Date,
      currentlyWorking: Boolean,
    },
  ],

  currentdetails: {
    company: String,
    designation: String,
    role: String,
    location: String,
    joinedOn: Date,
  },

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  connections: [
    {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  ],
});

// sample json data
// {
//   "name": "John Doe",
//   "email": "john.doe@example.com",
//   "password": "password123",
//   "department": "Computer Science",
//   "graduationYear": 2024
// }

export default mongoose.model("User", userSchema);
