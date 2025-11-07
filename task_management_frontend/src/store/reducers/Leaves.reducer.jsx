import LEAVES from "../constant/Leaves.Constant"

const initialState = {
    applyLeaveLoading: false,

    leaveApprovalData: [],
    leaveApprovalLoading: false,
};

export default (state = initialState, action = {}) => {
    switch (action.type) {
        case LEAVES.APPLY_LEAVE:
            return {
                ...state,
                applyLeaveLoading: action.loading,
            };
        case LEAVES.LEAVE_APPROVAL:
            return {
                ...state,
                leaveApprovalData: action.data,
                leaveApprovalLoading: action.loading,
            };
        default:
            return state;
    }
};