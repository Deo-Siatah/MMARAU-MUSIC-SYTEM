import { useState, useEffect } from "react";
import { Plus, Calendar, Edit2, X, Loader2, CheckCircle2, AlertCircle, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { getAllSemesters, createSemester, updateSemester } from "@/api/semester"; 

export default function SemestersTab() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track if we are editing or creating
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const res = await getAllSemesters();
      setSemesters(res.data || []);
    } catch (error) {
      toast.error("Failed to load semesters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  // Open modal for Create OR Edit
  const openModal = (semester = null) => {
    if (semester) {
      setEditingId(semester._id);
      setFormData({
        name: semester.name,
        // Format dates to YYYY-MM-DD for the HTML5 date input
        startDate: new Date(semester.startDate).toISOString().split('T')[0],
        endDate: new Date(semester.endDate).toISOString().split('T')[0],
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", startDate: "", endDate: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      return toast.error("End date must be after start date");
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateSemester(editingId, formData);
        toast.success("Semester updated successfully");
      } else {
        await createSemester(formData);
        toast.success("New semester activated");
      }
      setIsModalOpen(false);
      fetchSemesters();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving semester");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manual Toggle logic
  const handleToggleStatus = async (semester) => {
    const newStatus = !semester.isActive;
    try {
      // If we are activating, backend should handle deactivating others
      await updateSemester(semester._id, { isActive: newStatus });
      toast.success(`Semester ${newStatus ? 'Activated' : 'Deactivated'}`);
      fetchSemesters();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Semester Management</h2>
          <p className="text-xs text-gray-500 font-medium">Manage scheduling periods and active status.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-gray-200"
        >
          <Plus className="h-4 w-4" />
          New Semester
        </button>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-gray-200" /></div>
        ) : (
          semesters.map((sem) => (
            <div 
              key={sem._id} 
              className={`relative overflow-hidden bg-white border-2 rounded-2xl p-5 transition-all ${
                sem.isActive ? "border-gray-900 shadow-md" : "border-gray-100 opacity-75"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${sem.isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}>
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{sem.name}</h3>
                      {sem.isActive && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Active Now</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      {new Date(sem.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })} — {new Date(sem.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</p>
                    <p className="text-sm font-black text-gray-900">{sem.totalWeeks} Weeks</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Status Toggle Button */}
                    <button 
                      onClick={() => handleToggleStatus(sem)}
                      className={`p-2 rounded-xl border transition-all ${
                        sem.isActive 
                        ? "text-red-500 border-red-100 hover:bg-red-50" 
                        : "text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                      }`}
                      title={sem.isActive ? "Deactivate" : "Activate"}
                    >
                      {sem.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </button>

                    {/* Edit Button */}
                    <button 
                      onClick={() => openModal(sem)}
                      className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                      title="Edit Semester"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Create/Update */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {editingId ? "Update Semester" : "Create Semester"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-gray-50/30">
              {!editingId && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-800 font-bold uppercase tracking-tight leading-tight">
                    Warning: Activating a new semester will automatically set others to inactive.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Semester 1 - 2026"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Start Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-gray-900 outline-none"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">End Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-gray-900 outline-none"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg shadow-gray-200 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : editingId ? "Save Changes" : "Create & Activate"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}