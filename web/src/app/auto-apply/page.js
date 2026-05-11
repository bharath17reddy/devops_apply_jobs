'use client';
import { useState, useEffect } from 'react';
import { Zap, Target, Cpu, CheckCircle, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export default function AutoApplyPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState({});
  const [status, setStatus] = useState('Standby');
  const [isScanning, setIsScanning] = useState(false);
  const [autoPilot, setAutoPilot] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    let interval;
    if (autoPilot) {
      setStatus('Auto-Pilot: Active');
      interval = setInterval(() => {
        handleScan();
      }, 60000 * 30); // Every 30 mins
    } else {
      if (status.includes('Auto-Pilot')) setStatus('Standby');
    }
    return () => clearInterval(interval);
  }, [autoPilot]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/eligible');
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setStatus('Scanning job portals...');
    try {
      const res = await fetch('/api/scan', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatus('Scan complete. Discovering targets...');
        await fetchJobs();
        setStatus('Pipeline updated with new targets.');
      }
    } catch (err) {
      setStatus('Scan failed.');
    } finally {
      setIsScanning(false);
      setTimeout(() => setStatus(autoPilot ? 'Auto-Pilot: Active' : 'Standby'), 3000);
    }
  };

  const handleBulkApply = async () => {
    const ids = jobs.map(j => j.id);
    if (ids.length === 0) return;
    
    setStatus(`Mass-deploying ${ids.length} applications...`);
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      
      if (res.ok) {
        setJobs([]);
        setStatus(`Successfully deployed ${ids.length} applications.`);
      }
    } catch (err) {
      setStatus('Bulk deployment failed.');
    } finally {
      setTimeout(() => setStatus(autoPilot ? 'Auto-Pilot: Active' : 'Standby'), 3000);
    }
  };

  const handleApply = async (id, company) => {
    setApplying(prev => ({ ...prev, [id]: true }));
    setStatus(`Deploying application to ${company}...`);
    
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (res.ok) {
        setJobs(jobs.filter(j => j.id !== id));
        setStatus(`Successfully applied to ${company}`);
      } else {
        setStatus(`Error applying to ${company}`);
      }
    } catch (err) {
      setStatus(`System failure at ${company}`);
    } finally {
      setApplying(prev => ({ ...prev, [id]: false }));
      setTimeout(() => setStatus(autoPilot ? 'Auto-Pilot: Active' : 'Standby'), 3000);
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Zap className="text-warning" size={32} />
            Auto-Apply Mission Control
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Autonomous deployment system for high-probability targets.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div 
            onClick={() => setAutoPilot(!autoPilot)}
            style={{ 
              background: autoPilot ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
              padding: '0.6rem 1rem', 
              borderRadius: '8px',
              border: `1px solid ${autoPilot ? 'var(--success)' : 'var(--card-border)'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: autoPilot ? 'var(--success)' : 'var(--muted)', boxShadow: autoPilot ? '0 0 8px var(--success)' : 'none' }}></div>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: autoPilot ? 'var(--success)' : 'var(--muted)' }}>AUTO-PILOT</span>
          </div>
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            padding: '1rem 1.5rem', 
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: (status === 'Standby' || status.includes('Active')) ? 'var(--success)' : 'var(--warning)', boxShadow: '0 0 10px currentColor' }}></div>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary)' }}>SYSTEM STATUS: {status.toUpperCase()}</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="glass"
          style={{ 
            padding: '1rem 2rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            color: 'white',
            fontWeight: '600',
            cursor: isScanning ? 'not-allowed' : 'pointer'
          }}
        >
          <RefreshCw className={isScanning ? 'animate-spin' : ''} size={20} />
          {isScanning ? 'SCANNING PORTALS...' : 'SCAN PORTALS'}
        </button>
        
        {jobs.length > 0 && (
          <button 
            onClick={handleBulkApply}
            style={{ 
              padding: '1rem 2rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              background: 'var(--success)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Zap size={20} />
            MASS DEPLOY ({jobs.length} TARGETS)
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <RefreshCw className="animate-spin" size={48} color="var(--primary)" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
          <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>No Targets Identified</h2>
          <p style={{ color: 'var(--muted)' }}>All high-probability opportunities have been processed or none meet the threshold (score ≥ 3.9).</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {jobs.map((job) => (
            <div key={job.id} className="glass" style={{ 
              padding: '2rem', 
              position: 'relative',
              transition: 'all 0.3s ease',
              borderTop: '4px solid var(--primary)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{job.company}</h3>
                  <p style={{ color: 'var(--primary)', fontWeight: '600' }}>{job.role}</p>
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '0.5rem 0.75rem', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Score</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{job.score}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                    <Target size={14} />
                    Tier 1 Match
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                    <Cpu size={14} />
                    Auto-Eligible
                 </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleApply(job.id, job.company)}
                  disabled={applying[job.id]}
                  style={{ 
                    flex: 1,
                    background: applying[job.id] ? 'var(--muted)' : 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: applying[job.id] ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {applying[job.id] ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <Zap size={18} />
                  )}
                  {applying[job.id] ? 'DEPLOING...' : 'DEPLOY APPLY'}
                </button>
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="glass"
                  style={{ 
                    padding: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .text-warning { color: var(--warning); }
      `}} />
    </div>
  );
}
