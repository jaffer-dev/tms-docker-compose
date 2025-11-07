import { Input, Form as AntForm, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { verifyMicrosoftLogin } from "../../../store/actions/Auth.action";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { BsMicrosoftTeams } from "react-icons/bs";
import logo from '../../../assets/Logo.png'
import "../Auth.css";

const MicrosoftLogin = () => {
  const { instance } = useMsal();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { msLoginLoading } = useSelector(({ auth }) => ({
    msLoginLoading: auth?.verifyMicrosoftLoginLoading,
  }));

  const verificationCallback = () => {
    navigate('/')
  }

  const loginWithMicrosoft = async () => {
    try {
      const loginResponse = await instance.loginPopup({
        scopes: ["openid", "profile", "email"],
      });
      const idToken = loginResponse.idToken;
      const email = loginResponse.account.username;

      dispatch(verifyMicrosoftLogin({ idToken, email } , verificationCallback));
      navigate("/");
    } catch (err) {
      console.error("MS Login Error:", err);
    }
  };

  return (
    <div className="auth-container auth-ms">
      <div className="auth-card">
        <div className="auth-header">
          <img className="auth-ms-logo" src={logo} alt="" />
          <h1 className="auth-title">Login To TMS</h1>
          <p className="auth-para">Sign in to your account and manage your task effortlessly!</p>
        </div>

        <AntForm layout="vertical">
          <Button
            block
            icon={<BsMicrosoftTeams />}
            className="auth-btn auth-btn-dark"
            loading={msLoginLoading}
            disabled={msLoginLoading}
            onClick={loginWithMicrosoft}
          >
            Login With Microsoft
          </Button>
        </AntForm>
      </div>
    </div>
  );
};

export default MicrosoftLogin;
