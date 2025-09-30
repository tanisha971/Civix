import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer 
} from 'recharts';
import api from '../../services/api';

const OfficialDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [petitionsToReview, setPetitionsToReview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchPetitionsToReview();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/petitions/analytics');
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPetitionsToReview = async () => {
    try {
      const response = await api.get('/petitions?status=active');
      setPetitionsToReview(response.data.petitions || []);
    } catch (error) {
      console.error('Error fetching petitions to review:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePetitionStatus = async (petitionId, status, response) => {
    try {
      await api.put(`/petitions/${petitionId}/status`, {
        status,
        officialResponse: response
      });
      fetchPetitionsToReview();
    } catch (error) {
      console.error('Error updating petition status:', error);
    }
  };

  const verifyPetition = async (petitionId, verified, note) => {
    try {
      await api.put(`/petitions/${petitionId}/verify`, {
        verified,
        verificationNote: note
      });
      fetchPetitionsToReview();
    } catch (error) {
      console.error('Error verifying petition:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900">Public Official Dashboard</h1>
          <p className="text-gray-600 mt-2">Review petitions, manage responses, and view analytics</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Petitions</h3>
            <p className="text-3xl font-bold mt-2">
              {analytics?.overview.totalPetitions || 0}
            </p>
          </div>
          <div className="bg-yellow-500 text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Under Review</h3>
            <p className="text-3xl font-bold mt-2">
              {analytics?.overview.reviewedPetitions || 0}
            </p>
          </div>
          <div className="bg-green-500 text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Active</h3>
            <p className="text-3xl font-bold mt-2">
              {analytics?.overview.activePetitions || 0}
            </p>
          </div>
          <div className="bg-red-500 text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Closed</h3>
            <p className="text-3xl font-bold mt-2">
              {analytics?.overview.closedPetitions || 0}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Petitions by Category */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Petitions by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.petitionsByCategory || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Signature Trends */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Signature Trends (30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.signatureTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Petitions Requiring Review */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-6">Petitions Requiring Review</h3>
          <div className="space-y-4">
            {petitionsToReview.length > 0 ? (
              petitionsToReview.map(petition => (
                <PetitionReviewCard 
                  key={petition._id} 
                  petition={petition}
                  onStatusUpdate={updatePetitionStatus}
                  onVerify={verifyPetition}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No petitions requiring review at this time.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Petition Review Card Component
const PetitionReviewCard = ({ petition, onStatusUpdate, onVerify }) => {
  const [status, setStatus] = useState('under_review');
  const [response, setResponse] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [verificationNote, setVerificationNote] = useState('');

  const handleSubmitReview = () => {
    onStatusUpdate(petition._id, status, response);
    setShowResponseForm(false);
    setResponse('');
  };

  const handleVerify = (verified) => {
    onVerify(petition._id, verified, verificationNote);
    setShowVerifyForm(false);
    setVerificationNote('');
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-lg">{petition.title}</h4>
            {petition.verified && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                ✓ Verified
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-3">{petition.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {petition.category}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              📍 {petition.location}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              👥 {petition.signaturesCount} signatures
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowResponseForm(!showResponseForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📝 Review Petition
        </button>
        <button
          onClick={() => setShowVerifyForm(!showVerifyForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {petition.verified ? '✓ Verified' : '✅ Verify'}
        </button>
      </div>

      {/* Review Form */}
      {showResponseForm && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-semibold mb-3">Official Review</h5>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="under_review">Under Review</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
                <option value="successful">Successful</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Official Response</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Provide an official response to this petition..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmitReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Review
              </button>
              <button
                onClick={() => setShowResponseForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Form */}
      {showVerifyForm && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-semibold mb-3">Petition Verification</h5>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Verification Note (Optional)</label>
              <textarea
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Add a note about the verification..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleVerify(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✅ Verify as Legitimate
              </button>
              <button
                onClick={() => handleVerify(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ❌ Mark as Invalid
              </button>
              <button
                onClick={() => setShowVerifyForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialDashboard;