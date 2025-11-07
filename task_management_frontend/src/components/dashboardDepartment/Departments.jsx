import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createDepartment, getDepartments } from '../../store/actions/Departments.action';
import { Skeleton, Empty, Avatar } from 'antd';
import { ConditionalRendering } from '../../utils/Methods';
import './Departments.css';

const Departments = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { departmentData, departmentDataLoading, userRole, userId } = useSelector(({ departments, auth }) => {
    return {
      departmentData: departments.getDepartmentsData,
      departmentDataLoading: departments.getDepartmentsDataLoading,
      userRole: auth?.user?.role,
      userId: auth?.user?._id,
    };
  });

  const handleNavigator = (team) => {
    navigate(`/departments/${team._id}`, { state: team });
  };

  const avatarColors = ['#0059F7', '#FF6B6B', '#00B894', '#F39C12', '#8E44AD'];

  useEffect(() => {
    if (userId && userRole) {
      const payload = { userId, role: userRole };
      dispatch(getDepartments(payload));
    }
  }, [dispatch, userId, userRole]);

  return (
    <>
      {departmentDataLoading ? (
        <div className="departments-loading">
          {[...Array(4)].map((_, index) => (
            <Skeleton.Button
              key={index}
              active
              style={{ width: '100%', height: 150, borderRadius: 16 }}
            />
          ))}
        </div>
      ) : (
        <div className="departments-container">
          <ConditionalRendering
            condition={departmentData?.length}
            children={departmentData.map((item) => {
              const members = item?.members || [];
              const maxToShow = 5;
              const displayMembers = members.slice(0, maxToShow);
              const extraCount = members.length - maxToShow;

              return (
                <div
                  key={item?._id}
                  className="department-card"
                  onClick={() => handleNavigator(item)}
                >
                  <div className="department-header">
                    <h3>{item?.title}</h3>
                    <p>{item?.members?.length || "No"} members</p>
                  </div>
                </div>
              );
            })}
            elseChildren={
              <div className="empty-wrapper">
                <Empty description="No Data" />
              </div>
            }
          />
        </div>
      )}
    </>
  );
};

export default Departments;
