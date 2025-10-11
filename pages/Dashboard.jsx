import { useState, useEffect } from 'react';
import { FaShieldAlt, FaExchangeAlt, FaCheckCircle } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    blockedRequests: 0,
    redirectedRequests: 0,
    allowedRequests: 0,
    topBlockedDomains: [],
    requestsOverTime: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/stats/summary');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    // In a real app, you might want to set up an interval to refresh stats
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat bg-base-200 rounded-box shadow">
          <div className="stat-figure text-secondary">
            <FaShieldAlt className="w-8 h-8" />
          </div>
          <div className="stat-title">Blocked Requests</div>
          <div className="stat-value">{stats.blockedRequests}</div>
          <div className="stat-desc">
            {stats.totalRequests > 0 
              ? `${Math.round((stats.blockedRequests / stats.totalRequests) * 100)}% of total` 
              : 'No requests yet'}
          </div>
        </div>
        
        <div className="stat bg-base-200 rounded-box shadow">
          <div className="stat-figure text-secondary">
            <FaExchangeAlt className="w-8 h-8" />
          </div>
          <div className="stat-title">Redirected Requests</div>
          <div className="stat-value">{stats.redirectedRequests}</div>
          <div className="stat-desc">
            {stats.totalRequests > 0 
              ? `${Math.round((stats.redirectedRequests / stats.totalRequests) * 100)}% of total` 
              : 'No requests yet'}
          </div>
        </div>
        
        <div className="stat bg-base-200 rounded-box shadow">
          <div className="stat-figure text-secondary">
            <FaCheckCircle className="w-8 h-8" />
          </div>
          <div className="stat-title">Allowed Requests</div>
          <div className="stat-value">{stats.allowedRequests}</div>
          <div className="stat-desc">
            {stats.totalRequests > 0 
              ? `${Math.round((stats.allowedRequests / stats.totalRequests) * 100)}% of total` 
              : 'No requests yet'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-base-200 p-4 rounded-box shadow">
          <h2 className="text-xl font-semibold mb-4">DNS Requests Over Time</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.requestsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="blocked" name="Blocked" fill="#ff6b6b" />
                <Bar dataKey="redirected" name="Redirected" fill="#feca57" />
                <Bar dataKey="allowed" name="Allowed" fill="#1dd1a1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-base-200 p-4 rounded-box shadow">
          <h2 className="text-xl font-semibold mb-4">Top Blocked Domains</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Count</th>
                  <th>Last Blocked</th>
                </tr>
              </thead>
              <tbody>
                {stats.topBlockedDomains.map((domain, index) => (
                  <tr key={index}>
                    <td>{domain.name}</td>
                    <td>{domain.count}</td>
                    <td>{new Date(domain.lastBlocked).toLocaleString()}</td>
                  </tr>
                ))}
                {stats.topBlockedDomains.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center">No blocked domains yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;