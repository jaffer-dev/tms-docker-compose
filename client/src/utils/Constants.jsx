export const TOKEN = "TOKEN";


export const TASK_STATUS = {
    ALL: 'all',
    PENDING: 'pending',
    IN_PROGRESS: 'inProgress',
    ASSIGNED: 'assigned',
    REVIEW: 'review',
    CLOSED: 'closed'
  };

  export const PRIORITY_OBJ = [
  { key: 'ALL', name: 'All' },
  { key: 'LOW', name: 'Low' },
  { key: 'HIGH', name: 'High' },
  { key: 'MEDIUM', name: 'Medium' },

]
  
  export const STATUS_OBJ = [
    {key : 'all' , name : 'All'},
    {key : 'TODO', name : 'Todo'},
    {key : 'PENDING', name : 'Pending'},
    {key : 'IN_PROGRESS', name : 'In Progress'},
    {key : 'REVIEW', name : 'Review'},
    {key : 'CLOSED', name : 'Closed'},
    {key : 'COMPLETED', name : 'Completed'},
  ]




  export const TASK_STATUS_LABELS = {
    [TASK_STATUS.ALL]: 'All',
    [TASK_STATUS.PENDING]: 'Pending',
    [TASK_STATUS.IN_PROGRESS]: 'inProgress',
    [TASK_STATUS.ASSIGNED]: 'Assigned',
    [TASK_STATUS.REVIEW]: 'Review',
    [TASK_STATUS.CLOSED]: 'Closed'
  };
  
  export const TASK_STATUS_COLORS = {
    [TASK_STATUS.PENDING]: 'volcano',
    [TASK_STATUS.IN_PROGRESS]: 'geekblue',
    [TASK_STATUS.ASSIGNED]: 'blue',
    [TASK_STATUS.REVIEW]: 'purple',
    [TASK_STATUS.CLOSED]: 'green'
  };