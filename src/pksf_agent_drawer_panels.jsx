/**
 * Drawer panels: Full Report shell, Access Sources, Send.
 * Imported by pksf_agent_output.jsx into OutputDrawer.
 */
import React, { useState } from 'react';
import {
  Database,
  X, ChevronDown, ChevronRight,
  Mail, Paperclip, CheckCircle2, Loader2, Send,
} from 'lucide-react';
import { COLORS } from './pksf_demo_scenarios.js';
import { REPORT_NARRATIVES } from './pksf_report_content.js';
import { GOOGLE_SERVICE, AGENT_SOURCES } from './pksf_agent_sources.js';

/* ─── Google Workspace SVG icons ─────────────────────── */
function GoogleSheetsIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="2" width="14" height="18" rx="1.5" fill="#34A853" />
      <rect x="3" y="2" width="9" height="18" rx="1.5" fill="#0F9D58" />
      <line x1="3" y1="8"  x2="17" y2="8"  stroke="white" strokeWidth="1.1" />
      <line x1="3" y1="12" x2="17" y2="12" stroke="white" strokeWidth="1.1" />
      <line x1="3" y1="16" x2="17" y2="16" stroke="white" strokeWidth="1.1" />
      <line x1="9"  y1="2" x2="9"  y2="20" stroke="white" strokeWidth="1.1" />
      <path d="M14 2l3 3h-3V2z" fill="white" fillOpacity="0.4" />
      <rect x="17" y="5" width="3" height="3" rx="0.5" fill="white" fillOpacity="0.35" />
    </svg>
  );
}

function GoogleDocsIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="2" width="14" height="18" rx="1.5" fill="#4285F4" />
      <path d="M14 2l3 3h-3V2z" fill="white" fillOpacity="0.4" />
      <rect x="16" y="5" width="1" height="1" fill="white" fillOpacity="0.35" />
      <line x1="6" y1="9"  x2="14" y2="9"  stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="6" y1="12" x2="14" y2="12" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="6" y1="15" x2="11" y2="15" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function GoogleDriveIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L4 18h6l8-14h-6z" fill="#4285F4" />
      <path d="M4 18h16l-3-5H7L4 18z" fill="#34A853" />
      <path d="M18 8l-6 10h4l5-8.5L18 8z" fill="#FBBC05" />
    </svg>
  );
}

/* ─── File type config ───────────────────────────────── */
const FT = {
  excel:    { label: 'Google Sheets', color: '#0F9D58', bg: '#E8F5E9', Icon: GoogleSheetsIcon },
  pdf:      { label: 'PDF (Drive)',   color: '#DB4437', bg: '#FEF2F2', Icon: GoogleDriveIcon  },
  word:     { label: 'Google Docs',  color: '#4285F4', bg: '#E8F0FE', Icon: GoogleDocsIcon   },
  database: { label: 'MIS Data',     color: COLORS.teal, bg: '#F0FDFA', Icon: Database       },
};

/* ─── Google "Open" button ───────────────────────────── */
function GoogleOpenButton({ source }) {
  const svc = GOOGLE_SERVICE[source.type];
  if (!svc || !source.driveId) return null;
  const ft = FT[source.type];
  const url = `${svc.base}${source.driveId}${svc.suffix}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '7px 14px',
        borderRadius: 7,
        border: `1.5px solid ${ft.color}50`,
        background: ft.bg,
        color: ft.color,
        fontSize: '0.8em',
        fontWeight: 700,
        textDecoration: 'none',
        transition: 'box-shadow 0.15s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        flexShrink: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 2px 10px ${ft.color}30`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
    >
      <ft.Icon size={15} />
      Open in {svc.name}
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.6 }}>
        <path d="M2 10L10 2M10 2H5M10 2v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </a>
  );
}

