import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { projectService } from "../services/projectService";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    projectService
      .getProject(id)
      .then((res) => setProject(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (!project) return <div className="text-sm text-red-600">Project not found.</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{project.title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            by @{project.creator?.username} · {project.status} · {project.project_type}
          </p>
        </div>

        <Link to="/feed">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>

      {project.cover_photo && (
        <Card className="overflow-hidden">
          <img src={project.cover_photo} alt="Cover" className="w-full object-cover" />
        </Card>
      )}

      <Card className="p-5">
        <div className="text-sm text-gray-800 whitespace-pre-wrap">{project.description}</div>
      </Card>

      <Card className="p-5">
        <div className="text-sm text-gray-700">
          Next step: project timeline + uploads + calendar entries.
        </div>
      </Card>
    </div>
  );
}
