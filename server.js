import express from "express";
import cors from "cors";
import pool from "./db.js";
import questionroutes from "./routes/questionroutes.js";
import answerRoutes from "./routes/answerroutes.js";
import leaderboardRoutes from "./routes/leaderboardroutes.js";
import authRoutes from "./routes/authroutes.js"
import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/leaderboard", leaderboardRoutes);


app.use("/answers", answerRoutes);


app.use("/questions", questionroutes);




// Middleware


// Test route
app.get("/", (req, res) => {
  res.send("CampusConnect Backend Running");
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1");
    res.json({ message: "Database connected successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database connection failed" });
  }
});
