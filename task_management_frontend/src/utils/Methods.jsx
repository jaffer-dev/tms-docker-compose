import { message, Tag } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash'
import { TOKEN } from './Constants';
import { FaCircleHalfStroke, FaRegCircle } from 'react-icons/fa6';
import { ClockCircleOutlined, CloseCircleOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { FaRegDotCircle } from 'react-icons/fa';
import { HiFlag } from 'react-icons/hi';
import { TbFlag3Filled } from 'react-icons/tb';

export const readableText = (text) => {
  if (text === "HOD") {
    return "Head Of Department"
  } else {
    return text?.length ? _.capitalize(text)?.split("_").join(" ") : "";
  }
};

export const ConditionalRendering = ({ condition, children, elseChildren }) => {
  if (condition) {
    return children;
  } else if (elseChildren) {
    return elseChildren;
  }
  return null;
};


export const handleSuccess = (val) => {
  message.success(val || 'Success');
};

export const handleError = (val) => {
  message.error(val || 'Something went wrong');
};

export const clearLocalstorage = () => {
  localStorage.clear();
  localStorage.removeItem('authorization');
  localStorage.removeItem(TOKEN);
};


export const getColorFromName = (name) => {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068'];
  if (!name || name.length < 2) return colors[0];
  let charCode = name.charCodeAt(0) + name.charCodeAt(1);
  return colors[charCode % colors.length];
};

export const getFirstTwoChars = (name) => {
  return name?.slice(0, 2).toUpperCase();
};

export const renderTime = (time = undefined) => {
  if (!time) {
    return "-";
  }
  return dayjs(time).format("hh:mm A")
}

export const renderDate = (date = undefined, status) => {
  if (!date) {
    return "-";
  }
  return dayjs(date).format("DD-MMM-YYYY");
};

// export const renderDate = (date = undefined) => {
//   if (!date) return "-";

//   const formattedDate = dayjs(date).format("DD-MMM-YYYY");
//   const today = dayjs();
//   const diff = dayjs(date).diff(today, "day"); 

//   let color = "inherit"; 
//   if (diff < 0 || diff <= 1) {
//     color = "red"; 
//   }

//   return (
//     <span style={{ color }}>
//       {formattedDate}
//     </span>
//   );
// };

export const TASK_TYPE_COLORS = {
  MEMO: {
    color: '#0059F7',
    background: '#F4F8FF'
  },
  TASK: {
    color: '#B05D00',
    background: '#FFF9F2'
  },
  BUG: {
    color: '#F90505',
    background: '#FEF2F2'
  }
};

export const TASK_STATUS_ICONS = {
  TODO: <FaRegCircle style={{ color: '#fa8c16' }} />,
  PENDING: <ClockCircleOutlined style={{ color: '#b9b4afff' }} />,
  IN_PROGRESS: <FaCircleHalfStroke spin style={{ color: '#1890ff' }} />,
  REVIEW: <EyeInvisibleOutlined style={{ color: '#722ed1' }} />,
  CLOSED: <CloseCircleOutlined style={{ color: '#000' }} />,
  COMPLETED: <FaRegDotCircle style={{ color: '#52c41a' }} />,
};

export const TASK_STATUS_COLORS = {
  pending: 'volcano',
  in_progress: 'geekblue',
  assigned: 'blue',
  review: 'purple',
  closed: 'green',
};



export const TASK_PRIORITY_COLORS = (val) => {

  switch (val) {
    case "LOW":
      return <div>
        <Tag
          className='approval-tag'
          style={{
            color: '#69758B',
            backgroundColor:'#F4F8FF',
          }}
        >
          <span>{readableText(val)}</span>
          <HiFlag style={{ marginLeft: 4 }} />
        </Tag>
      </div>;
    case "MEDIUM":
      return <div><Tag
        className='approval-tag'
        style={{
          color: '#B05D00',
          backgroundColor: '#FFF9F2',
        }}
      >
        <span>{readableText(val)}</span>
        <HiFlag style={{ marginLeft: 4 }} />
      </Tag>
      </div>;
    case "HIGH":
      return <div>
        <Tag
          className='approval-tag'
          style={{
            color: '#F90505',
            backgroundColor: '#FEF2F2',
          }}
        >
          <span>{readableText(val)}</span>
          <HiFlag style={{ marginLeft: 4 }} />
        </Tag>
      </div>;
    default:
      return null;
  }
}

// export const renderFlagColor = (val) => {
//   switch (val) {
//     case 'HIGH':
//       return 'var(--them-red)';
//     case 'MEDIUM':
//       return 'var(--them-primary)';
//     case 'LOW':
//       return 'var(--them-text-gray)';
//     default: return 'var(--them-primary)';
//   }
// }

export const PRIORITY = [
  { key: 'ALL', label: 'All' },
  { key: 'HIGH', label: "High", icon: <TbFlag3Filled style={{ color: "#F90505" }} /> },
  { key: 'MEDIUM', label: 'Medium', icon: <TbFlag3Filled style={{ color: "#0059F7" }} /> },
  { key: 'LOW', label: 'Low', icon: <TbFlag3Filled style={{ color: "#b9b4afff" }} /> },
]

export const STATUS_ARR_OBJ = [
  { key: 'ALL', label: 'All' },
  { key: 'TODO', label: "Todo", icon: <FaRegCircle style={{ color: '#fa8c16' }} /> },
  { key: 'PENDING', label: 'Pending', icon: <ClockCircleOutlined style={{ color: '#b9b4afff' }} /> },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: <FaCircleHalfStroke spin style={{ color: '#1890ff' }} /> },
  { key: 'REVIEW', label: 'Review', icon: <EyeInvisibleOutlined style={{ color: '#722ed1' }} /> },
  { key: 'CLOSED', label: 'Closed', icon: <CloseCircleOutlined style={{ color: '#000' }} /> },
  { key: 'COMPLETED', label: 'Completed', icon: <FaRegDotCircle style={{ color: '#52c41a' }} /> },
]


export const formatCountsArray = (stats, type) => {
  // console.log(stats)
  // if (!stats) return [];
  if (type === 'stats') {
    return [
      { status: 'TOTAL', count: stats.total || 0 },
      { status: 'TODO', count: stats.TODO || 0 },
      { status: 'PENDING', count: stats.PENDING || 0 },
      { status: 'IN_PROGRESS', count: stats.IN_PROGRESS || 0 },
      { status: 'REVIEW', count: stats.REVIEW || 0 },
      { status: 'CLOSED', count: stats.CLOSED || 0 },
    ];
  } else if (type === 'leaveStats') {
    return [
      { status: "Total Leaves", count: stats?.totalLeaves || 0 },
      { status: "Annual Leaves", count: stats?.annual || 0 },
      { status: "Casual Leaves", count: stats?.casual || 0 },
      { status: "Sick Leaves", count: stats?.sick || 0 },
      { status: "Taken Leaves", count: stats?.taken?.length || 0 },
      // { status: "Remaining", count: stats?.remaining?.length || 0 },
    ];
  }
};

export const stripHtml = (html) => {
  return html.replace(/<[^>]*>?/gm, "");
};
