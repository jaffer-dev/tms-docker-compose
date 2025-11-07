import {
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
  import "./Profile.css";
import {
  Button,
  Divider,
  Form as AntForm,
  Input,
  Modal,

} from "antd";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import resetPasswordSchema from "./Validation"
import { UserAvatar } from "../userAvatar/UserAvatar";
import { updatePassword } from "../../store/actions/Users.action";
import { ConditionalRendering, readableText } from "../../utils/Methods";
import { MdOutlineLock } from "react-icons/md";

const Profile = ({ isProfileOpen, setIsProfileOpen, userData }) => {
  const [showinput, setshowinput] = useState(false);
  const dispatch = useDispatch();
  const [form] = AntForm.useForm();

  const { profileData, userId, loading } = useSelector(({ auth, team, user }) => ({
    profileData: auth?.user,
    userId: auth?.user?._id,
    loading: user?.updateUserPasswordLaoding,
  }));

  const initialValues = {
    password: "",
    confirmPassword: "",
  };

  const onCancel = () => {
    setIsProfileOpen(false)
  }

  const handlePasswordChange = (value) => {
    const payload = {
      userId: userId,
      password: value.password
    }
    dispatch(updatePassword(payload))
  }


  return (
    <Formik
      initialValues={initialValues}
      validationSchema={resetPasswordSchema}
      onSubmit={handlePasswordChange}
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        handleReset,
        values,
        touched,
        errors,
        isValid,
        dirty,
      }) => (
        <Modal
          closable
          footer={null}
          onCancel={() => {
            onCancel();
            setshowinput(false);
            handleReset();
          }}
          open={isProfileOpen}
          width={400}
        >
          <div className="create-task-form-wrapper">
            <div className="profile-icon-parent">
              <UserAvatar
                name={
                  profileData?.user?.name ||
                  userData?.user?.name ||
                  userData?.name ||
                  userData?.username ||
                  "-"
                }
              />
            </div>
            <h1 className="profile-name">
              {profileData?.user?.name ||
                userData?.user?.name ||
                userData?.name ||
                userData?.username ||
                "-"}
            </h1>

            <Divider size="small" className="ant-divider" />

            <AntForm layout="vertical" form={form}>
              <label className="profile-label">Role</label>
              <p className="profile-data">
                {readableText(profileData?.user?.role || userData?.user?.role || userData?.role) || "-"}
              </p>
              <Divider size="small" className="ant-divider" />

                <ConditionalRendering
                condition={['EMPLOYEE', 'HOD' , 'SUPERVISOR'].includes(profileData?.role)}
                children={<>
                <label className="profile-label">Department</label>
              <p className="profile-data">
                {readableText(profileData?.user?.department?.title ||
                  userData?.user?.department?.title ||
                  userData?.department?.title ||
                  "-")}
              </p>
              <Divider size="small" className="ant-divider" />
              </>
            }
              />

              <label className="profile-label">Work Email</label>
              <p className="profile-data">
                {profileData?.user?.email ||
                  userData?.user?.email ||
                  userData?.email ||
                  "-"}
              </p>
              <Divider size="small" className="ant-divider" />


              {/* <>
                {showinput && (
                  <>
                    <h2 className="auth-title">Change Password</h2>

                    <AntForm.Item
                      label={<span className="form-label">New Password</span>}
                      validateStatus={
                        touched.password && errors.password ? "error" : ""
                      }
                      help={
                        touched.password &&
                        errors.password && (
                          <span className="form-error">{errors.password}</span>
                        )
                      }
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

                    <AntForm.Item
                      label={<span className="form-label">Confirm Password</span>}
                      validateStatus={
                        touched.confirmPassword && errors.confirmPassword
                          ? "error"
                          : ""
                      }
                      help={
                        touched.confirmPassword &&
                        errors.confirmPassword && (
                          <span className="form-error">
                            {errors.confirmPassword}
                          </span>
                        )
                      }
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

                    <div className="profile-btns margin-top_20">
                      <Button
                        className="profile-btn"
                        onClick={() => {
                          setshowinput(false);
                          handleSubmit({ values: initialValues });
                          handleReset();
                        }}
                        block
                      >
                        Cancel
                      </Button>
                      <Button
                        className="profile-btn"
                        onClick={handleSubmit}
                        type="primary"
                        block
                        loading={loading}
                        disabled={!isValid || !dirty || loading}
                      >
                        Update Password
                      </Button>
                    </div>
                  </>
                )}
              </> */}
              
              <ConditionalRendering
                condition={userData?.isActive && !userData?.isFirstLogin}
                children={
                  <>
                    {!showinput && (
                      <div className="profile-btns margin-top_20">
                        {/* <Button
                          className="profile-btn"
                          onClick={() => setshowinput(true)}
                          type="primary"
                          icon={<MdOutlineLock />}
                        >
                          Change Password
                        </Button> */}
                      </div>
                    )}
                  </>
                }
              />
            </AntForm>
          </div>
        </Modal>
      )}
    </Formik>
  );
};

export default Profile;