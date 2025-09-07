import express from "express";
import { fetchVaccinationData, getVaccinationNotifications } from "../controllers/vaccinationController.js";
const router = express.Router();

router.get("/:userid/vaccinations", fetchVaccinationData);
router.get("/notifications", getVaccinationNotifications);

export default router;
