import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import petitionService from "../../services/petitionService";
import { getCurrentUserId, isAuthenticated } from "../../utils/auth";
import LocationOnIcon from '@mui/icons-material/LocationOn';

const PetitionCard = ({ petition, onSigned }) => {
  const navigate = useNavigate();
  const [signed, setSigned] = useState(false);
  const [signaturesCount, setSignaturesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingSignature, setCheckingSignature] = useState(true);
  const currentUserId = getCurrentUserId();
  const userIsAuthenticated = isAuthenticated();
  const isCreator = petition.creator?._id === currentUserId;

  // Check if user has signed this petition on component mount
  useEffect(() => {
    const checkUserSignature = async () => {
      try {
        setCheckingSignature(true);
        
        // Set initial values from petition prop
        setSigned(petition.userHasSigned || petition.signedByCurrentUser || false);
        setSignaturesCount(petition.signaturesCount || 0);
        
        console.log('Initial petition data:', {
          id: petition._id,
          userHasSigned: petition.userHasSigned,
          signedByCurrentUser: petition.signedByCurrentUser,
          signaturesCount: petition.signaturesCount,
          currentUserId,
          userIsAuthenticated
        });
        
        // If we have a user ID, fetch fresh petition data to confirm signature status
        if (currentUserId && userIsAuthenticated) {
          try {
            const freshPetition = await petitionService.getPetitionById(petition._id);
            if (freshPetition.success) {
              const petitionData = freshPetition.petition;
              setSigned(petitionData.userHasSigned || petitionData.signedByCurrentUser || false);
              setSignaturesCount(petitionData.signaturesCount || 0);
              
              console.log('Fresh petition data:', {
                userHasSigned: petitionData.userHasSigned,
                signedByCurrentUser: petitionData.signedByCurrentUser,
                signaturesCount: petitionData.signaturesCount
              });
            }
          } catch (error) {
            console.log('Error fetching fresh petition data, using prop data');
          }
        }
      } catch (error) {
        console.error('Error checking signature status:', error);
        // Fallback to prop values
        setSigned(petition.userHasSigned || petition.signedByCurrentUser || false);
        setSignaturesCount(petition.signaturesCount || 0);
      } finally {
        setCheckingSignature(false);
      }
    };

    checkUserSignature();
  }, [petition._id, petition.userHasSigned, petition.signedByCurrentUser, petition.signaturesCount, currentUserId, userIsAuthenticated]);

  const handleSign = async () => {
    console.log('=== SIGN PETITION DEBUG ===');
    console.log('User authenticated:', userIsAuthenticated);
    console.log('Current user ID:', currentUserId);
    console.log('Already signed:', signed);
    console.log('Is creator:', isCreator);
    
    // Check authentication first
    if (!userIsAuthenticated || !currentUserId) {
      alert("Please login to sign petitions");
      navigate('/login');
      return;
    }

    // Check if already signed
    if (signed) {
      alert("You have already signed this petition!");
      return;
    }

    // Check if user is the creator
    if (isCreator) {
      alert("You cannot sign your own petition!");
      return;
    }

    const confirmSign = window.confirm("Do you want to sign this petition?");
    if (!confirmSign) return;

    try {
      setLoading(true);
      console.log('Attempting to sign petition:', petition._id);
      
      const result = await petitionService.signPetition(petition._id);
      
      console.log('Sign petition result:', result);
      
      if (result.success) {
        setSigned(true);
        const newCount = result.signatureCount || signaturesCount + 1;
        setSignaturesCount(newCount);
        
        // Call parent callback to update the petition list
        if (onSigned) {
          onSigned(petition._id, {
            signed: true,
            signaturesCount: newCount
          });
        }
        
        alert("You have successfully signed this petition!");
      }
    } catch (err) {
      console.error("Error signing petition:", err);
      
      if (err.response?.status === 400) {
        const message = err.response?.data?.message || "You have already signed this petition!";
        setSigned(true);
        
        // Update signature count even if already signed
        if (err.response?.data?.signatureCount) {
          setSignaturesCount(err.response.data.signatureCount);
        }
        
        alert(message);
      } else if (err.response?.status === 401) {
        alert("Please login to sign petitions");
        navigate('/login');
      } else {
        alert(err.response?.data?.message || "Error signing petition. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this petition? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      console.log("Deleting petition:", petition._id);
      await petitionService.deletePetition(petition._id);
      
      // Call parent callback to remove from UI
      onSigned?.(`delete_${petition._id}`);
      alert("Petition deleted successfully!");
    } catch (err) {
      console.error("Error deleting petition:", err);
      alert(err.response?.data?.message || "Error deleting petition");
    }
  };

  const handleEdit = () => {
    navigate(`/dashboard/petitions/create`, {
      state: { petition }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "active": return "bg-green-100 text-green-800";
      case "Under Review": return "bg-blue-100 text-blue-800";
      case "under_review": return "bg-blue-100 text-blue-800";
      case "Closed": return "bg-purple-100 text-purple-800";
      case "closed": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeColor = (time) => {
    if (!time) return "text-gray-600";
    if (time.includes("minute")) return "text-green-600";
    if (time.includes("hour")) return "text-blue-600";
    if (time.includes("day")) return "text-purple-600";
    return "text-gray-600";
  };

  // Calculate progress percentage - FIXED
  const signatureGoal = petition.signatureGoal || 100;
  const progressPercentage = Math.min((signaturesCount / signatureGoal) * 100, 100);

  if (checkingSignature) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-16 bg-gray-200 rounded mb-4"></div>
        <div className="h-3 bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-between">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(petition.status)}`}>
            {petition.status === 'active' ? 'Active' : petition.status}
          </span>
          
          {/* Edit/Delete buttons for creator - MOVED HERE */}
          {isCreator && userIsAuthenticated && (
            <div className="flex gap-1">
              <button
                onClick={handleEdit}
                className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        
        <span className={`text-xs ${getTimeColor(petition.time)}`}>
          {petition.time || 'Recently'}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{petition.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{petition.description}</p>

      {/* Progress Section - FIXED */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span><strong>{signaturesCount}</strong> Signatures</span>
          <span>Goal: <strong>{signatureGoal}</strong></span>
        </div>
        
        {/* Progress Bar - FIXED */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ease-in-out ${
              progressPercentage >= 100 ? 'bg-green-500' :
              progressPercentage >= 80 ? 'bg-blue-500' :
              progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{Math.round(progressPercentage)}% complete</span>
          <span>{Math.max(0, signatureGoal - signaturesCount)} signatures needed</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
            {petition.category}
          </span>
          
          {/* Location Card - UPDATED WITH MUI ICON */}
          <div className="flex items-center">
            <div className="p-1">
              <LocationOnIcon className="text-blue-600" style={{ fontSize: '18px' }} />
            </div>
            <div className="ml-2">
              <p className="text-xs font-semibold text-blue-900 truncate" title={petition.location}>
                {petition.location || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Sign button - FIXED LOGIC */}
        <button
          onClick={handleSign}
          disabled={signed || loading || isCreator || !userIsAuthenticated}
          className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-200 ${
            !userIsAuthenticated
              ? "bg-gray-400 cursor-not-allowed"
              : isCreator
              ? "bg-gray-400 cursor-not-allowed"
              : signed 
              ? "bg-green-500 cursor-default" 
              : loading
              ? "bg-gray-400 cursor-wait"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          }`}
        >
          {!userIsAuthenticated ? (
            "Login to Sign"
          ) : isCreator ? (
            "Your Petition"
          ) : loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing...
            </div>
          ) : signed ? (
            "✓ Signed"
          ) : (
            "Sign Petition"
          )}
        </button>
      </div>
    </div>
  );
};

export default PetitionCard;
