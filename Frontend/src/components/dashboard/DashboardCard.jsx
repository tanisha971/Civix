import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PollIcon from '@mui/icons-material/Poll';

export default function DashboardCard() {
    const [activeCategory, setActiveCategory] = React.useState('All Categories');
    const categories = [
      'Environment',
      'Infrastructure',
      'Education',
      'Public Safety',
      'Transportation',
      'Healthcare',
      'Housing',
    ];

    // Responsive: detect mobile
    const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth <= 600 : false);
    React.useEffect(() => {
      const handleResize = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth <= 600 : false);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            <span className="text-3xl font-bold mb-1">0</span>
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
            <span className="text-3xl font-bold mb-1">0</span>
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
            <span className="text-3xl font-bold mb-1">0</span>
            <span className="text-sm opacity-60">polls</span>
          </div>
        </div>
        {/* Active Petitions Near You row: full row on mobile */}
        <div className={isMobile ? "flex flex-col items-start w-full mb-6 mt-2" : "flex flex-row items-center justify-between w-full mb-6 mt-2"}>
          <span className="text-xl font-bold mb-2" style={{ color: '#111' }}>Active Petitions Near You</span>
          <div className={isMobile ? "flex flex-row items-center gap-2 mb-2" : "flex flex-row items-center gap-2"}>
            <span className="text-base font-medium" style={{ color: '#111' }}>Showing for:</span>
            <select className="border border-gray-300 rounded-lg px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="delhi">Delhi</option>
              <option value="mumbai">Mumbai</option>
              <option value="bangalore">Bangalore</option>
              <option value="kolkata">Kolkata</option>
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
        <div className="bg-white rounded-lg shadow-lg w-full" style={{ minHeight: '90vh' }}>
          <p className="text-center text-lg  opacity-70">No petitions found with the current filters</p>
        </div>
      </>
    );
}
