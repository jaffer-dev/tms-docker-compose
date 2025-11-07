import { Modal, Input, Button, Form as AntForm, message } from "antd";
import { Formik } from "formik";
import { otpValidationSchema, resetPasswordSchema } from "./ForgotPasswordSchemas";
import { ArrowLeftOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CInput } from "../../../uiComponents";

const OTPModal = ({
  showOTPModal,
  setShowOTPModal,
  email,
  otpVerified,
  setOtpVerified,
  handleVerifyOTP,
  handleResetPassword,
  handleResendOTP,
  handleBack,
}) => {
  const [form] = AntForm.useForm();
  const [timeLeft, setTimeLeft] = useState(60);

  const { resendOtpLoading, changePasswordLoading, forgotVerifyOtpLoading } = useSelector(({ auth }) => ({
    resendOtpLoading: auth?.resendOtpLoading,
    changePasswordLoading: auth?.changePasswordLoading,
    forgotVerifyOtpLoading: auth?.forgotVerifyOtpLoading
  }));

  useEffect(() => {
    if (!showOTPModal) return;
    setTimeLeft(60);

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showOTPModal]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const onResendClick = async () => {
    try {
      await handleResendOTP({ email });
      setTimeLeft(60);
    } catch (err) {
      console.error("Failed to resend OTP", err);
    }
  };

  return (
    <Modal
      open={showOTPModal}
      onCancel={() => {
        setShowOTPModal(false);
        setOtpVerified(false);
      }}
      footer={null}
      centered
      width={450}
      destroyOnClose
    >
      {!otpVerified ? (

        <Formik
          initialValues={{ otp: '' }}
          validationSchema={otpValidationSchema}
          onSubmit={handleVerifyOTP}
        >
          {({ handleSubmit, handleChange, values, handleBlur, errors, touched, getFieldProps, submitCount }) => (

            <AntForm onFinish={handleSubmit} layout="vertical" form={form}>
              <div className="verify-otp-container">
                <div className="otpModal-card">
                  <div className="otpModal-header">
                    <ArrowLeftOutlined
                      className="back-icon"
                      onClick={handleBack}
                    />
                    <h1>OTP Verification</h1>
                  </div>
                  <p className="otp-instructions">We've sent a 6-digit code to <strong>{email}</strong></p>

                  <CInput
                    {...getFieldProps('otp')}
                    maxLength={6}
                    autoFocus
                    inputMode="numeric"
                    placeHolder="Enter 6-digit OTP"
                    onChange={(e) => { handleChange(e); setOtp && setOtp(e.target.value); }}
                    onBlur={handleBlur}
                    error={submitCount ? errors.otp : touched.otp && errors.otp}

                  />

                  <div style={{ marginTop: "40px" }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={forgotVerifyOtpLoading}
                      block
                      className="auth-btn auth-btn-primary"
                    >
                      Verify OTP
                    </Button>

                    <Button
                      htmlType="button"
                      block
                      loading={resendOtpLoading}
                      onClick={onResendClick}
                      disabled={timeLeft > 0}
                      className="auth-btn auth-btn-dark"
                    >
                      Resend OTP {timeLeft > 0 && `(${formatTime(timeLeft)})`}
                    </Button>
                  </div>
                </div>
              </div>
            </AntForm>
          )}
        </Formik>

      ) : (
        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={resetPasswordSchema}
          onSubmit={handleResetPassword}
        >
          {({ handleSubmit, handleChange, values, errors, touched }) => (
            <AntForm onFinish={handleSubmit} layout="vertical" >
              <div className="verify-otp-container">
                <div className="otpModal-card">
                  <h1 className="auth-title">OTP Verification</h1>
                  <AntForm.Item
                    label={<span className="form-label">New Password</span>}
                    validateStatus={touched.password && errors.password ? "error" : ""}
                    help={touched.password && errors.password && (
                      <span className="form-error">{errors.password}</span>
                    )}
                  >
                    <Input.Password
                      name="password"
                      placeholder="Password"
                      value={values.password}
                      onChange={handleChange}
                      className="form-input"
                      iconRender={(visible) =>
                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                    />
                  </AntForm.Item>

                  <AntForm.Item
                    label={<span className="form-label">Confirm Password</span>}
                    validateStatus={touched.confirmPassword && errors.confirmPassword ? "error" : ""}
                    help={touched.confirmPassword && errors.confirmPassword && (
                      <span className="form-error">{errors.confirmPassword}</span>
                    )}
                  >
                    <Input.Password
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                      iconRender={(visible) =>
                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                    />
                  </AntForm.Item>

                  <Button type="primary" htmlType="submit" loading={changePasswordLoading} block className="auth-btn auth-btn-primary">
                    Update Password
                  </Button>
                </div>
              </div>
            </AntForm>
          )}
        </Formik>
      )}
    </Modal>
  );
};

export default OTPModal;
