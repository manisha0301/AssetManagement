CREATE TABLE IF NOT EXISTS employees (
  employee_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  department VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  avatar TEXT
);

CREATE TABLE IF NOT EXISTS assets (
  asset_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  asset_type VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'Available',
  purchase_date DATE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS teams (
  team_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  manager_id VARCHAR(20) REFERENCES employees(employee_id) ON DELETE SET NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS projects (
  project_id VARCHAR(20) PRIMARY KEY,
  project_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  manager_id VARCHAR(20) REFERENCES employees(employee_id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Planning'
);

CREATE TABLE IF NOT EXISTS team_members (
  team_member_id VARCHAR(20) PRIMARY KEY,
  team_id VARCHAR(20) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  UNIQUE (team_id, employee_id)
);

CREATE TABLE IF NOT EXISTS project_members (
  project_member_id VARCHAR(20) PRIMARY KEY,
  project_id VARCHAR(20) NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  UNIQUE (project_id, employee_id)
);

CREATE TABLE IF NOT EXISTS asset_assignments (
  assignment_id VARCHAR(20) PRIMARY KEY,
  asset_id VARCHAR(20) NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
  assigned_to_type VARCHAR(20) NOT NULL,
  employee_id VARCHAR(20) REFERENCES employees(employee_id) ON DELETE SET NULL,
  team_id VARCHAR(20) REFERENCES teams(team_id) ON DELETE SET NULL,
  project_id VARCHAR(20) REFERENCES projects(project_id) ON DELETE SET NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  return_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  CONSTRAINT asset_assignments_target_check CHECK (
    (
      assigned_to_type = 'employee'
      AND employee_id IS NOT NULL
      AND team_id IS NULL
      AND project_id IS NULL
    )
    OR (
      assigned_to_type = 'team'
      AND employee_id IS NULL
      AND team_id IS NOT NULL
      AND project_id IS NULL
    )
    OR (
      assigned_to_type = 'project'
      AND employee_id IS NULL
      AND team_id IS NULL
      AND project_id IS NOT NULL
    )
  )
);

CREATE TABLE IF NOT EXISTS temporary_issues (
  issue_id VARCHAR(20) PRIMARY KEY,
  asset_id VARCHAR(20) NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
  employee_id VARCHAR(20) REFERENCES employees(employee_id) ON DELETE SET NULL,
  issued_by VARCHAR(20) REFERENCES employees(employee_id) ON DELETE SET NULL,
  received_by VARCHAR(20) REFERENCES employees(employee_id) ON DELETE SET NULL,
  purpose TEXT NOT NULL,
  event_name TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  return_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS activity_logs (
  activity_id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_users (
  user_id VARCHAR(20) PRIMARY KEY,
  display_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
