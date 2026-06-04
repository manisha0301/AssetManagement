export const mockEmployees = [
  { id: "EMP001", name: "Arjun Mehta", department: "Engineering", designation: "Senior Developer", avatar: "AM" },
  { id: "EMP002", name: "Priya Sharma", department: "Design", designation: "UI/UX Lead", avatar: "PS" },
  { id: "EMP003", name: "Rohan Das", department: "Product", designation: "Product Manager", avatar: "RD" },
  { id: "EMP004", name: "Sneha Patel", department: "Engineering", designation: "Backend Developer", avatar: "SP" },
  { id: "EMP005", name: "Vikram Singh", department: "QA", designation: "QA Engineer", avatar: "VS" },
  { id: "EMP006", name: "Ananya Roy", department: "HR", designation: "HR Manager", avatar: "AR" },
  { id: "EMP007", name: "Karan Gupta", department: "Engineering", designation: "DevOps Engineer", avatar: "KG" },
  { id: "EMP008", name: "Meera Joshi", department: "Marketing", designation: "Marketing Lead", avatar: "MJ" },
  { id: "EMP009", name: "Rahul Nair", department: "Sales", designation: "Sales Executive", avatar: "RN" },
  { id: "EMP010", name: "Divya Kapoor", department: "Finance", designation: "Finance Analyst", avatar: "DK" },
];

export const mockAssets = [
  { id: "LAP001", name: "Dell XPS 15", type: "Laptop", serial: "DX15-2024-001", status: "Assigned", assignmentType: "team", assignmentRef: "RND001", assignedTo: null, assignedDate: "2024-02-01", purchaseDate: "2024-01-15", description: "High performance laptop for development" },
  { id: "PEN001", name: "Samsung 128GB Pendrive", type: "Pendrive", serial: "SAM-PD-002", status: "Assigned", assignmentType: "project", assignmentRef: "PRJ001", assignedTo: null, assignedDate: "2024-02-10", purchaseDate: "2024-02-10", description: "USB 3.0 storage device" },
  { id: "PHN001", name: "iPhone 14 Pro", type: "Phone", serial: "IPH14-003", status: "Assigned", assignmentType: "project", assignmentRef: "PRJ002", assignedTo: null, assignedDate: "2024-02-08", purchaseDate: "2024-01-20", description: "Company mobile device" },
  { id: "LAP002", name: "MacBook Pro M3", type: "Laptop", serial: "MBP-M3-004", status: "Assigned", assignmentType: "team", assignmentRef: "RND001", assignedTo: null, assignedDate: "2024-03-12", purchaseDate: "2024-03-05", description: "Apple MacBook for design work" },
  { id: "DTC001", name: "USB-C Data Cable", type: "Data Cable", serial: "USB-C-005", status: "Assigned", assignmentType: "project", assignmentRef: "PRJ001", assignedTo: null, assignedDate: "2024-02-28", purchaseDate: "2024-02-28", description: "USB-C to USB-C cable 2m" },
  { id: "LAP003", name: "Lenovo ThinkPad X1", type: "Laptop", serial: "LTP-X1-006", status: "Temporary", assignmentType: "temporary", assignmentRef: "TMP001", assignedTo: "EMP005", purchaseDate: "2023-11-10", description: "Slim business laptop" },
  { id: "CHR001", name: "Samsung Charger 65W", type: "Charger", serial: "SAM-CHR-007", status: "Available", assignmentType: null, assignmentRef: null, assignedTo: null, purchaseDate: "2024-04-01", description: "Fast charging adapter" },
  { id: "PHN002", name: "OnePlus 12", type: "Phone", serial: "OP12-008", status: "Assigned", assignmentType: "project", assignmentRef: "PRJ002", assignedTo: null, assignedDate: "2024-03-01", purchaseDate: "2024-02-14", description: "Android flagship device" },
  { id: "PEN002", name: "SanDisk 64GB Pendrive", type: "Pendrive", serial: "SDK-PD-009", status: "Assigned", assignmentType: "project", assignmentRef: "PRJ001", assignedTo: null, assignedDate: "2024-03-20", purchaseDate: "2024-03-20", description: "Compact USB storage" },
  { id: "LAP004", name: "Apple MacBook Air M2", type: "Laptop", serial: "MBA-M2-010", status: "Assigned", assignmentType: "employee", assignmentRef: "EMP006", assignedTo: "EMP006", assignedDate: "2024-01-18", purchaseDate: "2024-01-05", description: "Lightweight laptop for HR" },
  { id: "DTC002", name: "Lightning Cable", type: "Data Cable", serial: "LGT-CB-011", status: "Temporary", assignmentType: "temporary", assignmentRef: "TMP002", assignedTo: "EMP007", purchaseDate: "2023-12-15", description: "Apple lightning cable" },
  { id: "LAP005", name: "HP Pavilion 15", type: "Laptop", serial: "HPP-15-012", status: "Assigned", assignmentType: "team", assignmentRef: "RND002", assignedTo: null, assignedDate: "2023-10-22", purchaseDate: "2023-10-22", description: "Mid-range business laptop" },
];

