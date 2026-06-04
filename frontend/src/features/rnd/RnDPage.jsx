import { useState } from "react";
import {
  Beaker,
  Briefcase,
  Check,
  ChevronLeft,
  Edit,
  Eye,
  Package,
  Plus,
  UserPlus,
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
  PageHeader,
  Textarea,
} from "../../components/Common";
import { useApp } from "../../context/AppContext";

export function RnDPage() {
  const { rndTeams, employees, assets, navigate } = useApp();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const getEmp = (id) => employees.find(e => e.id === id);
  const getAsset = (id) => assets.find((asset) => asset.id === id);

  return (
    <div>
      <PageHeader title="R&D Teams" subtitle="Research and development team allocations"
        actions={<Button onClick={() => setCreateModalOpen(true)}><Plus size={14}/>Create Team</Button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {rndTeams.map(team => {
          const manager = getEmp(team.manager);
          return (
            <Card key={team.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center"><Beaker size={20} className="text-violet-600"/></div>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{team.id}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">{team.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{team.description}</p>
              {manager && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{manager.avatar}</div>
                  <span className="text-xs text-slate-600">{manager.name}</span>
                  <span className="text-xs text-slate-400">· Manager</span>
                </div>
              )}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800">{team.members.length}</div>
                  <div className="text-xs text-slate-400">Members</div>
                </div>
                <div className="w-px h-8 bg-slate-100"/>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800">{team.assets.length}</div>
                  <div className="text-xs text-slate-400">Assets</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1 justify-center" onClick={() => setSelectedTeam(team)}><Eye size={13}/>View</Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingTeam(team)}><Edit size={13}/></Button>
              </div>
            </Card>
          );
        })}
        {rndTeams.length === 0 && <EmptyState title="No teams yet" description="Create your first R&D team" action={<Button onClick={() => setCreateModalOpen(true)}>Create Team</Button>}/>}
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create R&D Team" size="lg">
        <CreateRnDForm onCancel={() => setCreateModalOpen(false)} onSuccess={() => setCreateModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!selectedTeam} onClose={() => setSelectedTeam(null)} title="Team Details" size="lg">
        {selectedTeam && (
          <TeamViewModalContent
            team={selectedTeam}
            getEmp={getEmp}
            getAsset={getAsset}
          />
        )}
      </Modal>

      <Modal isOpen={!!editingTeam} onClose={() => setEditingTeam(null)} title="Edit R&D Team" size="lg">
        {editingTeam && (
          <EditRnDForm
            team={editingTeam}
            onCancel={() => setEditingTeam(null)}
            onSuccess={() => setEditingTeam(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export function CreateRnDForm({ onCancel, onSuccess }) {
  const { employees, assets, addTeam, navigate } = useApp();
  const [form, setForm] = useState({ name: "", manager: "", members: [], assets: [], description: "" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.manager) return;
    addTeam(form);
    onSuccess?.();
  };

  const handleCancel = () => {
    onCancel?.();
    if (!onCancel) {
      navigate("/rnd");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField label="Team Name" required>
        <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. AI Research Team" required/>
      </FormField>
      <FormField label="Team Manager" required>
        <EmployeeSelect value={form.manager} onChange={v => set("manager", v)} placeholder="Select manager..."/>
      </FormField>
      <FormField label="Team Members">
        <MultiSelectTags label="members" value={form.members} onChange={v => set("members", v)}
          options={employees.filter(e => e.id !== form.manager)}
          renderOption={emp => (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{emp.avatar}</div>
              <span className="text-sm text-slate-700">{emp.name}</span>
              <span className="text-xs text-slate-400">· {emp.department}</span>
            </div>
          )}
        />
      </FormField>
      <FormField label="Assets">
        <MultiSelectTags label="assets" value={form.assets} onChange={v => set("assets", v)}
          options={assets.filter(a => a.status === "Available")}
          renderOption={asset => (
            <div className="flex items-center gap-2">
              <Package size={14} className="text-slate-400"/>
              <span className="text-sm text-slate-700">{asset.name}</span>
              <Badge status={asset.status}/>
            </div>
          )}
        />
      </FormField>
      <FormField label="Description">
        <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Team description..."/>
      </FormField>
      <div className="flex gap-3 pt-2">
        <Button type="submit"><Check size={14}/>Create Team</Button>
        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function TeamViewModalContent({ team, getEmp, getAsset }) {
  const manager = getEmp(team.manager);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
          <Beaker size={26} className="text-violet-600" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-800">{team.name}</h3>
            <Badge status="Active" />
          </div>
          <p className="text-sm text-slate-400 mt-1">{team.id}</p>
          {team.description && <p className="text-sm text-slate-600 mt-2">{team.description}</p>}
        </div>
      </div>

      <Card className="p-5">
        <div className="text-sm font-semibold text-slate-800 mb-3">Manager</div>
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
        <div className="space-y-3">
          {team.members.map((memberId) => {
            const member = getEmp(memberId);
            if (!member) return null;
            return (
              <div key={memberId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                  {member.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{member.name}</div>
                  <div className="text-xs text-slate-400">{member.department} · {member.designation}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-semibold text-slate-800 mb-3">Assigned Assets</div>
        <div className="space-y-3">
          {team.assets.map((assetId) => {
            const asset = getAsset(assetId);
            if (!asset) return null;
            return (
              <div key={assetId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package size={14} className="text-blue-600" />
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

function EditRnDForm({ team, onCancel, onSuccess }) {
  const { employees, assets, updateTeam } = useApp();
  const [form, setForm] = useState({
    name: team.name || "",
    manager: team.manager || "",
    members: team.members || [],
    assets: team.assets || [],
    description: team.description || "",
  });
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const selectableAssets = assets.filter(
    (asset) => asset.status === "Available" || form.assets.includes(asset.id)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.manager) return;
    updateTeam(team.id, form);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField label="Team Name" required>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
      </FormField>
      <FormField label="Team Manager" required>
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
              <span className="text-xs text-slate-400">· {emp.department}</span>
            </div>
          )}
        />
      </FormField>
      <FormField label="Assets">
        <MultiSelectTags
          label="assets"
          value={form.assets}
          onChange={(value) => set("assets", value)}
          options={selectableAssets}
          renderOption={(asset) => (
            <div className="flex items-center gap-2">
              <Package size={14} className="text-slate-400" />
              <span className="text-sm text-slate-700">{asset.name}</span>
              <Badge status={asset.status} />
            </div>
          )}
        />
      </FormField>
      <FormField label="Description">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Team description..." />
      </FormField>
      <div className="flex gap-3 pt-2">
        <Button type="submit"><Check size={14}/>Save Changes</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// Create R&D Team
export function CreateRnDPage() {
  const { navigate } = useApp();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/rnd")}><ChevronLeft size={14}/>R&D Teams</Button>
      </div>
      <PageHeader title="Create R&D Team"/>
      <Card className="p-6">
        <CreateRnDForm />
      </Card>
    </div>
  );
}

// R&D Team Detail
export function RnDDetailPage() {
  const { routeParams, getTeam, getEmployee, getAsset, navigate } = useApp();
  const team = getTeam(routeParams.id);
  if (!team) return <div className="text-slate-400 text-sm">Team not found.</div>;
  const manager = getEmployee(team.manager);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/rnd")}><ChevronLeft size={14}/>R&D Teams</Button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600">{team.name}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center"><Beaker size={26} className="text-violet-600"/></div>
              <div>
                <div className="flex items-center gap-3"><h2 className="text-xl font-bold text-slate-800">{team.name}</h2><Badge status="Active"/></div>
                <p className="text-sm text-slate-400 mt-1">{team.id}</p>
                {team.description && <p className="text-sm text-slate-600 mt-2">{team.description}</p>}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Team Members ({team.members.length})</h3>
            <div className="space-y-3">
              {team.members.map(mid => {
                const m = getEmployee(mid);
                if (!m) return null;
                return (
                  <div key={mid} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">{m.avatar}</div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{m.name}</div>
                      <div className="text-xs text-slate-400">{m.department} · {m.designation}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Assigned Assets ({team.assets.length})</h3>
            <div className="space-y-3">
              {team.assets.map(aid => {
                const a = getAsset(aid);
                if (!a) return null;
                return (
                  <div key={aid} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><Package size={14} className="text-blue-600"/></div>
                      <div>
                        <div className="text-sm font-medium text-slate-700">{a.name}</div>
                        <div className="text-xs text-slate-400">{a.type} · {a.id}</div>
                      </div>
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
            <h3 className="font-semibold text-slate-800 mb-4">Manager</h3>
            {manager && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">{manager.avatar}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{manager.name}</div>
                  <div className="text-xs text-slate-400">{manager.department}</div>
                  <div className="text-xs text-slate-400">{manager.designation}</div>
                </div>
              </div>
            )}
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-violet-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-violet-700">{team.members.length}</div><div className="text-xs text-violet-500">Members</div></div>
              <div className="bg-blue-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-blue-700">{team.assets.length}</div><div className="text-xs text-blue-500">Assets</div></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Projects


