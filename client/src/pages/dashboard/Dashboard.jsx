import React, { useEffect, useState } from 'react';
import { CountCards, OrganizationView, TaskKPIsChart, ProgressBar, TasksTableView, CreateDepartment, Notification } from '../../components';
import './Dashboard.css';
import { useDispatch, useSelector } from 'react-redux';
import { ConditionalRendering } from '../../utils/Methods';
import { Badge, Button } from 'antd';
import { BellOutlined, DownloadOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import CreateTaskModal from '../../components/createTaskModal/CreateTaskModal';
import { generateStructuredPDF } from './Helper';
import { fetchNonHRUsers, getUserStats } from '../../store/actions/Users.action';
import ErrorBoundary from './ErrorBoundary';
import { fetchNotifications } from '../../store/actions/Notifications.action';
import { useNavigate } from 'react-router-dom';

const DashBoard = () => {

  const { userName, userRole, departments, userStates, employees, notifications, userId, userStatsLoading, userStats } = useSelector(({ auth, departments, users, notifications }) => ({
    userName: auth?.user?.username || 'Unknown User',
    userRole: auth?.user?.role || 'Unknown Role',
    userEmail: auth?.user?.email || 'No email',
    userId: auth?.user?._id || null,
    departments: departments?.getDepartmentsData,
    // userStates: users?.userStats,
    employees: users?.getNonHrUsers,
    notifications: notifications?.notifications,
    userStats: users.userStats || {},
    userStatsLoading: users.userStatsLoading
  }));

  const [isOpenCreateTeamModal, setIsOpenCreateTeamModal] = useState(false);
  const [isOpenCreateTaskModal, setIsOpenCreateTaskModal] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleExportPDF = async () => {
    setLoading(true);
    await generateStructuredPDF({ userName, userRole, departments, employees, userStates });
    setLoading(false);
  };

  useEffect(() => {
    let payload = {
      userId: userId
    }
    dispatch(getUserStats()); // moved from CountCards
    dispatch(fetchNotifications(payload));
    if (userRole !== 'EMPLOYEE') {
      dispatch(fetchNonHRUsers())
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const checkReadNotifications = notifications?.filter(
    (item) => !item?.read
  )?.length || 0;

  return (
    <ErrorBoundary>
      <div className='dashboard-container'>
        <div className="dashboard-bg"></div>
        <div className="dashboard-wrapper">
          <div className="dashboard-header">
            <div className="header-title-name">
              <h3>Dashboard</h3>
            </div>
            <div className="dashboard-header-right">
              <Button
                type="default"
                shape="round"
                icon={<DownloadOutlined />}
                size="large"
                onClick={handleExportPDF}
                loading={loading}
                disabled={loading}
              >
                <span className="btn-text">Export Report</span>
              </Button>

              <ConditionalRendering
                condition={!['AUDITOR'].includes(userRole)}
                children={
                  <Button
                    type="primary"
                    shape="round"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => setIsOpenCreateTaskModal(true)}
                  >
                    <span className="btn-text">New Task</span>
                  </Button>} />
            </div>
          </div>

          <div className="dashboard-content">
            <div className="dashboard-counts margin-top_20">
              <CountCards stats={userStats} type={'stats'} loading={userStatsLoading} onCardClick={(item) => {
                navigate("/task-history", {
                  state: { status: item.status === 'TOTAL' ? 'all' : item.status }
                });
              }} />

            </div>

            {/* <div className="dashboard-teams-section d-flex-center">
              <TaskKPIsChart tasks={userStates} />
              <ProgressBar size="default" tasks={userStates} />
            </div> */}

            <div className="dashboard-teams-section">
              <TasksTableView />
            </div>

            <ConditionalRendering
              condition={!['EMPLOYEE', 'AUDITOR'].includes(userRole)}
              children={
                <div className="dashboard-teams-section">
                  <OrganizationView departments={departments} />
                </div>
              }
            />
          </div>
        </div>
      </div>

      <CreateDepartment
        isOpenAddModal={isOpenCreateTeamModal}
        setIsOpenAddModal={setIsOpenCreateTeamModal}
      />
      <CreateTaskModal
        isOpenAddModal={isOpenCreateTaskModal}
        setIsOpenAddModal={setIsOpenCreateTaskModal}
      />
      <Notification
        open={isNotificationOpen}
        userId={userId}
        onCancel={() => setNotificationOpen(false)}
      />

    </ErrorBoundary >
  );
};

export default DashBoard;