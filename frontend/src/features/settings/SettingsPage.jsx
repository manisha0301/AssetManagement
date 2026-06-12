import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/Common";
import { useApp } from "../../context/AppContext";
import { changeUserPassword, createUser, deleteUser, fetchUsers, updateUser } from "../../lib/api";

const ROLE_OPTIONS = ["admin", "editor", "viewer"];
const PERMISSION_GROUPS = [
  {
    label: "User Management",
    items: [
      { key: "view_users", label: "View users" },
      { key: "edit_users", label: "Edit users" },
      { key: "delete_users", label: "Delete users" },
      { key: "manage_users", label: "Manage users" },
    ],
  },
  {
    label: "Asset Management",
    items: [
      { key: "view_assets", label: "View assets" },
      { key: "edit_assets", label: "Edit assets" },
    ],
  },
];
const DEFAULT_PERMISSIONS = {
  admin: {
    view_users: true,
    edit_users: true,
    delete_users: true,
    manage_users: true,
    view_assets: true,
    edit_assets: true,
  },
  editor: {
    view_users: true,
    edit_users: true,
    delete_users: false,
    manage_users: false,
    view_assets: true,
    edit_assets: true,
  },
  viewer: {
    view_users: true,
    edit_users: false,
    delete_users: false,
    manage_users: false,
    view_assets: true,
    edit_assets: false,
  },
};

const EMPTY_FORM = {
  displayName: "",
  email: "",
  role: "viewer",
  password: "",
  isActive: true,
  permissions: { ...DEFAULT_PERMISSIONS.viewer },
};

function getDefaultPermissionsForRole(role) {
  return { ...DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.viewer };
}

