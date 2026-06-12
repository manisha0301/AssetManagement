import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Beaker,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  FolderKanban,
  Package,
  PackagePlus,
  PieChart,
  Plus,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { Badge, Button, Card, Modal, PageHeader } from "../../components/Common";
import { useApp } from "../../context/AppContext";
import { AddAssetForm } from "../assets/AssetsPage";
import { CreateProjectForm } from "../projects/ProjectsPage";
import { CreateRnDForm } from "../rnd/RnDPage";
import { CreateTemporaryForm } from "../temporary/TemporaryPage";

export default function DashboardPage() {
  const { assets, employees, rndTeams, projects, temporary, activityLogs, navigate, refreshAppData, canEditAssets } = useApp();
  const [openPanel, setOpenPanel] = useState("assetTypes");
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [temporaryModalOpen, setTemporaryModalOpen] = useState(false);
  const [rndModalOpen, setRndModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const totalAssets = assets.length;
  const assignedAssets = assets.filter((a) => a.status === "Assigned").length;
  const availableAssets = assets.filter((a) => a.status === "Available").length;
  const tempAllocations = temporary.filter((t) => t.status === "Active").length;

  const stats = [
    { label: "Total Assets", value: totalAssets, icon: Package, color: "blue", trend: "+4 this month" },
    {
      label: "Assigned Assets",
      value: assignedAssets,
      icon: UserCheck,
      color: "indigo",
      trend: `${Math.round((assignedAssets / totalAssets) * 100)}% utilization`,
    },
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

  const typeStats = ["Laptop", "Phone", "Pendrive", "Data Cable", "Charger"].map((type) => ({
    type,
    count: assets.filter((a) => a.type === type).length,
    available: assets.filter((a) => a.type === type && a.status === "Available").length,
  }));

  const typeColors = {
    Laptop: "bg-blue-500",
    Phone: "bg-violet-500",
    Pendrive: "bg-emerald-500",
    "Data Cable": "bg-amber-500",
    Charger: "bg-red-400",
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      refreshAppData();
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back, Admin. Here's what's happening today."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            {/* <Button size="sm" onClick={() => navigate("/assets/add")}>
              <Plus size={14} />
              Add Asset
            </Button> */}
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const color = colorMap[stat.color];

          return (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-default">
              <div className={`w-10 h-10 ${color.ring} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={color.icon} />
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs font-medium text-slate-600 mt-0.5">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="font-semibold text-slate-800">Recent Activity</div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="divide-y divide-slate-50">
              {(activityLogs.length > 0 ? activityLogs : []).slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Activity size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700">{activity.action}</div>
                    <div className="text-xs text-slate-400 truncate">{activity.description}</div>
                  </div>
                  <div className="text-xs text-slate-400 flex-shrink-0">{activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ""}</div>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <div className="px-5 py-6 text-sm text-slate-400">No activity logs yet.</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <button
              type="button"
              onClick={() => setOpenPanel((current) => (current === "assetTypes" ? null : "assetTypes"))}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="font-semibold text-slate-800">Asset Types</div>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${openPanel === "assetTypes" ? "rotate-180" : ""}`}
              />
            </button>
            {openPanel === "assetTypes" && (
              <div className="space-y-3 mt-4">
                {typeStats.map(({ type, count, available }) => (
                  <div key={type}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-600 font-medium">{type}</span>
                      <span className="text-slate-400 text-xs">{available}/{count} available</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${typeColors[type]} rounded-full transition-all`}
                        style={{ width: count > 0 ? `${(count / totalAssets) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <button
              type="button"
              onClick={() => setOpenPanel((current) => (current === "quickActions" ? "assetTypes" : "quickActions"))}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="font-semibold text-slate-800">Quick Actions</div>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${openPanel === "quickActions" ? "rotate-180" : ""}`}
              />
            </button>
            {openPanel === "quickActions" && (
              <div className="space-y-2 mt-2">
                {canEditAssets && (
                  <button
                    onClick={() => setAssetModalOpen(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-left transition-colors group"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PackagePlus size={15} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Add New Asset</span>
                    <ArrowUpRight size={14} className="ml-auto text-slate-300 group-hover:text-blue-500" />
                  </button>
                )}
                {canEditAssets && (
                  <button
                    onClick={() => setTemporaryModalOpen(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-left transition-colors group"
                  >
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock size={15} className="text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-amber-700">Temp Allocation</span>
                    <ArrowUpRight size={14} className="ml-auto text-slate-300 group-hover:text-amber-500" />
                  </button>
                )}
                {canEditAssets && (
                  <button
                    onClick={() => setRndModalOpen(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-violet-50 text-left transition-colors group"
                  >
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Beaker size={15} className="text-violet-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700">Create R&D Team</span>
                    <ArrowUpRight size={14} className="ml-auto text-slate-300 group-hover:text-violet-500" />
                  </button>
                )}
                {canEditAssets && (
                  <button
                    onClick={() => setProjectModalOpen(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-left transition-colors group"
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FolderKanban size={15} className="text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">New Project</span>
                    <ArrowUpRight size={14} className="ml-auto text-slate-300 group-hover:text-emerald-500" />
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal isOpen={assetModalOpen} onClose={() => setAssetModalOpen(false)} title="Add New Asset" size="lg">
        <AddAssetForm onCancel={() => setAssetModalOpen(false)} onSuccess={() => setAssetModalOpen(false)} />
      </Modal>

      <Modal isOpen={temporaryModalOpen} onClose={() => setTemporaryModalOpen(false)} title="Create Temporary Allocation" size="xl">
        <CreateTemporaryForm onCancel={() => setTemporaryModalOpen(false)} onSuccess={() => setTemporaryModalOpen(false)} />
      </Modal>

      <Modal isOpen={rndModalOpen} onClose={() => setRndModalOpen(false)} title="Create R&D Team" size="lg">
        <CreateRnDForm onCancel={() => setRndModalOpen(false)} onSuccess={() => setRndModalOpen(false)} />
      </Modal>

      <Modal isOpen={projectModalOpen} onClose={() => setProjectModalOpen(false)} title="Create Project" size="lg">
        <CreateProjectForm onCancel={() => setProjectModalOpen(false)} onSuccess={() => setProjectModalOpen(false)} />
      </Modal>
    </div>
  );
}
