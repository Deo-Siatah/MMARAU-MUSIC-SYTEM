import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout() {
    const [open, setOpen] = useState(false);

    return (
        // 1. Lock the entire layout to the viewport height (h-screen) 
        // and hide the browser's default scrollbar (overflow-hidden)
        <div className="flex h-screen w-full bg-gray-900 overflow-hidden">
            
            {/* Desktop Sidebar 
                - We remove 'bg-gray-500' here because the Sidebar component 
                  likely handles its own background (from your previous code).
                - We add 'flex-shrink-0' to prevent it from squishing.
            */}
            <div className="hidden md:flex w-64 flex-shrink-0 border-r border-gray-200 bg-gray-500">
                <Sidebar />
            </div>

            {/* Mobile Drawer (Overlay) */}
            {open && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={() => setOpen(false)}
                    />
                    {/* Drawer Content */}
                    <div className="relative w-64 bg-gray-900 h-full shadow-xl transform transition-transform">
                        {/* Note: You might need to update your Sidebar to accept a close prop 
                            if you want links to close the drawer when clicked */}
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Right Side (Topbar + Content) */}
            <div className="flex flex-col flex-1 h-full overflow-hidden">
                
                {/* Topbar 
                    - Since the parent is flex-col and NOT scrolling, 
                      this element stays naturally fixed at the top.
                */}
                <header className="h-14 bg-gray-50 border-b border-gray-200 shadow-sm flex items-center px-4 flex-shrink-0 z-10">
                    <button className="md:hidden mr-4" onClick={() => setOpen(true)}>
                        <Menu className="h-6 w-6 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-800 tracking-wide">
                        Dashboard
                    </h1>
                </header>

                {/* Main Content Area 
                    - This is the ONLY part that scrolls.
                    - overflow-y-auto adds the scrollbar here.
                */}
                <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}