import { useState, useEffect, createContext, useContext, useCallback } from "react";
import {
  LayoutDashboard, Package, PackagePlus, Users, Beaker, FolderKanban,
  Clock, ChevronDown, ChevronRight, Bell, Search, Filter, Plus, Eye,
  Edit, Trash2, UserCheck, X, Check, AlertTriangle, Menu, LogOut,
  TrendingUp, ArrowUpRight, MoreVertical, Calendar, Tag, Hash,
  Building2, Briefcase, Monitor, Smartphone, Cable, Zap, HardDrive,
  ChevronLeft, RefreshCw, Download, Upload, Settings, Home, Shield,
  BarChart3, PieChart, Activity, Layers, Link, UserPlus, FileText,
  CheckCircle, XCircle, Clock3, AlertCircle, Loader2, Info
} from "lucide-react";

// ============================================================
// MOCK DATA
// ============================================================
const mockEmployees = [
  { id: "EMP001", name: "Arjun Mehta", department: "Engineering", designation: "Senior Developer", avatar: "AM" },
  { id: "EMP002", name: "Priya Sharma", department: "Design", designation: "UI/UX Lead", avatar: "PS" },
  { id: "EMP003", name: "Rohan Das", department: "Product", designation: "Product Manager", avatar: "RD" },
  { id: "EMP004", name: "Sneha Patel", department: "Engineering", designation: "Backend Developer", avatar: "SP" },
  { id: "EMP005", name: "Vikram Singh", department: "QA", designation: "QA Engineer", avatar: "VS" },
  { id: "EMP006", name: "Ananya Roy", department: "HR", designation: "HR Manager", avatar: "AR" },
  { id: "EMP007", name: "Karan Gupta", department: "Engineering", designation: "DevOps Engineer", avatar: "KG" },
  { id: "EMP008", name: "Meera Joshi", department: "Marketing", designation: "Marketing Lead", avatar: "MJ" },
  { id: "EMP009", name: "Rahul Nair", department: "Sales", designation: "Sales Executive", avatar: "RN" },
  { id: "EMP010", name: "Divya Kapoor", department: "Finance", designation: "Finance Analyst", avatar: "DK" },
];

const mockAssets = [
  { id: "AST001", name: "Dell XPS 15", type: "Laptop", serial: "DX15-2024-001", status: "Assigned", assignedTo: "EMP001", purchaseDate: "2024-01-15", description: "High performance laptop for development" },
  { id: "AST002", name: "Samsung 128GB Pendrive", type: "Pendrive", serial: "SAM-PD-002", status: "Available", assignedTo: null, purchaseDate: "2024-02-10", description: "USB 3.0 storage device" },
  { id: "AST003", name: "iPhone 14 Pro", type: "Phone", serial: "IPH14-003", status: "Assigned", assignedTo: "EMP002", purchaseDate: "2024-01-20", description: "Company mobile device" },
  { id: "AST004", name: "MacBook Pro M3", type: "Laptop", serial: "MBP-M3-004", status: "Assigned", assignedTo: "EMP003", purchaseDate: "2024-03-05", description: "Apple MacBook for design work" },
  { id: "AST005", name: "USB-C Data Cable", type: "Data Cable", serial: "USB-C-005", status: "Available", assignedTo: null, purchaseDate: "2024-02-28", description: "USB-C to USB-C cable 2m" },
  { id: "AST006", name: "Lenovo ThinkPad X1", type: "Laptop", serial: "LTP-X1-006", status: "Temporary", assignedTo: "EMP005", purchaseDate: "2023-11-10", description: "Slim business laptop" },
  { id: "AST007", name: "Samsung Charger 65W", type: "Charger", serial: "SAM-CHR-007", status: "Available", assignedTo: null, purchaseDate: "2024-04-01", description: "Fast charging adapter" },
  { id: "AST008", name: "OnePlus 12", type: "Phone", serial: "OP12-008", status: "Assigned", assignedTo: "EMP004", purchaseDate: "2024-02-14", description: "Android flagship device" },
  { id: "AST009", name: "SanDisk 64GB Pendrive", type: "Pendrive", serial: "SDK-PD-009", status: "Available", assignedTo: null, purchaseDate: "2024-03-20", description: "Compact USB storage" },
  { id: "AST010", name: "Apple MacBook Air M2", type: "Laptop", serial: "MBA-M2-010", status: "Assigned", assignedTo: "EMP006", purchaseDate: "2024-01-05", description: "Lightweight laptop for HR" },
  { id: "AST011", name: "Lightning Cable", type: "Data Cable", serial: "LGT-CB-011", status: "Temporary", assignedTo: "EMP007", purchaseDate: "2023-12-15", description: "Apple lightning cable" },
  { id: "AST012", name: "HP Pavilion 15", type: "Laptop", serial: "HPP-15-012", status: "Available", assignedTo: null, purchaseDate: "2023-10-22", description: "Mid-range business laptop" },
];

