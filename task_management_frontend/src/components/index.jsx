import { lazy } from "react";

// without lazy 
const CountCards = lazy(() => import("./countCards/CountCards"));
const TasksTableView = lazy(() => import("./tasksTableView"));
const PageHeader = lazy(() => import("./pageHeaderWrapper/PageHeader"));
const OrganizationView = lazy(() => import("./dashboardDepartment/OrganizationView"));
const Departments = lazy(() => import("./dashboardDepartment/Departments"));
const EmployeesList = lazy(() => import("./dashboardDepartment/EmployeesList"));

// with lazy 
const AssignTaskModal = lazy(() => import("./assignTaskModal/AssignTaskModal"));
const Comments = lazy(() => import("./comments/Comments"));
const CreateDepartment = lazy(() => import("./createDepartment/CreateDepartment"))
const CreateLeaveRequest = lazy(() => import("./createLeaveRequest/CreateLeaveRequest"))
const AddDepartmentMember = lazy(() => import("./addDepartmentMember/AddDepartmentMember"));
const Notification = lazy(() => import("./notifications/Notification"));
const Profile = lazy(() => import("./profile/Profile"));
const ForgotPasswordModal = lazy(() => import("../pages/auth/index"));
const TaskKPIsChart = lazy(() => import("./chart/Chart"));
const ProgressBar = lazy(() => import("./progress/ProgressBar"));
const UpdateUserPersonalDetails = lazy(() => import("./userPersonalDetailsModal/Index"))

export {
  CountCards,
  OrganizationView,
  TasksTableView,
  PageHeader,
  ProgressBar,
  TaskKPIsChart,
  Departments,
  EmployeesList,
  AddDepartmentMember,
  Profile,
  Notification,
  ForgotPasswordModal,
  AssignTaskModal,
  Comments,
  CreateDepartment,
  CreateLeaveRequest,
  UpdateUserPersonalDetails
};