const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
let authToken = null;
let isRefreshing = false;
let refreshQueue = [];

export function setAuthToken(token) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

function enqueueRefreshRequest(resolve, reject) {
  refreshQueue.push({ resolve, reject });
}

function resolveRefreshQueue(token) {
  refreshQueue.forEach(({ resolve }) => resolve(token));
  refreshQueue = [];
}

function rejectRefreshQueue(error) {
  refreshQueue.forEach(({ reject }) => reject(error));
  refreshQueue = [];
}

async function fetchWithCredentials(path, options = {}) {
  const { body, signal, method = "GET", credentials = "include" } = options;

  const headers = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    credentials,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function refreshAccessToken() {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Refresh failed with status ${response.status}`);
  }

  return payload;
}

export async function apiRequest(path, options = {}) {
  const { body, signal, method = "GET", credentials = "include" } = options;
  const response = await fetchWithCredentials(path, { body, signal, method, credentials });
  const payload = await response.json().catch(() => ({}));

  if (response.ok) {
    return payload;
  }

  if (response.status !== 401 || path === "/api/auth/login" || path === "/api/auth/refresh") {
    throw new Error(payload.message || `Request failed with status ${response.status}`);
  }

  if (!isRefreshing) {
    isRefreshing = true;
    try {
      const refreshPayload = await refreshAccessToken();
      const newToken = refreshPayload?.data?.accessToken;
      if (!newToken) {
        throw new Error("Refresh failed to return a new access token");
      }
      setAuthToken(newToken);
      resolveRefreshQueue(newToken);
      const retryResponse = await fetchWithCredentials(path, { body, signal, method, credentials });
      const retryPayload = await retryResponse.json().catch(() => ({}));
      if (!retryResponse.ok) {
        throw new Error(retryPayload.message || `Request failed with status ${retryResponse.status}`);
      }
      return retryPayload;
    } catch (error) {
      rejectRefreshQueue(error);
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  return new Promise((resolve, reject) => {
    enqueueRefreshRequest(resolve, reject);
  }).then(async () => {
    const retryResponse = await fetchWithCredentials(path, { body, signal, method, credentials });
    const retryPayload = await retryResponse.json().catch(() => ({}));
    if (!retryResponse.ok) {
      throw new Error(retryPayload.message || `Request failed with status ${retryResponse.status}`);
    }
    return retryPayload;
  });
}

export async function login(body) {
  return apiRequest("/api/auth/login", { method: "POST", body, credentials: "include" });
}

export async function fetchUsers(signal) {
  return apiRequest("/api/auth/users", { signal });
}

export async function createUser(body) {
  return apiRequest("/api/auth/users", { method: "POST", body });
}

export async function updateUser(userId, body) {
  return apiRequest(`/api/auth/users/${userId}`, { method: "PUT", body });
}

export async function deleteUser(userId) {
  return apiRequest(`/api/auth/users/${userId}`, { method: "DELETE" });
}

export async function changeUserPassword(userId, body) {
  return apiRequest(`/api/auth/users/${userId}/password`, { method: "PATCH", body });
}

export async function fetchEmployees(signal) {
  return apiRequest("/api/employees", { signal });
}

export async function fetchAssets(signal) {
  return apiRequest("/api/assets", { signal });
}

export async function createAsset(body) {
  return apiRequest("/api/assets", { method: "POST", body });
}

export async function updateAsset(assetId, body) {
  return apiRequest(`/api/assets/${assetId}`, { method: "PUT", body });
}

export async function deleteAsset(assetId) {
  return apiRequest(`/api/assets/${assetId}`, { method: "DELETE" });
}

export async function fetchTeams(signal) {
  return apiRequest("/api/teams", { signal });
}

export async function fetchTeamMembers(teamId, signal) {
  return apiRequest(`/api/teams/${teamId}/members`, { signal });
}

export async function createTeam(body) {
  return apiRequest("/api/teams", { method: "POST", body });
}

export async function updateTeam(teamId, body) {
  return apiRequest(`/api/teams/${teamId}`, { method: "PUT", body });
}

export async function deleteTeam(teamId) {
  return apiRequest(`/api/teams/${teamId}`, { method: "DELETE" });
}

export async function addTeamMember(teamId, employeeId) {
  return apiRequest(`/api/teams/${teamId}/members`, {
    method: "POST",
    body: { employee_id: employeeId },
  });
}

export async function removeTeamMember(teamId, employeeId) {
  return apiRequest(`/api/teams/${teamId}/members/${employeeId}`, { method: "DELETE" });
}

export async function fetchProjects(signal) {
  return apiRequest("/api/projects", { signal });
}

export async function fetchProjectMembers(projectId, signal) {
  return apiRequest(`/api/projects/${projectId}/members`, { signal });
}

export async function createProject(body) {
  return apiRequest("/api/projects", { method: "POST", body });
}

export async function updateProject(projectId, body) {
  return apiRequest(`/api/projects/${projectId}`, { method: "PUT", body });
}

export async function deleteProject(projectId) {
  return apiRequest(`/api/projects/${projectId}`, { method: "DELETE" });
}

export async function addProjectMember(projectId, employeeId) {
  return apiRequest(`/api/projects/${projectId}/members`, {
    method: "POST",
    body: { employee_id: employeeId },
  });
}

export async function removeProjectMember(projectId, employeeId) {
  return apiRequest(`/api/projects/${projectId}/members/${employeeId}`, { method: "DELETE" });
}

export async function fetchAssetAssignments(signal) {
  return apiRequest("/api/asset-assignments", { signal });
}

export async function fetchAssetActiveAssignment(assetId, signal) {
  return apiRequest(`/api/asset-assignments/asset/${assetId}/active`, { signal });
}

export async function createAssetAssignment(body) {
  return apiRequest("/api/asset-assignments", { method: "POST", body });
}

export async function closeAssetAssignment(assignmentId) {
  return apiRequest(`/api/asset-assignments/${assignmentId}/close`, { method: "PATCH" });
}

export async function fetchTemporaryIssues(signal) {
  return apiRequest("/api/temporary-issues", { signal });
}

export async function createTemporaryIssue(body) {
  return apiRequest("/api/temporary-issues", { method: "POST", body });
}

export async function updateTemporaryIssue(issueId, body) {
  return apiRequest(`/api/temporary-issues/${issueId}`, { method: "PUT", body });
}

export async function closeTemporaryIssue(issueId) {
  return apiRequest(`/api/temporary-issues/${issueId}/close`, { method: "PATCH" });
}

export async function deleteTemporaryIssue(issueId) {
  return apiRequest(`/api/temporary-issues/${issueId}`, { method: "DELETE" });
}

export async function fetchActivityLogs(signal) {
  return apiRequest("/api/activity-logs", { signal });
}

export async function createActivityLog(body) {
  return apiRequest("/api/activity-logs", { method: "POST", body });
}

export function normalizeEmployee(record) {
  return {
    id: record.employee_id,
    name: record.name,
    department: record.department,
    designation: record.designation,
    avatar: record.avatar || "",
  };
}

export function normalizeAsset(record, previous = {}) {
  const purchaseDate = record.purchase_date ? String(record.purchase_date).slice(0, 10) : "";
  const assignedType = record.assigned_to_type || previous.assignmentType || null;
  const assignedDate = record.assigned_date ? String(record.assigned_date).slice(0, 10) : previous.assignedDate ?? null;
  const assignedRef =
    assignedType === "team"
      ? record.assigned_team_id || previous.assignmentRef || null
      : assignedType === "project"
        ? record.assigned_project_id || previous.assignmentRef || null
        : assignedType === "employee"
          ? record.assigned_employee_id || previous.assignmentRef || null
          : previous.assignmentRef ?? null;
  const assignedTo =
    assignedType === "employee"
      ? record.assigned_employee_id || previous.assignedTo || null
      : assignedType === "temporary"
        ? record.assigned_employee_id || previous.assignedTo || null
        : null;

  return {
    id: record.asset_id,
    name: record.name,
    type: record.asset_type,
    serial: record.serial_number,
    status: record.status,
    purchaseDate,
    description: record.description || "",
    assignedTo,
    assignmentType: assignedType,
    assignmentRef: assignedRef,
    assignedDate,
  };
}

export function normalizeTeam(record, members = [], assets = []) {
  return {
    id: record.team_id,
    name: record.name,
    manager: record.manager_id || "",
    description: record.description || "",
    members,
    assets,
  };
}

export function normalizeProject(record, members = [], assets = []) {
  return {
    id: record.project_id,
    code: record.project_code,
    name: record.name,
    manager: record.manager_id || "",
    status: record.status || "Planning",
    members,
    assets,
  };
}

export function normalizeTemporaryIssue(record) {
  return {
    id: record.issue_id,
    employeeId: record.employee_id || "",
    assetId: record.asset_id || "",
    reason: record.purpose || "",
    modalName: record.event_name || "",
    issueDate: record.issue_date ? String(record.issue_date).slice(0, 10) : "",
    returnDate: record.return_date ? String(record.return_date).slice(0, 10) : "",
    givenBy: record.issued_by || "",
    receivedBy: record.received_by || "",
    status: record.status || "Active",
  };
}

export function normalizeActivityLog(record) {
  return {
    id: record.activity_id,
    action: record.action,
    description: record.description,
    type: record.type,
    createdAt: record.created_at,
  };
}