const mockRnDTeams = [
  { id: "RND001", name: "AI Research Team", manager: "EMP001", members: ["EMP002", "EMP004", "EMP007"], assets: ["AST001", "AST004"], description: "Focused on machine learning research" },
  { id: "RND002", name: "Platform Innovation", manager: "EMP003", members: ["EMP005", "EMP009"], assets: ["AST010", "AST012"], description: "Building next-gen platform features" },
  { id: "RND003", name: "Security R&D", manager: "EMP007", members: ["EMP006", "EMP010"], assets: ["AST003"], description: "Cybersecurity research and development" },
];

const mockProjects = [
  { id: "PRJ001", code: "PROJ-001", name: "Customer Portal Redesign", manager: "EMP002", members: ["EMP001", "EMP005", "EMP008"], assets: ["AST002", "AST005", "AST009"], status: "Active" },
  { id: "PRJ002", code: "PROJ-002", name: "Mobile App v3.0", manager: "EMP003", members: ["EMP004", "EMP007"], assets: ["AST003", "AST008"], status: "Active" },
  { id: "PRJ003", code: "PROJ-003", name: "Data Analytics Platform", manager: "EMP001", members: ["EMP006", "EMP009", "EMP010"], assets: ["AST010", "AST012"], status: "Planning" },
];

const mockTemporary = [
  { id: "TMP001", employeeId: "EMP005", assetId: "AST006", issueDate: "2024-05-01", returnDate: "2024-05-15", reason: "Conference presentation", modalName: "Internal Conference", givenBy: "EMP006", receivedBy: "EMP001", status: "Active" },
  { id: "TMP002", employeeId: "EMP007", assetId: "AST011", issueDate: "2024-04-20", returnDate: "2024-04-30", reason: "Client demo", modalName: "Client Meeting", givenBy: "EMP001", receivedBy: "EMP003", status: "Returned" },
  { id: "TMP003", employeeId: "EMP009", assetId: "AST009", issueDate: "2024-05-10", returnDate: "2024-05-20", reason: "Data transfer project", modalName: "Q2 Data Migration", givenBy: "EMP003", receivedBy: "EMP006", status: "Active" },
];

const mockActivities = [
  { id: 1, action: "Asset Assigned", description: "Dell XPS 15 assigned to Arjun Mehta", time: "2 hours ago", type: "assign", icon: "assign" },
  { id: 2, action: "New Asset Added", description: "Samsung 128GB Pendrive added to inventory", time: "4 hours ago", type: "add", icon: "add" },
  { id: 3, action: "Asset Returned", description: "Lightning Cable returned by Karan Gupta", time: "Yesterday", type: "return", icon: "return" },
  { id: 4, action: "Team Created", description: "AI Research Team created with 3 members", time: "2 days ago", type: "team", icon: "team" },
  { id: 5, action: "Project Allocated", description: "Assets allocated to Customer Portal project", time: "3 days ago", type: "project", icon: "project" },
];

// ============================================================
// CONTEXT
// ============================================================
const AppContext = createContext();

function AppProvider({ children }) {
  const [assets, setAssets] = useState(mockAssets);
  const [employees] = useState(mockEmployees);
  const [rndTeams, setRndTeams] = useState(mockRnDTeams);
  const [projects, setProjects] = useState(mockProjects);
  const [temporary, setTemporary] = useState(mockTemporary);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState("/dashboard");
  const [routeParams, setRouteParams] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const navigate = useCallback((path, params = {}) => {
    setCurrentPage(path);
    setRouteParams(params);
    setMobileSidebarOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const getEmployee = (id) => employees.find(e => e.id === id);
  const getAsset = (id) => assets.find(a => a.id === id);
  const getTeam = (id) => rndTeams.find(t => t.id === id);
  const getProject = (id) => projects.find(p => p.id === id);
  const getTemp = (id) => temporary.find(t => t.id === id);

  const addAsset = (asset) => {
    const newAsset = { ...asset, id: `AST${String(assets.length + 1).padStart(3, '0')}`, status: "Available", assignedTo: null };
    setAssets(prev => [...prev, newAsset]);
    showToast("Asset added successfully!");
    navigate("/assets");
  };

  const deleteAsset = (id) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    showToast("Asset deleted.", "info");
  };

  const addTeam = (team) => {
    const newTeam = { ...team, id: `RND${String(rndTeams.length + 1).padStart(3, '0')}` };
    setRndTeams(prev => [...prev, newTeam]);
    showToast("R&D Team created!");
    navigate("/rnd");
  };

  const addProject = (project) => {
    const newProject = { ...project, id: `PRJ${String(projects.length + 1).padStart(3, '0')}`, status: "Active" };
    setProjects(prev => [...prev, newProject]);
    showToast("Project created!");
    navigate("/projects");
  };

  const addTemporary = (alloc) => {
    const newAlloc = { ...alloc, id: `TMP${String(temporary.length + 1).padStart(3, '0')}`, status: "Active" };
    setTemporary(prev => [...prev, newAlloc]);
    setAssets(prev => prev.map(a => a.id === alloc.assetId ? { ...a, status: "Temporary", assignedTo: alloc.employeeId } : a));
    showToast("Temporary allocation created!");
    navigate("/temporary");
  };

  const returnAsset = (tempId) => {
    const temp = temporary.find(t => t.id === tempId);
    if (temp) {
      setTemporary(prev => prev.map(t => t.id === tempId ? { ...t, status: "Returned" } : t));
      setAssets(prev => prev.map(a => a.id === temp.assetId ? { ...a, status: "Available", assignedTo: null } : a));
      showToast("Asset returned successfully!");
      navigate("/temporary");
    }
  };

  return (
    <AppContext.Provider value={{
      assets, employees, rndTeams, projects, temporary,
      toast, showToast, navigate, currentPage, routeParams,
      sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen,
      getEmployee, getAsset, getTeam, getProject, getTemp,
      addAsset, deleteAsset, addTeam, addProject, addTemporary, returnAsset
    }}>
      {children}
    </AppContext.Provider>
  );
}

const useApp = () => useContext(AppContext);

// ============================================================
// UI COMPONENTS
// ============================================================

function Toast({ toast }) {
  if (!toast) return null;
  const colors = { success: "bg-emerald-500", error: "bg-red-500", info: "bg-blue-500", warning: "bg-amber-500" };
  const icons = { success: <CheckCircle size={16}/>, error: <XCircle size={16}/>, info: <Info size={16}/>, warning: <AlertCircle size={16}/> };
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-medium animate-slide-in ${colors[toast.type] || colors.success}`}>
      {icons[toast.type] || icons.success}
      {toast.message}
    </div>
  );
}

function Badge({ status }) {
  const styles = {
    Available: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Assigned: "bg-blue-50 text-blue-700 border border-blue-200",
    Temporary: "bg-amber-50 text-amber-700 border border-amber-200",
    Returned: "bg-slate-100 text-slate-600 border border-slate-200",
    Active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Planning: "bg-violet-50 text-violet-700 border border-violet-200",
    Inactive: "bg-red-50 text-red-600 border border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || styles.Active}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === "Available" || status === "Active" ? "bg-emerald-500" : status === "Assigned" ? "bg-blue-500" : status === "Temporary" ? "bg-amber-500" : "bg-slate-400"}`}></span>
      {status}
    </span>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>{children}</div>;
}

