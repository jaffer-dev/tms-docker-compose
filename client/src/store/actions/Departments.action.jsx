import { handleError, handleSuccess } from '../../utils/Methods';
import { get, post, del } from '../../utils/ApiMethods';
import DEPARTMENTS from '../constant/Departments.constant';
import axios from 'axios';

export const createDepartment = (payload, CB) => async (dispatch) => {
  const dispatchType = DEPARTMENTS.CREATE_DEPARTMENT
  dispatch({ type: dispatchType, loading: true });
  try {
    const { data } = await post('/department/create-department', payload);
    if (!data?.error) {
      dispatch({ type: dispatchType, loading: false });
      handleSuccess(data?.message || ' Team created !');
      CB && CB()
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false });
    handleError(error.message || error?.response?.data?.message);
  }
};

export const getDepartments = (payload, CB) => async (dispatch) => {
  const dispatchType = DEPARTMENTS.GET_DEPARTMENTS
  dispatch({ type: dispatchType, loading: true, data: [] });
  try {
    const { data } = await post('/department/getAllDepartments', payload);
    if (!data.error) {
      dispatch({ type: dispatchType, loading: false, data: data?.teams || [] });
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, data: [] });
    handleError(error.response.data.message || error.message);
  }
};

export const deleteDepartment = (payload, CB) => async (dispatch) => {
  const dispatchType = DEPARTMENTS.DELETE_DEPARTMENT
  dispatch({ type: dispatchType, loading: true });
  try {
    const { data } = await axios.delete(`/team/team/${payload.id}`);
    if (!data.error) {
      dispatch({ type: dispatchType, loading: false });
      handleSuccess(data.message || 'Team deleted!');
      CB && CB();
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false });
    handleError(error.message);
  }
};


export const addDepartmentMember = (payload, CB) => async (dispatch) => {
  const dispatchType = DEPARTMENTS.ADD_DEPARTMENT_MEMBER
  dispatch({ type: dispatchType, loading: true });
  try {
    const { data } = await post('/department/add-member-to-department', payload);
    if (data) {
      dispatch({ type: DEPARTMENTS.ADD_DEPARTMENT_MEMBER, loading: false });
      handleSuccess(data?.message || 'Team member added successfully! ');
      CB && CB()
    }else {
      dispatch({ type: DEPARTMENTS.ADD_DEPARTMENT_MEMBER, loading: false });
      handleError(data?.message || 'Team member added successfully! ');
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false });
    handleError(error?.response?.data?.message || 'Something went wrong while adding the member!');
  }
};


export const getDepartmentMembers = (payload, CB) => async (dispatch) => {
  const dispatchType = DEPARTMENTS.GET_DEPARTMENT_MEMBERS
  dispatch({ type: dispatchType, loading: true, data: [] });
  try {
    const { data } = await get(`/department/${payload?.departmentId}/members`, payload);
    if (!data.error) {
      dispatch({ type: dispatchType, loading: false, data: data?.members });
      // handleSuccess(data.message);
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, data: [] });
    handleError(error?.response?.data?.message || error.message);
  }
};

export const getManagerMember = (payload, CB) => async (dispatch) => {
  const dispatchType = DEPARTMENTS.GET_MANAGER_MEMBER
  dispatch({ type: dispatchType, loading: true, data: [] });
  try {
    const { data } = await get(`/team/user-team-members`);
    if (!data.error) {
      dispatch({ type: dispatchType, loading: false, data: data?.members || [] });
      handleSuccess(data.message);
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, data: [] });
    handleError(error?.response?.data?.message || error.message);
  }
};

export const deleteDepartmentMember = (userId, CB) => async (dispatch) => {
  const dispatchType = DEPARTMENTS.DELETE_DEPARTMENT_MEMBER
  dispatch({ type: dispatchType, loading: true, data: [] });

  try {
    const { data } = await del(`/team/member/${userId}`);
    if (!data.error) {
      dispatch({ type: dispatchType, loading: false, data: data?.teams || [] });
      handleSuccess(data.message);
      if (CB) CB();
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, data: [] });
    handleError(error.message);
  }
};



export const getHods = () => async (dispatch) => {
  const dispatchType = DEPARTMENTS.GET_HODS
  dispatch({ type: dispatchType, loading: true, data: [] });
  try {
    const { data } = await get(`/department/get-hods`);
    if (!data.error) {
      dispatch({ type: dispatchType, loading: false, data: data?.hods });
      // handleSuccess(data.message);
    } else {
      dispatch({ type: dispatchType, loading: false, data: [] });
      handleError(data.message);
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, data: [] });
    handleError(error?.response?.data?.message || error.message);
  }
};

export const getHodEmployees = (payload) => async (dispatch) => {
  const dispatchType = DEPARTMENTS.GET_HODS_EMPLOYEES
  dispatch({ type: dispatchType, loading: true, data: [] });
  try {
    const { data } = await get(`/department/hod/${payload.hodId}/employees`);
    if (!data.error) {
      dispatch({ type: dispatchType, loading: false, data: data?.employees });
      handleSuccess(data.message);
    } 
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, data: [] });
    handleError(error?.response?.data?.message || error.message);
  }
};