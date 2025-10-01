import React, { useEffect, useState } from "react";
import { pollService } from "../../services/pollService"; // Import the service object
import { getCurrentUserId } from "../../utils/auth";

const PollStats = ({ onCreatePoll }) => {
  const userId = getCurrentUserId();

  const [myPollsCount, setMyPollsCount] = useState(0);
  const [votedPollsCount, setVotedPollsCount] = useState(0);
  const [activePollsCount, setActivePollsCount] = useState(0);
  const [closedPollsCount, setClosedPollsCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!userId) {
          console.warn("User ID not found. Make sure the user is logged in.");
          return;
        }

        const polls = await pollService.getPolls(); // Use pollService.getPolls

        // My Polls
        const myPolls = polls.filter(p => p.creator?._id === userId);
        setMyPollsCount(myPolls.length);

        // Active Polls
        const activePolls = polls.filter(p => p.status === "active");
        setActivePollsCount(activePolls.length);

        // Closed Polls
        const closedPolls = polls.filter(p => p.status === "closed");
        setClosedPollsCount(closedPolls.length);

        // Voted Polls
        try {
          const voted = await pollService.getVotedPolls(userId); // Use pollService.getVotedPolls
          setVotedPollsCount(voted.length);
        } catch (err) {
          console.log("Voted polls endpoint not available");
          setVotedPollsCount(0);
        }
      } catch (err) {
        console.error("Error fetching poll stats:", err);
      }
    };

    fetchStats();
  }, [userId]);

  const stats = [
    { title: "Active Polls", count: activePollsCount, link: "View All" },
    { title: "Polls I Voted On", count: votedPollsCount, link: "View Report" },
    { title: "My Polls", count: myPollsCount, link: "View Report" },
    { title: "Closed Polls", count: closedPollsCount, link: "View All" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.title}</h3>
          <div className="flex justify-between items-end">
            <span className="text-3xl font-bold text-green-600">{stat.count}</span>
            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
              {stat.link}
            </button>
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