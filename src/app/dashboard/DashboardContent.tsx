import { useState } from "react";
import { format, parseISO, isBefore } from "date-fns";
import { Calendar, Clock, User } from "lucide-react";

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

interface FormData {
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

export default function DashboardContent({ gpu, refreshGPU }: DashboardContentProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: ""
  });
  const [message, setMessage] = useState<string>("");

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!formData.name || !formData.startDate || !formData.startTime || 
        !formData.endDate || !formData.endTime) {
      setMessage("Please fill in all fields");
      return;
    }

    try {
      const startDateTime = `${formData.startDate}T${formData.startTime}`;
      const endDateTime = `${formData.endDate}T${formData.endTime}`;

      const response = await fetch("http://localhost:8000/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: formData.name,
          start_time: new Date(startDateTime).toISOString(),
          end_time: new Date(endDateTime).toISOString(),
        }),
      });
      const data = await response.json();
      setMessage(data.status);
      refreshGPU();
    } catch {
      setMessage("Booking failed. Please try again.");
    }
  };

  const activeBookings = gpu?.bookings.filter((booking: Booking) => 
    isBefore(new Date(), parseISO(booking.end_time))
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header remains the same */}
          <div className="p-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              GPU Resource Manager
            </h1>
            {gpu && (
              <p className="text-gray-500 mt-2 text-lg">
                Managing: {gpu.name}
              </p>
            )}
          </div>

          <div className="px-8 pb-8 space-y-8">
            {!gpu ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                {/* Bookings section remains the same */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Current Bookings
                  </h3>
                  
                  {activeBookings.length === 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">
                        GPU is currently available for booking
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {activeBookings.map((booking: Booking, index: number) => (
                        <div
                          key={index}
                          className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <User className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-purple-900">
                              {booking.user}
                            </p>
                            <p className="text-sm text-purple-600">
                              {format(parseISO(booking.start_time), "PPp")} - {format(parseISO(booking.end_time), "PPp")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enhanced Booking Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Book GPU Time
                  </h3>
                  
                  <form onSubmit={handleBooking} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Start Date/Time Section */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Start Date & Time</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 
                                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                                     transition-colors bg-white"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          />
                        </div>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="time"
                            className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 
                                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                                     transition-colors bg-white"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* End Date/Time Section */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">End Date & Time</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 
                                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                                     transition-colors bg-white"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          />
                        </div>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="time"
                            className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 
                                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                                     transition-colors bg-white"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg 
                               hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-[1.02] active:scale-[0.98] 
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Book GPU
                    </button>

                    {message && (
                      <div className={`p-4 rounded-lg ${
                        message.includes("failed") 
                          ? "bg-red-50 border-red-200 text-red-800" 
                          : "bg-blue-50 border-blue-200 text-blue-800"
                      }`}>
                        {message}
                      </div>
                    )}
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}