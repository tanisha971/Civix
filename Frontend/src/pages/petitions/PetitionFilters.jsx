import React, { useState } from 'react';

const PetitionFilters = ({ activeFilter, onFilterChange }) => {
  const [dropdowns, setDropdowns] = useState({ location: false, category: false, status: false });

  const petitionTypes = ['All Petitions', 'My Petitions', 'Signed by Me'];
  const locations = ['All Locations', 'New York', 'California', 'Texas', 'Florida', 'Illinois'];
  const categories = ['All Categories', 'Environment', 'Infrastructure', 'Education', 'Transportation', 'Public Safety', 'Healthcare', 'Housing'];
  const statuses = ['All Status', 'Active', 'Under Review', 'Successful'];

  const toggleDropdown = (dropdown) => {
    setDropdowns(prev => ({ ...prev, [dropdown]: !prev[dropdown] }));
  };

  const handleSelect = (type, value) => {
    onFilterChange(type, value);
    setDropdowns(prev => ({ ...prev, [type]: false }));
  };

  return (
    <div className="mb-6 flex justify-between items-center">
      <div className="flex space-x-4">
        {petitionTypes.map(type => (
          <button
            key={type}
            onClick={() => onFilterChange('type', type)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${activeFilter.type === type ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex space-x-4">
        {['location', 'category', 'status'].map(filter => (
          <div className="relative" key={filter}>
            <button
              onClick={() => toggleDropdown(filter)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <span>{activeFilter[filter] || filter}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdowns[filter] && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {(filter === 'location' ? locations : filter === 'category' ? categories : statuses).map(item => (
                  <button key={item} onClick={() => handleSelect(filter, item)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{item}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PetitionFilters;
