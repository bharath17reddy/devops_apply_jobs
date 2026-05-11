import { getApplications, getPipeline } from '@/lib/data-fetcher';
import { Briefcase, Activity, CheckCircle, Clock } from 'lucide-react';

export default async function Dashboard() {
  const apps = await getApplications();
  const pipeline = await getPipeline();

  const stats = [
    { name: 'Total Applications', value: apps.length, icon: Briefcase, color: 'var(--primary)' },
    { name: 'Active Pipeline', value: pipeline.pending.length, icon: Activity, color: 'var(--warning)' },
    { name: 'Processed', value: pipeline.processed.length, icon: CheckCircle, color: 'var(--success)' },
    { name: 'Avg. Success Rate', value: '84%', icon: Clock, color: '#a855f7' },
  ];

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Ops Intelligence</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Strategic overview of your career deployment.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem' 
      }}>
        {stats.map((stat) => (
          <div key={stat.name} className="glass" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ 
              position: 'absolute', 
              right: '-10px', 
              top: '-10px', 
              color: stat.color, 
              opacity: 0.1 
            }}>
              <stat.icon size={100} />
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{stat.name}</p>
            <h3 style={{ fontSize: '2rem' }}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <section className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Recent Deployments</h2>
            <button style={{ 
              background: 'transparent', 
              border: '1px solid var(--card-border)', 
              color: 'var(--foreground)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem'
            }}>View All</button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--muted)', fontSize: '0.85rem' }}>
                <th style={{ textAlign: 'left', padding: '1rem 0' }}>COMPANY</th>
                <th style={{ textAlign: 'left', padding: '1rem 0' }}>ROLE</th>
                <th style={{ textAlign: 'left', padding: '1rem 0' }}>STATUS</th>
                <th style={{ textAlign: 'right', padding: '1rem 0' }}>SCORE</th>
              </tr>
            </thead>
            <tbody>
              {apps.slice(0, 8).map((app, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', fontSize: '0.95rem' }}>
                  <td style={{ padding: '1rem 0', fontWeight: '600' }}>{app.company}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--muted)' }}>{app.role}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                  </td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>{app.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Pipeline Load</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Pending</span>
                <span>{pipeline.pending.length}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px' }}>
                <div style={{ 
                  width: `${(pipeline.pending.length / (pipeline.pending.length + pipeline.processed.length)) * 100}%`, 
                  height: '100%', 
                  background: 'var(--warning)', 
                  borderRadius: '4px' 
                }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '1rem' }}>
                <span>Processed</span>
                <span>{pipeline.processed.length}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px' }}>
                <div style={{ 
                  width: `${(pipeline.processed.length / (pipeline.pending.length + pipeline.processed.length)) * 100}%`, 
                  height: '100%', 
                  background: 'var(--success)', 
                  borderRadius: '4px' 
                }} />
              </div>
            </div>
          </div>

          <div className="glass" style={{ padding: '2rem', flex: 1, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(10, 10, 12, 0.5) 100%)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Pro Tip</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Your application score for <strong>Anthropic</strong> positions is consistently above 4.7. Consider prioritizing high-scoring clusters.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
