import { useState, useEffect } from "react";
import { Formik } from "formik";
import { Input, Form as AntForm, Button } from "antd";
import { emailSchema } from "./ForgotPasswordSchemas";
import OTPModal from "./OTPModal";
import { useNavigate } from "react-router-dom";
import { forgotPasswordRequestOtp, forgotPasswordVerifyOtp, resendOtp, resetPassword } from "../../../store/actions/Auth.action";
import { useDispatch, useSelector } from "react-redux";
import { CInput } from "../../../uiComponents";


const ForgotPasswordModal = () => {

  const { requestOtpLoading } = useSelector(({ auth }) => ({
    requestOtpLoading: auth?.requestOtpLoading,
  }));

  const [email, setEmail] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (showOTPModal && !email) {
      setShowOTPModal(false);
    }
  }, [showOTPModal, email]);

  // request otp 
  const handleRequestOTPCallBack = (email) => {
    setEmail(email);
    setShowOTPModal(true);
  }

  const handleRequestOTP = async (values) => {
    let payload = {
      email: values.email
    }
    dispatch(forgotPasswordRequestOtp(payload, handleRequestOTPCallBack))
  };

  // resend otp 
  const handleResendOTP = () => {
    if (email) {
      let payload = {
        email: email,
      }
      dispatch(resendOtp(payload))
    }
  };

  // verify otp 
  const handleVerifyOtpCallback = () => {
    setOtpVerified(true);
  }
  const handleVerifyOTP = async ({ otp }) => {
    let payload = {
      email,
      otp
    }
    dispatch(forgotPasswordVerifyOtp(payload, handleVerifyOtpCallback))

  };

  // reset password 
  const HandleResetPasswordCallback = () => {
    navigate("/")
  }

  const handleResetPassword = async ({ password }) => {
    let payload = {
      email,
      newPassword: password
    }
    dispatch(resetPassword(payload, HandleResetPasswordCallback))
  };

  const handleBackToForgot = () => {
    setShowOTPModal(false);
    setOtpVerified(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Forgot Password</h1>
        <Formik
          initialValues={{ email: '' }}
          validationSchema={emailSchema}
          onSubmit={handleRequestOTP}
        >
          {({ handleSubmit, handleChange, values, errors, touched, submitCount }) => (

            <AntForm layout="vertical" onSubmitCapture={handleSubmit}>

              <CInput
                label="Email Address"
                name="email"
                placeHolder="john@email.com"
                value={values.email}
                onChange={handleChange}
                error={submitCount ? errors.email : touched.email && errors.email}
              />

              <div style={{ marginTop: "40px" }}>
                <Button
                  htmlType="submit"
                  block
                  className="auth-btn auth-btn-primary"
                  loading={requestOtpLoading}
                >
                  Send OTP
                </Button>
                <Button
                  type="default"
                  block
                  className="auth-btn auth-btn-outline"
                  onClick={() => navigate("/")}
                  disabled={requestOtpLoading}
                >
                  Back to Login
                </Button>
              </div>

            </AntForm>
          )}
        </Formik>

        <OTPModal
          showOTPModal={showOTPModal}
          setShowOTPModal={setShowOTPModal}
          email={email}
          otpVerified={otpVerified}
          setOtpVerified={setOtpVerified}
          handleVerifyOTP={handleVerifyOTP}
          handleResetPassword={handleResetPassword}
          handleResendOTP={handleResendOTP}
          handleBack={handleBackToForgot}
        />
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
