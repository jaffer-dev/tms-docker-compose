
import { Route, Routes } from 'react-router-dom';
import { Login, ForgotPasswordModal, ChangePassword, VerifyMicrosoft, MicrosoftLogin } from '../pages/auth';

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MicrosoftLogin />} />
      <Route path="/forgotpassword" element={<ForgotPasswordModal />} />
      <Route path="/verify-microsoft/:id" element={<VerifyMicrosoft />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="*" element={<MicrosoftLogin />} />
    </Routes>
  );
};

export default AuthRoutes;