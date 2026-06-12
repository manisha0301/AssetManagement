import { useState } from "react";
import {
  Briefcase,
  Check,
  ChevronLeft,
  Edit,
  Eye,
  FolderKanban,
  Package,
  Plus,
  Users,
} from "lucide-react";
import {
  AssetSelect,
  Badge,
  Button,
  Card,
  EmptyState,
  EmployeeSelect,
  FormField,
  Input,
  Modal,
  MultiSelectTags,
  NotAuthorized,
  PageHeader,
  Select,
} from "../../components/Common";
import { useApp } from "../../context/AppContext";

export function ProjectsPage() {
  const { projects, employees, assets, navigate, canViewAssets, canEditAssets } = useApp();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const getEmp = (id) => employees.find(e => e.id === id);
  const getAsset = (id) => assets.find((asset) => asset.id === id);

  if (!canViewAssets) {
    return <NotAuthorized message="You need view permission to access project allocations." />;
  }

  return (
    <div>
      <PageHeader title="Projects" subtitle="Project asset allocations"
        actions={canEditAssets ? <Button onClick={() => setCreateModalOpen(true)}><Plus size={14}/>New Project</Button> : null}
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Project Code","Project Name","Manager","Team Size","Assets","Status","Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {projects.map(proj => {
                const mgr = getEmp(proj.manager);
                return (
                  <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5"><span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{proj.code}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><FolderKanban size={14} className="text-emerald-600"/></div>
                        <span className="text-sm font-medium text-slate-800">{proj.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {mgr && <div className="flex items-center gap-2"><div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{mgr.avatar}</div><span className="text-sm text-slate-600">{mgr.name}</span></div>}
                    </td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-700 font-medium">{proj.members.length}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-700 font-medium">{proj.assets.length}</span></td>
                    <td className="px-4 py-3.5"><Badge status={proj.status}/></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedProject(proj)}><Eye size={14}/></Button>
                        {canEditAssets && <Button variant="ghost" size="sm" onClick={() => setEditingProject(proj)}><Edit size={14}/></Button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {projects.length === 0 && <EmptyState title="No projects" description={canEditAssets ? "Create your first project" : "No projects are available."} action={canEditAssets ? <Button onClick={() => setCreateModalOpen(true)}>New Project</Button> : null}/>}
        </div>
      </Card>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Project" size="lg">
        <CreateProjectForm onCancel={() => setCreateModalOpen(false)} onSuccess={() => setCreateModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title="Project Details" size="lg">
        {selectedProject && (
          <ProjectViewModalContent
            project={selectedProject}
            getEmp={getEmp}
            getAsset={getAsset}
          />
        )}
      </Modal>

      <Modal isOpen={!!editingProject} onClose={() => setEditingProject(null)} title="Edit Project" size="lg">
        {editingProject && (
          <EditProjectForm
            project={editingProject}
            onCancel={() => setEditingProject(null)}
            onSuccess={() => setEditingProject(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export function CreateProjectForm({ onCancel, onSuccess }) {
  const { employees, assets, addProject, navigate, canEditAssets } = useApp();
  const [form, setForm] = useState({ code: "", name: "", manager: "", members: [], assets: [] });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (!canEditAssets) {
    return <NotAuthorized message="You do not have permission to create projects." />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.manager) return;
    try {
      await addProject(form);
      onSuccess?.();
    } catch {
      // Toasts are handled in the shared app context.
    }
  };

  const handleCancel = () => {
    onCancel?.();
    if (!onCancel) {
      navigate("/projects");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Project Code" required>
          <Input value={form.code} onChange={e => set("code", e.target.value)} placeholder="e.g. PROJ-004" required/>
        </FormField>
        <FormField label="Project Name" required>
          <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Mobile App v4" required/>
        </FormField>
      </div>
      <FormField label="Project Manager" required>
        <EmployeeSelect value={form.manager} onChange={v => set("manager", v)} placeholder="Select manager..."/>
      </FormField>
      <FormField label="Team Members">
        <MultiSelectTags label="members" value={form.members} onChange={v => set("members", v)}
          options={employees.filter(e => e.id !== form.manager)}
          renderOption={emp => (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{emp.avatar}</div>
              <span className="text-sm text-slate-700">{emp.name}</span>
            </div>
          )}
        />
      </FormField>
      <FormField label="Asset Allocation">
        <MultiSelectTags label="assets" value={form.assets} onChange={v => set("assets", v)}
          options={assets.filter(a => a.status === "Available")}
          renderOption={asset => (
            <div className="flex items-center gap-2">
              <Package size={14} className="text-slate-400"/>
              <span className="text-sm text-slate-700">{asset.name}</span>
              <span className="text-xs text-slate-400">({asset.type})</span>
            </div>
          )}
        />
      </FormField>
      <div className="flex gap-3 pt-2">
        <Button type="submit"><Check size={14}/>Create Project</Button>
        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function ProjectViewModalContent({ project, getEmp, getAsset }) {
  const manager = getEmp(project.manager);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <FolderKanban size={26} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-slate-800">{project.name}</h3>
            <Badge status={project.status} />
          </div>
          <p className="text-sm text-slate-400 mt-1">{project.code} · {project.id}</p>
        </div>
      </div>

      <Card className="p-5">
        <div className="text-sm font-semibold text-slate-800 mb-3">Project Manager</div>
        {manager && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
              {manager.avatar}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700">{manager.name}</div>
              <div className="text-xs text-slate-400">{manager.department} · {manager.designation}</div>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="text-sm font-semibold text-slate-800 mb-3">Team Members</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {project.members.map((memberId) => {
            const member = getEmp(memberId);
            if (!member) return null;
            return (
              <div key={memberId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                  {member.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{member.name}</div>
                  <div className="text-xs text-slate-400">{member.designation}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-semibold text-slate-800 mb-3">Allocated Assets</div>
        <div className="space-y-3">
          {project.assets.map((assetId) => {
            const asset = getAsset(assetId);
            if (!asset) return null;
            return (
              <div key={assetId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Package size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700">{asset.name}</div>
                    <div className="text-xs text-slate-400">{asset.type} · {asset.id}</div>
                  </div>
                </div>
                <Badge status={asset.status} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function EditProjectForm({ project, onCancel, onSuccess }) {
  const { employees, assets, updateProject, canEditAssets } = useApp();
  const [form, setForm] = useState({
    code: project.code || "",
    name: project.name || "",
    status: project.status || "Planning",
    manager: project.manager || "",
    members: project.members || [],
    assets: project.assets || [],
  });
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const selectableAssets = assets.filter(
    (asset) => asset.status === "Available" || form.assets.includes(asset.id)
  );

  if (!canEditAssets) {
    return <NotAuthorized message="You do not have permission to edit projects." />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.manager) return;
    try {
      await updateProject(project.id, form);
      onSuccess?.();
    } catch {
      // Toasts are handled in the shared app context.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Project Code" required>
          <Input value={form.code} onChange={(e) => set("code", e.target.value)} required />
        </FormField>
        <FormField label="Project Name" required>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </FormField>
      </div>
      <FormField label="Project Status" required>
        <Select value={form.status} onChange={(e) => set("status", e.target.value)} required>
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </Select>
      </FormField>
      <FormField label="Project Manager" required>
        <EmployeeSelect value={form.manager} onChange={(value) => set("manager", value)} placeholder="Select manager..." />
      </FormField>
      <FormField label="Team Members">
        <MultiSelectTags
          label="members"
          value={form.members}
          onChange={(value) => set("members", value)}
          options={employees.filter((employee) => employee.id !== form.manager)}
          renderOption={(emp) => (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{emp.avatar}</div>
              <span className="text-sm text-slate-700">{emp.name}</span>
            </div>
          )}
        />
      </FormField>
      <FormField label="Asset Allocation">
        <MultiSelectTags
          label="assets"
          value={form.assets}
          onChange={(value) => set("assets", value)}
          options={selectableAssets}
          renderOption={(asset) => (
            <div className="flex items-center gap-2">
              <Package size={14} className="text-slate-400" />
              <span className="text-sm text-slate-700">{asset.name}</span>
              <span className="text-xs text-slate-400">({asset.type})</span>
            </div>
          )}
        />
      </FormField>
      <div className="flex gap-3 pt-2">
        <Button type="submit"><Check size={14}/>Save Changes</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// Create Project
export function CreateProjectPage() {
  const { navigate, canEditAssets } = useApp();

  if (!canEditAssets) {
    return <NotAuthorized message="You do not have permission to create projects." />;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}><ChevronLeft size={14}/>Projects</Button>
      </div>
      <PageHeader title="Create Project"/>
      <Card className="p-6">
        <CreateProjectForm />
      </Card>
    </div>
  );
}

// Project Detail
export function ProjectDetailPage() {
  const { routeParams, getProject, getEmployee, getAsset, navigate } = useApp();
  const project = getProject(routeParams.id);
  if (!project) return <div className="text-slate-400 text-sm">Project not found.</div>;
  const manager = getEmployee(project.manager);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}><ChevronLeft size={14}/>Projects</Button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600">{project.name}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center"><FolderKanban size={26} className="text-emerald-600"/></div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap"><h2 className="text-xl font-bold text-slate-800">{project.name}</h2><Badge status={project.status}/></div>
                <p className="text-sm text-slate-400 mt-1">{project.code} · {project.id}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Team Members ({project.members.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.members.map(mid => {
                const m = getEmployee(mid);
                if (!m) return null;
                return (
                  <div key={mid} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">{m.avatar}</div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{m.name}</div>
                      <div className="text-xs text-slate-400">{m.designation}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Allocated Assets ({project.assets.length})</h3>
            <div className="space-y-3">
              {project.assets.map(aid => {
                const a = getAsset(aid);
                if (!a) return null;
                return (
                  <div key={aid} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><Package size={14} className="text-emerald-600"/></div>
                      <div><div className="text-sm font-medium text-slate-700">{a.name}</div><div className="text-xs text-slate-400">{a.type}</div></div>
                    </div>
                    <Badge status={a.status}/>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Project Manager</h3>
            {manager && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">{manager.avatar}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{manager.name}</div>
                  <div className="text-xs text-slate-400">{manager.department}</div>
                </div>
              </div>
            )}
          </Card>
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-emerald-700">{project.members.length}</div><div className="text-xs text-emerald-500">Members</div></div>
              <div className="bg-blue-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-blue-700">{project.assets.length}</div><div className="text-xs text-blue-500">Assets</div></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}



