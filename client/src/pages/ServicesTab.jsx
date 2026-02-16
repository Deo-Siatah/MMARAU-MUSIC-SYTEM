import { useState, useEffect } from "react";
import { Search, Printer, Trash2, Calendar, Loader2, ClipboardList, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { getAllServices, deleteService } from "@/api/service"; 
// Import the ministers API call
import { getAllMinisters } from "@/api/ministers"; 

export default function ServicesTab() {
  const [services, setServices] = useState([]);
  const [allMinisters, setAllMinisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(null);
  
  const [selectedService, setSelectedService] = useState(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch both services and ministers concurrently
      const [servicesRes, ministersRes] = await Promise.all([
        getAllServices(),
        getAllMinisters()
      ]);
      setServices(servicesRes.data || []);
      setAllMinisters(ministersRes.data || []);
    } catch (error) {
      toast.error("Failed to load service records or ministers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Warning: This action is permanent. Do you want to delete this service schedule?")) return;
    
    try {
      setIsDeleting(id);
      await deleteService(id);
      toast.success("Service record deleted");
      setServices(prev => prev.filter(s => s._id !== id));
      if (selectedService?._id === id) setSelectedService(null);
    } catch (error) {
      toast.error("Failed to delete service");
    } finally {
      setIsDeleting(null);
    }
  };

  // Helper function to map a minister ID string to their full name
  const getMinisterName = (id) => {
    const minister = allMinisters.find(m => m._id === id);
    return minister ? minister.fullname : "Unknown Minister";
  };

  const filteredServices = Array.isArray(services) ? services.filter(s => {
      // Create a search string combining service type and minister names
      const searchString = s.serviceType.toLowerCase() + " " + s.ministers.map(m => getMinisterName(m.ministerId).toLowerCase()).join(" ");
      return searchString.includes(search.toLowerCase());
  }) : [];

  const selectedLead = selectedService?.ministers?.find(m => m.role === 'lead');
  const selectedBackups = selectedService?.ministers?.filter(m => m.role === 'backup') || [];

  return (
    <div className="space-y-6">
      {/* ====================================================
        MAIN DASHBOARD VIEW (Hidden completely during print)
        ====================================================
      */}
      <div className="print:hidden space-y-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search date, type, or minister..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
             <div className="flex flex-col items-center justify-center p-20 gap-3">
               <Loader2 className="h-8 w-8 animate-spin text-gray-200" />
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Roster...</p>
             </div>
          ) : filteredServices.length === 0 ? (
            <div className="p-20 text-center">
              <ClipboardList className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No service records match your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Date & Service</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Lead Minister</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Team Size</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredServices.map((service) => {
                    const lead = service.ministers.find(m => m.role === 'lead');
                    const backupCount = service.ministers.filter(m => m.role === 'backup').length;

                    return (
                      <tr 
                        key={service._id} 
                        onClick={() => setSelectedService(service)}
                        className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900">
                                {new Date(service.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className="text-[10px] font-bold uppercase text-blue-600 tracking-tighter mt-0.5">
                                {service.serviceType} Service
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-sm font-bold text-gray-900">
                          {lead ? getMinisterName(lead.ministerId) : <span className="text-gray-400 italic font-medium">Unassigned</span>}
                        </td>
                        <td className="p-5 text-xs font-bold text-gray-500">
                          {backupCount} Backup{backupCount !== 1 ? 's' : ''}
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedService(service)}
                              className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-900 rounded-xl transition-all shadow-sm"
                              title="View & Print"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              disabled={isDeleting === service._id}
                              onClick={(e) => handleDelete(service._id, e)}
                              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete Service"
                            >
                              {isDeleting === service._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
        INTERACTIVE MODAL (Hidden during print)
        ====================================================
      */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900">Service Details</h2>
              <button onClick={() => setSelectedService(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="font-black text-gray-900 text-lg">
                    {new Date(selectedService.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Type</p>
                  <p className="font-black text-blue-600 text-lg capitalize">{selectedService.serviceType}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 border-b border-gray-100 pb-2">Lead Minister</h3>
                {selectedLead ? (
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-black">
                       {getMinisterName(selectedLead.ministerId).charAt(0)}
                     </div>
                     <div>
                       <p className="font-black text-gray-900">{getMinisterName(selectedLead.ministerId)}</p>
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{selectedLead.voice}</p>
                     </div>
                   </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No lead assigned.</p>
                )}
              </div>

              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 border-b border-gray-100 pb-2">Backup Team</h3>
                {selectedBackups.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedBackups.map((b, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 p-3 rounded-xl flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></div>
                        <div className="min-w-0">
                           <p className="text-sm font-bold text-gray-900 truncate">{getMinisterName(b.ministerId)}</p>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{b.voice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No backups assigned.</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-black uppercase tracking-widest transition-transform active:scale-[0.98] shadow-lg shadow-gray-200"
              >
                <Printer className="h-4 w-4" />
                Print Form / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
        PRINT-ONLY VIEW (Visible ONLY on paper/PDF)
        ====================================================
      */}
      {selectedService && (
        <div id="print-section" className="hidden print:block w-full bg-white text-black">
          <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-black uppercase tracking-widest">Service Roster</h1>
            <p className="text-xl font-bold mt-2">
              {new Date(selectedService.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm font-bold uppercase tracking-[0.3em] mt-1 text-gray-600">
              {selectedService.serviceType} Service
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-gray-500 border-b border-gray-300 pb-1">Lead Minister</h2>
            {selectedLead ? (
              <div className="flex items-center gap-2">
                <p className="text-xl font-black">{getMinisterName(selectedLead.ministerId)}</p>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-600">({selectedLead.voice})</p>
              </div>
            ) : (
              <p className="italic text-gray-500">Unassigned</p>
            )}
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-gray-500 border-b border-gray-300 pb-1">Backup Team</h2>
            {selectedBackups.length > 0 ? (
              <ul className="space-y-4">
                {selectedBackups.map((b, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-lg font-bold w-64">{getMinisterName(b.ministerId)}</span>
                    <span className="text-sm font-bold uppercase tracking-widest text-gray-600">({b.voice})</span>
                  </li>
                ))}
              </ul>
            ) : (
               <p className="italic text-gray-500">No backups assigned.</p>
            )}
          </div>

          <div className="mt-20 pt-6 border-t border-gray-300 text-center">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Generated by Music Management System</p>
          </div>
        </div>
      )}

      {/* ====================================================
        BULLETPROOF PRINT CSS TRICK
        ====================================================
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* 1. Hide EVERYTHING on the page by default */
          body * {
            visibility: hidden;
          }
          
          /* 2. Make ONLY the print section and its children visible */
          #print-section, #print-section * {
            visibility: visible;
          }
          
          /* 3. Force the print section to the absolute top-left of the paper */
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }

          /* 4. Remove standard web margins to prevent blank second pages */
          @page {
            margin: 1cm;
          }
        }
      `}} />
    </div>
  );
}