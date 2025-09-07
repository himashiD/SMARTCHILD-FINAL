import { pool } from "../db.js";

// Get list of all notices
export const listNotices = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT notice_id, notice_image, notice_title, notice_description,
              notice_date, notice_start_time, notice_end_time, notice_venue
       FROM notices
       ORDER BY notice_date DESC, notice_id DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch notices", details: e.message });
  }
};

// Get a specific notice by ID
export const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[row]] = await pool.query(
      `SELECT notice_id, notice_image, notice_title, notice_description,
              notice_date, notice_start_time, notice_end_time, notice_venue
       FROM notices WHERE notice_id = ?`,
      [id]
    );
    if (!row) return res.status(404).json({ error: "Notice not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch notice", details: e.message });
  }
};