/* ─── Inline source viewer ───────────────────────────── */
function SourceViewer({ source }) {
  const p = source.preview;
  const ft = FT[source.type] ?? FT.pdf;

  const openBtn = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
      <span style={{ fontSize: '0.75em', color: COLORS.textMute }}>
        Preview from PKSF Google Workspace
      </span>
      <GoogleOpenButton source={source} />
    </div>
  );

  if (p.type === 'table') {
    return (
      <div style={{ marginTop: 10 }}>
        {openBtn}
        {/* Sheets-style header bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: ft.bg, borderRadius: '6px 6px 0 0', border: `1px solid ${ft.color}30`, borderBottom: 'none' }}>
          <ft.Icon size={14} color={ft.color} />
          <span style={{ fontSize: '0.75em', fontWeight: 700, color: ft.color }}>{source.label}</span>
        </div>
        <div style={{ overflowX: 'auto', borderRadius: '0 0 6px 6px', border: `1px solid ${ft.color}30` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82em' }}>
            <thead>
              <tr style={{ background: ft.color }}>
                {p.headers.map((h, i) => (
                  <th key={i} style={{ padding: '7px 10px', textAlign: 'left', color: '#fff', fontWeight: 700, borderRight: i < p.headers.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? ft.bg : '#fff' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '6px 10px', borderBottom: ri < p.rows.length - 1 ? `1px solid ${ft.color}18` : 'none', borderRight: ci < row.length - 1 ? `1px solid ${ft.color}18` : 'none', color: COLORS.text, whiteSpace: 'nowrap' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10 }}>
      {openBtn}
      {/* Docs-style header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: ft.bg, borderRadius: '6px 6px 0 0', border: `1px solid ${ft.color}30`, borderBottom: 'none' }}>
        <ft.Icon size={14} color={ft.color} />
        <span style={{ fontSize: '0.75em', fontWeight: 700, color: ft.color }}>{p.title ?? source.label}</span>
      </div>
      <div style={{ padding: '12px 14px', border: `1px solid ${ft.color}30`, borderRadius: '0 0 6px 6px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(p.sections ?? []).map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: '0.78em', color: ft.color, fontWeight: 700, marginBottom: 3 }}>{s.heading}</div>
            <div style={{ fontSize: '0.87em', color: COLORS.text, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SourcesPanel ───────────────────────────────────── */
export function SourcesPanel({ agentId }) {
  const sources = AGENT_SOURCES[agentId] ?? [];
  const [openId, setOpenId] = useState(null);

  if (sources.length === 0) {
    return (
      <div style={{ padding: '24px', color: COLORS.textDim, fontSize: '0.95em', textAlign: 'center' }}>
        No source documents recorded for this specialist.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: '0.8em', color: COLORS.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 4 }}>
        {sources.length} source document{sources.length > 1 ? 's' : ''} used by this specialist
      </div>
      {sources.map((src) => {
        const ft = FT[src.type] ?? FT.pdf;
        const isOpen = openId === src.id;
        return (
          <div key={src.id} style={{ borderRadius: 9, border: `1.5px solid ${isOpen ? ft.color : COLORS.border}`, background: isOpen ? ft.bg : COLORS.surface, overflow: 'hidden', transition: 'border-color 0.15s, background 0.15s' }}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : src.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 7, background: ft.bg, border: `1px solid ${ft.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ft.Icon size={18} color={ft.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88em', fontWeight: 700, color: COLORS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.label}</div>
                <div style={{ fontSize: '0.76em', color: COLORS.textDim, marginTop: 2 }}>{src.description} · {src.size}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.72em', fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: ft.bg, color: ft.color, border: `1px solid ${ft.color}40` }}>{ft.label}</span>
                {isOpen ? <ChevronDown size={15} color={COLORS.textMute} /> : <ChevronRight size={15} color={COLORS.textMute} />}
              </div>
            </button>
            {isOpen && (
              <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${ft.color}30` }}>
                <SourceViewer source={src} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── SendPanel ──────────────────────────────────────── */
const SUGGESTIONS = [
  'Board Chairman', 'Executive Director', 'Risk Committee Chair',
  'Regional Director — Khulna', 'Programme Manager', 'Finance Director',
];

export function SendPanel({ reportTitle, agentName }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(`[PKSF Report] ${reportTitle ?? agentName + ' Output'}`);
  const [body, setBody] = useState(
    `Dear Sir/Madam,\n\nPlease find attached the AI-generated report from the ${agentName ?? 'specialist'} as part of the PKSF Programme Intelligence workflow.\n\nThis report was produced during the Q1 2026 Khulna regional review. All findings are sourced from the MIS data lake and field documentation systems.\n\nKindly review and revert with any observations.\n\nWarm regards,\nAgnetic AI · PKSF Edition`
  );
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  const handleSend = () => {
    if (!to.trim()) return;
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 1800);
  };

  if (status === 'sent') {
    return (
      <div style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ECFDF5', border: `2px solid ${COLORS.mint}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={28} color={COLORS.mint} />
        </div>
        <div style={{ fontSize: '1.1em', fontWeight: 700, color: COLORS.text }}>Report sent successfully</div>
        <div style={{ fontSize: '0.9em', color: COLORS.textDim }}>Delivered to <strong>{to}</strong></div>
        <div style={{ fontSize: '0.82em', color: COLORS.textMute, marginTop: 4 }}>Subject: {subject}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* To */}
      <div>
        <label style={{ fontSize: '0.8em', color: COLORS.textDim, fontWeight: 700, display: 'block', marginBottom: 5 }}>To</label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient name or email…"
          style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: `1.5px solid ${COLORS.border}`, fontSize: '0.93em', color: COLORS.text, background: COLORS.surface, outline: 'none', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => setTo(s)}
              style={{ padding: '3px 10px', borderRadius: 20, border: `1px solid ${COLORS.border}`, background: COLORS.surfaceHi, color: COLORS.textDim, fontSize: '0.77em', cursor: 'pointer' }}>
              {s}
            </button>
          ))}
        </div>
      </div>
      {/* Subject */}
      <div>
        <label style={{ fontSize: '0.8em', color: COLORS.textDim, fontWeight: 700, display: 'block', marginBottom: 5 }}>Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: `1.5px solid ${COLORS.border}`, fontSize: '0.93em', color: COLORS.text, background: COLORS.surface, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      {/* Body */}
      <div>
        <label style={{ fontSize: '0.8em', color: COLORS.textDim, fontWeight: 700, display: 'block', marginBottom: 5 }}>Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={7}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: `1.5px solid ${COLORS.border}`, fontSize: '0.88em', color: COLORS.text, background: COLORS.surface, resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
        />
      </div>
      {/* Attachment */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 7, background: COLORS.surfaceHi, border: `1px solid ${COLORS.border}` }}>
        <Paperclip size={14} color={COLORS.textDim} />
        <span style={{ fontSize: '0.83em', color: COLORS.textDim, flex: 1 }}>{reportTitle ?? 'Agent_Output_Report.pdf'}</span>
        <span style={{ fontSize: '0.75em', color: COLORS.textMute }}>Attached</span>
      </div>
      {/* Send */}
      <button
        type="button"
        onClick={handleSend}
        disabled={!to.trim() || status === 'sending'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '11px 20px', borderRadius: 8,
          background: to.trim() ? COLORS.mint : COLORS.border,
          color: '#fff', border: 'none', fontSize: '0.95em', fontWeight: 700,
          cursor: to.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.15s',
        }}
      >
        {status === 'sending' ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
        {status === 'sending' ? 'Sending…' : 'Send Report'}
      </button>
    </div>
  );
}

