import React, { useState, useEffect } from "react";
import PetitionStats from "./PetitionStats";
import PetitionFilters from "./PetitionFilters";
import PetitionCard from "./PetitionCard";
import { useNavigate } from "react-router-dom";
import { getPetitions, deletePetition } from "../../services/petitionService";
import { getCurrentUserId } from "../../utils/auth";

const PetitionList = () => {
  const currentUserId = getCurrentUserId();

  const [filters, setFilters] = useState({ type: "All Petitions", category: "All Categories", status: "All Status" });
  const [petitions, setPetitions] = useState([]);
  const [filteredPetitions, setFilteredPetitions] = useState([]);
  const navigate = useNavigate();

  const mapStatusToUI = (status) => {
    switch (status) {
      case "active": return "Active";
      case "under_review": return "Under Review";
      case "closed": return "Closed";
      default: return status;
    }
  };

  const getRelativeTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  // Fetch all petitions on mount
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        const data = await getPetitions(); // fetch ALL from backend

        const normalized = data.map((p) => ({
          ...p,
          status: mapStatusToUI(p.status),
          signaturesCount: typeof p.signaturesCount === 'number' ? p.signaturesCount : 0,
          goal: p.signatureGoal || 100,
          time: getRelativeTime(p.createdAt),
          // derive stable signed flag for card
          signedByCurrentUser: !!p.signedByCurrentUser,
        }));
        // Sort newest → oldest
        normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setPetitions(normalized);
        setFilteredPetitions(normalized); // default = all petitions
      } catch (err) {
        console.error("Error fetching petitions:", err);
      }
    };

    fetchPetitions();
  }, []);

  // Apply filters on frontend side
  useEffect(() => {
    let result = [...petitions];

    if (filters.category !== "All Categories") {
      result = result.filter((p) => p.category === filters.category);
    }

    if (filters.status !== "All Status") {
      result = result.filter((p) => p.status === filters.status);
    }

    if (filters.type === "My Petitions") {
      result = result.filter((p) => p.creator?._id === currentUserId);
    }
    if (filters.type === "Signed by Me") {
      result = result.filter((p) => !!p.signedByCurrentUser);
    }

    setFilteredPetitions(result);
  }, [filters, petitions, currentUserId]);

  const handleFilterChange = (type, value) =>
    setFilters((prev) => ({ ...prev, [type]: value }));

  const handleCreatePetition = () => navigate("/dashboard/petitions/create");

  const handleDelete = async (petitionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this petition?");
    if (!confirmDelete) return;

    try {
      await deletePetition(petitionId);
      setPetitions(prev => prev.filter(p => p._id !== petitionId));
      alert("Petition deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting petition");
    }
  };

  const handleSigned = (petitionId) => {
    if (typeof petitionId === 'string' && petitionId.startsWith('delete_')) {
      // Card already performed the delete API call; just remove locally
      const actualId = petitionId.replace('delete_', '');
      setPetitions(prev => prev.filter(p => p._id !== actualId));
      return;
    } else {
      // Update the list's item to persist signed state across re-renders
      setPetitions(prev => prev.map(p => {
        if (p._id === petitionId) {
          return { ...p, signedByCurrentUser: true, signaturesCount: (p.signaturesCount || 0) + 1 };
        }
        return p;
      }));
      // Navigate user to "Signed by Me" tab to reflect the change immediately
      setFilters(prev => ({ ...prev, type: "Signed by Me" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <h1 className="text-3xl font-bold text-gray-900">Petitions</h1>
        <p className="text-gray-600 mt-1">Browse, sign, and track petitions in your community.</p>

        <PetitionStats onCreatePetition={handleCreatePetition} />
        <PetitionFilters activeFilter={filters} onFilterChange={handleFilterChange} userId={currentUserId} />

        <div className="space-y-3 mt-4">
          {filteredPetitions.length > 0 ? filteredPetitions.map(p => (
            <PetitionCard 
              key={p._id} 
              petition={p} 
              onSigned={handleSigned} 
            />
          )) : (
            <div className="text-center py-8 text-gray-400 text-lg">
              No petitions found with the current filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetitionList;
