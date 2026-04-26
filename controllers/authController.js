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

    const user = await User.findById(id).select("-password")
    .populate("followers", "name profileImage") // 👈 THIS IS KEY
      .populate("following", "name profileImage");

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
    // const userId = req.user.id;
    const userId = "69e8b8844e216bf49ebd0e1d";

    const {
      name,
      about,
      department,
      graduationYear,
      skills,
      interests,
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
        ...(skills && {skills}),
        ...(interests && {interests}),
        ...(education && { education }),
        ...(experience && { experience }),
        ...(currentdetails && { currentdetails })
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

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ error: "Cannot connect to yourself" });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔍 check existing connection
    const already = sender.connections.find(
      (c) => c.userId.toString() === receiverId.toString(),
    );

    if (already) {
      if (already.status === "pending") {
        return res.status(400).json({ error: "Request already sent" });
      }
      if (already.status === "accepted") {
        return res.status(400).json({ error: "Already connected" });
      }
    }

    sender.connections.push({
      userId: receiverId,
      status: "pending",
      type: "sent",
    });

    receiver.connections.push({
      userId: senderId,
      status: "pending",
      type: "received",
    });

    await sender.save();
    await receiver.save();

    res.json({ message: "Request sent" });
  } catch (err) {
    console.log(err);
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

const getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "connections.userId",
      "name email",
    );

    const pending = user.connections.filter((c) => c.status === "pending");

    const accepted = user.connections.filter((c) => c.status === "accepted");

    res.json({ pending, accepted });
  } catch {
    res.status(500).json({ error: "Failed to fetch connections" });
  }
};

const respondRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { senderId, action } = req.body;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    const userConn = user.connections.find(
      (c) =>
        c.userId.toString() === senderId.toString() &&
        c.type === "received" // 🔥 ONLY RECEIVER CAN RESPOND
    );

    if (!userConn) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const senderConn = sender.connections.find(
      (c) => c.userId.toString() === userId.toString()
    );

    if (action === "accepted") {
      userConn.status = "accepted";
      senderConn.status = "accepted";
    }

    if (action === "rejected") {
      user.connections = user.connections.filter(
        (c) => c.userId.toString() !== senderId.toString()
      );

      sender.connections = sender.connections.filter(
        (c) => c.userId.toString() !== userId.toString()
      );
    }

    await user.save();
    await sender.save();

    res.json({ message: `Request ${action}` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to respond" });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const connectionIds = currentUser.connections.map((c) =>
      c.userId.toString()
    );

    // 🔥 BUILD SMART FILTER DYNAMICALLY
    const orConditions = [];

    if (currentUser.department) {
      orConditions.push({ department: currentUser.department });
    }

    if (currentUser.currentdetails?.role) {
      orConditions.push({
        "currentdetails.role": currentUser.currentdetails.role,
      });
    }

    if (currentUser.skills?.length > 0) {
      orConditions.push({ skills: { $in: currentUser.skills } });
    }

    if (currentUser.interests?.length > 0) {
      orConditions.push({ interests: { $in: currentUser.interests } });
    }

    // 🔥 FETCH CANDIDATES (BOOSTED FILTER)
    const candidates = await User.find({
      _id: { $nin: [...connectionIds, userId] },
      ...(orConditions.length > 0 && { $or: orConditions }),
    })
      .select("name email department graduationYear skills interests currentdetails")
      .limit(100);

    // 🔥 SCORING FUNCTION
    const calculateScore = (user, candidate) => {
      let score = 0;

      if (user.department === candidate.department) score += 5;

      if (user.graduationYear === candidate.graduationYear) score += 3;

      if (
        user.currentdetails?.role &&
        user.currentdetails.role === candidate.currentdetails?.role
      )
        score += 4;

      if (
        user.currentdetails?.company &&
        user.currentdetails.company === candidate.currentdetails?.company
      )
        score += 6;

      // 🔥 SKILL MATCH (case insensitive)
      const userSkills = (user.skills || []).map((s) => s.toLowerCase());
      const candidateSkills = (candidate.skills || []).map((s) =>
        s.toLowerCase()
      );

      const skillMatch = userSkills.filter((s) =>
        candidateSkills.includes(s)
      );

      score += skillMatch.length * 3;

      // 🔥 INTEREST MATCH
      const userInterests = (user.interests || []).map((i) =>
        i.toLowerCase()
      );
      const candidateInterests = (candidate.interests || []).map((i) =>
        i.toLowerCase()
      );

      const interestMatch = userInterests.filter((i) =>
        candidateInterests.includes(i)
      );

      score += interestMatch.length * 2;

      return score;
    };

    // 🔥 RANKING
    const ranked = candidates
      .map((c) => ({
        user: c,
        score: calculateScore(currentUser, c),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json(ranked);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
};

const followUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { receiverId } = req.body;

    if (currentUserId === receiverId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const receiverUser = await User.findById(receiverId);

    if (!receiverUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(receiverId);

    if (isFollowing) {
      // 🔴 UNFOLLOW
      currentUser.following.pull(receiverId);
      receiverUser.followers.pull(currentUserId);

      await currentUser.save();
      await receiverUser.save();

      return res.json({ message: "Unfollowed successfully", following: false });
    } else {
      // 🟢 FOLLOW
      currentUser.following.push(receiverId);
      receiverUser.followers.push(currentUserId);

      await currentUser.save();
      await receiverUser.save();

      return res.json({ message: "Followed successfully", following: true });
    }
  } catch {
    res.status(500).json({ error: "Follow action failed" });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { receiverId } = req.body;

    const currentUser = await User.findById(currentUserId);
    const receiverUser = await User.findById(receiverId);

    if (!receiverUser) {
      return res.status(404).json({ error: "User not found" });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== receiverId
    );

    receiverUser.followers = receiverUser.followers.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await receiverUser.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to unfollow user" });
  }
};

const checkFollowStatus = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { receiverId } = req.query;

    const currentUser = await User.findById(currentUserId);

    const isFollowing = currentUser.following.includes(receiverId);

    res.json({ isFollowing });
  } catch {
    res.status(500).json({ error: "Failed to check status" });
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
  getConnections,
  respondRequest,
  getSuggestions,
  followUser,
  unfollowUser,
  checkFollowStatus
};
