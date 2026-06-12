import { useState } from "react";
import {
  Beaker,
  Bell,
  Briefcase,
  ChevronDown,
  Clock,
  FolderKanban,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Package,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import image1 from "../assets/Bkristellar_logo.png";

const getInitials = (name = "Admin User") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    label: "Assets", icon: Package, children: [
      { label: "All Assets", path: "/assets", icon: Layers },
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
  // { label: "Employees", path: "/employees", icon: Users },
];

export function Sidebar() {
  const { currentPage, navigate, sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen, authUser, openModal } = useApp();
  const [expanded, setExpanded] = useState({ Assets: true, "R&D Assets": true, "Project Assets": true });
  const displayName = authUser?.displayName || "Admin User";
  const email = authUser?.email || "admin@assetflow.com";
  const initials = getInitials(displayName);

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
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${active ? "text-blue-600" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"}`}>
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
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${isActive(item.path) ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"}`}>
        <Icon size={18} className={isActive(item.path) ? "text-white" : "text-slate-400"}/>
        {item.label}
      </button>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white border-r border-slate-100">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <img src={image1} alt="Logo" className="w-20 h-8"/>
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
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">{initials}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-700 truncate">{displayName}</div>
            <div className="text-xs text-slate-400 truncate">{email}</div>
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

export function TopNavbar({ title }) {
  const { activityLogs, setMobileSidebarOpen, setSidebarOpen, sidebarOpen, authUser, logout, openModal } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const displayName = authUser?.displayName || "Admin User";
  const email = authUser?.email || "admin@assetflow.com";
  const initials = getInitials(displayName);
  const recentActivities = [...activityLogs]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);

  const formatActivityTime = (createdAt) => {
    if (!createdAt) return "";

    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";

    const diffMs = Math.max(0, Date.now() - date.getTime());
    const hourMs = 60 * 60 * 1000;
    const dayMs = 24 * hourMs;
    const weekMs = 7 * dayMs;

    if (diffMs < dayMs) {
      const hours = Math.max(1, Math.floor(diffMs / hourMs));
      return `${hours}hrs ago`;
    }

    if (diffMs < weekMs) {
      const days = Math.max(1, Math.floor(diffMs / dayMs));
      return `${days}day${days === 1 ? "" : "s"} ago`;
    }

    const weeks = Math.max(1, Math.floor(diffMs / weekMs));
    return `${weeks}week${weeks === 1 ? "" : "s"} ago`;
  };

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
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const activityTime = formatActivityTime(activity.createdAt);

                  return (
                    <div key={activity.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-slate-700">{activity.action}</div>
                      <div className="mt-0.5 flex items-center justify-between gap-3 text-xs text-slate-400">
                        <span className="min-w-0 flex-1 truncate">{activity.description}</span>
                        {activityTime ? <span className="flex-shrink-0 text-right">{activityTime}</span> : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-5 text-sm text-slate-400">No activity logs yet.</div>
              )}
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">{initials}</div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{displayName.split(" ")[0]}</span>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block"/>
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-sm font-semibold text-slate-800">{displayName}</div>
                <div className="text-xs text-slate-400">{email}</div>
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  setNotifOpen(false);
                  openModal("/settings");
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              ><Settings size={14}/>Settings</button>
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                onClick={() => {
                  setProfileOpen(false);
                  setNotifOpen(false);
                  logout();
                }}
              >
                <LogOut size={14}/>Sign Out
              </button>
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


