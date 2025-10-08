import React from 'react';
import { Card, Row, Col, Button, Table } from 'antd';
import { DownloadOutlined, PrinterOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import './Reports.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/* dummy data */
const pollStats        = { total: 42, active: 30, closed: 10, underReview: 2 };
const petitionStats    = { total: 64, active: 50, closed: 12, underReview: 2 };
const topPolls         = [
  { title: 'Park lighting upgrade', votes: 342 },
  { title: 'Bike lanes expansion', votes: 289 },
  { title: '24-hour library',        votes: 267 },
  { title: 'Community garden',       votes: 201 },
  { title: 'Free Wi-Fi zones',       votes: 190 },
];

const pieData = (src) => ({
  labels: ['Active', 'Closed', 'Under Review'],
  datasets: [{ data: [src.active, src.closed, src.underReview], backgroundColor: ['#52c41a', '#ff4d4f', '#faad14'] }],
});

const barData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [{ label: 'Polls created', data: [5, 8, 12, 17], backgroundColor: '#1890ff' }],
};

/*  helpers  */
const KPI = ({ title, value, percent, isUp }) => (
  <Card className="kpi-card" bodyStyle={{ padding: '16px 24px' }}>
    <div className="kpi-title">{title}</div>
    <div className="kpi-value">{value}</div>
    <div className={`kpi-footer ${isUp ? 'up' : 'down'}`}>
      {isUp ? <RiseOutlined /> : <FallOutlined />} {percent} % {isUp ? 'increase' : 'decrease'} from last month
    </div>
  </Card>
);

/*  component  */
export default function Reports() {
  const handleExport = () => {
    const csv = [
      ['Type', 'Total', 'Active', 'Closed', 'Under Review'],
      ['Polls', pollStats.total, pollStats.active, pollStats.closed, pollStats.underReview],
      ['Petitions', petitionStats.total, petitionStats.active, petitionStats.closed, petitionStats.underReview],
    ].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'CivixReports.csv',
    });
    a.click();
  };
  const handlePrint = () => window.print();

  return (
    <div className="reports-wrapper">
      {/*   HEADING   */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }} wrap>
        <Col>
          <h1 className="page-heading">Reports & Analytics</h1>
        </Col>
        <Col>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} style={{ marginRight: 8 }}>
            Export Data
          </Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            Print
          </Button>
        </Col>
      </Row>

      {/*  KPI CARDS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <KPI title="Total Polls" value={pollStats.total} percent={12} isUp={true} />
        </Col>
        <Col xs={24} sm={8}>
          <KPI title="Total Petitions" value={petitionStats.total} percent={8} isUp={false} />
        </Col>
        <Col xs={24} sm={8}>
          <KPI title="Active Engagement" value={pollStats.active + petitionStats.active} percent={15} isUp={true} />
        </Col>
      </Row>

      {/*  CHARTS  */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card className="chart-card" title="Poll Status Breakdown">
            <div style={{ height: 240 }}>
              <Pie
                data={pieData(pollStats)}
                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="chart-card" title="Petition Status Breakdown">
            <div style={{ height: 240 }}>
              <Pie
                data={pieData(petitionStats)}
                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
              />
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