import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getService } from "@/api/service";
import { 
  ArrowLeft, 
  Mic2, 
  Music, 
  User, 
  Calendar, 
  ChevronRight,
  UserCheck
} from "lucide-react";

// Reuse the same DigitDisplay for consistency
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

export default function ServiceMinister() {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await getService(serviceId);
        setService(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  if (loading) return <div className="p-8 text-gray-500 animate-pulse font-medium">Loading service profile...</div>;
  if (!service) return <div className="p-8 text-red-500">Service not found.</div>;

  const dateObj = new Date(service.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  const lead = service.ministers.find(m => m.role === "lead");
  const backups = service.ministers
    .filter(m => m.role === "backup")
    .sort((a, b) => a.voice.localeCompare(b.voice));

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 max-w-4xl mx-auto space-y-10">
      
      {/* Enhanced Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-all group"
      >
        <div className="p-2 bg-white rounded-lg border border-gray-200 group-hover:border-gray-900 shadow-sm">
          <ArrowLeft className="h-4 w-4" />
        </div>
        Back to Dashboard
      </Link>

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-gray-800 text-[10px] text-white font-bold rounded uppercase tracking-tighter">
              {service.serviceType}
            </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight capitalize">
            Service Roster
          </h1>
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <Calendar className="h-4 w-4" />
            <p>{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ministers No</span>
          <DigitDisplay value={service.ministers.length} />
        </div>
      </header>

      {/* Main Roster Section */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Lead Minister - Featured Style */}
        {lead && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <UserCheck className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Lead Minister</h3>
            </div>

            <div className="relative overflow-hidden bg-gray-900 rounded-2xl p-6 text-white shadow-lg border border-gray-800">
              {/* Decorative Background Icon */}
              <Mic2 className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 rotate-12" />
              
              <div className="relative flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight">
                    {lead.ministerId.fullname}
                  </p>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Music className="h-4 w-4" />
                    <span className="capitalize text-sm font-medium">{lead.voice}</span>
                  </div>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest">Main Vocal</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Backup Section */}
        {backups.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <User className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Backup Ministers</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backups.map((m) => (
                <div
                  key={m._id}
                  className="group flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-900 hover:shadow-md transition-all cursor-default"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-none mb-1">
                        {m.ministerId.fullname}
                      </p>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-tighter">
                        {m.voice}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

    </div>
  );
}