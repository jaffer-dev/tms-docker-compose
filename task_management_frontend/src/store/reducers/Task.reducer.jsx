import TASK_CONSTANT from "../constant/Task.constant";

const initialState = {
    createTaskLoading: false,

    getUserTasks: [],
    getUserTasksLoading: false,

    getTaskListByStatus: [],
    getTaskListByStatusLoading: false,

    getTaskDetails: [],
    getTaskDetailsLoading: false,

    submitForReviewLoading: false,

    assignTaskToEmployeeLoading: false,

    addCommentsLoading: false,
    comments: [],
    getCommentsLoading: false,

    getStatusLoading: false,


};

export default (state = initialState, action = {}) => {
    switch (action.type) {
        case TASK_CONSTANT.CREATE_TASK:
            return {
                ...state,
                createTaskLoading: action.loading,
            };

        case TASK_CONSTANT.GET_USER_TASK:
            return {
                ...state,
                getUserTasks: action.data,
                getUserTasksLoading: action.loading,
            };
        case TASK_CONSTANT.GET_TASK_LIST_BY_STATUS:
            return {
                ...state,
                getTaskListByStatus: action.data,
                getTaskListByStatusLoading: action.loading,
            };
        case TASK_CONSTANT.GET_TASK_DETAIL:
            return {
                ...state,
                getTaskDetails: action.data,
                getTaskDetailsLoading: action.loading,
            };
        case TASK_CONSTANT.SUBMIT_FOR_REVIEW:
            return {
                ...state,
                submitForReviewLoading: action.loading,
            };
        case TASK_CONSTANT.ASSIGN_TASK_TO_EMPLOYEE:
            return {
                ...state,
                assignTaskToEmployeeLoading: action.loading,
            };
        case TASK_CONSTANT.ADD_COMMENTS:
            return {
                ...state,
                addCommentsLoading: action.loading,
            };
        case TASK_CONSTANT.GET_COMMENTS:
            return {
                ...state,
                comments: action.data,
                getCommentsLoading: action.loading
            };

        case TASK_CONSTANT.SET_STATUS:
            return {
                ...state,
                getStatusLoading: action.loading
            };
        default:
            return state;
    }
};