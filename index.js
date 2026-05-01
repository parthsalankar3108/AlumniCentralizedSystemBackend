import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import dotenv from "dotenv";
import morgan from "morgan";


dotenv.config();

const app = express();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use("/uploads", express.static(uploadsDir));

app.use("/auth", authRoutes);
app.use("/user", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/meetings", meetingRoutes);
app.use("/posts", postRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`),
);
