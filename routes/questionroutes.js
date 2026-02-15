import express from "express";
import { createQuestion, getAllQuestions, getQuestionById } from "../controllers/questioncontroller.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", protect, createQuestion);
router.get("/", getAllQuestions);
router.get("/:id", getQuestionById);

export default router;
