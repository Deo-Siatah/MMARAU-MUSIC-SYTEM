import { useState, useMemo } from "react";
import { Search, Check } from "lucide-react";

export default function BackupSelector({
  ministers,
  backups,
  setBackups,
  selectedVoice,
  setSelectedVoice,
  lead
}) {
  const [search, setSearch] = useState("");
  const voices = ["tenor", "alto", "soprano"];

  // Filter ministers by selected voice and search term
  const voiceMinisters = useMemo(() => {
    return ministers.filter(
      (m) =>
        m.voices?.includes(selectedVoice) &&
        m.fullname.toLowerCase().includes(search.toLowerCase())
    );
  }, [ministers, selectedVoice, search]);

  const isSelected = (minister) => {
    return backups[selectedVoice].some((m) => m._id === minister._id);
  };

  const toggleBackup = (minister) => {
    // Prevent selecting the lead minister as a backup
    if (lead && lead._id === minister._id) return;

    if (isSelected(minister)) {
      // Remove
      setBackups((prev) => ({
        ...prev,
        [selectedVoice]: prev[selectedVoice].filter(
          (m) => m._id !== minister._id
        )
      }));
    } else {
      // Add
      setBackups((prev) => ({
        ...prev,
        [selectedVoice]: [...prev[selectedVoice], minister]
      }));
    }
  };

  return (
    <div className="w-full">
      
      {/* Segmented Control Tabs */}
      <div className="flex p-1 bg-gray-100/80 rounded-xl mb-6 w-full max-w-sm border border-gray-200/50">
        {voices.map((voice) => {
          const count = backups[voice].length;
          const isActive = selectedVoice === voice;
          
          return (
            <button
              key={voice}
              onClick={() => setSelectedVoice(voice)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              {voice}
              {/* Show a small counter badge if ministers are selected for this voice */}
              {count > 0 && (
                <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-300 text-gray-700'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${selectedVoice}s...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all placeholder:text-gray-400"
        />
      </div>

      {/* Minister List */}
      <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {voiceMinisters.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            <p className="text-gray-400 text-sm font-medium">No {selectedVoice} ministers found.</p>
          </div>
        ) : (
          voiceMinisters.map((minister) => {
            const selected = isSelected(minister);
            const disabled = lead && lead._id === minister._id;

            return (
              <div
                key={minister._id}
                onClick={() => !disabled && toggleBackup(minister)}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all 
                  ${
                    disabled
                      ? "bg-gray-50 border-gray-100 cursor-not-allowed opacity-60"
                      : selected
                      ? "border-gray-900 bg-gray-50/50 shadow-sm cursor-pointer"
                      : "border-gray-200 hover:border-gray-400 cursor-pointer"
                  }`}
              >
                <div className="flex items-center gap-3">
                  
                  {/* Avatar & Status Indicator */}
                  <div className="relative">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${selected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'}`}>
                      {minister.fullname.charAt(0)}
                    </div>
                    {/* Activity Dot */}
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        minister.hasServedRecently ? "bg-emerald-500" : "bg-red-500"
                      }`}
                      title={minister.hasServedRecently ? "Served recently" : "Has not served recently"}
                    />
                  </div>

                  {/* Text Details */}
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${selected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {minister.fullname}
                    </span>
                    
                    {disabled ? (
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Already Lead
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">
                        {selectedVoice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Custom Checkbox UI */}
                {!disabled && (
                  <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${
                    selected 
                      ? 'bg-gray-900 border-gray-900 text-white scale-110' 
                      : 'border-gray-300 bg-white group-hover:border-gray-400'
                  }`}>
                    {selected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}