import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import "./VerifyMicrosoft.css";
import { useDispatch } from "react-redux";
import { verifyMicrosoft } from "../../../store/actions/Auth.action";

export default function VerifyMicrosoft() {
    const { id } = useParams();
    const { instance } = useMsal();
    const dispatch = useDispatch()
    const navigate = useNavigate()


    const callback = () => {
        navigate('/')
    }

    useEffect(() => {
        if (!instance) return;

        const verifyUser = async () => {
            try {
                const response = await instance.loginPopup({
                    scopes: ["openid", "profile", "email", "User.Read"],
                });

                const email = response.account?.username;
                const token = response.idToken;
                console.log(token)
                if (!email) throw new Error("No email returned from Microsoft");


                if (!email || !token) throw new Error("Token or email missing");
                // console.log(id, email, token)
                dispatch(verifyMicrosoft({ id, email, token }, callback));
            } catch (err) {
                console.error("Microsoft verification error:", err);
                alert(`Verification failed: ${err.errorCode || err.message}`);
            }
        };

        const timer = setTimeout(verifyUser, 300);
        return () => clearTimeout(timer);
    }, [id, instance]);

    return (
        <div className="verify-container">
            {/* Microsoft logo with floating + glow animation */}
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                alt="Microsoft Logo"
                className="ms-logo"
            />

            <span className="verify-text">
                Verifying your Microsoft account
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
            </span>
        </div>
    );
}