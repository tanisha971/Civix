import React, { useState, useEffect } from "react";
import { getCurrentUserId } from "../../utils/auth";
import { votePoll } from "../../services/pollService";
// Add MUI icon imports
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

const PollCard = ({ poll, onVoted, onEdit, onDelete }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [voted, setVoted] = useState(false);
  const [votedOption, setVotedOption] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  
  const currentUserId = getCurrentUserId();
  const isCreator = poll.creator === currentUserId || poll.creator?._id === currentUserId;

  // Count votes for each option - SYNCED FROM BACKEND LOGIC
  const optionCounts = (poll.options || []).map((_, idx) =>
    (poll.votes || []).filter(v => v.option === idx).length
  );

  // Check if user has already voted (persist after refresh) - SYNCED FROM BACKEND LOGIC
  useEffect(() => {
    if (!poll?.votes || !currentUserId) return;
    const normalizeId = (u) => typeof u === "string" ? u : (u?._id || u?.id || "");
    const hasVoted = poll.votes.some(v => normalizeId(v.user) === String(currentUserId));
    if (hasVoted) {
      setVoted(true);
      const userVote = poll.votes.find(v => normalizeId(v.user) === String(currentUserId));
      setVotedOption(userVote?.option);
    }
  }, [poll, currentUserId]);

  const handleOptionSelect = (optionIndex) => {
    if (voted || poll.status === "Closed") return;

    setSelectedOptions(prev => {
      if (prev.includes(optionIndex)) {
        return prev.filter(i => i !== optionIndex);
      } else {
        return [...prev, optionIndex];
      }
    });
  };

  // Direct voting on option click - no alerts
  const handleDirectVote = async (optionIdx) => {
    if (voted || poll.status === "Closed" || isVoting) return;
    
    try {
      setIsVoting(true);
      const updatedPoll = await votePoll(poll._id, optionIdx);
      setVoted(true);
      setVotedOption(optionIdx);
      onVoted?.(poll._id, updatedPoll);
    } catch (err) {
      console.error("Error voting:", err);
    } finally {
      setIsVoting(false);
    }
  };

  // Multi-select vote logic (keeping current UI functionality)
  const handleVote = async () => {
    if (selectedOptions.length === 0 || voted || poll.status === "Closed" || isVoting) return;

    try {
      setIsVoting(true);
      // For multi-select, vote for the first selected option (backend compatibility)
      const updatedPoll = await votePoll(poll._id, selectedOptions[0]);
      
      setVoted(true);
      setVotedOption(selectedOptions[0]);
      setSelectedOptions([]);
      
      onVoted?.(poll._id, updatedPoll);
    } catch (err) {
      console.error("Error voting:", err);
    } finally {
      setIsVoting(false);
    }
  };

  // SYNCED DELETE LOGIC
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this poll? This action cannot be undone.");
    if (!confirmDelete) return;
    
    try {
      await onDelete?.(poll._id); // Call parent handler - SYNCED
    } catch (err) {
      console.error("Error deleting poll:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "active": return "bg-green-100 text-green-800";
      case "Closed": return "bg-red-100 text-red-800";
      case "closed": return "bg-red-100 text-red-800";
      case "Draft": return "bg-yellow-100 text-yellow-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeColor = (time) => {
    if (!time) return "text-gray-600";
    if (time.includes("minute")) return "text-green-600";
    if (time.includes("hour")) return "text-blue-600";
    if (time.includes("day")) return "text-purple-600";
    return "text-gray-600";
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'Not specified';
    }
  };

  // UPDATED: Use backend vote counting logic
  const getTotalVotes = () => {
    return (poll.votes || []).length; // SYNCED - use votes array length
  };

  const getVotePercentage = (optionIndex, totalVotes) => {
    if (totalVotes === 0) return 0;
    const optionVotes = optionCounts[optionIndex]; // SYNCED - use optionCounts
    return Math.round((optionVotes / totalVotes) * 100);
  };

  const totalVotes = getTotalVotes(); // SYNCED

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 hover:shadow-lg transition-shadow relative">
      
      {/* Header - UPDATED: Edit/Delete buttons on the left side */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(poll.status)}`}>
            {poll.status}
          </span>
          {isCreator && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              Your Poll
            </span>
          )}
          {/* Edit/Delete buttons for creator - MOVED HERE */}
          {isCreator && (
            <div className="flex gap-2 mr-3">
              <button
                onClick={() => onEdit?.(poll)}
                className="px-3 py-1 bg-yellow-500 text-white rounded-md text-xs font-medium hover:bg-yellow-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 text-white rounded-md text-xs font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <span className={`text-xs ${getTimeColor(poll.time)}`}>{poll.time}</span>
      </div>

      {/* Poll Question */}
      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight pr-20">
        {poll.question}
      </h3>

      {/* Poll Description */}
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
        {poll.description}
      </p>

      {/* Poll Options */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Options:</h4>
        <div className="space-y-3">
          {poll.options?.map((option, index) => {
            const isSelected = selectedOptions.includes(index);
            const optionVotes = optionCounts[index]; // SYNCED - use optionCounts
            const votePercentage = getVotePercentage(index, totalVotes);
            const isVotedOption = voted && votedOption === index; // SYNCED
            
            return (
              <div
                key={index}
                onClick={() => voted || poll.status === "Closed" ? null : handleDirectVote(index)}
                className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  voted || poll.status === "Closed"
                    ? isVotedOption 
                      ? "border-green-500 bg-green-50" // SYNCED - highlight voted option
                      : "cursor-not-allowed opacity-60"
                    : isSelected
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-400 hover:bg-green-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      (isSelected || isVotedOption)
                        ? "border-green-500 bg-green-500" 
                        : "border-gray-300"
                    }`}>
                      {(isSelected || isVotedOption) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {typeof option === 'string' ? option : option.text} {/* SYNCED - handle both formats */}
                      {isVotedOption && <span className="text-green-600 ml-2">✓ Your vote</span>} {/* SYNCED */}
                    </span>
                  </div>
                  
                  {/* Vote count and percentage */}
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-700">
                      {optionVotes} votes {/* SYNCED - use optionCounts */}
                    </span>
                    {totalVotes > 0 && (
                      <div className="text-xs text-gray-500">
                        {votePercentage}%
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Vote progress bar */}
                {totalVotes > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isVotedOption ? 'bg-green-600' : 'bg-green-500'
                        }`} // SYNCED - different color for voted option
                        style={{ width: `${votePercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ENHANCED: Poll Information Cards with MUI Icons */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
            {poll.category}
          </span>
          <span className="text-xs text-gray-500">
            by {poll.creator?.name || poll.creator}
          </span>
        </div>
        
        {/* Location Card */}
        <div className="flex items-center">
          <div className="p-1">
            <LocationOnIcon className="text-blue-600" style={{ fontSize: '18px' }} />
          </div>
          <div className="ml-2">
            <p className="text-xs font-semibold text-blue-900 truncate" title={poll.location}>
              {poll.location || 'Not specified'}
            </p>
          </div>
        </div>
        
        {/* Closing Date Card */}
        <div className="flex items-center">
          <div className="p-1">
            <EventIcon className="text-orange-600" style={{ fontSize: '18px' }} />
          </div>
          <div className="ml-2">
            <p className="text-xs font-semibold text-orange-900 truncate">
              Closing: {poll.expiresAt ? formatDate(poll.expiresAt) : 'No end date'}
            </p>
          </div>
        </div>

        {/* Total Votes Card */}
        <div className="flex items-center">
          <div className="p-1">
            <HowToVoteIcon className="text-green-600" style={{ fontSize: '18px' }} />
          </div>
          <div className="ml-2">
            <p className="text-xs font-semibold text-green-900">
              Total Votes: {totalVotes.toLocaleString()}
            </p>
          </div>
        </div>
  
        {/* Vote Button - UPDATED FOR BACKEND COMPATIBILITY */}
        <div className="flex justify-end">
          <button
            onClick={() => handleVote()} // Multi-select vote
            disabled={voted || isVoting || poll.status === "Closed" || selectedOptions.length === 0}
            className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-200 ${
              voted
                ? "bg-green-500 text-white cursor-default"
                : poll.status === "Closed"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : selectedOptions.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isVoting
                ? "bg-blue-400 text-white cursor-wait"
                : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
            }`}
          >
            {isVoting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Voting...
              </div>
            ) : voted ? (
              "✓ Voted"
            ) : poll.status === "Closed" ? (
              "Poll Closed"
            ) : selectedOptions.length === 0 ? (
              "Select Options"
            ) : (
              `Vote (${selectedOptions.length} selected)`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollCard;
