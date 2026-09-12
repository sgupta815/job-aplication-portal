import { Applicant } from "../models/Applicant.js";
import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { validateAnswers } from "../validators/applicationValidator.js";

const MAX_BULK_APPLICATIONS = 50;

function validateApplicantInput(applicant) {
  if (!applicant || typeof applicant !== "object") {
    throw new HttpError(400, "Applicant details are required.");
  }

  const name = String(applicant.name || "").trim();
  const email = String(applicant.email || "").trim().toLowerCase();

  if (!name) throw new HttpError(400, "Applicant name is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "A valid applicant email is required.");
  }

  return { name, email };
}

// Accepts already-validated { name, email } — does NOT re-validate.
// Uses $setOnInsert so the name is only stored on first application, not silently overwritten.
async function upsertApplicant(data) {
  return Applicant.findOneAndUpdate(
    { email: data.email },
    { $setOnInsert: data },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function submitOne(applicant, job, answers) {
  validateAnswers(job, answers);

  const data = validateApplicantInput(applicant);
  const applicantDoc = await upsertApplicant(data);

  const existing = await Application.findOne({
    applicantId: applicantDoc._id,
    jobId: job._id
  });

  if (existing) {
    throw new HttpError(409, `You have already applied to ${job.title}.`);
  }

  return Application.create({
    applicantId: applicantDoc._id,
    jobId: job._id,
    answers,
    status: "submitted"
  });
}

export const applyToJob = asyncHandler(async (req, res) => {
  const { applicant, answers } = req.body || {};

  const job = await Job.findOne({ externalId: req.params.id });
  if (!job) throw new HttpError(404, "Job not found.");

  const application = await submitOne(applicant, job, answers);
  res.status(201).json({
    message: "Application submitted successfully.",
    applicationId: application._id
  });
});

export const applyToAll = asyncHandler(async (req, res) => {
  const { applicant, applications } = req.body || {};

  if (!Array.isArray(applications) || applications.length === 0) {
    throw new HttpError(400, "applications must be a non-empty array.");
  }

  if (applications.length > MAX_BULK_APPLICATIONS) {
    throw new HttpError(400, `Cannot submit more than ${MAX_BULK_APPLICATIONS} applications at once.`);
  }

  const uniqueJobIds = [...new Set(applications.map((item) => item.jobId))];
  if (uniqueJobIds.length !== applications.length) {
    throw new HttpError(400, "Duplicate jobs are not allowed in a bulk request.");
  }

  // Fetch all jobs up front.
  const jobDocs = await Promise.all(uniqueJobIds.map((id) => Job.findOne({ externalId: id })));
  const jobsById = new Map();
  const missing = [];
  uniqueJobIds.forEach((id, i) => {
    if (!jobDocs[i]) missing.push(id);
    else jobsById.set(id, jobDocs[i]);
  });

  if (missing.length) {
    throw new HttpError(404, `Job(s) not found: ${missing.join(", ")}`);
  }

  // Validate applicant input and ALL answers before writing anything to the DB.
  const applicantData = validateApplicantInput(applicant);

  const validationErrors = {};
  for (const item of applications) {
    const job = jobsById.get(item.jobId);
    try {
      validateAnswers(job, item.answers);
    } catch (error) {
      validationErrors[item.jobId] = error.details || error.message;
    }
  }

  if (Object.keys(validationErrors).length) {
    throw new HttpError(400, "One or more applications are invalid.", validationErrors);
  }

  // Only upsert the applicant once all validation has passed.
  const applicantDoc = await upsertApplicant(applicantData);

  // Check for pre-existing applications before inserting.
  const duplicateJobs = [];
  for (const item of applications) {
    const job = jobsById.get(item.jobId);
    const existing = await Application.findOne({
      applicantId: applicantDoc._id,
      jobId: job._id
    });
    if (existing) duplicateJobs.push(job.externalId);
  }

  if (duplicateJobs.length) {
    throw new HttpError(409, `Already applied to: ${duplicateJobs.join(", ")}`);
  }

  const docs = applications.map((item) => ({
    applicantId: applicantDoc._id,
    jobId: jobsById.get(item.jobId)._id,
    answers: item.answers,
    status: "submitted"
  }));

  // ordered: false — if a race-condition duplicate slips through, the rest still succeed.
  const created = await Application.insertMany(docs, { ordered: false });

  res.status(201).json({
    message: `${created.length} application${created.length !== 1 ? "s" : ""} submitted successfully.`,
    applicationIds: created.map((item) => item._id)
  });
});

export const listApplications = asyncHandler(async (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email) throw new HttpError(400, "email query parameter is required.");

  const applicant = await Applicant.findOne({ email });

  // Always return a consistent shape: applicant is null when not found.
  if (!applicant) return res.json({ applicant: null, applications: [] });

  const applications = await Application.findByApplicant(applicant._id);

  res.json({ applicant, applications });
});
