// backend/routes/nutrition.js
import { Router } from "express";
import { pool } from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// ---------- ensure upload dir ----------
const DIR = path.join(process.cwd(), "uploads/nutrition");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

// ---------- multer ----------
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, DIR),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

const normPath = (p) =>
  p ? p.replace(process.cwd() + path.sep, "").replace(/\\/g, "/") : null;

const del = (p) => {
  try {
    if (!p) return;
    const abs = path.join(process.cwd(), p);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {}
};

// ---------- CREATE ----------
router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 1 }, { name: "document", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { category, type, title, summary, content, external_link, published_date, status = "Published" } = req.body;
      if (!category || !type || !title || !published_date) {
        return res.status(400).json({ message: "category, type, title, published_date are required" });
      }

      const image_path = normPath(req.files?.image?.[0]?.path);
      const document_path = normPath(req.files?.document?.[0]?.path);

      const [r] = await pool.execute(
        `INSERT INTO nutrition_guides
         (category,type,title,summary,content,image_path,external_link,document_path,published_date,status)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [category,type,title,summary||null,content||null,image_path,external_link||null,document_path,published_date,status]
      );
      res.status(201).json({ guide_id: r.insertId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ---------- LIST (filters + pagination) ----------
router.get("/", async (req, res) => {
  try {
    const { q = "", category = "", type = "", page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = [];
    const args = [];
    if (q) { where.push("(title LIKE ? OR summary LIKE ?)"); args.push(`%${q}%`,`%${q}%`); }
    if (category) { where.push("category = ?"); args.push(category); }
    if (type) { where.push("type = ?"); args.push(type); }
    const W = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [items] = await pool.query(
      `SELECT * FROM nutrition_guides ${W}
       ORDER BY published_date DESC, updated_at DESC
       LIMIT ? OFFSET ?`, [...args, Number(limit), offset]
    );
    const [[{ count }]] = await pool.query(`SELECT COUNT(*) count FROM nutrition_guides ${W}`, args);
    res.json({ items, total: count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- GET ONE ----------
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM nutrition_guides WHERE guide_id=?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- UPDATE ----------
router.put(
  "/:id",
  upload.fields([{ name: "image", maxCount: 1 }, { name: "document", maxCount: 1 }]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const [prev] = await pool.execute("SELECT image_path, document_path FROM nutrition_guides WHERE guide_id=?", [id]);
      if (!prev.length) return res.status(404).json({ message: "Not found" });

      const newImg = normPath(req.files?.image?.[0]?.path);
      const newDoc = normPath(req.files?.document?.[0]?.path);

      const { category, type, title, summary, content, external_link, published_date, status } = req.body;

      await pool.execute(
        `UPDATE nutrition_guides SET
           category=COALESCE(?,category),
           type=COALESCE(?,type),
           title=COALESCE(?,title),
           summary=COALESCE(?,summary),
           content=COALESCE(?,content),
           external_link=COALESCE(?,external_link),
           published_date=COALESCE(?,published_date),
           status=COALESCE(?,status),
           image_path=COALESCE(?,image_path),
           document_path=COALESCE(?,document_path)
         WHERE guide_id=?`,
        [category||null,type||null,title||null,summary||null,content||null,external_link||null,
         published_date||null,status||null,newImg||null,newDoc||null,id]
      );

      if (newImg && prev[0].image_path) del(prev[0].image_path);
      if (newDoc && prev[0].document_path) del(prev[0].document_path);

      res.json({ message: "Updated" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ---------- DELETE ----------
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.execute("SELECT image_path, document_path FROM nutrition_guides WHERE guide_id=?", [id]);
    await pool.execute("DELETE FROM nutrition_guides WHERE guide_id=?", [id]);
    if (rows?.[0]) {
      del(rows[0].image_path);
      del(rows[0].document_path);
    }
    res.json({ message: "Deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
