import { Router } from "express";
import { applyToAll, listApplications } from "../controllers/applicationController.js";

const router = Router();

router.post("/bulk", applyToAll);
router.get("/", listApplications);

export default router;
