import { Formik } from "formik";
import { Input, Form as AntForm, Button } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import "../Auth.css";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { validationSchema } from "./Validations"
import { useEffect, useState } from "react";
import { changePassword } from "../../../store/actions/Auth.action";

const ChangePassword = () => {
  const [form] = AntForm.useForm();
  const [paramToken, setParamToken] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const location = useLocation();



  const { loading } = useSelector(({ auth }) => ({
    loading: auth?.changePasswordLoading,
  }));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let token = params.get("token");

    setParamToken(token);
  }, [location]);

  const initialValues = {
    password: "",
    confirmPassword: "",
  };

  const callback = () => {
    navigate('/')
  }

  const handleSubmit = async (values) => {
    let payload = { token: paramToken, newPassword: values.password }
    dispatch(changePassword(payload, callback));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Set New Password</h1>

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

              <Button
                htmlType="submit"
                block
                className="auth-btn auth-btn-primary"
                loading={loading}
                disabled={loading}
              >
                Submit
              </Button>

            </AntForm>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ChangePassword;
