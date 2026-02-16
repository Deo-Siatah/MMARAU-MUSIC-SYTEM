import { Link } from "react-router-dom";
import { ChevronRight, Users, CheckCircle2, CalendarClock, PlayCircle } from "lucide-react";

const DigitDisplay = ({ value }) => (
  <div className="flex gap-1">
    {String(value).padStart(2, '0').split("").map((digit, i) => (
      <span
        key={i}
        className="inline-flex items-center justify-center rounded bg-gray-900 font-mono text-xs font-bold px-1.5 py-0.5 text-white border border-gray-700 shadow-sm"
      >
        {digit}
      </span>
    ))}
  </div>
);

export default function ServiceCard({ service }) {
  const serviceDate = new Date(service.date);
  const today = new Date();
  
  // Reset hours to compare just the calendar days
  const isToday = serviceDate.toDateString() === today.toDateString();
  const isPast = serviceDate < today && !isToday;

  const month = serviceDate.toLocaleString('default', { month: 'short' });
  const day = serviceDate.getDate();

  // Dynamic Status Configuration
  const statusConfig = isPast 
    ? { label: "Completed", color: "text-gray-400", bg: "bg-gray-100", icon: <CheckCircle2 className="h-4 w-4" /> }
    : isToday 
    ? { label: "Live Today", color: "text-emerald-600", bg: "bg-emerald-50", icon: <PlayCircle className="h-4 w-4" /> }
    : { label: "Scheduled", color: "text-blue-600", bg: "bg-blue-50", icon: <CalendarClock className="h-4 w-4" /> };

  return (
    <Link to={`/service/getservice/${service._id}`} className="block group">
      <div className={`relative bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-400 flex flex-col h-full ${isPast ? 'opacity-80' : 'opacity-100'}`}>
        
        {/* Dynamic Status Tag */}
        <div className="mb-4 flex justify-between items-center">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border ${statusConfig.bg} ${statusConfig.color} border-current/20`}>
            {statusConfig.icon}
            {statusConfig.label}
          </span>
          
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {service.serviceType || "Service"}
          </span>
        </div>

        {/* Date & Title Section */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className={`text-xl font-bold transition-colors ${isPast ? 'text-gray-500' : 'text-gray-900 group-hover:text-gray-700'}`}>
              {month} {day}, {serviceDate.getFullYear()}
            </h3>
            <p className="text-sm text-gray-400 font-medium">
                {isPast ? "Archive Record" : "Upcoming Event"}
            </p>
          </div>
          
          <div className="text-gray-300 group-hover:text-gray-900 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>

        {/* Bottom Stats Row */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-50 rounded-md">
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <DigitDisplay value={service.ministers?.length || 0} />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Ministers
            </span>
          </div>

          {/* Activity Indicator Dot */}
          <div className={`h-2 w-2 rounded-full ${isPast ? 'bg-gray-300' : 'bg-emerald-500 animate-pulse'}`} />
        </div>

      </div>
    </Link>
  );
}