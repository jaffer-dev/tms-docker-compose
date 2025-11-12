import React from 'react'
import './TaskList.css'
import { Table } from 'antd';
import { UserAvatar } from '../../userAvatar/UserAvatar'
import { useNavigate } from 'react-router-dom';
import { FaRegComments } from 'react-icons/fa6';
import { TASK_PRIORITY_COLORS, TASK_STATUS_ICONS, readableText, renderDate } from "../../../utils/Methods"
import { CTable } from '../../../uiComponents';

const Tasklist = ({ data: taskList, loading: taskListLoading, userId }) => {

    const navigate = useNavigate()

    const toggleComments = (id) => {
        setIsOpenCommentModal(true)
        setSelected(id)
    }

    const assignTo = (val, arr) => {
        if (arr?.type === "MEMO") {
            return 'For Department'
        } else {
            return val?.username
        }
    }

    const columns = [
        {
            title: 'Tile',
            dataIndex: 'title',
            render: (val, record) => (
                <div className="title-priority">
                    {val}
                    {TASK_PRIORITY_COLORS(record.priority)}
                </div>
            ),
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            render: (val) => renderDate(val)
        },
        {
            title: 'Assigned By',
            dataIndex: 'assignedBy',
            render: (obj) => <>
                {obj === userId ? <div className='d-flex align-item-center'>You</div> : <div className='d-flex align-item-center gap-10'><UserAvatar name={obj?.username} /> {readableText(obj?.username)}</div>}
            </>
        },
        {
            title: 'Assign to',
            dataIndex: 'assignedTo',
            render: (obj, _) => assignTo(obj, _)
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (taskStatus) => (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {TASK_STATUS_ICONS[taskStatus]}
                    {readableText(taskStatus)}
                </span>
            )
        },
        {
            title: 'Comments',
            dataIndex: 'comments',
            render: (val, obj) => (
                <div className='d-flex align-items-center gap-10 comments-icon' >
                    <FaRegComments onClick={(e) => {
                        e.stopPropagation();
                        toggleComments(obj?._id)
                    }} />
                    <p>{val?.length > 0 ? val?.length : ''}</p>
                </div>
            )
        }
    ];

    const todoData = taskList.filter(task => task.status === 'PENDING' || task.status === 'TODO');
    const reviewData = taskList.filter(task => task.status === 'REVIEW');


    return (
        <>
            <div className='task-list-container'>
                <div className="task-list-body">
                    <div className="task-list-todo">
                        <CTable
                            title={() => 'Todo'}
                            columns={columns}
                            dataSource={todoData}
                            loading={taskListLoading}
                            bordered
                            size="middle"
                            rowKey={(obj) => obj?._id}
                            pagination={{ pageSize: 5 }}
                            onRow={(record) => ({
                                onClick: () => navigate(`/task-details/${record?._id}`)
                            })}
                            style={{ cursor: "pointer" }}
                        />
                    </div>
                    <div className="task-list-to-review">
                        <CTable
                            title={() => 'To Review'}
                            columns={columns}
                            dataSource={reviewData}
                            loading={taskListLoading}
                            bordered
                            size="middle"
                            pagination={{ pageSize: 5 }}
                            onRow={(record) => ({
                                onClick: () => navigate(`/task-details/${record?._id}`)
                            })}
                            style={{ cursor: "pointer" }}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Tasklist
