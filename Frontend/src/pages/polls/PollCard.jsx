import React, { useState, useEffect } from "react";
import { getCurrentUserId } from "../../utils/auth";
import { votePoll } from "../../services/pollService";

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

  // SYNCED BACKEND LOGIC for single vote
  const handleVote = async (optionIdx = null) => {
    // If optionIdx is provided, use single vote logic (from backend sync)
    if (optionIdx !== null) {
      if (voted) return;
      
      try {
        setIsVoting(true);
        const updatedPoll = await votePoll(poll._id, optionIdx);
        setVoted(true);
        setVotedOption(optionIdx);
        onVoted?.(poll._id, updatedPoll);
        alert("You have successfully voted in this poll!");
      } catch (err) {
        console.error("Error voting:", err);
        alert(err.response?.data?.message || "Error voting in poll");
      } finally {
        setIsVoting(false);
      }
      return;
    }

    // Multi-select vote logic (keeping current UI functionality)
    if (selectedOptions.length === 0) {
      alert("Please select at least one option before voting.");
      return;
    }

    if (voted) {
      alert("You have already voted in this poll!");
      return;
    }

    if (isCreator) {
      alert("You cannot vote on your own poll!");
      return;
    }

    if (poll.status === "Closed") {
      alert("This poll is closed for voting!");
      return;
    }

    const confirmVote = window.confirm(
      `Do you want to vote for: ${selectedOptions.map(i => poll.options[i]?.text).join(', ')}?`
    );
    if (!confirmVote) return;

    try {
      setIsVoting(true);
      // For multi-select, vote for the first selected option (backend compatibility)
      const updatedPoll = await votePoll(poll._id, selectedOptions[0]);
      
      setVoted(true);
      setVotedOption(selectedOptions[0]);
      setSelectedOptions([]);
      
      onVoted?.(poll._id, updatedPoll);
      
      alert("You have successfully voted in this poll!");
    } catch (err) {
      console.error("Error voting:", err);
      alert(err.response?.data?.message || "Error voting in poll");
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
      alert("Error deleting poll");
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

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
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
                className="px-3 py-1 bg-yellow-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors"
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
        <span className="text-xs text-gray-500">{poll.time}</span>
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
                onClick={() => !voted ? handleOptionSelect(index) : handleVote(index)} // SYNCED - allow direct voting
                className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  voted || poll.status === "Closed"
                    ? isVotedOption 
                      ? "border-green-500 bg-green-50" // SYNCED - highlight voted option
                      : "cursor-not-allowed opacity-60"
                    : isCreator
                    ? "cursor-not-allowed opacity-60"
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
                      {optionVotes} votes {/* SYNCED - use optionCounts */
                      }
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

      {/* Location and Closing Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm font-medium text-gray-700">{poll.location}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <div>
            <p className="text-xs text-gray-500">Closes on</p>
            <p className="text-sm font-medium text-gray-700">
              {poll.expiresAt ? formatDate(poll.expiresAt) : 'No end date'}
            </p>
          </div>
        </div>
      </div>

      {/* Vote Summary */}
      <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm">
          <span className="font-semibold text-blue-900">{totalVotes}</span> {/* SYNCED */}
          <span className="text-blue-700"> total votes</span>
        </div>
        <div className="text-sm">
          <span className="text-blue-700">Goal: </span>
          <span className="font-semibold text-blue-900">{poll.voteGoal || 100}</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
            {poll.category}
          </span>
          <span className="text-xs text-gray-500">
            by {poll.creator?.name || poll.creator}
          </span>
        </div>

        {/* Vote Button - UPDATED FOR BACKEND COMPATIBILITY */}
        {!isCreator && (
          <button
            onClick={() => handleVote()} // Multi-select vote
            disabled={voted || isVoting || poll.status === "Closed" || selectedOptions.length === 0}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
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
        )}
        
        {/* Creator message */}
        {isCreator && (
          <div className="text-sm text-gray-500 italic">
            You created this poll
          </div>
        )}
      </div>

      {/* Voting instruction - UPDATED */}
      {!voted && poll.status !== "Closed" && !isCreator && (
        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-700 text-center">
          💡 Click an option to vote directly, or select multiple and click Vote button
        </div>
      )}
    </div>
  );
};

export default PollCard;
