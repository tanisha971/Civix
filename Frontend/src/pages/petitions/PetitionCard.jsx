import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signPetition, deletePetition as deletePetitionApi, getPetitionById } from "../../services/petitionService";
import { getCurrentUserId } from "../../utils/auth";

const PetitionCard = ({ petition, onSigned }) => {
  const navigate = useNavigate();
  const [signed, setSigned] = useState(!!petition.signedByCurrentUser);
  const [signaturesCount, setSignaturesCount] = useState(petition.signaturesCount || 0);
  const currentUserId = getCurrentUserId();
  const isCreator = petition.creator?._id === currentUserId;

  // Keep local `signed` state in sync with parent-provided prop
  useEffect(() => {
    if (petition.signedByCurrentUser && !signed) {
      setSigned(true);
    }
  }, [petition.signedByCurrentUser, signed]);

  const handleSign = async () => {
    const confirmSign = window.confirm("Do you want to Sign this petition?");
    if (!confirmSign) return;

    // Local guard: if already signed, avoid calling API and double-increment
    if (signed || petition.signedByCurrentUser) {
      alert("You've already signed this petition.");
      setSigned(true);
      return;
    }

    try {
      await signPetition(petition._id);
      setSigned(true);
      setSignaturesCount(prev => prev + 1); // increment signature count locally
      onSigned?.(petition._id); // Pass petition ID to parent callback
      alert("You have successfully signed this petition!");
    } catch (err) {
      const message = err?.response?.data?.message;
      if (err?.response?.status === 400 && message?.toLowerCase().includes("already signed")) {
        // Reflect backend state that user had already signed
        setSigned(true);
        // Sync signatures count from server
        try {
          const data = await getPetitionById(petition._id);
          const latest = data?.petition || data;
          const latestCount = Array.isArray(latest?.signatures)
            ? latest.signatures.length
            : (typeof latest?.signaturesCount === 'number' ? latest.signaturesCount : undefined);
          if (typeof latestCount === 'number') {
            setSignaturesCount(latestCount);
          }
        } catch (_) {
          // ignore sync errors, we already marked as signed
        }
        alert("You've already signed this petition.");
        return;
      }
      if (err?.response?.status === 404 && message?.toLowerCase().includes("petition not found")) {
        // Remove stale card from list if it was deleted elsewhere
        onSigned?.(`delete_${petition._id}`);
        alert("This petition no longer exists.");
        return;
      }
      // Show more specific messages by status code
      const status = err?.response?.status;
      if (status === 401) {
        alert("You must be logged in to sign this petition.");
        return;
      }
      if (status === 403) {
        alert("You do not have permission to perform this action.");
        return;
      }
      if (status === 429) {
        alert("Too many requests. Please try again later.");
        return;
      }
      if (status >= 500 && status < 600) {
        alert("Server error while signing petition. Please try again.");
        return;
      }
      // Final fallback with raw info in console for debugging
      console.error("Sign petition error:", err);
      alert(message || err?.response?.data?.error || err?.message || "Error signing petition");
    }
  };

  const normalizedStatus = useMemo(() => {
    if (!petition.status) return "Active";
    const s = String(petition.status).toLowerCase();
    if (s === "active") return "Active";
    if (s === "under_review" || s === "under review") return "Under Review";
    if (s === "closed") return "Closed";
    return petition.status;
  }, [petition.status]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Under Review": return "bg-blue-100 text-blue-800";
      case "Closed": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeSince = (createdAt) => {
    if (!createdAt) return "";
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const getTimeColor = (label) => {
    if (!label) return "text-gray-600";
    if (label.includes("minute")) return "text-green-600";
    if (label.includes("hour")) return "text-blue-600";
    if (label.includes("day")) return "text-purple-600";
    return "text-gray-600";
  };

  const timeLabel = useMemo(() => getTimeSince(petition.createdAt || petition.time), [petition.createdAt, petition.time]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(normalizedStatus)}`}>
          {normalizedStatus}
        </span>
        <span className={`text-xs ${getTimeColor(timeLabel)}`}>
          {timeLabel}
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
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${Math.min((signaturesCount / petition.signatureGoal) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{Math.round((signaturesCount / petition.signatureGoal) * 100)}% complete</span>
          <span>{petition.signatureGoal - signaturesCount} signatures needed</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">{petition.category}</span>
          
          {/* Edit/Delete buttons for creator - positioned on the left */}
          {isCreator && (
            <div className="flex gap-1">
              <button
                onClick={() => window.open(`/dashboard/petitions/edit/${petition._id}`, '_blank')}
                className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  const confirmed = window.confirm("Are you sure you want to delete this petition?");
                  if (!confirmed) return;
                  try {
                    await deletePetitionApi(petition._id);
                    onSigned?.(`delete_${petition._id}`);
                  } catch (error) {
                    alert(error.response?.data?.message || "Error deleting petition");
                  }
                }}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Sign button on the right */}
        <button
          onClick={handleSign}
          disabled={signed}
          className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-200 ${
            signed 
              ? "bg-green-500 cursor-default" 
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          }`}
        >
          {signed ? "✓ Signed" : "Sign Petition"}
        </button>
      </div>
    </div>
  );
};

export default PetitionCard;
