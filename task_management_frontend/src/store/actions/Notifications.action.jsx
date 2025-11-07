import NOTIFICATION from '../constant/Notifications.constant';
import { get, patch, post } from '../../utils/ApiMethods';
import { handleError, handleSuccess } from '../../utils/Methods';


export const fetchNotifications = (payload) => async (dispatch) => {
    const dispatchType = NOTIFICATION.GET_NOTIFICATIONS
    try {
        dispatch({ type: dispatchType, loading: true, data: [] });
        const { data } = await get(`/notification/get-notifications/${payload?.userId}`);
        if (!data.error) {
            dispatch({ type: dispatchType, loading: false, data: data?.notifications });
        } else {
            dispatch({ type: dispatchType, loading: false, data: [] });
        }
    } catch (error) {
        dispatch({ type: dispatchType, loading: false, data: [] });
        handleError(error?.message || error?.response?.message || 'something went wrong');
    }
};

export const markAsRead = (notificationId, CB) => async (dispatch) => {
        const dispatchType = NOTIFICATION.MARK_AS_READ
    try {
        dispatch({ type: dispatchType, loading: true, data: [] });
        await patch(`/notification/readed-notification/${notificationId}`);
        dispatch({ type: NOTIFICATION.MARK_AS_READ, data: notificationId });
        dispatch({ type: dispatchType, loading: false, data: [] });
        CB && CB(notificationId)
    } catch (error) {
        dispatch({ type: dispatchType, loading: false, data: [] });
        handleError(error?.message || "Error marking notification as read");
    }
};

export const markAllAsRead = (userId) => async (dispatch) => {
    try {
        await patch(`/notification/read-all-notifications/${userId}/read-all`);
        dispatch({ type: NOTIFICATION.MARK_ALL_AS_READ });
    } catch (error) {
        handleError(error?.message || "Error marking all notifications as read");
    }
}
