import AUTH from '../constant/Auth.constant';
import { post, get } from '../../utils/ApiMethods';
import { clearLocalstorage, handleError, handleSuccess } from '../../utils/Methods';
import axios from 'axios';
import { TOKEN } from '../../utils/Constants';

// simple login 
export const login = (payload, CB) => async (dispatch) => {
  const dispatchType = AUTH.LOGIN;
  dispatch({ type: dispatchType, loading: true, isLoggedIn: false });
  try {
    const { data } = await post('auth/login', payload);
    if (!data.error && data?.token) {
      if (data?.isFirstLogin) {
        handleSuccess('Please Set your password to process');
        CB(data?.changePasswordToken);
      } else {
        handleSuccess(data.message);
        localStorage.setItem(TOKEN, data.token);
        dispatch({ type: dispatchType, loading: false, isLoggedIn: true });
        dispatch(getProfile());
      }
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, isLoggedIn: false, });
    handleError(error?.response?.data.message);
  }
};

export const verifyMicrosoftLogin = (payload, CB) => async (dispatch) => {
  const dispatchType = AUTH.MS_VERIFY_LOGIN;
  dispatch({ type: dispatchType, loading: true });
  try {
    const { data } = await post('auth/verify-ms-login', payload);
    if (!data.error) {
      localStorage.setItem(TOKEN, data?.token);
      dispatch({ type: dispatchType, loading: false});
      dispatch(getProfile())
      handleSuccess(data.message || "Login Successful");
      CB && CB()
    } else {
      dispatch({ type: dispatchType, loading: false,  });
      handleError(data.message || "Microsoft Login failed. Please try again.");
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false });
    handleError(error?.response?.data.message || "Microsoft Login failed. Please try again.");
  }
};

export const verifyMicrosoft = (payload, CB) => async (dispatch) => {
    const dispatchType = AUTH.MS_VERIFY;
    dispatch({ type: dispatchType, loading: true });
    try {
      const { data } = await post('auth/verify-microsoft', payload);
      if (!data.error) {
        localStorage.setItem(TOKEN, data?.token);
        dispatch({ type: dispatchType, loading: false,  });
        dispatch(getProfile())
        handleSuccess(data.message || "Login Successful");
        CB && CB()

      } else {
        dispatch({ type: dispatchType, loading: false,  });
        handleError(data.message || "Microsoft Login failed. Please try again.");
      }
    } catch (error) {
      dispatch({ type: dispatchType, loading: false, });
      handleError(error?.response?.data.message || "Microsoft Login failed. Please try again.");
    }
  };

// login with microsoft ==>
export const MicrosoftLogin = (payload) => async (dispatch) => {
  const dispatchType = AUTH.MS_LOGIN;
  dispatch({ type: dispatchType, loading: true, isLoggedIn: false });
  try {
    const { data } = await post('auth/verify-ms-login', payload);
    if (!data.error) {
      localStorage.setItem(TOKEN, data.token);
      dispatch({ type: dispatchType, loading: false, isLoggedIn: true, });
      dispatch(getProfile())
      handleSuccess(data.message || "Login Successful");
    } else {
      dispatch({ type: dispatchType, loading: false, isLoggedIn: false, });
      handleError(data.message || "Microsoft Login failed. Please try again.");
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, isLoggedIn: false, });
    handleError(error?.response?.data.message || "Microsoft Login failed. Please try again.");
  }
};

// profile change password 
export const changePassword = (payload, CB) => async (dispatch) => {
  const dispatchType = AUTH.CHANGE_PASSWORD;
  dispatch({ type: dispatchType, loading: true });
  try {
    const { data } = await post('auth/change-password', payload);
    if (!data.error) {
      dispatch({ type: dispatchType, loading: false });
      handleSuccess(data.message);
      CB && CB()
    } else {
      dispatch({ type: dispatchType, loading: false });
      handleError(data?.message)
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, });
    handleError(error?.response?.data.message);
  }
};

export const toggleAuth = (val) => async (dispatch) => {
  const dispatchType = AUTH.TOGGLE_AUTH;
  dispatch({ type: dispatchType, isLoggedIn: val });
};

// simple signup ==>
export const signup = (payload, CB) => async (dispatch) => {
  const dispatchType = AUTH.SIGNUP;
  dispatch({ type: dispatchType, loading: true });

  try {
    const { data } = await post("auth/signup", payload);

    if (data.nextStep === 'verify-otp') {
      CB && CB(data, payload)
      handleSuccess(data.message || "Successfully send OTP your provided email");
    }
    dispatch({ type: dispatchType, loading: false });
  } catch (error) {
    dispatch({ type: dispatchType, loading: false });
    handleError(error.response?.data?.message || "Signup failed. Please try again.")
  }
};

