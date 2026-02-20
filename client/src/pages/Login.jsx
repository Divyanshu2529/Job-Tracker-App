import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import bg from "../assets/background.jpg";

export default function Login() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setErr("");
        try {
            const res = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            nav("/");
        } catch (error) {
            setErr(error?.response?.data?.message || "Login failed");
        }
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center flex items-center justify-center text-white"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-black/40 border border-white/20 p-6 rounded-xl shadow-2xl shadow-black/40">
                <h1 className="text-2xl font-semibold mb-4">Login</h1>

                {err && <div className="mb-3 text-sm bg-red-950/40 border border-red-900 p-2 rounded">{err}</div>}

                <label className="text-sm">Email</label>
                <input className="w-full p-2 rounded bg-gray-950 border border-gray-800 mb-3" value={email} onChange={(e) => setEmail(e.target.value)} />

                <label className="text-sm">Password</label>
                <input type="password" className="w-full p-2 rounded bg-gray-950 border border-gray-800 mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />

                <button className="w-full p-2 rounded bg-white text-black font-medium">Login</button>

                <p className="text-sm text-gray-300 mt-3">
                    No account? <Link className="underline" to="/signup">Sign up</Link>
                </p>
            </form>
        </div>
    );
}