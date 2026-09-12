import { nanoid } from "nanoid";
import { getDB } from "../config/db.js";

export const Job = {
  async find(filter = {}) {
    const db = getDB();
    let jobs = db.data.jobs;

    if (filter.$or) {
      // Only used for search — each $or entry is { field: { $regex, $options } }
      jobs = jobs.filter((job) =>
        filter.$or.some((clause) => {
          const [field, { $regex }] = Object.entries(clause)[0];
          return new RegExp($regex, "i").test(job[field] ?? "");
        })
      );
    }

    // Return newest first (mimic Mongoose .sort({ createdAt: -1 }))
    return [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findOne(query) {
    const db = getDB();
    const [field, value] = Object.entries(query)[0];
    return db.data.jobs.find((j) => j[field] === value) ?? null;
  },

  async findOneAndUpdate(query, update, opts = {}) {
    const db = getDB();
    const [field, value] = Object.entries(query)[0];
    const idx = db.data.jobs.findIndex((j) => j[field] === value);
    const payload = update.$set ?? update;

    if (idx === -1) {
      if (!opts.upsert) return null;
      const doc = { _id: nanoid(), createdAt: new Date().toISOString(), ...payload };
      db.data.jobs.push(doc);
      await db.write();
      return doc;
    }

    db.data.jobs[idx] = { ...db.data.jobs[idx], ...payload };
    await db.write();
    return db.data.jobs[idx];
  }
};
