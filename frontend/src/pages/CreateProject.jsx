import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { projectService } from "../services/projectService";

export default function CreateProject() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(null);

  const [status, setStatus] = useState("ongoing");
  const [projectType, setProjectType] = useState("solo");
  const [budgetType, setBudgetType] = useState("none");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("project_type", projectType);
      fd.append("status", status);
      fd.append("budget_type", budgetType);

      if (startDate) fd.append("start_date", startDate);
      if (endDate) fd.append("end_date", endDate);
      if (cover) fd.append("cover_photo", cover);

      const res = await projectService.createProject(fd);
      navigate(`/projects/${res.data.id}`);
    } catch {
      setError("Create project failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Create project</h1>
        <p className="text-sm text-gray-600 mt-1">Process-first. You can refine later.</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
          {error}
        </div>
      )}

      <Card className="p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200"
              placeholder="Project title"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200"
              rows={5}
              placeholder="Describe the project…"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200"
              >
                <option value="solo">Solo</option>
                <option value="collaborative">Collaborative</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200"
              >
                <option value="ongoing">Ongoing</option>
                <option value="development">In development</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Budget</label>
              <select
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200"
              >
                <option value="none">No budget</option>
                <option value="self">Self-funded</option>
                <option value="grant">Grant-funded</option>
                <option value="seeking">Seeking funding</option>
                <option value="commissioned">Commissioned</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cover photo</label>
            <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
          </div>

          <Button type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