// microsoft signup ==>
export const microsoftSignup = (payload, CB) => async (dispatch) => {
  const dispatchType = AUTH.MS_SIGNUP;
  dispatch({ type: dispatchType, loading: true, isLoggedIn: false });
  try {
    const { data } = await post("auth/login-ms", payload);

    if (!data?.error) {
      localStorage.setItem(TOKEN, data.token);
      dispatch({ type: dispatchType, loading: false, isLoggedIn: true });
      dispatch(getProfile());
      handleSuccess(data.message || 'Signup successfull')
      CB && CB()
    } else {
      handleError("something went wrong")
    }
    dispatch({ type: dispatchType, loading: false, isLoggedIn: false })
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, isLoggedIn: false });
    handleError(error.response?.data?.message || "Microsoft signup failed. Please try again.");
  }
};

// Signup Verify OTP Action ==>
export const verifyOtp = (payload, CB) => async (dispatch) => {
  const dispatchType = AUTH.VERIFY_OTP;
  dispatch({ type: dispatchType, loading: true });

  try {
    const { data } = await axios.post("auth/signup", payload);

    if (data?.token) {
      localStorage.setItem(TOKEN, data.token);
      toggleAuth(true)
      dispatch(getProfile());
      handleSuccess(data?.message || "Your account has been successfully verified!")
      CB && CB()
    } else {
      handleError("token is missing")
    }
    dispatch({ type: dispatchType, loading: false });

  } catch (error) {
    dispatch({ type: dispatchType, loading: false });
    handleError(error.response?.data?.message || "OTP verification failed. Please try again.")

  }
};

// forgot password request otp 
export const forgotPasswordRequestOtp = (payload, CB) => async (dispatch) => {
  const dispatchType = AUTH.REQUEST_OTP;
  dispatch({ type: dispatchType, loading: true, isLoggedIn: false });
  try {
    const { data } = await post("auth/request-password-reset", payload);
    if (!data?.error) {
      dispatch({ type: dispatchType, loading: false, isLoggedIn: true });
      handleSuccess(data.message || 'OTP sent successfully')
      CB && CB(payload?.email)
    } else {
      dispatch({ type: dispatchType, loading: false, isLoggedIn: false })
      handleError("something went wrong")
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, isLoggedIn: false });
    handleError(error.response?.data?.message || "Failed to send OTP. Please try again.");
  }
};

export const resendOtp = (payload, CB) => async (dispatch) => {
  const dispatchType = AUTH.RESEND_OTP;
  dispatch({ type: dispatchType, loading: true, isLoggedIn: false });
  try {
    const { data } = await post("otp/resend-otp", payload);

    if (!data?.error) {
      dispatch({ type: dispatchType, loading: false, isLoggedIn: true });
      handleSuccess(data.message || 'OTP sent successfully')
      CB && CB()
    } else {
      dispatch({ type: dispatchType, loading: false, isLoggedIn: false })
      handleError("something went wrong")
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, isLoggedIn: false });
    handleError(error.response?.data?.message || "Failed to resend OTP. Please try again.");
  }
};


// forgot password verify otp
export const forgotPasswordVerifyOtp = (payload, CB) => async (dispatch) => {
  const dispatchType = AUTH.FORGOT_PASSWORD_VERIFY_OTP;
  dispatch({ type: dispatchType, loading: true, isLoggedIn: false });
  try {
    const { data } = await post("auth/verify-password-reset-otp", payload);

    if (!data?.error) {
      dispatch({ type: dispatchType, loading: false, isLoggedIn: true });
      handleSuccess(data.message || 'OTP verified!')
      CB && CB()
    } else {
      dispatch({ type: dispatchType, loading: false, isLoggedIn: false })
      handleError("something went wrong")
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, isLoggedIn: false });
    handleError(error.response?.data?.message || "Invalid OTP");
  }
};

// forgot password reset password
export const resetPassword = (payload, CB) => async (dispatch) => {
  const dispatchType = AUTH.RESET_PASSWORD;
  dispatch({ type: dispatchType, loading: true, isLoggedIn: false });
  try {
    const { data } = await post("auth/reset-password", payload);

    if (!data?.error) {
      dispatch({ type: dispatchType, loading: false, isLoggedIn: true });
      handleSuccess(data.message || 'OTP sent successfully')
      CB && CB()
    } else {
      dispatch({ type: dispatchType, loading: false, isLoggedIn: false })
      handleError("something went wrong")
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, isLoggedIn: false });
    handleError(error.response?.data?.message || "Failed to send OTP. Please try again.");
  }
};


export const getProfile = () => async (dispatch) => {
  const dispatchType = AUTH.GET_PROFILE;
  dispatch({ type: dispatchType, loading: true, isLoggedIn: false });
  try {
    const { data } = await get(`user/get-profile`);
    if (!data.error) {
      dispatch({ type: dispatchType, data: data?.user, loading: false, isLoggedIn: true });
    }
  } catch (error) {
    dispatch({ type: dispatchType, loading: false, isLoggedIn: false });
  }
};

export const setLoginStatus = (status) => ({
  type: AUTH.SET_LOGIN_STATUS,
  payload: status,
});

export const logout = () => (dispatch) => {
  clearLocalstorage();
  delete axios.defaults.headers.common['authorization'];
  dispatch({ type: AUTH.LOGOUT });
};