import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { mockActivities } from "../data/mockData";
import {
  addProjectMember,
  addTeamMember,
  closeAssetAssignment,
  closeTemporaryIssue,
  createAsset as createAssetRequest,
  createAssetAssignment,
  createProject as createProjectRequest,
  createTeam as createTeamRequest,
  createTemporaryIssue,
  deleteAsset as deleteAssetRequest,
  deleteProject as deleteProjectRequest,
  deleteTeam as deleteTeamRequest,
  deleteTemporaryIssue,
  fetchAssetActiveAssignment,
  fetchAssetAssignments,
  fetchAssets,
  fetchActivityLogs,
  fetchEmployees,
  fetchProjectMembers,
  fetchProjects,
  fetchTeams,
  fetchTeamMembers,
  fetchTemporaryIssues,
  normalizeAsset,
  normalizeActivityLog,
  normalizeEmployee,
  normalizeProject,
  normalizeTemporaryIssue,
  normalizeTeam,
  removeProjectMember,
  removeTeamMember,
  login as loginRequest,
  updateAsset as updateAssetRequest,
  updateProject as updateProjectRequest,
  updateTeam as updateTeamRequest,
  updateTemporaryIssue,
} from "../lib/api";

const AppContext = createContext();
const AUTH_STORAGE_KEY = "assetflow_auth_user";
const DEFAULT_LOGIN_PATH = "/login";
const DEFAULT_DASHBOARD_PATH = "/dashboard";

const cloneRecords = (records) => records.map((record) => ({ ...record }));

function normalizeAssignmentRow(row) {
  return {
    assignment_id: row.assignment_id,
    asset_id: row.asset_id,
    assigned_to_type: row.assigned_to_type,
    employee_id: row.employee_id || null,
    team_id: row.team_id || null,
    project_id: row.project_id || null,
    assigned_date: row.assigned_date || null,
    return_date: row.return_date || null,
    status: row.status || "Active",
  };
}

function composeTeams(rawTeams, teamMembersMap, assignmentRows) {
  const teamAssetsMap = new Map();

  assignmentRows
    .filter((assignment) => assignment.assigned_to_type === "team" && assignment.status === "Active")
    .forEach((assignment) => {
      if (!teamAssetsMap.has(assignment.team_id)) {
        teamAssetsMap.set(assignment.team_id, []);
      }
      teamAssetsMap.get(assignment.team_id).push(assignment.asset_id);
    });

  return rawTeams.map((team) =>
    normalizeTeam(team, teamMembersMap.get(team.team_id) || [], teamAssetsMap.get(team.team_id) || [])
  );
}

function composeProjects(rawProjects, projectMembersMap, assignmentRows) {
  const projectAssetsMap = new Map();

  assignmentRows
    .filter((assignment) => assignment.assigned_to_type === "project" && assignment.status === "Active")
    .forEach((assignment) => {
      if (!projectAssetsMap.has(assignment.project_id)) {
        projectAssetsMap.set(assignment.project_id, []);
      }
      projectAssetsMap.get(assignment.project_id).push(assignment.asset_id);
    });

  return rawProjects.map((project) =>
    normalizeProject(project, projectMembersMap.get(project.project_id) || [], projectAssetsMap.get(project.project_id) || [])
  );
}

function composeTemporaryIssues(rawIssues) {
  return rawIssues.map(normalizeTemporaryIssue);
}

function applyTemporaryAllocations(assets, temporaryRecords) {
  const activeTemporaryByAsset = new Map(
    temporaryRecords
      .filter((entry) => entry.status === "Active")
      .map((entry) => [entry.assetId, entry])
  );

  return assets.map((asset) => {
    const temp = activeTemporaryByAsset.get(asset.id);

    if (!temp) {
      return asset;
    }

    return {
      ...asset,
      status: "Temporary",
      assignedTo: temp.employeeId,
      assignmentType: "temporary",
      assignmentRef: temp.id,
      assignedDate: temp.issueDate || asset.assignedDate || null,
    };
  });
}

