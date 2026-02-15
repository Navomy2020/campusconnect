import pool from "../db.js";

export const getLeaderboard = async (req, res) => {
  try {
    const { department } = req.query;

    let query = `
      SELECT id, name, department, semester, points
      FROM users
    `;

    let values = [];

    if (department) {
      query += " WHERE department = ?";
      values.push(department);
    }

    query += " ORDER BY points DESC";

    const [users] = await pool.query(query, values);

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
