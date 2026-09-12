import { nanoid } from "nanoid";
import { getDB } from "../config/db.js";
import { Job } from "./Job.js";

export const Application = {
  async findOne(query) {
    const db = getDB();
    return db.data.applications.find((a) =>
      Object.entries(query).every(([k, v]) => a[k] === v)
    ) ?? null;
  },

  async create(data) {
    const db = getDB();
    const doc = {
      _id: nanoid(),
      createdAt: new Date().toISOString(),
      ...data,
      status: data.status ?? "submitted"
    };
    db.data.applications.push(doc);
    await db.write();
    return doc;
  },

  /**
   * Mimics Mongoose insertMany.
   * opts.ordered=false: continue inserting even if one is a duplicate (same applicantId+jobId).
   */
  async insertMany(docs, opts = {}) {
    const db = getDB();
    const created = [];
    const ordered = opts.ordered !== false; // default true

    for (const data of docs) {
      // Enforce unique (applicantId, jobId)
      const duplicate = db.data.applications.find(
        (a) => a.applicantId === data.applicantId && a.jobId === data.jobId
      );
      if (duplicate) {
        if (ordered) {
          const err = new Error("Duplicate application");
          err.code = 11000;
          throw err;
        }
        continue; // ordered:false — skip and keep going
      }

      const doc = {
        _id: nanoid(),
        createdAt: new Date().toISOString(),
        ...data,
        status: data.status ?? "submitted"
      };
      db.data.applications.push(doc);
      created.push(doc);
    }

    await db.write();
    return created;
  },

  /**
   * Mimics Mongoose .find().populate("jobId", fields).sort().lean()
   * Returns applications for an applicantId, with jobId replaced by the job object.
   */
  async findByApplicant(applicantId) {
    const db = getDB();
    const apps = db.data.applications
      .filter((a) => a.applicantId === applicantId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Populate jobId
    return Promise.all(
      apps.map(async (app) => {
        const job = await Job.findOne({ _id: app.jobId }) ?? null;
        return {
          ...app,
          jobId: job
            ? { _id: job._id, externalId: job.externalId, title: job.title, company: job.company, location: job.location }
            : null
        };
      })
    );
  }
};
