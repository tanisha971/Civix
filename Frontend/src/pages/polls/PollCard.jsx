import React, { useState, useEffect } from "react";
import { getCurrentUserId } from "../../utils/auth";
import { votePoll } from "../../services/pollService";

const PollCard = ({ poll, onVoted, onDelete }) => {
  const [voted, setVoted] = useState(false);
  const [votedOption, setVotedOption] = useState(null);
  const currentUserId = getCurrentUserId();
  const isCreator = poll.creator === currentUserId || poll.creator?._id === currentUserId;

  // Count votes for each option
  const optionCounts = (poll.options || []).map((_, idx) =>
    (poll.votes || []).filter(v => v.option === idx).length
  );

  // Check if user has already voted (persist after refresh)
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

  const handleVote = async (optionIdx) => {
    if (voted) return;
    try {
      const updatedPoll = await votePoll(poll._id, optionIdx);
      // updatedPoll may be either the poll or wrapped response; service normalizes to poll
      setVoted(true);
      setVotedOption(optionIdx);
      onVoted?.(poll._id, updatedPoll);
      alert("You have successfully voted in this poll!");
    } catch (err) {
      alert(err.response?.data?.message || "Error voting in poll");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this poll?");
    if (!confirmDelete) return;
    try {
      await onDelete?.(poll._id); // Call parent handler
    } catch (err) {
      alert("Error deleting poll");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-4 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.question}</h3>
      <p className="text-gray-600 text-sm mb-4">{poll.description}</p>
      <ul>
        {(poll.options || []).map((option, idx) => (
          <li key={idx} className="mb-2">
            <button
              onClick={() => handleVote(idx)}
              disabled={voted}
              className={`px-3 py-1 rounded-md text-white w-full ${
                voted
                  ? (votedOption === idx ? "bg-green-500" : "bg-gray-400")
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {option} ({optionCounts[idx]} votes) {voted && votedOption === idx ? "✓" : ""}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          {poll.votes ? poll.votes.length : 0} Total Votes
        </span>
        {isCreator && (
          <button
            onClick={handleDelete}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs ml-2"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default PollCard;