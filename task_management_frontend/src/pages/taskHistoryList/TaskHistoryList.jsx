import React, { useEffect, useState } from 'react';
import { Comments, PageHeader } from '../../components';
import { Tag, Select } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTask } from '../../store/actions/Task.action';
import './TaskHistoryList.css';
import { EyeOutlined } from '@ant-design/icons';
import { PRIORITY, readableText, renderDate, STATUS_ARR_OBJ, TASK_PRIORITY_COLORS, TASK_STATUS_ICONS } from '../../utils/Methods';
import { UserAvatar } from '../../components/userAvatar/UserAvatar';
import { STATUS_OBJ, TASK_STATUS } from '../../utils/Constants';
import { FaRegComments } from "react-icons/fa6";
import { checkAssignTo } from './Helper';
import { fetchNonHRUsers } from '../../store/actions/Users.action';
import { CTable } from '../../uiComponents';
import ContainerWrapper from '../../container/containerWrapper/ContainerWrapper';
import CSelect from '../../uiComponents/cSelect/CSelect';

const TaskHistoryList = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const initialStatus = location.state?.status || null;
  console.log(initialStatus, "initialStatus")
  const dispatch = useDispatch();
  const [status, setStatus] = useState(initialStatus);
  const [selected, setSelected] = useState('')
  const [isOpenCommentModal, setIsOpenCommentModal] = useState(false)
  const [filters, setFilters] = useState({});

  const { tasks, tasksLoading, userRole, userId, employees, getEmployeesLoading } = useSelector(({ task, auth, users }) => ({
    tasks: task?.getUserTasks,
    tasksLoading: task?.getUserTasksLoading,
    userRole: auth?.user.role,
    userId: auth?.user._id,

    employees: users?.getNonHrUsers || [],
    getEmployeesLoading: users?.getNonHrUsersLoading
  }));



  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // if (!employees?.length && userRole === 'EMPLOYEE') {
    //   dispatch(fetchNonHRUsers())
    // }
    if (initialStatus) {
      setStatus(initialStatus);
      dispatch(getAllTask({ status: initialStatus }));
    } else {
      dispatch(getAllTask({}));
    }
  }, [])

  const toggleComments = (id) => {
    setIsOpenCommentModal(true)
    setSelected(id)
  }

  const fetchTasks = () => {
    const payload = {};
    if (status && status !== TASK_STATUS.ALL) payload.status = status;
    dispatch(getAllTask(payload));
  };

  useEffect(() => {
    if (status) {
      fetchTasks();
    }
  }, [status]);

  const columns = [
    {
      title: 'Title',
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
      render: (date) => renderDate(date),
    },
    {
      title: 'Assigned By',
      dataIndex: 'assignedBy',
      render: (obj) => (
        <div className='d-flex align-item-center gap-10'>
          <UserAvatar name={obj?.username} /> {readableText(obj?.username)}
        </div>
      )
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      render: (arr) => checkAssignTo(arr)
    },
    ...(!['EMPLOYEE', 'HOD', 'SUPERVISOR'].includes(userRole)
      ? [{
        title: 'Department',
        dataIndex: 'assignedTo',
        render: (arr) => readableText(arr?.department?.title)
      }]
      : []),
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
      title: 'Actions',
      dataIndex: 'Actions',
      render: (val, obj) => (
        <div className='d-flex align-items-center gap-10 comments-icon' >
          <FaRegComments onClick={(e) => {
            toggleComments(obj._id)
          }} />
          <span
            onClick={(e) => {
              navigate(`/task-details/${obj._id}`);
            }}
            style={{ cursor: "pointer", marginLeft: 10 }}
          >
            <EyeOutlined />
          </span>
        </div>
      )
    }
  ];

  const pageHeaderProps = {
    title: 'Tasks',
    // renderBack: true
  }

  const handleChange = (val, name) => {
    // const key = name === "employees" ? "id" : name;
    const obj = { ...filters };
    if (val === "ALL") {
      delete obj[key];
    } else {
      obj[key] = val;
    }
    setFilters(obj);
    dispatch(getAllTask(obj));
  }

  return (
    <div>
      <ContainerWrapper pageHeaderProps={pageHeaderProps}>
        <div className="department-detail-container">
          <div className="table-wrapper">
            <div className="page-header-filters">
              <div className="status-filter">
                <CSelect
                  title='Priority'
                  name="priority"
                  data={PRIORITY}
                  onChange={handleChange}
                />
              </div>
              <div className="status-filter">
                <CSelect
                  title='Status'
                  name="status"
                  value={status}
                  data={STATUS_ARR_OBJ}
                  onChange={handleChange}
                />
              </div>
            </div>

            <CTable
              columns={columns}
              data={tasks || []}
              loading={tasksLoading}
            />
          </div>
        </div>
      </ContainerWrapper>


      <Comments
        isOpenCommentModal={isOpenCommentModal}
        setIsOpenCommentModal={setIsOpenCommentModal}
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  );
};

export default TaskHistoryList;