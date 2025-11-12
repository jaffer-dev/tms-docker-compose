import { lazy } from "react";


const CountCards = lazy(() => import("./countCards/CountCards"));
const TasksTableView = lazy(() => import("./tasksTableView"));
const PageHeader = lazy(() => import("./pageHeaderWrapper/PageHeader"));
const ProgressBar = lazy(() => import("./progress/ProgressBar"));
const TaskKPIsChart = lazy(() => import("./chart/Chart"));
const OrganizationView = lazy(() => import("./dashboardDepartment/OrganizationView"));
const Departments = lazy(() => import("./dashboardDepartment/Departments"));
const EmployeesList = lazy(() => import("./dashboardDepartment/EmployeesList"));
const AddDepartmentMember = lazy(() => import("./addDepartmentMember/AddDepartmentMember"));
const Profile = lazy(() => import("./profile/Profile"));
const Notification = lazy(() => import("./notifications/Notification"));
const ForgotPasswordModal = lazy(() => import("../pages/auth/index"));
const AssignTaskModal = lazy(() => import("./assignTaskModal/AssignTaskModal"));
const Comments = lazy(() => import("./comments/Comments"));
const CreateDepartment = lazy(() => import("./createDepartment/CreateDepartment"))
const CreateLeaveRequest = lazy(() => import("./createLeaveRequest/CreateLeaveRequest"))
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
