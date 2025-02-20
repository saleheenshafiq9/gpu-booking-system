"use client";

import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { user, token, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!token) router.push("/login");
    }, [token, router]);

    return (
        <div className="p-6">
            <h1 className="text-2xl">Welcome, {user}!</h1>
            <button onClick={logout} className="mt-4 p-2 bg-red-500 text-white rounded-lg">
                Logout
            </button>
        </div>
    );
}
