import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = Router();

// Ensure uploads folder exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Function to format date to YYYY-MM-DD (without time zone)
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];  // Format as YYYY-MM-DD
};

// GET all children
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM children ORDER BY child_id DESC");

    // Format DOB before sending
    const formattedRows = rows.map(row => ({
      ...row,
      dob: formatDate(row.dob),  // Format the DOB
    }));

    res.json(formattedRows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET one child
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM children WHERE child_id=?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    // Format DOB before sending
    const child = rows[0];
    child.dob = formatDate(child.dob);  // Format the DOB

    res.json(child);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE child and add to child_vaccination table with vaccination dates
router.post("/", upload.single("child_image"), async (req, res) => {
  try {
    const {
      first_name, last_name, dob, gender,
      birth_weight, blood_type,
      parent_name, parent_nic, contact_no, email, address,
      username, password
    } = req.body;

    // Validate DOB format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return res.status(400).json({ error: "Invalid date format for 'dob'. Use YYYY-MM-DD." });
    }

    // Convert birth_weight to a number if provided
    const weightValue = birth_weight === "" || birth_weight === undefined ? null : Number(birth_weight);
    if (weightValue !== null && Number.isNaN(weightValue)) {
      return res.status(400).json({ error: "birth_weight must be a number like 3.1" });
    }

    // Validate blood type
    const allowedBlood = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const bloodValue = !blood_type ? null : (allowedBlood.includes(blood_type) ? blood_type : null);

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Handle image upload
    const imageName = req.file ? req.file.filename : null;

    // Insert into children table
    const sql = `
      INSERT INTO children
      (child_image, first_name, last_name, dob, gender, birth_weight, blood_type,
       parent_name, parent_nic, contact_no, email, address, username, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      imageName, first_name, last_name, dob, gender, weightValue, bloodValue,
      parent_name, parent_nic, contact_no || null, email || null, address || null,
      username, hashed
    ];

    const [result] = await pool.query(sql, params);
    const child_id = result.insertId;  // Get the child_id of the newly inserted child

    // Calculate vaccination dates (adding days to dob)
    const vaccinationDays = [14, 60, 60, 120, 120, 180, 270, 360, 540, 1080, 1800, 3600, 3600, 3960];
    const vaccinationDates = vaccinationDays.map(day => {
      const dobDate = new Date(dob);
      dobDate.setDate(dobDate.getDate() + day);
      return dobDate.toISOString().split('T')[0];  // Format as YYYY-MM-DD
    });

    // Insert into child_vaccination table with vaccination dates
    const vaccinationSql = `
      INSERT INTO child_vaccination
      (child_id, first_name, last_name, dob, BCG, OPV_1, fIPV_1, OPV_2, fIPV_2, OPV_3, MMR_1, JE_1, OPV_4, MMR_2, OPV_5, HPV_1, HPV_2, aTd)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const vaccinationParams = [
      child_id, first_name, last_name, dob,
      vaccinationDates[0], vaccinationDates[1], vaccinationDates[2], vaccinationDates[3], 
      vaccinationDates[4], vaccinationDates[5], vaccinationDates[6], vaccinationDates[7], 
      vaccinationDates[8], vaccinationDates[9], vaccinationDates[10], vaccinationDates[11], 
      vaccinationDates[12], vaccinationDates[13]
    ];

    await pool.query(vaccinationSql, vaccinationParams);

    res.status(201).json({ message: "Child added successfully", id: child_id });
  } catch (e) {
    console.error("POST /api/children error:", e);
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Username already exists" });
    if (e.sqlMessage) return res.status(500).json({ error: "Database error", details: e.sqlMessage });
    res.status(500).json({ error: e.message || "Server error" });
  }
});

// UPDATE child details and recalculate vaccination dates
router.put("/:id", upload.single("child_image"), async (req, res) => {
  const id = req.params.id;
  try {
    const [cur] = await pool.query("SELECT child_image FROM children WHERE child_id=?", [id]);
    if (!cur.length) return res.status(404).json({ error: "Not found" });

    let imageName = cur[0].child_image;
    if (req.file) {
      if (imageName) {
        const old = path.join(UPLOAD_DIR, imageName);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      imageName = req.file.filename;
    }

    const { first_name, last_name, dob, gender, birth_weight, blood_type, parent_name, parent_nic, contact_no, email, address, username, password } = req.body;

    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return res.status(400).json({ error: "Invalid date format for 'dob'. Use YYYY-MM-DD." });
    }

    let hashed = null;
    if (password && password.trim() !== "") {
      hashed = await bcrypt.hash(password, 10);
    }

    const sql = `
      UPDATE children SET
        child_image=?, first_name=?, last_name=?, dob=?, gender=?, birth_weight=?, blood_type=?,
        parent_name=?, parent_nic=?, contact_no=?, email=?, address=?, username=?${hashed ? ", password=?" : ""} 
      WHERE child_id=?
    `;

    const base = [
      imageName,
      first_name,
      last_name,
      dob,
      gender,
      birth_weight ?? null,
      blood_type ?? null,
      parent_name,
      parent_nic,
      contact_no ?? null,
      email ?? null,
      address ?? null,
      username
    ];

    const params = hashed ? [...base, hashed, id] : [...base, id];

    await pool.query(sql, params);

    // Recalculate vaccination dates
    const vaccinationDays = [14, 60, 60, 120, 120, 180, 270, 360, 540, 1080, 1800, 3600, 3600, 3960];
    const vaccinationDates = vaccinationDays.map(day => {
      const dobDate = new Date(dob);
      dobDate.setDate(dobDate.getDate() + day);
      return dobDate.toISOString().split('T')[0];  // Format as YYYY-MM-DD
    });

    // Update child_vaccination table with new vaccination dates
    const vaccinationSql = `
      UPDATE child_vaccination
      SET BCG = ?, OPV_1 = ?, fIPV_1 = ?, OPV_2 = ?, fIPV_2 = ?, OPV_3 = ?, MMR_1 = ?, JE_1 = ?, OPV_4 = ?, MMR_2 = ?, OPV_5 = ?, HPV_1 = ?, HPV_2 = ?, aTd = ?
      WHERE child_id = ?
    `;

    const vaccinationParams = [
      vaccinationDates[0], vaccinationDates[1], vaccinationDates[2], vaccinationDates[3],
      vaccinationDates[4], vaccinationDates[5], vaccinationDates[6], vaccinationDates[7],
      vaccinationDates[8], vaccinationDates[9], vaccinationDates[10], vaccinationDates[11],
      vaccinationDates[12], vaccinationDates[13], id
    ];

    await pool.query(vaccinationSql, vaccinationParams);

    res.json({ message: "Child updated successfully" });
  } catch (e) {
    console.error("PUT /api/children/:id error:", e);
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Username already exists" });
    if (e.sqlMessage) return res.status(500).json({ error: "Database error", details: e.sqlMessage });
    res.status(500).json({ error: e.message || "Server error" });
  }
});

// DELETE child record
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query("SELECT child_image FROM children WHERE child_id=?", [id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const img = rows[0].child_image;
    await pool.query("DELETE FROM children WHERE child_id=?", [id]);

    if (img) {
      const file = path.join(UPLOAD_DIR, img);
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }

    res.json({ message: "Child deleted" });
  } catch (e) {
    console.error("DELETE /api/children/:id error:", e);
    if (e.sqlMessage) return res.status(500).json({ error: "Database error", details: e.sqlMessage });
    res.status(500).json({ error: e.message || "Server error" });
  }
});


export default router;
