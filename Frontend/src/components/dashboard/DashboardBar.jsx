import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EditIcon from "@mui/icons-material/Edit";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import PeopleIcon from "@mui/icons-material/People";
import ReportIcon from "@mui/icons-material/Report";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { to: "/dashboard/petitions", label: "Petitions", icon: <EditIcon /> },
  { to: "/dashboard/polls", label: "Polls", icon: <HowToVoteIcon /> },
  { to: "/dashboard/officials", label: "Officials", icon: <PeopleIcon /> },
  { to: "/dashboard/reports", label: "Reports", icon: <ReportIcon /> },
  { to: "/dashboard/settings", label: "Settings", icon: <SettingsIcon /> },
  { to: "/dashboard/help", label: "Help & Support", icon: <HelpIcon /> },
];

export default function DashboardBar() {
  const [active, setActive] = useState("/dashboard");

  return (
    <nav className="w-full mt-6">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={() => setActive(link.to)}
          className={`flex items-center gap-3 px-6 py-3 mb-1 rounded-lg font-medium transition-colors
            ${
              active === link.to
                ? "bg-[#e3f2fd] text-[#10419C]"
                : "text-gray-800 hover:bg-gray-100"
            }`}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
