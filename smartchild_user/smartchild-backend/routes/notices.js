import { Router } from "express";
import { listNotices, getNoticeById } from "../controllers/noticesController.js";

const router = Router();

router.get("/", listNotices);  // Get all notices
router.get("/:id", getNoticeById);  // Get a single notice by ID

export default router;
