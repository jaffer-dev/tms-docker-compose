import NOTIFICATION from "../constant/Notifications.constant";

const initialState = {
    notifications: [],
    notificationsLoading: false,


};

export default (state = initialState, action = {}) => {
    switch (action.type) {
        case NOTIFICATION.GET_NOTIFICATIONS:
            return {
                ...state,
                notifications: action.data,
                notificationsLoading: action.loading,
            };

        case NOTIFICATION.MARK_AS_READ:
            return {
                ...state,
                notifications: state.notifications.map((n) =>
                    n._id === action.data ? { ...n, read: true } : n
                ),
            };

        case NOTIFICATION.MARK_ALL_AS_READ:
            return {
                ...state,
                notifications: state.notifications.map((n) => ({ ...n, read: true })),
            };

        default:
            return state;
    }
};