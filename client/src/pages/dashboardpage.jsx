import { useEffect,useState } from "react";
import { useSemester } from "@/context/semesterContext";
import {Cross} from "lucide-react"
import { getAllServices } from "@/api/service";
import PreviousServicesCard from "@/components/PreviousServicesCard"
import {Link} from "react-router-dom";

// Reusable component for that "monospace block" look
const DigitDisplay = ({ value, label }) => (
  <div className="flex items-center gap-3">
    <div className="flex gap-1">
      {String(value).split("").map((digit, i) => (
        <span
          key={i}
          className="inline-flex items-center justify-center rounded-md bg-gray-800 font-mono text-xl md:text-2xl font-bold px-2 py-1 text-white shadow-sm border border-gray-600"
        >
          {digit}
        </span>
      ))}
    </div>
    {label && <span className="text-gray-600 text-lg font-medium tracking-tight">{label}</span>}
  </div>
);


export default function DashboardPage() {
  const { semester, loading } = useSemester();
  //states for services
    const [services,setServices] = useState([]);
    const [loadingServices,setLoadingServices] = useState(false);

    useEffect(() => {
        const fetchServices = async() => {
            try{
                const res = await getAllServices();
                const sorted = res.data.sort(
                    (a,b) => new Date(b.date) - new Date(a.date)
                );
                setServices(sorted.slice(0,3));
            } catch(err) {
                console.error(err);
            } finally {
                setLoadingServices(false);
            }
        };
        fetchServices();
    },[]);

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading semester data...</div>;
  if (!semester) return <div className="p-8 text-red-500 font-medium">No Active Semesters found</div>;

  const start = new Date(semester.startDate);
  const today = new Date();
  const totalWeeks = semester.totalWeeks;

  const rawWeek = Math.ceil((today - start) / (1000 * 60 * 60 * 24 * 7));
  const currentWeek = Math.min(totalWeeks, Math.max(1, rawWeek));
  const weeksRemaining = totalWeeks - currentWeek;
  const progressPercent = (currentWeek / totalWeeks) * 100;

  return (
    <div className="min-h-screen max-w-4xl px-4 py-6 space-y-8">
      {/* 1. Header Section */}
      <section className="space-y-1">
        <h1 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Active Semester</h1>
        <h2 className="text-3xl font-bold text-gray-900">{semester.name}</h2>
      </section>

      {/* 2. Main Stats Section */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        
        {/* Weeks Remaining Blocks */}
        <div>
          {weeksRemaining > 0 ? (
            <DigitDisplay value={weeksRemaining} label="Weeks Remaining" />
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold uppercase">
              Semester Completed
            </span>
          )}
        </div>

        {/* Progress Bar Area */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
             {/* Progress Week Blocks */}
             <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Currently in</span>
                <DigitDisplay value={currentWeek} />
                <span className="text-sm font-medium text-gray-500">of {totalWeeks}</span>
             </div>
             <span className="text-sm font-bold text-gray-700">{Math.round(progressPercent)}%</span>
          </div>

          <div className="relative w-full bg-gray-100 h-4 rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full bg-gradient-to-r from-gray-700 to-gray-900 transition-all duration-700 ease-out shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      <h1 className="text-xl mt-4 tracking-widest  font-semibold text-gray-400 uppercase ">Create Service</h1>
      {/*add service section*/}
      <Link
      to="/servicetypepicker"
      className="group mt-6 block w-full md:max-w-xs aspect-square md:aspect-video lg:aspect-square"
      >
      <section className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl shadow-sm border border-2 border-dashed border-gray-200 transition-all duration-200 hover:border-gray-800 hover:bg-gray-100 p-6">
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-white">
            <Cross className="h-15 w-15 text-gray-500 group-hover:text-gray-900"/>
        </div>
        <span className="mt-4 text-sm font-semibold text-gray-500 group-hover:text-gray-900 tracking-wide uppercase">
          Create Service
        </span>
      </section>
       </Link>

       {/*card stats*/}
       <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl tracking-widest font-semibold text-gray-400 uppercase">
                Recent Services
            </h3>
          </div>

          {loadingServices ? (
            <div className="text-gray-500 animate-pulse">
                Loading services...
            </div>
          ): services.length === 0 ? (
            <div className="text-gray-500">
                No services recorded yet
            </div>
          ): (
            <div className="space-y-4">
                {services.map((service) => (
                    <PreviousServicesCard key={service._id} service={service}/>
                ))}
            </div>
          )}
       </section>
    </div>
  );
}