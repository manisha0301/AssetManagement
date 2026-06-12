import DashboardPage from "../features/dashboard/DashboardPage";
import LoginPage from "../features/login/Login";
import { AddAssetPage, AssetDetailPage, AssetsPage } from "../features/assets/AssetsPage";
import EmployeesPage from "../features/employees/EmployeesPage";
import { CreateProjectPage, ProjectDetailPage, ProjectsPage } from "../features/projects/ProjectsPage";
import { CreateRnDPage, RnDDetailPage, RnDPage } from "../features/rnd/RnDPage";
import { CreateTemporaryPage, TemporaryDetailPage, TemporaryPage } from "../features/temporary/TemporaryPage";

const pageConfig = {
  "/login": { component: LoginPage, title: "Sign In" },
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

export function matchRoute(currentPath) {
  for (const [pattern, config] of Object.entries(pageConfig)) {
    const patternParts = pattern.split("/");
    const pathParts = currentPath.split("/");

    if (patternParts.length !== pathParts.length) continue;

    const params = {};
    let match = true;

    for (let index = 0; index < patternParts.length; index += 1) {
      if (patternParts[index].startsWith(":")) {
        params[patternParts[index].slice(1)] = pathParts[index];
      } else if (patternParts[index] !== pathParts[index]) {
        match = false;
        break;
      }
    }

    if (match) {
      return { ...config, params };
    }
  }

  return { component: DashboardPage, title: "Dashboard", params: {} };
}

export default pageConfig;


