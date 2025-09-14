import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PollIcon from '@mui/icons-material/Poll';

export default function DashboardCard() {
	return (
  <>
    <div className="flex flex-row gap-8 mb-8">
      {/* My Petitions */}
      <div className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 text-left" style={{ background: '#e3f2fd', color: '#111' }}>
        <div className="flex flex-row items-center justify-between w-full mb-2">
          <span className="text-lg font-semibold">My Petitions</span>
          <span>
            <EditIcon style={{ fontSize: 32 }} />
          </span>
        </div>
        <span className="text-3xl font-bold mb-1">0</span>
        <span className="text-sm opacity-60">petitions</span>
      </div>
      {/* Successful Petitions */}
      <div className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 text-left" style={{ background: '#e3f2fd', color: '#111' }}>
        <div className="flex flex-row items-center justify-between w-full mb-2">
          <span className="text-lg font-semibold">Successful Petitions</span>
          <span>
            <CheckCircleIcon style={{ fontSize: 32 }} />
          </span>
        </div>
        <span className="text-3xl font-bold mb-1">0</span>
        <span className="text-sm opacity-60">or under review</span>
      </div>
      {/* Polls Created */}
      <div className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 text-left" style={{ background: '#e3f2fd', color: '#111' }}>
        <div className="flex flex-row items-center justify-between w-full mb-2">
          <span className="text-lg font-semibold">Polls Created</span>
          <span>
            <PollIcon style={{ fontSize: 32 }} />
          </span>
        </div>
        <span className="text-3xl font-bold mb-1">0</span>
        <span className="text-sm opacity-60">polls</span>
      </div>
    </div>
    {/* Active Petitions Near You row (outside containers) */}
    <div className="flex flex-row items-center justify-between w-full mb-6 mt-2">
      <span className="text-xl font-bold" style={{ color: '#111' }}>Active Petitions Near You</span>
      <div className="flex flex-row items-center gap-2">
        <span className="text-base font-medium" style={{ color: '#111' }}>Showing for:</span>
        <select className="border border-gray-300 rounded-lg px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="delhi">Delhi</option>
          <option value="mumbai">Mumbai</option>
          <option value="bangalore">Bangalore</option>
          <option value="kolkata">Kolkata</option>
        </select>
      </div>
    </div>
  {/* Category buttons row */}
  <div className="flex flex-row gap-3 mb-8">
    <button className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white shadow active">All Categories</button>
    <button className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow">Environment</button>
    <button className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow">Infrastructure</button>
    <button className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow">Education</button>
    <button className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow">Public Safety</button>
    <button className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow">Transportation</button>
    <button className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow">Healthcare</button>
    <button className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow">Housing</button>
    <button className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 shadow">Clear Filters</button>
  </div>
  <div className="bg-white rounded-lg shadow-lg w-full" style={{ minHeight: '90vh' }}>
    <p className="text-center text-lg  opacity-70">No petitions found with the current filters</p>
  </div>
  
  </>
);
}