/* ─── Document section renderers ─────────────────────── */

const DOC_COLORS = { mint: COLORS.mint, teal: COLORS.teal, amber: COLORS.amber, red: COLORS.red, textMute: '#888' };
const docColor = (k) => DOC_COLORS[k] ?? '#555';

function DocMetrics({ items }) {
  return (
    <div style={{ margin: '10px 0' }}>
      <p style={{ fontSize: '0.88em', color: '#333', lineHeight: 1.75, margin: '0 0 10px' }}>
        The following key performance indicators were recorded for the review period:
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em', border: '1px solid #C8D8CF', borderRadius: 4, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#F0F6F2', borderBottom: '2px solid #C8D8CF' }}>
            <th style={{ padding: '8px 14px', textAlign: 'left', color: '#444', fontWeight: 700 }}>Performance Metric</th>
            <th style={{ padding: '8px 14px', textAlign: 'center', color: '#444', fontWeight: 700, width: 120 }}>Value</th>
            <th style={{ padding: '8px 14px', textAlign: 'left', color: '#444', fontWeight: 700 }}>Context</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #E8F0EC', background: i % 2 === 0 ? '#fff' : '#FAFCFB' }}>
              <td style={{ padding: '7px 14px', color: '#222', fontWeight: 600 }}>{item.label}</td>
              <td style={{ padding: '7px 14px', color: docColor(item.color), fontWeight: 800, textAlign: 'center', fontFamily: "'Syne', sans-serif", fontSize: '1.05em' }}>{item.value}</td>
              <td style={{ padding: '7px 14px', color: '#666', fontSize: '0.88em' }}>{item.sub ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocBarChart({ title, bars, baseline }) {
  const W = 580, H = 180, PAD = { t: 20, r: 20, b: 50, l: 40 };
  const n = bars.length;
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...bars.map(b => b.value), 100);
  const barW = Math.min(36, (innerW / n) - 6);
  const BAR_CLR = { mint: COLORS.mint, teal: COLORS.teal, amber: COLORS.amber, red: '#DC2626' };

  return (
    <div style={{ margin: '14px 0' }}>
      {title && <div style={{ fontSize: '0.82em', color: '#555', fontWeight: 700, marginBottom: 8, fontStyle: 'italic' }}>Figure: {title}</div>}
      <div style={{ background: '#FAFAFA', border: '1px solid #E0E8E4', borderRadius: 4, padding: '12px 8px' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Y-axis grid */}
          {[0, 25, 50, 75, 100].map(v => {
            const yy = PAD.t + innerH - (v / maxVal) * innerH;
            return (
              <g key={v}>
                <line x1={PAD.l} y1={yy} x2={W - PAD.r} y2={yy} stroke="#E0E8E4" strokeWidth={1} strokeDasharray={v === 0 ? 'none' : '3,3'} />
                <text x={PAD.l - 4} y={yy + 4} textAnchor="end" fontSize={9} fill="#999">{v}%</text>
              </g>
            );
          })}
          {/* Baseline */}
          {baseline && (() => {
            const yy = PAD.t + innerH - (baseline.value / maxVal) * innerH;
            return (
              <g>
                <line x1={PAD.l} y1={yy} x2={W - PAD.r} y2={yy} stroke="#555" strokeWidth={1.5} strokeDasharray="6,3" />
                <text x={W - PAD.r + 3} y={yy + 4} fontSize={8} fill="#555">{baseline.value}%</text>
              </g>
            );
          })()}
          {/* Bars */}
          {bars.map((bar, i) => {
            const spacing = innerW / n;
            const cx = PAD.l + i * spacing + spacing / 2;
            const bh = (bar.value / maxVal) * innerH;
            const by = PAD.t + innerH - bh;
            const color = BAR_CLR[bar.color] ?? COLORS.mint;
            return (
              <g key={i}>
                <rect x={cx - barW / 2} y={by} width={barW} height={bh} fill={color} opacity={0.85} rx={2} />
                <text x={cx} y={by - 4} textAnchor="middle" fontSize={8.5} fontWeight="700" fill={color}>{bar.value}%</text>
                {bar.note && <text x={cx} y={PAD.t + innerH + 26} textAnchor="middle" fontSize={7.5} fill="#DC2626" fontWeight="700">{bar.note}</text>}
                <text x={cx} y={PAD.t + innerH + 14} textAnchor="middle" fontSize={8} fill="#666" transform={`rotate(-30,${cx},${PAD.t + innerH + 14})`}>{bar.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function DocForecastChart({ title, points }) {
  const W = 520, H = 140, PAD = { t: 24, r: 30, b: 30, l: 40 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const vals = points.map(p => p.value);
  const minV = Math.min(...vals) - 4, maxV = Math.max(...vals) + 4;
  const x = (i) => PAD.l + (i / (points.length - 1)) * innerW;
  const y = (v) => PAD.t + innerH - ((v - minV) / (maxV - minV)) * innerH;
  const splitIdx = points.findIndex(p => p.type === 'forecast');
  const actualPath = points.slice(0, splitIdx > 0 ? splitIdx + 1 : points.length)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ');
  const forecastPath = splitIdx >= 0
    ? points.slice(splitIdx - 1).map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(splitIdx - 1 + i)} ${y(p.value)}`).join(' ')
    : null;

  return (
    <div style={{ margin: '14px 0' }}>
      {title && <div style={{ fontSize: '0.82em', color: '#555', fontWeight: 700, marginBottom: 8, fontStyle: 'italic' }}>Figure: {title}</div>}
      <div style={{ background: '#FAFAFA', border: '1px solid #E0E8E4', borderRadius: 4, padding: '12px 16px' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {[0, 0.5, 1].map((t, i) => {
            const yy = PAD.t + t * innerH;
            const v = Math.round(maxV - t * (maxV - minV));
            return (
              <g key={i}>
                <line x1={PAD.l} y1={yy} x2={W - PAD.r} y2={yy} stroke="#E0E8E4" strokeWidth={1} strokeDasharray="3,3" />
                <text x={PAD.l - 4} y={yy + 4} textAnchor="end" fontSize={9} fill="#999">{v}%</text>
              </g>
            );
          })}
          <path d={actualPath} fill="none" stroke={COLORS.mint} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {forecastPath && <path d={forecastPath} fill="none" stroke={COLORS.teal} strokeWidth={2} strokeDasharray="6,4" strokeLinecap="round" />}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(p.value)} r={4.5} fill={p.type === 'forecast' ? COLORS.teal : COLORS.mint} stroke="#fff" strokeWidth={1.5} />
              <text x={x(i)} y={y(p.value) - 9} textAnchor="middle" fontSize={9} fontWeight="700" fill={p.type === 'forecast' ? COLORS.teal : COLORS.mint}>{p.value}%</text>
              <text x={x(i)} y={H - 4} textAnchor="middle" fontSize={9} fill="#888">{p.label}</text>
            </g>
          ))}
        </svg>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: '0.72em', color: '#888', marginTop: 4 }}>
          <span>── Actual</span><span style={{ color: COLORS.teal }}>╌╌ Forecast (baseline)</span>
        </div>
      </div>
    </div>
  );
}

function DocTable({ title, headers, rows, statusCol, highlightRows = [] }) {
  const STATUS_CLR = { Active: '#217346', Review: '#B45309', 'Outside window': '#DC2626', High: '#DC2626', Medium: '#B45309', Low: '#217346', 'Yes ✓': '#217346' };
  return (
    <div style={{ margin: '14px 0' }}>
      {title && <div style={{ fontSize: '0.82em', color: '#555', fontWeight: 700, marginBottom: 6, fontStyle: 'italic' }}>Table: {title}</div>}
      <div style={{ border: '1px solid #C8D8CF', borderRadius: 4, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83em' }}>
          <thead>
            <tr style={{ background: COLORS.mint }}>
              {headers.map((h, i) => <th key={i} style={{ padding: '8px 10px', textAlign: 'left', color: '#fff', fontWeight: 700, borderRight: i < headers.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none', whiteSpace: 'nowrap' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ background: highlightRows.includes(ri) ? '#FFFBEB' : ri % 2 === 0 ? '#F7FCF9' : '#fff' }}>
                {row.map((cell, ci) => {
                  const color = ci === statusCol ? STATUS_CLR[cell] : null;
                  return (
                    <td key={ci} style={{ padding: '7px 10px', borderBottom: '1px solid #E0E8E4', borderRight: ci < row.length - 1 ? '1px solid #E8F0EC' : 'none', color: color ?? '#222', fontWeight: color ? 700 : 400 }}>
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocText({ content, variant }) {
  const styles = {
    callout: { bg: '#F0FAF4', border: '3px solid ' + COLORS.mint, pl: 16 },
    warning: { bg: '#FFFBEB', border: '3px solid ' + COLORS.amber, pl: 16 },
    error:   { bg: '#FEF2F2', border: '3px solid #DC2626', pl: 16 },
    normal:  { bg: 'transparent', border: 'none', pl: 0 },
  };
  const s = styles[variant] ?? styles.normal;
  return (
    <div style={{ margin: '12px 0', padding: `10px 14px 10px ${s.pl + 14}px`, background: s.bg, borderLeft: s.border, borderRadius: 3, fontSize: '0.87em', color: '#1a1a1a', fontFamily: "Georgia, 'Times New Roman', Times, serif", lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
      {content}
    </div>
  );
}

function DocAlert({ severity, title, text }) {
  const s = severity === 'error'
    ? { bg: '#FEF2F2', border: '#DC2626' }
    : { bg: '#FFFBEB', border: COLORS.amber };
  return (
    <div style={{ margin: '12px 0', padding: '12px 16px', background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 4 }}>
      <div style={{ fontWeight: 700, color: s.border, fontSize: '0.84em', marginBottom: 5, fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif", textTransform: 'uppercase', letterSpacing: 0.05 }}>⚠ {title}</div>
      <div style={{ fontSize: '0.86em', color: '#333', lineHeight: 1.75, fontFamily: "Georgia, 'Times New Roman', Times, serif" }}>{text}</div>
    </div>
  );
}

function DocFindings({ items }) {
  const ICON = { pass: '✓', warn: '⚠', info: 'ℹ', fail: '✗' };
  const CLR  = { pass: COLORS.mint, warn: COLORS.amber, info: COLORS.teal, fail: '#DC2626' };
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em', margin: '12px 0' }}>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #E8F0EC' }}>
            <td style={{ padding: '6px 10px', color: CLR[item.status] ?? '#555', fontWeight: 700, width: 20, textAlign: 'center' }}>{ICON[item.status]}</td>
            <td style={{ padding: '6px 10px', color: '#555', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.label}</td>
            <td style={{ padding: '6px 10px', color: '#222' }}>{item.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DocChecklist({ title, items }) {
  return (
    <div style={{ margin: '12px 0' }}>
      {title && <div style={{ fontSize: '0.85em', fontWeight: 700, color: '#333', marginBottom: 6 }}>{title}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em' }}>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#F7FCF9' : '#fff', borderBottom: '1px solid #E8F0EC' }}>
              <td style={{ padding: '5px 10px', color: COLORS.mint, fontWeight: 700, width: 24 }}>✓</td>
              <td style={{ padding: '5px 10px', color: '#222' }}>{item.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocMemo({ to, from, date, ref: refId, subject, classification, sections }) {
  return (
    <div style={{ margin: '14px 0', border: '1.5px solid #C8D8CF', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ background: COLORS.amber, padding: '4px 14px', fontSize: '0.72em', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.1, textAlign: 'center' }}>
        {classification}
      </div>
      <div style={{ padding: '14px 18px', background: '#F7FCF9', borderBottom: '1px solid #E0E8E4' }}>
        <div style={{ fontWeight: 700, fontSize: '0.95em', color: '#111', marginBottom: 10, fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif", textTransform: 'uppercase', letterSpacing: 0.06 }}>Internal Memorandum</div>
        {[['To', to], ['From', from], ['Date', date], ['Ref', refId]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 8, fontSize: '0.83em', marginBottom: 3 }}>
            <span style={{ color: '#666', fontWeight: 700, width: 36 }}>{k}:</span>
            <span style={{ color: '#222' }}>{v}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, padding: '6px 10px', background: '#fff', border: '1px solid #C8D8CF', borderRadius: 4, fontSize: '0.85em' }}>
          <span style={{ fontWeight: 700, color: '#555' }}>Subject: </span>
          <span style={{ color: '#111', fontWeight: 700 }}>{subject}</span>
        </div>
      </div>
      <div style={{ padding: '14px 18px', background: '#fff' }}>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: i < sections.length - 1 ? 14 : 0 }}>
            <div style={{ fontSize: '0.83em', fontWeight: 700, color: COLORS.mint, marginBottom: 5, fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif", textTransform: 'uppercase', letterSpacing: 0.06 }}>{s.heading}</div>
            <div style={{ fontSize: '0.87em', color: '#1a1a1a', lineHeight: 1.85, whiteSpace: 'pre-wrap', fontFamily: "Georgia, 'Times New Roman', Times, serif" }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocFlow({ steps }) {
  return (
    <div style={{ margin: '14px 0', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'max-content', padding: '8px 0' }}>
        {steps.map((step, i) => {
          const color = docColor(step.color);
          return (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center', padding: '7px 10px', border: `1.5px solid ${color}`, borderRadius: 5, background: '#fff', minWidth: 68 }}>
                <div style={{ fontSize: '0.75em', fontWeight: 700, color }}>{step.label}</div>
                <div style={{ fontSize: '0.65em', color: '#888', marginTop: 2 }}>{step.sub}</div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ fontSize: '1.2em', color: '#aaa', padding: '0 3px', flexShrink: 0 }}>›</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* section counter for document */
let sectionNum = 0;
function DocSection({ label, children }) {
  sectionNum += 1;
  const n = sectionNum;
  return (
    <div style={{ marginBottom: 22 }}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${COLORS.mint}` }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: COLORS.mint, color: '#fff', fontSize: '0.75em', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
          <div style={{ fontSize: '0.88em', fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: 0.08, fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif" }}>{label}</div>
        </div>
      )}
      {children}
    </div>
  );
}

const SECTION_LABELS = {
  metrics: 'Summary Statistics',
  'bar-chart': null,
  'forecast-chart': null,
  table: null,
  text: null,
  alert: 'Compliance Notice',
  findings: 'Findings',
  checklist: 'Verification Results',
  memo: 'Official Memorandum',
  flow: 'Process Sequence',
};

const SECTION_INTRO = {
  'bar-chart':      'The following chart illustrates the distribution across partner organisations for the review period:',
  'forecast-chart': 'The figure below presents the quarterly trend with the forward-looking baseline forecast:',
  table:            'The table below provides the detailed data underlying the findings described in this section:',
};

/* ─── Narrative section renderer ─────────────────────── */
function DocNarrativeSection({ heading, body, sectionIndex }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 10, paddingBottom: 6,
        borderBottom: `2px solid ${sectionIndex === 0 ? COLORS.teal : COLORS.mint}`,
      }}>
        {sectionIndex > 0 && (
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: COLORS.mint, color: '#fff',
            fontSize: '0.72em', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>{sectionIndex}</div>
        )}
        <div style={{
          fontSize: sectionIndex === 0 ? '0.95em' : '0.88em',
          fontWeight: 700,
          color: sectionIndex === 0 ? COLORS.teal : '#111',
          textTransform: 'uppercase',
          letterSpacing: 0.08,
          fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
        }}>{heading}</div>
      </div>
      {body.split('\n\n').map((para, pi) => (
        <p key={pi} style={{
          fontSize: '0.89em',
          color: '#1a1a1a',
          fontFamily: "Georgia, 'Times New Roman', Times, serif",
          lineHeight: 1.9,
          margin: '0 0 13px',
          textAlign: 'justify',
          hyphens: 'auto',
        }}>{para}</p>
      ))}
    </div>
  );
}

/* ─── Supporting data annex renderer ─────────────────── */
function DocAnnex({ sections }) {
  if (!sections || sections.length === 0) return null;
  let figNum = 0, tabNum = 0;

  const rendered = sections.map((section, i) => {
    switch (section.type) {
      case 'metrics':
        return (
          <div key={i} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.78em', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Annex — Summary Statistics</div>
            <DocMetrics items={section.items} />
          </div>
        );
      case 'bar-chart': {
        figNum += 1;
        return (
          <div key={i} style={{ marginBottom: 24 }}>
            <DocBarChart title={section.title} bars={section.bars} baseline={section.baseline} />
            <div style={{ fontSize: '0.74em', color: '#888', textAlign: 'center', marginTop: 5, fontStyle: 'italic' }}>
              Figure {figNum}: {section.title}
            </div>
          </div>
        );
      }
      case 'forecast-chart': {
        figNum += 1;
        return (
          <div key={i} style={{ marginBottom: 24 }}>
            <DocForecastChart title={section.title} points={section.points} />
            <div style={{ fontSize: '0.74em', color: '#888', textAlign: 'center', marginTop: 5, fontStyle: 'italic' }}>
              Figure {figNum}: {section.title}
            </div>
          </div>
        );
      }
      case 'table': {
        tabNum += 1;
        return (
          <div key={i} style={{ marginBottom: 24 }}>
            <DocTable title={section.title} headers={section.headers} rows={section.rows} statusCol={section.statusCol} highlightRows={section.highlightRows} />
            <div style={{ fontSize: '0.74em', color: '#888', textAlign: 'center', marginTop: 5, fontStyle: 'italic' }}>
              Table {tabNum}: {section.title ?? section.headers?.join(', ')}
            </div>
          </div>
        );
      }
      case 'text':
        return <DocText key={i} content={section.content} variant={section.variant} />;
      case 'alert':
        return <DocAlert key={i} severity={section.severity} title={section.title} text={section.text} />;
      case 'findings':
        return (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.78em', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Annex — Detailed Findings</div>
            <DocFindings items={section.items} />
          </div>
        );
      case 'checklist':
        return (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.78em', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Annex — Verification Checklist</div>
            <DocChecklist title={section.title} items={section.items} />
          </div>
        );
      case 'memo':
        return <DocMemo key={i} {...section} />;
      case 'flow':
        return (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.78em', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Annex — Process Sequence</div>
            <DocFlow steps={section.steps} />
          </div>
        );
      default:
        return null;
    }
  });

  return (
    <div style={{ marginTop: 36 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 18, paddingBottom: 8,
        borderBottom: `2px solid ${COLORS.teal}`,
      }}>
        <div style={{ fontSize: '0.88em', fontWeight: 700, color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 0.08, fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif" }}>
          Annexes — Supporting Data and Figures
        </div>
      </div>
      {rendered}
    </div>
  );
}

/* ─── Google Docs chrome wrapper ─────────────────────── */
function GoogleDocsChrome({ fileName, children }) {
  const toolbarBtn = (label) => (
    <span key={label} style={{ fontSize: '0.78em', color: '#444', padding: '2px 6px', borderRadius: 3, cursor: 'default', whiteSpace: 'nowrap' }}
      onMouseEnter={e => e.currentTarget.style.background = '#E8EAED'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{label}</span>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F9FA', fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif" }}>
      {/* Docs top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E0E0E0', flexShrink: 0 }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px 0' }}>
          <GoogleDocsIcon size={28} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9em', fontWeight: 600, color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fileName}
            </div>
            <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
              {['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Extensions', 'Help'].map(toolbarBtn)}
            </div>
          </div>
          {/* Sharing controls simulation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: '#1A73E8', borderRadius: 20, cursor: 'default' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
              <span style={{ fontSize: '0.8em', color: '#fff', fontWeight: 600 }}>Share</span>
            </div>
          </div>
        </div>
        {/* Formatting toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, padding: '3px 8px 5px', borderTop: '1px solid #F1F3F4', overflowX: 'auto' }}>
          {['100%', '|', 'Normal text', '|', 'Arial', '|', '11', '|', 'B', 'I', 'U', '|', '≡', '≡', '≡'].map((item, i) => (
            <span key={i} style={{ fontSize: item === 'B' ? '0.85em' : '0.78em', fontWeight: item === 'B' ? 700 : 400, color: '#444', padding: '2px 5px', borderRadius: 3, cursor: 'default', whiteSpace: 'nowrap', flexShrink: 0, background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = '#E8EAED'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{item}</span>
          ))}
        </div>
      </div>

      {/* Ruler */}
      <div style={{ background: '#F8F9FA', borderBottom: '1px solid #E0E0E0', height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px', overflow: 'hidden' }}>
        <div style={{ flex: 1, height: 8, position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', border: '1px solid #DADCE0', borderRadius: 1 }} />
          {[0,10,20,30,40,50,60].map(pct => (
            <div key={pct} style={{ position: 'absolute', left: `${pct / 60 * 100}%`, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 1, height: pct % 20 === 0 ? 8 : 4, background: '#9AA0A6', marginTop: pct % 20 === 0 ? 0 : 2 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Page canvas */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', background: '#F8F9FA' }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Full Report Document ────────────────────────────── */
export function FullReportDocument({ outputData, agentName, agentRole, reportTitle, agentId }) {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const dataSections = outputData?.sections ?? [];
  const narrative = agentId ? REPORT_NARRATIVES[agentId] : null;

  const docRef = narrative?.docRef ?? `PKSF-PI-AUTO-${new Date().getFullYear()}`;
  const fileName = `${reportTitle ?? 'Programme Intelligence Report'} — ${docRef}.docx`;

  const docBody = (
    <div style={{ maxWidth: 680, margin: '0 auto', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)', fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif" }}>

        {/* Letterhead */}
        <div style={{ background: `linear-gradient(135deg, ${COLORS.mint} 0%, ${COLORS.teal} 100%)`, padding: '32px 40px 26px' }}>
          <div style={{ fontSize: '0.66em', fontWeight: 700, color: 'rgba(255,255,255,0.72)', letterSpacing: 0.16, textTransform: 'uppercase', marginBottom: 8 }}>
            Palli Karma-Sahayak Foundation (PKSF) · Programme Intelligence System
          </div>
          <div style={{ fontSize: '1.45em', fontWeight: 700, color: '#fff', fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif", lineHeight: 1.2, marginBottom: 12 }}>
            {reportTitle ?? 'Programme Intelligence Report'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
            {[
              ['Prepared by', agentName],
              ['Role', agentRole ?? 'Programme Intelligence'],
              ['Date', today],
              ['Document Ref', docRef],
            ].map(([k, v]) => v ? (
              <div key={k} style={{ fontSize: '0.76em', color: 'rgba(255,255,255,0.72)' }}>
                {k}: <strong style={{ color: '#fff' }}>{v}</strong>
              </div>
            ) : null)}
          </div>
        </div>

        {/* Classification band */}
        <div style={{ background: COLORS.amber, padding: '4px 40px', fontSize: '0.7em', fontWeight: 800, color: '#fff', letterSpacing: 0.12, textTransform: 'uppercase', textAlign: 'center' }}>
          Internal — PKSF Use Only · Agnetic AI · Programme Intelligence System
        </div>

        {/* Document metadata row */}
        <div style={{ background: '#F7FCF9', padding: '10px 40px', borderBottom: '1px solid #C8D8CF', display: 'flex', gap: 28, fontSize: '0.73em', color: '#666', flexWrap: 'wrap' }}>
          <span>System: Agnetic AI · PKSF Edition v2.3</span>
          <span>Ref: {docRef}</span>
          <span>Classification: INTERNAL</span>
        </div>

        {/* Document body */}
        <div style={{ padding: '36px 40px' }}>

          {narrative ? (
            /* ── Narrative-first text report ── */
            <>
              {narrative.sections.map((ns, i) => (
                <DocNarrativeSection
                  key={i}
                  heading={ns.heading}
                  body={ns.body}
                  sectionIndex={i}
                />
              ))}
              {/* Supporting data/figures appended as annex */}
              <DocAnnex sections={dataSections} />
            </>
          ) : (
            /* ── Fallback: data sections only (no narrative available) ── */
            (() => {
              sectionNum = 0;
              let figNum = 0, tabNum = 0;
              return dataSections.map((section, i) => {
                const label = SECTION_LABELS[section.type];
                const intro = SECTION_INTRO[section.type];
                switch (section.type) {
                  case 'metrics':
                    return (
                      <DocSection key={i} label={label}>
                        <DocMetrics items={section.items} />
                      </DocSection>
                    );
                  case 'bar-chart': {
                    figNum += 1;
                    return (
                      <div key={i} style={{ marginBottom: 22 }}>
                        {intro && <p style={{ fontSize: '0.88em', color: '#333', lineHeight: 1.75, margin: '0 0 6px' }}>{intro}</p>}
                        <DocBarChart title={section.title} bars={section.bars} baseline={section.baseline} />
                        <div style={{ fontSize: '0.75em', color: '#888', textAlign: 'center', marginTop: 4, fontStyle: 'italic' }}>
                          Figure {figNum}: {section.title}
                        </div>
                      </div>
                    );
                  }
                  case 'forecast-chart': {
                    figNum += 1;
                    return (
                      <div key={i} style={{ marginBottom: 22 }}>
                        {intro && <p style={{ fontSize: '0.88em', color: '#333', lineHeight: 1.75, margin: '0 0 6px' }}>{intro}</p>}
                        <DocForecastChart title={section.title} points={section.points} />
                        <div style={{ fontSize: '0.75em', color: '#888', textAlign: 'center', marginTop: 4, fontStyle: 'italic' }}>
                          Figure {figNum}: {section.title}
                        </div>
                      </div>
                    );
                  }
                  case 'table': {
                    tabNum += 1;
                    return (
                      <div key={i} style={{ marginBottom: 22 }}>
                        {intro && <p style={{ fontSize: '0.88em', color: '#333', lineHeight: 1.75, margin: '0 0 6px' }}>{intro}</p>}
                        <DocTable title={section.title} headers={section.headers} rows={section.rows} statusCol={section.statusCol} highlightRows={section.highlightRows} />
                        <div style={{ fontSize: '0.75em', color: '#888', textAlign: 'center', marginTop: 4, fontStyle: 'italic' }}>
                          Table {tabNum}: {section.title ?? section.headers?.join(', ')}
                        </div>
                      </div>
                    );
                  }
                  case 'text':
                    return <DocText key={i} content={section.content} variant={section.variant} />;
                  case 'alert':
                    return (
                      <DocSection key={i} label={label}>
                        <DocAlert severity={section.severity} title={section.title} text={section.text} />
                      </DocSection>
                    );
                  case 'findings':
                    return (
                      <DocSection key={i} label={label}>
                        <DocFindings items={section.items} />
                      </DocSection>
                    );
                  case 'checklist':
                    return (
                      <DocSection key={i} label={label}>
                        <p style={{ fontSize: '0.88em', color: '#333', lineHeight: 1.75, margin: '0 0 8px' }}>
                          All {section.items?.length ?? 0} numeric claims in the document were verified against signed MIS extracts. Results are summarised below:
                        </p>
                        <DocChecklist title={section.title} items={section.items} />
                      </DocSection>
                    );
                  case 'memo':
                    return (
                      <DocSection key={i} label={label}>
                        <DocMemo {...section} />
                      </DocSection>
                    );
                  case 'flow':
                    return (
                      <DocSection key={i} label={label}>
                        <p style={{ fontSize: '0.88em', color: '#333', lineHeight: 1.75, margin: '0 0 8px' }}>
                          The following sequence illustrates the specialist activation chain for this workflow:
                        </p>
                        <DocFlow steps={section.steps} />
                      </DocSection>
                    );
                  default:
                    return null;
                }
              });
            })()
          )}
        </div>

        {/* Page footer */}
        <div style={{ background: '#F7FCF9', borderTop: '1px solid #C8D8CF', padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7em', color: '#888' }}>
          <span>PKSF Programme Intelligence System · Agnetic AI · {today}</span>
          <span>CONFIDENTIAL — INTERNAL USE ONLY</span>
        </div>
      </div>
  );

  return (
    <GoogleDocsChrome fileName={fileName}>
      {docBody}
    </GoogleDocsChrome>
  );
}
