import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /growth?child_id=123&page=1&limit=10
router.get("/", async (req, res) => {
  try {
    const { child_id, page = 1, limit = 10 } = req.query;
    if (!child_id) return res.status(400).json({ message: "child_id required" });

    const offset = (Number(page) - 1) * Number(limit);

    // get child info for header
    const [[child]] = await pool.query(
      "SELECT child_id, CONCAT(first_name,' ',last_name) AS name, email, dob FROM children WHERE child_id=?",
      [child_id]
    );

    // growth_data for child
    const [items] = await pool.query(
      `SELECT id, child_id, username, height, weight, bmi, insert_date
       FROM growth_data
       WHERE child_id=? ORDER BY insert_date DESC
       LIMIT ? OFFSET ?`,
      [child_id, Number(limit), offset]
    );

    const [[{ count }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM growth_data WHERE child_id=?",
      [child_id]
    );

    res.json({ child, items, total: count });
  } catch (e) {
    console.error("Growth API error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
