import React from 'react';
import { Table } from 'antd';
import './CTable.css'

const CTable = ({ data = [], columns = [], height = 500,  loading = false, className = '', ...rest }) => {
   
    return (
        <div className="table-container">
            <Table
                columns={columns}
                dataSource={data}
                style={{minHeight: 500}}
                rowKey="_id"
                loading={loading}
                className={`${className} c-table bordered`}
                scroll={{ x: 'max-content' }}
                {...rest}
            />
        </div>
    );
};

export default CTable;
