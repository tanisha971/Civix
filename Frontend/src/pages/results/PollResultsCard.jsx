import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssessmentIcon from '@mui/icons-material/Assessment';

const PollResultsCard = ({ poll, showSentiment = true, isHighlighted = false }) => {
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <CheckCircleIcon className="w-4 h-4" />;
      case 'negative': return <CancelIcon className="w-4 h-4" />;
      default: return <RemoveCircleIcon className="w-4 h-4" />;
    }
  };

  const getEngagementColor = (rate) => {
    if (rate > 5) return 'text-green-600';
    if (rate > 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
      isHighlighted ? 'border-purple-500 shadow-lg bg-purple-50' : ''
    }`}>
      {/* Highlight indicator */}
      {isHighlighted && (
        <div className="mb-4 p-3 bg-purple-100 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <AssessmentIcon className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              Detailed Analysis View
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
            poll.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {poll.status}
          </span>
          
          {showSentiment && (
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 ${getSentimentColor(poll.sentiment)}`}>
              {getSentimentIcon(poll.sentiment)}
              {poll.sentiment}
            </span>
          )}
        </div>
        
        <span className="text-xs text-gray-500">
          {new Date(poll.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2">
        {poll.question}
      </h3>

      {/* Vote Distribution */}
      <div className="space-y-3 mb-6">
        {poll.voteDistribution?.map((option, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 font-medium">
                {option.option}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {option.votes} votes
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {option.percentage}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  index === 0 ? 'bg-blue-500' :
                  index === 1 ? 'bg-green-500' :
                  index === 2 ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`}
                style={{ width: `${option.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {poll.totalVotes}
          </div>
          <div className="text-xs text-gray-500">
            Total Votes
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${getEngagementColor(poll.engagementRate)}`}>
            {poll.engagementRate}
          </div>
          <div className="text-xs text-gray-500">
            Engagement Rate
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {poll.participationRate}%
          </div>
          <div className="text-xs text-gray-500">
            Participation
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <LocationOnIcon className="w-3 h-3" />
            <span>{poll.location || 'No location'}</span>
          </div>
          <span>By {poll.creator?.name || 'Anonymous'}</span>
        </div>
      </div>
    </div>
  );
};

export default PollResultsCard;