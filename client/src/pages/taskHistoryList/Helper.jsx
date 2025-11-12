import { UserAvatar } from "../../components/userAvatar/UserAvatar";
import { readableText } from "../../utils/Methods";

// export const renderFlagColor = (val) => {
//     switch (val) {
//         case 'High':
//             return 'var(--them-red)';
//         case 'medium':
//             return 'var(--them-primary)';
//         case 'Low':
//             return 'var(--them-text-gray)';
//         default: return 'var(--them-primary)';
//     }
// }

export const checkAssignTo = (arr) => {
    if (!arr || arr.length === 0) {
      return "No Assignee";
    }
  
    if (arr.length === 1) {
      return (
        <div className='d-flex align-item-center gap-10'>
          <UserAvatar name={arr[0]?.username} />
          <span>{readableText(arr[0]?.username)}</span>
        </div>
      );
    }
  
    return "Assign To Department";
  };
  