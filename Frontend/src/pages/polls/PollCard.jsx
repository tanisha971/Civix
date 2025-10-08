import React, { useState } from "react";
import { votePoll } from "../../services/pollService";

const PollCard = ({ poll, onVoted }) => {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(poll.votes || 0);

  const handleVote = async () => {
    const confirmVote = window.confirm("Do you want to vote for this poll?");
    if (!confirmVote) return;

    try {
      await votePoll(poll._id);
      setVoted(true);
      setVotes(prev => prev + 1); // increment vote count locally
      onVoted?.(); // callback to parent if needed
      alert("You have successfully voted in this poll!");
    } catch (err) {
      alert(err.response?.data?.message || "Error voting in poll");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Closed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(poll.status)}`}>
          {poll.status}
        </span>
        <span className="text-xs text-gray-500">{poll.time}</span>
      </div>

      {/* Body */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">{poll.question}</h3>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{poll.description}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{votes} Votes</span>
          <span>Goal: {poll.voteGoal}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div
            className="bg-green-600 h-2 rounded-full"
            style={{ width: `${Math.min((votes / poll.voteGoal) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">{poll.category}</span>
        <button
          onClick={handleVote}
          disabled={voted}
          className={`px-3 py-1.5 text-sm font-medium rounded-md text-white ${voted ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {voted ? 'Voted' : 'Vote'}
        </button>
      </div>
    </div>
  );
};

export default PollCard;
