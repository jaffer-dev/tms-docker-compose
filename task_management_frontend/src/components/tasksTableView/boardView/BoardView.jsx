import React from 'react';
import { Card, Col, Descriptions, Empty, Row, Tag, Button } from 'antd';
import { UserAvatar } from '../../userAvatar/UserAvatar';
import { useNavigate } from 'react-router-dom';
import { renderDate, readableText, ConditionalRendering, TASK_STATUS_ICONS, TASK_PRIORITY_COLORS } from "../../../utils/Methods";
import "../index.css"
import { FaArrowRightLong } from 'react-icons/fa6'

const BoardView = ({ data = [], loading }) => {

  const navigate = useNavigate();

  const groupedTasks = data.reduce((acc, task) => {
    const status = task.status?.toUpperCase() || 'OTHER';
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {});

  const sections = [
    { heading: 'To Do', keys: ['PENDING', 'IN_PROGRESS', 'TODO'] },
    { heading: 'Review', keys: ['REVIEW'] },
  ];

  return (
    <>
      {sections.map(({ heading, keys }) => {
        const tasks = keys.flatMap((k) => groupedTasks[k] || []);
        const limitedTasks = tasks.slice(0, 6);

        return (
          <div className="task-list-container margin-top_20" key={heading}>
            <div className="task-section">
              <Card title={heading} bordered={true}>
                <ConditionalRendering
                  condition={tasks.length > 0}
                  elseChildren={
                    <Empty
                      description="No Tasks Found"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  }
                >
                  <Row gutter={[16, 16]}>
                    {limitedTasks.map((task, idx) => (
                      <Col
                        key={task._id || idx}
                        xs={24}
                        sm={12}
                        md={12}
                        lg={8}
                        onClick={() => navigate(`/task-details:/${task._id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <Descriptions
                          size="middle"
                          title={
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              {task.title}
                            </div>
                          }
                          column={1}
                          bordered
                        >
                          <Descriptions.Item label="Priority">
                            {TASK_PRIORITY_COLORS(task.priority)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Status">
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {TASK_STATUS_ICONS[task.status?.toUpperCase()]}
                              {readableText(task.status)}
                            </span>
                          </Descriptions.Item>
                          <Descriptions.Item label="Assigned By">
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <UserAvatar name={task?.assignedBy?.username} />
                              {readableText(task?.assignedBy?.username)}
                            </div>
                          </Descriptions.Item>
                          <Descriptions.Item label="Deadline">
                            {renderDate(task.deadline)}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                    ))}
                  </Row>
                  <ConditionalRendering
                    condition={tasks.length > 6}
                    children={
                      <div className='board-view-more'>
                        <Button className='board-view-more-button' type="link" onClick={() => navigate("/task-history")}>
                          View More <FaArrowRightLong />
                        </Button>
                      </div>
                    }
                  >
                  </ConditionalRendering>
                </ConditionalRendering>
              </Card>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default BoardView;
