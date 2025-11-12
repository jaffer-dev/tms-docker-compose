import { FlagFilled } from "@ant-design/icons";
import { readableText, renderDate, TASK_PRIORITY_COLORS, TASK_TYPE_COLORS } from "../../utils/Methods";
import { Descriptions, Divider, Tag } from "antd";

export const renderTaskDetails = (obj) => {

    const description =[ { key: '1', label: 'Description', span: 5, children: <div dangerouslySetInnerHTML={{ __html: obj?.description || '-' }} />, }]
    const items = [
        { key: '1', label: 'Title', span: 5, children: (<div className="title-priority">{TASK_PRIORITY_COLORS(obj.priority)}</div>), },
        { key: '1', label: 'Type', children: (<Tag className="approval-tag" style={{ color: TASK_TYPE_COLORS[obj?.type?.toUpperCase()]?.color, backgroundColor: TASK_TYPE_COLORS[obj?.type?.toUpperCase()]?.background, }}>{readableText(obj?.type) || '-'} </Tag>), },
        { key: '1', label: 'Priority', children: readableText(obj?.priority || '-'), },
        { key: '1', label: 'Deadline', children: renderDate(obj?.deadline), },
        { key: '1', label: 'Assign To', children: readableText(obj?.assignTo?.username || '-'), },
        { key: '1', label: 'Department', children: readableText(obj?.assignTo?.department?.title || '-'), },
        { key: '1', label: 'Approval Status', children: <Tag color={obj?.status === 'PENDING' ? "red" : "green"} className='approval-tag'>{readableText(obj?.status || '-')}</Tag>, },
    ];

    return (
        <>
            <Divider orientation="left">Task Description</Divider>
            <Descriptions
                size="small"
                layout="vertical"
                bordered
                selected
                items={description}
                className="custom-descriptions"
            />
            <Divider orientation="left">Task Details</Divider>
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

}

export const renderAssigneeDetails = (obj) => {
    const items = [
        { key: '1', label: 'Name', children: readableText(obj?.requestedBy?.username), },
        { key: '1', label: 'Role', children: readableText(obj?.requestedBy?.role), },
        { key: '1', label: 'Department', children: readableText(obj?.requestedBy?.department?.title), },
    ];

    return (
        <>
            <Divider orientation="left">Assignee</Divider>
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

}