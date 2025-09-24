import React, { useState, useEffect } from "react";
import PetitionStats from "./PetitionStats";
import PetitionFilters from "./PetitionFilters";
import PetitionCard from "./PetitionCard";
import { useNavigate } from "react-router-dom";
import { getPetitions } from "../../services/petitionService";
import { getCurrentUserId } from "../../utils/auth";

const PetitionList = () => {
  const currentUserId = getCurrentUserId();

  const [filters, setFilters] = useState({ type: "All Petitions", category: "All Categories", status: "All Status" });
  const [petitions, setPetitions] = useState([]);
  const navigate = useNavigate();

  const mapStatusToUI = (status) => {
    switch (status) {
      case "active": return "Active";
      case "under_review": return "Under Review";
      case "closed": return "Successful";
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

  const fetchPetitions = async () => {
    try {
      const data = await getPetitions({
        category: filters.category !== "All Categories" ? filters.category : undefined,
        status: filters.status !== "All Status" ? filters.status.toLowerCase().replace(" ", "_") : undefined
      });

      const normalized = data.map(p => ({
        ...p,
        status: mapStatusToUI(p.status),
        signatures: p.signaturesCount || 0,
        goal: p.signatureGoal || 100,
        time: getRelativeTime(p.createdAt)
      }));

      setPetitions(normalized);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchPetitions(); }, [filters]);

  const handleFilterChange = (type, value) => setFilters(prev => ({ ...prev, [type]: value }));
  const handleCreatePetition = () => navigate("/dashboard/petitions/create");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <h1 className="text-3xl font-bold text-gray-900">Petitions</h1>
        <p className="text-gray-600 mt-1">Browse, sign, and track petitions in your community.</p>

        <PetitionStats onCreatePetition={handleCreatePetition} />
        <PetitionFilters activeFilter={filters} onFilterChange={handleFilterChange} userId={currentUserId} />

        <div className="space-y-3 mt-4">
          {petitions.length > 0 ? petitions.map(p => (
            <PetitionCard key={p._id} petition={p} onSigned={fetchPetitions} />
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
