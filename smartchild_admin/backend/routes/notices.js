// backend/routes/notices.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db.js";

const router = Router();

// ensure uploads/
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

/* ---------- Validation helpers ---------- */
const isDateYMD = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isTimeHM = (s) => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d(?:[:][0-5]\d)?$/.test(s);
const toSeconds = (t) => {
  const [h,m,s] = t.split(":");
  return (+h)*3600 + (+m)*60 + (s ? +s : 0);
};

function validatePayload(b, forUpdate=false) {
  const errs = [];
  const required = ["notice_title","notice_date","notice_start_time","notice_end_time","notice_venue"];
  if (!forUpdate) {
    required.forEach(k => { if (!b[k]) errs.push(`${k} is required`); });
  }
  if (b.notice_date && !isDateYMD(b.notice_date)) errs.push("notice_date must be YYYY-MM-DD");
  if (b.notice_start_time && !isTimeHM(b.notice_start_time)) errs.push("notice_start_time must be HH:MM");
  if (b.notice_end_time && !isTimeHM(b.notice_end_time)) errs.push("notice_end_time must be HH:MM");
  if (b.notice_start_time && b.notice_end_time && isTimeHM(b.notice_start_time) && isTimeHM(b.notice_end_time)) {
    if (toSeconds(b.notice_end_time) <= toSeconds(b.notice_start_time)) {
      errs.push("notice_end_time must be after notice_start_time");
    }
  }
  return errs;
}

/* ---------- CRUD ---------- */

// List all notices
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM notices ORDER BY notice_date DESC, notice_start_time DESC");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get one
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM notices WHERE notice_id=?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create
router.post("/", upload.single("notice_image"), async (req, res) => {
  try {
    const b = req.body;
    const errs = validatePayload(b, false);
    if (errs.length) return res.status(400).json({ error: "Validation failed", details: errs });

    const img = req.file ? req.file.filename : null;

    const sql = `
      INSERT INTO notices
        (notice_image, notice_title, notice_description, notice_date, notice_start_time, notice_end_time, notice_venue)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      img,
      b.notice_title,
      b.notice_description || null,
      b.notice_date,
      b.notice_start_time,
      b.notice_end_time,
      b.notice_venue
    ];
    const [r] = await pool.query(sql, params);
    res.status(201).json({ message: "Notice created", id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update
router.put("/:id", upload.single("notice_image"), async (req, res) => {
  try {
    const id = req.params.id;

    const [curRows] = await pool.query("SELECT notice_image FROM notices WHERE notice_id=?", [id]);
    if (!curRows.length) return res.status(404).json({ error: "Not found" });

    const b = req.body;
    const errs = validatePayload(b, true);
    if (errs.length) return res.status(400).json({ error: "Validation failed", details: errs });

    let imageName = curRows[0].notice_image;
    if (req.file) {
      if (imageName) {
        const old = path.join(UPLOAD_DIR, imageName);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      imageName = req.file.filename;
    }

    const sql = `
      UPDATE notices
      SET notice_image=?, notice_title=?, notice_description=?, notice_date=?, notice_start_time=?, notice_end_time=?, notice_venue=?
      WHERE notice_id=?
    `;
    const params = [
      imageName,
      b.notice_title,
      b.notice_description || null,
      b.notice_date,
      b.notice_start_time,
      b.notice_end_time,
      b.notice_venue,
      id
    ];
    await pool.query(sql, params);
    res.json({ message: "Notice updated" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.query("SELECT notice_image FROM notices WHERE notice_id=?", [id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const img = rows[0].notice_image;
    await pool.query("DELETE FROM notices WHERE notice_id=?", [id]);

    if (img) {
      const p = path.join(UPLOAD_DIR, img);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }

    res.json({ message: "Notice deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
