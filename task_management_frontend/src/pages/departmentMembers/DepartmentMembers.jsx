import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Popconfirm, Space, Table, Tag } from 'antd';
import { TaskKPIsChart, ProgressBar, PageHeader, Profile } from '../../components';
import { UserAvatar } from '../../components/userAvatar/UserAvatar';
import { ConditionalRendering, readableText } from '../../utils/Methods';
import { EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import "./DepartmentMembers.css"
import { updateStatus } from '../../store/actions/Users.action';
import { getDepartmentMembers } from '../../store/actions/Departments.action';
import ContainerWrapper from '../../container/containerWrapper/ContainerWrapper';
import { CTable } from '../../uiComponents';


const DepartmentDetails = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false)
  const [refresh, setRefresh] = useState(false);
  const [] = useState(false)

  const { state } = useLocation();
  const dispatch = useDispatch();
  let department = state;


  const { deparmentMembers, loading, userRole } = useSelector(({ departments, auth }) => {
    return {
      deparmentMembers: departments?.departmentMembers,
      loading: departments?.departmentMembersLoading,
      userRole: auth?.user?.role
    }
  })

  const handleViewProfile = (record) => {
    setSelectedUser(record);
    setIsProfileOpen(true);
  };

  const get = () => {
    let payload = {
      departmentId: department?._id
    }
    dispatch(getDepartmentMembers(payload))
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!isProfileOpen && !isOpenAddModal) {
      if (department?._id) {
        get();
      }
    }
  }, [dispatch, refresh]);

  const callBack = () => {
    get()
  }

  const updateUserStatusHandler = (record) => {
    let payload = {
      id: record._id,
      isActive: !record.isActive,
    };

    dispatch(updateStatus(payload, callBack));
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'username',
      render: val => (
        <div className='d-flex gap-10 align-item-center'>
          <UserAvatar name={val} /> {val}
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Permission',
      dataIndex: 'department',
      render: (val) => readableText(val.permission) || '-',

    },
    {
      title: 'Department',
      dataIndex: 'department',
      render: (val) => readableText(val.title) || '-',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (val) => readableText(val) || '-'
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (val) => (
        <Tag color={val ? "green" : "red"} className="approval-tag">
          {val ? "Active" : "Disabled"}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record) => (
        <Space size="small">
          <Button
            color="primary"
            variant="outlined"
            size="middle"
            icon={<EyeOutlined />}
            onClick={() => handleViewProfile(record)}
          >
            View
          </Button>
          <ConditionalRendering
            condition={['SUPER_ADMIN', 'MANAGER', 'SUB_ADMIN'].includes(userRole)}
            children={<Popconfirm
              title={record.isActive ? "Disable this member?" : "Activate this member?"}
              okText="Yes"
              cancelText="No"
              onConfirm={() => updateUserStatusHandler(record)}
            >
              <Button
                type="primary"
                danger={record.isActive}
                style={{
                  backgroundColor: record.isActive ? "#FF4D4F" : "#56D18B",
                  borderColor: record.isActive ? "#FF4D4F" : "#56D18B",
                }}
              >
                {record.isActive ? "Disable" : "Active"}
              </Button>
            </Popconfirm>
            }
          />
        </Space>
      ),
    },
  ];

  const pageHeaderProps = {
    setIsOpenAddModal: setIsOpenAddModal,
    isOpenAddModal: isOpenAddModal,
    // renderBack: true,
    title: department.title,
    subtitle: department?.description,
    departmentId: department?._id,
    renderTeamButton: true,
    teamId: department._id,
    onMemberAdded: () => setRefresh(!refresh),
  }

  return (
    <>
      <ContainerWrapper pageHeaderProps={pageHeaderProps}>
        <div className='department-detail-container '>
          <div className="table-wrapper">
            <CTable
              columns={columns}
              dataSource={deparmentMembers}
              loading={loading}
              rowKey={(record) => record._id || record.email}
            />
          </div>
        </div>
      </ContainerWrapper>
      <Profile
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        userData={selectedUser}
        onDeleteSuccess={() => setRefresh(!refresh)}
      />
    </>
  );
};

export default DepartmentDetails;