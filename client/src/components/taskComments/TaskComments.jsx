import React, { useState, useEffect } from "react";
import { Segmented, Input, List, Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { SendOutlined } from "@ant-design/icons";
import "./TaskComments.css";
import { UserAvatar } from "../userAvatar/UserAvatar";
import { getComments, addComments } from "../../store/actions/Task.action";
import { renderDate, renderTime } from "../../utils/Methods";
import TaskHistory from "../taskHistory/TaskHistory";

const TaskComments = () => {
    const dispatch = useDispatch();

    const { userId, taskDetails, comments, loading } = useSelector(
        ({ task, auth }) => ({
            userId: auth?.user?._id,
            taskDetails: task?.getTaskDetails,
            comments: task?.comments || [],
            userName: auth?.user?.username,
            loading: task?.addCommentsLoading,
        })
    );

    const taskId = taskDetails?.id;

    const { TextArea } = Input;
    const defaultOptions = ["Comments", "History"];

    const [newComment, setNewComment] = useState("");
    const [activeTab, setActiveTab] = useState("Comments");

    useEffect(() => {
        if (taskId) {
            dispatch(getComments({ taskId }));
        }
    }, [taskId, dispatch]);

    const addCommentCallBack = () => {
        setNewComment("");
        dispatch(getComments({ taskId: taskDetails?.id }));
    };

    const handleAddComment = () => {
        const val = newComment.trim();
        if (!val) return;

        const payload = {
            taskId: taskDetails?.id,
            commenterId: userId,
            commentText: val,
        };
        dispatch(addComments(payload, addCommentCallBack));
    };


    return (
        <div className="taskComment-parent">
            <div className="taskComment-container">
                <div className="taskComment-segment">
                    <Segmented
                        options={defaultOptions}
                        value={activeTab}
                        onChange={setActiveTab}
                    />
                </div>
                <div className="task-heading">
                    <h3>{activeTab}:</h3>
                </div>

                {activeTab === "Comments" && (
                    <>
                        <div className="messagedata">
                            <List
                                loading={loading}
                                dataSource={comments}
                                renderItem={(item) => (
                                    <List.Item key={item._id || item.id}>
                                        <List.Item.Meta
                                            avatar={
                                                <UserAvatar
                                                    className="taskComment-avatar"
                                                    name={item?.commenterId?.username}
                                                />
                                            }
                                            title={
                                                <div className="taskComments-profile">
                                                    <h6 className="taskComments-userName">
                                                        {item?.commenterId?.username}
                                                    </h6>
                                                    <div className="taskComments-nameTime">
                                                        <span className="taskComments-createdAt">
                                                            {renderDate(item.createdAt)}
                                                        </span>
                                                        <span className="taskComments-separator">·</span>
                                                        <span className="taskComments-createdAt">
                                                            {renderTime(item.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            }
                                            description={
                                                <p className="taskComments-message">
                                                    {item.commentText}
                                                </p>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>

                        <div className="taskComment-description">
                            <div>
                                <TextArea
                                    placeholder="Type a comment"
                                    maxLength={250}
                                    value={newComment}
                                    autoSize={{ minRows: 4, maxRows: 6 }}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="taskComment-btn">
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={handleAddComment}
                                    block
                                    style={{ height: "40px" }}
                                    loading={loading}
                                    disabled={loading || !newComment.trim()}
                                >
                                    Send
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "History" && (
                    <div className="history-tab">
                        <TaskHistory actions={taskDetails?.actions} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskComments;