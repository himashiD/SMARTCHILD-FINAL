// routes/nutritionRoutes.js
import { Router } from "express";
import { listGuides, getGuideById } from "../controllers/nutritionController.js";

const router = Router();

router.get("/", listGuides);
router.get("/:id", getGuideById);

export default router;
