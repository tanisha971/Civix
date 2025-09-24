import React, { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PollIcon from '@mui/icons-material/Poll';
import { getPetitions } from '../../services/petitionService';
import { getCurrentUserId } from '../../utils/auth';

export default function DashboardCard() {
    const [activeCategory, setActiveCategory] = useState('All Categories');
    const [petitions, setPetitions] = useState([]);
    const [filteredPetitions, setFilteredPetitions] = useState([]);
    const [locationFilter, setLocationFilter] = useState('Delhi');

    const categories = [
        'Environment',
        'Infrastructure',
        'Education',
        'Public Safety',
        'Transportation',
        'Healthcare',
        'Housing',
    ];

    const userId = getCurrentUserId();

    // Responsive: detect mobile
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth <= 600 : false
    );

    useEffect(() => {
        const handleResize = () =>
            setIsMobile(typeof window !== 'undefined' ? window.innerWidth <= 600 : false);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch petitions from backend
    useEffect(() => {
        const fetchPetitions = async () => {
            try {
                const data = await getPetitions();
                setPetitions(data);
            } catch (err) {
                console.error("Error fetching petitions:", err);
            }
        };
        fetchPetitions();
    }, []);

    // Filter petitions by category and location
    useEffect(() => {
        let filtered = [...petitions];

        if (activeCategory !== 'All Categories') {
            filtered = filtered.filter(p => p.category === activeCategory);
        }

        if (locationFilter) {
            filtered = filtered.filter(p => p.location.toLowerCase().includes(locationFilter.toLowerCase()));
        }

        setFilteredPetitions(filtered);
    }, [activeCategory, petitions, locationFilter]);

    // Compute stats
    const myPetitionsCount = petitions.filter(p => p.creator?._id === userId).length;
    const successfulPetitionsCount = petitions.filter(p => p.status === 'closed').length;
    const pollsCount = 0;

    return (
      <>
        {/* Cards row: stack on mobile */}
        <div className={isMobile ? "flex flex-col gap-4 mb-8" : "flex flex-row gap-8 mb-8"}>
          {/* My Petitions */}
          <div className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 text-left" style={{ background: '#e3f2fd', color: '#111' }}>
            <div className="flex flex-row items-center justify-between w-full mb-2">
              <span className="text-lg font-semibold">My Petitions</span>
              <span>
                <EditIcon style={{ fontSize: 32 }} />
              </span>
            </div>
            <span className="text-3xl font-bold mb-1">{myPetitionsCount}</span>
            <span className="text-sm opacity-60">petitions</span>
          </div>
          {/* Successful Petitions */}
          <div className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 text-left" style={{ background: '#e3f2fd', color: '#111' }}>
            <div className="flex flex-row items-center justify-between w-full mb-2">
              <span className="text-lg font-semibold">Successful Petitions</span>
              <span>
                <CheckCircleIcon style={{ fontSize: 32 }} />
              </span>
            </div>
            <span className="text-3xl font-bold mb-1">{successfulPetitionsCount}</span>
            <span className="text-sm opacity-60">or under review</span>
          </div>
          {/* Polls Created */}
          <div className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 text-left" style={{ background: '#e3f2fd', color: '#111' }}>
            <div className="flex flex-row items-center justify-between w-full mb-2">
              <span className="text-lg font-semibold">Polls Created</span>
              <span>
                <PollIcon style={{ fontSize: 32 }} />
              </span>
            </div>
            <span className="text-3xl font-bold mb-1">{pollsCount}</span>
            <span className="text-sm opacity-60">polls</span>
          </div>
        </div>
        {/* Active Petitions Near You row: full row on mobile */}
        <div className={isMobile ? "flex flex-col items-start w-full mb-6 mt-2" : "flex flex-row items-center justify-between w-full mb-6 mt-2"}>
          <span className="text-xl font-bold mb-2" style={{ color: '#111' }}>Active Petitions Near You</span>
          <div className={isMobile ? "flex flex-row items-center gap-2 mb-2" : "flex flex-row items-center gap-2"}>
            <span className="text-base font-medium" style={{ color: '#111' }}>Showing for:</span>
            <select
                        value={locationFilter}
                        onChange={e => setLocationFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="Delhi">Delhi</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Kolkata">Kolkata</option>
                    </select>
          </div>
        </div>
        {/* Category buttons: All Categories, then list on mobile */}
        <div className={isMobile ? "mb-8" : "flex flex-row gap-3 mb-8"}>
          <button
            className={`px-4 py-2 rounded-lg font-semibold shadow ${activeCategory === 'All Categories' ? 'bg-blue-600 text-white active' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveCategory('All Categories')}
          >
            All Categories
          </button>
          {isMobile ? (
            <div className="flex flex-col gap-2 mt-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-lg font-semibold shadow text-left ${activeCategory === cat ? 'bg-blue-600 text-white active' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
              <button
                className="px-4 py-2 rounded-lg font-semibold bg-blue-800 text-white shadow mt-2"
                onClick={() => setActiveCategory('All Categories')}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-lg font-semibold shadow ${activeCategory === cat ? 'bg-blue-600 text-white active' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
              <button
                className="px-4 py-2 rounded-lg font-semibold bg-blue-800 text-white shadow"
                onClick={() => setActiveCategory('All Categories')}
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
        {/* Petition list */}
            <div className="bg-white rounded-lg shadow-lg w-full p-4">
                {filteredPetitions.length > 0 ? (
                    filteredPetitions.map(p => (
                        <div key={p._id} className="border-b border-gray-200 p-3">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">{p.title}</span>
                                <span className="text-sm text-gray-500">{p.category}</span>
                            </div>
                            <p className="text-gray-700 text-sm mt-1">{p.description}</p>
                            <div className="flex justify-between mt-2 text-xs text-gray-600">
                                <span>Signatures: {p.signaturesCount || 0}/{p.signatureGoal || 100}</span>
                                <span>Status: {p.status}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-lg opacity-70 py-20">No petitions found with the current filters</p>
                )}
            </div>
      </>
    );
}
