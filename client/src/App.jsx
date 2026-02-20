
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";
import bg from "./assets/background.jpg";

const STATUSES = ["Applied", "Interviewing", "Rejected", "Offer"];

export default function App() {
  const nav = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Create form state
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [status, setStatus] = useState("Applied");
  const [applicationDate, setApplicationDate] = useState("");
  const [notes, setNotes] = useState("");

  // Filter state
  const [statusFilter, setStatusFilter] = useState("All");

  async function loadJobs() {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/jobs"); // -> /api/jobs, token auto-attached
      setJobs(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    nav("/login");
  }

  const filteredJobs = useMemo(() => {
    if (statusFilter === "All") return jobs;
    return jobs.filter((j) => j.status === statusFilter);
  }, [jobs, statusFilter]);

  async function createJob(e) {
    e.preventDefault();
    setErr("");

    try {
     
      await api.post("/jobs", {
        companyName,
        jobTitle,
        status,
        applicationDate: applicationDate || null,
        notes: notes || null,
      });

      // reset form
      setCompanyName("");
      setJobTitle("");
      setStatus("Applied");
      setApplicationDate("");
      setNotes("");

      await loadJobs();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to create job");
    }
  }

  async function deleteJob(id) {
    setErr("");
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete job");
    }
  }

  // Simple inline edit (optional): updates only status
  async function updateStatus(id, newStatus) {
    setErr("");
    try {
      await api.put(`/jobs/${id}`, { status: newStatus });
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j))
      );
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update job");
    }
  }

  return (
    
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* dark overlay + optional blur so UI stays readable */}
      <div className="min-h-screen p-8 text-white">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold">Job Tracker</h1>
            <button
              onClick={logout}
              className="px-4 py-2 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700"
            >
              Logout
            </button>
          </div>

          {/* Error */}
          {err && (
            <div className="mb-5 text-sm bg-red-950/40 border border-red-900 p-3 rounded">
              {err}
            </div>
          )}

          {/* Create Job */}
          <form
            onSubmit={createJob}
            className="bg-black/40 border border-white/20 rounded-xl p-4 mb-6"
          >
            <h2 className="text-lg font-semibold mb-3">Add a job</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Company</label>
                <input
                  className="w-full p-2 rounded bg-gray-950 border border-gray-800"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Job Title</label>
                <input
                  className="w-full p-2 rounded bg-gray-950 border border-gray-800"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Status</label>
                <select
                  className="w-full p-2 rounded bg-gray-950 border border-gray-800"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Application Date</label>
                <input
                  type="date"
                  className="w-full p-2 rounded bg-gray-950 border border-gray-800"
                  value={applicationDate}
                  onChange={(e) => setApplicationDate(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Notes</label>
                <textarea
                  className="w-full p-2 rounded bg-gray-950 border border-gray-800"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional..."
                />
              </div>
            </div>

            <button className="mt-4 w-full md:w-auto px-4 py-2 rounded bg-white text-black font-medium">
              Add Job
            </button>
          </form>

          {/* Filter + Refresh */}
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm text-gray-300">Filter:</label>
            <select
              className="p-2 rounded bg-gray-900 border border-gray-800"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <button
              onClick={loadJobs}
              className="ml-auto px-4 py-2 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>

          {/* Jobs List */}
          {loading ? (
            <div className="text-gray-300">Loading jobs...</div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((j) => (
                <div
                  key={j.id}
                  className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {j.companyName} — {j.jobTitle}
                    </div>

                    <div className="text-sm text-gray-400 mt-1">
                      <span className="mr-2">Status:</span>
                      <select
                        className="p-1 rounded bg-gray-950 border border-gray-800"
                        value={j.status}
                        onChange={(e) => updateStatus(j.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      {j.applicationDate ? (
                        <span className="ml-3">• {j.applicationDate}</span>
                      ) : null}
                    </div>

                    {j.notes ? (
                      <div className="mt-2 text-sm text-gray-200 whitespace-pre-wrap">
                        {j.notes}
                      </div>
                    ) : null}
                  </div>

                  <button
                    onClick={() => deleteJob(j.id)}
                    className="shrink-0 px-3 py-2 rounded bg-red-950/40 border border-red-900 hover:bg-red-950/60"
                  >
                    Delete
                  </button>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="text-gray-100">No jobs found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}