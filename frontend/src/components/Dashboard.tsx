'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Filters from './Filters';
import Chat from './Chat';
import Visualizations from './Visualizations';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [filters, setFilters] = useState<any>({});
  
  useEffect(() => {
    fetchFilterOptions();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/filters`);
      setFilterOptions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/data?${queryParams}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Chronos</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Global Insights Platform</p>
        </div>
        <div className="filters-card">
          <Filters options={filterOptions} currentFilters={filters} onChange={setFilters} />
        </div>
      </div>
      <div className="main-content">
        <Visualizations data={data} />
      </div>
      <Chat filters={filters} hasData={data.length > 0} />
    </div>
  );
}
