import { useState, useEffect } from "react";
import { Search, Plus, Edit2, UserX, UserCheck, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { 
  createMinister, 
  updateMinister, 
  deactivateMinister,
  getAllMinisters 
} from "@/api/ministers"; 

export default function MinistersTab() {
  const [ministers, setMinisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMinister, setEditingMinister] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullname: "",
    gender: "male",
    voices: [],
  });

  const availableVoices = ["soprano", "alto", "tenor"];

  // Fetch data on mount
const fetchMinisters = async () => {
  try {
    setLoading(true);
    const response = await getAllMinisters(); 


    const ministersArray = response.data || [];
    
    setMinisters(ministersArray); 
  } catch (error) {
    console.error("Fetch Error:", error);
    toast.error("Failed to load ministers");
    setMinisters([]); 
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchMinisters();
  }, []);

  // Filter ministers client-side for quick search
 const filteredMinisters = Array.isArray(ministers) 
  ? ministers.filter((m) => 
      m.fullname?.toLowerCase().includes(search.toLowerCase())
    )
  : [];

  // Modal Handlers
  const openModal = (minister = null) => {
    if (minister) {
      setEditingMinister(minister);
      setFormData({
        fullname: minister.fullname,
        gender: minister.gender,
        voices: minister.voices || [],
      });
    } else {
      setEditingMinister(null);
      setFormData({ fullname: "", gender: "male", voices: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMinister(null);
  };

  // Form Submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullname || formData.voices.length === 0) {
      return toast.error("Name and at least one voice are required.");
    }

    try {
      setIsSubmitting(true);
      if (editingMinister) {
        await updateMinister(editingMinister._id, formData);
        toast.success("Minister updated successfully");
      } else {
        await createMinister(formData);
        toast.success("Minister added successfully");
      }
      await fetchMinisters(); // Refresh list
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save minister");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active Status (Soft Delete / Reactivate)
  const handleToggleStatus = async (minister) => {
    try {
      // If active, deactivate. If inactive, update to active.
      if (minister.isActive) {
        await deactivateMinister(minister._id);
        toast.success(`${minister.fullname} deactivated`);
      } else {
        await updateMinister(minister._id, { isActive: true });
        toast.success(`${minister.fullname} reactivated`);
      }
      await fetchMinisters();
    } catch (error) {
      console.error(error);
      toast.error("Failed to change status");
    }
  };

  // Toggle Voice selection in form
  const toggleVoice = (voice) => {
    setFormData((prev) => ({
      ...prev,
      voices: prev.voices.includes(voice)
        ? prev.voices.filter((v) => v !== voice)
        : [...prev.voices, voice],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Search & Action */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search ministers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
          />
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Minister
        </button>
      </div>

      {/* Data List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredMinisters.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium text-sm">
            No ministers found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredMinisters.map((minister) => (
              <div
                key={minister._id}
                className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 ${
                  !minister.isActive ? "opacity-60 bg-gray-50/50" : ""
                }`}
              >
                {/* Left Info */}
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    minister.isActive ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {minister.fullname.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${minister.isActive ? "text-gray-900" : "text-gray-500"}`}>
                      {minister.fullname}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                        {minister.gender}
                      </span>
                      <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                      <div className="flex gap-1">
                        {minister.voices.map((v) => (
                          <span key={v} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium capitalize">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(minister)}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Minister"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(minister)}
                    className={`p-2 rounded-lg transition-colors ${
                      minister.isActive 
                        ? "text-red-400 hover:text-red-600 hover:bg-red-50" 
                        : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                    }`}
                    title={minister.isActive ? "Deactivate" : "Reactivate"}
                  >
                    {minister.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">
                {editingMinister ? "Edit Minister" : "Add Minister"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-gray-50/50">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Gender
                </label>
                <div className="flex gap-4">
                  {["male", "female"].map((g) => (
                    <label key={g} className="flex-1 cursor-pointer">
                      <div className={`text-center py-2.5 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all ${
                        formData.gender === g 
                          ? "bg-gray-900 text-white border-gray-900 shadow-md" 
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                      }`}>
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          className="hidden"
                          checked={formData.gender === g}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        />
                        {g}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Voices (Multi-select) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Voices (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableVoices.map((voice) => {
                    const isSelected = formData.voices.includes(voice);
                    return (
                      <button
                        type="button"
                        key={voice}
                        onClick={() => toggleVoice(voice)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                          isSelected
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {voice}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-transform active:scale-[0.98] shadow-lg shadow-gray-200 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    "Save Minister"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}