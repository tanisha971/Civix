import React from 'react';

const PetitionCard = ({ petition }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Successful': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeColor = (time) => {
    if (time.includes('minute')) return 'text-green-600';
    if (time.includes('hour')) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(petition.status)}`}>
          {petition.status}
        </span>
        <span className={`text-xs ${getTimeColor(petition.time)}`}>
          {petition.time}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Regarding {petition.title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4">
        {petition.description}
      </p>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{petition.signatures} Signatures</span>
          <span>Goal: {petition.goal}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${(petition.signatures / petition.goal) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
          {petition.category}
        </span>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  );
};

export default PetitionCard;