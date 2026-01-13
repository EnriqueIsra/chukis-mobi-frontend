import { useState } from "react";
import { login } from "../services/authService";

export const LoginPage = ({ onLogin }) => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await login(username, password);
            onLogin(response.data);
        } catch (err) {
            console.error(err);
            setError("Usuario o contraseña incorrectos");
        }
    };

    return (
        <div className="container vh-100 d-flex justify-content-center align-items-center">
            <div className="card p-4 shadow" style={{ width: "350px" }}>

                <img
                    src="https://cdn-icons-png.flaticon.com/512/5087/5087579.png"
                    alt="login"
                    className="img-fluid mb-3"
                />

                <h4 className="text-center mb-3">Iniciar sesión</h4>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        className="form-control mb-3"
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        className="form-control mb-3"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button className="btn btn-primary w-100">
                        Iniciar sesión
                    </button>
                </form>
            </div>
        </div>
    );
};
