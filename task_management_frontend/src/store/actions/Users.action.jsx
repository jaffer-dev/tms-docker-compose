import { get, patch, post, put } from '../../utils/ApiMethods';
import { handleError, handleSuccess } from '../../utils/Methods';
import USERS from '../constant/Users.constant';
import { getProfile } from './Auth.action';

export const getUserStats = (payload) => async (dispatch) => {
    const dispatchType = USERS.GET_USER_STATS
    dispatch({ type: dispatchType, loading: true, data: [] });
    try {
        const { data } = await post('user/user-stats', payload);
        if (!data.error) {
            dispatch({ type: dispatchType, data: data?.stats, loading: false });
        }
    } catch (error) {
        dispatch({ type: dispatchType, data: data, loading: false });
        handleError(error?.response?.data?.message || error?.message);
    }
};

export const fetchNonHRUsers = (payload, CB) => async (dispatch) => {
    const dispatchType = USERS.GET_NON_HR_USERS
    dispatch({ type: dispatchType, loading: true, data: [] });
    try {
        const { data } = await get('user/get-all-employees', payload)
        if (!data.error) {
            dispatch({ type: dispatchType, loading: false, data: data?.users });
        }
    } catch (error) {
        dispatch({ type: dispatchType, loading: false, data: [] });
        handleError(error.message);
    }
};

export const fetchallmanagers = (payload, CB) => async (dispatch) => {
    const dispatchType = USERS.GET_MANAGER
    dispatch({ type: dispatchType, loading: true, data: [] });
    try {
        const { data } = await get('user/managers', payload)
        if (!data.error) {
            dispatch({ type: dispatchType, loading: false, data: data?.managers });
        }
    } catch (error) {
        dispatch({ type: dispatchType, loading: false, data: [] });
        handleError(error.message);
    }
};

export const fetchHRUsers = (payload, CB) => async (dispatch) => {
    const dispatchType = USERS.GET_HR_USERS
    dispatch({ type: dispatchType, loading: true, data: [] });
    try {
        const { data } = await get('user/hr-users', payload)
        if (!data.error) {
            dispatch({ type: dispatchType, loading: false, data: data?.hrUsers });
        }
    } catch (error) {
        dispatch({ type: dispatchType, loading: false, data: [] });
        handleError(error.message);
    }
};

export const updateStatus = (payload, CB) => async (dispatch) => {
    const dispatchType = USERS.UPDATE_STATUS
    dispatch({ type: dispatchType, loading: true });
    try {
        const { data } = await patch(`user/status `, payload)
        if (!data.error) {
            dispatch({ type: dispatchType, loading: false });
            handleSuccess(data.message)
            CB && CB()
        } else {
            dispatch({ type: dispatchType, loading: false });
            handleError(data.message)
        }
    } catch (error) {
        dispatch({ type: dispatchType, loading: false });
        handleError(error.message);
    }
};

export const updateUserPersonalDetails = (payload) => async (dispatch) => {
    const dispatchType = USERS.UPDATE_USER_PERSONAL_DETAILS
    dispatch({ type: dispatchType, loading: true });
    try {
        const { data } = await post(`/personal-details/save`, payload)
        if (!data.error) {
            dispatch({ type: dispatchType, loading: false });
            handleSuccess(data.message)
            dispatch(getProfile())
        } else {
            dispatch({ type: dispatchType, loading: false });
            handleError(data.message)
        }
    } catch (error) {
        dispatch({ type: dispatchType, loading: false });
        handleError(error.message);
    }
};

export const updatePassword = (payload, CB) => async (dispatch) => {
    const dispatchType = USERS.UPDATE_PASSWORD
    dispatch({ type: dispatchType, loading: true });
    try {
        const { data } = await put(`/team/member/${payload.userId}/password`, { password: payload?.password })
        if (!data.error) {
            dispatch({ type: dispatchType, loading: false });
            handleSuccess(data.message)
            CB && CB()
        } else {
            dispatch({ type: dispatchType, loading: false });
            handleError(data.message)
        }
    } catch (error) {
        dispatch({ type: dispatchType, loading: false });
        handleError(error.message);
    }
};

