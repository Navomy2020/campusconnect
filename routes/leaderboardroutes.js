import express from "express";
import { getLeaderboard } from "../controllers/leaderboardcontroller.js";

const router = express.Router();

router.get("/", getLeaderboard);

export default router;
