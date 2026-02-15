import pool from "../db.js";

// ================= POST ANSWER =================
export const postAnswer = async (req, res) => {
  try {
    const { question_id,  answer_text } = req.body;
    const user_id=req.user.id;
    if (!question_id || !user_id || !answer_text) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if question exists
    const [questions] = await pool.query(
      "SELECT is_solved FROM questions WHERE id = ?",
      [question_id]
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Prevent answering solved question
    if (questions[0].is_solved) {
      return res.status(403).json({
        message: "Cannot answer a solved question"
      });
    }

    // Insert answer
    await pool.query(
      "INSERT INTO answers (question_id, user_id, answer_text) VALUES (?, ?, ?)",
      [question_id, user_id, answer_text]
    );

    res.status(201).json({ message: "Answer posted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const acceptAnswer = async (req, res) => {
  try {
    const { id } = req.params;
const user_id = req.user.id;


    // Get answer details
    const [answers] = await pool.query(
      "SELECT question_id, user_id FROM answers WHERE id = ?",
      [id]
    );

    if (answers.length === 0) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const question_id = answers[0].question_id;
    const answerOwnerId = answers[0].user_id;

    // Get question details
    const [questions] = await pool.query(
      "SELECT user_id, is_solved FROM questions WHERE id = ?",
      [question_id]
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    const questionOwnerId = questions[0].user_id;

    // Only question owner can accept
    if (questionOwnerId !== user_id) {
      return res.status(403).json({
        message: "Only question owner can accept answer"
      });
    }

    // Prevent accepting twice
    if (questions[0].is_solved) {
      return res.status(400).json({
        message: "Question already solved"
      });
    }

    // Start transaction
    await pool.query("START TRANSACTION");

    // Mark answer as accepted
    await pool.query(
      "UPDATE answers SET is_accepted = TRUE WHERE id = ?",
      [id]
    );

    // Mark question as solved
    await pool.query(
      "UPDATE questions SET is_solved = TRUE, solved_answer_id = ? WHERE id = ?",
      [id, question_id]
    );

    // Award points (10 points example)
    await pool.query(
      "UPDATE users SET points = points + 10 WHERE id = ?",
      [answerOwnerId]
    );

    await pool.query("COMMIT");

    res.status(200).json({
      message: "Answer accepted and points awarded"
    });

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

