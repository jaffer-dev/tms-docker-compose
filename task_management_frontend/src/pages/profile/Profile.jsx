import React, { useState } from 'react'
import { CountCards, CreateLeaveRequest } from '../../components'
import { Button } from 'antd'
import { ConditionalRendering, readableText } from '../../utils/Methods'
import { PlusOutlined } from '@ant-design/icons'
import ErrorBoundary from '../dashboard/ErrorBoundary'
import "./Profile.css"
import { SlEnvolope } from 'react-icons/sl'
import { UserAvatar } from '../../components/userAvatar/UserAvatar'
import { useSelector } from 'react-redux'
import { renderContactDetails, renderPrimaryDetails, renderSecondaryDetails } from './Helper'

const Profile = () => {
    const [isOpenCreateModal, setIsOpenCreateModal] = useState(false)

    const { user } = useSelector(({ auth }) => {
        return {
            user: auth?.user || [],
        };
    });

    return (
        <>
            <ErrorBoundary>
                <div className='dashboard-container'>
                    <div className="profile-bg"></div>
                    <div className="dashboard-wrapper">
                        <div className="dashboard-header">
                            <div className="header-title-name">
                                <h3>Account Settings</h3>
                            </div>
                            <div className="dashboard-header-right">
                                <ConditionalRendering
                                    condition={!['AUDITOR'].includes()}
                                    children={
                                        <Button
                                            type="primary"
                                            shape="round"
                                            icon={<PlusOutlined />}
                                            size="large"
                                            onClick={() => setIsOpenCreateModal(true)}
                                        >
                                            <span className="btn-text">Apply Leave</span>
                                        </Button>} />
                            </div>
                        </div>

                        <div className="profile-card">
                            <div className="profile-card-data">
                                <div className="profile-card-avator">
                                    <UserAvatar name={user.username} />
                                </div>
                                <div className="profile-card-detail">
                                    <h3>{user.username}</h3>
                                    <p>{readableText(user.role)}</p>
                                    <h4><SlEnvolope />{user.email}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-content">
                            <div className="dashboard-counts">
                                <CountCards stats={user?.leaveBalance} type={'leaveStats'} />
                            </div>
                        </div>

                        <div className="profile-sections">
                            {renderPrimaryDetails(user)}
                            {renderSecondaryDetails(user)}
                            {renderContactDetails(user)}
                        </div>
                    </div>
                </div>
            </ErrorBoundary>

            <CreateLeaveRequest
                open={isOpenCreateModal}
                close={setIsOpenCreateModal}
            />
        </>
    )
}

export default Profile