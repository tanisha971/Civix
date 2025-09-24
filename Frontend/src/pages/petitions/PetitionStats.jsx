import React, { useEffect, useState } from "react";
import { getPetitions } from "../../services/petitionService";
import { getSignedPetitions } from "../../services/signatureService";
import { getCurrentUserId } from "../../utils/auth";

const PetitionStats = ({ onCreatePetition }) => {
  // ✅ Get userId from localStorage
  const userId = getCurrentUserId();

  const [myPetitionsCount, setMyPetitionsCount] = useState(0);
  const [signedPetitionsCount, setSignedPetitionsCount] = useState(0);
  const [successfulPetitionsCount, setSuccessfulPetitionsCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!userId) {
          console.warn("User ID not found. Make sure the user is logged in.");
          return;
        }

        const petitions = await getPetitions();

        // ✅ My Petitions
        const myPetitions = petitions.filter(p => p.creator?._id === userId);
        setMyPetitionsCount(myPetitions.length);

        // ✅ Signed Petitions
        const signed = await getSignedPetitions(userId);
        setSignedPetitionsCount(signed.length);

        // ✅ Successful Petitions (status = closed)
        const successful = petitions.filter(p => p.status === "closed");
        setSuccessfulPetitionsCount(successful.length);
      } catch (err) {
        console.error("Error fetching petition stats:", err);
      }
    };

    fetchStats();
  }, [userId]);

  const stats = [
    { title: "My Petitions", count: myPetitionsCount, link: "View Report" },
    { title: "Signed Petitions", count: signedPetitionsCount, link: "View Report" },
    { title: "Successful Petitions", count: successfulPetitionsCount, link: "View Report" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.title}</h3>
          <div className="flex justify-between items-end">
            <span className="text-3xl font-bold text-blue-600">{stat.count}</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              {stat.link}
            </button>
          </div>
        </div>
      ))}

      {/* Create New Petition Card */}
      <div
        className="bg-blue-600 rounded-lg shadow-lg p-6 hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
        onClick={onCreatePetition}
      >
        <div className="w-full h-full flex flex-col items-center justify-center text-center text-white">
          <div className="text-4xl mb-3 font-light">+</div>
          <h3 className="text-xl font-bold mb-2">Create New Petition</h3>
          <p className="text-blue-100 text-sm">
            Start a new petition for your community
          </p>
        </div>
      </div>
    </div>
  );
};

export default PetitionStats;
