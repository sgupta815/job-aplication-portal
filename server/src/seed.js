import { Job } from "./models/Job.js";

const JOBS = [
  {
    externalId: "job-1",
    title: "Frontend Developer",
    company: "Nova Labs",
    location: "Remote",
    description: "Build and maintain our React-based dashboard.",
    questions: [
      { id: "q1", label: "Full name", type: "text", required: true },
      { id: "q2", label: "Years of React experience", type: "number", required: true },
      {
        id: "q3",
        label: "Preferred work mode",
        type: "dropdown",
        required: true,
        options: ["Remote", "Hybrid", "On-site"]
      },
      { id: "q4", label: "Why do you want this role?", type: "textarea", required: false }
    ]
  },
  {
    externalId: "job-2",
    title: "Content Writer",
    company: "Brightside Media",
    location: "Hybrid",
    description: "Write long-form articles and marketing copy.",
    questions: [
      { id: "q1", label: "Full name", type: "text", required: true },
      { id: "q2", label: "Portfolio URL", type: "text", required: true },
      {
        id: "q3",
        label: "Topics you can write about",
        type: "checkbox",
        required: true,
        options: ["Tech", "Finance", "Health", "Travel", "Lifestyle"]
      },
      { id: "q4", label: "Sample pitch", type: "textarea", required: true }
    ]
  },
  {
    externalId: "job-3",
    title: "Sales Associate",
    company: "PeakReach",
    location: "On-site",
    description: "Drive outbound sales and manage client relationships.",
    questions: [
      { id: "q1", label: "Full name", type: "text", required: true },
      {
        id: "q2",
        label: "Do you have a driver's license?",
        type: "boolean",
        required: true
      },
      {
        id: "q3",
        label: "Highest education",
        type: "dropdown",
        required: true,
        options: ["High School", "Bachelor's", "Master's", "Other"]
      },
      { id: "q4", label: "Notice period (in days)", type: "number", required: false }
    ]
  }
];

/**
 * Seeds jobs into the DB if they don't already exist.
 * Safe to call on every server start — uses upsert so existing data is never overwritten.
 */
export async function seedJobs() {
  for (const job of JOBS) {
    await Job.findOneAndUpdate(
      { externalId: job.externalId },
      job,
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${JOBS.length} jobs.`);
}
