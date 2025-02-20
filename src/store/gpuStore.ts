import { create } from "zustand";
import axios from "axios";

interface Booking {
    user: string;
    start_time: string;
    end_time: string;
}

interface GPU {
    gpu_id: string;
    name: string;
    bookings: Booking[];
}

interface GPUStore {
    gpu: GPU | null;
    fetchGPU: () => Promise<void>;
    bookGPU: (user: string, start_time: string, end_time: string) => Promise<string>;
}

export const useGPUStore = create<GPUStore>((set) => ({
    gpu: null,

    fetchGPU: async () => {
        if (typeof window === "undefined") return; // ✅ Prevents SSR execution
        try {
            const response = await axios.get("http://localhost:8000/gpu");
            set({ gpu: response.data });
        } catch (error) {
            console.error("Failed to fetch GPU data:", error);
        }
    },

    bookGPU: async (user, start_time, end_time) => {
        if (typeof window === "undefined") return "Booking failed"; // ✅ Prevents SSR execution
        try {
            const response = await axios.post("http://localhost:8000/book", {
                user,
                start_time,
                end_time,
            });

            set((state) => ({
                gpu: state.gpu
                    ? {
                          ...state.gpu,
                          bookings: [...state.gpu.bookings, { user, start_time, end_time }],
                      }
                    : null,
            }));

            return response.data.status;
        } catch (error) {
            console.error("Booking failed:", error);
            return "Booking failed";
        }
    },
}));
