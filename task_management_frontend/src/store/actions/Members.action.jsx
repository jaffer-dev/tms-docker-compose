import MEMBERS from '../constant/Members.constant';
import { get, post } from '../../utils/ApiMethods';
import { handleError, handleSuccess } from '../../utils/Methods';

export const AddMembers = (payload, CB) => async (dispatch) => {
  const dispatchType = MEMBERS.ADD_MEMBERS;
  dispatch({ type: dispatchType, loading: true });

  try {
    const { data } = await post("auth/add-member", payload);

    if (data?.userId || data?.nextStep) {
      dispatch({ type: dispatchType, loading: false });
      handleSuccess(data.message || "Member added successfully");
      CB && CB();
    } else {
      dispatch({ type: dispatchType, loading: false });
      handleError(data?.message || "Failed to add member. Please try again.");
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false });
    handleError(error.response?.data?.message || "Failed to add member. Please try again.")
  }
};

export const getMembers = (payload, CB) => async (dispatch) => {
  const dispatchType = MEMBERS.GET_MEMBERS;
  dispatch({ type: dispatchType, loading: true, data: [] });
  try {
    const { data } = await get("/members/get-members");
    if (!data?.error) {
      dispatch({ type: dispatchType, loading: false, data: data?.members });
      // handleSuccess(data.message || "Member fetch successfully");
    } else {
      handleError(data.message || "Failed to get member.");
      dispatch({ type: dispatchType, loading: false, data: [] });
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, data: [] });
    handleError(error.response?.data?.message || "Failed to get member. Please try again.")
  }
};