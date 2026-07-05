'use client';
import React, { useMemo } from 'react';
import BarChart from './charts/BarChart';
import ScatterPlot from './charts/ScatterPlot';
import WorldMap from './charts/WorldMap';
import { SearchX } from 'lucide-react';

export default function Visualizations({ data }: { data: any[] }) {
  const totalRecords = data.length;
  const avgIntensity = useMemo(() => {
    if (!data.length) return 0;
    const sum = data.reduce((acc, curr) => acc + (curr.intensity || 0), 0);
    return (sum / data.length).toFixed(1);
  }, [data]);

  const avgRelevance = useMemo(() => {
    if (!data.length) return 0;
    const sum = data.reduce((acc, curr) => acc + (curr.relevance || 0), 0);
    return (sum / data.length).toFixed(1);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        background: 'var(--card-light)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-soft)',
        color: 'var(--text-dark)',
        textAlign: 'center',
        padding: '3rem'
      }}>
        <div style={{ background: 'var(--bg-base)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
          <SearchX size={64} color="var(--text-muted)" />
        </div>
        <h2 style={{ fontSize: '3rem', margin: 0 }}>404</h2>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Data Vacuum Detected</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6 }}>
          Whoops! It looks like this specific combination of filters yielded zero insights.
          Try loosening your filter criteria!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card dark">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label">Total Insights</div>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-light)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>+12%</span>
          </div>
          <div className="stat-value">{totalRecords}</div>
        </div>

        <div className="stat-card green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label">Avg. Intensity</div>
            <span style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--text-dark)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>High Impact</span>
          </div>
          <div className="stat-value">{avgIntensity}</div>
        </div>

        <div className="stat-card light">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-label">Avg. Relevance</div>
            <span style={{ background: 'var(--bg-base)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Stable</span>
          </div>
          <div className="stat-value">{avgRelevance}</div>
        </div>
      </div>

      <div className="viz-grid">
        <div className="viz-card purple" style={{ gridColumn: 'span 2' }}>
          <div className="viz-header">
            <h3 className="viz-title">Topic Intensity Distribution</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, background: 'rgba(255,255,255,0.3)', padding: '4px 12px', borderRadius: '16px' }}>Top 10 Topics</span>
            </div>
          </div>
          <BarChart data={data} theme="purple" />
        </div>
        <div className="viz-card dark">
          <div className="viz-header">
            <h3 className="viz-title">Risk Assessment</h3>
          </div>
          <ScatterPlot data={data} theme="dark" />
        </div>
        <div className="viz-card light">
          <div className="viz-header">
            <h3 className="viz-title">Global Heatmap</h3>
          </div>
          <WorldMap data={data} theme="light" />
        </div>
      </div>
    </>
  );
}
