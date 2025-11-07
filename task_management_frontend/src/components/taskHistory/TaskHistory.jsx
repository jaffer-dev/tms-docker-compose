import React from "react";
import { Card, Steps, Button } from "antd";
import { UserAvatar } from "../../components/userAvatar/UserAvatar";
import { fileBlog } from "../../pages/taskDescription/Helper";

const { Step } = Steps;

const TaskHistory = ({ actions }) => {
  if (!actions || actions.length === 0) return null;

  const sortedActions = [...actions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const getActionTitle = (action) => {
    switch (action.type) {
      case "created":
        return "Task Created";
      case "assigned":
        return `Assigned to ${action.assignedTo?.username || "Unknown"}`;
      case "review":
        return "Task Closed";
      case "update_status":
        return `Status Updated → ${action.status || "Unknown"}`;
      default:
        if (action.action?.includes("Work Submitted")) return "Work Submitted";
        if (action.action?.includes("Uploaded")) return "File Uploaded";
        return "Action Taken";
    }
  };

  const getActionDescription = (action) => {
    let desc = "";

    if (action.type === "created") {
      desc = `${action.user?.username || "Someone"} created this task`;
    } else if (action.type === "assigned") {
      desc = `${action.user?.username || "Someone"} assigned task to ${
        action.assignedTo?.username || "Unknown"
      }`;
    } else if (action.type === "update_status") {
      desc = `${action.user?.username || "Someone"} changed status to "${
        action.status
      }"`;
    } else if (action.action?.includes("Work Submitted")) {
      desc = `${action.user?.username || "Someone"} submitted work`;
    } else if (action.action?.includes("Uploaded")) {
      desc = `${action.user?.username || "Someone"} uploaded a file`;
    }

    return desc;
  };

  return (
      <Steps direction="vertical" current={sortedActions.length}>
        {sortedActions.map((action, index) => (
          <Step
            key={index}
            title={
              <div className="history-step-header">
                <div className="history-step-title">
                  <strong>{getActionTitle(action)}</strong>
                  <span className="history-step-date">
                    •{" "}
                    {new Date(action.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(action.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {action.files?.length > 0 && (
                  <Button
                    type="primary"
                    shape="round"
                    className="view-file-btn"
                    onClick={() => fileBlog(action.files[0])}
                  >
                    View File
                  </Button>
                )}
                {action.link && (
                  <Button
                    type="link"
                    href={action.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Button>
                )}
              </div>
            }
            description={
              <div className="history-step-description d-flex align-items-center gap-10">
                <UserAvatar
                  size={24}
                  name={action.user?.username || "Unknown"}
                />
                <span>{getActionDescription(action)}</span>
              </div>
            }
          />
        ))}
      </Steps>
  );
};

export default TaskHistory;