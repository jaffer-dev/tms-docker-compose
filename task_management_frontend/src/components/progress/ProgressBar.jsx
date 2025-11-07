import React from 'react'
import { Progress } from 'antd';
import './ProgressBar.css'
import { useSelector } from 'react-redux'

const ProgressBar = () => {
  const { userStats } = useSelector(({ users }) => {
    return {
      userStats: users.userStats || {},
    };
  });

  const inProgress = userStats?.inProgress || 0;
  const pending = userStats?.pending || 0;
  const total = userStats?.total || 0;

  return (
    <div className="progess-bar-main">
      <div className="progress-bar">
        <Progress
          type="circle"
          percent={total}
          strokeWidth={15}
          width={150}
        />
      </div>

      <div className="progress-report">
        <div className="progress-report-1">
          <div
            className="report-dot red"
            style={{ width: `${inProgress / 2 + 8}px`, height: `${inProgress / 2 + 8}px` }}
          ></div>
          <p>In-Progress: <span>{userStats?.IN_PROGRESS}</span></p>
        </div>

        <div className="progress-report-1">
          <div
            className="report-dot blue"
            style={{ width: `${pending / 2 + 8}px`, height: `${pending / 2 + 8}px` }}
          ></div>
          <p>Left Behind: <span>{userStats?.TODO}</span></p>
        </div>
      </div>
    </div>
  )
}

export default ProgressBar
