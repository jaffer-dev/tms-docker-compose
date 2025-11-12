import React, { useEffect, useState, useMemo } from 'react';
import { BellOutlined, LogoutOutlined, PlusCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, Layout, Menu, theme } from 'antd';
import './PageWrapper.css';
import logo from '../../assets/Logo.png';
import { ConditionalRendering } from '../../utils/Methods.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { appRoutes } from '../../routes/Protected.jsx';
import { UserAvatar } from '../../components/userAvatar/UserAvatar';
import { useDispatch, useSelector } from 'react-redux';
import Profile from '../../components/profile/Profile';
import { logout } from '../../store/actions/Auth.action';
import CreateDepartment from '../../components/createDepartment/CreateDepartment';
import Notification from '../../components/notifications/Notification';
import { fetchNotifications } from '../../store/actions/Notifications.action';

const { Header, Sider, Content } = Layout;

const PageWrapper = ({ children }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [isOpenCreateTeamModal, setIsOpenCreateTeamModal] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);

  const { userName, profileData, userId, unreadCount, userRole } = useSelector(({ auth, notifications }) => ({
    userName: auth?.user?.username,
    profileData: auth?.user,
    userId: auth?.user?._id || null,
    unreadCount: (notifications.notifications || []).filter(n => !n.read).length,
    userRole: auth?.user?.role,
  }));

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications({ userId }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [userId]);

  // ✅ Filter routes based on role
  const allowedMenuItems = useMemo(() => {
    return appRoutes.filter(
      (route) =>
        route.menu && (
          !route.allowedRoles || route.allowedRoles.includes(userRole)
        )
    );
  }, [userRole]);

  // ✅ Map allowed routes to AntD menu items
  const menuItems = useMemo(() => {
    return allowedMenuItems?.map((r) => {
      if (r.menu.key === 'add-dept') {
        return {
          ...r.menu,
          key: r.path.replace(/^\//, '') || 'dashboard',
          onClick: () => setIsOpenCreateTeamModal(true),
        };
      }
      return {
        ...r.menu,
        key: r.path.replace(/^\//, '') || 'dashboard',
        onClick: () => navigate(r.path),
      };
    });
  }, [allowedMenuItems]);

  const activeKey = menuItems?.find(m =>
    location.pathname.startsWith(`/${m.key}`)
  )?.key;

  const profileMenu = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate("/profile"),
    },
    {
      key: '2',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => dispatch(logout()),
    },
  ];

  return (
    <div className="page-container">
      <Layout hasSider>
        {/* Sidebar */}
        <Sider
          width={90}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            zIndex: 1000,
            paddingTop: 20,
          }}
        >
          <div className="sidebar-logo">
            <img src={logo} alt="logo" />
          </div>

          <Menu
            mode="inline"
            selectedKeys={activeKey ? [activeKey] : []}
            style={{ borderRight: 0, textAlign: 'center', fontSize: 10 }}
            items={menuItems}
          />

          <ConditionalRendering
            condition={!['EMPLOYEE', 'HOD', 'SUPERVISOR'].includes(profileData?.role)}
            children={
              <div className="addDept" onClick={() => setIsOpenCreateTeamModal(true)}>
                <div className="addDept-icon-container">
                  <PlusCircleOutlined className='addDept-icon' />
                </div>
                <div className="addDept-data">
                  <p>Add Dept.</p>
                </div>
              </div>
            }
          />
        </Sider>

        {/* Content */}
        <Layout style={{ marginLeft: 90, minHeight: '100vh' }}>
          <Header className='header-main'>
            <div className="page-header-container">
              <div className="page-header-left">
                <h3>Welcome back <span className='dashboard-userName'>{userName}</span></h3>
              </div>
              <div className="page-header-right">
                <ConditionalRendering
                  condition={true}
                  children={
                    <div className='dashboard-notification-container' onClick={() => setNotificationOpen(true)}>
                      <Badge size="small" count={unreadCount}>
                        <BellOutlined className="dashboard-notification-icon" />
                      </Badge>
                    </div>
                  }
                />
                <Dropdown menu={{ items: profileMenu }} trigger={['click']}>
                  <a onClick={(e) => e.preventDefault()}>
                    <div className="sidebar-profile-icon">
                      <UserAvatar className="profile-img" name={userName || ''} />
                    </div>
                  </a>
                </Dropdown>
              </div>
            </div>
          </Header>

          <Content style={{ marginTop: 82, color: 'white', minHeight: 'max-content' }}>
            <Profile
              isProfileOpen={isProfileOpen}
              setIsProfileOpen={() => setIsProfileOpen(false)}
              userData={profileData}
            />

            <Notification
              open={isNotificationOpen}
              userId={userId}
              onCancel={() => setNotificationOpen(false)}
            />

            <CreateDepartment
              isOpenAddModal={isOpenCreateTeamModal}
              setIsOpenAddModal={setIsOpenCreateTeamModal}
            />

            {children}
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default PageWrapper;
