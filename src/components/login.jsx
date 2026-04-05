import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function LoginForm({ onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError("Username dan Password wajib diisi!");
            Swal.fire({
                icon: "warning",
                title: "Data belum lengkap",
                text: "Username dan Password wajib diisi!",
            });
            return;
        }

        setError("");
        setLoading(true);

        Swal.fire({
            title: "Memproses...",
            text: "Sedang melakukan login",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const response = await axios.post(
                "http://localhost:4321/v1/login",
                { username, password },
                { withCredentials: true }
            );

            const userData = response.data;

            Swal.fire({
                icon: "success",
                title: "Login Berhasil",
                text: "Selamat datang!",
                timer: 1500,
                showConfirmButton: false,
            });

            onLoginSuccess(userData);
        } catch (err) {
            const message = err.response?.data?.message || "Login gagal, coba lagi.";
            setError(message);

            Swal.fire({
                icon: "error",
                title: "Login Gagal",
                text: message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">
                    Login
                </h2>

                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                            Username
                        </label>
                        <input
                            type="text"
                            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
                            placeholder="Masukkan username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                            Password
                        </label>
                        <input
                            type="password"
                            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full px-4 py-2 rounded-lg text-white font-semibold transition 
                        ${username && password && !loading
                                ? "bg-indigo-600 hover:bg-indigo-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                        disabled={!username || !password || loading}
                    >
                        {loading ? "Memproses..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}
