import { useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Cable,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  Hash,
  HardDrive,
  Monitor,
  Package,
  Plus,
  Search,
  Smartphone,
  Tag,
  Trash2,
  Upload,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import {
  AssetSelect,
  Badge,
  Button,
  Card,
  EmptyState,
  FormField,
  Input,
  Modal,
  NotAuthorized,
  Pagination,
  PageHeader,
  SearchBar,
  Select,
  Textarea,
} from "../../components/Common";
import { useApp } from "../../context/AppContext";

function getActiveAssetAssignment(assetId, assetAssignments) {
  return assetAssignments.find((assignment) => assignment.asset_id === assetId && assignment.status === "Active") || null;
}

const formatdatetime = (dateStr) => {
  if (!dateStr || dateStr === "N/A" || dateStr === "Active") return dateStr || "N/A";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

function getAssignmentLabel(assignment, getEmp, getTeam, getProject) {
  if (!assignment) return null;

  if (assignment.assigned_to_type === "employee") {
    const employee = getEmp(assignment.employee_id);
    return employee
      ? { label: employee.name, meta: `${employee.department} · ${employee.designation}`, avatar: employee.avatar, kind: "employee" }
      : { label: assignment.employee_id || "Unknown Employee", meta: "", avatar: "?", kind: "employee" };
  }

  if (assignment.assigned_to_type === "team") {
    const team = getTeam(assignment.team_id);
    return team
      ? { label: team.name, meta: "Assigned to team", avatar: "TM", kind: "group" }
      : { label: assignment.team_id || "Unknown Team", meta: "Assigned to team", avatar: "TM", kind: "group" };
  }

  if (assignment.assigned_to_type === "project") {
    const project = getProject(assignment.project_id);
    return project
      ? { label: project.name, meta: "Assigned to project", avatar: "PR", kind: "group" }
      : { label: assignment.project_id || "Unknown Project", meta: "Assigned to project", avatar: "PR", kind: "group" };
  }

  return null;
}

function getAssetHistory(assetId, assetAssignments, getEmp, getTeam, getProject, temporary) {
  const active = assetAssignments
    .filter((assignment) => assignment.asset_id === assetId)
    .sort((a, b) => new Date(b.assigned_date || 0) - new Date(a.assigned_date || 0));

  const assignmentHistory = active.map((assignment) => {
    const label = getAssignmentLabel(assignment, getEmp, getTeam, getProject);
    return {
      id: assignment.assignment_id,
      employeeId: assignment.employee_id || assignment.team_id || assignment.project_id,
      assignedDate: assignment.assigned_date || "N/A",
      returnDate: assignment.status === "Active" ? "Active" : (assignment.return_date || "N/A"),
      label: label?.label || "Assignment",
      meta: label?.meta || "",
      avatar: label?.avatar || "?",
      kind: label?.kind || "employee",
      status: assignment.status,
    };
  });

  const tempHistory = temporary
    .filter((allocation) => allocation.assetId === assetId)
    .map((allocation) => ({
      id: allocation.id,
      employeeId: allocation.employeeId,
      assignedDate: allocation.issueDate,
      returnDate: allocation.returnDate,
      label: allocation.modalName || "Temporary Allocation",
      meta: "Temporary issue",
      avatar: "?",
      kind: "employee",
      status: allocation.status,
    }));

  return [...assignmentHistory, ...tempHistory];
}

export function AssetsPage() {
  const { assets, employees, rndTeams, projects, assetAssignments, temporary, deleteAsset, navigate, assetsLoading, dataError, canViewAssets, canEditAssets } = useApp();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [rowMenu, setRowMenu] = useState(null);
  const PER_PAGE = 8;

  const getEmp = (id) => employees.find(e => e.id === id);
  const getTeam = (id) => rndTeams.find((team) => team.id === id);
  const getProject = (id) => projects.find((project) => project.id === id);
  const getAssignmentDisplay = (asset) => {
    if (asset.assignmentType === "employee" || asset.assignmentType === "temporary") {
      const employee = getEmp(asset.assignedTo);
      return employee
        ? { label: employee.name, meta: `${employee.department} · ${employee.designation}`, avatar: employee.avatar, kind: "employee" }
        : { label: "Unknown Employee", meta: "", avatar: "?", kind: "employee" };
    }

    if (asset.assignmentType === "team") {
      const team = getTeam(asset.assignmentRef);
      return team
        ? { label: team.name, meta: "Assigned to team", avatar: "TM", kind: "group" }
        : { label: "Unknown Team", meta: "Assigned to team", avatar: "TM", kind: "group" };
    }

    if (asset.assignmentType === "project") {
      const project = getProject(asset.assignmentRef);
      return project
        ? { label: project.name, meta: "Assigned to project", avatar: "PR", kind: "group" }
        : { label: "Unknown Project", meta: "Assigned to project", avatar: "PR", kind: "group" };
    }

    return null;
  };

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || a.type === typeFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (!canViewAssets) {
    return <NotAuthorized message="You need asset view permission to access this page." />;
  }

  const assetTypeIcon = (type) => {
    const map = { Laptop: Monitor, Phone: Smartphone, Pendrive: HardDrive, "Data Cable": Cable, Charger: Zap };
    const Icon = map[type] || Package;
    return <Icon size={15} className="text-slate-400"/>;
  };

  return (
    <div>
      <PageHeader title="All Assets" subtitle={assetsLoading ? "Loading assets..." : `${assets.length} assets total`}
        actions={canEditAssets ? <Button onClick={() => setAddModalOpen(true)}><Plus size={14}/>Add Asset</Button> : null}
      />
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
          <div className="flex-1"><SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name or ID..."/></div>
          <Select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="w-full sm:w-40">
            <option value="">All Types</option>
            {["Laptop","Phone","Pendrive","Data Cable","Charger"].map(t => <option key={t}>{t}</option>)}
          </Select>
          <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="w-full sm:w-40">
            <option value="">All Status</option>
            {["Available","Assigned","Temporary"].map(s => <option key={s}>{s}</option>)}
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Asset ID","Asset Name","Type","Status","Assigned To","Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {assetsLoading ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan="6">
                    Loading assets from Asset Management...
                  </td>
                </tr>
              ) : paged.map(asset => {
                const assignment = getAssignmentDisplay(asset);
                return (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5"><span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{asset.id}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">{assetTypeIcon(asset.type)}</div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">{asset.name}</div>
                          <div className="text-xs text-slate-400">{asset.serial}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{asset.type}</span></td>
                    <td className="px-4 py-3.5"><Badge status={asset.status}/></td>
                    <td className="px-4 py-3.5">
                      {assignment ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${assignment.kind === "employee" ? "bg-blue-600" : "bg-emerald-600"}`}>{assignment.avatar}</div>
                          <div>
                            <div className="text-sm text-slate-600">{assignment.label}</div>
                            {assignment.meta && <div className="text-xs text-slate-400">{assignment.meta}</div>}
                          </div>
                        </div>
                      ) : <span className="text-sm text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="relative flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(asset)}><Eye size={14}/></Button>
                        {canEditAssets && <Button variant="ghost" size="sm" onClick={() => setEditingAsset(asset)}><Edit size={14}/></Button>}
                        {canEditAssets && <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(asset.id)}><Trash2 size={14} className="text-red-400"/></Button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!assetsLoading && paged.length === 0 && <EmptyState title="No assets found" description="Try adjusting your search or filters"/>}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage}/>
          </div>
        )}
      </Card>
      {dataError && (
        <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {dataError}
        </div>
      )}

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" size="sm">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"><AlertTriangle size={18} className="text-red-500"/></div>
          <p className="text-sm text-slate-600">Are you sure you want to delete this asset? This action cannot be undone.</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                await deleteAsset(deleteConfirm);
                setDeleteConfirm(null);
              } catch {
                // Error is surfaced by the context toast/banner.
              }
            }}
          >
            Delete Asset
          </Button>
        </div>
      </Modal>

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Asset" size="lg">
        <AddAssetForm onCancel={() => setAddModalOpen(false)} onSuccess={() => setAddModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!selectedAsset} onClose={() => setSelectedAsset(null)} title="Asset Details" size="lg">
        {selectedAsset && (
          <AssetViewModalContent
            asset={selectedAsset}
            getEmp={getEmp}
            getTeam={getTeam}
            getProject={getProject}
            assetTypeIcon={assetTypeIcon}
            assetAssignments={assetAssignments}
            temporary={temporary}
          />
        )}
      </Modal>

      <Modal isOpen={!!editingAsset} onClose={() => setEditingAsset(null)} title="Edit Asset" size="lg">
        {editingAsset && (
          <EditAssetForm
            asset={editingAsset}
            employees={employees}
            getTeam={getTeam}
            getProject={getProject}
            onCancel={() => setEditingAsset(null)}
            onSuccess={() => setEditingAsset(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function AssetViewModalContent({ asset, getEmp, getTeam, getProject, assetTypeIcon, assetAssignments, temporary }) {
  const activeAssignment = getActiveAssetAssignment(asset.id, assetAssignments);
  const currentAssignment = getAssignmentLabel(activeAssignment, getEmp, getTeam, getProject);
  const history = getAssetHistory(asset.id, assetAssignments, getEmp, getTeam, getProject, temporary);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
          {assetTypeIcon(asset.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-slate-800">{asset.name}</h3>
            <Badge status={asset.status} />
          </div>
          <p className="text-sm text-slate-400 mt-1">{asset.id} · {asset.serial}</p>
          {asset.description && <p className="text-sm text-slate-600 mt-3">{asset.description}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-400 mb-1">Asset Type</div>
          <div className="text-sm font-medium text-slate-700">{asset.type}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-400 mb-1">Serial Number</div>
          <div className="text-sm font-medium text-slate-700">{asset.serial}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-400 mb-1">Purchase Date</div>
          <div className="text-sm font-medium text-slate-700">{asset.purchaseDate || "N/A"}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-400 mb-1">Status</div>
          <div className="text-sm font-medium text-slate-700">{asset.status}</div>
        </div>
      </div>

      <Card className="p-5">
        <div className="text-sm font-semibold text-slate-800 mb-3">Assigned To</div>
        {currentAssignment ? (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${currentAssignment.kind === "employee" ? "bg-blue-600" : "bg-emerald-600"}`}>
              {currentAssignment.avatar}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700">{currentAssignment.label}</div>
              <div className="text-xs text-slate-400">{currentAssignment.meta}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <AlertCircle size={16} />
            Unassigned
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="text-sm font-semibold text-slate-800 mb-3">Asset History</div>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="text-sm font-semibold text-slate-700">{entry.label}</div>
                  <div className="text-xs text-slate-400">{entry.status}</div>
                </div>
                {entry.meta && <div className="text-xs text-slate-400 mb-2">{entry.meta}</div>}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Assigned Date</div>
                      <div className="text-slate-700">{formatdatetime(entry.assignedDate)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Return Date</div>
                      <div className="text-slate-700">{formatdatetime(entry.returnDate)}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-sm text-slate-400">No assignment history available for this asset yet.</div>
        )}
      </Card>
    </div>
  );
}

export function AddAssetForm({ onCancel, onSuccess }) {
  const { addAsset, navigate, canEditAssets } = useApp();
  const [form, setForm] = useState({ type: "", name: "", serial: "", purchaseDate: "", description: "" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (!canEditAssets) {
    return <NotAuthorized message="You do not have permission to add assets." />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type || !form.name || !form.serial) return;
    try {
      await addAsset(form);
      onSuccess?.();
    } catch {
      // Toast is handled in the context.
    }
  };

  const handleCancel = () => {
    onCancel?.();
    if (!onCancel) {
      navigate("/assets");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Asset Type" required>
          <Select value={form.type} onChange={e => set("type", e.target.value)} required>
            <option value="">Select type...</option>
            {["Laptop","Phone","Pendrive","Data Cable","Charger"].map(t => <option key={t}>{t}</option>)}
          </Select>
        </FormField>
        <FormField label="Asset Name" required>
          <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Dell XPS 15" required/>
        </FormField>
        <FormField label="Serial Number" required>
          <Input value={form.serial} onChange={e => set("serial", e.target.value)} placeholder="e.g. SN-2024-001" required/>
        </FormField>
        <FormField label="Purchase Date">
          <Input type="date" value={form.purchaseDate} onChange={e => set("purchaseDate", e.target.value)}/>
        </FormField>
      </div>
      <FormField label="Description">
        <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Optional description..."/>
      </FormField>
      <div className="flex gap-3 pt-2">
        <Button type="submit"><Check size={14}/>Save Asset</Button>
        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function EditAssetForm({ asset, employees, getTeam, getProject, onCancel, onSuccess }) {
  const { updateAsset } = useApp();
  const lockedByTeam = asset.assignmentType === "team";
  const lockedByProject = asset.assignmentType === "project";
  const lockedByTemporary = asset.assignmentType === "temporary";
  const assignedGroupName = lockedByTeam
    ? getTeam(asset.assignmentRef)?.name
    : lockedByProject
      ? getProject(asset.assignmentRef)?.name
      : null;
  const [form, setForm] = useState({
    type: asset.type || "",
    name: asset.name || "",
    serial: asset.serial || "",
    purchaseDate: asset.purchaseDate || "",
    description: asset.description || "",
    status: asset.status === "Temporary" ? "Assigned" : asset.status || "Available",
    assignedTo: asset.assignedTo || "",
  });

  const set = (key, value) => {
    setForm((prev) => {
      if (key === "status" && value !== "Assigned") {
        return { ...prev, status: value, assignedTo: "" };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type || !form.name || !form.serial) return;
    if (form.status === "Assigned" && !form.assignedTo) return;

    try {
      await updateAsset(asset.id, {
        type: form.type,
        name: form.name,
        serial: form.serial,
        purchaseDate: form.purchaseDate,
        description: form.description,
        status: form.status,
        assignedTo: form.status === "Assigned" ? form.assignedTo : null,
      });
      onSuccess?.();
    } catch {
      // Toast is handled in the context.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Asset Type" required>
          <Select value={form.type} onChange={(e) => set("type", e.target.value)} required>
            <option value="">Select type...</option>
            {["Laptop", "Phone", "Pendrive", "Data Cable", "Charger"].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Asset Name" required>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </FormField>
        <FormField label="Serial Number" required>
          <Input value={form.serial} onChange={(e) => set("serial", e.target.value)} required />
        </FormField>
        <FormField label="Purchase Date">
          <Input type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {lockedByTeam || lockedByProject || lockedByTemporary ? (
          <FormField label="Assignment">
            <Input
              value={
                lockedByTeam
                  ? `${assignedGroupName || "Assigned Team"} (Team)`
                  : lockedByProject
                    ? `${assignedGroupName || "Assigned Project"} (Project)`
                    : "Temporary allocation"
              }
              readOnly
              className="bg-slate-50"
            />
          </FormField>
        ) : (
          <>
            <FormField label="Status" required>
              <Select value={form.status} onChange={(e) => set("status", e.target.value)} required>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
              </Select>
            </FormField>
            {form.status === "Assigned" && (
              <FormField label="Assigned To" required>
                <Select value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} required>
                  <option value="">Select employee...</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}
          </>
        )}
      </div>

      {(lockedByTeam || lockedByProject || lockedByTemporary) && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          This asset is currently controlled by the {lockedByTeam ? "team allocation" : lockedByProject ? "project allocation" : "temporary allocation"} flow, so it cannot be reassigned to an employee.
        </div>
      )}

      <FormField label="Description">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional description..." />
      </FormField>

      <div className="flex gap-3 pt-2">
        <Button type="submit"><Check size={14}/>Save Changes</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// Add Asset
export function AddAssetPage() {
  const { canEditAssets } = useApp();

  if (!canEditAssets) {
    return <NotAuthorized message="You do not have permission to add assets." />;
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Add New Asset" subtitle="Fill in the details to add a new asset to the inventory"/>
      <Card className="p-6">
        <AddAssetForm />
      </Card>
    </div>
  );
}

// Asset Detail
export function AssetDetailPage() {
  const { routeParams, getAsset, getEmployee, getTeam, getProject, assetAssignments, temporary, navigate, showToast, canViewAssets, canEditAssets } = useApp();
  const asset = getAsset(routeParams.id);
  const [assignModal, setAssignModal] = useState(false);
  const [tempModal, setTempModal] = useState(false);

  if (!canViewAssets) return <NotAuthorized message="You need asset view permission to access this page." />;
  if (!asset) return <div className="text-slate-400 text-sm">Asset not found.</div>;

  const assetTypeIcon = (type) => {
    const map = { Laptop: Monitor, Phone: Smartphone, Pendrive: HardDrive, "Data Cable": Cable, Charger: Zap };
    const Icon = map[type] || Package;
    return <Icon size={24} className="text-blue-600"/>;
  };

  const activeAssignment = getActiveAssetAssignment(asset.id, assetAssignments);
  const currentAssignment = getAssignmentLabel(activeAssignment, getEmployee, getTeam, getProject);
  const history = getAssetHistory(asset.id, assetAssignments, getEmployee, getTeam, getProject, temporary);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/assets")}><ChevronLeft size={14}/>Assets</Button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600">{asset.name}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                {assetTypeIcon(asset.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-800">{asset.name}</h2>
                  <Badge status={asset.status}/>
                </div>
                <p className="text-sm text-slate-400 mt-1">{asset.id} · {asset.serial}</p>
                {asset.description && <p className="text-sm text-slate-600 mt-3">{asset.description}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
              {[
                { label: "Type", value: asset.type },
                { label: "Serial No.", value: asset.serial },
                { label: "Purchase Date", value: asset.purchaseDate || "N/A" },
                { label: "Status", value: asset.status },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-slate-400 mb-1">{label}</div>
                  <div className="text-sm font-medium text-slate-700">{value}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Allocation History */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Allocation History</h3>
            <div className="space-y-3">
              {history.length > 0 ? (
                history.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="text-sm font-semibold text-slate-700">{entry.label}</div>
                      <div className="text-xs text-slate-400">{entry.status}</div>
                    </div>
                    {entry.meta && <div className="text-xs text-slate-400 mb-2">{entry.meta}</div>}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Assigned Date</div>
                        <div className="text-slate-700">{formatdatetime(entry.assignedDate)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Return Date</div>
                        <div className="text-slate-700">{formatdatetime(entry.returnDate)}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400">No assignment history available for this asset yet.</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Current Assignment */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Current Assignment</h3>
            {currentAssignment ? (
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${currentAssignment.kind === "employee" ? "bg-blue-600" : "bg-emerald-600"}`}>{currentAssignment.avatar}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{currentAssignment.label}</div>
                  <div className="text-xs text-slate-400">{currentAssignment.meta}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <AlertCircle size={16}/> Unassigned
              </div>
            )}
          </Card>

          {/* Actions */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Actions</h3>
            {canEditAssets ? (
              <div className="space-y-2">
                <Button className="w-full justify-center" onClick={() => setAssignModal(true)}><UserCheck size={14}/>Assign Asset</Button>
                <Button variant="secondary" className="w-full justify-center" onClick={() => showToast("Asset marked as unused", "info")}><X size={14}/>Mark Unused</Button>
                <Button variant="secondary" className="w-full justify-center" onClick={() => navigate("/temporary/create")}><Clock size={14}/>Temp Allocate</Button>
                <Button variant="secondary" className="w-full justify-center" onClick={() => navigate(`/assets/${asset.id}/edit`)}><Edit size={14}/>Edit Asset</Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                You have view-only access for assets. Modifications, assignments, and temporary allocations are disabled.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// Employees Page
