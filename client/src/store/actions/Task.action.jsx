import { handleError, handleSuccess } from '../../utils/Methods';
import { post, put, get } from '../../utils/ApiMethods';
import TASK_CONSTANT from '../constant/Task.constant';


export const createTask = (payload, CB) => async (dispatch) => {
    dispatch({ type: TASK_CONSTANT.CREATE_TASK, loading: true });
    try {
        const { data } = await post('task/create', payload);
        if (!data.error) {
            dispatch({ type: TASK_CONSTANT.CREATE_TASK, loading: false });
            handleSuccess(data.message);
            CB && CB()
        }
    } catch (error) {
        dispatch({ type: TASK_CONSTANT.CREATE_TASK, loading: false });
        handleError(error.message);
    }
};

export const getAllTask = (payload, CB) => async (dispatch) => {
    dispatch({ type: TASK_CONSTANT.GET_USER_TASK, loading: true, data: [] });
    try {
        const { data } = await post('task/all-task', payload);
        if (!data.error) {
            dispatch({ type: TASK_CONSTANT.GET_USER_TASK, loading: false, data: data?.tasks });
        }
    } catch (error) {
        dispatch({ type: TASK_CONSTANT.GET_USER_TASK, loading: false, data: [] });
        handleError(error.message);
    }
};

export const getTaskDetails = (payload, CB) => async (dispatch) => {
    dispatch({ type: TASK_CONSTANT.GET_TASK_DETAIL, loading: true, data: {} });
    const taskId = payload?.taskId || payload;
    try {
        const { data } = await get(`task/history/${taskId}`);
        if (!data.error) {
            dispatch({ type: TASK_CONSTANT.GET_TASK_DETAIL, loading: false, data });
            if (CB) CB(data);
        }
    } catch (error) {
        dispatch({ type: TASK_CONSTANT.GET_TASK_DETAIL, loading: false, data: {} });
        handleError(error.message);
    }
};

export const submitForReview = (formData) => async (dispatch) => {
    dispatch({ type: TASK_CONSTANT.SUBMIT_FOR_REVIEW, loading: true });
    try {
        const { data } = await post('task/upload-work', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (!data.error) {
            dispatch({ type: TASK_CONSTANT.SUBMIT_FOR_REVIEW, loading: false });
            handleSuccess(data.message);
            // Optionally refresh task details
            dispatch(getTaskDetails({ taskId: formData.get('taskId') }));
        }
    } catch (error) {
        dispatch({ type: TASK_CONSTANT.SUBMIT_FOR_REVIEW, loading: false });
        handleError(error.message);
    }
};


export const assignTaskToEmployee = (payload, CB) => async (dispatch) => {
    const dispatchType = TASK_CONSTANT.ASSIGN_TASK_TO_EMPLOYEE
    dispatch({ type: dispatchType, loading: true });
    try {
        const { data } = await put('task/assign-task', payload);
        if (!data.error) {
            dispatch({ type: dispatchType, loading: false });
            handleSuccess(data.message);
            CB && CB()
        }
    } catch (error) {
        dispatch({ type: dispatchType, loading: false });
        handleError(error.message || error?.response?.data?.message);
    }
};

// Comments
export const getComments = (payload, CB) => async (dispatch) => {
    const dispatchType = TASK_CONSTANT.GET_COMMENTS;
    dispatch({ type: dispatchType, loading: true, data: [] });

    try {
        const res = await get(`comments/get-comments/${payload?.taskId}`);
        const data = res?.data;
        if (data && !data.error) {
            dispatch({ type: dispatchType, loading: false, data: data?.data?.comments });
            // handleSuccess(data.message);
            if (typeof CB === "function") CB(data?.comments);
        }
    } catch (error) {
        dispatch({ type: dispatchType, loading: false, data: [] });
        handleError(error.message || error?.response?.data?.message);
    }
};


export const addComments = (payload, CB) => async (dispatch) => {
    const dispatchType = TASK_CONSTANT.ADD_COMMENTS
    dispatch({ type: dispatchType, loading: true, data: [] });
    try {
        const { data } = await post('comments/Add-comments', payload);
        if (!data.error) {
            dispatch({ type: dispatchType, loading: false, data: data?.comments });
            handleSuccess(data.message);
            CB && CB()
        }
    } catch (error) {
        dispatch({ type: dispatchType, loading: false, data: [] });
        handleError(error.message || error?.response?.data?.message);
    }
};


export const setStatus = (payload, CB) => async (dispatch) => {
    const dispatchType = TASK_CONSTANT.SET_STATUS
    dispatch({ type: dispatchType, loading: true, data: [] });
    try {
        const { data } = await put('task/update-status', payload);
        if (!data.error) {
            dispatch({ type: dispatchType, loading: false, data: data?.comments });
            // handleSuccess(data.message);
            CB && CB()
        }
    } catch (error) {
        dispatch({ type: dispatchType, loading: false, data: [] });
        handleError(error.message || error?.response?.data?.message);
    }
};