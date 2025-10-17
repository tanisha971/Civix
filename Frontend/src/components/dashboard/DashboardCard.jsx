import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PollIcon from '@mui/icons-material/Poll';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BarChartIcon from '@mui/icons-material/BarChart';
import petitionService from '../../services/petitionService';
import { pollService } from '../../services/pollService';
import { getCurrentUserId } from '../../utils/auth';

export default function DashboardCard() {
  const navigate = useNavigate();
  const userId = getCurrentUserId();

  const [loading, setLoading] = useState(true);
  const [pollsLoading, setPollsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 600 : false
  );

  const [allPetitions, setAllPetitions] = useState([]);
  const [pollStats, setPollStats] = useState({
    myPolls: 0,
    activePolls: 0,
    completedPolls: 0,
    totalPolls: 0
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch petitions
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        setLoading(true);
        const data = await petitionService.getAllPetitions();
        setAllPetitions(data.petitions || data);
      } catch (err) {
        console.error('Error fetching petitions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPetitions();
  }, []);

  // Fetch polls
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setPollsLoading(true);
        const data = await pollService.getPolls();
        const pollsArray = Array.isArray(data) ? data : data.polls || [];

        // Count stats
        const myPollsCount = pollsArray.filter(
          poll => poll.creator && poll.creator.toString() === userId.toString()
        ).length;

        const activePollsCount = pollsArray.filter(
          poll => poll.status?.toLowerCase() === 'active'
        ).length;

        const completedPollsCount = pollsArray.filter(
          poll => ['closed', 'completed'].includes(poll.status?.toLowerCase())
        ).length;

        setPollStats({
          myPolls: myPollsCount,
          activePolls: activePollsCount,
          completedPolls: completedPollsCount,
          totalPolls: pollsArray.length
        });
      } catch (err) {
        console.error('Error fetching polls:', err);
      } finally {
        setPollsLoading(false);
      }
    };
    fetchPolls();
  }, [userId]);

  // Petition counts
  const myPetitionsCount = allPetitions.filter(p => p.creator?._id === userId).length;
  const activePetitionsCount = allPetitions.filter(p => p.status === 'active').length;
  const successfulPetitionsCount = allPetitions.filter(
    p => ['closed', 'successful', 'under_review'].includes(p.status)
  ).length;

  return (
    <>
      {/* Petitions Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Petitions Overview</h3>
        <div className={isMobile ? 'flex flex-col gap-4' : 'flex flex-row gap-8'}>
          <div
            className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            style={{ background: '#e3f2fd', color: '#111' }}
            onClick={() => navigate('/dashboard/petitions')}
          >
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold">My Petitions</span>
              <EditIcon style={{ fontSize: 32 }} />
            </div>
            <span className="text-3xl font-bold mb-1">{loading ? '...' : myPetitionsCount}</span>
            <span className="text-sm opacity-60">created by you</span>
          </div>

          <div
            className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            style={{ background: '#e8f5e8', color: '#111' }}
            onClick={() => navigate('/dashboard/petitions')}
          >
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold">Active Petitions</span>
              <TrendingUpIcon style={{ fontSize: 32 }} />
            </div>
            <span className="text-3xl font-bold mb-1">{loading ? '...' : activePetitionsCount}</span>
            <span className="text-sm opacity-60">collecting signatures</span>
          </div>

          <div
            className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            style={{ background: '#fff3e0', color: '#111' }}
          >
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold">Successful</span>
              <CheckCircleIcon style={{ fontSize: 32 }} />
            </div>
            <span className="text-3xl font-bold mb-1">{loading ? '...' : successfulPetitionsCount}</span>
            <span className="text-sm opacity-60">completed or under review</span>
          </div>
        </div>
      </div>

      {/* Polls Overview */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Polls Overview</h3>
        <div className={isMobile ? 'flex flex-col gap-4' : 'flex flex-row gap-8'}>
          <div
            className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            style={{ background: '#e8f5e8', color: '#111' }}
            onClick={() => navigate('/dashboard/polls/my')}
          >
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold">My Polls</span>
              <PollIcon style={{ fontSize: 32 }} />
            </div>
            <span className="text-3xl font-bold mb-1">{pollsLoading ? '...' : pollStats.myPolls}</span>
            <span className="text-sm opacity-60">created by you</span>
          </div>

          <div
            className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            style={{ background: '#e0f2f1', color: '#111' }}
            onClick={() => navigate('/dashboard/polls')}
          >
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold">Active Polls</span>
              <HowToVoteIcon style={{ fontSize: 32 }} />
            </div>
            <span className="text-3xl font-bold mb-1">{pollsLoading ? '...' : pollStats.activePolls}</span>
            <span className="text-sm opacity-60">currently voting</span>
          </div>

          <div
            className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            style={{ background: '#f1f8e9', color: '#111' }}
          >
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold">Completed Polls</span>
              <BarChartIcon style={{ fontSize: 32 }} />
            </div>
            <span className="text-3xl font-bold mb-1">{pollsLoading ? '...' : pollStats.completedPolls}</span>
            <span className="text-sm opacity-60">finished voting</span>
          </div>
        </div>
      </div>
    </>
  );
}
