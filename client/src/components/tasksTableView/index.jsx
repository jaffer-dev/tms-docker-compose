import React, { useEffect, useMemo, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Tabs } from 'antd';
import TableView from './tableView/TableView';
import Tasklist from './taskList/TaskList';
import './index.css'
import BoardView from './boardView/BoardView';
import { PRIORITY, STATUS_ARR_OBJ } from '../../utils/Methods';
import CSelect from '../../uiComponents/cSelect/CSelect';
import { getAllTask } from '../../store/actions/Task.action';
import { useDispatch, useSelector } from 'react-redux';

const TasksTableView = () => {

  const [filters, setFilters] = useState({});

  const { taskList, taskListLoading } = useSelector(
    ({ task, }) => ({
      taskList: task.getUserTasks || [],
      taskListLoading: task.getUserTasksLoading,
    })
  );


  const commonProps = useMemo(() => ({ data: taskList, loading: taskListLoading, }), [taskList, taskListLoading]);

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getAllTask());
  }, []);

  const handleChange = (val, name) => {
    const updatedFilters = {
      ...filters,
      [name === "employees" ? "id" : name]: val,
    };

    setFilters(updatedFilters);
    dispatch(getAllTask(updatedFilters));
  };


  const items = [
    { key: '1', label: 'Table', children: <TableView {...commonProps} /> },
    { key: '2', label: 'Board', children: <BoardView {...commonProps} /> },
    { key: '3', label: 'List', children: <Tasklist {...commonProps} /> },
  ];

  return (
    <div className='tasks-table-view-container'>
      <div className="tasks-table-view-body">
        <div className="tasks-table-view-header">
          <div className="tasks-table-view-header-left">
            {/* <Input addonBefore={<SearchOutlined />} placeholder="Search" size='middle' /> */}
          </div>
          <div className="tasks-table-view-header-right">
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
                data={STATUS_ARR_OBJ}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="tasks-table-view">
          <Tabs defaultActiveKey="1" items={items} destroyInactiveTabPane={false} />
        </div>
      </div>
    </div>
  )
}

export default TasksTableView
