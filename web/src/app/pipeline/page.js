import { getPipeline } from '@/lib/data-fetcher';
import { ExternalLink, CheckCircle2, Timer } from 'lucide-react';

export default async function PipelinePage() {
  const { pending, processed } = await getPipeline();

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Pipeline Board</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Live tracking of active opportunities.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Pending Column */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Timer color="var(--warning)" size={24} />
            <h2 style={{ fontSize: '1.5rem' }}>Pending Review</h2>
            <span style={{ 
              background: 'rgba(245, 158, 11, 0.1)', 
              color: 'var(--warning)', 
              padding: '2px 8px', 
              borderRadius: '4px', 
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>{pending.length}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pending.map((item, i) => (
              <div key={i} className="glass" style={{ padding: '1.25rem', transition: 'transform 0.2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'white' }}>{item.company}</h3>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)' }}>
                    <ExternalLink size={16} />
                  </a>
                </div>
                <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{item.role}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {item.meta}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Processed Column */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <CheckCircle2 color="var(--success)" size={24} />
            <h2 style={{ fontSize: '1.5rem' }}>Processed</h2>
            <span style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: 'var(--success)', 
              padding: '2px 8px', 
              borderRadius: '4px', 
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>{processed.length}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.8 }}>
            {processed.map((item, i) => (
              <div key={i} className="glass" style={{ padding: '1.25rem', borderLeft: '3px solid var(--success)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--muted)' }}>{item.company}</h3>
                  <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 'bold' }}>COMPLETED</span>
                </div>
                <p style={{ color: 'white', fontWeight: '500', fontSize: '0.9rem' }}>{item.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
