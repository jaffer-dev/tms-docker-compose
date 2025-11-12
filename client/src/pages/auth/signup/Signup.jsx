import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import { Input, Form as AntForm, Button, Select, message } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { BsMicrosoftTeams } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import "../Auth.css";
import OtpModal from "./otpModal/OtpModal";
import { validationSchema } from "./Validation";
import { resendOtp, signup, verifyOtp } from "../../../store/actions/Auth.action";
import RoleModal from "./roleModal/RoleModal";
import { CInput } from "../../../uiComponents";
import CSelect from "../../../uiComponents/cSelect/CSelect";

const { Option } = Select;

const Signup = () => {
  const [form] = AntForm.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [otp, setOtp] = useState('');
  const [isOpen, setIsOpen] = useState(false)

  const { loading } = useSelector(({ auth }) => ({
    loading: auth?.signUpLoading || auth.verifyOTPLoading || auth.msSignUpLoading,
  }));

  const toggleMsSignUp = (val = false) => {
    setIsOpen(true)
  }

  const initialValues = {
    fullName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  };

  const signupCallback = (res, payload) => {
    if (res?.nextStep === 'verify-otp') {
      setOtpData({
        email: res.email,
        userId: res.userId,
        tempToken: res.tempToken,
        role: payload?.role
      });
      setOtpModalVisible(true);
    }
  }

  const handleSubmit = async (values) => {
    let payload = {
      username: values.fullName,
      email: values.email,
      password: values.password,
      role: values.role,
    }
    dispatch(signup(payload, signupCallback));
  };

  const verifyOtpCallback = () => {
    setOtpModalVisible(false);
  }

  const handleVerifyOtp = async () => {
    dispatch(verifyOtp({
      email: otpData.email,
      otp,
      tempToken: otpData.tempToken,
      role: otpData?.role
    }, verifyOtpCallback));
  };


  const handleResendOTP = () => {
    if (otpData?.email || otpData?.tempToken) {
      let payload = {
        email: otpData.email,
        // tempToken: otpData.tempToken
      }
      dispatch(resendOtp(payload))
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Sign up</h1>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            setFieldValue,
            values,
            touched,
            errors,
            isSubmitting,
            submitCount
          }) => (
            <AntForm layout="vertical" onFinish={handleSubmit} form={form}>

              <CInput
                label="Full Name"
                name="fullName"
                placeHolder="John Doe"
                value={values.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={submitCount ? errors.fullName : touched.fullName && errors.fullName}
              />

              <CInput
                label={'Work Email'}
                name="email"
                placeHolder="john@email.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={submitCount ? errors.email : touched.email && errors.email}
              />

              {/* Role */}

              <CSelect
                label="Select Role"
                placeholder="Select a role"
                value={values.role || undefined}
                onChange={(value) => setFieldValue("role", value)}
                onBlur={() => handleBlur({ target: { name: "role" } })}
                data={[
                  { key: "Auditor", label: "Auditor" },
                  { key: "manager", label: "Manager" },
                  { key: "HR", label: "HR" },
                ]}
                error={submitCount ? errors.role : touched.role && errors.role}
              >
              </CSelect>

              {/* Password */}
              <AntForm.Item
                label={<span className="form-label">Password</span>}
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
                  onBlur={handleBlur}
                  className="form-input"
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                />
              </AntForm.Item>

              {/* Confirm Password */}
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
                  onBlur={handleBlur}
                  className="form-input"
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                />
              </AntForm.Item>

              <div className="forgot-password">
                <p onClick={() => navigate("/forgotpassword")}>Forgot Password?</p>
              </div>


              <Button
                className="auth-btn auth-btn-primary"
                htmlType="submit"
                loading={loading}
                disabled={loading}
                block
              >
                Sign Up
              </Button>

              <Button
                htmlType="button"
                block
                disabled={loading}
                className="auth-btn auth-btn-dark"
                loading={loading}
                onClick={() => toggleMsSignUp(true)}
              >
                <BsMicrosoftTeams size={20} />
                Sign up with Microsoft
              </Button>

              <Button
                type="default"
                block
                disabled={loading}
                loading={loading}
                className="auth-btn auth-btn-outline"
                onClick={() => navigate("/")}
              >
                Login
              </Button>
            </AntForm>
          )}
        </Formik>

        <OtpModal
          open={otpModalVisible}
          onCancel={() => setOtpModalVisible(false)}
          onVerify={handleVerifyOtp}
          isVerifying={loading}
          otp={otp}
          setOtp={setOtp}
          email={otpData?.email}
          handleResendOTP={handleResendOTP}
        />

        <RoleModal setIsOpen={setIsOpen} isOpen={isOpen} />
      </div>
    </div>
  );
};

export default Signup;