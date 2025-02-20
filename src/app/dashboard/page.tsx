"use client";

import { useEffect, useState } from "react";
import { useGPUStore } from "@/store/gpuStore";
import DashboardContent from "./DashboardContent";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const [isClient, setIsClient] = useState(false);
    const { gpu, fetchGPU } = useGPUStore();
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
        fetchGPU();
    }, [fetchGPU]);

    const handleLogout = () => {
        // Clear user session (modify based on auth implementation)
        localStorage.removeItem("authToken");
        router.push("/login");
    };

    if (!isClient) {
        return <div className="h-screen flex justify-center items-center text-gray-400 text-lg">Loading GPU Data...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center p-4 bg-gray-900 text-white shadow-md">
                <h1 className="text-xl font-bold">GPU Booking Dashboard</h1>
                <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition">Logout</button>
            </div>
            <DashboardContent gpu={gpu} refreshGPU={fetchGPU} />
        </div>
    );
}