import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                setUserData(null);
                setIsAuthenticated(false);
            }
        };

        window.addEventListener("storage", checkAuth);
        return () => window.removeEventListener("storage", checkAuth);
    }, []);

    const login = (user, token) => {
        setUserData(user);
        setIsAuthenticated(true);
        localStorage.setItem("userData", JSON.stringify(user));
        localStorage.setItem("auth_token", token);
    };

    const logout = () => {
        setUserData(null);
        setIsAuthenticated(false);
        localStorage.removeItem("userData");
        localStorage.removeItem("auth_token");
    };

    return (
        <AuthContext.Provider value={{ userData, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
