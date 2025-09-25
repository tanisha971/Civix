import React, { useState } from "react";
import { signPetition } from "../../services/petitionService";

const PetitionCard = ({ petition, onSigned }) => {
  const [signed, setSigned] = useState(false);
  const [signaturesCount, setSignaturesCount] = useState(petition.signaturesCount || 0);

  const handleSign = async () => {
    const confirmSign = window.confirm("Do you want to Sign this petition?");
    if (!confirmSign) return;

    try {
      await signPetition(petition._id);
      setSigned(true);
      setSignaturesCount(prev => prev + 1); // increment signature count locally
      onSigned?.(); // callback to parent if needed
      alert("You have successfully signed this petition!");
    } catch (err) {
      alert(err.response?.data?.message || "Error signing petition");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Under Review": return "bg-blue-100 text-blue-800";
      case "Closed": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeColor = (time) => {
    if (time.includes("minute")) return "text-green-600";
    if (time.includes("hour")) return "text-blue-600";
    if (time.includes("day")) return "text-purple-600";
    return "text-gray-600";
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

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{petition.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{petition.description}</p>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{signaturesCount} Signatures</span>
          <span>Goal: {petition.signatureGoal}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${(signaturesCount / petition.signatureGoal) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">{petition.category}</span>
        <button
          onClick={handleSign}
          disabled={signed}
          className={`px-3 py-1 rounded-md text-white ${signed ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {signed ? "Signed" : "Sign Petition"}
        </button>
      </div>
    </div>
  );
};

export default PetitionCard;
