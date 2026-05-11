import { getApplications } from '@/lib/data-fetcher';
import { Search, Filter, Download } from 'lucide-react';

export default async function ApplicationsPage() {
  const apps = await getApplications();

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Application Ledger</h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Comprehensive history of all career movements.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Search companies..." 
              style={{ 
                background: 'var(--card-bg)', 
                border: '1px solid var(--card-border)', 
                padding: '0.6rem 1rem 0.6rem 2.5rem', 
                borderRadius: '8px',
                color: 'white',
                width: '300px'
              }} 
            />
          </div>
          <button className="glass" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <Filter size={18} />
            Filter
          </button>
          <button className="glass" style={{ padding: '0.6rem 1rem', background: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <Download size={18} />
            Export
          </button>
        </div>
      </header>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--muted)', fontSize: '0.85rem' }}>
              <th style={{ textAlign: 'left', padding: '1.25rem' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '1.25rem' }}>DATE</th>
              <th style={{ textAlign: 'left', padding: '1.25rem' }}>COMPANY</th>
              <th style={{ textAlign: 'left', padding: '1.25rem' }}>ROLE</th>
              <th style={{ textAlign: 'left', padding: '1.25rem' }}>STATUS</th>
              <th style={{ textAlign: 'center', padding: '1.25rem' }}>SCORE</th>
              <th style={{ textAlign: 'center', padding: '1.25rem' }}>PDF</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--card-border)', fontSize: '0.95rem' }} className="table-row-hover">
                <td style={{ padding: '1.25rem', color: 'var(--muted)' }}>#{app.id}</td>
                <td style={{ padding: '1.25rem' }}>{app.date}</td>
                <td style={{ padding: '1.25rem', fontWeight: 'bold' }}>{app.company}</td>
                <td style={{ padding: '1.25rem' }}>{app.role}</td>
                <td style={{ padding: '1.25rem' }}>
                  <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 'bold' }}>{app.score}</td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>{app.pdf ? '✅' : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.02);
        }
      `}} />
    </div>
  );
}
