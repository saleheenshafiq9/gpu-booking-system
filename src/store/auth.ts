import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

interface DecodedToken {
    sub: string;
    exp: number;
    iat: number;
}

interface AuthState {
    token: string | null;
    user: string | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    login: async (username, password) => {
        try {
            const response = await axios.post("http://localhost:8000/login", { username, password });
            const token = response.data.access_token;
            const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
            set({ token, user: decoded.sub });
            localStorage.setItem("token", token);
            return true;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    },
    logout: () => {
        set({ token: null, user: null });
        localStorage.removeItem("token");
    }
}));
