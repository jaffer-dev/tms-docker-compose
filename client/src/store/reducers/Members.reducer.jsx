import MEMBERS from "../constant/Members.constant";

const initialState = {
    membersList: [],
    membersLoading: false,

    addMembersLoading: false
};

export default (state = initialState, action = {}) => {
    switch (action.type) {
        case MEMBERS.ADD_MEMBERS:
            return {
                ...state,
                addMembersLoading: action.loading,
            };

        case MEMBERS.GET_MEMBERS:
            return {
                ...state,
                membersList: action.data,
                membersLoading: action.loading,
            };

        default:
            return state;
    }
};