export default function SettingsPage() {
  const { closeModal, showToast, authUser } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingUserId, setEditingUserId] = useState(null);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [passwordValue, setPasswordValue] = useState("");
  const [search, setSearch] = useState("");

  const authPermissions = authUser?.permissions || {};
  const canViewUsers = Boolean(authPermissions.view_users);
  const canEditUsers = Boolean(authPermissions.edit_users);
  const canDeleteUsers = Boolean(authPermissions.delete_users);
  const canManageUsers = Boolean(authPermissions.manage_users);
  const gridClass = canEditUsers ? "grid gap-6 lg:grid-cols-[1fr_1.1fr]" : "grid gap-6";
  const userTableDescription = canViewUsers
    ? canEditUsers
      ? "Search, edit, reset password, and remove users."
      : "Search and view users only. Editing and deletion require additional permissions."
    : "You do not have permission to view users.";

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      return (
        user.display_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    });
  }, [search, users]);

  useEffect(() => {
    if (canViewUsers) {
      loadUsers();
    }
  }, [canViewUsers, authUser]);

  async function loadUsers() {
    setLoading(true);
    try {
      const response = await fetchUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      showToast(error.message || "Unable to load users", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveUser() {
    if (!canEditUsers) {
      showToast("You do not have permission to modify users.", "warning");
      return;
    }

    if (!form.displayName.trim() || !form.email.trim() || !form.role.trim()) {
      showToast("Name, email, and role are required", "warning");
      return;
    }

    if (!editingUserId && !form.password.trim()) {
      showToast("Password is required for new users", "warning");
      return;
    }

    setSaving(true);
    try {
      if (editingUserId) {
        await updateUser(editingUserId, {
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          role: form.role,
          isActive: form.isActive,
          permissions: form.permissions,
        });
        showToast("User updated successfully", "success");
      } else {
        await createUser({
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          role: form.role,
          password: form.password.trim(),
          isActive: form.isActive,
          permissions: form.permissions,
        });
        showToast("New user created successfully", "success");
      }

      resetForm();
      await loadUsers();
    } catch (error) {
      showToast(error.message || "Failed to save user", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(userId) {
    if (!canDeleteUsers) {
      showToast("You do not have permission to delete users.", "warning");
      return;
    }

    const confirmed = window.confirm("Delete this user? This action cannot be undone.");
    if (!confirmed) return;

    setSaving(true);
    try {
      await deleteUser(userId);
      showToast("User removed successfully", "info");
      if (passwordTarget?.user_id === userId) {
        setPasswordTarget(null);
        setPasswordValue("");
      }
      if (editingUserId === userId) {
        resetForm();
      }
      await loadUsers();
    } catch (error) {
      showToast(error.message || "Failed to delete user", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!passwordTarget || !passwordValue.trim()) {
      showToast("Enter a new password", "warning");
      return;
    }

    setSaving(true);
    try {
      await changeUserPassword(passwordTarget.user_id, { password: passwordValue.trim() });
      showToast("Password updated successfully", "success");
      setPasswordTarget(null);
      setPasswordValue("");
    } catch (error) {
      showToast(error.message || "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleEditUser(user) {
    if (!canEditUsers) {
      showToast("You do not have permission to edit users.", "warning");
      return;
    }

    setEditingUserId(user.user_id);
    setForm({
      displayName: user.display_name,
      email: user.email,
      role: user.role || "viewer",
      password: "",
      isActive: user.is_active,
      permissions: user.permissions || getDefaultPermissionsForRole(user.role || "viewer"),
    });
    setPasswordTarget(null);
    setPasswordValue("");
  }

  function handleRoleChange(value) {
    setForm((current) => ({
      ...current,
      role: value,
      permissions: getDefaultPermissionsForRole(value),
    }));
  }

  function resetForm() {
    setEditingUserId(null);
    setForm(EMPTY_FORM);
    setPasswordTarget(null);
    setPasswordValue("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">
            View, create, update, and remove users from the app_users table.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={resetForm}>Clear</Button>
          <Button onClick={closeModal}>Close</Button>
        </div>
      </div>

      <div className={gridClass}>
        {canEditUsers && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{editingUserId ? "Edit User" : "Create New User"}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Display Name</label>
                <input
                  value={form.displayName}
                  onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="user@example.com"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Role</label>
                  <select
                    value={form.role}
                    onChange={(event) => handleRoleChange(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {canManageUsers ? (
                  <div className="flex items-end gap-2">
                    <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Active account
                    </label>
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-sm text-slate-500">Active status cannot be changed.</span>
                  </div>
                )}
              </div>

              {canManageUsers ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-base font-semibold text-slate-900">Access Control</h4>
                  <p className="text-sm text-slate-500 mb-4">
                    Role defaults are applied automatically, but you can fine-tune permissions for each user.
                  </p>
                  <div className="space-y-4">
                    {PERMISSION_GROUPS.map((group) => (
                      <div key={group.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-sm font-semibold text-slate-900 mb-3">{group.label}</div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {group.items.map((permission) => (
                            <label key={permission.key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={form.permissions[permission.key]}
                                onChange={(event) => {
                                  const checked = event.target.checked;
                                  setForm((current) => ({
                                    ...current,
                                    permissions: {
                                      ...current.permissions,
                                      [permission.key]: checked,
                                    },
                                  }));
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              {permission.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-base font-semibold text-slate-900">Access Control</h4>
                  <p className="text-sm text-slate-500">
                    You can create and edit users, but you do not have permission to manage permissions or active account status.
                  </p>
                </div>
              )}

              {!editingUserId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter initial password"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleSaveUser} disabled={!canEditUsers || saving}>
                {editingUserId ? "Update User" : "Create User"}
              </Button>
              {editingUserId && (
                <Button variant="secondary" onClick={resetForm} disabled={saving}>Cancel</Button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Users</h3>
                <p className="text-sm text-slate-500">{userTableDescription}</p>
              </div>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-72"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!canViewUsers ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                        You do not have permission to view user records.
                      </td>
                    </tr>
                  ) : loading ? (
                    <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">Loading users...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No users found.</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.user_id} className="border-t border-slate-100">
                        <td className="px-4 py-3 text-slate-800">{user.display_name}</td>
                        <td className="px-4 py-3 text-slate-600">{user.email}</td>
                        <td className="px-4 py-3 text-slate-600 capitalize">{user.role}</td>
                        <td className="px-4 py-3 text-slate-600">{user.is_active ? "Yes" : "No"}</td>
                        <td className="px-4 py-3 flex flex-wrap gap-2">
                          {canEditUsers && (
                            <Button variant="secondary" size="sm" onClick={() => handleEditUser(user)}>Edit</Button>
                          )}
                          {canEditUsers && (
                            <Button variant="secondary" size="sm" onClick={() => setPasswordTarget(user)}>Password</Button>
                          )}
                          {canDeleteUsers && (
                            <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.user_id)}>Delete</Button>
                          )}
                          {!canEditUsers && !canDeleteUsers && (
                            <span className="text-sm text-slate-500">View only</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {passwordTarget && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Reset Password</h3>
                <p className="text-sm text-slate-500">Update the password for {passwordTarget.display_name}.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">New Password</label>
                  <input
                    type="password"
                    value={passwordValue}
                    onChange={(event) => setPasswordValue(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleChangePassword} disabled={saving}>Save Password</Button>
                  <Button variant="secondary" onClick={() => { setPasswordTarget(null); setPasswordValue(""); }} disabled={saving}>Cancel</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
