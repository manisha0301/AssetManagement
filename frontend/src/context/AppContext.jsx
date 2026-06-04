import { createContext, useCallback, useContext, useState } from "react";
import {
  mockActivities,
  mockAssets,
  mockEmployees,
  mockProjects,
  mockRnDTeams,
  mockTemporary,
} from "../data/mockData";

// ============================================================
// CONTEXT
// ============================================================
const AppContext = createContext();

const assetTypePrefixes = {
  Laptop: "LAP",
  Pendrive: "PEN",
  Phone: "PHN",
  "Data Cable": "DTC",
  Charger: "CHR",
};

const getAssetPrefix = (type) => assetTypePrefixes[type] || "AST";

const cloneRecords = (records) => records.map((record) => ({ ...record }));

const generateAssetId = (type, assetList, excludeId = null) => {
  const prefix = getAssetPrefix(type);
  const highestSequence = assetList
    .filter((asset) => asset.id !== excludeId && asset.id.startsWith(prefix))
    .reduce((max, asset) => {
      const sequence = Number.parseInt(asset.id.slice(prefix.length), 10);
      return Number.isNaN(sequence) ? max : Math.max(max, sequence);
    }, 0);

  return `${prefix}${String(highestSequence + 1).padStart(3, "0")}`;
};

export function AppProvider({ children }) {
  const [assets, setAssets] = useState(() => cloneRecords(mockAssets));
  const [employees] = useState(() => cloneRecords(mockEmployees));
  const [rndTeams, setRndTeams] = useState(() => cloneRecords(mockRnDTeams));
  const [projects, setProjects] = useState(() => cloneRecords(mockProjects));
  const [temporary, setTemporary] = useState(() => cloneRecords(mockTemporary));
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
    const newAsset = {
      ...asset,
      id: generateAssetId(asset.type, assets),
      status: "Available",
      assignedTo: null,
      assignmentType: null,
      assignmentRef: null,
      assignedDate: null,
    };
    setAssets(prev => [...prev, newAsset]);
    showToast("Asset added successfully!");
    navigate("/assets");
  };

  const deleteAsset = (id) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    showToast("Asset deleted.", "info");
  };

  const updateAsset = (id, updates) => {
    let nextAssetId = id;

    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id !== id) return asset;

        const nextType = updates.type ?? asset.type;
        nextAssetId = nextType !== asset.type ? generateAssetId(nextType, prev, id) : asset.id;

        const nextStatus = updates.status ?? asset.status;
        const assignmentChanged =
          nextStatus === "Assigned" &&
          (asset.status !== "Assigned" || updates.assignedTo !== asset.assignedTo);
        const nextAssignedTo =
          nextStatus === "Assigned"
            ? updates.assignedTo ?? asset.assignedTo
            : null;
        const nextAssignmentType = nextStatus === "Assigned" ? "employee" : null;
        const nextAssignmentRef = nextStatus === "Assigned" ? nextAssignedTo : null;
        const nextAssignedDate =
          nextStatus === "Assigned"
            ? assignmentChanged
              ? new Date().toISOString().slice(0, 10)
              : asset.assignedDate ?? new Date().toISOString().slice(0, 10)
            : null;

        return {
          ...asset,
          ...updates,
          id: nextAssetId,
          status: nextStatus,
          assignedTo: nextAssignedTo,
          assignmentType: nextAssignmentType,
          assignmentRef: nextAssignmentRef,
          assignedDate: nextAssignedDate,
        };
      })
    );

    if (nextAssetId !== id) {
      setRndTeams((prev) =>
        prev.map((team) => ({
          ...team,
          assets: team.assets.map((assetId) => (assetId === id ? nextAssetId : assetId)),
        }))
      );
      setProjects((prev) =>
        prev.map((project) => ({
          ...project,
          assets: project.assets.map((assetId) => (assetId === id ? nextAssetId : assetId)),
        }))
      );
      setTemporary((prev) =>
        prev.map((allocation) => ({
          ...allocation,
          assetId: allocation.assetId === id ? nextAssetId : allocation.assetId,
        }))
      );
    }

    showToast("Asset updated successfully!");
  };

  const addTeam = (team) => {
    const newTeam = { ...team, id: `RND${String(rndTeams.length + 1).padStart(3, '0')}` };
    setRndTeams(prev => [...prev, newTeam]);
    setAssets((prev) =>
      prev.map((asset) =>
        newTeam.assets.includes(asset.id)
          ? {
              ...asset,
              status: "Assigned",
              assignedTo: null,
              assignmentType: "team",
              assignmentRef: newTeam.id,
              assignedDate: new Date().toISOString().slice(0, 10),
            }
          : asset
      )
    );
    showToast("R&D Team created!");
    navigate("/rnd");
  };

  const updateTeam = (id, updates) => {
    const existingTeam = rndTeams.find((team) => team.id === id);
    if (!existingTeam) return;

    const nextTeam = { ...existingTeam, ...updates };
    setRndTeams((prev) => prev.map((team) => (team.id === id ? nextTeam : team)));

    const removedAssetIds = existingTeam.assets.filter((assetId) => !nextTeam.assets.includes(assetId));
    const addedAssetIds = nextTeam.assets.filter((assetId) => !existingTeam.assets.includes(assetId));

    setAssets((prev) =>
      prev.map((asset) => {
        if (removedAssetIds.includes(asset.id) && asset.assignmentType === "team" && asset.assignmentRef === id) {
          return {
            ...asset,
            status: "Available",
            assignedTo: null,
            assignmentType: null,
            assignmentRef: null,
            assignedDate: null,
          };
        }

        if (addedAssetIds.includes(asset.id)) {
          return {
            ...asset,
            status: "Assigned",
            assignedTo: null,
            assignmentType: "team",
            assignmentRef: id,
            assignedDate: new Date().toISOString().slice(0, 10),
          };
        }

        return asset;
      })
    );

    showToast("R&D Team updated successfully!");
  };

  const addProject = (project) => {
    const newProject = { ...project, id: `PRJ${String(projects.length + 1).padStart(3, '0')}`, status: "Active" };
    setProjects(prev => [...prev, newProject]);
    setAssets((prev) =>
      prev.map((asset) =>
        newProject.assets.includes(asset.id)
          ? {
              ...asset,
              status: "Assigned",
              assignedTo: null,
              assignmentType: "project",
              assignmentRef: newProject.id,
              assignedDate: new Date().toISOString().slice(0, 10),
            }
          : asset
      )
    );
    showToast("Project created!");
    navigate("/projects");
  };

  const updateProject = (id, updates) => {
    const existingProject = projects.find((project) => project.id === id);
    if (!existingProject) return;

    const nextProject = { ...existingProject, ...updates };
    setProjects((prev) => prev.map((project) => (project.id === id ? nextProject : project)));

    const removedAssetIds = existingProject.assets.filter((assetId) => !nextProject.assets.includes(assetId));
    const addedAssetIds = nextProject.assets.filter((assetId) => !existingProject.assets.includes(assetId));

    setAssets((prev) =>
      prev.map((asset) => {
        if (removedAssetIds.includes(asset.id) && asset.assignmentType === "project" && asset.assignmentRef === id) {
          return {
            ...asset,
            status: "Available",
            assignedTo: null,
            assignmentType: null,
            assignmentRef: null,
            assignedDate: null,
          };
        }

        if (addedAssetIds.includes(asset.id)) {
          return {
            ...asset,
            status: "Assigned",
            assignedTo: null,
            assignmentType: "project",
            assignmentRef: id,
            assignedDate: new Date().toISOString().slice(0, 10),
          };
        }

        return asset;
      })
    );

    showToast("Project updated successfully!");
  };

  const addTemporary = (alloc) => {
    const newAlloc = { ...alloc, id: `TMP${String(temporary.length + 1).padStart(3, '0')}`, status: "Active" };
    setTemporary(prev => [...prev, newAlloc]);
    setAssets(prev => prev.map(a => a.id === alloc.assetId ? { ...a, status: "Temporary", assignedTo: alloc.employeeId, assignmentType: "temporary", assignmentRef: newAlloc.id, assignedDate: null } : a));
    showToast("Temporary allocation created!");
    navigate("/temporary");
  };

  const updateTemporary = (id, updates) => {
    const existingAllocation = temporary.find((allocation) => allocation.id === id);
    if (!existingAllocation) return;

    const nextAllocation = { ...existingAllocation, ...updates };
    setTemporary((prev) => prev.map((allocation) => (allocation.id === id ? nextAllocation : allocation)));

    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === existingAllocation.assetId && existingAllocation.assetId !== nextAllocation.assetId) {
          return {
            ...asset,
            status: "Available",
            assignedTo: null,
            assignmentType: null,
            assignmentRef: null,
            assignedDate: null,
          };
        }

        if (asset.id === nextAllocation.assetId) {
          return {
            ...asset,
            status: nextAllocation.status === "Returned" ? "Available" : "Temporary",
            assignedTo: nextAllocation.status === "Returned" ? null : nextAllocation.employeeId,
            assignmentType: nextAllocation.status === "Returned" ? null : "temporary",
            assignmentRef: nextAllocation.status === "Returned" ? null : id,
            assignedDate: null,
          };
        }

        return asset;
      })
    );

    showToast("Temporary allocation updated successfully!");
  };

  const returnAsset = (tempId) => {
    const temp = temporary.find(t => t.id === tempId);
    if (temp) {
      setTemporary(prev => prev.map(t => t.id === tempId ? { ...t, status: "Returned" } : t));
      setAssets(prev => prev.map(a => a.id === temp.assetId ? { ...a, status: "Available", assignedTo: null, assignmentType: null, assignmentRef: null, assignedDate: null } : a));
      showToast("Asset returned successfully!");
      navigate("/temporary");
    }
  };

  const refreshAppData = useCallback(() => {
    setAssets(cloneRecords(mockAssets));
    setRndTeams(cloneRecords(mockRnDTeams));
    setProjects(cloneRecords(mockProjects));
    setTemporary(cloneRecords(mockTemporary));
    showToast("Dashboard data refreshed.", "info");
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      assets, employees, rndTeams, projects, temporary,
      toast, showToast, navigate, currentPage, routeParams,
      sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen,
      getEmployee, getAsset, getTeam, getProject, getTemp,
      addAsset, deleteAsset, updateAsset, addTeam, updateTeam, addProject, updateProject, addTemporary, updateTemporary, returnAsset,
      refreshAppData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

export { mockActivities };


