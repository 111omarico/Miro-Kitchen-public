import { useState, useRef, useEffect } from "react";


export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [countdown, setCountdown] = useState(5);
    const [loading, setLoading] = useState(false);

    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setCountdown(5);

        if (timerRef.current) clearInterval(timerRef.current);

        if (!email.trim() || !password.trim()) {
            setError("Email and password are required");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email_address: email.trim(),
                    password: password.trim(),
                }),
            });

            let data;
            try {
                data = await res.json();
            } catch {
                setError("Unexpected server response");
                return;
            }

            if (!res.ok || !data.success) {
                setError(data.error || "Invalid email or password");
                return;
            }

            console.log("Logged in:", data.user);

            const me = await fetch("http://localhost:5000/api/me", {
                credentials: "include",
            });
            const meData = await me.json();
            console.log("AFTER LOGIN /api/me:", meData);

            setSuccess("Login successful! Redirecting in 5 seconds...");
            localStorage.setItem("login", Date.now());

            let timeLeft = 5;
            timerRef.current = setInterval(() => {
                timeLeft -= 1;
                setCountdown(timeLeft);

                if (timeLeft === 0) {
                    clearInterval(timerRef.current);
                    window.location.href = "/";
                }
            }, 1000);

        } catch {
            setError("Server error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>

            <title>Log In Now! - Miro Kitchen</title>

            <div className="signup-login-header">
                <h1>Log in</h1>
                <svg xmlns="http://www.w3.org/2000/svg" width="97" height="68" viewBox="0 0 97 68" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.75 0C6.15609 0 0 5.48451 0 12.25V55.125C0 61.8905 6.15609 67.375 13.75 67.375H82.5C90.0939 67.375 96.25 61.8905 96.25 55.125V12.25C96.25 5.48451 90.0939 0 82.5 0H13.75ZM32.6562 12.25C26.9608 12.25 22.3438 16.3634 22.3438 21.4375C22.3438 26.5116 26.9608 30.625 32.6562 30.625C38.3517 30.625 42.9688 26.5116 42.9688 21.4375C42.9688 16.3634 38.3517 12.25 32.6562 12.25ZM14.9046 47.7863C17.5583 41.3498 24.4999 36.75 32.656 36.75C40.8122 36.75 47.7538 41.3498 50.4075 47.7863C50.9993 49.2218 50.3119 50.8262 48.7969 51.5451C43.9807 53.8309 38.4829 55.125 32.656 55.125C26.8292 55.125 21.3314 53.8309 16.5152 51.5451C15.0002 50.8262 14.3128 49.2218 14.9046 47.7863ZM61.875 18.375C59.9765 18.375 58.4375 19.7461 58.4375 21.4375C58.4375 23.1289 59.9765 24.5 61.875 24.5H79.0625C80.961 24.5 82.5 23.1289 82.5 21.4375C82.5 19.7461 80.961 18.375 79.0625 18.375H61.875ZM58.4375 33.6875C58.4375 31.9961 59.9765 30.625 61.875 30.625H79.0625C80.961 30.625 82.5 31.9961 82.5 33.6875C82.5 35.3789 80.961 36.75 79.0625 36.75H61.875C59.9765 36.75 58.4375 35.3789 58.4375 33.6875ZM61.875 42.875C59.9765 42.875 58.4375 44.2461 58.4375 45.9375C58.4375 47.6289 59.9765 49 61.875 49H79.0625C80.961 49 82.5 47.6289 82.5 45.9375C82.5 44.2461 80.961 42.875 79.0625 42.875H61.875Z" fill="#0F172A" />
                </svg>
            </div>

            <div className="signup-login-page">
                <div className="signup-login-card">
                    <form onSubmit={loading ? undefined : handleSubmit}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            placeholder="Enter the email address here"
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError("");
                            }}
                        />

                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            placeholder="Enter the password here"
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError("");
                            }}
                        />

                        <button type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
                        {success && (
                            <p style={{ color: "green", marginTop: "8px" }}>
                                {success} ({countdown})
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
}
