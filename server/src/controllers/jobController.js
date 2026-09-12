import { Job } from "../models/Job.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

// Escape special regex characters to prevent ReDoS attacks.
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const listJobs = asyncHandler(async (req, res) => {
  const search = String(req.query.search || "").trim();
  const safeSearch = escapeRegex(search);

  const filter = search
    ? {
        $or: [
          { title: { $regex: safeSearch, $options: "i" } },
          { company: { $regex: safeSearch, $options: "i" } },
          { location: { $regex: safeSearch, $options: "i" } }
        ]
      }
    : {};

  const jobs = await Job.find(filter);
  res.json({ jobs });
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ externalId: req.params.id });
  if (!job) throw new HttpError(404, "Job not found.");
  res.json({ job });
});
