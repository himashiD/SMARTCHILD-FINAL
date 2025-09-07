import { pool } from "../db.js";

const createNotificationsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES children(child_id) ON DELETE CASCADE
    );
  `;

  try {
    await pool.execute(query);
    console.log("Notifications table created successfully.");
  } catch (error) {
    console.error("Error creating notifications table:", error.message);
    console.log("This error might occur if the database connection is not properly configured.");
    console.log("Please ensure your .env file contains the correct database credentials.");
  }
};

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createNotificationsTable();
}
