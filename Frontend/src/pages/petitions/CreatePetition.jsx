import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPetition, editPetition, getPetitionById } from "../../services/petitionService";

const CreatePetition = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    signatureGoal: 100,
    location: "" ,// no default
    lat: null,
    lng: null
  });

  const [loadingLocation, setLoadingLocation] = useState(false);

  const categories = [
    'Environment', 'Infrastructure', 'Education', 'Transportation',
    'Public Safety', 'Healthcare', 'Housing'
  ];

  // Load petition when editing; otherwise, auto-detect location
  useEffect(() => {
    const init = async () => {
      if (isEditMode) {
        try {
          const petition = await getPetitionById(id);
          setFormData({
            title: petition.title || "",
            category: petition.category || "",
            description: petition.description || "",
            signatureGoal: petition.signatureGoal ?? 100,
            location: petition.location || "",
            lat: petition.lat ?? null,
            lng: petition.lng ?? null
          });
        } catch (error) {
          console.error("Failed to load petition:", error);
          alert("Failed to load petition for editing");
          navigate('/dashboard/petitions');
        }
        return;
      }

      if (!navigator.geolocation) return;
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            const country = data.address.country || '';
            setFormData(prev => ({
              ...prev,
              location: city && country ? `${city}, ${country}` : country || city,
              lat: latitude,
              lng: longitude
            }));
          }
        } catch (err) {
          console.error("Failed to detect location:", err);
        } finally {
          setLoadingLocation(false);
        }
      }, (err) => {
        console.warn("User denied location or error:", err);
        setLoadingLocation(false);
      });
    };
    init();
  }, [isEditMode, id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.location) {
        alert("Please enter a location");
        return;
      }
      if (isEditMode) {
        await editPetition(id, formData);
      } else {
        await createPetition(formData);
      }
      navigate("/dashboard/petitions"); // go back to list after creation
    } catch (error) {
      console.error("Failed to submit petition:", error);
      alert(isEditMode ? "Error updating petition" : "Error creating petition");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl ml-8 mr-4 px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Petition' : 'Create a New Petition'}</h1>
          <p className="text-gray-600 mt-1">{isEditMode ? 'Update your petition details below.' : 'Complete the form below to create a petition in your community.'}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Title */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Petition Title</h2>
              <p className="text-gray-500 text-sm mb-3">Give your petition a clear and specific title</p>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter petition title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category, Location, Goal */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a Category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={loadingLocation ? "Detecting location..." : "Enter your city or area"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Signature Goal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Signature Goal</label>
                  <input
                    type="number"
                    name="signatureGoal"
                    value={formData.signatureGoal}
                    onChange={handleChange}
                    min="10"
                    max="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-500 text-sm mb-3">Describe the issue and the change that you would like to see</p>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe your petition in detail..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                required
              />
            </div>

            {/* Important Info */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-semibold text-yellow-800">Important Information:</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    By submitting this petition, you acknowledge that the content is factual to the best of your knowledge and does not contain misleading information.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard/petitions')}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {isEditMode ? 'Update Petition' : 'Create Petition'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePetition;
