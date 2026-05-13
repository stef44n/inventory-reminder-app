import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            await API.post("/auth/register", {
                email,
                password,
            });

            alert("Registered! Please login.");
            navigate("/");
        } catch (error) {
            console.error(error);
            alert("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Register</h2>

                <p className="auth-subtitle">Create a new account</p>

                <form onSubmit={handleRegister} className="auth-form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        className="button-primary auth-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="button-loader"></span>
                        ) : (
                            "Register"
                        )}
                    </button>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/">Login</Link>
                </p>
            </div>
        </div>
    );
}
