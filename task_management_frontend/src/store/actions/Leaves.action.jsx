import LEAVES from "../constant/Leaves.Constant"
import { get, post } from '../../utils/ApiMethods';
import { handleError, handleSuccess } from '../../utils/Methods';


export const applyLeave = (payload, CB) => async (dispatch) => {
  const dispatchType = LEAVES.APPLY_LEAVE
  dispatch({ type: dispatchType, loading: true });
  try {
    const { data } = await post('/leaves/apply', payload);
    if (!data?.error) {
      dispatch({ type: dispatchType, loading: false });
      handleSuccess(data?.message || 'Leave or WFH request submitted successfully!');
      CB && CB()
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false });
    handleError(error.message || error?.response?.data?.message || "Failed to submit leave or WFH request. Please try again.");
  }
};

export const leaveApprovals = (payload, CB) => async (dispatch) => {
  const dispatchType = LEAVES.LEAVE_APPROVAL
  dispatch({ type: dispatchType, loading: true, data: [] });
  try {
    const { data } = await get('/leaves/approvals', payload);
    if (!data.error) {
      dispatch({ type: dispatchType, loading: false, data: data?.leaves || [] });
    }
    console.info(data, "data")
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, data: [] });
    handleError(error.response.data.message || error.message);
  }
};