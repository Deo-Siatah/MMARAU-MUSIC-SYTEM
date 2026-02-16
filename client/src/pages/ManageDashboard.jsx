import { useState } from "react";
import { Users, Calendar as CalendarIcon, FileText, ArrowLeft } from "lucide-react";
import {useNavigate} from "react-router-dom"
import MinistersTab from "./MinistersTab";
import SemestersTab from "./SemestersTab";
import ServicesTab from "./ServicesTab";

export default function ManageDashboard() {
    const navigate = useNavigate();
    const [activeTab,setActiveTab] = useState("ministers");

    const tabs = [
    { id: "ministers", label: "Ministers", icon: Users },
    { id: "semesters", label: "Semesters", icon: CalendarIcon },
    { id: "services", label: "Services", icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/*header*/}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    <button
                        onClick={() => navigate("/")}
                        className="mb-4 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-bold text-xs uppercase tracking-widest"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Back to Home
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Manage System
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        Update schedules, manage semesters and manage service records
                    </p>
                </div>
                {/*Navigation tabs*/}
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex space-x-6 overflow-x-auto custom-scrollbar pt-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 pb-4 border-b-2 transition-all whitespace-nowrap px-1 ${
                                        isActive
                                        ? "border-gray-900 text-gray-900"
                                        : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 ${isActive ? "text-gray-900" : ""}`}/>
                                    <span className="text-sm font-bold uppercase tracking-wider">{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </header>

            {/*main content area*/}
            <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
                {activeTab === "ministers" && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm min-h-[400px]">
                        {/*Ministers Tab*/}
                        <MinistersTab/>
                    </div>
                )}

                {activeTab === "semesters" && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm min-h-[400px]">
                        {/*Semesters Tab*/}
                        <SemestersTab/>
                    </div>
                )}

                {activeTab === "services" && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm min-h-[400px]">
                        {/*Services Tab*/}
                        <ServicesTab/>
                    </div>
                )}
            </main>
        </div>
    )


}