function Button({ children, onClick, variant = "primary", size = "md", className = "", disabled = false, type = "button" }) {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
    ghost: "hover:bg-slate-100 text-slate-600",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-150 ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}>
      {children}
    </button>
  );
}

function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;
  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-3xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><X size={18}/></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={14}/></Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-8 h-8 text-xs font-medium rounded-lg transition-all ${p === currentPage ? "bg-blue-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}>
          {p}
        </button>
      ))}
      <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight size={14}/></Button>
    </div>
  );
}

function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Package size={28} className="text-slate-400"/>
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1,2,3,4].map(i => (
        <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse"/>
      ))}
    </div>
  );
}

function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ============================================================
// FORM COMPONENTS
// ============================================================

function FormField({ label, required, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input {...props} className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white ${props.className || ""}`}/>
  );
}

function Select({ children, ...props }) {
  return (
    <select {...props} className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white ${props.className || ""}`}>
      {children}
    </select>
  );
}

function Textarea({ ...props }) {
  return (
    <textarea {...props} rows={3} className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white resize-none ${props.className || ""}`}/>
  );
}

function EmployeeSelect({ value, onChange, placeholder = "Select employee..." }) {
  const { employees } = useApp();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const selected = employees.find(e => e.id === value);
  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all hover:border-slate-300">
        {selected ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{selected.avatar}</div>
            <span className="text-slate-700">{selected.name}</span>
            <span className="text-slate-400 text-xs">· {selected.department}</span>
          </div>
        ) : <span className="text-slate-400">{placeholder}</span>}
        <ChevronDown size={14} className="text-slate-400"/>
      </button>
      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee..."
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"/>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(emp => (
              <button key={emp.id} type="button" onClick={() => { onChange(emp.id); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 transition-colors text-left ${value === emp.id ? "bg-blue-50" : ""}`}>
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{emp.avatar}</div>
                <div>
                  <div className="font-medium text-slate-700">{emp.name}</div>
                  <div className="text-xs text-slate-400">{emp.department} · {emp.designation}</div>
                </div>
                {value === emp.id && <Check size={14} className="ml-auto text-blue-600"/>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AssetSelect({ value, onChange, onlyAvailable = false, placeholder = "Select asset..." }) {
  const { assets } = useApp();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const filtered_assets = onlyAvailable ? assets.filter(a => a.status === "Available") : assets;
  const selected = assets.find(a => a.id === value);
  const filtered = filtered_assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  );
  const assetIcon = (type) => {
    const icons = { Laptop: Monitor, Phone: Smartphone, Pendrive: HardDrive, "Data Cable": Cable, Charger: Zap };
    const Icon = icons[type] || Package;
    return <Icon size={14} className="text-slate-500"/>;
  };
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all hover:border-slate-300">
        {selected ? (
          <div className="flex items-center gap-2">
            {assetIcon(selected.type)}
            <span className="text-slate-700">{selected.name}</span>
            <Badge status={selected.status}/>
          </div>
        ) : <span className="text-slate-400">{placeholder}</span>}
        <ChevronDown size={14} className="text-slate-400"/>
      </button>
      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search asset..."
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"/>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(asset => (
              <button key={asset.id} type="button" onClick={() => { onChange(asset.id); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 transition-colors text-left ${value === asset.id ? "bg-blue-50" : ""}`}>
                {assetIcon(asset.type)}
                <div className="flex-1">
                  <div className="font-medium text-slate-700">{asset.name}</div>
                  <div className="text-xs text-slate-400">{asset.type} · {asset.id}</div>
                </div>
                <Badge status={asset.status}/>
                {value === asset.id && <Check size={14} className="text-blue-600"/>}
              </button>
            ))}
            {filtered.length === 0 && <div className="py-6 text-center text-sm text-slate-400">No assets found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function MultiSelectTags({ label, options, value = [], onChange, renderOption }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = options.filter(o => {
    const text = typeof o === "string" ? o : (o.name || o.label || "");
    return text.toLowerCase().includes(search.toLowerCase()) && !value.includes(typeof o === "string" ? o : o.id);
  });
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter(v => v !== id));
    else onChange([...value, id]);
  };
  const selectedItems = options.filter(o => value.includes(typeof o === "string" ? o : o.id));
  return (
    <div className="relative">
      <div className="min-h-10 w-full flex flex-wrap gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-white cursor-pointer" onClick={() => setOpen(!open)}>
        {selectedItems.length === 0 && <span className="text-slate-400 text-sm self-center">Select {label}...</span>}
        {selectedItems.map(item => {
          const id = typeof item === "string" ? item : item.id;
          const display = typeof item === "string" ? item : (item.name || item.label);
          return (
            <span key={id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-lg">
              {display}
              <button type="button" onClick={e => { e.stopPropagation(); toggle(id); }} className="hover:text-blue-900"><X size={10}/></button>
            </span>
          );
        })}
        <ChevronDown size={14} className="text-slate-400 ml-auto self-center"/>
      </div>
      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-20">
          <div className="p-2 border-b border-slate-100">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${label}...`}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"/>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filtered.map(item => {
              const id = typeof item === "string" ? item : item.id;
              return (
                <button key={id} type="button" onClick={() => toggle(id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 transition-colors text-left">
                  {renderOption ? renderOption(item) : <span>{typeof item === "string" ? item : item.name}</span>}
                </button>
              );
            })}
            {filtered.length === 0 && <div className="py-4 text-center text-xs text-slate-400">No options</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// LAYOUT
// ============================================================

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    label: "Assets", icon: Package, children: [
      { label: "All Assets", path: "/assets", icon: Layers },
      { label: "Add Asset", path: "/assets/add", icon: PackagePlus },
    ]
  },
  {
    label: "R&D Assets", icon: Beaker, children: [
      { label: "Team Allocation", path: "/rnd", icon: Users },
    ]
  },
  {
    label: "Project Assets", icon: FolderKanban, children: [
      { label: "Project Allocation", path: "/projects", icon: Briefcase },
    ]
  },
  { label: "Temporary", path: "/temporary", icon: Clock },
  { label: "Employees", path: "/employees", icon: Users },
];

function Sidebar() {
  const { currentPage, navigate, sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen } = useApp();
  const [expanded, setExpanded] = useState({ Assets: true, "R&D Assets": true, "Project Assets": true });

  const isActive = (path) => currentPage === path || currentPage.startsWith(path + "/");

  const SidebarItem = ({ item, depth = 0 }) => {
    const hasChildren = item.children?.length > 0;
    const isExpanded = expanded[item.label];
    const active = item.path ? isActive(item.path) : item.children?.some(c => isActive(c.path));
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div>
          <button onClick={() => setExpanded(p => ({ ...p, [item.label]: !p[item.label] }))}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${active ? "text-blue-600" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"}`}>
            <Icon size={18} className={active ? "text-blue-600" : "text-slate-400"}/>
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""} text-slate-400`}/>
          </button>
          {isExpanded && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-3">
              {item.children.map(child => <SidebarItem key={child.path} item={child} depth={1}/>)}
            </div>
          )}
        </div>
      );
    }

    return (
      <button onClick={() => navigate(item.path)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive(item.path) ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"}`}>
        <Icon size={18} className={isActive(item.path) ? "text-white" : "text-slate-400"}/>
        {item.label}
      </button>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white border-r border-slate-100">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
          <Shield size={16} className="text-white"/>
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800 leading-tight">AssetFlow</div>
          <div className="text-xs text-slate-400">Management Suite</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(item => <SidebarItem key={item.label} item={item}/>)}
      </div>
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">AD</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-700 truncate">Admin User</div>
            <div className="text-xs text-slate-400 truncate">admin@company.com</div>
          </div>
          <Settings size={14} className="text-slate-400"/>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col ${sidebarOpen ? "w-60" : "w-0"} flex-shrink-0 overflow-hidden transition-all duration-300`}>
        {sidebarContent}
      </div>
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)}/>
          <div className="absolute left-0 top-0 h-full w-64 z-50">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}

function TopNavbar({ title }) {
  const { setMobileSidebarOpen, setSidebarOpen, sidebarOpen } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="h-16 bg-white border-b border-slate-100 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">
      <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileSidebarOpen(p => !p); }}
        className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
        <Menu size={20}/>
      </button>
      <h2 className="text-base font-semibold text-slate-800 flex-1">{title}</h2>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
            <Bell size={18}/>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"/>
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-30">
              <div className="px-4 py-3 border-b border-slate-100"><span className="text-sm font-semibold text-slate-800">Notifications</span></div>
              {mockActivities.slice(0, 3).map(a => (
                <div key={a.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 transition-colors cursor-pointer">
                  <div className="text-sm font-medium text-slate-700">{a.action}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{a.description} · {a.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">AD</div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin</span>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block"/>
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-sm font-semibold text-slate-800">Admin User</div>
                <div className="text-xs text-slate-400">admin@company.com</div>
              </div>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"><Settings size={14}/>Settings</button>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"><LogOut size={14}/>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGES
// ============================================================

// Dashboard
function DashboardPage() {
  const { assets, employees, rndTeams, projects, temporary, navigate } = useApp();
  const totalAssets = assets.length;
  const assignedAssets = assets.filter(a => a.status === "Assigned").length;
  const availableAssets = assets.filter(a => a.status === "Available").length;
  const tempAllocations = temporary.filter(t => t.status === "Active").length;

  const stats = [
    { label: "Total Assets", value: totalAssets, icon: Package, color: "blue", trend: "+4 this month" },
    { label: "Assigned Assets", value: assignedAssets, icon: UserCheck, color: "indigo", trend: `${Math.round(assignedAssets/totalAssets*100)}% utilization` },
    { label: "Available Assets", value: availableAssets, icon: CheckCircle, color: "emerald", trend: "Ready to allocate" },
    { label: "Temp Allocations", value: tempAllocations, icon: Clock, color: "amber", trend: "Active now" },
    { label: "R&D Teams", value: rndTeams.length, icon: Beaker, color: "violet", trend: "Research groups" },
    { label: "Projects", value: projects.length, icon: FolderKanban, color: "cyan", trend: "Active projects" },
  ];

  const colorMap = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", ring: "bg-blue-100" },
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", ring: "bg-indigo-100" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", ring: "bg-emerald-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "bg-amber-100" },
    violet: { bg: "bg-violet-50", icon: "text-violet-600", ring: "bg-violet-100" },
    cyan: { bg: "bg-cyan-50", icon: "text-cyan-600", ring: "bg-cyan-100" },
  };

  const typeStats = ["Laptop", "Phone", "Pendrive", "Data Cable", "Charger"].map(type => ({
    type, count: assets.filter(a => a.type === type).length,
    available: assets.filter(a => a.type === type && a.status === "Available").length,
  }));

  const typeColors = { Laptop: "bg-blue-500", Phone: "bg-violet-500", Pendrive: "bg-emerald-500", "Data Cable": "bg-amber-500", Charger: "bg-red-400" };

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back, Admin. Here's what's happening today."
        actions={<>
          <Button variant="secondary" size="sm"><RefreshCw size={14}/>Refresh</Button>
          <Button size="sm" onClick={() => navigate("/assets/add")}><Plus size={14}/>Add Asset</Button>
        </>}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const c = colorMap[stat.color];
          return (
            <Card key={i} className="p-4 hover:shadow-md transition-shadow cursor-default">
              <div className={`w-10 h-10 ${c.ring} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={c.icon}/>
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs font-medium text-slate-600 mt-0.5">{stat.label}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.trend}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="xl:col-span-2">
          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="font-semibold text-slate-800">Recent Activity</div>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="divide-y divide-slate-50">
              {mockActivities.map(activity => (
                <div key={activity.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Activity size={16} className="text-blue-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700">{activity.action}</div>
                    <div className="text-xs text-slate-400 truncate">{activity.description}</div>
                  </div>
                  <div className="text-xs text-slate-400 flex-shrink-0">{activity.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Asset Distribution */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="font-semibold text-slate-800 mb-4">Asset Types</div>
            <div className="space-y-3">
              {typeStats.map(({ type, count, available }) => (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600 font-medium">{type}</span>
                    <span className="text-slate-400 text-xs">{available}/{count} available</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${typeColors[type]} rounded-full transition-all`} style={{ width: count > 0 ? `${(count/totalAssets)*100}%` : '0%' }}/>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-5">
            <div className="font-semibold text-slate-800 mb-4">Quick Actions</div>
            <div className="space-y-2">
              <button onClick={() => navigate("/assets/add")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-left transition-colors group">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><PackagePlus size={15} className="text-blue-600"/></div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Add New Asset</span>
                <ArrowUpRight size={14} className="ml-auto text-slate-300 group-hover:text-blue-500"/>
              </button>
              <button onClick={() => navigate("/temporary/create")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-left transition-colors group">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center"><Clock size={15} className="text-amber-600"/></div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-amber-700">Temp Allocation</span>
                <ArrowUpRight size={14} className="ml-auto text-slate-300 group-hover:text-amber-500"/>
              </button>
              <button onClick={() => navigate("/rnd/create")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-violet-50 text-left transition-colors group">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center"><Beaker size={15} className="text-violet-600"/></div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700">Create R&D Team</span>
                <ArrowUpRight size={14} className="ml-auto text-slate-300 group-hover:text-violet-500"/>
              </button>
              <button onClick={() => navigate("/projects/create")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-left transition-colors group">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><FolderKanban size={15} className="text-emerald-600"/></div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">New Project</span>
                <ArrowUpRight size={14} className="ml-auto text-slate-300 group-hover:text-emerald-500"/>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// All Assets
function AssetsPage() {
  const { assets, employees, deleteAsset, navigate, showToast } = useApp();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [rowMenu, setRowMenu] = useState(null);
  const PER_PAGE = 8;

  const getEmp = (id) => employees.find(e => e.id === id);

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || a.type === typeFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const assetTypeIcon = (type) => {
    const map = { Laptop: Monitor, Phone: Smartphone, Pendrive: HardDrive, "Data Cable": Cable, Charger: Zap };
    const Icon = map[type] || Package;
    return <Icon size={15} className="text-slate-400"/>;
  };

  return (
    <div>
      <PageHeader title="All Assets" subtitle={`${assets.length} assets total`}
        actions={<Button onClick={() => navigate("/assets/add")}><Plus size={14}/>Add Asset</Button>}
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
              {paged.map(asset => {
                const emp = getEmp(asset.assignedTo);
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
                      {emp ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{emp.avatar}</div>
                          <span className="text-sm text-slate-600">{emp.name}</span>
                        </div>
                      ) : <span className="text-sm text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="relative flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/assets/${asset.id}`)}><Eye size={14}/></Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/assets/${asset.id}/edit`)}><Edit size={14}/></Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(asset.id)}><Trash2 size={14} className="text-red-400"/></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {paged.length === 0 && <EmptyState title="No assets found" description="Try adjusting your search or filters"/>}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage}/>
          </div>
        )}
      </Card>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" size="sm">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"><AlertTriangle size={18} className="text-red-500"/></div>
          <p className="text-sm text-slate-600">Are you sure you want to delete this asset? This action cannot be undone.</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { deleteAsset(deleteConfirm); setDeleteConfirm(null); }}>Delete Asset</Button>
        </div>
      </Modal>
    </div>
  );
}

// Add Asset
function AddAssetPage() {
  const { addAsset, navigate } = useApp();
  const [form, setForm] = useState({ type: "", name: "", serial: "", purchaseDate: "", description: "" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.type || !form.name || !form.serial) return;
    addAsset(form);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Add New Asset" subtitle="Fill in the details to add a new asset to the inventory"/>
      <Card className="p-6">
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
            <Button variant="secondary" onClick={() => navigate("/assets")}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// Asset Detail
function AssetDetailPage() {
  const { routeParams, getAsset, getEmployee, navigate, showToast } = useApp();
  const asset = getAsset(routeParams.id);
  const [assignModal, setAssignModal] = useState(false);
  const [tempModal, setTempModal] = useState(false);

  if (!asset) return <div className="text-slate-400 text-sm">Asset not found.</div>;
  const emp = getEmployee(asset.assignedTo);

  const assetTypeIcon = (type) => {
    const map = { Laptop: Monitor, Phone: Smartphone, Pendrive: HardDrive, "Data Cable": Cable, Charger: Zap };
    const Icon = map[type] || Package;
    return <Icon size={24} className="text-blue-600"/>;
  };

  const timeline = [
    { action: "Asset Added", date: asset.purchaseDate || "2024-01-01", note: "Added to inventory" },
    ...(asset.assignedTo ? [{ action: "Assigned", date: "2024-02-01", note: `Assigned to ${emp?.name}` }] : []),
  ];

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
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><Activity size={14} className="text-blue-600"/></div>
                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1"/>}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="text-sm font-medium text-slate-700">{item.action}</div>
                    <div className="text-xs text-slate-400">{item.note} · {item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Current Assignment */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Current Assignment</h3>
            {emp ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">{emp.avatar}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{emp.name}</div>
                  <div className="text-xs text-slate-400">{emp.department} · {emp.designation}</div>
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
            <div className="space-y-2">
              <Button className="w-full justify-center" onClick={() => setAssignModal(true)}><UserCheck size={14}/>Assign Asset</Button>
              <Button variant="secondary" className="w-full justify-center" onClick={() => showToast("Asset marked as unused", "info")}><X size={14}/>Mark Unused</Button>
              <Button variant="secondary" className="w-full justify-center" onClick={() => navigate("/temporary/create")}><Clock size={14}/>Temp Allocate</Button>
              <Button variant="secondary" className="w-full justify-center" onClick={() => navigate(`/assets/${asset.id}/edit`)}><Edit size={14}/>Edit Asset</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Employees Page
function EmployeesPage() {
  const { employees } = useApp();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.designation.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const deptColors = {
    Engineering: "bg-blue-100 text-blue-700", Design: "bg-pink-100 text-pink-700",
    Product: "bg-violet-100 text-violet-700", QA: "bg-amber-100 text-amber-700",
    HR: "bg-green-100 text-green-700", Marketing: "bg-orange-100 text-orange-700",
    Sales: "bg-teal-100 text-teal-700", Finance: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div>
      <PageHeader title="Employees" subtitle={`${employees.length} team members`}
        actions={<Button><UserPlus size={14}/>Add Employee</Button>}
      />
      <Card>
        <div className="p-4 border-b border-slate-100">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search employees..."/>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employee","ID","Department","Designation"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">{emp.avatar}</div>
                      <span className="text-sm font-semibold text-slate-700">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{emp.id}</span></td>
                  <td className="px-4 py-3.5"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${deptColors[emp.department] || "bg-slate-100 text-slate-600"}`}>{emp.department}</span></td>
                  <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{emp.designation}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">Showing {paged.length} of {filtered.length}</span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage}/>
          </div>
        )}
      </Card>
    </div>
  );
}

// R&D Teams
function RnDPage() {
  const { rndTeams, employees, navigate } = useApp();
  const getEmp = (id) => employees.find(e => e.id === id);

  return (
    <div>
      <PageHeader title="R&D Teams" subtitle="Research and development team allocations"
        actions={<Button onClick={() => navigate("/rnd/create")}><Plus size={14}/>Create Team</Button>}
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
                <Button variant="secondary" size="sm" className="flex-1 justify-center" onClick={() => navigate(`/rnd/${team.id}`)}><Eye size={13}/>View</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/rnd/${team.id}`)}><Edit size={13}/></Button>
              </div>
            </Card>
          );
        })}
        {rndTeams.length === 0 && <EmptyState title="No teams yet" description="Create your first R&D team" action={<Button onClick={() => navigate("/rnd/create")}>Create Team</Button>}/>}
      </div>
    </div>
  );
}

// Create R&D Team
function CreateRnDPage() {
  const { employees, assets, addTeam, navigate } = useApp();
  const [form, setForm] = useState({ name: "", manager: "", members: [], assets: [], description: "" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.manager) return;
    addTeam(form);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/rnd")}><ChevronLeft size={14}/>R&D Teams</Button>
      </div>
      <PageHeader title="Create R&D Team"/>
      <Card className="p-6">
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
            <Button variant="secondary" onClick={() => navigate("/rnd")}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// R&D Team Detail
function RnDDetailPage() {
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
function ProjectsPage() {
  const { projects, employees, navigate } = useApp();
  const getEmp = (id) => employees.find(e => e.id === id);

  return (
    <div>
      <PageHeader title="Projects" subtitle="Project asset allocations"
        actions={<Button onClick={() => navigate("/projects/create")}><Plus size={14}/>New Project</Button>}
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
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${proj.id}`)}><Eye size={14}/></Button>
                        <Button variant="ghost" size="sm"><Edit size={14}/></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {projects.length === 0 && <EmptyState title="No projects" description="Create your first project" action={<Button onClick={() => navigate("/projects/create")}>New Project</Button>}/>}
        </div>
      </Card>
    </div>
  );
}

