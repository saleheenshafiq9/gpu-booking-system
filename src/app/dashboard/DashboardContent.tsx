import { useState } from "react";
import { format, parseISO, isBefore } from "date-fns";
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

interface DashboardContentProps {
    gpu: GPU | null;
    refreshGPU: () => void;
}

export default function DashboardContent({ gpu, refreshGPU }: DashboardContentProps) {
    const [formData, setFormData] = useState({ name: "", startTime: "", endTime: "" });
    const [message, setMessage] = useState("");

    const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");

        if (!formData.name || !formData.startTime || !formData.endTime) {
            setMessage("Please fill in all fields");
            return;
        }

        try {
            const response = await axios.post("http://localhost:8000/book", {
                user: formData.name,
                start_time: new Date(formData.startTime).toISOString(),
                end_time: new Date(formData.endTime).toISOString(),
            });
            setMessage(response.data.status);
            refreshGPU(); // Refresh GPU data after booking
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.detail || "Booking failed. Please try again.");
            } else {
                setMessage("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
            <div className="w-full max-w-3xl bg-white shadow-2xl rounded-xl p-6">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">GPU Booking Dashboard</h1>
                {gpu ? (
                    <div className="p-6 bg-gray-100 shadow-md rounded-lg">
                        <h2 className="text-2xl font-semibold text-gray-800">{gpu.name}</h2>

                        <h3 className="mt-4 text-lg font-medium text-gray-700">Current Bookings:</h3>
                        {gpu.bookings.filter(booking => isBefore(new Date(), parseISO(booking.end_time))).length === 0 ? (
                            <p className="text-green-600 text-md font-medium mt-2">GPU is available</p>
                        ) : (
                            <ul className="list-disc pl-4 text-md text-red-500 space-y-1 mt-2">
                                {gpu.bookings.filter(booking => isBefore(new Date(), parseISO(booking.end_time))).map((booking: Booking, index: number) => (
                                    <li key={index}>
                                        <span className="font-semibold">{booking.user}</span>: {" "}
                                        {format(parseISO(booking.start_time), "PPp")} to {format(parseISO(booking.end_time), "PPp")}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <form onSubmit={handleBooking} className="mt-6 bg-white p-6 shadow-lg rounded-lg space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Book GPU</h3>

                            <input
                                type="text"
                                name="name"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="datetime-local"
                                name="startTime"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                            <input
                                type="datetime-local"
                                name="endTime"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />

                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                            >
                                Book GPU
                            </button>
                            {message && <p className="mt-4 text-sm text-gray-700 text-center">{message}</p>}
                        </form>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center">Loading GPU data...</p>
                )}
            </div>
        </div>
    );
}
