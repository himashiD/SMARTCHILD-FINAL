// smartchild-backend/controllers/authController.js
import { pool } from "../db.js";

export const loginUser = async (req, res) => {
  const { usernameOrEmail, username, password } = req.body;
  const identifier = usernameOrEmail || username;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Username/Email and password are required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT child_id, username, child_image, email, first_name, last_name, password FROM children WHERE username = ? OR email = ? LIMIT 1",
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid username/email or password" });
    }

    const user = rows[0];

    // Plaintext compare to match current table data
    const ok = (password === user.password);

    if (!ok) {
      return res.status(401).json({ message: "Invalid username/email or password" });
    }

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        child_id: user.child_id,
        username: user.username,
        child_image: user.child_image,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to authenticate user" });
  }
};
