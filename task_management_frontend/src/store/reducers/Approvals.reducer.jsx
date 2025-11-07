import APPROVALS from '../constant/Approvals.constant';

const initialState = {

    approvalsData: [],
    getApprovalsLoading: false,

    actionLoading : false

};

export default (state = initialState, action = {}) => {
    switch (action.type) {
        case APPROVALS.GET_APPROVALS:
            return {
                ...state,
                approvalsData: action.data,
                getApprovalsLoading: action.loading,
            };
        case APPROVALS.APPROVALS_ACTION:
            return {
                ...state,
                actionLoading: action.loading,
            };

        default:
            return state;
    }
}
