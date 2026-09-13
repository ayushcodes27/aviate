export default function Loading() {
  return (
    <div className="container animate-fade-in" style={{ opacity: 0.5 }}>
      <div style={{ height: '40px', width: '30%', backgroundColor: 'var(--bg-panel)', borderRadius: '4px', marginBottom: '1rem' }}></div>
      <div style={{ height: '24px', width: '50%', backgroundColor: 'var(--bg-panel)', borderRadius: '4px', marginBottom: '1rem' }}></div>
      
      <div className="panel" style={{ height: '100px', marginBottom: '1rem', display: 'flex', gap: '1rem', padding: '16px' }}>
        <div style={{ flex: 1, backgroundColor: 'var(--bg-page)', borderRadius: '4px' }}></div>
        <div style={{ flex: 1, backgroundColor: 'var(--bg-page)', borderRadius: '4px' }}></div>
        <div style={{ flex: 1, backgroundColor: 'var(--bg-page)', borderRadius: '4px' }}></div>
      </div>
      
      <div className="grid grid-cols-2" style={{ marginBottom: '1rem' }}>
        <div className="panel" style={{ height: '350px' }}>
          <div style={{ height: '24px', width: '40%', backgroundColor: 'var(--bg-page)', borderRadius: '4px', marginBottom: '1rem' }}></div>
          <div style={{ height: '280px', width: '100%', backgroundColor: 'var(--bg-page)', borderRadius: '4px' }}></div>
        </div>
        <div className="panel" style={{ height: '350px' }}>
          <div style={{ height: '24px', width: '40%', backgroundColor: 'var(--bg-page)', borderRadius: '4px', marginBottom: '1rem' }}></div>
          <div style={{ height: '280px', width: '100%', backgroundColor: 'var(--bg-page)', borderRadius: '4px' }}></div>
        </div>
      </div>
      
      <div className="panel" style={{ height: '400px' }}>
        <div style={{ height: '40px', width: '100%', borderBottom: '1px solid var(--border-hairline)', marginBottom: '1rem' }}></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ height: '40px', width: '100%', borderBottom: '1px solid var(--border-hairline)', marginBottom: '0.5rem', backgroundColor: 'var(--bg-page)' }}></div>
        ))}
      </div>
    </div>
  );
}
