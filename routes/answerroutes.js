import express from "express";
import {
  postAnswer,
  acceptAnswer
} from "../controllers/answercontroller.js";
import { protect } from "../middleware/authmiddleware.js";
const router = express.Router();


// ================= POST ANSWER =================
// POST /answers
router.post("/",protect, postAnswer);


// ================= ACCEPT ANSWER =================
// POST /answers/:id/accept
// Only question owner can accept
router.post("/:id/accept",protect,acceptAnswer);


export default router;
