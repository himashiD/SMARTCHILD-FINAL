import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import noticesRoutes from "./routes/notices.js";
import growthRoutes from "./routes/growthRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";

import vaccinationRoutes from "./routes/vaccinationRoutes.js";  // Import vaccination routes
import { getVaccinationNotifications } from "./controllers/vaccinationController.js";

import chatbotRoutes from "./routes/chatbotRoutes.js";


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// ✅ serve /uploads (put your image files under smartchild-backend/uploads/...)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api2/notices", noticesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api3/growth", growthRoutes);
app.use("/api4/guides", nutritionRoutes);
app.use("/api/vaccination", vaccinationRoutes);  // Vaccination route for handling vaccination data
app.use("/api/chatbot", chatbotRoutes);

app.get("/", (_req, res) => res.json({ ok: true, name: "SmartChild API" }));

// Schedule daily vaccination notification check (runs at 9:00 AM every day)
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily vaccination notification check at 9:00 AM...');
  try {
    // Create mock request and response objects for the notification function
    const mockReq = {};
    const mockRes = {
      json: (data) => {
        console.log('Vaccination notifications found:', data.count);
        if (data.count > 0) {
          console.log('In-app notifications to be displayed:');
          data.notifications.forEach(notification => {
            console.log(`- ${notification.message}`);
            // In-app notifications would be stored and displayed to the specific user
            // This would typically involve storing notifications in a database table
            // and the frontend would fetch and display them
          });
        }
        return data;
      },
      status: () => mockRes
    };
    
    await getVaccinationNotifications(mockReq, mockRes);
    console.log('Daily vaccination notification check completed successfully');
  } catch (error) {
    console.error('Error in daily vaccination notification check:', error);
  }
});

console.log('Vaccination notification scheduler started - will run daily at 9:00 AM');

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
