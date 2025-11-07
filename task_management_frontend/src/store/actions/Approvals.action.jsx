import { get, post } from "../../utils/ApiMethods";
import { handleError, handleSuccess } from "../../utils/Methods";
import APPROVALS from "../constant/Approvals.constant";



export const getApprovals = (payload, CB) => async (dispatch) => {
  const dispatchType = APPROVALS.GET_APPROVALS;
  dispatch({ type: dispatchType, loading: true, data: [] });
  try {
    const { data } = await get("/approvals/getApprovals");
    if (!data?.error) {
      dispatch({ type: dispatchType, loading: false, data: data?.approvals });
      // handleSuccess(data.message || "Approvals fetch successfully");
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, data: [] });
    handleError(error.response?.data?.message || "Failed to get approvals. Please try again.")
  }
};

export const approvalAction = (payload, CB) => async (dispatch) => {
  const dispatchType = APPROVALS.APPROVALS_ACTION;
  dispatch({ type: dispatchType, loading: true });
  try {
    const { data } = await post("/approvals/approveTaskRequest", payload);
    if (!data?.error) {
      dispatch({ type: dispatchType, loading: false });
      handleSuccess(data.message || "Action successfully");
      CB && CB()
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false });
    handleError(error.response?.data?.message || "Something went's wrong")
  }
};