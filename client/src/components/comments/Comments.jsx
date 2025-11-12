import React, { useEffect, useState } from "react";
import { Drawer, List, Tooltip, Input, Typography, Space, Button } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useDispatch, useSelector } from "react-redux";
import { UserAvatar } from "../userAvatar/UserAvatar";
import { getComments, addComments } from "../../store/actions/Task.action";
import { renderDate } from "../../utils/Methods";
import "./Comments.css"

dayjs.extend(relativeTime);

const { Text } = Typography;

const Comments = ({ isOpenCommentModal, setIsOpenCommentModal, selected, setSelected }) => {
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState("");

  const { userName, userId, comments, loading } = useSelector(({ auth, task }) => ({
    userName: auth?.user?.username,
    userId: auth?.user?._id,
    comments: task?.comments || [],
    loading: task?.getCommentsLoading,
  }));

  useEffect(() => {
    if (isOpenCommentModal && selected) {
      dispatch(getComments({ taskId: selected }));
    }
  }, [selected, dispatch]);

  const handleClose = () => {
    setIsOpenCommentModal(false);
    setSelected?.(null);
  };

  const addCommentCallBack = () => {
    setNewComment("");
    dispatch(getComments({ taskId: selected }));
  };

  const handleAddComment = () => {
    const val = newComment.trim();
    if (!val) return;

    const payload = {
      taskId: selected,
      commenterId: userId,
      commentText: val,
    };
    dispatch(addComments(payload, addCommentCallBack));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <Drawer
      title="Comments"
      placement="right"
      open={isOpenCommentModal}
      onClose={handleClose}
      loading={loading}
      width={420}
      bodyStyle={{ padding: 0, display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
        <List
          dataSource={comments}
          loading={loading}
          locale={{ emptyText: "No comments yet" }}
          renderItem={(item) => (
            <List.Item style={{ borderBottom: "1px solid #f0f0f0", padding: "12px 16px" }}>
              <Space align="start" size={12}>
                <UserAvatar name={item?.commenterId?.username} />
                <div>
                  <Space size={8}>
                    <Text strong>{item?.commenterId?.username || "Unknown"}</Text>
                    {item?.createdAt && (
                      <Tooltip title={dayjs(item?.createdAt).format("YYYY-MM-DD HH:mm:ss")}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {renderDate(item?.createdAt)}
                        </Text>
                      </Tooltip>
                    )}
                  </Space>
                  <div style={{ marginTop: 4 }}>
                    <Text>{item?.commentText}</Text>
                  </div>
                </div>
              </Space>
            </List.Item>
          )}
        />
      </div>



      <div className="comments-text">
        <UserAvatar name={userName} className="comments-avatar" />
        <Input.TextArea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          autoSize={{ minRows: 1, maxRows: 3 }}
          className="comments-textarea"
        />
        <Button type="primary" onClick={handleAddComment} disabled={loading}>
          Send
        </Button>
      </div>
    </Drawer>
  );
};

export default Comments;
