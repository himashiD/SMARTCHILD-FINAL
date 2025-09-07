import { pool } from "../db.js";

// BMI calculation function
const calcBMI = (heightCm, weightKg) => {
  const m = Number(heightCm) / 100; // Convert cm to meters
  if (!m || !weightKg) return null;
  return Number((Number(weightKg) / (m * m)).toFixed(2));
};

// Insert Growth Data
export const insertGrowthData = async (req, res) => {
  try {
    const { child_id, username, height, weight } = req.body;
    if (!child_id || !username || !height || !weight) {
      return res.status(400).json({ ok: false, error: "child_id, username, height, weight are required" });
    }

    const bmiValue = calcBMI(height, weight);
    if (!bmiValue) return res.status(400).json({ ok: false, error: "Invalid height/weight" });

    const sql = `INSERT INTO growth_data (child_id, username, height, weight, bmi) 
                 VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [
      child_id,
      username,
      height,
      weight,
      bmiValue,
    ]);

    return res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error("insertGrowthData error:", err?.code, err?.message);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

// Fetch Growth Data for a specific child
export const fetchGrowthData = async (req, res) => {
  const { child_id } = req.params;
  
  try {
    const [rows] = await pool.execute(
      `SELECT id, child_id, username, height, weight, bmi, insert_date
       FROM growth_data
       WHERE child_id = ? ORDER BY insert_date DESC, id DESC`, 
      [child_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("fetchGrowthData error:", err?.message);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
