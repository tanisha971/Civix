import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Button, Table, Spin, message } from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
  RiseOutlined,
  FallOutlined,
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
import { getPetitions } from '../../services/api'; // ✅ import your API function
import './Reports.css';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const KPI = ({ title, value, percent, isUp }) => (
  <Card className="kpi-card" bodyStyle={{ padding: '16px 24px' }}>
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

  // ✅ Fetch petitions from backend
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

  // ✅ Compute stats from data (polls + petitions)
  const { pollStats, petitionStats, topPolls, barData } = useMemo(() => {
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
        title: p.title || p.question || 'Untitled Poll',
        votes: p.options ? p.options.reduce((sum, o) => sum + (o.votes || 0), 0) : 0,
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
      datasets: [{ label: 'Polls Created', data: monthCounts, backgroundColor: '#1890ff' }],
    };

    return { pollStats, petitionStats, topPolls, barData };
  }, [allPolls, allPetitions]);

  const pieData = (src) => ({
    labels: ['Active', 'Closed', 'Under Review'],
    datasets: [
      { data: [src.active, src.closed, src.underReview], backgroundColor: ['#52c41a', '#ff4d4f', '#faad14'] },
    ],
  });

  const handleExport = () => {
    const csv = [
      ['Type', 'Total', 'Active', 'Closed', 'Under Review'],
      ['Polls', pollStats.total, pollStats.active, pollStats.closed, pollStats.underReview],
      ['Petitions', petitionStats.total, petitionStats.active, petitionStats.closed, petitionStats.underReview],
    ]
      .map((r) => r.join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'CivixReports.csv',
    });
    a.click();
  };

  const handlePrint = () => window.print();

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
          <Card className="chart-card" title="Poll Status Breakdown">
            <div style={{ height: 240 }}>
              <Pie data={pieData(pollStats)} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
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
              rowKey="title"
              size="small"
              pagination={false}
              columns={[
                { title: 'Poll', dataIndex: 'title' },
                { title: 'Votes', dataIndex: 'votes', sorter: (a, b) => b.votes - a.votes },
              ]}
              dataSource={topPolls}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
