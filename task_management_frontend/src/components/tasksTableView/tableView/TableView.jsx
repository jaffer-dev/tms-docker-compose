import React from 'react';
import { Button, Card, Col, Empty, Row, Tag } from 'antd';
import './TableView.css';
import { useNavigate } from 'react-router-dom';
import { TASK_PRIORITY_COLORS, readableText, stripHtml } from "../../../utils/Methods"
import { FaCircleHalfStroke, FaMessage, FaRegCircle } from 'react-icons/fa6';
import { FaRegDotCircle } from 'react-icons/fa';

const TableView = ({ data: taskList, loading: taskListLoading, userId }) => {

    const navigate = useNavigate()

    const todoData = taskList.filter(task => task.status === 'TODO');
    const inProgressData = taskList.filter(task => task.status === 'IN_PROGRESS');
    const closedData = taskList.filter(task => task.status === 'COMPLETED');

    const renderTaskCard = (task) => (
        <div
            key={task._id}
            className="card-body "
            onClick={() => navigate(`/task-details/${task._id}`)}
        >
            <div className="card-body-header title-priority">
                {TASK_PRIORITY_COLORS(task?.priority)}
                <Tag className="comment-tag">
                    <span>{task?.comments?.length || 0}</span>
                    <FaMessage style={{ marginLeft: 4, fontSize: 11 }} />
                </Tag>
            </div>

            <div className="card-body-footer">
                <h3 className="task-card-title">{task.title}</h3>
                <p className="task-card-desc">
                    {stripHtml(task.description?.slice(0, 50) || "No description")}...
                </p>
            </div>
        </div>
    );

    const renderColumn = (title, icon, color, data, status) => (
        <Col span={8}>
            <Card
                className='table-view-card'
                loading={taskListLoading}
                title={
                    <>
                        {React.cloneElement(icon, { style: { fontSize: 12, color } })}
                        <span style={{ marginLeft: 8 }}>{title}</span>
                    </>
                }
                headStyle={{ backgroundColor: "var(--them-surface)" }}
            >
                {data.length > 0 ? (
                    <>
                        {data.slice(0, 3).map(renderTaskCard)}
                        {data.length >= 3 && (
                            <div style={{ marginTop: 8, textAlign: 'center' }}>
                                <Button
                                    type="link"
                                    onClick={() =>
                                        navigate("/task-history", { state: { status } })
                                    }
                                >
                                    Read More
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <Empty />
                )}
            </Card>
        </Col>
    );

    return (
        <div className="table-view-container">
            <Row gutter={16}>
                {renderColumn("To-Do", <FaRegCircle />, "#0059F7", todoData, "TODO")}
                {renderColumn("In-Progress", <FaCircleHalfStroke />, "#FB8500", inProgressData, "IN_PROGRESS")}
                {renderColumn("Completed", <FaRegDotCircle />, "#008000", closedData, "COMPLETED")}
            </Row>
        </div>
    );
};

export default TableView;