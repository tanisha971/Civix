import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreatePetition = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    signatureGoal: 100
  });

  const categories = [
    'Environment', 'Infrastructure', 'Education', 'Transportation',
    'Public Safety', 'Healthcare', 'Housing'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New petition data:', formData);
    navigate('/dashboard/petitions');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Added more left margin to create space from sidebar */}
      <div className="max-w-4xl ml-8 mr-4 px-4 sm:px-6 lg:px-8 pt-4"> {/* Added ml-8 for left spacing */}
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create a New Petition</h1>
          <p className="text-gray-600 mt-1">Complete the form below to create a petition in your community.</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Petition Title Section */}
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

            {/* Category, Location, Goal Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    Kolkata, India
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signature Goal
                  </label>
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

            {/* Description Section */}
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

            {/* Important Information */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-semibold text-yellow-800">
                    Important Information:
                  </p>
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
                Create Petition
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePetition;
