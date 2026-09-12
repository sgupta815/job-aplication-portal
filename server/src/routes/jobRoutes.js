import { Router } from "express";
import { getJob, listJobs } from "../controllers/jobController.js";
import { applyToJob } from "../controllers/applicationController.js";

const router = Router();

router.get("/", listJobs);
router.get("/:id", getJob);
router.post("/:id/apply", applyToJob);

export default router;
