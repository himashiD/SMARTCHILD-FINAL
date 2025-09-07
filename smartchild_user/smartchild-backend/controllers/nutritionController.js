import { pool } from "../db.js";

// If you set PUBLIC_BASE_URL=http://192.168.x.x:5000, API will return absolute URLs.
const BASE = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
const toAbs = (p) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  return BASE ? `${BASE}/${p.replace(/^\/+/, "")}` : p; // fallback to relative
};
const decorate = (row) => ({
  ...row,
  image_url: toAbs(row.image_path),
  document_url: toAbs(row.document_path),
});

export const listGuides = async (req, res) => {
  try {
    const { status = "Published", category, type, q, limit = 100, offset = 0 } = req.query;

    const where = [], params = [];
    if (status)   { where.push("status = ?");   params.push(status); }
    if (category) { where.push("category = ?"); params.push(category); }
    if (type)     { where.push("type = ?");     params.push(type); }
    if (q) {
      where.push("(title LIKE ? OR summary LIKE ? OR content LIKE ?)");
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT guide_id, category, type, title, summary, image_path, external_link,
              document_path, published_date, status, created_at, updated_at
       FROM nutrition_guides
       ${whereSQL}
       ORDER BY (published_date IS NULL) ASC, published_date DESC, guide_id DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    res.json(rows.map(decorate));
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch guides", details: e.message });
  }
};

export const getGuideById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[row]] = await pool.query(
      `SELECT guide_id, category, type, title, summary, content, image_path, external_link,
              document_path, published_date, status, created_at, updated_at
       FROM nutrition_guides WHERE guide_id = ?`,
      [id]
    );
    if (!row) return res.status(404).json({ error: "Guide not found" });
    res.json(decorate(row));
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch guide", details: e.message });
  }
};
