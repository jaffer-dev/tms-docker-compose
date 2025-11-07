import AUTH from '../constant/Auth.constant';

const initialState = {

  verifyOTPLoading: false,

  loginLoading: false,
  msLoginLoading: false,
  isLoggedIn: false,

  user: {},
  getProfileLoading: false,

  signUpLoading: false,
  isVerifying: false,

  msSignUpLoading: false,

  resendOtpLoading: false,

  requestOtpLoading: false,

  changePasswordLoading: false,

  forgotVerifyOtpLoading: false,

  verifyLoginLoading: false,

  verifyLoading: false,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {

    case AUTH.LOGIN:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
        loginLoading: action.loading,
      };

    case AUTH.MS_LOGIN:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
        msLoginLoading: action.loading,
      };

    case AUTH.TOGGLE_AUTH:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
      };

    case AUTH.SIGNUP:
      return {
        ...state,
        signUpLoading: action.loading,
      };

    case AUTH.VERIFY_OTP:
      return {
        ...state,
        verifyOTPLoading: action.loading,
      };

    case AUTH.RESEND_OTP:
      return {
        ...state,
        resendOtpLoading: action.loading,
      };
    case AUTH.REQUEST_OTP:
      return {
        ...state,
        requestOtpLoading: action.loading,
      };

    case AUTH.FORGOT_PASSWORD_VERIFY_OTP:
      return {
        ...state,
        forgotVerifyOtpLoading: action.loading,
      };
    case AUTH.RESET_PASSWORD:
      return {
        ...state,
        resetPasswordLoading: action.loading,
      };

    case AUTH.MS_SIGNUP:
      return {
        ...state,
        msSignUpLoading: action.loading,
        isLoggedIn: action.isLoggedIn
      };

    case AUTH.LOGOUT:
      return { ...initialState };

    case AUTH.GET_PROFILE:
      return {
        ...state,
        getProfileLoading: action.loading,
        user: action.data,
        isLoggedIn: action.isLoggedIn
      };
    case AUTH.CHANGE_PASSWORD:
      return {
        ...state,
        changePasswordLoading: action.loading,
      };
    case AUTH.MS_VERIFY_LOGIN:
      return {
        ...state,
        verifyLoginLoading: action.loading,
      };
       case AUTH.MS_VERIFY:
      return {
        ...state,
        verifyLoading: action.loading,
      };

    default:
      return state;
  }
}
