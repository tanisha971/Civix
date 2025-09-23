import React from 'react';

const PetitionFilters = ({ activeFilter, onFilterChange }) => {
  const categories = [
    'All Categories', 'Environment', 'Infrastructure', 'Education', 
    'Transportation', 'Public Safety', 'Healthcare', 'Housing'
  ];

  const petitionTypes = ['All Petitions', 'My Petitions', 'Signed by Me'];

  return (
    <div className="mb-6">
      {/* Petition Type Filters */}
      <div className="flex space-x-4 mb-4 border-b border-gray-200 pb-2">
        {petitionTypes.map((type) => (
          <button
            key={type}
            onClick={() => onFilterChange('type', type)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeFilter.type === type
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onFilterChange('category', category)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              activeFilter.category === category
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
        <button
          onClick={() => onFilterChange('category', 'All Categories')}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default PetitionFilters;