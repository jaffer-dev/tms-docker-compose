import { useEffect, useState } from "react";
import AuthRoutes from "./routes/Auth";
import ProtectedRoutes from "./routes/Protected";
import { useSelector, useDispatch } from "react-redux";
import { getProfile } from "./store/actions/Auth.action";
import Loader from "./components/loader/Loader";
import { PageWrapper } from "./container";
import "./App.css";
import "../src/pages/dashboard/Dashboard.css";
import  UpdateUserPersonalDetailsForm  from "./components/userPersonalDetailsModal/Index";
// import UserPersonalDetailsForm from "./components";

const renderAppRoutes = ({ isLoggedIn, isFilledPersonalDocs, loading, isOpen, setIsOpen }) => {
 
   if (loading) {
    return <Loader />;
  }

  if (!isLoggedIn) {
    return <AuthRoutes />;
  }

  if (isLoggedIn && !isFilledPersonalDocs) {
    return <UpdateUserPersonalDetailsForm loading={loading} setIsOpen={setIsOpen} isOpen={isOpen} />;
  }

  if (isLoggedIn && isFilledPersonalDocs) {
    return (
      <PageWrapper>
        <ProtectedRoutes />
      </PageWrapper>
    );
  }

  return <Loader />;
};

function App() {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false)

  const { isLoggedIn, loading, isFilledPersonalDocs } = useSelector(({ auth }) => ({
    isLoggedIn: auth?.isLoggedIn,
    loading: auth?.getProfileLoading,
    isFilledPersonalDocs: auth?.user?.isFilledPersonalDocs,
  }));

  useEffect(() => {
    if (isLoggedIn && !isFilledPersonalDocs) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isLoggedIn, isFilledPersonalDocs]);

  useEffect(() => {
    dispatch(getProfile());
  }, []);

  return renderAppRoutes({ isLoggedIn, isFilledPersonalDocs, loading, isOpen, setIsOpen });
} 

export default App;
