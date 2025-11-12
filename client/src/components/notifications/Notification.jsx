import { useEffect } from "react";
import { Modal, Badge, Button, Spin } from "antd";
import {
  ClockCircleOutlined,
  FileOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import "./Notification.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from "../../store/actions/Notifications.action";
import { ConditionalRendering } from "../../utils/Methods";
import { useNavigate } from 'react-router-dom'
import { GrObjectUngroup } from "react-icons/gr";

const Notification = ({ open, onCancel }) => {
  const dispatch = useDispatch();

  const { userId, notificationList, loading } = useSelector(
    ({ auth, notifications }) => ({
      userId: auth.user?._id,
      notificationList: notifications?.notifications,
      loading: notifications?.notificationsLoading,
    })
  );

  useEffect(() => {
    if (open && userId) {
      dispatch(fetchNotifications({ userId }));
    }
  }, [open, userId, dispatch]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task_assigned":
        return <FileOutlined className="notification-icon" />;
      case "task_reminder":
        return <ClockCircleOutlined className="notification-icon" />;
      default:
        return <FileOutlined className="notification-icon" />;
    }
  };
  const navigate = useNavigate()

  const navigator = (obj) => {
    if(!obj?.read){
      markAsReadFunc(obj._id)
    }
    if (obj?.taskId?._id) {
      navigate(`/task-details/${obj?.taskId?._id}`);
      onCancel(false)
    }
  }

  const markAsReadFunc = (id) => {
    dispatch(markAsRead(id))
  }

  const getNotificationTitle = (type) => {
    switch (type) {
      case "task_assigned":
        return "Task assigned";
      case "task_reminder":
        return "Reminder";
      case "task_due":
        return "Task due soon";
      case "task_completed":
        return "Task completed";
      default:
        return "Notification";
    }
  };

  return (
    <Modal
    classNames={'notification-modal'}
      title={
        <div className="notification-header">
          <span>Notifications</span>
          <Badge count={notificationList?.filter((n) => !n.read).length} />
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={
        <div className="notification-footer">
          <Button
            type="link"
            onClick={() => dispatch(markAllAsRead(userId))}
            disabled={notificationList?.every((n) => n.read)}
          >
            Mark all as read
          </Button>
        </div>
      }
      className="notification-modal"
      width={420}
      bodyStyle={{
        maxHeight: "350px",
        overflowY: "auto",
        padding: "12px 16px",
      }}
    >
      <ConditionalRendering
        condition={loading}
        children={
          <div className="loading-notifications">
            <Spin size="medium" />
          </div>
        }
        elseChildren={
          <ConditionalRendering
            condition={notificationList?.length !== 0}
            children={notificationList?.map((notification) => (
              <div
                key={notification?._id}
                className={`notification-item ${notification.read ? "read" : "unread"}`}
                style={{ cursor: "pointer" }}
                onClick={() => navigator(notification)}
              >
                <div className="notification-icon-wrapper">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <p className="notification-title">
                    {getNotificationTitle(notification.type)}
                  </p>
                  <p className="notification-message">{notification.message}</p>
                  <p className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  {!notification.read && (
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => markAsReadFunc(notification?._id)}
                      className="mark-read-btn"
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            ))}
            elseChildren={
              <div className="no-notifications">No new notifications</div>
            }
          />
        }
      />
    </Modal>
  );
};

export default Notification;
