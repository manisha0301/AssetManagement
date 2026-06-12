import { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clock3,
  Edit,
  Eye,
  Package,
  Plus,
  RefreshCw,
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
  NotAuthorized,
  PageHeader,
  Select,
  Textarea,
} from "../../components/Common";
import { useApp } from "../../context/AppContext";

export function TemporaryPage() {
  const { temporary, employees, assets, navigate, canViewAssets, canEditAssets } = useApp();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const getEmp = (id) => employees.find(e => e.id === id);
  const getAsset = (id) => assets.find(a => a.id === id);

  const getDuration = (issue, ret) => {
    const days = Math.round((new Date(ret) - new Date(issue)) / 86400000);
    return `${days} day${days !== 1 ? "s" : ""}`;
  };

  if (!canViewAssets) {
    return <NotAuthorized message="You need view permission to access temporary allocations." />;
  }

  return (
    <div>
      <PageHeader title="Temporary Allocations" subtitle={`${temporary.filter(t => t.status === "Active").length} active allocations`}
        actions={canEditAssets ? <Button onClick={() => setCreateModalOpen(true)}><Plus size={14}/>Create Allocation</Button> : null}
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employee","Asset","Issue Date","Return Date","Duration","Status","Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {temporary.map(alloc => {
                const emp = getEmp(alloc.employeeId);
                const asset = getAsset(alloc.assetId);
                return (
                  <tr key={alloc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      {emp && <div className="flex items-center gap-2"><div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{emp.avatar}</div><span className="text-sm text-slate-700">{emp.name}</span></div>}
                    </td>
                    <td className="px-4 py-3.5">{asset && <div><div className="text-sm font-medium text-slate-700">{asset.name}</div><div className="text-xs text-slate-400">{asset.type}</div></div>}</td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{alloc.issueDate}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{alloc.status === "Active" ? "Active" : alloc.returnDate || "N/A"}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-medium text-slate-700">{alloc.status === "Active" ? "Active" : getDuration(alloc.issueDate, alloc.returnDate)}</span></td>
                    <td className="px-4 py-3.5"><Badge status={alloc.status}/></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAllocation(alloc)}><Eye size={14}/></Button>
                        {canEditAssets && <Button variant="ghost" size="sm" onClick={() => setEditingAllocation(alloc)}><Edit size={14}/></Button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {temporary.length === 0 && <EmptyState title="No allocations" description={canEditAssets ? "Create a temporary allocation" : "No allocations are available."} action={canEditAssets ? <Button onClick={() => setCreateModalOpen(true)}>Create</Button> : null}/>}
        </div>
      </Card>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Temporary Allocation" size="xl">
        <CreateTemporaryForm onCancel={() => setCreateModalOpen(false)} onSuccess={() => setCreateModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!selectedAllocation} onClose={() => setSelectedAllocation(null)} title="Allocation Details" size="lg">
        {selectedAllocation && (
          <TemporaryViewModalContent
            allocation={selectedAllocation}
            getEmp={getEmp}
            getAsset={getAsset}
            getDuration={getDuration}
          />
        )}
      </Modal>

      <Modal isOpen={!!editingAllocation} onClose={() => setEditingAllocation(null)} title="Edit Temporary Allocation" size="lg">
        {editingAllocation && (
          <EditTemporaryForm
            allocation={editingAllocation}
            onCancel={() => setEditingAllocation(null)}
            onSuccess={() => setEditingAllocation(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export function CreateTemporaryForm({ onCancel, onSuccess }) {
  const { employees, assets, addTemporary, navigate, canEditAssets } = useApp();
  const availableAssets = assets.filter(a => a.status === "Available");
  const [step, setStep] = useState(1);

  if (!canEditAssets) {
    return <NotAuthorized message="You do not have permission to create temporary allocations." />;
  }
  const [form, setForm] = useState({ employeeId: "", assetId: "", reason: "", modalName: "", issueDate: "", returnDate: "", givenBy: "" });
  const [confirmModal, setConfirmModal] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const selectedAsset = assets.find(a => a.id === form.assetId);
  const duration = form.issueDate && form.returnDate ? Math.round((new Date(form.returnDate) - new Date(form.issueDate)) / 86400000) : null;

  const handleSubmit = async () => {
    try {
      await addTemporary(form);
      setConfirmModal(false);
      onSuccess?.();
    } catch {
      // Toasts are handled in the shared app context.
    }
  };

  const handleCancel = () => {
    onCancel?.();
    if (!onCancel) {
      navigate("/temporary");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>{s}</div>
            <span className={`text-sm font-medium ${step >= s ? "text-slate-700" : "text-slate-400"}`}>{s === 1 ? "Select Asset" : "Fill Details"}</span>
            {s < 2 && <div className="w-8 h-0.5 bg-slate-200 ml-1"/>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-5 min-h-[420px] flex flex-col">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700">
            <strong>Step 1:</strong> Select from available assets only. Only unassigned assets can be temporarily allocated.
          </div>
          <FormField label="Select Asset" required hint={`${availableAssets.length} assets available`}>
            <AssetSelect value={form.assetId} onChange={v => set("assetId", v)} onlyAvailable placeholder="Choose an available asset..."/>
          </FormField>
          {selectedAsset && (
            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
              <div className="text-sm font-semibold text-slate-700">{selectedAsset.name}</div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Type: {selectedAsset.type}</span>
                <span>S/N: {selectedAsset.serial}</span>
                <Badge status={selectedAsset.status}/>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2 mt-auto">
            <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
            <Button onClick={() => setStep(2)} disabled={!form.assetId}>Next: Fill Details<ChevronRight size={14}/></Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          {selectedAsset && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <Package size={16} className="text-blue-600"/>
              <span className="text-sm font-medium text-blue-700">{selectedAsset.name}</span>
              <span className="text-xs text-blue-500">{selectedAsset.type}</span>
              <button onClick={() => setStep(1)} className="ml-auto text-xs text-blue-500 hover:underline">Change</button>
            </div>
          )}

          <FormField label="Employee" required>
            <EmployeeSelect value={form.employeeId} onChange={v => set("employeeId", v)}/>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Asset Type">
              <Input value={selectedAsset?.type || ""} readOnly className="bg-slate-50"/>
            </FormField>
            <FormField label="Modal Name">
              <Input value={form.modalName} onChange={e => set("modalName", e.target.value)} placeholder="e.g. Client Meeting"/>
            </FormField>
          </div>

          <FormField label="Reason / Description">
            <Textarea value={form.reason} onChange={e => set("reason", e.target.value)} placeholder="Purpose of this allocation..."/>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date of Issue" required>
              <Input type="date" value={form.issueDate} onChange={e => set("issueDate", e.target.value)} required/>
            </FormField>
            <FormField label="Date of Return" required>
              <Input type="date" value={form.returnDate} onChange={e => set("returnDate", e.target.value)} required/>
            </FormField>
          </div>

          {duration !== null && duration >= 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
              <Clock3 size={14}/> Duration: <strong>{duration} day{duration !== 1 ? "s" : ""}</strong>
            </div>
          )}

          <FormField label="Given By">
            <EmployeeSelect value={form.givenBy} onChange={v => set("givenBy", v)} placeholder="Select..."/>
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setStep(1)}><ChevronLeft size={14}/>Back</Button>
            <Button onClick={() => setConfirmModal(true)} disabled={!form.employeeId || !form.issueDate || !form.returnDate}>
              <Check size={14}/>Submit Allocation
            </Button>
          </div>
        </div>
      )}

      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Confirm Allocation" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Asset</span><span className="font-medium text-slate-700">{selectedAsset?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Employee</span><span className="font-medium text-slate-700">{employees.find(e => e.id === form.employeeId)?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Period</span><span className="font-medium text-slate-700">{form.issueDate} - {form.returnDate}</span></div>
            {duration !== null && <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-medium text-amber-700">{duration} days</span></div>}
          </div>
          <p className="text-sm text-slate-600">Confirm this temporary allocation? The asset will be marked as temporarily assigned.</p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setConfirmModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit}><Check size={14}/>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TemporaryViewModalContent({ allocation, getEmp, getAsset, getDuration }) {
  const employee = getEmp(allocation.employeeId);
  const asset = getAsset(allocation.assetId);
  const givenBy = getEmp(allocation.givenBy);
  const receivedBy = getEmp(allocation.receivedBy);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-400 mb-1">Employee</div>
          <div className="text-sm font-medium text-slate-700">{employee?.name || "N/A"}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-400 mb-1">Asset</div>
          <div className="text-sm font-medium text-slate-700">{asset?.name || "N/A"}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-400 mb-1">Issue Date</div>
          <div className="text-sm font-medium text-slate-700">{allocation.issueDate}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-400 mb-1">Return Date</div>
          <div className="text-sm font-medium text-slate-700">{allocation.status === "Active" ? "Active" : allocation.returnDate || "N/A"}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-400 mb-1">Duration</div>
          <div className="text-sm font-medium text-slate-700">{allocation.status === "Active" ? "Active" : getDuration(allocation.issueDate, allocation.returnDate)}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-400 mb-1">Status</div>
          <div className="text-sm font-medium text-slate-700">{allocation.status}</div>
        </div>
      </div>

      <Card className="p-5">
        <div className="text-sm font-semibold text-slate-800 mb-3">Handover</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Given By</div>
            <div className="text-sm text-slate-700">{givenBy?.name || "N/A"}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Received By</div>
            <div className="text-sm text-slate-700">{receivedBy?.name || "N/A"}</div>
          </div>
        </div>
      </Card>

      {allocation.reason && (
        <Card className="p-5">
          <div className="text-sm font-semibold text-slate-800 mb-3">Reason</div>
          <div className="text-sm text-slate-700">{allocation.reason}</div>
        </Card>
      )}
    </div>
  );
}

function EditTemporaryForm({ allocation, onCancel, onSuccess }) {
  const { employees, assets, updateTemporary, canEditAssets } = useApp();

  if (!canEditAssets) {
    return <NotAuthorized message="You do not have permission to edit temporary allocations." />;
  }

  const [form, setForm] = useState({
    employeeId: allocation.employeeId || "",
    assetId: allocation.assetId || "",
    modalName: allocation.modalName || "",
    reason: allocation.reason || "",
    issueDate: allocation.issueDate || "",
    returnDate: allocation.returnDate || "",
    givenBy: allocation.givenBy || "",
    receivedBy: allocation.receivedBy || "",
    status: allocation.status || "Active",
  });
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const selectableAssets = assets.filter(
    (asset) => asset.id === allocation.assetId || asset.status === "Available"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.assetId || !form.issueDate || !form.returnDate) return;
    if (form.status === "Returned" && !form.receivedBy) return;

    try {
      await updateTemporary(allocation.id, {
        ...form,
        receivedBy: form.status === "Returned" ? form.receivedBy : "",
      });
      onSuccess?.();
    } catch {
      // Toasts are handled in the shared app context.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField label="Employee" required>
        <EmployeeSelect value={form.employeeId} onChange={(value) => set("employeeId", value)} />
      </FormField>
      <FormField label="Asset" required>
        <AssetSelect
          value={form.assetId}
          onChange={(value) => set("assetId", value)}
          assets={selectableAssets}
          placeholder="Select asset..."
        />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Modal Name">
          <Input value={form.modalName} onChange={(e) => set("modalName", e.target.value)} />
        </FormField>
        <FormField label="Status" required>
          <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="Active">Active</option>
            <option value="Returned">Returned</option>
          </Select>
        </FormField>
      </div>
      <FormField label="Reason / Description">
        <Textarea value={form.reason} onChange={(e) => set("reason", e.target.value)} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Date of Issue" required>
          <Input type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} required />
        </FormField>
        <FormField label="Date of Return" required>
          <Input type="date" value={form.returnDate} onChange={(e) => set("returnDate", e.target.value)} required />
        </FormField>
      </div>
      <div className={`grid grid-cols-1 gap-4 ${form.status === "Returned" ? "sm:grid-cols-2" : ""}`}>
        <FormField label="Given By">
          <EmployeeSelect value={form.givenBy} onChange={(value) => set("givenBy", value)} placeholder="Select..." />
        </FormField>
        {form.status === "Returned" && (
          <FormField label="Received By" required>
            <EmployeeSelect value={form.receivedBy} onChange={(value) => set("receivedBy", value)} placeholder="Select..." />
          </FormField>
        )}
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit"><Check size={14}/>Save Changes</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// Create Temporary Allocation
export function CreateTemporaryPage() {
  const { navigate } = useApp();

  return (
    <div className="max-w-2xl ">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/temporary")}><ChevronLeft size={14}/>Temporary</Button>
      </div>
      <PageHeader title="Create Temporary Allocation"/>
      <Card className="p-6">
        <CreateTemporaryForm />
      </Card>
    </div>
  );
}

// Temporary Detail
export function TemporaryDetailPage() {
  const { routeParams, temporary, getEmployee, getAsset, navigate, returnAsset } = useApp();
  const alloc = temporary.find(t => t.id === routeParams.id);
  const [returnModal, setReturnModal] = useState(false);
  if (!alloc) return <div className="text-slate-400 text-sm">Allocation not found.</div>;
  const emp = getEmployee(alloc.employeeId);
  const asset = getAsset(alloc.assetId);
  const givenBy = getEmployee(alloc.givenBy);
  const receivedBy = getEmployee(alloc.receivedBy);
  const duration = alloc.status === "Active" || !alloc.returnDate
    ? null
    : Math.round((new Date(alloc.returnDate) - new Date(alloc.issueDate)) / 86400000);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/temporary")}><ChevronLeft size={14}/>Temporary</Button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600">{alloc.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3"><h2 className="text-xl font-bold text-slate-800">Allocation {alloc.id}</h2><Badge status={alloc.status}/></div>
                <p className="text-sm text-slate-400 mt-1">{alloc.modalName || "Temporary allocation"}</p>
              </div>
              {alloc.status === "Active" && (
                <Button variant="success" onClick={() => setReturnModal(true)}><RefreshCw size={14}/>Return Asset</Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <div>
                <div className="text-xs text-slate-400 mb-1">Issue Date</div>
                <div className="text-sm font-semibold text-slate-700">{alloc.issueDate}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Return Date</div>
                <div className="text-sm font-semibold text-slate-700">{alloc.status === "Active" ? "Active" : alloc.returnDate || "N/A"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Duration</div>
                <div className="text-sm font-semibold text-amber-700">{duration === null ? "Active" : `${duration} days`}</div>
              </div>
            </div>
            {alloc.reason && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <div className="text-xs text-slate-400 mb-1">Reason</div>
                <div className="text-sm text-slate-600">{alloc.reason}</div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-5">
            <Card className="p-5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Given By</div>
              {givenBy && <div className="flex items-center gap-3"><div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">{givenBy.avatar}</div><div><div className="text-sm font-semibold text-slate-700">{givenBy.name}</div><div className="text-xs text-slate-400">{givenBy.designation}</div></div></div>}
            </Card>
            <Card className="p-5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Received By</div>
              {receivedBy && <div className="flex items-center gap-3"><div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">{receivedBy.avatar}</div><div><div className="text-sm font-semibold text-slate-700">{receivedBy.name}</div><div className="text-xs text-slate-400">{receivedBy.designation}</div></div></div>}
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Employee</div>
            {emp && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">{emp.avatar}</div>
                <div><div className="text-sm font-semibold text-slate-700">{emp.name}</div><div className="text-xs text-slate-400">{emp.department}</div><div className="text-xs text-slate-400">{emp.designation}</div></div>
              </div>
            )}
          </Card>
          <Card className="p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Asset</div>
            {asset && (
              <div className="space-y-2">
                <div className="flex items-center gap-2"><Package size={16} className="text-slate-400"/><span className="text-sm font-semibold text-slate-700">{asset.name}</span></div>
                <div className="text-xs text-slate-400">Type: {asset.type}</div>
                <div className="text-xs text-slate-400">S/N: {asset.serial}</div>
                <Badge status={asset.status}/>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal isOpen={returnModal} onClose={() => setReturnModal(false)} title="Return Asset" size="sm">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0"><RefreshCw size={18} className="text-emerald-600"/></div>
          <div>
            <p className="text-sm font-medium text-slate-700">Confirm Asset Return</p>
            <p className="text-sm text-slate-500 mt-1">Mark <strong>{asset?.name}</strong> as returned? The asset will be available for future allocations.</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setReturnModal(false)}>Cancel</Button>
          <Button
            variant="success"
            onClick={async () => {
              try {
                await returnAsset(alloc.id);
                setReturnModal(false);
              } catch {
                // Toasts are handled in the shared app context.
              }
            }}
          >
            <Check size={14}/>Confirm Return
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================
// ROUTER / APP
// ============================================================
