import { Descriptions, Divider, Tag } from "antd";
import { renderDate, readableText } from "../../utils/Methods";

export const renderTaskDetails = (obj) => {

    const items = [
        { key: '1', label: 'Category', children: readableText(obj?.category || '-') },
        { key: '2', label: 'From Date', children: renderDate(obj?.fromDate) },
        { key: '3', label: 'To Date', children: renderDate(obj?.toDate) },
        { key: '5', label: 'Days', children: obj?.days },
        { key: '6', label: 'Approval Status', children: <Tag color={obj?.status === 'PENDING' ? "red" : "green"} className='approval-tag'>{readableText(obj?.status || '-')}</Tag>, },
        { key: '7', label: 'Requested At', children: renderDate(obj?.requestedAt) },
        { key: '8', label: 'Reason', span: 2, children: readableText(obj?.reason || '-') },
    ];

    return (
        <>
            <Divider orientation="left">Leave Details</Divider>
            <Descriptions
                size="small"
                layout="vertical"
                bordered
                selected
                items={items}
                className="custom-descriptions"
            />
        </>
    )
};


export const renderAssigneeDetails = (obj) => {
    const items = [
        { key: '1', label: 'Requested By', children: readableText(obj?.userId?.username || '-') },
        { key: '1', label: 'Email', children: readableText(obj?.userId?.email || '-') },
        { key: '2', label: 'Department', children: readableText(obj?.userId?.department?.title || '-') },
    ];

    return (
        <>
            <Divider orientation="left">Employee Information</Divider>
            <Descriptions
                size="small"
                layout="vertical"
                bordered
                items={items}
                className="custom-descriptions"
            />
        </>
    );
}