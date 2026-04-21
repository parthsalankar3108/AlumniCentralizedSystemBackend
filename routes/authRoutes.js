import express from "express"
import { signup, login, updateProfile, getProfile, getAllProfile, getProfileById } from "../controllers/authController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import { get } from "mongoose"
const router = express.Router()


router.post("/signup", signup)
router.post("/login", login)
router.get("/profile",authMiddleware, getProfile)
router.get("/allprofile", getAllProfile)
router.patch("/profile",authMiddleware, updateProfile)
router.get("/profile/:id", getProfileById)

export default router