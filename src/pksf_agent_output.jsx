/**
 * StructuredAgentOutput — renders rich, PKSF-branded output cards per agent.
 * Section types: metrics | bar-chart | forecast-chart | table | text | alert |
 *               findings | checklist | memo | flow
 */
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, FileText, FileDown, FolderOpen, Send, ChevronLeft } from 'lucide-react';
import { FullReportDocument, SourcesPanel, SendPanel } from './pksf_agent_drawer_panels.jsx';
import { COLORS } from './pksf_demo_scenarios.js';

/* ─── colour helpers ─────────────────────────────────── */
const C = {
  mint: COLORS.mint,
  teal: COLORS.teal,
  amber: COLORS.amber,
  red: COLORS.red,
  textMute: COLORS.textMute,
};

function resolveColor(key) {
  return C[key] ?? COLORS.textDim;
}

/* ─── Metrics row ─────────────────────────────────────── */
function MetricsRow({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 10, marginBottom: 14 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            padding: '12px 14px',
            borderRadius: 8,
            background: COLORS.surfaceHi,
            border: `1px solid ${COLORS.border}`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.55em', fontWeight: 800, color: resolveColor(item.color), lineHeight: 1.1, fontFamily: "'Syne', sans-serif" }}>
            {item.value}
          </div>
          <div style={{ fontSize: '0.82em', color: COLORS.text, fontWeight: 600, marginTop: 4 }}>{item.label}</div>
          {item.sub && <div style={{ fontSize: '0.75em', color: COLORS.textMute, marginTop: 2 }}>{item.sub}</div>}
        </div>
      ))}
    </div>
  );
}

