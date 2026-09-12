import axios from "axios";

export const api = axios.create({
  baseURL: "/api"
});

export async function getJobs(search = "") {
  const { data } = await api.get("/jobs", { params: search ? { search } : {} });
  return data.jobs;
}

export async function getJob(id) {
  const { data } = await api.get(`/jobs/${id}`);
  return data.job;
}

export async function applyToJob(jobId, payload) {
  const { data } = await api.post(`/jobs/${jobId}/apply`, payload);
  return data;
}

export async function applyToAll(payload) {
  const { data } = await api.post("/applications/bulk", payload);
  return data;
}

export async function getApplications(email) {
  const { data } = await api.get("/applications", { params: { email } });
  return data;
}
