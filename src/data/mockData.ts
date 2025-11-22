export interface Employee {
  id: string;
  name: string;
  position: string;
  division: string;
  status: 'Active' | 'On Leave';
  avatar: string;
  email: string;
  joinDate: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  progress: number;
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  checklist: Array<{ item: string; completed: boolean }>;
}

export interface Transaction {
  id: string;
  date: string;
  transactionId: string;
  description: string;
  category: 'Operational' | 'Sales' | 'Payroll' | 'Marketing' | 'Investment';
  amount: number;
  type: 'Income' | 'Expense';
  status: 'Completed' | 'Pending';
}

export const employees: Employee[] = [
  {
    id: 'E001',
    name: 'Andi Wijaya',
    position: 'UI/UX Designer',
    division: 'Design',
    status: 'Active',
    avatar: 'AW',
    email: 'andi.wijaya@company.com',
    joinDate: '2023-01-15',
  },
  {
    id: 'E002',
    name: 'Siti Nurhaliza',
    position: 'Frontend Developer',
    division: 'Engineering',
    status: 'Active',
    avatar: 'SN',
    email: 'siti.nurhaliza@company.com',
    joinDate: '2023-03-20',
  },
  {
    id: 'E003',
    name: 'Budi Santoso',
    position: 'Project Manager',
    division: 'Management',
    status: 'Active',
    avatar: 'BS',
    email: 'budi.santoso@company.com',
    joinDate: '2022-11-10',
  },
  {
    id: 'E004',
    name: 'Dewi Lestari',
    position: 'Finance Manager',
    division: 'Finance',
    status: 'On Leave',
    avatar: 'DL',
    email: 'dewi.lestari@company.com',
    joinDate: '2022-08-05',
  },
  {
    id: 'E005',
    name: 'Rizki Pratama',
    position: 'Backend Developer',
    division: 'Engineering',
    status: 'Active',
    avatar: 'RP',
    email: 'rizki.pratama@company.com',
    joinDate: '2023-05-12',
  },
];

export const tasks: Task[] = [
  {
    id: 'T001',
    title: 'Design Landing Page',
    description: 'Create a modern landing page design for the new product launch',
    priority: 'High',
    progress: 70,
    assignee: { name: 'Andi Wijaya', avatar: 'AW' },
    dueDate: '2025-11-15',
    status: 'In Progress',
    checklist: [
      { item: 'Research competitors', completed: true },
      { item: 'Create wireframes', completed: true },
      { item: 'Design mockups', completed: false },
    ],
  },
  {
    id: 'T002',
    title: 'Implement User Authentication',
    description: 'Build secure authentication system with JWT',
    priority: 'High',
    progress: 90,
    assignee: { name: 'Siti Nurhaliza', avatar: 'SN' },
    dueDate: '2025-11-18',
    status: 'Review',
    checklist: [
      { item: 'Setup JWT', completed: true },
      { item: 'Create login page', completed: true },
      { item: 'Add password reset', completed: true },
    ],
  },
  {
    id: 'T003',
    title: 'Database Schema Design',
    description: 'Design and implement the database schema for the ERP system',
    priority: 'Medium',
    progress: 100,
    assignee: { name: 'Rizki Pratama', avatar: 'RP' },
    dueDate: '2025-11-10',
    status: 'Done',
    checklist: [
      { item: 'Create ERD', completed: true },
      { item: 'Write migrations', completed: true },
      { item: 'Test relations', completed: true },
    ],
  },
  {
    id: 'T004',
    title: 'Financial Report Module',
    description: 'Build monthly financial reporting feature',
    priority: 'High',
    progress: 30,
    assignee: { name: 'Dewi Lestari', avatar: 'DL' },
    dueDate: '2025-11-12',
    status: 'In Progress',
    checklist: [
      { item: 'Define requirements', completed: true },
      { item: 'Create report template', completed: false },
      { item: 'Add export feature', completed: false },
    ],
  },
  {
    id: 'T005',
    title: 'API Documentation',
    description: 'Write comprehensive API documentation',
    priority: 'Low',
    progress: 0,
    assignee: { name: 'Rizki Pratama', avatar: 'RP' },
    dueDate: '2025-11-25',
    status: 'To Do',
    checklist: [
      { item: 'List all endpoints', completed: false },
      { item: 'Add examples', completed: false },
      { item: 'Create Postman collection', completed: false },
    ],
  },
  {
    id: 'T006',
    title: 'User Testing Session',
    description: 'Conduct user testing for the new dashboard',
    priority: 'Medium',
    progress: 0,
    assignee: { name: 'Budi Santoso', avatar: 'BS' },
    dueDate: '2025-11-20',
    status: 'To Do',
    checklist: [
      { item: 'Recruit testers', completed: false },
      { item: 'Prepare test scenarios', completed: false },
      { item: 'Document feedback', completed: false },
    ],
  },
  {
    id: 'T007',
    title: 'Performance Optimization',
    description: 'Optimize frontend performance and loading times',
    priority: 'Medium',
    progress: 50,
    assignee: { name: 'Siti Nurhaliza', avatar: 'SN' },
    dueDate: '2025-11-19',
    status: 'In Progress',
    checklist: [
      { item: 'Analyze bundle size', completed: true },
      { item: 'Implement lazy loading', completed: true },
      { item: 'Optimize images', completed: false },
    ],
  },
  {
    id: 'T008',
    title: 'Mobile Responsiveness',
    description: 'Ensure all pages are mobile-friendly',
    priority: 'High',
    progress: 80,
    assignee: { name: 'Andi Wijaya', avatar: 'AW' },
    dueDate: '2025-11-16',
    status: 'Review',
    checklist: [
      { item: 'Test on mobile devices', completed: true },
      { item: 'Fix layout issues', completed: true },
      { item: 'Update breakpoints', completed: false },
    ],
  },
  {
    id: 'T009',
    title: 'Security Audit',
    description: 'Perform security audit on the application',
    priority: 'Low',
    progress: 0,
    assignee: { name: 'Rizki Pratama', avatar: 'RP' },
    dueDate: '2025-11-30',
    status: 'To Do',
    checklist: [
      { item: 'Check dependencies', completed: false },
      { item: 'Test authentication', completed: false },
      { item: 'Review permissions', completed: false },
    ],
  },
  {
    id: 'T010',
    title: 'Deploy to Production',
    description: 'Deploy the application to production server',
    priority: 'Medium',
    progress: 100,
    assignee: { name: 'Budi Santoso', avatar: 'BS' },
    dueDate: '2025-11-08',
    status: 'Done',
    checklist: [
      { item: 'Setup CI/CD', completed: true },
      { item: 'Configure server', completed: true },
      { item: 'Deploy application', completed: true },
    ],
  },
];

