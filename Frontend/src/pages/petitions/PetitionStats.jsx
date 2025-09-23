import React from 'react';

const PetitionStats = ({ onCreatePetition, myPetitionsCount = 0 }) => {
  const stats = [
    { title: 'My Petitions', count: myPetitionsCount, link: 'View Report' },
    { title: 'Signed Petitions', count: 12, link: 'View Report' },
    { title: 'Successful Petitions', count: 2, link: 'View Report' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.title}</h3>
          <div className="flex justify-between items-end">
            <span className="text-3xl font-bold text-blue-600">{stat.count}</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              {stat.link}
            </button>
          </div>
        </div>
      ))}
      
      {/* Create New Petition Card - Blue background with white text */}
      <div className="bg-blue-600 rounded-lg shadow-lg p-6 hover:bg-blue-700 transition-colors duration-200 cursor-pointer">
        <div 
          onClick={onCreatePetition}
          className="w-full h-full flex flex-col items-center justify-center text-center text-white"
        >
          <div className="text-4xl mb-3 font-light">+</div>
          <h3 className="text-xl font-bold mb-2">Create New Petition</h3>
          <p className="text-blue-100 text-sm">Start a new petition for your community</p>
        </div>
      </div>
    </div>
  );
};

export default PetitionStats;

