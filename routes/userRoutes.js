import express from "express";

import User from "../models/User.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();


router.post("/register", async(req,res)=>{
  try {

    const existing =
      await User.findOne({
        firebaseUid:req.body.firebaseUid
      });

    if(existing){
      return res.json(existing);
    }

    const user = await User.create(req.body);

    res.status(201).json(user);

  } catch (error) {
    res.status(500).json({
      message:"Registration failed"
    });
  }
});

router.get("/", async(req,res)=>{
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message:"Fetch failed"
    });
  }
});

router.get("/profile/:uid", async(req,res)=>{
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid });
    // console.log("Fetched user:", user);
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message:"Fetch failed"
    });
  }
});

router.get("/profile/me", verifyToken, async(req,res)=>{
  try {

    const user =
      await User.findOne({
        firebaseUid:req.user.uid
      });

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message:"Profile failed"
    });
  }
});

router.get("/:uid", async (req, res) => {
  try {

    const user = await User.findOne({
      firebaseUid: req.params.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found in DB",
      });
    }

    res.json(user);

  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      message: "Fetch failed",
    });
  }
});

router.patch("/toggle-approve/:uid/:remark", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isApproved = req.params.remark;
    await user.save();

    res.json({
      message: "Approval toggled",
      isApproved: user.isApproved,
      user,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Toggle failed" });
  }
});

router.put("/update/:uid", async (req, res) => {
  try {
    const {
      about,
      department,
      graduationYear,
      education,
      experience,
      currentdetails,
      fullName,
      profileImg,
      isApproved,
      role,
    } = req.body;

    console.log("Update request body:", req.body);

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      {
        $set: {
          fullName,
          about,
          department,
          graduationYear,
          role,
          profileImg,
          isApproved,
          currentdetails,
        },

        $set:{
          experience: experience,
        education: education,
      }
      },
      { returnDocument: "after" }
    );

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Update failed" });
  }
});


// FOLLOW
router.post("/follow/:myId/:targetId", async (req, res) => {
  try {
    const me = await User.findOne({
      firebaseUid: req.params.myId,
    });

    const target = await User.findOne({
      firebaseUid: req.params.targetId,
    });

    if (!me || !target) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyFollowing = me.following.includes(target._id);

    if (!alreadyFollowing) {
      me.following.push(target._id);
      target.followers.push(me._id);

      await me.save();
      await target.save();
    }

    res.json({
      message: "Followed Successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Follow failed",
    });
  }
});


// CONNECT
router.post("/connect/:myId/:targetId", async (req, res) => {
  try {
    const me = await User.findOne({
      firebaseUid: req.params.myId,
    });

    const target = await User.findOne({
      firebaseUid: req.params.targetId,
    });

    if (!me || !target) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyConnected = me.connections.includes(target.firebaseUid);

    if (!alreadyConnected) {
      me.connections.push(target.firebaseUid);
      target.connections.push(me.firebaseUid);

      await me.save();
      await target.save();
    }

    res.json({
      message: "Connected Successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Connection failed",
    });
  }
});

export default router;