export const transactions: Transaction[] = [
  {
    id: 'TRX001',
    date: '2025-11-17',
    transactionId: 'INV-2025-001',
    description: 'Client payment for website development',
    category: 'Sales',
    amount: 50000000,
    type: 'Income',
    status: 'Completed',
  },
  {
    id: 'TRX002',
    date: '2025-11-16',
    transactionId: 'EXP-2025-045',
    description: 'Office rent payment November 2025',
    category: 'Operational',
    amount: 15000000,
    type: 'Expense',
    status: 'Completed',
  },
  {
    id: 'TRX003',
    date: '2025-11-15',
    transactionId: 'INV-2025-002',
    description: 'Mobile app development project milestone 2',
    category: 'Sales',
    amount: 35000000,
    type: 'Income',
    status: 'Completed',
  },
  {
    id: 'TRX004',
    date: '2025-11-15',
    transactionId: 'EXP-2025-046',
    description: 'Employee salary November 2025',
    category: 'Payroll',
    amount: 45000000,
    type: 'Expense',
    status: 'Completed',
  },
  {
    id: 'TRX005',
    date: '2025-11-14',
    transactionId: 'EXP-2025-047',
    description: 'Marketing campaign - Social Media Ads',
    category: 'Marketing',
    amount: 8000000,
    type: 'Expense',
    status: 'Completed',
  },
  {
    id: 'TRX006',
    date: '2025-11-13',
    transactionId: 'INV-2025-003',
    description: 'Consulting service fee',
    category: 'Sales',
    amount: 12000000,
    type: 'Income',
    status: 'Pending',
  },
  {
    id: 'TRX007',
    date: '2025-11-12',
    transactionId: 'EXP-2025-048',
    description: 'Software licenses and subscriptions',
    category: 'Operational',
    amount: 5500000,
    type: 'Expense',
    status: 'Completed',
  },
  {
    id: 'TRX008',
    date: '2025-11-11',
    transactionId: 'INV-2025-004',
    description: 'UI/UX design project',
    category: 'Sales',
    amount: 18000000,
    type: 'Income',
    status: 'Completed',
  },
  {
    id: 'TRX009',
    date: '2025-11-10',
    transactionId: 'EXP-2025-049',
    description: 'Office equipment and furniture',
    category: 'Investment',
    amount: 25000000,
    type: 'Expense',
    status: 'Pending',
  },
  {
    id: 'TRX010',
    date: '2025-11-09',
    transactionId: 'EXP-2025-050',
    description: 'Internet and utility bills',
    category: 'Operational',
    amount: 3500000,
    type: 'Expense',
    status: 'Completed',
  },
];

export const dashboardStats = {
  projects: {
    active: 3,
    completed: 7,
    overdueTasks: 5,
  },
  finance: {
    currentMonthIncome: 115000000,
    currentMonthExpense: 102000000,
    balance: 13000000,
  },
  attendance: {
    lastCheckIn: null as string | null,
    lastCheckOut: null as string | null,
  },
};
