import { useState } from "react";
import {
  AlertCircle,
  Cable,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Info,
  Monitor,
  Package,
  Search,
  Smartphone,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export function Toast({ toast }) {
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

export function Badge({ status }) {
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

export function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>{children}</div>;
}

export function Button({ children, onClick, variant = "primary", size = "md", className = "", disabled = false, type = "button" }) {
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
      className={`inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-150 cursor-pointer ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}>
      {children}
    </button>
  );
}

export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;
  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-3xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"><X size={18}/></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/>
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={14}/></Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-8 h-8 text-xs font-medium rounded-lg transition-all cursor-pointer ${p === currentPage ? "bg-blue-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}>
          {p}
        </button>
      ))}
      <Button variant="secondary" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight size={14}/></Button>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
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

export function NotAuthorized({ message = "You do not have permission to view this content." }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center">
      <div className="text-2xl text-rose-600 mb-3"><AlertCircle size={28} /></div>
      <div className="text-lg font-semibold text-slate-800 mb-2">Access Denied</div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1,2,3,4].map(i => (
        <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse"/>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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

export function FormField({ label, required, children, hint }) {
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

export function Input({ ...props }) {
  return (
    <input {...props} className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white ${props.className || ""}`}/>
  );
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white ${props.className || ""}`}>
      {children}
    </select>
  );
}

export function Textarea({ ...props }) {
  return (
    <textarea {...props} rows={3} className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white resize-none ${props.className || ""}`}/>
  );
}

export function EmployeeSelect({ value, onChange, placeholder = "Select employee..." }) {
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
        className="w-full flex items-center justify-between px-3 py-2 cursor-pointer text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all hover:border-slate-300">
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
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 transition-colors text-left cursor-pointer ${value === emp.id ? "bg-blue-50" : ""}`}>
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

export function AssetSelect({ value, onChange, onlyAvailable = false, placeholder = "Select asset...", assets: providedAssets }) {
  const { assets } = useApp();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const sourceAssets = providedAssets || assets;
  const filtered_assets = onlyAvailable ? sourceAssets.filter(a => a.status === "Available") : sourceAssets;
  const selected = sourceAssets.find(a => a.id === value) || assets.find(a => a.id === value);
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
        className="w-full flex items-center justify-between px-3 py-2 text-sm cursor-pointer border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all hover:border-slate-300">
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
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 transition-colors text-left cursor-pointer ${value === asset.id ? "bg-blue-50" : ""}`}>
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

export function MultiSelectTags({ label, options, value = [], onChange, renderOption }) {
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
              <button type="button" onClick={e => { e.stopPropagation(); toggle(id); }} className="hover:text-blue-900 cursor-pointer"><X size={10}/></button>
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 transition-colors text-left cursor-pointer">
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

