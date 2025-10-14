import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Add this import
import PetitionStats from "./PetitionStats";
import PetitionFilters from "./PetitionFilters";
import PetitionCard from "./PetitionCard";
import { useNavigate } from "react-router-dom";
import petitionService from "../../services/petitionService"; // Import default export
import { getCurrentUserId } from "../../utils/auth";
import { Alert, Box, Chip } from "@mui/material"; // Add these imports

const PetitionList = () => {
  const currentUserId = getCurrentUserId();
  const navigate = useNavigate();

  // Add search params handling
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const highlightId = searchParams.get('highlight');
  const fromSearch = searchParams.get('from') === 'search';

  const [filters, setFilters] = useState({ 
    type: "All Petitions", 
    category: "All Categories", 
    status: "All Status" 
  });
  const [petitions, setPetitions] = useState([]);
  const [filteredPetitions, setFilteredPetitions] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger

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

  // Function to sort petitions with highlighted item at top
  const sortPetitionsWithHighlight = (petitionsArray) => {
    if (!highlightId) {
      return petitionsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const highlightedPetition = petitionsArray.find(p => p._id === highlightId || p.id === highlightId);
    const otherPetitions = petitionsArray.filter(p => p._id !== highlightId && p.id !== highlightId);
    
    // Sort other petitions by date
    otherPetitions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Return highlighted petition first, then others
    return highlightedPetition ? [highlightedPetition, ...otherPetitions] : otherPetitions;
  };

  // Function to filter petitions based on search query
  const filterPetitionsBySearch = (petitionsArray) => {
    if (!searchQuery) return petitionsArray;
    
    const query = searchQuery.toLowerCase();
    return petitionsArray.filter(petition => 
      petition.title?.toLowerCase().includes(query) ||
      petition.description?.toLowerCase().includes(query) ||
      petition.location?.toLowerCase().includes(query) ||
      petition.category?.toLowerCase().includes(query)
    );
  };

  // Fetch all petitions on mount
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        const data = await petitionService.getAllPetitions(); // Use correct method
        const petitions = data.petitions || data; // Handle different response formats

        const normalized = petitions.map((p) => ({
          ...p,
          status: mapStatusToUI(p.status),
          signaturesCount: typeof p.signaturesCount === 'number' ? p.signaturesCount : 0,
          goal: p.signatureGoal || 100,
          time: getRelativeTime(p.createdAt),
          // derive stable signed flag for card
          signedByCurrentUser: !!p.signedByCurrentUser,
        }));

        // Apply search filter if coming from search
        let processedPetitions = normalized;
        if (fromSearch && searchQuery) {
          processedPetitions = filterPetitionsBySearch(normalized);
        }
        
        // Sort with highlight priority
        const sortedPetitions = sortPetitionsWithHighlight(processedPetitions);

        setPetitions(sortedPetitions);
        setFilteredPetitions(sortedPetitions); // default = all petitions
      } catch (err) {
        console.error("Error fetching petitions:", err);
      }
    };

    fetchPetitions();
  }, [searchQuery, highlightId, fromSearch]); // Add dependencies

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

    // Maintain highlight order even after filtering
    const sortedResult = sortPetitionsWithHighlight(result);
    setFilteredPetitions(sortedResult);
  }, [filters, petitions, currentUserId, highlightId]); // Add highlightId dependency

  const handleFilterChange = (type, value) =>
    setFilters((prev) => ({ ...prev, [type]: value }));

  const handleCreatePetition = () => navigate("/dashboard/petitions/create");

  const handleDelete = async (petitionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this petition?");
    if (!confirmDelete) return;

    try {
      await petitionService.deletePetition(petitionId); // Use correct method
      setPetitions(prev => prev.filter(p => p._id !== petitionId));
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
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
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
      return;
    } else {
      // Update the list's item to persist signed state across re-renders
      setPetitions(prev => prev.map(p => {
        if (p._id === petitionId) {
          return { ...p, signedByCurrentUser: true, signaturesCount: (p.signaturesCount || 0) + 1 };
        }
        return p;
      }));
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
      // Navigate user to "Signed by Me" tab to reflect the change immediately
      setFilters(prev => ({ ...prev, type: "Signed by Me" }));
    }
  };

  // Function to clear search context
  const clearSearch = () => {
    setSearchParams({});
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Community Petitions</h1>
          <p className="text-gray-600 mt-2">
            Start or sign petitions to bring change to your community.
          </p>
        </div>

        {/* Search Context Alert */}
        {fromSearch && searchQuery && (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={`"${searchQuery}"`} 
                  size="small"
                  sx={{ 
                    bgcolor: '#ADFF2F', 
                    color: '#000',
                    fontWeight: 'bold'
                  }}
                />
                <button
                  onClick={clearSearch}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1976d2',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '14px'
                  }}
                >
                  Clear
                </button>
              </Box>
            }
          >
            <strong>Search Results:</strong> Showing petitions matching your search query
            {highlightId && <span> • Selected petition is highlighted at the top</span>}
          </Alert>
        )}

        {/* Stats & Filters */}
        <PetitionStats onCreatePetition={handleCreatePetition} refreshTrigger={refreshTrigger} />
        <PetitionFilters 
          activeFilter={filters} 
          onFilterChange={handleFilterChange} 
          userId={currentUserId}
          refreshTrigger={refreshTrigger}
        />

        {/* Petitions List */}
        <div className="space-y-6 mt-4">
          {filteredPetitions.length > 0 ? (
            filteredPetitions.map((petition, index) => {
              const isHighlighted = petition._id === highlightId || petition.id === highlightId;
              return (
                <div
                  key={petition._id}
                  className={`relative ${
                    isHighlighted 
                      ? 'ring-4 ring-yellow-300 ring-opacity-50 bg-yellow-50 rounded-lg p-2' 
                      : ''
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-2 left-4 z-10">
                      <Chip
                        label="📍 From Search"
                        size="small"
                        sx={{
                          bgcolor: '#ADFF2F',
                          color: '#000',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          height: '20px'
                        }}
                      />
                    </div>
                  )}
                  <PetitionCard 
                    petition={petition} 
                    onSigned={handleSigned}
                    onDelete={handleDelete}
                    isHighlighted={isHighlighted}
                    searchQuery={fromSearch ? searchQuery : null}
                  />
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 text-6xl mb-4">✍️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {fromSearch && searchQuery 
                  ? `No petitions found for "${searchQuery}"`
                  : "No petitions found with the current filters"
                }
              </h3>
              <p className="text-gray-600 mb-8">
                {fromSearch && searchQuery
                  ? "Try adjusting your search terms or browse all petitions."
                  : filters.type === "My Petitions"
                    ? "You haven't created any petitions yet."
                    : "Try adjusting your filters or check back later."
                }
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {fromSearch && searchQuery ? (
                  <button
                    onClick={clearSearch}
                    className="px-5 py-2 text-sm font-medium text-blue-600 border border-blue-400 rounded-lg hover:bg-blue-50 transition"
                  >
                    Browse All Petitions
                  </button>
                ) : (
                  <button
                    onClick={() => handleFilterChange("type", "All Petitions")}
                    className="px-5 py-2 text-sm font-medium text-blue-600 border border-blue-400 rounded-lg hover:bg-blue-50 transition"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={handleCreatePetition}
                  className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create New Petition
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetitionList;
