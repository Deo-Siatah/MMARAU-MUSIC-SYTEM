import React, { useState, useEffect, useRef } from "react";
import { 
  MoreHorizontal, 
  User, 
  Trash2, 
  Check, 
  Plus, 
  RefreshCcw, 
  Send 
} from "lucide-react";
import { toast } from "sonner";


export default function DraftPreview({
  lead,
  backups,
  setLead,
  setBackups,
  openVoiceTab,
  postService,
  posting,
  date,
  serviceType
}) {
  const voices = ["tenor", "alto", "soprano"];
 
  
  // State to track which dropdown menu is currently open
  // Values: 'lead', 'tenor', 'alto', 'soprano', or null
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---

  const handleRemoveBackup = (voice, ministerId) => {
    setBackups((prev) => ({
      ...prev,
      [voice]: prev[voice].filter((m) => m._id !== ministerId),
    }));
    toast.success("Minister removed from draft");
  };

  const handleMenuAction = (voice, action) => {
    // Both actions lead to the tab, but you could add logic to 
    // clear the list if 'replace' was chosen, for example.
    openVoiceTab(voice); 
    setActiveMenu(null);
    
    if(action === 'replace') {
       toast("Select a new minister to replace the current selection", { icon: "🔄" });
    }
  };

  const handleComplete = () => {
    if (!lead) {
      toast.error("Please select a Lead Minister.");
      return;
    }
    // Optional: Check if at least one backup exists per voice?
    // if (voices.some((v) => backups[v].length === 0)) { ... }

    postService();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-fit sticky top-6">
      
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
          Draft Preview
        </h2>
      </div>

      <div className="p-5 space-y-6" ref={menuRef}>
        {date && serviceType && (
        <div className="text-xs text-gray-500 space-y-1">
            <p><span className="font-semibold text-gray-700">Type:</span> {serviceType}</p>
            <p><span className="font-semibold text-gray-700">Date:</span> {new Date(date).toLocaleDateString()}</p>
        </div>
        )}

        
        {/* ================= LEAD SECTION ================= */}
        <div className="relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Lead Minister
            </span>
            
            {/* 3-Dot Menu Trigger */}
            <button 
              onClick={() => setActiveMenu(activeMenu === 'lead' ? null : 'lead')}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {/* Dropdown Menu */}
            {activeMenu === 'lead' && (
              <div className="absolute right-0 top-6 z-10 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 animate-in fade-in zoom-in duration-200">
                <button 
                  onClick={() => handleMenuAction('lead', 'replace')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCcw className="h-3 w-3" /> Replace
                </button>
              </div>
            )}
          </div>

          {/* Lead Card */}
          {lead ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
                {lead.fullname.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{lead.fullname}</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Selected</p>
              </div>
              <button 
                onClick={() => setLead(null)} 
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => openVoiceTab('lead')}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all cursor-pointer bg-gray-50/30"
            >
              <Plus className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Add Lead</span>
            </div>
          )}
        </div>

        {/* ================= BACKUP SECTIONS ================= */}
        {voices.map((voice) => (
          <div key={voice} className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {voice}
              </span>

              {/* 3-Dot Menu Trigger */}
              <button 
                onClick={() => setActiveMenu(activeMenu === voice ? null : voice)}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {/* Dropdown Menu */}
              {activeMenu === voice && (
                <div className="absolute right-0 top-6 z-10 w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 animate-in fade-in zoom-in duration-200">
                  <button 
                    onClick={() => handleMenuAction(voice, 'add')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Plus className="h-3 w-3" /> Add Minister
                  </button>
                  <button 
                    onClick={() => handleMenuAction(voice, 'replace')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <RefreshCcw className="h-3 w-3" /> Replace All
                  </button>
                </div>
              )}
            </div>

            {/* List of Selected Ministers */}
            <div className="space-y-2">
              {backups[voice].length > 0 ? (
                backups[voice].map((m) => (
                  <div
                    key={m._id}
                    className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold">
                        {m.fullname.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {m.fullname}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveBackup(voice, m._id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic pl-1">No selection yet</p>
              )}
            </div>
          </div>
        ))}

      </div>

      {/* Footer / Submit Button */}
      <div className="p-5 border-t border-gray-100 bg-gray-50/30">
        <button
        onClick={handleComplete}
        disabled={posting}
        className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 px-4 rounded-xl text-sm font-bold transition-transform active:scale-[0.98] shadow-lg shadow-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
        {posting ? (
            <>
            <RefreshCcw className="h-4 w-4 animate-spin" />
            Posting...
            </>
        ) : (
            <>
            <Send className="h-4 w-4" />
            Complete & Post Service
            </>
            
        )}
    
        </button>

      </div>

    </div>
  );
}