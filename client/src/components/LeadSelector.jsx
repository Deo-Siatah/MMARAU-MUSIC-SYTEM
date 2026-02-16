import { useState, useMemo } from "react"

export default function LeadSelector({
  ministers,
  lead,
  setLead,
  loading
}) {
  const [search, setSearch] = useState("")

  // Filter ministers by search only
  const filteredMinisters = useMemo(() => {
    return ministers.filter((m) =>
      m.fullname.toLowerCase().includes(search.toLowerCase())
    )
  }, [ministers, search])

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h2 className="font-semibold mb-4">Select Lead</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search minister..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <p className="text-gray-500 text-sm">Loading ministers...</p>
      ) : filteredMinisters.length === 0 ? (
        <p className="text-gray-400 text-sm">No ministers found.</p>
      ) : (
        <div className="max-h-72 overflow-y-auto space-y-2">
          {filteredMinisters.map((minister) => {
            const isSelected = lead?._id === minister._id

            return (
              <div
                key={minister._id}
                onClick={() => setLead(minister)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition
                  ${
                    isSelected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-3">

                  {/* Recent Service Indicator */}
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      minister.hasServedRecently
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  />

                  <span className="text-sm font-medium">
                    {minister.fullname}
                  </span>
                </div>

                <input
                  type="radio"
                  checked={isSelected}
                  onChange={() => setLead(minister)}
                  className="cursor-pointer"
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
