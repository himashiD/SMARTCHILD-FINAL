// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import mysql from "mysql2/promise"; // Using MySQL2 for database connection
import childrenRoutes from "./routes/children.js";
import vaccinesRoutes from "./routes/vaccines.js";
import noticesRoutes from "./routes/notices.js";
import nutritionRoutes from "./routes/nutrition.js";
import medicalRecordRoutes from "./routes/medicalRecords.js";
import growthRoutes from "./routes/growth.js"


// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middlewares
app.use(cors({ origin: "http://localhost:3000" })); // React frontend URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = await mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD || '12345', // Using environment variable for security
  database: 'smartchild_db',
  waitForConnections: true,
  connectionLimit: 10,
});
app.set("db", db); // Store the database connection pool

// Serve uploaded files
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(UPLOAD_DIR)); // Serve static uploads





// API Routes
app.use("/api/children", childrenRoutes); // Children routes
app.use("/api/vaccines", vaccinesRoutes); // Vaccines routes
app.use("/api/notices", noticesRoutes); // Notices routes
app.use("/nutrition", nutritionRoutes);
app.use("/medical-records", medicalRecordRoutes);
app.use("/growth", growthRoutes)




// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
