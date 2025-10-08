import React, { useState, useEffect } from "react";
import PollStats from "./PollStats";
import PollFilters from "./PollFilters";
import PollCard from "./PollCard";
import { useNavigate } from "react-router-dom";
import { pollService } from "../../services/pollService";
import { getCurrentUserId } from "../../utils/auth";

const PollList = () => {
  const currentUserId = getCurrentUserId();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    type: "Active Polls",
    location: "All Locations",
    status: "All Status",
  });
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);

  const mapStatusToUI = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "closed":
        return "Closed";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  // SYNCED: Normalize poll function from backend logic
  const normalizePoll = (p) => ({
    ...p,
    status: mapStatusToUI(p.status),
    totalVotes: (p.votes?.length) || p.totalVotes || 0, // SYNCED - use votes array length
    time: getRelativeTime(p.createdAt)
  });

  const getRelativeTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  // Fetch all polls on mount
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const data = await pollService.getPolls();

        const normalized = data.map((p) => normalizePoll(p)); // SYNCED - use normalizePoll function

        // Sort newest → oldest
        normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setPolls(normalized);
        setFilteredPolls(normalized);
      } catch (err) {
        console.error("Error fetching polls:", err);
      }
    };

    fetchPolls();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...polls];

    if (filters.location !== "All Locations") {
      result = result.filter((p) => p.location === filters.location);
    }

    if (filters.status !== "All Status") {
      result = result.filter((p) => p.status === filters.status);
    }

    if (filters.type === "My Polls") {
      result = result.filter((p) => p.creator?._id === currentUserId);
    } else if (filters.type === "Active Polls") {
      result = result.filter((p) => p.status === "Active");
    } else if (filters.type === "Closed Polls") {
      result = result.filter((p) => p.status === "Closed");
    } else if (filters.type === "Polls I Voted On") {
      result = result.filter((p) => p.userHasVoted === true);
    }

    setFilteredPolls(result);
  }, [filters, polls, currentUserId]);

  const handleFilterChange = (type, value) =>
    setFilters((prev) => ({ ...prev, [type]: value }));

  const handleCreatePoll = () => navigate("/dashboard/polls/create");

  const handleEditPoll = (poll) => {
    navigate(`/dashboard/polls/edit/${poll._id}`, {
      state: { poll }
    });
  };

  // SYNCED: Delete function from backend logic with UI enhancements
  const handleDeletePoll = async (pollId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this poll? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await pollService.deletePoll(pollId);
      // SYNCED - handle both _id and id for compatibility
      setPolls(prev => prev.filter(p => p._id !== pollId && p.id !== pollId));
      setFilteredPolls(prev => prev.filter(p => p._id !== pollId && p.id !== pollId));
      alert("Poll deleted successfully!");
    } catch (err) {
      console.error("Error deleting poll:", err);
      alert(err.response?.data?.message || "Error deleting poll"); // SYNCED - improved error handling
    }
  };

  // SYNCED: Vote handler with normalization and instant UI update
  const handleVoted = (pollId, updatedPoll) => {
    if (updatedPoll) {
      const normalized = normalizePoll(updatedPoll); // SYNCED - normalize updated poll
      setPolls(prev => prev.map(p => (p._id === pollId ? normalized : p)));
      setFilteredPolls(prev => prev.map(p => (p._id === pollId ? normalized : p)));
    } else {
      // Fallback: just log for debugging (keeping current behavior)
      console.log("Voted on poll with ID:", pollId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header - KEEPING YOUR BEAUTIFUL UI */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Community Polls</h1>
          <p className="text-gray-600 mt-2">
            Participate in community polls and make your voice heard on local issues.
          </p>
        </div>

        {/* Stats & Filters - KEEPING YOUR UI */}
        <div className="mb-6">
          <PollStats onCreatePoll={handleCreatePoll} />
          <PollFilters
            activeFilter={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Polls List - KEEPING YOUR BEAUTIFUL UI LAYOUT */}
        <div className="space-y-6">
          {filteredPolls.length > 0 ? (
            filteredPolls.map((poll) => (
              <PollCard
                key={poll._id}
                poll={poll}
                onVoted={handleVoted} // SYNCED - passes updated poll data
                onEdit={handleEditPoll}
                onDelete={handleDeletePoll} // SYNCED - uses backend-compatible delete
              />
            ))
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 text-6xl mb-4">🗳️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No polls found with the current filters
              </h3>
              <p className="text-gray-600 mb-8">
                {filters.type === "My Polls"
                  ? "You haven't created any polls yet."
                  : "Try adjusting your filters or check back later."}
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => handleFilterChange("type", "Active Polls")}
                  className="px-5 py-2 text-sm font-medium text-blue-600 border border-blue-400 rounded-lg hover:bg-blue-50 transition"
                >
                  Clear Filters
                </button>
                <button
                  onClick={handleCreatePoll}
                  className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create New Poll
                </button>
              </div>

              <div className="mt-10 max-w-md mx-auto text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Have a question for your community?
                </h4>
                <p className="text-gray-600 text-sm">
                  Create a poll to gather input and understand public sentiment
                  on local issues.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollList;
