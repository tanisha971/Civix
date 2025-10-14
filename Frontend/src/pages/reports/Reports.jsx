import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Button, Table, Spin, message, Select } from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
  RiseOutlined,
  FallOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { getPetitions } from '../../services/api';
import './Reports.css';

const { Option } = Select;

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const KPI = ({ title, value, percent, isUp }) => (
  <Card 
    className="kpi-card" 
    styles={{ body: { padding: '16px 24px' } }}
  >
    <div className="kpi-title">{title}</div>
    <div className="kpi-value">{value}</div>
    <div className={`kpi-footer ${isUp ? 'up' : 'down'}`}>
      {isUp ? <RiseOutlined /> : <FallOutlined />} {percent}%{' '}
      {isUp ? 'increase' : 'decrease'} from last month
    </div>
  </Card>
);

export default function Reports({ allPolls = [] }) {
  const [allPetitions, setAllPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPollId, setSelectedPollId] = useState(null);

  // Fetch petitions from backend
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        const data = await getPetitions();
        setAllPetitions(Array.isArray(data) ? data : data.petitions || []);
      } catch (err) {
        message.error("Failed to load petitions");
      } finally {
        setLoading(false);
      }
    };
    fetchPetitions();
  }, []);

  // Set default selected poll when data loads
  useEffect(() => {
    if (allPolls.length > 0 && !selectedPollId) {
      // Find the poll with most votes
      const pollWithMostVotes = allPolls.reduce((prev, current) => {
        const prevVotes = prev.votes ? Object.values(prev.votes).reduce((sum, count) => sum + count, 0) : 0;
        const currentVotes = current.votes ? Object.values(current.votes).reduce((sum, count) => sum + count, 0) : 0;
        return currentVotes > prevVotes ? current : prev;
      });
      setSelectedPollId(pollWithMostVotes._id || pollWithMostVotes.id);
    }
  }, [allPolls, selectedPollId]);

  // Compute stats from data (polls + petitions)
  const { pollStats, petitionStats, topPolls, barData, pollResultData, selectedPoll } = useMemo(() => {
    const pollStats = {
      total: allPolls.length,
      active: allPolls.filter((p) => p.status === 'active').length,
      closed: allPolls.filter((p) => p.status === 'closed' || p.status === 'completed').length,
      underReview: allPolls.filter((p) => p.status === 'under_review').length,
    };

    const petitionStats = {
      total: allPetitions.length,
      active: allPetitions.filter((p) => p.status === 'active').length,
      closed: allPetitions.filter((p) => p.status === 'closed' || p.status === 'successful').length,
      underReview: allPetitions.filter((p) => p.status === 'under_review').length,
    };

    const topPolls = [...allPolls]
      .map((p) => ({
        id: p._id || p.id,
        title: p.title || p.question || 'Untitled Poll',
        votes: p.votes ? Object.values(p.votes).reduce((sum, count) => sum + count, 0) : 0,
      }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5);

    const monthCounts = Array(12).fill(0);
    allPolls.forEach((poll) => {
      const date = new Date(poll.createdAt || poll.date || Date.now());
      monthCounts[date.getMonth()]++;
    });
    
    const barData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{ 
        label: 'Polls Created', 
        data: monthCounts, 
        backgroundColor: '#1890ff',
        borderColor: '#1890ff',
        borderWidth: 1
      }],
    };

    // Find selected poll and create result distribution data
    const selectedPoll = allPolls.find(poll => poll._id === selectedPollId || poll.id === selectedPollId);
    let pollResultData = null;

    if (selectedPoll && selectedPoll.options && selectedPoll.votes) {
      const totalVotes = Object.values(selectedPoll.votes).reduce((sum, count) => sum + count, 0);
      
      if (totalVotes > 0) {
        const optionData = selectedPoll.options.map((option, index) => {
          const optionVotes = selectedPoll.votes[option] || selectedPoll.votes[index] || 0;
          const percentage = ((optionVotes / totalVotes) * 100).toFixed(1);
          
          return {
            option,
            votes: optionVotes,
            percentage: parseFloat(percentage)
          };
        });

        pollResultData = {
          labels: optionData.map(item => `${item.option} (${item.percentage}%)`),
          datasets: [{
            data: optionData.map(item => item.votes),
            backgroundColor: [
              '#52c41a', // Green
              '#ff4d4f', // Red  
              '#faad14', // Orange
              '#1890ff', // Blue
              '#722ed1', // Purple
              '#13c2c2', // Cyan
              '#eb2f96', // Magenta
            ],
            borderColor: '#fff',
            borderWidth: 2,
            hoverBorderWidth: 3,
          }]
        };
      }
    }

    return { pollStats, petitionStats, topPolls, barData, pollResultData, selectedPoll };
  }, [allPolls, allPetitions, selectedPollId]);

  const pieData = (src) => ({
    labels: ['Active', 'Closed', 'Under Review'],
    datasets: [
      { 
        data: [src.active, src.closed, src.underReview], 
        backgroundColor: ['#52c41a', '#ff4d4f', '#faad14'],
        borderColor: '#fff',
        borderWidth: 2
      },
    ],
  });

  const handleExport = () => {
    const csv = [
      ['Type', 'Total', 'Active', 'Closed', 'Under Review'],
      ['Polls', pollStats.total, pollStats.active, pollStats.closed, pollStats.underReview],
      ['Petitions', petitionStats.total, petitionStats.active, petitionStats.closed, petitionStats.underReview],
    ];

    // Add selected poll results if available
    if (selectedPoll && pollResultData) {
      csv.push([]);
      csv.push([`Poll Results: ${selectedPoll.question || selectedPoll.title}`]);
      selectedPoll.options.forEach((option, index) => {
        const votes = selectedPoll.votes[option] || selectedPoll.votes[index] || 0;
        const totalVotes = Object.values(selectedPoll.votes).reduce((sum, count) => sum + count, 0);
        const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
        csv.push([option, votes, `${percentage}%`]);
      });
    }

    const csvContent = csv.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'CivixReports.csv',
    });
    a.click();
  };

  const handlePrint = () => window.print();

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} votes (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2
      }
    }
  };

  if (loading) {
    return <div className="reports-wrapper"><Spin size="large" style={{ marginTop: 100 }} /></div>;
  }

  return (
    <div className="reports-wrapper">
      {/* HEADER */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }} wrap>
        <Col><h1 className="page-heading">Reports & Analytics</h1></Col>
        <Col>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} style={{ marginRight: 8 }}>
            Export Data
          </Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>Print</Button>
        </Col>
      </Row>

      {/* KPI CARDS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><KPI title="Total Polls" value={pollStats.total} percent={12} isUp={true} /></Col>
        <Col xs={24} sm={8}><KPI title="Total Petitions" value={petitionStats.total} percent={8} isUp={false} /></Col>
        <Col xs={24} sm={8}><KPI title="Active Engagement" value={pollStats.active + petitionStats.active} percent={15} isUp={true} /></Col>
      </Row>

      {/* CHARTS */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            className="chart-card" 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PieChartOutlined />
                  Poll Result Distribution
                </span>
                <Select
                  style={{ width: 200 }}
                  placeholder="Select a poll"
                  value={selectedPollId}
                  onChange={setSelectedPollId}
                  showSearch
                  optionFilterProp="children"
                >
                  {allPolls
                    .filter(poll => poll.votes && Object.values(poll.votes).reduce((sum, count) => sum + count, 0) > 0)
                    .map(poll => (
                      <Option key={poll._id || poll.id} value={poll._id || poll.id}>
                        {poll.question || poll.title || 'Untitled Poll'}
                      </Option>
                    ))}
                </Select>
              </div>
            }
          >
            <div style={{ height: 240 }}>
              {pollResultData ? (
                <>
                  <div style={{ marginBottom: 16, padding: '8px 16px', backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                    <h4 style={{ margin: 0, fontSize: 14, color: '#666' }}>
                      {selectedPoll?.question || selectedPoll?.title}
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#999' }}>
                      Total Votes: {Object.values(selectedPoll?.votes || {}).reduce((sum, count) => sum + count, 0)}
                    </p>
                  </div>
                  <Pie data={pollResultData} options={chartOptions} />
                </>
              ) : (
                <div style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#999'
                }}>
                  <PieChartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <p>No poll data available</p>
                  <p style={{ fontSize: 12 }}>Select a poll with votes to view results</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="chart-card" title="Petition Status Breakdown">
            <div style={{ height: 240 }}>
              <Pie data={pieData(petitionStats)} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card className="chart-card" title="Monthly Poll Creation">
            <div style={{ height: 240 }}>
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="chart-card" title="Top Voted Polls">
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                { 
                  title: 'Poll', 
                  dataIndex: 'title',
                  render: (text, record) => (
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => setSelectedPollId(record.id)}
                      style={{ padding: 0, height: 'auto', textAlign: 'left' }}
                    >
                      {text}
                    </Button>
                  )
                },
                { 
                  title: 'Votes', 
                  dataIndex: 'votes', 
                  sorter: (a, b) => b.votes - a.votes,
                  render: (votes) => (
                    <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                      {votes.toLocaleString()}
                    </span>
                  )
                },
              ]}
              dataSource={topPolls}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={24}>
          {selectedPoll && pollResultData && (
            <Card className="chart-card" title="Selected Poll Details">
              <div style={{ padding: '16px 0' }}>
                <h4 style={{ marginBottom: 16, color: '#1890ff' }}>
                  {selectedPoll.question || selectedPoll.title}
                </h4>
                <div style={{ marginBottom: 16 }}>
                  <p><strong>Status:</strong> <span style={{ 
                    color: selectedPoll.status === 'active' ? '#52c41a' : '#666',
                    textTransform: 'capitalize'
                  }}>{selectedPoll.status}</span></p>
                  <p><strong>Location:</strong> {selectedPoll.location || 'Not specified'}</p>
                  <p><strong>Created:</strong> {new Date(selectedPoll.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <div>
                  <h5 style={{ marginBottom: 12 }}>Vote Breakdown:</h5>
                  {selectedPoll.options.map((option, index) => {
                    const votes = selectedPoll.votes[option] || selectedPoll.votes[index] || 0;
                    const totalVotes = Object.values(selectedPoll.votes).reduce((sum, count) => sum + count, 0);
                    const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={index} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{option}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 'bold' }}>{votes}</span>
                          <span style={{ color: '#666', fontSize: '12px' }}>({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
