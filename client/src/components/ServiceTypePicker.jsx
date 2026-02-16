import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSemester } from "@/context/semesterContext";
import { useServiceDraft } from "@/context/serviceDraftContext";
import { toast } from "sonner";
import { Calendar, ChevronRight, Sun, Moon, ArrowLeft } from "lucide-react";

export default function ServiceTypePicker() {
  const navigate = useNavigate();
  const { semester, loading } = useSemester();
  const { updateDraft } = useServiceDraft();

  const [serviceType, setServiceType] = useState("");
  const [date, setDate] = useState("");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center gap-2">
        <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
        <div className="h-4 w-48 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );

  if (!semester) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <p className="text-red-500 font-bold">No active semester found.</p>
    </div>
  );

  const handleNext = () => {
    if (!serviceType || !date) {
      toast.error("Please select service type and date");
      return;
    }

    // Optional extra validation safeguard
    if (date < semester.startDate?.split("T")[0] || date > semester.endDate?.split("T")[0]) {
      toast.error("Date must be within active semester range");
      return;
    }

    updateDraft({ date, serviceType });
    navigate("/createService");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </button>

        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-tighter rounded">Step 01</span>
            <div className="h-[1px] w-8 bg-gray-300"></div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Setup</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
            Service Details
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            When and what type of service are we scheduling?
          </p>
        </header>

        <div className="space-y-6">
          
          {/* Service Type Selection Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: "sunday", icon: Sun, label: "Sunday Service" },
              { id: "saturday", icon: Moon, label: "Saturday Service" }
            ].map((type) => {
              const Icon = type.icon;
              const isActive = serviceType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setServiceType(type.id)}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${
                    isActive 
                    ? "border-gray-900 bg-white shadow-xl shadow-gray-200/50 scale-[1.02]" 
                    : "border-transparent bg-gray-100 hover:bg-gray-200/50 text-gray-500"
                  }`}
                >
                  <Icon className={`h-8 w-8 mb-3 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
                  <span className={`text-xs font-black uppercase tracking-widest ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Date Input Group */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              <Calendar className="h-4 w-4" />
              Service Date
            </label>

            <input
              type="date"
              value={date}
              min={semester.startDate?.split("T")[0]}
              max={semester.endDate?.split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all cursor-pointer"
            />

            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                Available range for <span className="text-gray-900 font-bold">{semester.name}</span>:
                <br />
                {new Date(semester.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })} — {new Date(semester.endDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleNext}
            className="group w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Continue to Ministers
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}