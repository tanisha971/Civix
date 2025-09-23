import React, { useState } from 'react';
import PetitionStats from './PetitionStats';
import PetitionFilters from './PetitionFilters';
import PetitionCard from './PetitionCard';
import { useNavigate } from 'react-router-dom'; // Add this import

const PetitionList = () => {
  const [filters, setFilters] = useState({
    type: 'All Petitions',
    category: 'All Categories'
  });

  const navigate = useNavigate(); // Add this

  // Sample data - replace with API call
  const petitions = [
    {
      id: 1,
      title: 'Increase the Planting of More Trees nearby Top 3 Metro Cities to decrease the amount Poll...',
      description: 'We need more trees in our metropolitan areas to combat pollution and improve air quality for residents.',
      signatures: 65,
      goal: 100,
      category: 'Environment',
      status: 'Active',
      time: 'Less than a minute ago'
    },
    {
      id: 2,
      title: 'Creation of Separate Lane for Two and Four Wheelers in Highways',
      description: 'Creating dedicated lanes will improve traffic flow and reduce accidents on major highways.',
      signatures: 85,
      goal: 100,
      category: 'Transportation',
      status: 'Active',
      time: '5 hours ago'
    },
    {
      id: 3,
      title: 'Establish Free Wi-Fi Zones in Public Parks',
      description: 'Providing free internet access in public spaces will benefit students and remote workers.',
      signatures: 100,
      goal: 100,
      category: 'Infrastructure',
      status: 'Under Review',
      time: '3 hours ago'
    }
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleCreatePetition = () => {
    navigate('/dashboard/petitions/create'); // Change this to navigate to new page
  };

  const filteredPetitions = petitions.filter(petition => {
    if (filters.category !== 'All Categories' && petition.category !== filters.category) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Petitions</h1>
          <p className="text-gray-600 mt-1">Browse, sign, and track petitions in your community.</p>
        </div>

        {/* Stats Section */}
        <PetitionStats onCreatePetition={handleCreatePetition} />

        {/* Filters */}
        <PetitionFilters 
          activeFilter={filters} 
          onFilterChange={handleFilterChange} 
        />

        {/* Petitions List */}
        <div className="space-y-3 mt-4">
          {filteredPetitions.length > 0 ? (
            filteredPetitions.map(petition => (
              <PetitionCard key={petition.id} petition={petition} />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">No petitions found with the current filters</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetitionList;