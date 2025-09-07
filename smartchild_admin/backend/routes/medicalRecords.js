import { Router } from "express";
import { pool } from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// ---------- upload dir ----------
const UPLOAD_DIR = path.join(process.cwd(), "uploads/medical-records");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---------- multer ----------
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// helpers
const relPath = (p) => p ? p.replace(process.cwd() + path.sep, "").replace(/\\/g, "/") : null;
const delIfExists = (p) => {
  try {
    if (!p) return;
    const abs = path.join(process.cwd(), p);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {}
};

// ===================== ROUTES =====================

// Quick child lookup (id → name,email,dob)
// NOTE: you can also use your existing /children/:id endpoint; this is here for convenience.
router.get("/child/:childId", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT child_id, first_name, last_name, email, dob FROM children WHERE child_id=?",
      [req.params.childId]
    );
    if (!rows.length) return res.status(404).json({ message: "Child not found" });
    const c = rows[0];
    res.json({
      child_id: c.child_id,
      name: `${c.first_name} ${c.last_name}`,
      email: c.email,
      dob: c.dob
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Create medical record
router.post(
  "/",
  upload.single("attachment"),
  async (req, res) => {
    try {
      const { child_id, visit_date, doctor_name, diagnosis, treatment, prescription, notes } = req.body;
      if (!child_id || !visit_date || !doctor_name) {
        return res.status(400).json({ message: "child_id, visit_date, doctor_name are required" });
      }

      const attachment = relPath(req.file?.path);

      const [r] = await pool.execute(
        `INSERT INTO medical_records
         (child_id, visit_date, doctor_name, diagnosis, treatment, prescription, notes, attachment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [child_id, visit_date, doctor_name, diagnosis || null, treatment || null, prescription || null, notes || null, attachment]
      );

      res.status(201).json({ record_id: r.insertId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// List records (with child info + filters + pagination)
router.get("/", async (req, res) => {
  try {
    const { child_id = "", q = "", page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = [];
    const args = [];

    if (child_id) { where.push("mr.child_id = ?"); args.push(child_id); }
    if (q) { where.push("(mr.doctor_name LIKE ? OR mr.diagnosis LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)");
             args.push(`%${q}%`,`%${q}%`,`%${q}%`,`%${q}%`); }

    const W = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [items] = await pool.query(
      `SELECT mr.*, c.first_name, c.last_name, c.email, c.dob
       FROM medical_records mr
       JOIN children c ON c.child_id = mr.child_id
       ${W}
       ORDER BY mr.visit_date DESC, mr.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...args, Number(limit), offset]
    );

    const [[{ count }]] = await pool.query(
      `SELECT COUNT(*) count
       FROM medical_records mr
       JOIN children c ON c.child_id = mr.child_id
       ${W}`, args
    );

    res.json({ items, total: count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Get one record with child info
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT mr.*, c.first_name, c.last_name, c.email, c.dob
       FROM medical_records mr
       JOIN children c ON c.child_id = mr.child_id
       WHERE mr.record_id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    const r = rows[0];
    res.json({
      ...r,
      child_name: `${r.first_name} ${r.last_name}`
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Update record (replace attachment if provided)
router.put("/:id", upload.single("attachment"), async (req, res) => {
  try {
    const id = req.params.id;

    const [prev] = await pool.execute("SELECT attachment FROM medical_records WHERE record_id=?", [id]);
    if (!prev.length) return res.status(404).json({ message: "Not found" });

    const { child_id, visit_date, doctor_name, diagnosis, treatment, prescription, notes } = req.body;
    const newAttachment = relPath(req.file?.path);

    await pool.execute(
      `UPDATE medical_records SET
         child_id = COALESCE(?, child_id),
         visit_date = COALESCE(?, visit_date),
         doctor_name = COALESCE(?, doctor_name),
         diagnosis = COALESCE(?, diagnosis),
         treatment = COALESCE(?, treatment),
         prescription = COALESCE(?, prescription),
         notes = COALESCE(?, notes),
         attachment = COALESCE(?, attachment)
       WHERE record_id = ?`,
      [child_id || null, visit_date || null, doctor_name || null, diagnosis || null,
       treatment || null, prescription || null, notes || null, newAttachment || null, id]
    );

    if (newAttachment && prev[0].attachment) delIfExists(prev[0].attachment);

    res.json({ message: "Updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.execute("SELECT attachment FROM medical_records WHERE record_id=?", [id]);
    await pool.execute("DELETE FROM medical_records WHERE record_id=?", [id]);
    if (rows?.[0]?.attachment) delIfExists(rows[0].attachment);
    res.json({ message: "Deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
