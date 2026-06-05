import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { getAttentionList } from '../utils/storage';
import { useApp } from '../context/AppContext';

const statusConfig = {
  never: { color: '#78716C', bg: '#F5F5F4', label: 'Never revised', dot: '⚫' },
  critical: { color: '#DC2626', bg: '#FEF2F2', label: '30+ days', dot: '🔴' },
  warning: { color: '#D97706', bg: '#FFFBEB', label: '15–30 days', dot: '🟡' },
};

export default function NeedsAttention() {
  const { navigateToSubject } = useApp();
  const list = getAttentionList();

  if (list.length === 0) return null;

  return (
    <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <AlertTriangle size={16} color="#D97706" />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem', color: '#1C1917' }}>
          Needs Attention
        </span>
        <span style={{
          background: '#FEF2F2', color: '#DC2626',
          fontSize: '0.7rem', fontWeight: 700,
          padding: '1px 7px', borderRadius: '999px', marginLeft: 'auto'
        }}>
          {list.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {list.slice(0, 6).map(item => {
          const cfg = statusConfig[item.status];
          return (
            <div
              key={item.subtopicId}
              onClick={() => navigateToSubject(item.subjectId)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: cfg.bg, borderRadius: '8px', padding: '8px 12px',
                cursor: 'pointer', border: `1px solid ${cfg.color}22`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: cfg.color, truncate: true }}>
                  {item.subtopicName}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#78716C', marginTop: '1px' }}>
                  {item.subjectName} › {item.topicName}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px', whiteSpace: 'nowrap' }}>
                <Clock size={11} color={cfg.color} />
                <span style={{ fontSize: '0.7rem', color: cfg.color, fontWeight: 600 }}>
                  {item.status === 'never' ? 'Never' : `${item.days}d ago`}
                </span>
              </div>
            </div>
          );
        })}
        {list.length > 6 && (
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#78716C', paddingTop: '4px' }}>
            +{list.length - 6} more topics need attention
          </div>
        )}
      </div>
    </div>
  );
}
