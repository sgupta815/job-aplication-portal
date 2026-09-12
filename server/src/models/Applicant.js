import { nanoid } from "nanoid";
import { getDB } from "../config/db.js";

export const Applicant = {
  async findOne(query) {
    const db = getDB();
    const [field, value] = Object.entries(query)[0];
    return db.data.applicants.find((a) => a[field] === value) ?? null;
  },

  async findOneAndUpdate(query, update, opts = {}) {
    const db = getDB();
    const [field, value] = Object.entries(query)[0];
    const idx = db.data.applicants.findIndex((a) => a[field] === value);

    if (idx === -1) {
      if (!opts.upsert) return null;
      // $setOnInsert: only apply data on first insert
      const insertData = update.$setOnInsert ?? update.$set ?? update;
      const doc = { _id: nanoid(), createdAt: new Date().toISOString(), ...insertData };
      db.data.applicants.push(doc);
      await db.write();
      return doc;
    }

    // Existing record — only apply $set (not $setOnInsert) on update
    if (update.$set) {
      db.data.applicants[idx] = { ...db.data.applicants[idx], ...update.$set };
      await db.write();
    }
    return db.data.applicants[idx];
  }
};