/* ─── Horizontal bar chart ────────────────────────────── */
function BarChart({ title, bars, baseline }) {
  const maxVal = Math.max(...bars.map((b) => b.value), 100);
  const barColors = {
    mint: COLORS.mint,
    teal: COLORS.teal,
    amber: COLORS.amber,
    red: COLORS.red,
  };

  return (
    <div style={{ marginBottom: 14 }}>
      {title && (
        <div style={{ fontSize: '0.83em', color: COLORS.textDim, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.04 }}>
          {title}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {bars.map((bar, i) => {
          const pct = Math.round((bar.value / maxVal) * 100);
          const color = barColors[bar.color] ?? COLORS.mint;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 64, fontSize: '0.78em', color: COLORS.textDim, fontWeight: 600, flexShrink: 0, textAlign: 'right' }}>
                {bar.label}
              </div>
              <div style={{ flex: 1, height: 22, background: COLORS.surfaceHi, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                {/* baseline marker */}
                {baseline && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${Math.round((baseline.value / maxVal) * 100)}%`,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: COLORS.textMute,
                      opacity: 0.5,
                      zIndex: 2,
                    }}
                  />
                )}
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    borderRadius: 4,
                    opacity: 0.85,
                    transition: 'width 0.6s ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 6,
                  }}
                >
                  <span style={{ fontSize: '0.72em', color: '#fff', fontWeight: 700 }}>{bar.value}%</span>
                </div>
              </div>
              {bar.note && (
                <div style={{ fontSize: '0.76em', color: color, fontWeight: 700, flexShrink: 0, width: 60 }}>
                  {bar.note}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {baseline && (
        <div style={{ fontSize: '0.75em', color: COLORS.textMute, marginTop: 6, paddingLeft: 72 }}>
          ▏ {baseline.label}
        </div>
      )}
    </div>
  );
}

/* ─── Simple SVG line / forecast chart ───────────────── */
function ForecastChart({ title, points }) {
  const W = 340, H = 100, PAD = { t: 16, r: 20, b: 28, l: 36 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const vals = points.map((p) => p.value);
  const minV = Math.min(...vals) - 4;
  const maxV = Math.max(...vals) + 4;

  const x = (i) => PAD.l + (i / (points.length - 1)) * innerW;
  const y = (v) => PAD.t + innerH - ((v - minV) / (maxV - minV)) * innerH;

  const actualPoints = points.filter((p) => p.type === 'actual');
  const splitIdx = points.findIndex((p) => p.type === 'forecast');

  const buildPath = (pts) =>
    pts.map((p, i) => {
      const idx = points.indexOf(p);
      return `${i === 0 ? 'M' : 'L'} ${x(idx)} ${y(p.value)}`;
    }).join(' ');

  const actualPath = buildPath(
    splitIdx > 0 ? points.slice(0, splitIdx + 1) : actualPoints
  );
  const forecastPath = splitIdx >= 0 ? buildPath(points.slice(splitIdx - 1)) : null;

  return (
    <div style={{ marginBottom: 14 }}>
      {title && (
        <div style={{ fontSize: '0.83em', color: COLORS.textDim, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.04 }}>
          {title}
        </div>
      )}
      <div style={{ background: COLORS.surfaceHi, borderRadius: 8, padding: '10px 12px', border: `1px solid ${COLORS.border}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* grid lines */}
          {[0, 0.5, 1].map((t, i) => {
            const yy = PAD.t + t * innerH;
            return (
              <line key={i} x1={PAD.l} y1={yy} x2={W - PAD.r} y2={yy}
                stroke={COLORS.border} strokeWidth={1} strokeDasharray="3,3" />
            );
          })}
          {/* y-axis labels */}
          {[0, 0.5, 1].map((t, i) => {
            const v = Math.round(maxV - t * (maxV - minV));
            const yy = PAD.t + t * innerH;
            return (
              <text key={i} x={PAD.l - 4} y={yy + 4} textAnchor="end"
                fontSize={9} fill={COLORS.textMute}>{v}%</text>
            );
          })}
          {/* actual line */}
          <path d={actualPath} fill="none" stroke={COLORS.mint} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {/* forecast dashed line */}
          {forecastPath && (
            <path d={forecastPath} fill="none" stroke={COLORS.teal} strokeWidth={2} strokeDasharray="5,4" strokeLinecap="round" />
          )}
          {/* dots + x-labels */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(p.value)} r={4}
                fill={p.type === 'forecast' ? COLORS.teal : COLORS.mint}
                stroke="#fff" strokeWidth={1.5} />
              <text x={x(i)} y={H - 4} textAnchor="middle"
                fontSize={9} fill={COLORS.textMute}>{p.label}</text>
              <text x={x(i)} y={y(p.value) - 7} textAnchor="middle"
                fontSize={9} fontWeight="700" fill={p.type === 'forecast' ? COLORS.teal : COLORS.mint}>
                {p.value}%
              </text>
            </g>
          ))}
        </svg>
        <div style={{ display: 'flex', gap: 16, marginTop: 6, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75em', color: COLORS.textDim }}>
            <div style={{ width: 18, height: 2.5, background: COLORS.mint, borderRadius: 2 }} />
            Actual
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75em', color: COLORS.textDim }}>
            <div style={{ width: 18, height: 2, background: COLORS.teal, borderRadius: 2, borderTop: `2px dashed ${COLORS.teal}` }} />
            Forecast (baseline)
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Data table ─────────────────────────────────────── */
const STATUS_STYLE = {
  Active:   { color: COLORS.mint, bg: '#ECFDF5' },
  Review:   { color: COLORS.amber, bg: '#FFFBEB' },
  'Outside window': { color: COLORS.red, bg: '#FEF2F2' },
  High:     { color: COLORS.red, bg: '#FEF2F2' },
  Medium:   { color: COLORS.amber, bg: '#FFFBEB' },
  Low:      { color: COLORS.teal, bg: '#F0FDFA' },
  RESTRICTED: { color: COLORS.red, bg: '#FEF2F2' },
};

function DataTable({ title, headers, rows, highlightRows = [], statusCol }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {title && (
        <div style={{ fontSize: '0.83em', color: COLORS.textDim, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.04 }}>
          {title}
        </div>
      )}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em' }}>
          <thead>
            <tr style={{ background: COLORS.surfaceHi }}>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: '8px 12px', textAlign: 'left', color: COLORS.textDim, fontWeight: 700, borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const isHighlighted = highlightRows.includes(ri);
              return (
                <tr key={ri} style={{ background: isHighlighted ? '#FFFBEB' : 'transparent' }}>
                  {row.map((cell, ci) => {
                    const isStatus = ci === statusCol;
                    const style = isStatus ? STATUS_STYLE[cell] : null;
                    return (
                      <td key={ci} style={{ padding: '7px 12px', borderBottom: ri < rows.length - 1 ? `1px solid ${COLORS.border}` : 'none', color: COLORS.text, verticalAlign: 'middle' }}>
                        {isStatus && style ? (
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, background: style.bg, color: style.color, fontWeight: 700, fontSize: '0.9em' }}>
                            {cell}
                          </span>
                        ) : cell}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Text / callout block ────────────────────────────── */
const TEXT_VARIANTS = {
  callout: { bg: '#EEF8F2', border: COLORS.mint, icon: Info, iconColor: COLORS.mint },
  warning: { bg: '#FFFBEB', border: COLORS.amber, icon: AlertTriangle, iconColor: COLORS.amber },
  error:   { bg: '#FEF2F2', border: COLORS.red,   icon: XCircle,       iconColor: COLORS.red },
  normal:  { bg: COLORS.surfaceHi, border: COLORS.border, icon: null, iconColor: null },
};

function TextBlock({ content, variant = 'normal' }) {
  const v = TEXT_VARIANTS[variant] ?? TEXT_VARIANTS.normal;
  const Icon = v.icon;
  return (
    <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 8, background: v.bg, border: `1px solid ${v.border}`, marginBottom: 14 }}>
      {Icon && <Icon size={16} color={v.iconColor} style={{ flexShrink: 0, marginTop: 2 }} />}
      <div style={{ fontSize: '0.92em', color: COLORS.text, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{content}</div>
    </div>
  );
}

/* ─── Alert banner ───────────────────────────────────── */
function AlertBanner({ severity, title, text }) {
  const cfg = severity === 'error'
    ? { bg: '#FEF2F2', border: COLORS.red, iconColor: COLORS.red, Icon: XCircle }
    : { bg: '#FFFBEB', border: COLORS.amber, iconColor: COLORS.amber, Icon: AlertTriangle };
  return (
    <div style={{ padding: '14px 16px', borderRadius: 8, background: cfg.bg, border: `1.5px solid ${cfg.border}`, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <cfg.Icon size={17} color={cfg.iconColor} />
        <div style={{ fontSize: '0.95em', fontWeight: 700, color: cfg.iconColor }}>{title}</div>
      </div>
      <div style={{ fontSize: '0.9em', color: COLORS.text, lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

/* ─── Findings list ──────────────────────────────────── */
const FINDING_ICONS = {
  pass: { Icon: CheckCircle2, color: COLORS.mint },
  warn: { Icon: AlertTriangle, color: COLORS.amber },
  info: { Icon: Info, color: COLORS.teal },
  fail: { Icon: XCircle, color: COLORS.red },
};

function FindingsList({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
      {items.map((item, i) => {
        const { Icon, color } = FINDING_ICONS[item.status] ?? FINDING_ICONS.info;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', borderRadius: 7, background: COLORS.surfaceHi, border: `1px solid ${COLORS.border}` }}>
            <Icon size={15} color={color} style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.82em', color: COLORS.textDim, fontWeight: 600 }}>{item.label}: </span>
              <span style={{ fontSize: '0.9em', color: COLORS.text, fontWeight: 500 }}>{item.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Checklist ──────────────────────────────────────── */
function Checklist({ title, items }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {title && (
        <div style={{ fontSize: '0.83em', color: COLORS.textDim, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.04 }}>
          {title}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item, i) => {
          const { Icon, color } = FINDING_ICONS[item.status] ?? FINDING_ICONS.info;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px', borderRadius: 6, background: COLORS.surfaceHi }}>
              <Icon size={14} color={color} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.88em', color: COLORS.text }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Memo document ──────────────────────────────────── */
function MemoDocument({ to, from, date, ref, subject, classification, sections }) {
  return (
    <div style={{ border: `1.5px solid ${COLORS.borderHi}`, borderRadius: 10, overflow: 'hidden', marginBottom: 14, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Classification banner */}
      <div style={{ background: COLORS.amber, padding: '5px 14px', fontSize: '0.75em', fontWeight: 800, color: '#fff', letterSpacing: 0.08, textTransform: 'uppercase', textAlign: 'center' }}>
        {classification}
      </div>
      {/* Memo header grid */}
      <div style={{ padding: '14px 18px', background: COLORS.surfaceHi, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: '1em', fontWeight: 800, color: COLORS.text, marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>
          PKSF — Internal Memorandum
        </div>
        {[['To', to], ['From', from], ['Date', date], ['Ref', ref]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 8, fontSize: '0.85em', marginBottom: 3 }}>
            <span style={{ color: COLORS.textDim, fontWeight: 600, width: 40, flexShrink: 0 }}>{k}:</span>
            <span style={{ color: COLORS.text }}>{v}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, padding: '7px 10px', background: COLORS.surface, borderRadius: 6, border: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: '0.83em', color: COLORS.textDim, fontWeight: 600 }}>Subject: </span>
          <span style={{ fontSize: '0.9em', color: COLORS.text, fontWeight: 700 }}>{subject}</span>
        </div>
      </div>
      {/* Memo body sections */}
      <div style={{ padding: '14px 18px', background: COLORS.surface }}>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: i < sections.length - 1 ? 14 : 0 }}>
            <div style={{ fontSize: '0.88em', fontWeight: 700, color: COLORS.mint, marginBottom: 5 }}>{s.heading}</div>
            <div style={{ fontSize: '0.9em', color: COLORS.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Agent activation flow ──────────────────────────── */
function FlowDiagram({ steps }) {
  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'max-content' }}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 8,
                background: COLORS.surfaceHi,
                border: `1.5px solid ${resolveColor(step.color)}`,
                minWidth: 72,
              }}
            >
              <div style={{ fontSize: '0.8em', fontWeight: 700, color: resolveColor(step.color), textAlign: 'center' }}>{step.label}</div>
              <div style={{ fontSize: '0.7em', color: COLORS.textMute, textAlign: 'center', marginTop: 2 }}>{step.sub}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 18, height: 2, background: COLORS.border, flexShrink: 0, position: 'relative' }}>
                <div style={{ position: 'absolute', right: -4, top: -4, fontSize: 10, color: COLORS.textMute }}>›</div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ─── Main router ─────────────────────────────────────── */
export function StructuredAgentOutput({ outputData }) {
  if (!outputData?.sections?.length) return null;

  return (
    <div>
      {outputData.sections.map((section, i) => {
        switch (section.type) {
          case 'metrics':
            return <MetricsRow key={i} items={section.items} />;
          case 'bar-chart':
            return <BarChart key={i} title={section.title} bars={section.bars} baseline={section.baseline} />;
          case 'forecast-chart':
            return <ForecastChart key={i} title={section.title} points={section.points} />;
          case 'table':
            return <DataTable key={i} title={section.title} headers={section.headers} rows={section.rows} highlightRows={section.highlightRows} statusCol={section.statusCol} />;
          case 'text':
            return <TextBlock key={i} content={section.content} variant={section.variant} />;
          case 'alert':
            return <AlertBanner key={i} severity={section.severity} title={section.title} text={section.text} />;
          case 'findings':
            return <FindingsList key={i} items={section.items} />;
          case 'checklist':
            return <Checklist key={i} title={section.title} items={section.items} />;
          case 'memo':
            return <MemoDocument key={i} {...section} />;
          case 'flow':
            return <FlowDiagram key={i} steps={section.steps} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

/* ─── Output drawer ──────────────────────────────────── */
export function OutputDrawer({ outputData, agentId, agentName, agentRole, onClose }) {
  const reportTitle = outputData?.reportTitle;
  const [activePanel, setActivePanel] = useState(null); // null | 'report' | 'sources' | 'send'

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (activePanel) setActivePanel(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, activePanel]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const FOOTER_BTNS = [
    { id: 'report',  label: 'Full Report',     Icon: FileDown   },
    { id: 'sources', label: 'Access Sources',  Icon: FolderOpen },
    { id: 'send',    label: 'Send',            Icon: Send       },
  ];

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(4,19,8,0.35)',
          zIndex: 900,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          height: '100vh',
          width: 'min(720px, 90vw)',
          background: COLORS.surface,
          boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
          zIndex: 901,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide-in-right 0.28s ease-out both',
        }}
      >
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}`, background: COLORS.surfaceHi, flexShrink: 0 }}>
          {activePanel && (
            <button type="button" onClick={() => setActivePanel(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 7, border: `1px solid ${COLORS.border}`, background: COLORS.surface, cursor: 'pointer', fontSize: '0.82em', color: COLORS.textDim, fontWeight: 600, flexShrink: 0 }}>
              <ChevronLeft size={14} /> Back
            </button>
          )}
          {!activePanel && (
            <div style={{ width: 38, height: 38, borderRadius: 9, background: COLORS.surface, border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={19} color={COLORS.mint} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.72em', color: COLORS.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.06 }}>
              {activePanel
                ? FOOTER_BTNS.find(b => b.id === activePanel)?.label
                : `${agentName}${agentRole ? ` · ${agentRole}` : ''}`}
            </div>
            <div style={{ fontSize: '1em', fontWeight: 800, color: COLORS.text, fontFamily: "'Syne', sans-serif", lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activePanel ? (reportTitle ?? 'Report') : (reportTitle ?? 'Agent Output Report')}
            </div>
          </div>
          <button type="button" onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.surface, cursor: 'pointer', flexShrink: 0 }}>
            <X size={17} color={COLORS.textDim} />
          </button>
        </div>

        {/* Drawer body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-thin">
          {activePanel === 'report' && (
            <FullReportDocument
              outputData={outputData}
              agentName={agentName}
              agentRole={agentRole}
              reportTitle={reportTitle}
              agentId={agentId}
            />
          )}
          {activePanel === 'sources' && <SourcesPanel agentId={agentId} />}
          {activePanel === 'send' && <SendPanel reportTitle={reportTitle} agentName={agentName} />}
          {!activePanel && (
            <div style={{ padding: '24px' }}>
              <StructuredAgentOutput outputData={outputData} />
            </div>
          )}
        </div>

        {/* Footer — 3 action buttons */}
        <div style={{ display: 'flex', borderTop: `1px solid ${COLORS.border}`, background: COLORS.surfaceHi, flexShrink: 0 }}>
          {FOOTER_BTNS.map(({ id, label, Icon }) => {
            const isActive = activePanel === id;
            return (
              <button key={id} type="button" onClick={() => setActivePanel(isActive ? null : id)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 5, padding: '14px 8px',
                  border: 'none', borderRight: id !== 'send' ? `1px solid ${COLORS.border}` : 'none',
                  background: isActive ? COLORS.mint : 'transparent',
                  color: isActive ? '#fff' : COLORS.textDim,
                  fontSize: '0.78em', fontWeight: 700, cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}>
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </>,
    document.body
  );
}
