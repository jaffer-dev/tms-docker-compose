import { Formik } from "formik";
import { Input, Form as AntForm, Button, message } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import "../Auth.css";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../../store/actions/Auth.action";
import { useNavigate } from "react-router-dom";
import { validationSchema } from "./Validations"

const Login = () => {
  const [form] = AntForm.useForm();
  const dispatch = useDispatch()
  const navigate = useNavigate();

  const { loading } = useSelector(({ auth }) => ({
    loading: auth?.loginLoading,
  }));


  const initialValues = {
    email: "",
    password: "",
  };

  const loginCallBack  = (changePasswordToken) => {
    navigate(`/change-password?token=${changePasswordToken}`);
  }

  const handleSubmit = async (values) => {
    let payload = { email: values.email, password: values.password }
    dispatch(login(payload, loginCallBack));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            touched,
            errors,
          }) => (
            <AntForm layout="vertical" onFinish={handleSubmit} form={form}>

              <AntForm.Item
                label={<span className="form-label">Work Email</span>}
                validateStatus={touched.email && errors.email ? "error" : ""}
                help={
                  touched.email && errors.email ? (
                    <span className="form-error">{errors.email}</span>
                  ) : null
                }
              >
                <Input
                  name="email"
                  placeholder="john@email.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="form-input"
                  disabled={loading}
                />
              </AntForm.Item>
              <AntForm.Item
                label={<span className="form-label">Password</span>}
                validateStatus={touched.password && errors.password ? "error" : ""}
                help={
                  touched.password && errors.password ? (
                    <span className="form-error">{errors.password}</span>
                  ) : null
                }
              >
                <Input.Password
                  name="password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="form-input"
                  disabled={loading}
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                />
              </AntForm.Item>

              <div className="forgot-password">
                <p onClick={() => navigate("/forgotpassword")}>Forgot Password?</p>
              </div>

              <Button
                htmlType="submit"
                block
                className="auth-btn auth-btn-primary"
                loading={loading}
                disabled={loading}
              >
                Login
              </Button>
            </AntForm>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;