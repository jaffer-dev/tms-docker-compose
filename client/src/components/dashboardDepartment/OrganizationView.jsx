import React, { useState } from 'react'
import { Segmented } from 'antd';
import './OrganizationView.css'
import EmployeesList from './EmployeesList';
import Departments from './Departments';

const OrganizationView = () => {

    const [selectedTab, setSelectedTab] = useState('Department');
    
    const segmentToggler = (val) => {
        setSelectedTab(val);
    };

    return (
        <div className='teams-main'>
            <div className="teams-header">
                <div className="teams-header-left">
                    <div className="teams-heading">
                        <h3>Department</h3>
                    </div>
                    <div className="teams-segments">
                        <Segmented
                            options={['Department', 'Employees']}
                            onChange={value => segmentToggler(value)}
                        />
                    </div>
                </div>
                <div className="teams-header-right">
                </div>
            </div>

            <div className="teams-body">
                <div style={{ marginTop: '20px' }}>
                    {selectedTab === 'Department' && <Departments />}
                    {selectedTab === 'Employees' && <EmployeesList />}
                </div>
            </div>


        </div>
    )
}

export default OrganizationView
