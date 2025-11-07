import { lazy } from "react";

const DescriptionHistory = lazy(() => import("./taskDescription/TaskDescription"));
const DepartmentDetails = lazy(() => import("./departmentMembers/DepartmentMembers"));
const DashBoard = lazy(() => import("./dashboard/Dashboard"));
const Approvals = lazy(() => import("./approvals/Approvals"))
const TaskHistoryList = lazy(() => import("./taskHistoryList/TaskHistoryList"))
const TaskDetails = lazy(() => import("./taskDescription/TaskDescription"))
const Members = lazy(() => import("./members/Members"))
const Profile = lazy(() => import("./profile/Profile"))
const LeaveApprovals = lazy(() => import("./leaveApprovals/LeaveApprovals"))

export {
    DashBoard,
    DepartmentDetails,
    DescriptionHistory,
    Approvals,
    TaskDetails,
    TaskHistoryList,
    Members,
    Profile,
    LeaveApprovals
}
