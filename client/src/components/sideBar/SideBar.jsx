import React, { useState, useEffect } from "react";
import {
  HomeOutlined,
  ClockCircleOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import "./Sidebar.css";
import { Badge, Dropdown } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { UserAvatar } from "../userAvatar/UserAvatar";
import { logout } from "../../store/actions/Auth.action";
import { useNavigate } from "react-router-dom";
import Profile from "../profile/Profile";

const ProfileDropdown = ({ userName, onProfileClick, onLogout }) => {
  const items = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: onProfileClick,
    },
    {
      key: "2",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => onLogout(),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <a onClick={(e) => e.preventDefault()}>
        <div className="sidebar-profile-icon">
          <UserAvatar className="profile-img" name={userName || ""} />
        </div>
      </a>
    </Dropdown>
  );
};

const Sidebar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userName, profileData, userRole } = useSelector(({ auth }) => ({
    userName: auth?.user?.username,
    profileData: auth?.user,
    userId: auth.user?._id,
    userRole: auth.user?.role,

  }));

  const navIcons = [
    { icon: <HomeOutlined />, label: "Home", onClick: () => navigate("/") },
    { icon: <ClockCircleOutlined />, label: "History", onClick: () => navigate("/task-history") },
    { icon: <CheckCircleOutlined />, label: "Approvals", onClick: () => navigate("/approvals") },
    ...(userRole === "SUPER_ADMIN"
      ? [{ icon: <UsergroupAddOutlined />, label: "Members", onClick: () => navigate("/members") }]
      : []),
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`sidebar ${isMobile ? "mobile-nav" : ""}`}>
      <div className="nav-items">
        {navIcons.map((item, index) => (
          <div
            key={index}
            className={`nav-icon ${activeIndex === index ? "active" : ""}`}
            onClick={() => {
              setActiveIndex(index);
              item.onClick();
            }}
          >
            <span className="icon">{item.icon}</span>
          </div>
        ))}

        <ProfileDropdown
          userName={userName}
          onProfileClick={() => setProfileOpen(true)}
          onLogout={() => dispatch(logout())}
        />
      </div>

      <Profile
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={() => setProfileOpen(false)}
        userData={profileData}
      />
    </div>
  );
};

export default Sidebar;
