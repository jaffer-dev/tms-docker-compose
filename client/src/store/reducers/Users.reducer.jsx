import USERS from "../constant/Users.constant";

const initialState = {

    getHrUsers: [],
    getHrUsersLoading: false,

    getNonHrUsers: [],
    getNonHrUsersLoading: false,

    userStats: [],
    userStatsLoading: false,

    managersListLaoding: false,
    managersList: [],

    updateUserStatusLaoding: false,

    updateUserPasswordLaoding: false,

    updateUserPersonalDetailsLoading : false
};

export default (state = initialState, action = {}) => {
    switch (action.type) {

        case USERS.GET_HR_USERS:
            return {
                ...state,
                getHrUsers: action.data,
                getHrUsersLoading: action.loading,
            };
        case USERS.GET_NON_HR_USERS:
            return {
                ...state,
                getNonHrUsers: action.data,
                getNonHrUsersLoading: action.loading,
            };

        case USERS.GET_USER_STATS:
            return {
                ...state,
                userStatsLoading: action.loading,
                userStats: action.data
            };
        case USERS.GET_MANAGER:
            return {
                ...state,
                managersListLaoding: action.loading,
                managersList: action.data
            };
        case USERS.UPDATE_STATUS:
            return {
                ...state,
                updateUserStatusLaoding: action.loading,
            };
        case USERS.UPDATE_PASSWORD:
            return {
                ...state,
                updateUserPasswordLaoding: action.loading,
            };
        case USERS.UPDATE_USER_PERSONAL_DETAILS:
            return {
                ...state,
                updateUserPersonalDetailsLoading: action.loading,
            };


        default:
            return state;
    }
};