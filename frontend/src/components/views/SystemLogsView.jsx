import React, { useState } from 'react';

export default function SystemLogsView({ events }) {
  const [filter, setFilter] = useState('ALL');

  const filteredEvents = filter === 'ALL'
    ? events
    : events.filter(e => e.type === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
      <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '16px 20px', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#38bdf8', textTransform: 'uppercase' }}>
            SYSTEM EVENT LOGS &amp; AUDIT TRAIL
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
            Real-time streaming event console capturing telemetry, outage triggers, and HMM state transitions.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'GPS', 'NOISE', 'OUTAGE', 'SUCCESS', 'DEMO'].map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#2563eb' : '#090d16',
                color: filter === f ? '#ffffff' : '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Log Console Window */}
      <div style={{
        flex: 1,
        background: '#040711',
        borderRadius: '12px',
        border: '1px solid #1e293b',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '12px',
        overflowY: 'auto',
        color: '#34d399',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
      }}>
        {filteredEvents.length === 0 ? (
          <div style={{ color: '#475569', fontStyle: 'italic' }}>No log entries match the selected filter.</div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const getColor = (t) => {
              switch (t) {
                case 'GPS': return '#38bdf8';
                case 'NOISE': return '#fb923c';
                case 'OUTAGE': return '#ef4444';
                case 'SUCCESS': return '#34d399';
                case 'DEMO': return '#c084fc';
                default: return '#cbd5e1';
              }
            };

            return (
              <div key={idx} style={{ marginBottom: '6px', display: 'flex', gap: '12px', borderBottom: '1px solid #0f172a', paddingBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>[{evt.time}]</span>
                <span style={{ color: getColor(evt.type), fontWeight: 'bold', width: '80px' }}>[{evt.type}]</span>
                <span style={{ color: '#f8fafc' }}>{evt.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
