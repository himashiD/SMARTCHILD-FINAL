// backend/routes/vaccines.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db.js";

const router = Router();

// ensure uploads/
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

/* ======== VALIDATION ======== */
function validate(payload, forUpdate = false) {
  const errors = [];
  const { name, age_weeks } = payload;
  if (!forUpdate) {
    if (!name) errors.push("name");
    if (age_weeks === undefined || age_weeks === null || age_weeks === "") errors.push("age_weeks");
  }
  if (payload.age_weeks !== undefined && payload.age_weeks !== null && payload.age_weeks !== "") {
    const n = Number(payload.age_weeks);
    if (Number.isNaN(n) || !Number.isFinite(n) || n < 0) errors.push("age_weeks must be a non-negative number");
  }
  return errors;
}

/* ======== CRUD ======== */

// GET all
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM vaccines ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET one
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM vaccines WHERE id=?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE
router.post("/", upload.single("vaccine_image"), async (req, res) => {
  try {
    const v = req.body;
    const errs = validate(v);
    if (errs.length) return res.status(400).json({ error: "Validation failed", details: errs });

    const imageName = req.file ? req.file.filename : null;

    const sql = `
      INSERT INTO vaccines (vaccine_image, name, dose, age_weeks, description)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      imageName,
      v.name,
      v.dose || null,
      v.age_weeks === "" ? null : Number(v.age_weeks),
      v.description || null
    ];

    const [r] = await pool.query(sql, params);
    res.status(201).json({ message: "Vaccine added", id: r.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// UPDATE
router.put("/:id", upload.single("vaccine_image"), async (req, res) => {
  try {
    const id = req.params.id;

    const [curRows] = await pool.query("SELECT vaccine_image FROM vaccines WHERE id=?", [id]);
    if (!curRows.length) return res.status(404).json({ error: "Not found" });

    const v = req.body;
    const errs = validate(v, true);
    if (errs.length) return res.status(400).json({ error: "Validation failed", details: errs });

    let imageName = curRows[0].vaccine_image;
    if (req.file) {
      if (imageName) {
        const old = path.join(UPLOAD_DIR, imageName);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      imageName = req.file.filename;
    }

    const sql = `
      UPDATE vaccines
      SET vaccine_image=?, name=?, dose=?, age_weeks=?, description=?
      WHERE id=?
    `;
    const params = [
      imageName,
      v.name,
      v.dose || null,
      v.age_weeks === "" ? null : Number(v.age_weeks),
      v.description || null,
      id
    ];

    await pool.query(sql, params);
    res.json({ message: "Vaccine updated" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.query("SELECT vaccine_image FROM vaccines WHERE id=?", [id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const img = rows[0].vaccine_image;
    await pool.query("DELETE FROM vaccines WHERE id=?", [id]);

    if (img) {
      const p = path.join(UPLOAD_DIR, img);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }

    res.json({ message: "Vaccine deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