export const mockRnDTeams = [
  { id: "RND001", name: "AI Research Team", manager: "EMP001", members: ["EMP002", "EMP004", "EMP007"], assets: ["LAP001", "LAP002"], description: "Focused on machine learning research" },
  { id: "RND002", name: "Platform Innovation", manager: "EMP003", members: ["EMP005", "EMP009"], assets: ["LAP005"], description: "Building next-gen platform features" },
  { id: "RND003", name: "Security R&D", manager: "EMP007", members: ["EMP006", "EMP010"], assets: [], description: "Cybersecurity research and development" },
];

export const mockProjects = [
  { id: "PRJ001", code: "PROJ-001", name: "Customer Portal Redesign", manager: "EMP002", members: ["EMP001", "EMP005", "EMP008"], assets: ["PEN001", "DTC001", "PEN002"], status: "Active" },
  { id: "PRJ002", code: "PROJ-002", name: "Mobile App v3.0", manager: "EMP003", members: ["EMP004", "EMP007"], assets: ["PHN001", "PHN002"], status: "Active" },
  { id: "PRJ003", code: "PROJ-003", name: "Data Analytics Platform", manager: "EMP001", members: ["EMP006", "EMP009", "EMP010"], assets: [], status: "Planning" },
];

export const mockTemporary = [
  { id: "TMP001", employeeId: "EMP005", assetId: "LAP003", issueDate: "2024-05-01", returnDate: "2024-05-15", reason: "Conference presentation", modalName: "Internal Conference", givenBy: "EMP006", receivedBy: "EMP001", status: "Active" },
  { id: "TMP002", employeeId: "EMP007", assetId: "DTC002", issueDate: "2024-04-20", returnDate: "2024-04-30", reason: "Client demo", modalName: "Client Meeting", givenBy: "EMP001", receivedBy: "EMP003", status: "Returned" },
  { id: "TMP003", employeeId: "EMP009", assetId: "PEN002", issueDate: "2024-05-10", returnDate: "2024-05-20", reason: "Data transfer project", modalName: "Q2 Data Migration", givenBy: "EMP003", receivedBy: "EMP006", status: "Active" },
];

export const mockActivities = [
  { id: 1, action: "Asset Assigned", description: "Dell XPS 15 assigned to Arjun Mehta", time: "2 hours ago", type: "assign", icon: "assign" },
  { id: 2, action: "New Asset Added", description: "Samsung 128GB Pendrive added to inventory", time: "4 hours ago", type: "add", icon: "add" },
  { id: 3, action: "Asset Returned", description: "Lightning Cable returned by Karan Gupta", time: "Yesterday", type: "return", icon: "return" },
  { id: 4, action: "Team Created", description: "AI Research Team created with 3 members", time: "2 days ago", type: "team", icon: "team" },
  { id: 5, action: "Project Allocated", description: "Assets allocated to Customer Portal project", time: "3 days ago", type: "project", icon: "project" },
];


