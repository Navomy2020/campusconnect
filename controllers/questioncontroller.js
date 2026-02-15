import pool from "../db.js";

export const createQuestion = async (req, res) => {
  try {
    const { title, description, domain } = req.body;
    const user_id = req.user.id;


    if (!title || !description || !domain || !user_id) {
      return res.status(400).json({ message: "All fields are required" });
    }
    await pool.query(
      `INSERT INTO questions 
      (title, description,category, user_id) 
      VALUES (?, ?, ?, ?)`,
      [title, description, domain, user_id]
    );

    res.status(201).json({ message: "Question created successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getAllQuestions = async (req, res) => {
  try {
    const { category, difficulty } = req.query;

    let query = `
      SELECT q.*, u.name 
      FROM questions q
      JOIN users u ON q.user_id = u.id
    `;

    let conditions = [];
    let values = [];

    if (category) {
      conditions.push("q.category = ?");
      values.push(category);
    }

    if (difficulty) {
      conditions.push("q.difficulty = ?");
      values.push(difficulty);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY q.created_at DESC";

    const [rows] = await pool.query(query, values);

    res.status(200).json(rows);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get question
    const [questions] = await pool.query(
      `SELECT q.*, u.name 
       FROM questions q
       JOIN users u ON q.user_id = u.id
       WHERE q.id = ?`,
      [id]
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Get answers for that question
    const [answers] = await pool.query(
      `SELECT a.*, u.name 
       FROM answers a
       JOIN users u ON a.user_id = u.id
       WHERE a.question_id = ?
       ORDER BY a.created_at ASC`,
      [id]
    );

    res.status(200).json({
      question: questions[0],
      answers: answers
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