// Create Project
function CreateProjectPage() {
  const { employees, assets, addProject, navigate } = useApp();
  const [form, setForm] = useState({ code: "", name: "", manager: "", members: [], assets: [] });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.manager) return;
    addProject(form);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}><ChevronLeft size={14}/>Projects</Button>
      </div>
      <PageHeader title="Create Project"/>
      <Card className="p-6">
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
            <Button variant="secondary" onClick={() => navigate("/projects")}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// Project Detail
function ProjectDetailPage() {
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

// Temporary Allocations
function TemporaryPage() {
  const { temporary, employees, assets, navigate } = useApp();
  const getEmp = (id) => employees.find(e => e.id === id);
  const getAsset = (id) => assets.find(a => a.id === id);

  const getDuration = (issue, ret) => {
    const days = Math.round((new Date(ret) - new Date(issue)) / 86400000);
    return `${days} day${days !== 1 ? "s" : ""}`;
  };

  return (
    <div>
      <PageHeader title="Temporary Allocations" subtitle={`${temporary.filter(t => t.status === "Active").length} active allocations`}
        actions={<Button onClick={() => navigate("/temporary/create")}><Plus size={14}/>Create Allocation</Button>}
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
                    <td className="px-4 py-3.5"><span className="text-sm text-slate-600">{alloc.returnDate}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-medium text-slate-700">{getDuration(alloc.issueDate, alloc.returnDate)}</span></td>
                    <td className="px-4 py-3.5"><Badge status={alloc.status}/></td>
                    <td className="px-4 py-3.5"><Button variant="ghost" size="sm" onClick={() => navigate(`/temporary/${alloc.id}`)}><Eye size={14}/></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {temporary.length === 0 && <EmptyState title="No allocations" description="Create a temporary allocation" action={<Button onClick={() => navigate("/temporary/create")}>Create</Button>}/>}
        </div>
      </Card>
    </div>
  );
}

// Create Temporary Allocation
function CreateTemporaryPage() {
  const { employees, assets, addTemporary, navigate } = useApp();
  const availableAssets = assets.filter(a => a.status === "Available");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ employeeId: "", assetId: "", reason: "", modalName: "", issueDate: "", returnDate: "", givenBy: "", receivedBy: "" });
  const [confirmModal, setConfirmModal] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const selectedAsset = assets.find(a => a.id === form.assetId);
  const duration = form.issueDate && form.returnDate ? Math.round((new Date(form.returnDate) - new Date(form.issueDate)) / 86400000) : null;

  const handleSubmit = () => {
    addTemporary(form);
    setConfirmModal(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/temporary")}><ChevronLeft size={14}/>Temporary</Button>
      </div>
      <PageHeader title="Create Temporary Allocation"/>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-6">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>{s}</div>
            <span className={`text-sm font-medium ${step >= s ? "text-slate-700" : "text-slate-400"}`}>{s === 1 ? "Select Asset" : "Fill Details"}</span>
            {s < 2 && <div className="w-8 h-0.5 bg-slate-200 ml-1"/>}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-5">
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
            <Button onClick={() => setStep(2)} disabled={!form.assetId}>Next: Fill Details<ChevronRight size={14}/></Button>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Given By">
                <EmployeeSelect value={form.givenBy} onChange={v => set("givenBy", v)} placeholder="Select..."/>
              </FormField>
              <FormField label="Received By">
                <EmployeeSelect value={form.receivedBy} onChange={v => set("receivedBy", v)} placeholder="Select..."/>
              </FormField>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(1)}><ChevronLeft size={14}/>Back</Button>
              <Button onClick={() => setConfirmModal(true)} disabled={!form.employeeId || !form.issueDate || !form.returnDate}>
                <Check size={14}/>Submit Allocation
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Confirm Allocation" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Asset</span><span className="font-medium text-slate-700">{selectedAsset?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Employee</span><span className="font-medium text-slate-700">{employees.find(e => e.id === form.employeeId)?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Period</span><span className="font-medium text-slate-700">{form.issueDate} → {form.returnDate}</span></div>
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

// Temporary Detail
function TemporaryDetailPage() {
  const { routeParams, temporary, getEmployee, getAsset, navigate, returnAsset } = useApp();
  const alloc = temporary.find(t => t.id === routeParams.id);
  const [returnModal, setReturnModal] = useState(false);
  if (!alloc) return <div className="text-slate-400 text-sm">Allocation not found.</div>;
  const emp = getEmployee(alloc.employeeId);
  const asset = getAsset(alloc.assetId);
  const givenBy = getEmployee(alloc.givenBy);
  const receivedBy = getEmployee(alloc.receivedBy);
  const duration = Math.round((new Date(alloc.returnDate) - new Date(alloc.issueDate)) / 86400000);

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
                <div className="text-sm font-semibold text-slate-700">{alloc.returnDate}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Duration</div>
                <div className="text-sm font-semibold text-amber-700">{duration} days</div>
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
          <Button variant="success" onClick={() => { returnAsset(alloc.id); setReturnModal(false); }}><Check size={14}/>Confirm Return</Button>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================
// ROUTER / APP
// ============================================================

const pageConfig = {
  "/dashboard": { component: DashboardPage, title: "Dashboard" },
  "/assets": { component: AssetsPage, title: "All Assets" },
  "/assets/add": { component: AddAssetPage, title: "Add Asset" },
  "/assets/:id": { component: AssetDetailPage, title: "Asset Detail" },
  "/assets/:id/edit": { component: AssetDetailPage, title: "Edit Asset" },
  "/employees": { component: EmployeesPage, title: "Employees" },
  "/rnd": { component: RnDPage, title: "R&D Teams" },
  "/rnd/create": { component: CreateRnDPage, title: "Create R&D Team" },
  "/rnd/:id": { component: RnDDetailPage, title: "Team Detail" },
  "/projects": { component: ProjectsPage, title: "Projects" },
  "/projects/create": { component: CreateProjectPage, title: "Create Project" },
  "/projects/:id": { component: ProjectDetailPage, title: "Project Detail" },
  "/temporary": { component: TemporaryPage, title: "Temporary Allocations" },
  "/temporary/create": { component: CreateTemporaryPage, title: "Create Allocation" },
  "/temporary/:id": { component: TemporaryDetailPage, title: "Allocation Detail" },
};

function matchRoute(currentPath) {
  for (const [pattern, config] of Object.entries(pageConfig)) {
    const patternParts = pattern.split("/");
    const pathParts = currentPath.split("/");
    if (patternParts.length !== pathParts.length) continue;
    const params = {};
    let match = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        match = false; break;
      }
    }
    if (match) return { ...config, params };
  }
  return { component: DashboardPage, title: "Dashboard", params: {} };
}

function AppContent() {
  const { currentPage, toast, routeParams } = useApp();
  const { navigate } = useApp();
  const matched = matchRoute(currentPage);
  const PageComponent = matched.component;
  const mergedParams = { ...matched.params, ...routeParams };

  const contextValue = useApp();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar/>
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar title={matched.title}/>
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <PageComponent/>
        </main>
      </div>
      <Toast toast={toast}/>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        code, .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes slide-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
      <AppContent/>
    </AppProvider>
  );
}