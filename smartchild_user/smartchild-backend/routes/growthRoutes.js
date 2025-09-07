import { Router } from "express";
import { insertGrowthData, fetchGrowthData } from "../controllers/growthController.js";

const router = Router();

// POST route to insert growth data
router.post("/", insertGrowthData);

// GET route to fetch growth data for a specific child
router.get("/:child_id", fetchGrowthData);

export default router;
