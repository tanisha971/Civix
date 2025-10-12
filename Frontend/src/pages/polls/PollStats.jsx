import React, { useEffect, useState } from "react";
import { pollService } from "../../services/pollService";
import { getCurrentUserId } from "../../utils/auth";

const PollStats = ({ onCreatePoll, refreshTrigger }) => {
  const userId = getCurrentUserId();
  
  const [stats, setStats] = useState({
    activePolls: 0,
    votedPolls: 0,
    myPolls: 0,
    closedPolls: 0,
    totalPolls: 0,
    loading: true
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        console.warn("User ID not found. Make sure the user is logged in.");
        return;
      }

      // Method 1: Use comprehensive stats API (recommended)
      try {
        const comprehensiveStats = await pollService.getPollStats(userId);
        setStats({
          activePolls: comprehensiveStats.activePolls || 0,
          votedPolls: comprehensiveStats.votedPolls || 0,
          myPolls: comprehensiveStats.myPolls || 0,
          closedPolls: comprehensiveStats.closedPolls || 0,
          totalPolls: comprehensiveStats.totalPolls || 0,
          loading: false
        });
        return;
      } catch (statsError) {
        console.log("Comprehensive stats not available, falling back to individual queries");
      }

      // Method 2: Fetch all polls and calculate stats (fallback)
      const polls = await pollService.getPolls();
      
      // Helper function to normalize user IDs for comparison
      const normalizeId = (u) => typeof u === "string" ? u : (u?._id || u?.id || "");

      // Calculate stats from polls data
      const activePolls = polls.filter(p => 
        p.status === "active" || p.status === "Active"
      ).length;

      const closedPolls = polls.filter(p => 
        p.status === "closed" || p.status === "Closed"
      ).length;

      const myPolls = polls.filter(p => 
        normalizeId(p.creator) === String(userId)
      ).length;

      // Calculate voted polls - check if user has voted in each poll
      let votedPolls = 0;
      for (const poll of polls) {
        if (poll.votes && Array.isArray(poll.votes)) {
          const hasVoted = poll.votes.some(vote => 
            normalizeId(vote.user) === String(userId)
          );
          if (hasVoted) votedPolls++;
        } else if (poll.userHasVoted) {
          votedPolls++;
        }
      }

      setStats({
        activePolls,
        votedPolls,
        myPolls,
        closedPolls,
        totalPolls: polls.length,
        loading: false
      });

    } catch (err) {
      console.error("Error fetching poll stats:", err);
      setError("Failed to load poll statistics");
      setStats(prev => ({ ...prev, loading: false }));
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchStats();
  }, [userId, refreshTrigger]);

  // Auto-refresh stats every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchStats();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loading, userId]);

  const statsData = [
    { 
      title: "Active Polls", 
      count: stats.activePolls, 
      link: "View All",
      
      color: "text-green-600"
    },
    { 
      title: "Polls I Voted On", 
      count: stats.votedPolls, 
      link: "View Report",
      
      color: "text-green-600"
    },
    { 
      title: "My Polls", 
      count: stats.myPolls, 
      link: "View Report",
      
      color: "text-green-600"
    },
    { 
      title: "Closed Polls", 
      count: stats.closedPolls, 
      link: "View All",
      
      color: "text-green-600"
    },
  ];

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="md:col-span-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>Error loading poll statistics: {error}</span>
            <button 
              onClick={fetchStats}
              className="ml-auto text-red-800 hover:text-red-900 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
        {/* Keep create poll card even on error */}
        <div
          className="bg-green-600 rounded-lg shadow-lg p-6 hover:bg-green-700 transition-colors duration-200 cursor-pointer"
          onClick={onCreatePoll}
        >
          <div className="w-full h-full flex flex-col items-center justify-center text-center text-white">
            <div className="text-4xl mb-3 font-light">+</div>
            <h3 className="text-xl font-bold mb-2">Create Poll</h3>
            <p className="text-green-100 text-sm">
              Ask your community a question
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative"
        >
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{stat.title}</h3>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          
          <div className="flex justify-between items-end">
            <span className={`text-3xl font-bold ${stat.color}`}>
              {stat.count}
            </span>
            <button className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors">
              {stat.link}
            </button>
          </div>
          
          {/* Real-time indicator */}
          <div className="mt-2 flex items-center justify-between">
            
            
          </div>
        </div>
      ))}

      {/* Create New Poll Card */}
      <div
        className="bg-green-600 rounded-lg shadow-lg p-6 hover:bg-green-700 transition-colors duration-200 cursor-pointer"
        onClick={onCreatePoll}
      >
        <div className="w-full h-full flex flex-col items-center justify-center text-center text-white">
          <div className="text-4xl mb-3 font-light">+</div>
          <h3 className="text-xl font-bold mb-2">Create Poll</h3>
          <p className="text-green-100 text-sm">
            Ask your community a question
          </p>
        </div>
      </div>
    </div>
  );
};

export default PollStats;