export function AppProvider({ children }) {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [rndTeams, setRndTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [temporary, setTemporary] = useState([]);
  const [assetAssignments, setAssetAssignments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [toast, setToast] = useState(null);
  const [authUser, setAuthUser] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const storedUser = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(authUser));
  const [currentPage, setCurrentPage] = useState(() => (authUser ? DEFAULT_DASHBOARD_PATH : DEFAULT_LOGIN_PATH));
  const canViewAssets = Boolean(authUser?.permissions?.view_assets);
  const canEditAssets = Boolean(authUser?.permissions?.edit_assets);
  const [routeParams, setRouteParams] = useState({});
  const [modalPage, setModalPage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const navigate = useCallback((path, params = {}) => {
    if (!isAuthenticated && path !== DEFAULT_LOGIN_PATH) {
      setCurrentPage(DEFAULT_LOGIN_PATH);
      setRouteParams({});
      setModalPage(null);
      setMobileSidebarOpen(false);
      window.scrollTo(0, 0);
      return;
    }

    if (path === "/settings") {
      setModalPage("/settings");
      setMobileSidebarOpen(false);
      window.scrollTo(0, 0);
      return;
    }

    setCurrentPage(path);
    setRouteParams(params);
    setModalPage(null);
    setMobileSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [isAuthenticated]);

  const openModal = useCallback((path) => {
    if (!isAuthenticated) return;
    setModalPage(path);
    setMobileSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [isAuthenticated]);

  const closeModal = useCallback(() => setModalPage(null), []);

  const clearAppData = useCallback(() => {
    setAssets([]);
    setEmployees([]);
    setRndTeams([]);
    setProjects([]);
    setTemporary([]);
    setAssetAssignments([]);
    setActivityLogs([]);
    setDataError("");
    setAssetsLoading(false);
    setEmployeesLoading(false);
    setTeamsLoading(false);
    setProjectsLoading(false);
  }, []);

  const loadAppData = useCallback(async (signal) => {
    setAssetsLoading(true);
    setEmployeesLoading(true);
    setTeamsLoading(true);
    setProjectsLoading(true);

    try {
      const [employeesPayload, assetsPayload, teamsPayload, projectsPayload, assignmentsPayload, temporaryPayload, activityLogsPayload] = await Promise.all([
        fetchEmployees(signal),
        fetchAssets(signal),
        fetchTeams(signal),
        fetchProjects(signal),
        fetchAssetAssignments(signal),
        fetchTemporaryIssues(signal),
        fetchActivityLogs(signal),
      ]);

      const employeeRows = Array.isArray(employeesPayload.data) ? employeesPayload.data : [];
      const assetRows = Array.isArray(assetsPayload.data) ? assetsPayload.data : [];
      const teamRows = Array.isArray(teamsPayload.data) ? teamsPayload.data : [];
      const projectRows = Array.isArray(projectsPayload.data) ? projectsPayload.data : [];
      const assignmentRows = Array.isArray(assignmentsPayload.data)
        ? assignmentsPayload.data.map(normalizeAssignmentRow)
        : [];
      const temporaryRows = Array.isArray(temporaryPayload.data) ? temporaryPayload.data : [];
      const activityLogRows = Array.isArray(activityLogsPayload.data) ? activityLogsPayload.data : [];

      const [teamMembersPayloads, projectMembersPayloads] = await Promise.all([
        Promise.all(
          teamRows.map(async (team) => {
            const payload = await fetchTeamMembers(team.team_id, signal);
            return {
              teamId: team.team_id,
              members: Array.isArray(payload.data) ? payload.data.map((row) => row.employee_id) : [],
            };
          })
        ),
        Promise.all(
          projectRows.map(async (project) => {
            const payload = await fetchProjectMembers(project.project_id, signal);
            return {
              projectId: project.project_id,
              members: Array.isArray(payload.data) ? payload.data.map((row) => row.employee_id) : [],
            };
          })
        ),
      ]);

      const teamMembersMap = new Map(teamMembersPayloads.map(({ teamId, members }) => [teamId, members]));
      const projectMembersMap = new Map(projectMembersPayloads.map(({ projectId, members }) => [projectId, members]));

      const normalizedAssets = assetRows.map((asset) => normalizeAsset(asset, {}));
      const normalizedTemporary = composeTemporaryIssues(temporaryRows);

      setEmployees(employeeRows.map(normalizeEmployee));
      setAssetAssignments(assignmentRows);
      setTemporary(normalizedTemporary);
      setActivityLogs(activityLogRows.map(normalizeActivityLog));
      setAssets(applyTemporaryAllocations(normalizedAssets, normalizedTemporary));
      setRndTeams(composeTeams(teamRows, teamMembersMap, assignmentRows));
      setProjects(composeProjects(projectRows, projectMembersMap, assignmentRows));
      setDataError("");
      return true;
    } catch (error) {
      if (error.name !== "AbortError") {
        setEmployees([]);
        setAssets([]);
        setRndTeams([]);
        setProjects([]);
        setAssetAssignments([]);
        setTemporary([]);
        setActivityLogs([]);
        setDataError(error.message || "Failed to load application data");
      }
      return false;
    } finally {
      setAssetsLoading(false);
      setEmployeesLoading(false);
      setTeamsLoading(false);
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      clearAppData();
      if (currentPage !== DEFAULT_LOGIN_PATH) {
        setCurrentPage(DEFAULT_LOGIN_PATH);
        setRouteParams({});
      }
      return undefined;
    }

    const controller = new AbortController();
    loadAppData(controller.signal);

    return () => controller.abort();
  }, [clearAppData, currentPage, isAuthenticated, loadAppData]);

  const login = async ({ email, password }) => {
    const response = await loginRequest({ email, password });
    const user = response?.data?.user || null;

    if (!user) {
      throw new Error("Login response did not include a user profile");
    }

    setAuthUser(user);
    setIsAuthenticated(true);
    window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    navigate(DEFAULT_DASHBOARD_PATH);
    return user;
  };

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setAuthUser(null);
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    clearAppData();
    navigate(DEFAULT_LOGIN_PATH);
    setSidebarOpen(true);
  }, [clearAppData, navigate]);

  const getEmployee = (id) => employees.find((employee) => employee.id === id);
  const getAsset = (id) => assets.find((asset) => asset.id === id);
  const getTeam = (id) => rndTeams.find((team) => team.id === id);
  const getProject = (id) => projects.find((project) => project.id === id);
  const getTemp = (id) => temporary.find((entry) => entry.id === id);

  const ensureEmployeeAssetAssignment = async (assetId, assignedTo, currentStatus) => {
    const activeAssignment = await fetchAssetActiveAssignment(assetId).catch(() => null);

    if (currentStatus === "Assigned" && assignedTo) {
      const matchesEmployee =
        activeAssignment &&
        activeAssignment.assigned_to_type === "employee" &&
        activeAssignment.employee_id === assignedTo;

      if (!matchesEmployee) {
        if (activeAssignment) {
          await closeAssetAssignment(activeAssignment.assignment_id);
        }

        await createAssetAssignment({
          asset_id: assetId,
          assigned_to_type: "employee",
          employee_id: assignedTo,
          status: "Active",
        });
      }

      return;
    }

    if (activeAssignment && activeAssignment.assigned_to_type === "employee") {
      await closeAssetAssignment(activeAssignment.assignment_id);
    }
  };

  const syncTeamAssets = async (teamId, previousAssetIds, nextAssetIds) => {
    const currentAssignments = assetAssignments.filter(
      (assignment) => assignment.assigned_to_type === "team" && assignment.team_id === teamId && assignment.status === "Active"
    );
    const assignmentsByAsset = new Map(currentAssignments.map((assignment) => [assignment.asset_id, assignment]));
    const removedAssetIds = previousAssetIds.filter((assetId) => !nextAssetIds.includes(assetId));
    const addedAssetIds = nextAssetIds.filter((assetId) => !previousAssetIds.includes(assetId));

    await Promise.all(
      removedAssetIds.map((assetId) => {
        const assignment = assignmentsByAsset.get(assetId);
        return assignment ? closeAssetAssignment(assignment.assignment_id) : Promise.resolve();
      })
    );

    await Promise.all(
      addedAssetIds.map((assetId) =>
        createAssetAssignment({
          asset_id: assetId,
          assigned_to_type: "team",
          team_id: teamId,
          status: "Active",
        })
      )
    );
  };

  const syncProjectAssets = async (projectId, previousAssetIds, nextAssetIds) => {
    const currentAssignments = assetAssignments.filter(
      (assignment) => assignment.assigned_to_type === "project" && assignment.project_id === projectId && assignment.status === "Active"
    );
    const assignmentsByAsset = new Map(currentAssignments.map((assignment) => [assignment.asset_id, assignment]));
    const removedAssetIds = previousAssetIds.filter((assetId) => !nextAssetIds.includes(assetId));
    const addedAssetIds = nextAssetIds.filter((assetId) => !previousAssetIds.includes(assetId));

    await Promise.all(
      removedAssetIds.map((assetId) => {
        const assignment = assignmentsByAsset.get(assetId);
        return assignment ? closeAssetAssignment(assignment.assignment_id) : Promise.resolve();
      })
    );

    await Promise.all(
      addedAssetIds.map((assetId) =>
        createAssetAssignment({
          asset_id: assetId,
          assigned_to_type: "project",
          project_id: projectId,
          status: "Active",
        })
      )
    );
  };

  const refreshFromServer = async (successMessage, successType = "success") => {
    const loaded = await loadAppData();
    if (loaded) {
      showToast(successMessage, successType);
    } else {
      showToast(`${successMessage} Data refresh failed.`, "warning");
    }
    return loaded;
  };

  const addAsset = async (asset) => {
    try {
      const payload = await createAssetRequest({
        name: asset.name,
        asset_type: asset.type,
        serial_number: asset.serial,
        purchase_date: asset.purchaseDate || null,
        description: asset.description || null,
        status: asset.status || "Available",
      });

      if (asset.status === "Assigned" && asset.assignedTo) {
        await ensureEmployeeAssetAssignment(payload.data.asset_id, asset.assignedTo, asset.status);
      }

      await refreshFromServer("Asset added successfully!");
      navigate("/assets");
      return payload.data;
    } catch (error) {
      showToast(error.message || "Failed to add asset", "error");
      throw error;
    }
  };

  const deleteAsset = async (id) => {
    try {
      await deleteAssetRequest(id);
      await refreshFromServer("Asset deleted.", "info");
      return true;
    } catch (error) {
      showToast(error.message || "Failed to delete asset", "error");
      throw error;
    }
  };

  const updateAsset = async (id, updates) => {
    const current = assets.find((asset) => asset.id === id);
    if (!current) return null;

    try {
      const payload = await updateAssetRequest(id, {
        name: updates.name ?? current.name,
        asset_type: updates.type ?? current.type,
        serial_number: updates.serial ?? current.serial,
        status: updates.status ?? current.status,
        purchase_date: updates.purchaseDate ?? current.purchaseDate ?? null,
        description: updates.description ?? current.description ?? null,
      });

      await ensureEmployeeAssetAssignment(
        id,
        updates.status === "Assigned" ? updates.assignedTo ?? current.assignedTo ?? null : null,
        updates.status ?? current.status
      );

      await refreshFromServer("Asset updated successfully!");
      return payload.data;
    } catch (error) {
      showToast(error.message || "Failed to update asset", "error");
      throw error;
    }
  };

  const addTeam = async (team) => {
    try {
      const created = await createTeamRequest({
        name: team.name,
        manager_id: team.manager,
        description: team.description || null,
      });

      const teamId = created.data.team_id;
      const memberIds = Array.from(new Set((team.members || []).filter((employeeId) => employeeId !== team.manager)));
      await Promise.all(memberIds.map((employeeId) => addTeamMember(teamId, employeeId)));
      await syncTeamAssets(teamId, [], Array.from(new Set(team.assets || [])));
      await refreshFromServer("R&D Team created!");
      navigate("/rnd");
      return created.data;
    } catch (error) {
      showToast(error.message || "Failed to create team", "error");
      throw error;
    }
  };

  const updateTeam = async (id, updates) => {
    const existingTeam = rndTeams.find((team) => team.id === id);
    if (!existingTeam) return null;

    try {
      const payload = await updateTeamRequest(id, {
        name: updates.name ?? existingTeam.name,
        manager_id: updates.manager ?? existingTeam.manager,
        description: updates.description ?? existingTeam.description ?? null,
      });

      const existingMembers = existingTeam.members || [];
      const nextMembers = Array.from(new Set((updates.members || []).filter((employeeId) => employeeId !== (updates.manager ?? existingTeam.manager))));
      await Promise.all(existingMembers.filter((memberId) => !nextMembers.includes(memberId)).map((memberId) => removeTeamMember(id, memberId)));
      await Promise.all(nextMembers.filter((memberId) => !existingMembers.includes(memberId)).map((memberId) => addTeamMember(id, memberId)));

      await syncTeamAssets(id, existingTeam.assets || [], Array.from(new Set(updates.assets || [])));
      await refreshFromServer("R&D Team updated successfully!");
      return payload.data;
    } catch (error) {
      showToast(error.message || "Failed to update team", "error");
      throw error;
    }
  };

  const deleteTeam = async (id) => {
    try {
      await deleteTeamRequest(id);
      await refreshFromServer("Team deleted.", "info");
    } catch (error) {
      showToast(error.message || "Failed to delete team", "error");
      throw error;
    }
  };

  const addProject = async (project) => {
    try {
      const created = await createProjectRequest({
        project_code: project.code,
        name: project.name,
        manager_id: project.manager,
        status: "Active",
      });

      const projectId = created.data.project_id;
      const memberIds = Array.from(new Set((project.members || []).filter((employeeId) => employeeId !== project.manager)));
      await Promise.all(memberIds.map((employeeId) => addProjectMember(projectId, employeeId)));
      await syncProjectAssets(projectId, [], Array.from(new Set(project.assets || [])));
      await refreshFromServer("Project created!");
      navigate("/projects");
      return created.data;
    } catch (error) {
      showToast(error.message || "Failed to create project", "error");
      throw error;
    }
  };

  const updateProject = async (id, updates) => {
    const existingProject = projects.find((project) => project.id === id);
    if (!existingProject) return null;

    try {
      const payload = await updateProjectRequest(id, {
        project_code: updates.code ?? existingProject.code,
        name: updates.name ?? existingProject.name,
        manager_id: updates.manager ?? existingProject.manager,
        status: updates.status ?? existingProject.status ?? "Planning",
      });

      const existingMembers = existingProject.members || [];
      const nextMembers = Array.from(new Set((updates.members || []).filter((employeeId) => employeeId !== (updates.manager ?? existingProject.manager))));
      await Promise.all(existingMembers.filter((memberId) => !nextMembers.includes(memberId)).map((memberId) => removeProjectMember(id, memberId)));
      await Promise.all(nextMembers.filter((memberId) => !existingMembers.includes(memberId)).map((memberId) => addProjectMember(id, memberId)));

      await syncProjectAssets(id, existingProject.assets || [], Array.from(new Set(updates.assets || [])));
      await refreshFromServer("Project updated successfully!");
      return payload.data;
    } catch (error) {
      showToast(error.message || "Failed to update project", "error");
      throw error;
    }
  };

  const deleteProject = async (id) => {
    try {
      await deleteProjectRequest(id);
      await refreshFromServer("Project deleted.", "info");
    } catch (error) {
      showToast(error.message || "Failed to delete project", "error");
      throw error;
    }
  };

  const addTemporary = async (alloc) => {
    try {
      await createTemporaryIssue({
        asset_id: alloc.assetId,
        employee_id: alloc.employeeId,
        issued_by: alloc.givenBy || alloc.employeeId,
        received_by: alloc.receivedBy || null,
        purpose: alloc.reason || "",
        event_name: alloc.modalName || "Temporary Allocation",
        issue_date: alloc.issueDate || null,
        return_date: alloc.returnDate || null,
        status: "Active",
      });
      await loadAppData();
      showToast("Temporary allocation created!");
      navigate("/temporary");
    } catch (error) {
      showToast(error.message || "Failed to create temporary allocation", "error");
      throw error;
    }
  };

  const updateTemporary = async (id, updates) => {
    const existingAllocation = temporary.find((allocation) => allocation.id === id);
    if (!existingAllocation) return null;

    try {
      if (updates.status === "Returned") {
        await closeTemporaryIssue(id);
      } else {
        await updateTemporaryIssue(id, {
          asset_id: updates.assetId ?? existingAllocation.assetId,
          employee_id: updates.employeeId ?? existingAllocation.employeeId,
          issued_by: updates.givenBy ?? existingAllocation.givenBy,
          received_by: (updates.receivedBy ?? existingAllocation.receivedBy) || null,
          purpose: updates.reason ?? existingAllocation.reason,
          event_name: updates.modalName ?? existingAllocation.modalName,
          issue_date: updates.issueDate ?? existingAllocation.issueDate,
          return_date: updates.returnDate ?? existingAllocation.returnDate,
          status: updates.status ?? existingAllocation.status,
        });
      }
      await loadAppData();
      showToast("Temporary allocation updated successfully!");
      return true;
    } catch (error) {
      showToast(error.message || "Failed to update temporary allocation", "error");
      throw error;
    }
  };

  const returnAsset = async (tempId) => {
    try {
      await closeTemporaryIssue(tempId);
      await loadAppData();
      showToast("Asset returned successfully!");
      navigate("/temporary");
    } catch (error) {
      showToast(error.message || "Failed to return asset", "error");
      throw error;
    }
  };

  const deleteTemporary = async (id) => {
    try {
      await deleteTemporaryIssue(id);
      await loadAppData();
      showToast("Temporary allocation deleted.", "info");
      return true;
    } catch (error) {
      showToast(error.message || "Failed to delete temporary allocation", "error");
      throw error;
    }
  };

  const refreshAppData = useCallback(async () => {
    const loaded = await loadAppData();
    if (loaded) {
      showToast("Dashboard data refreshed.", "info");
    }
  }, [loadAppData, showToast]);

  return (
    <AppContext.Provider
      value={{
        assets,
        employees,
        rndTeams,
        projects,
        assetAssignments,
        temporary,
        activityLogs,
        authUser,
        isAuthenticated,
        toast,
        showToast,
        navigate,
        login,
        logout,
        currentPage,
        routeParams,
        sidebarOpen,
        setSidebarOpen,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        assetsLoading,
        employeesLoading,
        teamsLoading,
        projectsLoading,
        dataError,
        getEmployee,
        getAsset,
        getTeam,
        getProject,
        getTemp,
        addAsset,
        deleteAsset,
        updateAsset,
        addTeam,
        updateTeam,
        deleteTeam,
        addProject,
        updateProject,
        deleteProject,
        addTemporary,
        updateTemporary,
        returnAsset,
        deleteTemporary,
        canViewAssets,
        canEditAssets,
        refreshAppData,
        modalPage,
        openModal,
        closeModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

export { mockActivities };
