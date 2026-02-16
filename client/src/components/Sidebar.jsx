import { Link } from "react-router-dom";
import { HomeIcon, Settings, ChartNoAxesColumnIncreasing } from "lucide-react";

// 1. Create a configuration array for your navigation links
const navLinks = [
  { name: "Home", path: "/", icon: HomeIcon },
  { name: "Manage", path: "/managedashboard", icon: Settings },
  { name: "Analytics", path: "/analyticsdashboard", icon: ChartNoAxesColumnIncreasing },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 flex flex-col h-screen w-64 bg-gray-900/50 px-6 py-8">
      
      {/* Brand / Logo Section */}
      <div className="mb-10 ">
        <h1 className="text-2xl font-bold tracking-wide text-white">
          Mmarau Music
        </h1>
      </div>

      {/* Navigation Section */}
      <nav className="flex flex-col gap-4 flex-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              to={link.path}
              className="flex items-center gap-3 text-lg font-medium text-gray-400 hover:text-white transition-colors duration-200"
            >
              <Icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      
    </aside>
  );
}