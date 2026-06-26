import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Button, Card, PageHeader, Pagination, SearchBar } from "../../components/Common";
import { useApp } from "../../context/AppContext";

const deptColors = {
  Engineering: "bg-blue-100 text-blue-700",
  Design: "bg-pink-100 text-pink-700",
  Product: "bg-violet-100 text-violet-700",
  QA: "bg-amber-100 text-amber-700",
  HR: "bg-green-100 text-green-700",
  Marketing: "bg-orange-100 text-orange-700",
  Sales: "bg-teal-100 text-teal-700",
  Finance: "bg-indigo-100 text-indigo-700",
};

function getEmployeeInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "EM";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function EmployeesPage() {
  const { employees, employeesLoading: loading, dataError: error } = useApp();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.department.toLowerCase().includes(search.toLowerCase()) ||
      employee.designation.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={loading ? "Loading employees..." : `${employees.length} team members`}
        actions={
          <Button>
            <UserPlus size={14} />
            Add Employee
          </Button>
        }
      />
      <Card>
        <div className="p-4 border-b border-slate-100">
          <SearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search employees..."
          />
        </div>
        {error && (
          <div className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employee", "ID", "Department", "Designation"].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan="4">
                    Loading employees from Asset Management...
                  </td>
                </tr>
              ) : paged.length > 0 ? (
                paged.map((employee) => (
                  <tr key={employee.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                          {typeof employee.avatar === "string" && /^https?:\/\//i.test(employee.avatar) ? (
                            <img
                              src={employee.avatar}
                              alt={employee.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{employee.avatar || getEmployeeInitials(employee.name)}</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{employee.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500">
                        {employee.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          deptColors[employee.department] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-600">{employee.designation}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan="4">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-400">
              Showing {paged.length} of {filtered.length}
            </span>
            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
