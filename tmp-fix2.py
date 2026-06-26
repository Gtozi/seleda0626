import re

path = r'c:\Users\zeray\OneDrive\Desktop\SELEDA\SELEDA 0610\src\components\FrontDesk\ReservationsModule.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Group ID header after Booking ID header
old_header = "                  <th className=\"py-3 px-3 min-w-[100px]\">Booking ID</th>\n                  <th className=\"py-3 px-3 min-w-[150px]\">Guest Name</th>"
new_header = "                  <th className=\"py-3 px-3 min-w-[100px]\">Booking ID</th>\n                  <th className=\"py-3 px-3 min-w-[80px]\">Group ID</th>\n                  <th className=\"py-3 px-3 min-w-[150px]\">Guest Name</th>"

if old_header in content:
    content = content.replace(old_header, new_header)
    print("Added Group ID header")
else:
    print("Header block not found")

# Add Group ID cell after Booking ID cell
old_cell = """                        {/* Booking ID */}
                        <td className="py-3.5 px-3 font-mono text-[10px] text-slate-500 leading-tight">
                          <div className="font-bold text-slate-700">{res.id}</div>"""

new_cell = """                        {/* Booking ID */}
                        <td className="py-3.5 px-3 font-mono text-[10px] text-slate-500 leading-tight">
                          <div className="font-bold text-slate-700">{res.id}</div>
                          {res.ratePlanId && (
                            <div className="text-[8px] text-indigo-600 uppercase font-black tracking-tighter mt-0.5 flex items-center gap-0.5">
                              <Tag size={8} /> {ratePlans.find(p => p.id === res.ratePlanId)?.name || res.ratePlanId}
                            </div>
                          )}
                          {res.packageIds && res.packageIds.length > 0 && (
                            <div className="text-[8px] text-amber-600 uppercase font-black tracking-tighter mt-0.5 flex items-center gap-0.5">
                              <Sparkles size={8} /> {res.packageIds.length} Add-on(s)
                            </div>
                          )}
                        </td>

                        {/* Group ID */}
                        <td className="py-3.5 px-3 font-mono text-[10px] text-slate-500 leading-tight">
                          {res.bookingGroupId ? (
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{res.bookingGroupId}</span>
                          ) : (
                            <span className="text-slate-300 italic">—</span>
                          )}
                          {res.corporateAccountId && (
                            <div className="text-[8px] text-slate-500 mt-0.5">Corp: {res.corporateAccountId}</div>
                          )}
                        </td>"""

# We need to replace the full booking ID cell block
old_full_cell = """                        {/* Booking ID */}
                        <td className="py-3.5 px-3 font-mono text-[10px] text-slate-500 leading-tight">
                          <div className="font-bold text-slate-700">{res.id}</div>
                          {res.ratePlanId && (
                            <div className="text-[8px] text-indigo-600 uppercase font-black tracking-tighter mt-0.5 flex items-center gap-0.5">
                              <Tag size={8} /> {ratePlans.find(p => p.id === res.ratePlanId)?.name || res.ratePlanId}
                            </div>
                          )}
                          {res.packageIds && res.packageIds.length > 0 && (
                            <div className="text-[8px] text-amber-600 uppercase font-black tracking-tighter mt-0.5 flex items-center gap-0.5">
                              <Sparkles size={8} /> {res.packageIds.length} Add-on(s)
                            </div>
                          )}
                        </td>

                        {/* Guest Name */}"""

new_full_cell = """                        {/* Booking ID */}
                        <td className="py-3.5 px-3 font-mono text-[10px] text-slate-500 leading-tight">
                          <div className="font-bold text-slate-700">{res.id}</div>
                          {res.ratePlanId && (
                            <div className="text-[8px] text-indigo-600 uppercase font-black tracking-tighter mt-0.5 flex items-center gap-0.5">
                              <Tag size={8} /> {ratePlans.find(p => p.id === res.ratePlanId)?.name || res.ratePlanId}
                            </div>
                          )}
                          {res.packageIds && res.packageIds.length > 0 && (
                            <div className="text-[8px] text-amber-600 uppercase font-black tracking-tighter mt-0.5 flex items-center gap-0.5">
                              <Sparkles size={8} /> {res.packageIds.length} Add-on(s)
                            </div>
                          )}
                        </td>

                        {/* Group ID */}
                        <td className="py-3.5 px-3 font-mono text-[10px] text-slate-500 leading-tight">
                          {res.bookingGroupId ? (
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{res.bookingGroupId}</span>
                          ) : (
                            <span className="text-slate-300 italic">—</span>
                          )}
                          {res.corporateAccountId && (
                            <div className="text-[8px] text-slate-500 mt-0.5">Corp: {res.corporateAccountId}</div>
                          )}
                        </td>

                        {/* Guest Name */}"""

if old_full_cell in content:
    content = content.replace(old_full_cell, new_full_cell)
    print("Added Group ID cell")
else:
    print("Cell block not found")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
