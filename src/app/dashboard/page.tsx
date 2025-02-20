"use client";

import { useEffect, useState } from "react";
import { useGPUStore } from "@/store/gpuStore";
import DashboardContent from "./DashboardContent";

export default function Dashboard() {
    const [isClient, setIsClient] = useState(false);
    const { gpu, fetchGPU } = useGPUStore();

    useEffect(() => {
        setIsClient(true);
        fetchGPU();
    }, [fetchGPU]);

    if (!isClient) {
        return <div className="h-screen flex justify-center items-center text-gray-400 text-lg">Loading GPU Data...</div>;
    }

    return <DashboardContent gpu={gpu} refreshGPU={fetchGPU} />;
}
