import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { seedJobs } from "./seed.js";

const port = process.env.PORT || 5000;

try {
  await connectDB();
  await seedJobs();   // runs on every start — safe, uses upsert
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
} catch (err) {
  console.error("Failed to start server:", err.message);
  process.exit(1);
}
