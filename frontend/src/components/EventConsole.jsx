import React, { useEffect, useRef } from 'react';

export default function EventConsole({ events = [] }) {
  const consoleRef = useRef(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div style={{
      background: '#060913',
      border: '1px solid #1e293b',
      borderRadius: '12px',
      padding: '16px',
      color: '#f8fafc',
      height: '240px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
          REAL-TIME TELEMETRY &amp; EVENT CONSOLE
        </h4>
        <span style={{ fontSize: '10px', color: '#10b981', fontFamily: 'monospace' }}>● STREAMING</span>
      </div>

      <div
        ref={consoleRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '11px',
          lineHeight: '1.6',
          paddingRight: '6px'
        }}
      >
        {events.length === 0 ? (
          <div style={{ color: '#475569', fontStyle: 'italic' }}>
            System initialized. Ready for simulation...
          </div>
        ) : (
          events.map((evt, idx) => {
            let color = '#94a3b8';
            if (evt.type === 'OUTAGE') color = '#ef4444';
            else if (evt.type === 'SUCCESS') color = '#10b981';
            else if (evt.type === 'FAILURE') color = '#f97316';
            else if (evt.type === 'DEMO') color = '#a855f7';
            else if (evt.type === 'GPS') color = '#38bdf8';

            return (
              <div key={idx} style={{ marginBottom: '4px' }}>
                <span style={{ color: '#475569' }}>[{evt.time}]</span>{' '}
                <span style={{ color: color, fontWeight: 'bold' }}>[{evt.type}]</span>{' '}
                <span style={{ color: '#e2e8f0' }}>{evt.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
