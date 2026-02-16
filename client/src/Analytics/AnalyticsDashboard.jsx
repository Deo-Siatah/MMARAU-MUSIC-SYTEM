import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend,LabelList
} from 'recharts';
import { 
  Users, PieChart as PieIcon, Award, Loader2, TrendingUp, 
  Medal, Activity, ChevronRight, ArrowLeft, Search, Calendar 
} from "lucide-react";
import { 
  totalMinisters, totalByGender, rankAll, rankByGender, ministerStats,getSemesterCount
} from "@/api/analytics"; 
import { useSemester } from "@/context/semesterContext";

const COLORS = {
  primary: "#111827",
  gender: { male: "#3b82f6", female: "#ec4899" }
};

export default function AnalyticsTab() {
  // Navigation State
  const [currentView, setCurrentView] = useState("hub"); 
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  // Filtering & Selection State
  const { semester, loading: semesterLoading } = useSemester();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [semesters, setSemesters] = useState([{ _id: "sem1", name: "Semester 1 2026" }]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMinister, setSelectedMinister] = useState(null); 
  const [statsLoading, setStatsLoading] = useState(false);
  const [serviceCount, setServiceCount] = useState(0);
  
  // Data State
  const [totals, setTotals] = useState(0);
  const [genderData, setGenderData] = useState([]);
  const [rankingData, setRankingData] = useState([]); 
  const [detailedStats, setDetailedStats] = useState([]); 
  const [genderRankingData, setGenderRankingData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (semester?._id) {
        setSelectedSemester(semester._id)
    }
  },[semester])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [totRes, genRes, rankRes, genderRankRes] = await Promise.all([
          totalMinisters(),
          totalByGender(), 
          rankAll(),
          rankByGender()
        ]);
        
        setTotals(totRes?.data?.total || 0);
        if (genRes?.data) {
          setGenderData(genRes.data.map(item => ({
            name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : "Unknown",
            value: item.total || 0
          })));
        }
        if (rankRes?.data) setRankingData(rankRes.data);
        if (genderRankRes?.data) setGenderRankingData(genderRankRes.data);
      } catch (error) {
        console.error("Analytics Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentView === 'minister-stats' && selectedSemester) {
      const fetchDetailedStats = async () => {
        setStatsLoading(true);
        try {
          const res = await ministerStats(selectedSemester);
          if (res?.data) {
            setDetailedStats(res.data.map(m => ({
              ...m,
              leadCount: m.leadCount || 0,
              backupCount: m.backupCount || 0,
              serviceDates: m.serviceDates || []
            })));
          }
        } catch (error) {
          console.error("Detailed Stats Error:", error);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchDetailedStats();
    }
  }, [selectedSemester, currentView]);

  useEffect(() => {
  const fetchServiceCount = async () => {
    if (!semester?._id) return;
    
    try {
      // Calling your API function with the current semester ID
      const res = await getSemesterCount(semester._id);
      
      setServiceCount(res?.data?.total || 0);
    } catch (error) {
      console.error("Error fetching service count:", error);
      setServiceCount(0); // Reset on error
    }
  };

  fetchServiceCount();
}, [semester?._id]); 

  const getGenderGroup = (target) => {
    const group = genderRankingData.find(g => g._id && g._id.toLowerCase() === target);
    return group ? group.ministers : [];
  };

  const allRankedMinisters = genderRankingData.flatMap(g => g.ministers);
  const maxServicesGlobal = allRankedMinisters.length > 0 ? Math.max(...allRankedMinisters.map(m => m.totalServices)) : 1;

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-gray-200" />
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Gathering Insights...</p>
    </div>
  );

  const ministersToDisplay =
    currentView === "minister-stats" && selectedSemester
      ? detailedStats
      : rankingData;

  return (
    <div className="bg-gray-100">
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard title="Total Ministers" value={totals} icon={Users} color="bg-gray-900" />
        <KPICard title="Total Services " value={serviceCount} icon={Activity} color="bg-indigo-600" 
  subtitle={semester?.name || "Selected Semester"} />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-80 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 mb-4">Analytics Menu</p>
          <NavButton active={currentView === 'overall'} onClick={() => { setCurrentView('overall'); setSelectedMinister(null); }} icon={Award} label="Ministerial Engagement" />
          <NavButton active={currentView === 'minister-stats'} onClick={() => { setCurrentView('minister-stats'); setSelectedMinister(null); }} icon={Search} label="Minister Insights" />
          <NavButton active={currentView === 'gender-rank'} onClick={() => { setCurrentView('gender-rank'); setSelectedMinister(null); }} icon={Medal} label="Ministers by Gender" />
          <NavButton active={currentView === 'diversity'} onClick={() => { setCurrentView('diversity'); setSelectedMinister(null); }} icon={PieIcon} label="Ministers Diversity" />
        </div>

        <div className="flex-1 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[550px] relative">
          {currentView !== 'hub' && (
            <button onClick={() => { setCurrentView('hub'); setSelectedMinister(null); }} className="absolute top-8 right-8 flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 transition-colors z-10">
              <ArrowLeft size={14} /> Back to Hub
            </button>
          )}

          {currentView === 'hub' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <Activity size={48} />
              <p className="font-black uppercase tracking-tighter text-xl">Select a statistic to view details</p>
            </div>
          )}

          {/* 1. ENGAGEMENT VIEW */}
{currentView === 'overall' && (
  <div className="animate-in slide-in-from-right-4 duration-500">
    <div className="mb-8">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">Ministerial Engagement</h2>
      <p className="text-sm text-gray-500 font-medium">Visualizing commitment and participation in services</p>
    </div>
    <div className="w-full" style={{ height: Math.max(400, visibleCount * 45) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={rankingData.slice(0, visibleCount)} 
          layout="vertical"
          margin={{ right: 40 }} // Added margin to ensure numbers don't get cut off
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={140} 
            tick={{ fontSize: 11, fontWeight: 800 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip cursor={{ fill: '#f9fafb' }} />
          <Bar 
            dataKey="totalServices" 
            name="Services" 
            fill="#111827" 
            radius={[0, 4, 4, 0]} 
            barSize={20}
          >
            {/* Added LabelList to show the number at the end of the bar */}
            <LabelList 
              dataKey="totalServices" 
              position="right" 
              style={{ fontSize: '11px', fontWeight: '900', fill: '#111827' }} 
              offset={10}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    </div>
          )}

          {currentView === 'minister-stats' && (
            <div className="animate-in slide-in-from-right-4 duration-500 h-full">
              {!selectedMinister ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">Minister Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="relative">
                        <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black uppercase appearance-none focus:ring-2 focus:ring-gray-900 outline-none">
                          <option value="">Select Semester</option>
                          {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                      <div className="relative">
                        <input type="text" placeholder="SEARCH MINISTER..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black uppercase focus:ring-2 focus:ring-gray-900 outline-none" />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                    </div>
                  </div>

                  {statsLoading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gray-200" size={32} /></div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {ministersToDisplay
                        .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .slice(0, visibleCount)
                        .map((m,index) => (
                          <div key={`${m._id ?? m.name}-${index}`} onClick={ () => setSelectedMinister(m)} className="p-5 border border-gray-100 rounded-[2rem] hover:border-gray-900 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group bg-white">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                                {m.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-gray-900">{m.name}</p>
                                <div className="flex gap-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">{m.gender}</span>
                                    {m.leadCount > 0 && <span className="text-[9px] font-black text-emerald-500 uppercase">• Lead</span>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <div>
                                    <p className="text-lg font-black text-gray-900">{m.totalServices}</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Services</p>
                                </div>
                                <ChevronRight className="text-gray-300 group-hover:text-gray-900" size={18} />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                  {visibleCount < (detailedStats.length || rankingData.length) && (
                    <button onClick={() => setVisibleCount(v => v + 10)} className="w-full py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 tracking-widest border-t border-dashed border-gray-100 mt-4">
                      Load More Results
                    </button>
                  )}
                </div>
              ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <button onClick={() => setSelectedMinister(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-gray-900">
                    <ArrowLeft size={14} /> Back to Search
                  </button>
                  <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
                    <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
                      <div className="h-24 w-24 bg-white/10 rounded-[2rem] flex items-center justify-center text-4xl font-black">{selectedMinister.name.charAt(0)}</div>
                      <div>
                        <h1 className="text-3xl font-black tracking-tight">{selectedMinister.name}</h1>
                        <p className="text-blue-400 font-bold uppercase text-[10px] tracking-[0.2em]">{selectedMinister.gender} Minister</p>
                      </div>
                    </div>
                    <div className="flex gap-8 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                      <DetailStat label="Total Services" value={selectedMinister.totalServices} />
                      <DetailStat label="As Lead" value={selectedMinister.leadCount || 0} color="text-emerald-400" />
                      <DetailStat label="As Backup" value={selectedMinister.backupCount || 0} color="text-blue-400" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Detailed Service Dates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedMinister.serviceDates?.map((date, idx) => (
                        <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-black text-gray-700 flex items-center gap-3 transition-colors hover:bg-white hover:border-gray-200">
                          <div className="h-8 w-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                            <Calendar size={14} />
                          </div>
                          {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )) || <p className="text-gray-400 italic text-sm ml-4">No service dates logged for this period.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'gender-rank' && (
            <div className="animate-in slide-in-from-right-4 duration-500 space-y-12">
              <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">Ministers by Gender</h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <GenderList title="Females" data={getGenderGroup('female')} color="bg-pink-500" bgColor="bg-pink-50" max={maxServicesGlobal} />
                <GenderList title="Males" data={getGenderGroup('male')} color="bg-blue-500" bgColor="bg-blue-50" max={maxServicesGlobal} />
              </div>
            </div>
          )}

          {currentView === 'diversity' && (
            <div className="animate-in slide-in-from-right-4 duration-500 h-full flex flex-col">
              <div className="text-center mb-4">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">Ministers Diversity</h2>
              </div>
              <div className="relative w-full h-[300px] md:h-[400px]">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={genderData} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value" nameKey="name" stroke="none">
                        {genderData.map((entry, index) => (
                          <Cell key={index} fill={entry.name.toLowerCase() === 'male' ? COLORS.gender.male : COLORS.gender.female} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} />
                      <Legend verticalAlign="bottom" align="center" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-3xl font-black text-gray-900">{totals}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {genderData.map((item) => (
                  <div key={item.name} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col items-center">
                    <span className={`h-2 w-2 rounded-full mb-3 ${item.name.toLowerCase() === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                    <span className="text-2xl font-black text-gray-900 mt-1">{totals > 0 ? ((item.value / totals) * 100).toFixed(1) : 0}%</span>
                    <span className="text-[9px] font-bold text-gray-400 mt-1">{item.value} ministers</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- UPDATED GENDER LIST WITH SCROLLING ---
function GenderList({ title, data, color, bgColor, max }) {
  // Use a standard JS object for the scrollbar styles to avoid the JSX error
  const scrollbarStyles = {
    scrollbarWidth: 'thin',
    scrollbarColor: `#e5e7eb transparent`,
  };

  return (
    <div className={`${bgColor}/30 p-6 rounded-[2rem] border border-gray-100 flex flex-col h-[500px]`}>
      <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 flex-shrink-0">
        <div className={`h-2 w-2 rounded-full ${color}`} /> {title} ({data.length})
      </h3>
      
      <div 
        className="flex-1 overflow-y-auto pr-2 space-y-6"
        style={scrollbarStyles}
      >
        {data.length > 0 ? (
          data.map((m, i) => (
            <div key={i} className="group transition-all">
              <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-wide">
                <span className="text-gray-700 group-hover:text-gray-900">{m.name}</span>
                <span className="text-gray-400">{m.totalServices} Services</span>
              </div>
              <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-gray-100/50">
                <div 
                  className={`h-full ${color} rounded-full transition-all duration-1000`} 
                  style={{ width: `${(m.totalServices / (max || 1)) * 100}%` }} 
                />
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-[10px] font-black uppercase text-gray-300">No Data Available</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-center flex-shrink-0">
        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Scroll to view all</p>
      </div>
    </div>
    
  );
}

// --- OTHER SHARED COMPONENTS ---

function KPICard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
      <div className={`h-14 w-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}><Icon size={24} /></div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all group ${active ? "bg-gray-900 text-white shadow-xl translate-x-2" : "bg-white text-gray-500 hover:bg-gray-50 border border-transparent"}`}>
      <div className="flex items-center gap-4">
        <Icon size={18} className={active ? "text-white" : "text-gray-400 group-hover:text-gray-900"} />
        <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <ChevronRight size={16} className={`${active ? "opacity-100" : "opacity-0"}`} />
    </button>
  );
}

function DetailStat({ label, value, color = "text-white" }) {
  return (
    <div className="text-center min-w-[60px]">
      <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
      <p className="text-[9px] opacity-60 uppercase font-black tracking-widest mt-1">{label}</p>
    </div>
  );
}