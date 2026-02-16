import { useEffect, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CalendarPlus, 
  Layers, 
  FileText, 
  Users 
} from "lucide-react";
import { useServiceDraft } from "@/context/serviceDraftContext";
import { toast } from "sonner"; 

// API & Context
import { getMinistersAvailability, createService as apiCreateService } from "@/api/service";
import { useSemester } from "@/context/semesterContext";

// Components
import LeadSelector from "@/components/LeadSelector";
import BackupSelector from "@/components/BackupSelector";
import DraftPreview from "@/components/DraftPreview";

export default function CreateService() {
  const { semester, loading: semesterLoading } = useSemester();
  const [loading, setLoading] = useState(true);
  const [ministers, setMinisters] = useState([]);

  const { draft, updateDraft, resetDraft } = useServiceDraft();
  const [posting, setPosting] = useState(false);

  const navigate = useNavigate();

  // 
  // Form State (with safety fallbacks just in case context is empty on first load)
  const lead = draft?.lead || null;
  const backups = draft?.backups || { tenor: [], alto: [], soprano: [] };

  const [selectedVoice, setSelectedVoice] = useState("tenor");

  // Handle both direct values AND updater functions (prev) => ...
  const setLead = (updater) => {
    const newValue = typeof updater === "function" ? updater(lead) : updater;
    updateDraft({ lead: newValue });
  };

  const setBackups = (updater) => {
    const newValue = typeof updater === "function" ? updater(backups) : updater;
    updateDraft({ backups: newValue });
  };


  // Fetch Data
  useEffect(() => {
    if (!semester || semesterLoading) return;

    const fetchMinisters = async () => {
      try {
        const data = await getMinistersAvailability(semester._id);
        setMinisters(data);
      } catch (error) {
        console.error("Failed to fetch ministers", error);
        toast.error("Could not load minister availability");
      } finally {
        setLoading(false);
      }
    };

    fetchMinisters();
  }, [semester, semesterLoading]);

  // Submit Handler
  const handleCreateService = async () => {
  // ... validation logic (date, type, etc.) ...

  try {
    setPosting(true);

    const formattedMinisters = [];

    // 1. Lead: Ensure we extract a valid string for the 'voice' field
    // If your minister object has a 'voices' array, take the first one.
    const leadVoice = lead.voice || (lead.voices && lead.voices[0]);

    if (!leadVoice) {
      return toast.error("Selected lead minister has no assigned voice.");
    }

    formattedMinisters.push({
      ministerId: lead._id,
      voice: leadVoice.toLowerCase(), // Must match 'soprano', 'alto', or 'tenor'
      role: "lead"
    });

    // 2. Backups
    Object.entries(backups).forEach(([voice, list]) => {
      list.forEach((minister) => {
        formattedMinisters.push({
          ministerId: minister._id,
          voice: voice.toLowerCase(), 
          role: "backup"
        });
      });
    });

    // Final Payload Structure
    const payload = {
      date: draft.date,
      serviceType: draft.serviceType.toLowerCase(),
      semesterId: semester._id,
      ministers: formattedMinisters
    };

    console.log("Final Payload:", payload); // Debug this!

    await apiCreateService(payload);

    toast.success("Service created successfully!");
    resetDraft();
    setTimeout(() => {
        navigate("/"); 
      }, 1500);
    setSelectedVoice("tenor");

  } catch (error) {
    // If Axios returns a 500, check the console for the error response body
    console.error("Backend Error:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Failed to create service.");
  } finally {
    setPosting(false);
  }
};

  // 1. Loading State
  if (semesterLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-12 w-12 bg-gray-200 rounded-full" />
          <p className="text-gray-400 font-medium">Loading roster data...</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (!semester) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <CalendarPlus className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Active Semester</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          You need to start a new semester before you can schedule services.
        </p>
        <Link to="/" className="mt-6 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition">
          Go Home
        </Link>
      </div>
    );
  }

  // 3. Main UI
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-all group"
          >
            <div className="p-2 bg-white rounded-lg border border-gray-200 group-hover:border-gray-900 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full">
               {semester.name}
             </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ================= LEFT SIDE (BUILDER) ================= */}
          <div className="flex-1 w-full space-y-6">
            
            <header className="mb-6">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <CalendarPlus className="h-8 w-8 text-gray-400" />
                New Service
              </h1>
              <p className="text-gray-500 font-medium mt-1 ml-11">
                Select ministers for the upcoming service.
              </p>
            </header>

            {/* Lead Section */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
                <Users className="h-4 w-4 text-gray-400" />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Lead Minister
                </h2>
              </div>
              
              <LeadSelector
                ministers={ministers}
                lead={lead}
                setLead={setLead}
              />
            </section>

            {/* Backup Section */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
                <Layers className="h-4 w-4 text-gray-400" />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Backup Team
                </h2>
              </div>

              <BackupSelector
                ministers={ministers}
                backups={backups}
                setBackups={setBackups}
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                lead={lead}
              />
            </section>

          </div>

          {/* ================= RIGHT SIDE (STICKY PREVIEW) ================= */}
          <div className="w-full lg:w-96 lg:sticky lg:top-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Service Draft
              </h2>
            </div>

            <DraftPreview
              lead={lead}
              setLead={setLead}
              backups={backups}
              setBackups={setBackups}
              openVoiceTab={setSelectedVoice}
              postService={handleCreateService}
              posting={posting}
              date={draft.date}
              serviceType={draft.serviceType}

            />
          </div>

        </div>
      </div>
    </div>
  );
}