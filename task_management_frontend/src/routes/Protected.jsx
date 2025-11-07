import React, { Suspense, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Approvals, DashBoard, DepartmentDetails, DescriptionHistory, TaskDetails, TaskHistoryList, Members, Profile, LeaveApprovals } from '../pages';
import Loader from '../components/loader/Loader';
import { LuFile } from 'react-icons/lu';
import { TbSmartHome } from 'react-icons/tb';
import { MdCheck, MdOutlinePeopleAlt } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { HiArrowRightEndOnRectangle } from 'react-icons/hi2';
import { FaHome } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa6';

export const appRoutes = [
  {
    path: '/',
    element: <DashBoard />,
    menu: { key: 'dashboard', icon: <TbSmartHome style={{ fontSize: 24 }} />, label: 'Dashboard' },
  },
  {
    path: '/task-history',
    element: <TaskHistoryList />,
    allowedRoles: ['SUPER_ADMIN', 'AUDITOR', 'EMPLOYEE', 'MANAGER', 'HR', 'SUB_ADMIN', 'SUPERVISOR'],
    menu: { key: 'tasks', icon: <LuFile />, label: 'All Tasks' },
  },
  {
    path: '/approvals',
    element: <Approvals />,
    allowedRoles: ['EMPLOYEE', 'SUPER_ADMIN', 'HOD', 'SUPERVISOR', 'SUB_ADMIN', 'MANAGER'],
    menu: { key: 'approvals', icon: <FaCheck />, label: 'Approvals' },
  },
  {
    path: '/task-details/:taskId',
    element: <TaskDetails />,
    allowedRoles: ['EMPLOYEE', 'SUPER_ADMIN', 'HOD', 'SUPERVISOR', 'SUB_ADMIN', 'MANAGER'],
  },
  {
    path: '/members',
    element: <Members />,
    allowedRoles: ['SUPER_ADMIN'],
    menu: { key: 'members', icon: <MdOutlinePeopleAlt style={{ fontSize: 24 }} />, label: 'Members' },
  },
  {
    path: '/leave-approvals',
    element: <LeaveApprovals />,
    allowedRoles: ['EMPLOYEE', 'SUPER_ADMIN', 'HOD', 'SUPERVISOR', 'SUB_ADMIN', 'MANAGER'],
    menu: { key: 'members', icon: <HiArrowRightEndOnRectangle style={{ fontSize: 24 }} />, label: 'Leave Approvals' },
  },
  {
    path: '/departments/:id',
    element: <DepartmentDetails />,
    allowedRoles: ['SUPER_ADMIN', 'HOD', 'SUPERVISOR', 'SUB_ADMIN', 'MANAGER'],
  },
  {
    path: '*',
    element: <DashBoard />,
    allowedRoles: ['SUPER_ADMIN', 'HOD', 'SUPERVISOR', 'SUB_ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    path: '/profile',
    element: <Profile />,
    allowedRoles: ['EMPLOYEE', 'SUPER_ADMIN', 'HOD', 'SUPERVISOR', 'SUB_ADMIN', 'MANAGER'],
  },
];

const Unauthorized = () => (
  <div
    style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '2rem',
      textAlign: 'center',
    }}
  >
    <h1>🚫 Access Denied</h1>
    <p>You do not have permission to view this page.</p>
  </div>
);

const ProtectedRoute = ({ element }) => {
  return element;
};

const ProtectedRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = useSelector((state) => state.auth.user?.role);

  // ✅ Filter only allowed routes
  const filteredRoutes = useMemo(() => {
    return appRoutes.filter((route) => {
      if (!route.allowedRoles) return true; // routes without restrictions
      return route.allowedRoles.includes(userRole);
    });
  }, [userRole]);

  useEffect(() => {
    if (location) {
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: location.state,
      });
    }
  }, []);

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {filteredRoutes.map(({ path, element, allowedRoles = [] }, index) => (
          <Route
            key={index}
            path={path}
            element={
              allowedRoles.length === 0 || allowedRoles.includes(userRole)
                ? <ProtectedRoute element={element} />
                : <Unauthorized />
            }
          />
        ))}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Suspense>
  );
};

export default ProtectedRoutes;
