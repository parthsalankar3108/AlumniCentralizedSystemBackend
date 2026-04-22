import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const SECRET = "secretkey";

const signup = async (req, res) => {
  const { name, email, password, department, graduationYear, about, role } =
    req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
    department,
    graduationYear,
    about,
    role,
  });
  res.json(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  console.log(email);

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, email: user.email }, SECRET);
  res.json({ token });
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const getAllProfile = async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      about,
      department,
      graduationYear,
      education,
      experience,
      currentdetails,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(about && { about }),
        ...(department && { department }),
        ...(graduationYear && { graduationYear }),
        ...(education && { education }),
        ...(experience && { experience }),
        ...(currentdetails && { currentdetails }),
      },
      { new: true },
    ).select("-password");

    res.json(updatedUser);
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};

const updateApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isApproved: status },
      { returnDocument: "after" },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to update status" });
  }
};

const sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    await User.findByIdAndUpdate(senderId, {
      $push: {
        connections: {
          userId: receiverId,
          status: "pending",
        },
      },
    });

    await User.findByIdAndUpdate(receiverId, {
      $push: {
        connections: {
          userId: senderId,
          status: "pending",
        },
      },
    });

    res.json({ message: "Request sent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send request" });
  }
};

const getRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "connections.userId",
      "name email",
    );

    res.json(user.connections);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

const respondRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user.id;

    await User.updateOne(
      { _id: receiverId, "connections.userId": senderId },
      {
        $set: { "connections.$.status": "accepted" },
      },
    );

    await User.updateOne(
      { _id: senderId, "connections.userId": receiverId },
      {
        $set: { "connections.$.status": "accepted" },
      },
    );

    res.json({ message: "Connection accepted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to accept request" });
  }
};

export {
  login,
  signup,
  getProfile,
  updateProfile,
  getAllProfile,
  getProfileById,
  updateApproval,
  sendRequest,
  getRequests,
  respondRequest,
};
