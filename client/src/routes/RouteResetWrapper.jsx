import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RouteResetWrapper = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      if (["/", "/signup", "/forgotpassword", "/"].includes(location.pathname)) {
        navigate("/", { replace: true });
      }
    } else {
      if (!["/", "/signup", "/forgotpassword"].includes(location.pathname)) {
        navigate("/", { replace: true }); // replace instead of push
      }
    }
  
    window.scrollTo(0, 0);
  }, [isLoggedIn, location.pathname]); 

  return children;
};

export default RouteResetWrapper;
