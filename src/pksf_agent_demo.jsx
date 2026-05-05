import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Bot,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  GitBranch,
  Zap,
  Send,
  Eye,
  Layers,
  Network,
  Lock,
  FileCheck,
  Workflow,
  Loader2,
  SkipForward,
  Languages,
  Presentation,
  FileText,
  ScrollText,
  Brain,
  X,
  Paperclip,
  MapPin,
  FileBarChart,
  Database,
  ChevronLeft,
  FileDown,
} from 'lucide-react';
import {
  AGENTS,
  COLORS,
  DEPARTMENTS,
  SCENARIOS,
  UI_STRINGS,
} from './pksf_demo_scenarios.js';
import { StructuredAgentOutput, OutputDrawer } from './pksf_agent_output.jsx';
import { SendPanel, MisUploadPanel } from './pksf_agent_drawer_panels.jsx';

const SIMULATED_FILES = [
  { name: 'PO_Khulna_Q1_2026_Field_Reports.pdf', size: '1.2 MB' },
  { name: 'PKSF_Regional_MIS_Export_Q1.xlsx', size: '847 KB' },
  { name: 'Loan_Portfolio_Khulna_Mar2026.csv', size: '234 KB' },
  { name: 'Field_Officer_Logs_Sylhet_Q1.pdf', size: '3.1 MB' },
  { name: 'Disbursement_Ledger_Rajshahi.xlsx', size: '1.5 MB' },
];

export default function PKSFAgentDemo() {
  const scenarioKeys = Object.keys(SCENARIOS);
  const [scenarioKey, setScenarioKey] = useState('khulna');
  const [lang, setLang] = useState('en');
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [chatbotState, setChatbotState] = useState('idle');
  const [reasoning, setReasoning] = useState([]);
  const [tools, setTools] = useState([]);
  const [activeAgents, setActiveAgents] = useState([]);
  const [taskState, setTaskState] = useState({});
  const [escalation, setEscalation] = useState(false);
  const [memoGate, setMemoGate] = useState(false);
  const [showArtifact, setShowArtifact] = useState(false);
  const [presenterOpen, setPresenterOpen] = useState(true);
  const [presenterNoteStep, setPresenterNoteStep] = useState(-1);
  const [stepMode, setStepMode] = useState(false);
  const [agentRuns, setAgentRuns] = useState([]);
  const [stepCursor, setStepCursor] = useState(0);
  const [pausedVisual, setPausedVisual] = useState(false);
  const [finishedAgents, setFinishedAgents] = useState([]);

  const [attachedFiles, setAttachedFiles] = useState([]);

  const [department, setDepartment] = useState('programme');
  const [misPhase, setMisPhase] = useState('idle'); // 'idle' | 'connecting' | 'ready'
  const [misSteps, setMisSteps] = useState([]);

  const escalationResolver = useRef(null);
  const memoGateResolver = useRef(null);
  const pauseRef = useRef(false);
  const abortRef = useRef(false);
  const stepIdxRef = useRef(0);
  const reasoningEndRef = useRef(null);
  const currentAgentIdRef = useRef(null);
  const activeScenario = SCENARIOS[scenarioKey];

  const t = useCallback((k) => UI_STRINGS[lang][k] ?? UI_STRINGS.en[k] ?? k, [lang]);

  useEffect(() => {
    if (reasoningEndRef.current) {
      reasoningEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [reasoning]);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const waitMs = async (ms) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (abortRef.current) return;
      while (pauseRef.current && !abortRef.current) {
        await sleep(80);
      }
      await sleep(Math.min(80, end - Date.now()));
    }
  };

  const reset = useCallback(() => {
    abortRef.current = true;
    pauseRef.current = false;
    setPausedVisual(false);
    setRunning(false);
    setCompleted(false);
    setChatbotState('idle');
    setReasoning([]);
    setTools([]);
    setActiveAgents([]);
    setTaskState({});
    setEscalation(false);
    setMemoGate(false);
    setShowArtifact(false);
    setAgentRuns([]);
    setFinishedAgents([]);
    setMisPhase('idle');
    setMisSteps([]);
    currentAgentIdRef.current = null;
    setPresenterNoteStep(-1);
    stepIdxRef.current = 0;
    setStepCursor(0);
    escalationResolver.current = null;
    memoGateResolver.current = null;
  }, []);

  const handleAttachFile = useCallback(() => {
    setAttachedFiles((prev) => {
      const unused = SIMULATED_FILES.filter((f) => !prev.find((p) => p.name === f.name));
      if (unused.length === 0) return prev;
      return [...prev, unused[0]];
    });
  }, []);

  useEffect(() => {
    reset();
  }, [scenarioKey, reset]);

  useEffect(() => {
    const dept = DEPARTMENTS.find((d) => d.id === department);
    if (dept && dept.scenarioKeys.length > 0) {
      setScenarioKey(dept.scenarioKeys[0]);
    }
  }, [department]);

  const applyStep = async (step, stepIdx) => {
    setPresenterNoteStep(stepIdx);
    switch (step.type) {
      case 'reason':
        setReasoning((prev) => [
          ...prev,
          {
            id: prev.length,
            text: step.text,
            ts: Date.now(),
            sources: step.sources,
          },
        ]);
        break;
      case 'tool':
        setTools((prev) => [...prev, { id: prev.length, icon: step.icon, label: step.label, agentId: currentAgentIdRef.current }]);
        break;
      case 'agent':
        currentAgentIdRef.current = step.id;
        setActiveAgents((prev) => (prev.includes(step.id) ? prev : [...prev, step.id]));
        if (step.freyaPrompt || step.reasoning || step.calculations?.length || step.output) {
          setAgentRuns((prev) => [
            ...prev,
            {
              id: `run-${stepIdx}-${step.id}`,
              agentId: step.id,
              freyaPrompt: step.freyaPrompt ?? '',
              reasoning: step.reasoning ?? '',
              calculations: step.calculations ?? [],
              output: step.output ?? '',
              outputData: step.outputData ?? null,
            },
          ]);
        }
        break;
      case 'task':
        setTaskState((prev) => ({ ...prev, [step.id]: step.state }));
        break;
      case 'escalate':
        setEscalation(true);
        await new Promise((resolve) => {
          escalationResolver.current = resolve;
        });
        break;
      case 'humanMemoGate':
        setMemoGate(true);
        await new Promise((resolve) => {
          memoGateResolver.current = resolve;
        });
        break;
      case 'artifact':
        setShowArtifact(true);
        break;
      default:
        break;
    }
  };

  const approveEscalation = () => {
    setEscalation(false);
    if (escalationResolver.current) {
      escalationResolver.current();
      escalationResolver.current = null;
    }
  };

  const approveMemoGate = () => {
    setMemoGate(false);
    if (memoGateResolver.current) {
      memoGateResolver.current();
      memoGateResolver.current = null;
    }
  };

  // Per-type delay multipliers — keeps task ticks fast while giving viewers
  // enough time to read reasoning text and absorb agent transitions.
  const DELAY_SCALE = { reason: 3.5, agent: 3.2, tool: 2.8, task: 1.8, default: 2.8 };
  const scaledDelay = (step) =>
    Math.round((step.delay ?? 0) * (DELAY_SCALE[step.type] ?? DELAY_SCALE.default));

  const runChatbot = async () => {
    setChatbotState('thinking');
    await sleep(4000);
    setChatbotState('done');
  };

  const runDemo = async () => {
    if (running) return;
    reset();
    await sleep(40);
    abortRef.current = false;

    pauseRef.current = false;
    setPausedVisual(false);
    setRunning(true);

    // MIS connection phase
    const dept = DEPARTMENTS.find((d) => d.id === department);
    if (dept) {
      setMisPhase('connecting');
      setMisSteps([]);
      for (const step of dept.misSteps) {
        if (abortRef.current) return;
        await sleep(1100);
        setMisSteps((prev) => [...prev, step]);
      }
      await sleep(800);
      setMisPhase('ready');
      await sleep(1200);
      setMisPhase('idle');
      setMisSteps([]);
    }

    if (abortRef.current) return;

    const script = activeScenario.script;
    if (stepMode) {
      stepIdxRef.current = 0;
      setStepCursor(0);
      runChatbot();
      setRunning(false);
      return;
    }

    runChatbot();

    for (let i = 0; i < script.length; i++) {
      if (abortRef.current) break;
      await waitMs(scaledDelay(script[i]));
      if (abortRef.current) break;
      await applyStep(script[i], i);
    }
    if (!abortRef.current) {
      setCompleted(true);
    }
    setRunning(false);
  };

  const runStepForward = useCallback(async () => {
    const script = activeScenario.script;
    const i = stepIdxRef.current;
    if (i >= script.length) return;
    setRunning(true);
    await applyStep(script[i], i);
    stepIdxRef.current = i + 1;
    setStepCursor(stepIdxRef.current);
    if (stepIdxRef.current >= script.length) {
      setCompleted(true);
    }
    setRunning(false);
  }, [activeScenario]);

  // Label for the "run next agent" button — shows the first agent not yet activated.
  // Updates only after the previous agent's block finishes and its card goes Done.
  const nextAgentLabel = useMemo(() => {
    const script = activeScenario.script;
    for (let i = 0; i < script.length; i++) {
      if (script[i].type === 'agent' && !activeAgents.includes(script[i].id)) {
        const agent = AGENTS.find((a) => a.id === script[i].id);
        return agent ? agent.name : script[i].id;
      }
    }
    return null;
  }, [activeAgents, activeScenario]);

  const runNextAgent = useCallback(async () => {
    const script = activeScenario.script;
    const startIdx = stepIdxRef.current;
    if (startIdx >= script.length || running) return;

    abortRef.current = false;
    setRunning(true);

    // Find the first 'agent' step at or after startIdx — the agent whose block we're running
    let firstAgentIdx = -1;
    let runningAgentId = null;
    for (let i = startIdx; i < script.length; i++) {
      if (script[i].type === 'agent') {
        firstAgentIdx = i;
        runningAgentId = script[i].id;
        break;
      }
    }

    // Run until (but not including) the NEXT 'agent' step after firstAgentIdx
    let endIdx = script.length;
    if (firstAgentIdx !== -1) {
      for (let i = firstAgentIdx + 1; i < script.length; i++) {
        if (script[i].type === 'agent') {
          endIdx = i;
          break;
        }
      }
    }

    for (let i = startIdx; i < endIdx; i++) {
      if (abortRef.current) break;
      await sleep(Math.min(scaledDelay(script[i]), 1200));
      if (abortRef.current) break;
      await applyStep(script[i], i);
      stepIdxRef.current = i + 1;
      setStepCursor(stepIdxRef.current);
    }

    // Mark this agent's block as fully done so its card transitions to "Done"
    // before the next agent is activated. This is what triggers the button label update.
    if (!abortRef.current && runningAgentId) {
      setFinishedAgents((prev) => (prev.includes(runningAgentId) ? prev : [...prev, runningAgentId]));
    }

    if (!abortRef.current && stepIdxRef.current >= script.length) {
      setCompleted(true);
    }
    setRunning(false);
  }, [activeScenario, running]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        pauseRef.current = !pauseRef.current;
        setPausedVisual(pauseRef.current);
        setPresenterOpen(true);
      }
      if (e.key === '`' || e.code === 'Backquote') {
        e.preventDefault();
        setPresenterOpen((o) => !o);
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        reset();
      }
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setLang((l) => (l === 'en' ? 'bn' : 'en'));
      }
      if (e.key === 'n' || e.key === 'N') {
        if (stepMode) runStepForward();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stepMode, reset, runStepForward]);

  const tasksDone = Object.values(taskState).filter((s) => s === 'done').length;
  const totalProgress = activeScenario.tasks.length;
  const scriptLen = activeScenario.script.length;
  const currentPresenterNote =
    presenterNoteStep >= 0 && activeScenario.script[presenterNoteStep]?.presenterNote;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Bengali:wght@400;600;700&display=swap');

        * { box-sizing: border-box; }
        body, html, #root { margin: 0; padding: 0; color-scheme: light; }

        @keyframes spin { to { transform: rotate(360deg); } }

        .pksf-root {
          --pksf-scale: 1.2;
          font-family: 'DM Sans', 'Noto Sans Bengali', system-ui, sans-serif;
          font-size: calc(13px * var(--pksf-scale));
          line-height: 1.52;
          color: ${COLORS.text};
          background: ${COLORS.bg};
          min-height: 100vh;
          background-image:
            radial-gradient(ellipse at 20% 0%, rgba(22, 148, 84, 0.1), transparent 52%),
            radial-gradient(ellipse at 80% 100%, rgba(13, 148, 136, 0.07), transparent 50%);
        }

        .font-display { font-family: 'Syne', 'Noto Sans Bengali', sans-serif; letter-spacing: -0.01em; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        @keyframes pulse-mint {
          0%, 100% { box-shadow: 0 0 0 0 rgba(22, 148, 84, 0.45); }
          50% { box-shadow: 0 0 0 8px rgba(22, 148, 84, 0); }
        }
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.7); }
          50% { box-shadow: 0 0 0 14px rgba(248, 113, 113, 0); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-3px); opacity: 1; }
        }

        .anim-fade-up { animation: fade-up 0.5s ease-out both; }
        .spin { animation: spin 1.2s linear infinite; }
        .anim-fade-scale { animation: fade-in-scale 0.4s ease-out both; }
        .anim-slide-right { animation: slide-in-right 0.4s ease-out both; }
        .pulse-mint { animation: pulse-mint 1.8s infinite; }
        .pulse-red { animation: pulse-red 1.4s infinite; }
        .live-dot { animation: pulse-mint 1.8s infinite; }

        .thinking-dots span {
          display: inline-block;
          width: 6px; height: 6px;
          margin: 0 2px;
          background: ${COLORS.textDim};
          border-radius: 50%;
          animation: dot-bounce 1.4s infinite ease-in-out both;
        }
        .thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
        .thinking-dots span:nth-child(2) { animation-delay: -0.16s; }

        .scrollbar-thin::-webkit-scrollbar { width: 8px; height: 8px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: ${COLORS.border};
          border-radius: 4px;
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(22, 148, 84, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(22, 148, 84, 0.07) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .escalation-banner-bg {
          background: linear-gradient(135deg, rgba(248, 113, 113, 0.18), rgba(245, 192, 74, 0.12));
          border: 1px solid rgba(248, 113, 113, 0.5);
        }
      `}</style>

      <div className="pksf-root">
        <div style={{ maxWidth: 1520, margin: '0 auto', padding: '22px 28px 140px' }}>
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 18,
              borderBottom: `1px solid ${COLORS.border}`,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${COLORS.mint}, ${COLORS.teal})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(22, 148, 84, 0.25)',
                }}
              >
                <Workflow size={24} color={COLORS.onAccent} strokeWidth={2.4} />
              </div>
              <div>
                <div className="font-display" style={{ fontSize: '1.55em', fontWeight: 700, lineHeight: 1.15 }}>
                  {t('headerTitle')} <span style={{ color: COLORS.mint }}>·</span> {t('headerBadge')}
                </div>
                <div
                  style={{
                    fontSize: '0.95em',
                    color: COLORS.textDim,
                    letterSpacing: 0.02,
                    marginTop: 4,
                    lineHeight: 1.45,
                  }}
                >
                  {t('glassBoxTheatre')} — {t('headerSubtitle')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  className="live-dot"
                  style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.mint }}
                />
                <span style={{ fontSize: '0.92em', color: COLORS.textDim, fontWeight: 600 }}>{t('live')}</span>
              </div>
              <div style={{ fontSize: '0.92em', color: COLORS.textMute, fontWeight: 500 }}>{t('moduleTag')}</div>
            </div>
          </header>

          <div
            role="note"
            style={{
              marginTop: 16,
              padding: '16px 20px',
              borderRadius: 10,
              background: COLORS.surface,
              border: `1px solid ${COLORS.borderHi}`,
              fontSize: '1.02em',
              color: COLORS.text,
              lineHeight: 1.55,
              maxWidth: '100%',
            }}
          >
            {t('audienceBanner')}
          </div>

          <section style={{ marginTop: 22, marginBottom: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div style={{ fontSize: '0.98em', color: COLORS.text, lineHeight: 1.45, maxWidth: 520, fontWeight: 500 }}>
                {t('compareHint')}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={running}
                  style={{
                    minHeight: 48,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: COLORS.surface,
                    border: `1.5px solid ${COLORS.mintDim}`,
                    color: COLORS.text,
                    fontFamily: 'inherit',
                    fontSize: '1em',
                    fontWeight: 600,
                  }}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
                <select
                  value={scenarioKey}
                  onChange={(e) => setScenarioKey(e.target.value)}
                  disabled={running}
                  style={{
                    minHeight: 48,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                    fontFamily: 'inherit',
                    fontSize: '1em',
                  }}
                >
                  {(DEPARTMENTS.find((d) => d.id === department)?.scenarioKeys ?? scenarioKeys).map((k) => (
                    <option key={k} value={k}>
                      {SCENARIOS[k].label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setLang((l) => (l === 'en' ? 'bn' : 'en'))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minHeight: 48,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: COLORS.surfaceHi,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.text,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.95em',
                  }}
                >
                  <Languages size={14} /> {lang === 'en' ? 'বাংলা' : 'English'}
                </button>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    minHeight: 48,
                    fontSize: '0.95em',
                    color: COLORS.text,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={stepMode}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                    onChange={(e) => {
                      setStepMode(e.target.checked);
                      reset();
                    }}
                  />
                  {t('stepMode')}
                </label>
                <button
                  type="button"
                  onClick={stepMode ? (stepCursor === 0 ? runDemo : runStepForward) : runDemo}
                  disabled={running}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    minHeight: 50,
                    padding: '12px 22px',
                    borderRadius: 10,
                    background: running ? COLORS.surfaceHi : COLORS.mint,
                    color: running ? COLORS.textMute : COLORS.onAccent,
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '1.05em',
                    cursor: running ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {running ? (
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : stepMode ? (
                    stepCursor === 0 ? <Play size={15} fill={COLORS.onAccent} /> : <SkipForward size={15} />
                  ) : (
                    <Play size={15} fill={COLORS.onAccent} />
                  )}
                  {running
                    ? t('running')
                    : stepMode
                      ? (stepCursor === 0 ? 'Start Freya' : t('nextStep'))
                      : completed ? t('runAgain') : t('runDemo')
                  }
                </button>
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    minHeight: 50,
                    padding: '12px 18px',
                    borderRadius: 10,
                    background: 'transparent',
                    color: COLORS.text,
                    border: `1px solid ${COLORS.border}`,
                    fontSize: '1em',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <RotateCcw size={14} /> {t('reset')}
                </button>
              </div>
            </div>

            {/* Prompt input panel */}
            <div
              style={{
                borderRadius: 10,
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                overflow: 'hidden',
              }}
            >
              {/* Selector row */}
              <div
                style={{
                  padding: '10px 16px',
                  borderBottom: `1px solid ${COLORS.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: COLORS.surfaceHi,
                }}
              >
                <span style={{ fontSize: '0.86em', fontWeight: 600, color: COLORS.textDim, flexShrink: 0 }}>
                  {t('userPromptLabel')}:
                </span>
                <select
                  value={scenarioKey}
                  onChange={(e) => { setScenarioKey(e.target.value); }}
                  disabled={running}
                  style={{
                    flex: 1,
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.surface,
                    color: COLORS.text,
                    fontFamily: 'inherit',
                    fontSize: '0.9em',
                    fontWeight: 500,
                    cursor: running ? 'not-allowed' : 'pointer',
                  }}
                >
                  {Object.values(SCENARIOS).map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Prompt text */}
              <div style={{ padding: '14px 18px', lineHeight: 1.65, color: COLORS.text, fontSize: '1.02em', minHeight: 72 }}>
                {activeScenario.demoPrompt}
              </div>

              {/* Attached files */}
              {attachedFiles.length > 0 && (
                <div style={{ padding: '0 18px 10px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {attachedFiles.map((f) => (
                    <span
                      key={f.name}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 10px',
                        borderRadius: 20,
                        background: COLORS.surfaceHi,
                        border: `1px solid ${COLORS.borderHi}`,
                        fontSize: '0.82em',
                        color: COLORS.textDim,
                        fontWeight: 500,
                      }}
                    >
                      <FileText size={11} color={COLORS.mint} />
                      {f.name}
                      <span style={{ fontSize: '0.78em', color: COLORS.textMute }}>· {f.size}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFiles((prev) => prev.filter((x) => x.name !== f.name))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 2px', display: 'flex', alignItems: 'center', color: COLORS.textMute }}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Bottom toolbar */}
              <div
                style={{
                  padding: '10px 16px',
                  borderTop: `1px solid ${COLORS.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: COLORS.surfaceHi,
                }}
              >
                <button
                  type="button"
                  onClick={handleAttachFile}
                  disabled={running || attachedFiles.length >= SIMULATED_FILES.length}
                  title="Attach a simulated file"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px',
                    borderRadius: 8,
                    background: 'transparent',
                    border: `1px solid ${COLORS.border}`,
                    color: (running || attachedFiles.length >= SIMULATED_FILES.length) ? COLORS.textMute : COLORS.textDim,
                    cursor: (running || attachedFiles.length >= SIMULATED_FILES.length) ? 'not-allowed' : 'pointer',
                    fontSize: '0.88em',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                  }}
                >
                  <Paperclip size={13} />
                  Attach file
                </button              >
                <button
                  type="button"
                  onClick={stepMode ? (stepCursor === 0 ? runDemo : runStepForward) : runDemo}
                  disabled={running}
                  title={
                    running
                      ? t('running')
                      : stepMode && stepCursor > 0
                        ? t('nextStep')
                        : completed
                          ? t('runAgain')
                          : t('runDemo')
                  }
                  aria-label={
                    running
                      ? t('running')
                      : stepMode && stepCursor > 0
                        ? t('nextStep')
                        : completed
                          ? t('runAgain')
                          : t('runDemo')
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0,
                    width: 100,
                    minHeight: 38,
                    padding: 9,
                    borderRadius: 8,
                    background: running ? COLORS.surfaceHi : COLORS.mint,
                    color: running ? COLORS.textMute : COLORS.onAccent,
                    border: running ? `1px solid ${COLORS.border}` : 'none',
                    fontWeight: 700,
                    fontSize: '1em',
                    cursor: running ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {running ? (
                    <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Send size={15} />
                  )}
                </button>
              </div>
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, minHeight: 600 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 12,
                overflow: 'hidden',
                border: `1px solid ${COLORS.slate200}`,
                boxShadow: '0 1px 3px rgba(13,44,74,0.08)',
                background: COLORS.surface,
              }}
            >
              <PanelHeader variant="chatbot" icon={Bot} title={t('chatbotTitle')} subtitle={t('chatbotSub')} t={t} />
              <ChatbotPanel
                embedded
                state={chatbotState}
                response={activeScenario.chatbotResponse}
                t={t}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 12,
                overflow: 'hidden',
                border: `1px solid ${escalation || memoGate ? COLORS.amber : COLORS.slate200}`,
                boxShadow: '0 1px 3px rgba(13,44,74,0.08)',
                background: COLORS.surface,
                transition: 'border-color 0.4s',
              }}
            >
              <PanelHeader
                variant="agentic"
                icon={Network}
                title={t('agentTitle')}
                subtitle={t('agentSub')}
                live={running || (stepMode && stepCursor > 0)}
                t={t}
              />
              <AgentPanel
                tasks={activeScenario.tasks}
                taskState={taskState}
                tasksDone={tasksDone}
                total={totalProgress}
                decompositionHint={activeScenario.decompositionHint}
                activeAgents={activeAgents}
                tools={tools}
                reasoning={reasoning}
                reasoningEndRef={reasoningEndRef}
                agentRuns={agentRuns}
                escalation={escalation}
                memoGate={memoGate}
                onApprove={approveEscalation}
                onMemoApprove={approveMemoGate}
                scenario={activeScenario}
                isComplete={showArtifact}
                workflowDone={completed || showArtifact}
                stepMode={stepMode}
                onNextStep={runStepForward}
                onNextAgent={runNextAgent}
                nextAgentLabel={nextAgentLabel}
                isRunning={running}
                finishedAgents={finishedAgents}
                misPhase={misPhase}
                misSteps={misSteps}
                department={DEPARTMENTS.find((d) => d.id === department)}
                embedded
                t={t}
              />
            </div>
          </div>

          {completed && (
            <div
              className="anim-fade-up"
              style={{
                marginTop: 22,
                padding: 20,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceHi})`,
                border: `1px solid ${COLORS.borderHi}`,
              }}
            >
              <div
                style={{
                  fontSize: '0.8em',
                  color: COLORS.mint,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                  fontWeight: 600,
                }}
              >
                {t('verdictTitle')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
                <VerdictBlock
                  title={t('chatbotTitle')}
                  rows={[
                    [t('toolCalls'), '0'],
                    ['Real data accessed', '0'],
                    ['Decisions made', '0'],
                    ['Human gates', '0'],
                    ['Deliverable', 'Generic template suggestion'],
                  ]}
                  tone="dim"
                />
                <VerdictBlock
                  title={t('agentTitle')}
                  rows={[
                    ['Specialists activated', `${activeAgents.length} of ${new Set(activeScenario.script.filter(s=>s.type==='agent').map(s=>s.id)).size}`],
                    ['Sub-tasks', `${totalProgress} · workflow complete`],
                    [t('toolCalls'), `${tools.length}`],
                    ['Human approval gates', '2 · escalation + external release'],
                    ['Deliverable', activeScenario.verdictDeliverable],
                  ]}
                  tone="mint"
                />
              </div>
            </div>
          )}

          {showArtifact && <MemoArtifact variant={activeScenario.memoVariant} />}

          <div
            role="note"
            style={{
              marginTop: 28,
              padding: '12px 18px',
              borderRadius: 8,
              background: 'rgba(245, 192, 74, 0.08)',
              border: '1px solid rgba(245, 192, 74, 0.35)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: '0.82em',
              color: COLORS.textDim,
              lineHeight: 1.55,
            }}
          >
            <span style={{ fontSize: '1.1em', flexShrink: 0 }}>⚠</span>
            <span>
              <strong style={{ color: COLORS.text }}>Disclaimer:</strong> All data, names, figures, and scenarios shown
              in this demo are entirely fictional and for demonstration purposes only. They do not represent real
              individuals, organisations, or financial information.
            </span>
          </div>

        </div>

        <footer
          style={{
            marginTop: 36,
            paddingTop: 18,
            borderTop: `1px solid ${COLORS.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8em',
            color: COLORS.textMute,
            letterSpacing: 0.8,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>{t('footnote')}</div>
          <div className="font-mono">{t('buildId')}</div>
        </footer>

        {presenterOpen && (
          <div
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 50,
              padding: '12px 20px 16px',
              background: 'linear-gradient(180deg, transparent, rgba(242, 247, 244, 0.97) 20%)',
              borderTop: `1px solid ${COLORS.border}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ maxWidth: 1520, margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.mint }}>
                <Presentation size={18} />
                <span className="font-display" style={{ fontWeight: 700, fontSize: '0.95em' }}>
                  {t('presenterBar')}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: '0.88em', color: COLORS.textMute, marginBottom: 6, lineHeight: 1.45 }}>
                  {pausedVisual ? <span style={{ color: COLORS.amber }}>{t('paused')} · </span> : null}
                  {t('presenterTip')}
                  {stepMode ? ` · Step ${stepCursor}/${scriptLen}` : null}
                </div>
                <div className="font-mono" style={{ fontSize: '0.72em', color: COLORS.textMute, opacity: 0.85 }}>
                  {t('keyboardHints')}
                </div>
                <div style={{ fontSize: '0.95em', color: COLORS.textDim, lineHeight: 1.55, marginTop: 6 }}>
                  {currentPresenterNote || t('notesPlaceholder')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPresenterOpen(false)}
                style={{
                  minHeight: 44,
                  padding: '8px 14px',
                  fontSize: '0.88em',
                  fontWeight: 600,
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {t('hidePresenterBar')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/** Comparison column headers — Deep Ocean: slate (chatbot) vs blue (agentic), palette demo cards */
function PanelHeader({ icon: Icon, title, subtitle, variant, live, t }) {
  const isChatbot = variant === 'chatbot';
  const headerBg = isChatbot ? COLORS.slate800 : COLORS.mint;
  const headerBorder = isChatbot ? COLORS.slate700 : '#1560a0';
  const subtitleColor = isChatbot ? COLORS.slate300 : COLORS.bluePale;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        background: headerBg,
        borderBottom: `1px solid ${headerBorder}`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: COLORS.blue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={17} color="#ffffff" strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-display" style={{ fontSize: '0.95em', fontWeight: 600, color: '#ffffff', lineHeight: 1.25 }}>
          {title}
        </div>
        <div style={{ fontSize: '0.72em', color: subtitleColor, marginTop: 4, lineHeight: 1.5 }}>{subtitle}</div>
      </div>
      {live && !isChatbot && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div
            className="live-dot"
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: COLORS.tealLight,
              boxShadow: '0 0 0 3px rgba(77,184,158,0.25)',
            }}
          />
          <span style={{ fontSize: '0.78em', color: COLORS.tealLight, fontWeight: 500 }}>{t('panelActive')}</span>
        </div>
      )}
    </div>
  );
}

function ChatbotPanel({ state, response, t, embedded }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: embedded ? 'none' : `1px solid ${COLORS.border}`,
        borderRadius: embedded ? 0 : 10,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        flex: embedded ? 1 : undefined,
        minHeight: embedded ? 0 : undefined,
      }}
    >
      <div
        style={{
          fontSize: '0.8em',
          color: COLORS.textMute,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        {t('output')}
      </div>

      {state === 'idle' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.textMute,
            textAlign: 'center',
            padding: 20,
          }}
        >
          <Bot size={34} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div>{t('awaiting')}</div>
        </div>
      )}

      {state === 'thinking' && (
        <div
          className="anim-fade-up"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 14,
            background: COLORS.surfaceHi,
            borderRadius: 8,
          }}
        >
          <div className="thinking-dots">
            <span />
            <span />
            <span />
          </div>
          <span style={{ color: COLORS.textDim }}>{t('thinking')}</span>
        </div>
      )}

      {state === 'done' && (
        <div className="anim-fade-up" style={{ lineHeight: 1.65, color: COLORS.text, whiteSpace: 'pre-line' }}>
          {response}
        </div>
      )}

      {state === 'done' && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px dashed ${COLORS.border}`,
            fontSize: '0.85em',
            color: COLORS.textMute,
            fontStyle: 'italic',
          }}
        >
          {t('chatbotWarn')}
        </div>
      )}
    </div>
  );
}

function AgentRunCard({ run, isDone, t }) {
  const agentById = useMemo(() => Object.fromEntries(AGENTS.map((a) => [a.id, a])), []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const meta = agentById[run.agentId];
  const Icon = meta?.icon ?? Brain;
  const reportTitle = run.outputData?.reportTitle;
  const canOpen = isDone && (run.outputData || run.output);

  const card = (
    <div
      className="anim-fade-up"
      role={canOpen ? 'button' : undefined}
      tabIndex={canOpen ? 0 : undefined}
      onClick={canOpen ? () => setDrawerOpen(true) : undefined}
      onKeyDown={canOpen ? (e) => { if (e.key === 'Enter' || e.key === ' ') setDrawerOpen(true); } : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 10,
        border: `1.5px solid ${isDone ? (hovered ? COLORS.mintDim : COLORS.mint) : COLORS.amber}`,
        background: isDone && hovered ? '#F7FCF9' : COLORS.surface,
        overflow: 'hidden',
        flexShrink: 0,
        cursor: canOpen ? 'pointer' : 'default',
        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
        boxShadow: isDone && hovered ? `0 4px 18px rgba(22,148,84,0.13)` : 'none',
      }}
    >
      {/* Top row: icon + agent info + status badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          background: isDone ? '#F0FAF4' : '#FFFBEB',
          borderBottom: `1px solid ${isDone ? COLORS.border : '#FDE68A'}`,
        }}
      >
        <div
          style={{
            width: 38, height: 38, borderRadius: 8,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={19} color={isDone ? COLORS.mint : COLORS.amber} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.78em', color: COLORS.textMute, fontWeight: 600 }}>
            Specialist {String(meta?.n ?? '?').padStart(2, '0')}
          </div>
          <div className="font-display" style={{ fontSize: '1em', fontWeight: 700, color: COLORS.text }}>
            {meta?.name ?? run.agentId}
          </div>
          {meta?.role && (
            <div style={{ fontSize: '0.83em', color: COLORS.textDim, lineHeight: 1.4 }}>{meta.role}</div>
          )}
        </div>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20,
            background: isDone ? COLORS.mint : COLORS.amber,
            color: '#fff', fontSize: '0.78em', fontWeight: 700, flexShrink: 0,
          }}
        >
          {isDone ? <CheckCircle2 size={13} /> : <Loader2 size={13} className="spin" />}
          {isDone ? t('stepDone') : t('stepActive')}
        </div>
      </div>

      {/* Bottom row: "WHAT THIS SPECIALIST PRODUCED" — always visible */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px',
          borderTop: `2px solid ${isDone ? COLORS.mintDim : COLORS.amber}`,
          background: isDone ? COLORS.surfaceHi : '#FEF3C7',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.7em', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: 1.2, marginBottom: 5,
              color: isDone ? COLORS.mint : COLORS.amber,
            }}
          >
            {t('agentStructuredOutput')}
          </div>
          {isDone ? (
            <div style={{ fontSize: '0.95em', fontWeight: 700, color: COLORS.text, lineHeight: 1.3 }}>
              {reportTitle ?? run.output ?? '—'}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.amber, fontSize: '0.9em', fontStyle: 'italic' }}>
              <Loader2 size={13} className="spin" />
              Generating output…
            </div>
          )}
        </div>

        {canOpen && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              background: hovered ? COLORS.mint : COLORS.surface,
              color: hovered ? '#fff' : COLORS.mint,
              border: `1.5px solid ${COLORS.mint}`,
              fontSize: '0.85em', fontWeight: 700,
              flexShrink: 0, whiteSpace: 'nowrap',
              transition: 'background 0.15s, color 0.15s',
              pointerEvents: 'none',
            }}
          >
            <Eye size={13} />
            Show Output
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {card}
      {drawerOpen && (
        <OutputDrawer
          outputData={run.outputData}
          agentId={run.agentId}
          agentName={meta?.name ?? run.agentId}
          agentRole={meta?.role}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );

}

function AgentGlassBoxLog({ agentRuns, activeAgents, isComplete, finishedAgents = [], t }) {
  const currentAgentId = activeAgents[activeAgents.length - 1];
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [agentRuns.length]);

  if (agentRuns.length === 0) {
    return (
      <div
        style={{
          marginTop: 14,
          padding: '18px 20px',
          borderRadius: 10,
          border: `1px dashed ${COLORS.border}`,
          background: COLORS.surfaceHi,
          color: COLORS.textDim,
          fontSize: '1em',
          lineHeight: 1.55,
        }}
      >
        {t('noAgentGlassYet')}
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 14,
        padding: '18px 20px',
        borderRadius: 10,
        border: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <ScrollText size={20} color={COLORS.mint} />
        <div>
          <div style={{ fontSize: '1.05em', color: COLORS.mint, fontWeight: 700 }}>
            {t('glassBoxPerAgent')}
          </div>
          <div style={{ fontSize: '0.92em', color: COLORS.textDim, marginTop: 4, lineHeight: 1.45 }}>{t('glassBoxSub')}</div>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="scrollbar-thin"
        style={{ maxHeight: 640, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {agentRuns.map((run) => (
          <AgentRunCard
            key={run.id}
            run={run}
            isDone={isComplete || finishedAgents.includes(run.agentId) || run.agentId !== currentAgentId}
            t={t}
          />
        ))}
        <div ref={bottomRef} style={{ height: 1 }} />
      </div>
    </div>
  );
}

function MisConnectionOverlay({ phase, steps, department, scenario }) {
  const isReady = phase === 'ready';
  return (
    <div
      className="anim-fade-up"
      style={{
        marginBottom: 14,
        borderRadius: 12,
        border: `1.5px solid ${isReady ? COLORS.mint : COLORS.borderHi}`,
        background: isReady
          ? `linear-gradient(135deg, #e8f4fb, #eef5fb)`
          : `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceHi})`,
        overflow: 'hidden',
        transition: 'border-color 0.4s, background 0.4s',
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 18px',
          background: isReady ? `${COLORS.mint}18` : COLORS.surfaceHi,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
            background: isReady ? COLORS.mint : COLORS.surfaceHi,
            border: `1px solid ${isReady ? COLORS.mint : COLORS.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {isReady
            ? <CheckCircle2 size={17} color="#fff" />
            : <Loader2 size={17} color={COLORS.mint} style={{ animation: 'spin 1.2s linear infinite' }} />
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.72em', color: COLORS.textMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
            {isReady ? 'Connection established' : 'Initialising data connection'}
          </div>
          <div style={{ fontSize: '0.95em', fontWeight: 700, color: COLORS.text, marginTop: 2 }}>
            {department?.dataSource ?? 'PKSF MIS Core'}
          </div>
        </div>
        <div
          style={{
            fontSize: '0.78em', fontWeight: 600, padding: '4px 10px', borderRadius: 20,
            background: isReady ? COLORS.mint : `${COLORS.amber}22`,
            color: isReady ? '#fff' : COLORS.amber,
          }}
        >
          {isReady ? 'Ready' : 'Connecting…'}
        </div>
      </div>

      <div
        style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        {[
          ['User Role', department?.userRole ?? '—'],
          ['Region', scenario?.region ?? '—'],
          ['Period', scenario?.period ?? 'Q1 2026'],
        ].map(([label, value], i) => (
          <div
            key={i}
            style={{
              padding: '8px 14px',
              borderRight: i < 2 ? `1px solid ${COLORS.border}` : 'none',
            }}
          >
            <div style={{ fontSize: '0.62em', color: COLORS.textMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
              {label}
            </div>
            <div style={{ fontSize: '0.85em', color: COLORS.text, fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 18px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {steps.map((step, i) => (
          <div
            key={i}
            className="anim-fade-up"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85em', color: COLORS.textDim }}
          >
            <CheckCircle2 size={13} color={COLORS.mint} style={{ flexShrink: 0 }} />
            <span>{step}</span>
          </div>
        ))}
        {!isReady && steps.length < (department?.misSteps?.length ?? 5) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85em', color: COLORS.textMute, opacity: 0.6 }}>
            <Loader2 size={12} color={COLORS.textMute} style={{ animation: 'spin 1.2s linear infinite', flexShrink: 0 }} />
            <span>Establishing secure session…</span>
          </div>
        )}
      </div>
    </div>
  );
}

const AGENT_SPOTLIGHT_ACTIONS = {
  a1: [
    'Parsing programme manager request…',
    'Routing sub-tasks to specialist agents…',
    'Coordinating parallel workflow execution…',
    'Synthesising findings from all specialists…',
    'Validating agent outputs against criteria…',
  ],
  a2: [
    'Accessing monitoring & evaluation database…',
    'Aggregating quarterly KPI indicators…',
    'Comparing POs against regional benchmark…',
    'Calculating M&E composite scores…',
    'Structuring performance report sections…',
  ],
  a3: [
    'Querying partner organisation metrics…',
    'Calculating repayment rate deviations…',
    'Flagging underperforming POs…',
    'Cross-checking against historical trends…',
    'Computing deviation from regional baseline…',
  ],
  a4: [
    'Accessing field officer visit reports…',
    'Synthesising ground-level observations…',
    'Correlating environmental disruption factors…',
    'Mapping geographic data points…',
    'Reconciling field data with MIS records…',
  ],
  a5: [
    'Querying beneficiary income records…',
    'Calculating household-level impact scores…',
    'Tracking active borrower programme reach…',
    'Analysing repayment capacity trends…',
    'Aggregating livelihood outcome indicators…',
  ],
  a6: [
    'Scanning portfolio health indicators…',
    'Calculating PAR-30 exposure ratios…',
    'Identifying regional concentration risks…',
    'Running portfolio stress-test scenarios…',
    'Flagging overdue tranche windows…',
  ],
  a7: [
    'Structuring memo sections from agent outputs…',
    'Pulling data citations from specialist findings…',
    'Drafting executive narrative summary…',
    'Applying PKSF document formatting standards…',
    'Inserting human-approval gate references…',
  ],
  a8: [
    'Scanning disbursement ledger entries…',
    'Applying tranche compliance rule engine…',
    'Calculating anomaly severity scores…',
    'Flagging timing violations for review…',
    'Cross-referencing approved tranche calendar…',
  ],
  a9: [
    'Loading historical programme performance data…',
    'Running Q2 scenario projection models…',
    'Calculating portfolio recovery trajectories…',
    'Estimating repayment normalisation timelines…',
    'Generating forward outlook estimates…',
  ],
};

function ActiveAgentSpotlight({ activeAgents, tools, reasoning, isComplete, t }) {
  const agentById = useMemo(() => Object.fromEntries(AGENTS.map((a) => [a.id, a])), []);
  const currentId = activeAgents[activeAgents.length - 1];
  const currentAgent = agentById[currentId];

  const [actionIdx, setActionIdx] = useState(0);
  const [actionKey, setActionKey] = useState(0);

  useEffect(() => {
    setActionIdx(0);
    setActionKey((k) => k + 1);
  }, [currentId]);

  useEffect(() => {
    const actions = AGENT_SPOTLIGHT_ACTIONS[currentId];
    if (!actions || actions.length <= 1) return;
    const timer = setInterval(() => {
      setActionIdx((prev) => (prev + 1) % actions.length);
      setActionKey((k) => k + 1);
    }, 3200);
    return () => clearInterval(timer);
  }, [currentId]);

  if (!currentAgent) {
    return (
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 10,
          border: `1px dashed ${COLORS.border}`,
          background: COLORS.surfaceHi,
          color: COLORS.textMute,
          fontSize: '1em',
          lineHeight: 1.55,
          textAlign: 'center',
          marginBottom: 14,
        }}
      >
        {t('waitingToStart')}
      </div>
    );
  }

  const Icon = currentAgent.icon;
  const agentActions = AGENT_SPOTLIGHT_ACTIONS[currentId] ?? [];
  const currentAction = agentActions[actionIdx] ?? null;

  return (
    <div
      key={currentId}
      className="anim-fade-scale"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '18px 22px',
        borderRadius: 12,
        border: `2px solid ${COLORS.mintDim}`,
        background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceHi})`,
        boxShadow: `0 0 28px ${COLORS.mint}28`,
        marginBottom: 14,
      }}
    >
      <div
        className="pulse-mint"
        style={{
          width: 58,
          height: 58,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${COLORS.mint}, ${COLORS.teal})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={28} color={COLORS.onAccent} strokeWidth={2} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.82em', color: COLORS.mint, fontWeight: 700, marginBottom: 3 }}>
          {t('nowWorking')} · Specialist {String(currentAgent.n).padStart(2, '0')}
        </div>
        <div className="font-display" style={{ fontSize: '1.25em', fontWeight: 700, color: COLORS.text, lineHeight: 1.2 }}>
          {currentAgent.name}
        </div>
        <div style={{ fontSize: '0.92em', color: COLORS.textDim, marginTop: 3 }}>{currentAgent.role}</div>
        {currentAction && !isComplete && (
          <div
            key={actionKey}
            className="anim-fade-up"
            style={{
              marginTop: 10,
              padding: '8px 14px',
              borderRadius: 8,
              background: COLORS.surfaceHi,
              border: `1px solid ${COLORS.border}`,
              fontSize: '0.92em',
              color: COLORS.text,
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <Loader2 size={13} color={COLORS.mint} style={{ flexShrink: 0, marginTop: 3, animation: 'spin 1.2s linear infinite' }} />
            <span>{currentAction}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        {isComplete
          ? <CheckCircle2 size={18} color={COLORS.teal} />
          : <div className="live-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.mint }} />
        }
        <span style={{ fontSize: '0.88em', color: isComplete ? COLORS.teal : COLORS.mint, fontWeight: 700 }}>
          {isComplete ? t('stepDone') : t('panelActive')}
        </span>
      </div>
    </div>
  );
}

function TaskStepper({ tasks, taskState, decompositionHint, t }) {
  return (
    <div
      style={{
        padding: '16px 18px',
        background: COLORS.surfaceHi,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GitBranch size={16} color={COLORS.mint} />
          <span style={{ fontSize: '0.95em', color: COLORS.mint, fontWeight: 700 }}>{t('taskDecomposition')}</span>
        </div>
        <span style={{ fontSize: '0.88em', color: COLORS.textDim }}>{t('onePrompt')} {decompositionHint}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {tasks.map((task, idx) => {
          const state = taskState[task.id];
          const done = state === 'done';
          const active = state === 'active';
          const isLast = idx === tasks.length - 1;

          return (
            <div key={task.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                <div
                  className={active ? 'anim-fade-scale' : ''}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: done ? COLORS.mint : active ? COLORS.amber : COLORS.surface,
                    border: `2px solid ${done ? COLORS.mint : active ? COLORS.amber : COLORS.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.4s',
                  }}
                >
                  {done ? (
                    <CheckCircle2 size={14} color={COLORS.onAccent} strokeWidth={3} />
                  ) : active ? (
                    <div className="pulse-mint" style={{ width: 9, height: 9, borderRadius: '50%', background: COLORS.onAccent }} />
                  ) : (
                    <span style={{ fontSize: '0.72em', color: COLORS.textMute, fontWeight: 700 }}>{idx + 1}</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 18,
                      background: done ? COLORS.mintDim : COLORS.border,
                      margin: '3px 0',
                      transition: 'background 0.5s',
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  paddingBottom: isLast ? 0 : 12,
                  paddingTop: 4,
                  fontSize: '0.95em',
                  color: done ? COLORS.mint : active ? COLORS.text : COLORS.textMute,
                  fontWeight: done || active ? 600 : 400,
                  lineHeight: 1.4,
                  opacity: state === undefined ? 0.5 : 1,
                  transition: 'all 0.35s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <span>{task.label}</span>
                {done && (
                  <span style={{ fontSize: '0.8em', color: COLORS.mintDim, fontWeight: 500, background: `${COLORS.mint}18`, padding: '2px 8px', borderRadius: 20 }}>
                    ✓ {t('stepDone')}
                  </span>
                )}
                {active && (
                  <span style={{ fontSize: '0.8em', color: COLORS.amber, fontWeight: 600, background: `${COLORS.amber}18`, padding: '2px 8px', borderRadius: 20 }}>
                    ↻ {t('stepActive')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentPipeline({ activeAgents, scenarioAgentIds = [], t }) {
  const agentById = useMemo(() => Object.fromEntries(AGENTS.map((a) => [a.id, a])), []);
  const activatedInOrder = activeAgents.map((id) => agentById[id]).filter(Boolean);
  // Only show standby agents that are actually used in this scenario
  const notActivated = scenarioAgentIds
    .filter((id) => !activeAgents.includes(id))
    .map((id) => agentById[id])
    .filter(Boolean);
  const currentId = activeAgents[activeAgents.length - 1];
  const total = scenarioAgentIds.length || AGENTS.length;

  return (
    <div style={{ padding: '14px 16px', background: COLORS.surfaceHi, border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Layers size={16} color={COLORS.teal} />
        <span style={{ fontSize: '0.95em', color: COLORS.teal, fontWeight: 700 }}>{t('agentActivations')}</span>
        <span style={{ fontSize: '0.82em', color: COLORS.textDim, marginLeft: 'auto' }}>{activeAgents.length}/{total}</span>
      </div>

      {activatedInOrder.length === 0 ? (
        <div style={{ fontSize: '0.9em', color: COLORS.textMute, fontStyle: 'italic', padding: 6 }}>{t('waitingToStart')}</div>
      ) : (
        <div className="scrollbar-thin" style={{ overflowX: 'auto', paddingBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 'max-content', paddingBottom: 2 }}>
            {activatedInOrder.map((agent, i) => {
              const Icon = agent.icon;
              const isCurrent = agent.id === currentId;
              return (
                <React.Fragment key={agent.id}>
                  <div
                    className={isCurrent ? 'anim-fade-scale' : ''}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      padding: isCurrent ? '10px 14px' : '7px 10px',
                      borderRadius: 10,
                      border: `2px solid ${isCurrent ? COLORS.mint : COLORS.mintDim}`,
                      background: isCurrent ? `${COLORS.mint}18` : `${COLORS.mintDim}12`,
                      minWidth: isCurrent ? 80 : 64,
                      transition: 'all 0.4s',
                    }}
                  >
                    <Icon size={isCurrent ? 22 : 16} color={isCurrent ? COLORS.mint : COLORS.mintDim} strokeWidth={2} />
                    <div
                      style={{
                        fontSize: '0.65em',
                        color: isCurrent ? COLORS.mint : COLORS.mintDim,
                        fontWeight: 700,
                        textAlign: 'center',
                        lineHeight: 1.2,
                        maxWidth: 72,
                      }}
                    >
                      {agent.name.split(' ')[0]}
                    </div>
                    {isCurrent ? (
                      <div className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.mint }} />
                    ) : (
                      <CheckCircle2 size={11} color={COLORS.mintDim} />
                    )}
                  </div>
                  {i < activatedInOrder.length - 1 && (
                    <ChevronRight size={16} color={COLORS.mintDim} style={{ flexShrink: 0 }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {notActivated.length > 0 && activatedInOrder.length > 0 && (
        <div style={{ borderTop: `1px dashed ${COLORS.border}`, paddingTop: 10, marginTop: 10 }}>
          <div style={{ fontSize: '0.8em', color: COLORS.textMute, marginBottom: 6, fontWeight: 600 }}>{t('agentWaiting')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {notActivated.map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 9px',
                    borderRadius: 20,
                    border: `1px dashed ${COLORS.border}`,
                    opacity: 0.45,
                    fontSize: '0.75em',
                    color: COLORS.textMute,
                  }}
                >
                  <Icon size={11} color={COLORS.textMute} />
                  {agent.name.split(' ')[0]}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AgentPanel({
  tasks,
  taskState,
  tasksDone,
  total,
  decompositionHint,
  activeAgents,
  tools,
  reasoning,
  reasoningEndRef,
  agentRuns,
  escalation,
  memoGate,
  onApprove,
  onMemoApprove,
  scenario,
  isComplete,
  stepMode,
  onNextStep,
  onNextAgent,
  nextAgentLabel,
  isRunning,
  finishedAgents,
  misPhase,
  misSteps,
  department,
  t,
  embedded,
  workflowDone,
}) {
  const [openSource, setOpenSource] = useState(null);
  const [showFinalReport, setShowFinalReport] = useState(false);
  const humanGateRef = useRef(null);

  // Derive which agents this scenario actually uses (ordered by first appearance)
  const scenarioAgentIds = useMemo(() => {
    const seen = new Set();
    const ordered = [];
    for (const step of scenario.script ?? []) {
      if (step.type === 'agent' && !seen.has(step.id)) {
        seen.add(step.id);
        ordered.push(step.id);
      }
    }
    return ordered;
  }, [scenario]);

  useEffect(() => {
    if (!workflowDone) setShowFinalReport(false);
  }, [workflowDone]);

  useEffect(() => {
    if (reasoning.length === 0) setOpenSource(null);
  }, [reasoning.length]);

  useEffect(() => {
    if (!openSource) return;
    const id = requestAnimationFrame(() => {
      document.querySelector(`[data-pksf-source="${openSource}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return () => cancelAnimationFrame(id);
  }, [openSource]);

  useEffect(() => {
    if ((escalation || memoGate) && humanGateRef.current) {
      const id = requestAnimationFrame(() => {
        humanGateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [escalation, memoGate]);

  const viewLedgerSourceId = scenario.escalation?.viewLedgerSourceId;

  return (
    <div
      style={{
        background: COLORS.surface,
        border: embedded ? 'none' : `1px solid ${escalation || memoGate ? COLORS.amber : COLORS.borderHi}`,
        borderRadius: embedded ? 0 : 10,
        padding: 16,
        position: 'relative',
        transition: 'border-color 0.4s',
        overflow: 'clip',
        flex: embedded ? 1 : undefined,
        minHeight: embedded ? 0 : undefined,
      }}
      className="grid-bg"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.95em', color: COLORS.textDim, fontWeight: 600 }}>{t('workflowProgress')}</div>
          <div style={{ color: COLORS.text, fontSize: '0.98em', fontWeight: 600 }}>
            {tasksDone}/{total}{' '}
            <span style={{ fontWeight: 500, color: COLORS.textDim }}>{t('tasksSmall')}</span>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            maxWidth: 360,
            marginLeft: 16,
            height: 5,
            background: COLORS.surfaceHi,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${total ? (tasksDone / total) * 100 : 0}%`,
              background: `linear-gradient(90deg, ${COLORS.mint}, ${COLORS.teal})`,
              transition: 'width 0.5s ease-out',
            }}
          />
        </div>
      </div>

      {misPhase !== 'idle' && (
        <MisConnectionOverlay phase={misPhase} steps={misSteps} department={department} scenario={scenario} />
      )}

      <ActiveAgentSpotlight activeAgents={activeAgents} tools={tools} reasoning={reasoning} isComplete={isComplete} t={t} />

      {workflowDone && !isRunning && (
        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setShowFinalReport(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 20px',
              background: COLORS.mintDim,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.9em',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(13,44,74,0.2)',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            <FileText size={16} />
            {t('showFinalOutput')}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TaskStepper tasks={tasks} taskState={taskState} decompositionHint={decompositionHint} t={t} />
          <ToolStream tools={tools} t={t} />
        </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AgentPipeline activeAgents={activeAgents} scenarioAgentIds={scenarioAgentIds} t={t} />
            <ReasoningStream
              reasoning={reasoning}
              endRef={reasoningEndRef}
              t={t}
              openSource={openSource}
              setOpenSource={setOpenSource}
            />
            {stepMode && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {/* Next Step — only while not complete */}
                {!isComplete && (
                  <button
                    onClick={onNextStep}
                    disabled={isRunning}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      background: isRunning ? COLORS.surfaceHi : COLORS.surface,
                      color: isRunning ? COLORS.textMute : COLORS.mint,
                      border: `1.5px solid ${isRunning ? COLORS.border : COLORS.mint}`,
                      borderRadius: 8,
                      fontSize: '0.88em',
                      fontWeight: 700,
                      cursor: isRunning ? 'not-allowed' : 'pointer',
                      opacity: isRunning ? 0.6 : 1,
                      transition: 'background 0.15s, color 0.15s',
                      fontFamily: 'inherit',
                    }}
                  >
                    <ChevronRight size={14} />
                    {t('nextStep')}
                  </button>
                )}

                {/* Start [Agent] while agents remain; Show Final Report when all done */}
                {!isComplete && nextAgentLabel && (
                  <button
                    onClick={onNextAgent}
                    disabled={isRunning}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '10px 18px',
                      background: isRunning ? COLORS.surfaceHi : COLORS.teal,
                      color: isRunning ? COLORS.textMute : '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: '0.88em',
                      fontWeight: 700,
                      cursor: isRunning ? 'not-allowed' : 'pointer',
                      opacity: isRunning ? 0.6 : 1,
                      boxShadow: isRunning ? 'none' : '0 2px 10px rgba(13,148,136,0.3)',
                      transition: 'background 0.15s, box-shadow 0.15s',
                      fontFamily: 'inherit',
                      maxWidth: 260,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {isRunning ? <Loader2 size={14} className="spin" /> : <Zap size={14} />}
                    {isRunning ? 'Running…' : `Start ${nextAgentLabel}`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      <AgentGlassBoxLog agentRuns={agentRuns} activeAgents={activeAgents} isComplete={isComplete} finishedAgents={finishedAgents} t={t} />

      <div ref={humanGateRef} />

      {showFinalReport && (
        <FinalReportDrawer
          variant={scenario.memoVariant}
          onClose={() => setShowFinalReport(false)}
          t={t}
        />
      )}

      {escalation && (
        <EscalationOverlay
          onApprove={onApprove}
          scenario={scenario}
          t={t}
          onViewLedger={() => {
            if (viewLedgerSourceId) setOpenSource(viewLedgerSourceId);
          }}
          canViewLedger={Boolean(viewLedgerSourceId)}
        />
      )}
      {memoGate && <MemoGateOverlay onApprove={onMemoApprove} scenario={scenario} t={t} />}
    </div>
  );
}

function DecompositionTree({ tasks, taskState, decompositionHint, t }) {
  return (
    <div
      style={{
        padding: 14,
        background: COLORS.surfaceHi,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GitBranch size={13} color={COLORS.mint} />
          <span style={{ fontSize: '0.95em', color: COLORS.mint, fontWeight: 700, letterSpacing: 0.02 }}>
            {t('taskDecomposition')}
          </span>
        </div>
        <span style={{ fontSize: '0.88em', color: COLORS.textDim, lineHeight: 1.35, textAlign: 'right', maxWidth: 280 }}>
          {t('onePrompt')} {decompositionHint}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tasks.map((task, idx) => {
          const state = taskState[task.id];
          const visible = state !== undefined;
          if (!visible)
            return (
              <div
                key={task.id}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: '0.82em',
                  border: `1px dashed ${COLORS.border}`,
                  color: COLORS.textMute,
                  background: 'transparent',
                  opacity: 0.4,
                }}
              >
                {idx + 1}. {task.label}
              </div>
            );
          const done = state === 'done';
          return (
            <div
              key={task.id}
              className="anim-fade-scale"
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: '0.82em',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: `1px solid ${done ? COLORS.mintDim : COLORS.borderHi}`,
                background: done ? `${COLORS.mintDim}22` : COLORS.surface,
                color: done ? COLORS.mint : COLORS.text,
                transition: 'all 0.3s',
              }}
            >
              {done ? <CheckCircle2 size={12} color={COLORS.mint} /> : <div className="pulse-mint" style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.amber }} />}
              <span>
                {idx + 1}. {task.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentRoster({ activeAgents, scenarioAgentIds = [], t }) {
  const scenarioAgents = scenarioAgentIds.length > 0
    ? AGENTS.filter((a) => scenarioAgentIds.includes(a.id))
    : AGENTS;
  const total = scenarioAgents.length;

  return (
    <div style={{ padding: 14, background: COLORS.surfaceHi, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Layers size={13} color={COLORS.teal} />
        <span style={{ fontSize: '0.95em', color: COLORS.teal, fontWeight: 700, letterSpacing: 0.02 }}>
          {t('agentActivations')}
        </span>
        <span style={{ fontSize: '0.8em', color: COLORS.textDim, marginLeft: 'auto' }}>
          {activeAgents.length}/{total}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {scenarioAgents.map((agent) => {
          const Icon = agent.icon;
          const idx = activeAgents.indexOf(agent.id);
          const active = idx !== -1;
          const isLast = active && idx === activeAgents.length - 1;
          return (
            <div
              key={agent.id}
              style={{
                padding: 8,
                borderRadius: 6,
                border: `1px solid ${active ? COLORS.mintDim : COLORS.border}`,
                background: active ? `${COLORS.mintDim}1A` : COLORS.surface,
                opacity: active ? 1 : 0.45,
                transition: 'all 0.4s',
                position: 'relative',
              }}
              className={isLast ? 'pulse-mint' : ''}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Icon size={12} color={active ? COLORS.mint : COLORS.textMute} />
                <span className="font-mono" style={{ fontSize: '0.65em', color: COLORS.textMute }}>
                  {String(agent.n).padStart(2, '0')}
                </span>
                {active && (
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.mint, marginLeft: 'auto' }} className="live-dot" />
                )}
              </div>
              <div style={{ fontSize: '0.72em', color: active ? COLORS.text : COLORS.textMute, lineHeight: 1.25, fontWeight: 600 }}>
                {agent.name}
              </div>
              <div style={{ fontSize: '0.66em', color: COLORS.textDim, marginTop: 2 }}>{agent.role}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToolStream({ tools, t }) {
  const agentById = useMemo(() => Object.fromEntries(AGENTS.map((a) => [a.id, a])), []);
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: COLORS.surfaceHi, border: `1px solid ${COLORS.border}`, borderRadius: 10, flex: 1, overflow: 'hidden' }}>
      {/* Header — always visible, acts as toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: 14,
          background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <Zap size={15} color={COLORS.amber} />
        <span style={{ fontSize: '0.95em', color: COLORS.amber, fontWeight: 700 }}>
          {t('toolCalls')}
        </span>
        <span style={{ fontSize: '0.82em', color: COLORS.textDim, marginLeft: 'auto', marginRight: 6 }}>
          {tools.length} {t('executed')}
        </span>
        <ChevronDown
          size={15}
          color={COLORS.textMute}
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        />
      </button>

      {/* Collapsible body */}
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${COLORS.border}` }}>
          {tools.length === 0 ? (
            <div style={{ fontSize: '0.9em', color: COLORS.textMute, fontStyle: 'italic', padding: '10px 0' }}>{t('noToolsYet')}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
              {tools.slice(-6).map((x) => {
                const Icon = x.icon;
                const agent = agentById[x.agentId];
                const AgentIcon = agent?.icon;
                return (
                  <div
                    key={x.id}
                    className="anim-slide-right"
                    style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '8px 10px', borderRadius: 8, background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 6, background: `${COLORS.amber}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={13} color={COLORS.amber} />
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.75em', color: COLORS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {x.label}
                      </div>
                    </div>
                    {agent && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 34 }}>
                        {AgentIcon && <AgentIcon size={10} color={COLORS.teal} />}
                        <span style={{ fontSize: '0.72em', color: COLORS.teal, fontWeight: 600 }}>
                          {t('runBy')}: {agent.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              {tools.length > 6 && (
                <div style={{ fontSize: '0.8em', color: COLORS.textMute, paddingLeft: 6 }}>
                  +{tools.length - 6} {t('earlierCalls')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReasoningStream({ reasoning, endRef, t, openSource, setOpenSource }) {
  return (
    <div style={{ padding: 14, background: COLORS.surfaceHi, border: `1px solid ${COLORS.border}`, borderRadius: 8, display: 'flex', flexDirection: 'column', maxHeight: 380, minHeight: 280 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Brain size={13} color={COLORS.mint} />
        <span style={{ fontSize: '0.95em', color: COLORS.mint, fontWeight: 700, letterSpacing: 0.02 }}>
          {t('reasoningTitle')}
        </span>
      </div>

      <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {reasoning.length === 0 ? (
          <div style={{ fontSize: '0.82em', color: COLORS.textMute, fontStyle: 'italic', padding: 8 }}>{t('waitingReasoning')}</div>
        ) : (
          reasoning.map((r) => (
            <div key={r.id} className="anim-fade-up" style={{ padding: '6px 8px', borderRadius: 5, borderLeft: `3px solid ${COLORS.mintDim}` }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <ChevronRight size={12} color={COLORS.mint} style={{ marginTop: 3, flexShrink: 0 }} />
                <div style={{ flex: 1, lineHeight: 1.5, color: COLORS.text }}>{r.text}</div>
              </div>
              {r.sources?.length > 0 && (
                <div style={{ marginTop: 8, marginLeft: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {r.sources.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      data-pksf-source={s.id}
                      onClick={() => setOpenSource(openSource === s.id ? null : s.id)}
                      style={{
                        fontSize: '0.68em',
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: `1px solid ${COLORS.borderHi}`,
                        background: openSource === s.id ? `${COLORS.mint}22` : COLORS.surface,
                        color: COLORS.teal,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {t('sourceData')}: {s.label}
                    </button>
                  ))}
                </div>
              )}
              {r.sources?.map((s) =>
                openSource === s.id ? (
                  <div
                    key={`d-${s.id}`}
                    style={{
                      marginTop: 6,
                      marginLeft: 20,
                      padding: 8,
                      fontSize: '0.78em',
                      lineHeight: 1.45,
                      color: COLORS.textDim,
                      background: COLORS.surface,
                      borderRadius: 6,
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    {s.detail}
                  </div>
                ) : null
              )}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

const FINAL_DRAWER_SUBTITLE = {
  khulna: 'Q1 2026 Performance Review · Khulna Region',
  compliance: 'Disbursement Anomaly Report · Rajshahi',
  me_dhaka: 'M&E Indicator Review · Dhaka Division',
  field_sylhet: 'Field Operations Programme Note · Sylhet Division',
};

function FinalReportDrawer({ variant, onClose, t }) {
  const [activePanel, setActivePanel] = useState(null); // null | 'report' | 'email' | 'mis'
  const reportTitle = FINAL_DRAWER_SUBTITLE[variant] ?? FINAL_DRAWER_SUBTITLE.khulna;

  const FOOTER_BTNS = [
    { id: 'report', label: t('finalTabReport'), Icon: FileDown },
    { id: 'email', label: t('finalTabEmail'), Icon: Send },
    { id: 'mis', label: t('finalTabMis'), Icon: Database },
  ];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (activePanel) setActivePanel(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, activePanel]);

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(4,19,8,0.4)',
          zIndex: 900,
          backdropFilter: 'blur(2px)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: 'min(780px, 92vw)',
          background: COLORS.surface,
          boxShadow: '-8px 0 48px rgba(0,0,0,0.18)',
          zIndex: 901,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide-in-right 0.28s ease-out both',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '16px 22px',
            borderBottom: `1px solid ${COLORS.border}`,
            background: COLORS.surfaceHi,
            flexShrink: 0,
          }}
        >
          {activePanel ? (
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 10px',
                borderRadius: 7,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.surface,
                cursor: 'pointer',
                fontSize: '0.82em',
                color: COLORS.textDim,
                fontWeight: 600,
                flexShrink: 0,
                fontFamily: 'inherit',
              }}
            >
              <ChevronLeft size={14} /> {t('back')}
            </button>
          ) : (
            <div
              style={{
                width: 38, height: 38, borderRadius: 9,
                background: `linear-gradient(135deg, ${COLORS.mint}, ${COLORS.teal})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <FileText size={18} color="#fff" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.72em', color: COLORS.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              {activePanel
                ? FOOTER_BTNS.find((b) => b.id === activePanel)?.label
                : t('finalDrawerHeaderKicker')}
            </div>
            <div style={{ fontSize: '1.05em', fontWeight: 800, color: COLORS.text, fontFamily: "'Syne', sans-serif", lineHeight: 1.25 }}>
              {reportTitle}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X size={17} color={COLORS.textDim} />
          </button>
        </div>

        {/* Body — scrollable; footer tabs at bottom */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="scrollbar-thin">
          {activePanel === 'report' && (
            <div style={{ padding: '8px 22px 24px' }}>
              <MemoArtifact variant={variant} />
            </div>
          )}
          {activePanel === 'email' && (
            <SendPanel
              reportTitle={reportTitle}
              agentName="Programme Intelligence (Freya)"
              sendButtonLabel={t('emailSimSend')}
              successTitle={t('emailSimSent')}
            />
          )}
          {activePanel === 'mis' && (
            <MisUploadPanel
              variant={variant}
              reportTitle={reportTitle}
              publishLabel={t('misSimPublish')}
              publishingLabel={t('misSimPublishing')}
              doneTitle={t('misSimDone')}
              doneSub={t('misSimDoneSub')}
              destinationLabel={t('misSimDestination')}
              moduleLabel={t('misSimModule')}
              docTypeLabel={t('misSimDocType')}
              checksumLabel={t('misSimChecksum')}
              disclaimer={t('misSimDisclaimer')}
            />
          )}
          {!activePanel && (
            <div style={{ padding: '28px 22px 32px', maxWidth: 560 }}>
              <div
                style={{
                  padding: 20,
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.surfaceHi,
                  lineHeight: 1.65,
                }}
              >
                <div style={{ fontSize: '0.82em', fontWeight: 700, color: COLORS.mint, marginBottom: 8 }}>
                  {reportTitle}
                </div>
                <p style={{ margin: 0, fontSize: '0.9em', color: COLORS.textDim }}>
                  {t('finalDrawerHomeHint')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', borderTop: `1px solid ${COLORS.border}`, background: COLORS.surfaceHi, flexShrink: 0 }}>
          {FOOTER_BTNS.map(({ id, label, Icon }) => {
            const isActive = activePanel === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActivePanel(isActive ? null : id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  padding: '14px 6px',
                  border: 'none',
                  borderRight: id !== 'mis' ? `1px solid ${COLORS.border}` : 'none',
                  background: isActive ? COLORS.mint : 'transparent',
                  color: isActive ? '#fff' : COLORS.textDim,
                  fontSize: '0.74em',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                  fontFamily: 'inherit',
                }}
              >
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

function EscalationOverlay({ onApprove, scenario, t, onViewLedger, canViewLedger }) {
  const esc = scenario.escalation;
  return (
    <div className="anim-fade-up escalation-banner-bg" style={{ position: 'absolute', left: 16, right: 16, bottom: 16, padding: 18, borderRadius: 10, backdropFilter: 'blur(10px)', boxShadow: '0 12px 40px rgba(248,113,113,0.25)', zIndex: 5 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div className="pulse-red" style={{ width: 38, height: 38, borderRadius: 8, background: COLORS.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertTriangle size={18} color="#FFFFFF" strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.82em', color: COLORS.amber, fontWeight: 700, marginBottom: 4 }}>
            {t('humanGateTitle')}
          </div>
          <div className="font-display" style={{ fontSize: '1.05em', fontWeight: 700, marginBottom: 6 }}>
            {t('humanGateSub')}
          </div>
          <div style={{ lineHeight: 1.55, color: COLORS.text, marginBottom: 4 }}>
            <strong>{esc.headline}</strong> — {esc.body}
          </div>
          <div style={{ fontSize: '0.85em', color: COLORS.textDim, marginBottom: 12 }}>{t('escalationExplain')}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={onApprove} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 6, background: COLORS.mint, color: COLORS.onAccent, border: 'none', fontWeight: 700, fontSize: '0.82em', cursor: 'pointer', fontFamily: 'inherit' }}>
              <CheckCircle2 size={14} /> {t('acknowledge')}
            </button>
            <button
              type="button"
              onClick={onViewLedger}
              disabled={!canViewLedger}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                borderRadius: 6,
                background: 'transparent',
                color: canViewLedger ? COLORS.text : COLORS.textMute,
                border: `1px solid ${COLORS.border}`,
                fontSize: '0.82em',
                cursor: canViewLedger ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                opacity: canViewLedger ? 1 : 0.65,
              }}
            >
              <Eye size={13} /> {t('viewLedger')}
            </button>
            <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 6, background: 'transparent', color: COLORS.red, border: `1px solid ${COLORS.red}55`, fontSize: '0.82em', cursor: 'pointer', fontFamily: 'inherit' }}>
              <XCircle size={13} /> {t('rejectEscalate')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemoGateOverlay({ onApprove, scenario, t }) {
  const mg = scenario.memoGate;
  return (
    <div
      className="anim-fade-up"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 16,
        padding: 18,
        borderRadius: 10,
        backdropFilter: 'blur(10px)',
        zIndex: 6,
        background: 'linear-gradient(135deg, rgba(22, 148, 84, 0.12), rgba(13, 148, 136, 0.1))',
        border: `1px solid ${COLORS.mintDim}`,
        boxShadow: '0 12px 40px rgba(22, 148, 84, 0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div className="pulse-mint" style={{ width: 38, height: 38, borderRadius: 8, background: COLORS.mintDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Lock size={18} color={COLORS.onAccent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.82em', color: COLORS.mint, fontWeight: 700, marginBottom: 4 }}>{t('memoGateTitle')}</div>
          <div className="font-display" style={{ fontSize: '1.05em', fontWeight: 700, marginBottom: 6 }}>
            {mg.headline}
          </div>
          <div style={{ lineHeight: 1.55, color: COLORS.text, marginBottom: 10 }}>{mg.body}</div>
          <div style={{ fontSize: '0.85em', color: COLORS.textDim, marginBottom: 12 }}>{t('memoGateExplain')}</div>
          <button type="button" onClick={onApprove} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 6, background: COLORS.mint, color: COLORS.onAccent, border: 'none', fontWeight: 700, fontSize: '0.82em', cursor: 'pointer', fontFamily: 'inherit' }}>
            <FileCheck size={14} /> {t('approveRelease')}
          </button>
        </div>
      </div>
    </div>
  );
}

function VerdictBlock({ title, rows, tone }) {
  const isMint = tone === 'mint';
  return (
    <div style={{ padding: 14, borderRadius: 8, background: isMint ? `${COLORS.mint}10` : COLORS.surface, border: `1px solid ${isMint ? COLORS.mintDim : COLORS.border}` }}>
      <div className="font-display" style={{ fontSize: '0.95em', fontWeight: 700, marginBottom: 10, color: isMint ? COLORS.mint : COLORS.textDim }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map(([label, value], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 4, borderBottom: i < rows.length - 1 ? `1px dashed ${COLORS.border}` : 'none' }}>
            <span style={{ fontSize: '0.82em', color: COLORS.textDim }}>{label}</span>
            <span style={{ fontSize: '0.82em', color: isMint ? COLORS.text : COLORS.textDim, fontWeight: isMint ? 600 : 400, textAlign: 'right' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WBReportTable({ headers, rows, flagCol }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82em', marginTop: 10, marginBottom: 4 }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{ background: '#0d2c4a', color: '#fff', padding: '8px 12px', textAlign: i === 0 ? 'left' : 'right', fontWeight: 700, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => {
          const flagged = flagCol !== undefined && row[flagCol] === true;
          return (
            <tr key={ri} style={{ background: flagged ? '#fff3e0' : ri % 2 === 0 ? '#f5f9fc' : '#ffffff' }}>
              {row.filter((_, ci) => ci !== flagCol).map((cell, ci) => (
                <td key={ci} style={{ padding: '7px 12px', borderBottom: '1px solid #d8e8f4', color: flagged ? '#7a4c00' : '#0d2c4a', textAlign: ci === 0 ? 'left' : 'right', fontWeight: flagged && ci === 0 ? 700 : 400 }}>{cell}</td>
              ))}
              {flagged && <td style={{ padding: '7px 8px', borderBottom: '1px solid #d8e8f4', textAlign: 'center' }}><span style={{ background: '#c67c00', color: '#fff', fontSize: '0.72em', fontWeight: 700, padding: '2px 7px', borderRadius: 10, whiteSpace: 'nowrap' }}>⚑ FLAGGED</span></td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function WBSection({ number, title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, borderBottom: '2px solid #0d2c4a', paddingBottom: 5, marginBottom: 12 }}>
        <span style={{ fontSize: '0.78em', fontWeight: 800, color: '#1a6fa8', letterSpacing: 1, fontFamily: "'Syne', sans-serif", minWidth: 22 }}>{number}.</span>
        <span style={{ fontSize: '0.92em', fontWeight: 800, color: '#0d2c4a', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: "'Syne', sans-serif" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

const REPORT_META = {
  khulna: {
    reportNo: 'PKSF-PM-2026-Q1-KHL', date: 'April 2026', region: 'Khulna Division',
    classification: 'CONFIDENTIAL — BOARD CIRCULATION ONLY', classColor: '#1a6fa8', classBg: '#e8f4fb',
    title: 'Q1 2026 Partner Organisation Performance Review',
    subtitle: 'Regional Portfolio Analysis with Root-Cause Findings and Recommendations · Khulna Division',
    preparedBy: 'Agnetic AI Workflow · 9 Specialist Agents', reviewedBy: 'Programme Officer (authorised), PKSF',
    agentCount: '9', classLabel: 'Confidential',
    icon: <FileText size={20} color="#fff" />, accentBg: '#1a6fa8',
  },
  compliance: {
    reportNo: 'PKSF-RC-2026-Q1-RJH', date: 'April 2026', region: 'Rajshahi Division',
    classification: 'RESTRICTED — FOR OFFICIAL USE ONLY', classColor: '#c67c00', classBg: '#fff3e0',
    title: 'Disbursement Anomaly Assessment',
    subtitle: 'Partner Organisation Compliance Review · Rajshahi Region · Q1 2026',
    preparedBy: 'Agnetic AI Risk Intelligence Module', reviewedBy: 'Chief Risk Officer, PKSF',
    agentCount: '6', classLabel: 'Restricted',
    icon: <ShieldAlert size={20} color="#fff" />, accentBg: '#c67c00',
  },
  me_dhaka: {
    reportNo: 'PKSF-ME-2026-Q1-DHK', date: 'April 2026', region: 'Dhaka Division',
    classification: 'CLEARED FOR DONOR REPORTING — EXTERNAL RELEASE',
    classColor: '#0e8c72', classBg: '#d0f5ec',
    title: 'Q1 2026 M&E Indicator Review — Dhaka Division',
    subtitle: 'PDO Log Frame Actuals vs Targets · Donor-Ready Update · Q1 2026',
    preparedBy: 'Agnetic AI M&E Module · 5 Specialist Agents', reviewedBy: 'M&E Specialist (authorised), PKSF',
    agentCount: '5', classLabel: 'Cleared — Donor',
    icon: <FileBarChart size={20} color="#fff" />, accentBg: '#0e8c72',
  },
  field_sylhet: {
    reportNo: 'PKSF-FO-2026-Q1-SYL', date: 'April 2026', region: 'Sylhet Division',
    classification: 'INTERNAL — FIELD COORDINATION USE',
    classColor: '#2e5272', classBg: '#eef5fb',
    title: 'Q1 2026 Field Operations Programme Note — Sylhet Division',
    subtitle: 'Service Delivery Gap Analysis · Officer Visit Coverage · Borrower Risk · Q1 2026',
    preparedBy: 'Agnetic AI Field Analytics Module · 4 Specialist Agents', reviewedBy: 'Field Coordinator (authorised), PKSF',
    agentCount: '4', classLabel: 'Internal',
    icon: <MapPin size={20} color="#fff" />, accentBg: '#2e5272',
  },
};

function MemoArtifact({ variant }) {
  const meta = REPORT_META[variant] ?? REPORT_META.khulna;

  return (
    <div className="anim-fade-up" style={{ fontFamily: "'DM Sans', sans-serif", background: '#ffffff', color: '#0d2c4a', border: '1px solid #d8e8f4', borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 32px rgba(13,44,74,0.1)' }}>

      {/* ── Cover header band ─────────────────────────────── */}
      <div style={{ background: '#0d2c4a', padding: '22px 28px 18px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ width: 46, height: 46, borderRadius: 6, background: meta.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          {meta.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.68em', color: '#5ab4e0', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
            Palli Karma-Sahayak Foundation · Official Report
          </div>
          <div style={{ fontSize: '1.4em', fontWeight: 800, color: '#FFFFFF', fontFamily: "'Syne', sans-serif", lineHeight: 1.2, marginBottom: 6 }}>
            {meta.title}
          </div>
          <div style={{ fontSize: '0.82em', color: '#90b4cc', lineHeight: 1.5 }}>{meta.subtitle}</div>
        </div>
      </div>

      {/* ── Classification banner ─────────────────────────── */}
      <div style={{ background: meta.classBg, borderBottom: `2px solid ${meta.classColor}`, padding: '6px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72em', fontWeight: 800, color: meta.classColor, letterSpacing: 1.2, textTransform: 'uppercase' }}>{meta.classification}</span>
        <span className="font-mono" style={{ fontSize: '0.7em', color: meta.classColor }}>{meta.reportNo}</span>
      </div>

      {/* ── Document metadata grid ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: '1px solid #d8e8f4' }}>
        {[['Report No.', meta.reportNo], ['Date', meta.date], ['Region', meta.region], ['Status', 'Approved & Released']].map(([label, value], i) => (
          <div key={i} style={{ padding: '10px 16px', borderRight: i < 3 ? '1px solid #d8e8f4' : 'none', background: i % 2 === 0 ? '#f5f9fc' : '#ffffff' }}>
            <div style={{ fontSize: '0.64em', color: '#7090aa', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: '0.82em', color: '#0d2c4a', fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 28px 32px' }}>

        {/* ── Abstract ─────────────────────────────────────── */}
        <div style={{ border: '1.5px solid #b8daf4', borderLeft: `5px solid ${meta.accentBg}`, borderRadius: 3, padding: '14px 18px', marginBottom: 24, background: '#e8f4fb' }}>
          <div style={{ fontSize: '0.68em', fontWeight: 800, color: meta.accentBg, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Abstract</div>
          <p style={{ margin: 0, fontSize: '0.85em', lineHeight: 1.7, color: '#0d2c4a' }}>
            {variant === 'compliance' && 'This report presents findings from an AI-assisted compliance review of disbursement patterns across four partner organisations in Rajshahi Division for Q1 2026. Four POs exhibit timing anomalies relative to the approved tranche calendar. PO-RJH-11 records the highest combined severity score. No autonomous action was taken; all findings were escalated for human adjudication in accordance with PKSF policy.'}
            {variant === 'khulna' && 'This report presents a performance assessment of 12 partner organisations operating in Khulna Division during Q1 2026. Ten organisations performed at or above the regional baseline. Two POs — PO-KHL-04 and PO-KHL-09 — are flagged for supervisory review. Root-cause analysis attributes the performance deviation primarily to environmental factors. One compliance flag was escalated and resolved under the AI-assisted human approval gate.'}
            {variant === 'me_dhaka' && 'This update presents Q1 2026 actuals against PDO log frame targets for Dhaka Division. Of 12 tracked indicators, three deviate beyond the 10% threshold. Beneficiary reach is 88% of target, attributable to officer transitions in two sub-districts now resolved. The income growth proxy is 14% ahead of plan — a positive overshoot. Narrative explanations are provided for all flagged indicators for donor review.'}
            {variant === 'field_sylhet' && 'This programme note synthesises Q1 2026 field officer visit data for Sylhet Division. Of 22 sub-districts, four fell below the 80% visit coverage target. Transport constraints in Jaintiapur and Gowainghat are the identified root cause. 580 of 1,340 borrowers in affected zones had fewer than 2 officer contacts, correlating with elevated arrears risk. A transport uplift and Q2 priority visit plan are recommended.'}
          </p>
        </div>

        {/* ── Variant body ─────────────────────────────────── */}
        {variant === 'khulna' && (
          <>
            <WBSection number="1" title="Background &amp; Scope">
              <p style={pStyle}>This report covers all 12 PKSF-affiliated partner organisations in Khulna Division during Q1 2026 (1 January – 31 March). Performance metrics were drawn from the MIS core system. Field data synthesis and beneficiary income analysis were carried out by specialist AI agents and verified against programme records.</p>
            </WBSection>
            <WBSection number="2" title="Key Performance Indicators">
              <WBReportTable
                headers={['Partner Org.', 'On-Time Repayment', 'PAR-30 (%)', 'Active Borrowers', 'Deviation (σ)', '_flag']}
                flagCol={5}
                rows={[
                  ['PO-KHL-01', '82.1%', '2.8%', '1,240', '+0.5σ', false],
                  ['PO-KHL-02', '79.6%', '3.6%', '890', '+0.1σ', false],
                  ['PO-KHL-03', '81.3%', '3.1%', '1,105', '+0.4σ', false],
                  ['PO-KHL-04', '47.2%', '11.4%', '1,580', '−2.1σ', true],
                  ['PO-KHL-05', '77.8%', '4.2%', '730', '−0.1σ', false],
                  ['PO-KHL-06', '80.5%', '3.9%', '960', '+0.3σ', false],
                  ['PO-KHL-07', '83.2%', '2.5%', '1,410', '+0.6σ', false],
                  ['PO-KHL-08', '78.9%', '4.0%', '820', '0.0σ', false],
                  ['PO-KHL-09', '53.8%', '8.7%', '1,200', '−1.7σ', true],
                  ['PO-KHL-10', '80.1%', '3.3%', '1,050', '+0.3σ', false],
                  ['PO-KHL-11', '77.3%', '4.5%', '670', '−0.1σ', false],
                  ['PO-KHL-12', '81.7%', '3.0%', '980', '+0.4σ', false],
                ]}
              />
              <p style={{ ...pStyle, marginTop: 8, fontStyle: 'italic', color: '#7090aa' }}>Table 1 — Performance scorecard, Khulna Q1 2026. Regional baseline: 78.4% on-time repayment · PAR-30: 4.1%.</p>
            </WBSection>
            <WBSection number="3" title="Root-Cause Analysis">
              <p style={pStyle}><strong>PO-KHL-04 (Dacope &amp; Koyra):</strong> ~340 borrowers experienced temporary income disruption due to March 2026 flooding. Performance dip assessed as environmental; recovery to baseline projected Q2 2026 subject to approved grace measures.</p>
              <p style={pStyle}><strong>PO-KHL-09:</strong> Compliance flag raised on tranche disbursement timing. Reviewed and acknowledged by the authorised programme officer under the AI-assisted human approval gate. Full ledger audit recommended prior to next disbursement.</p>
            </WBSection>
            <WBSection number="4" title="Recommendations">
              <ol style={olStyle}>
                <li>Approve a <strong>60-day repayment grace window</strong> for ~340 affected borrowers in PO-KHL-04's service area, effective April 2026.</li>
                <li>Authorise a <strong>full ledger audit of PO-KHL-09</strong> before the Q2 tranche disbursement.</li>
                <li>Brief the <strong>donor reporting team</strong> on the environmental context for PO-KHL-04.</li>
                <li>Commission a <strong>climate-risk mapping exercise</strong> for flood-prone service areas.</li>
              </ol>
            </WBSection>
          </>
        )}

        {variant === 'compliance' && (
          <>
            <WBSection number="1" title="Background &amp; Scope">
              <p style={pStyle}>The PKSF Compliance &amp; Risk Sentinel reviewed disbursement ledger entries for all Rajshahi-region partner organisations for 1 January – 31 March 2026. Rule-engine checks were applied against the approved tranche calendar. Four POs returned violations above the reporting threshold.</p>
            </WBSection>
            <WBSection number="2" title="Anomaly Findings">
              <WBReportTable
                headers={['Partner Org.', 'Tranche Violations', 'Severity Score', 'PAR-30 (%)', 'Status']}
                rows={[
                  ['PO-RJH-11', '4', '8.7 / 10', '9.2%', false],
                  ['PO-RJH-07', '2', '5.1 / 10', '6.8%', false],
                  ['PO-RJH-03', '3', '4.9 / 10', '5.4%', false],
                  ['PO-RJH-15', '1', '2.3 / 10', '4.1%', false],
                ]}
              />
              <p style={{ ...pStyle, marginTop: 10, fontStyle: 'italic', color: '#7090aa' }}>Table 1 — Disbursement anomaly summary, Rajshahi Q1 2026. Severity is a composite of violation count, exposure quantum, and PAR trend.</p>
            </WBSection>
            <WBSection number="3" title="Evidence Chain">
              <ul style={ulStyle}>
                <li><strong>Rule engine:</strong> Tranche window violations flagged with unique rule IDs attached to each ledger row for full traceability.</li>
                <li><strong>Portfolio linkage:</strong> Stressed exposure indices cross the internal comfort band on two disbursement routes.</li>
                <li><strong>Field correlation:</strong> Reporting cadence dip on PO-RJH-11 correlates temporally with the anomaly cluster — correlation only, not confirmed causation.</li>
              </ul>
            </WBSection>
            <WBSection number="4" title="Recommended Actions">
              <ol style={olStyle}>
                <li>Initiate a full ledger audit of PO-RJH-11 within 10 working days.</li>
                <li>Place disbursements to PO-RJH-11 on supervisory hold pending audit completion.</li>
                <li>Request documentary justification from PO-RJH-07 and PO-RJH-03 for the flagged tranche windows.</li>
                <li>Escalate PO-RJH-11 findings to the Board Risk Committee at the next scheduled session.</li>
              </ol>
            </WBSection>
          </>
        )}

        {variant === 'me_dhaka' && (
          <>
            <WBSection number="1" title="Scope &amp; Methodology">
              <p style={pStyle}>This update covers 12 PDO log frame indicators tracked for Dhaka Division during Q1 2026 (1 January – 31 March). Actuals were extracted from the MIS M&E module and compared against signed Q1 targets. Indicators deviating beyond ±10% of target are reviewed in detail.</p>
            </WBSection>
            <WBSection number="2" title="PDO Indicator Summary">
              <WBReportTable
                headers={['Indicator', 'Q1 Target', 'Q1 Actual', 'Variance', 'Status', '_flag']}
                flagCol={5}
                rows={[
                  ['Beneficiary Reach', '8,500', '7,480', '−12%', 'Below target', true],
                  ['Disbursement Utilisation', '92%', '81%', '−11%', 'Below target', true],
                  ['Income Growth Proxy', '8%', '+14%', '+6pp', 'Ahead of plan', false],
                  ['Female Participation', '70%', '74.2%', '+4pp', 'On track', false],
                  ['Active Borrowers', '9,200', '8,940', '−3%', 'On track', false],
                  ['PAR-30 (Dhaka)', '≤5%', '4.3%', 'Within', 'On track', false],
                  ['New Borrower Pipeline', '1,100', '1,240', '+13%', 'On track', false],
                  ['Reporting Compliance', '100%', '85.7%', '−14pp', 'Below target', true],
                  ['PO Audit Clearance', '100%', '100%', '—', 'On track', false],
                  ['Field Visit Rate', '85%', '88%', '+3pp', 'On track', false],
                  ['Grievance Resolution', '≤7 days', '5.4 days', 'Within', 'On track', false],
                  ['Gender Action Plan', '100%', '100%', '—', 'On track', false],
                ]}
              />
              <p style={{ ...pStyle, marginTop: 8, fontStyle: 'italic', color: '#7090aa' }}>Table 1 — PDO indicator actuals vs targets, Dhaka Division Q1 2026. Flagged rows deviate beyond ±10% threshold.</p>
            </WBSection>
            <WBSection number="3" title="Explanations for Off-Track Indicators">
              <p style={pStyle}><strong>Beneficiary Reach (−12%):</strong> Planned officer transitions in Bijoynagar and Savar (February 2026) caused ~120 missed intake sessions. Replacement officers are now in post. Q2 recovery to target is projected by end of June.</p>
              <p style={pStyle}><strong>Disbursement Utilisation (−11%):</strong> Q4 2025 reallocation of a tranche to Mymensingh left a temporary funding gap in Dhaka. The variance is non-structural; funds have been re-allocated for Q2.</p>
              <p style={pStyle}><strong>Reporting Compliance (−14pp):</strong> PO-DHK-06 (+8 days late) and PO-DHK-11 (+13 days late) missed the Q1 deadline. Formal reminder notices have been issued; both POs have since submitted.</p>
            </WBSection>
            <WBSection number="4" title="Recommendations">
              <ol style={olStyle}>
                <li>Accept the <strong>beneficiary reach shortfall</strong> as operationally explained; no corrective action beyond Q2 monitoring required.</li>
                <li>Confirm <strong>disbursement re-allocation</strong> is processed before the Q2 reporting window opens.</li>
                <li>Issue a <strong>formal late-reporting notice</strong> to PO-DHK-11; apply escalation protocol if recurrence observed in Q2.</li>
                <li>Include the <strong>income growth proxy overshoot (+14%)</strong> as a positive highlight in the next donor progress report.</li>
              </ol>
            </WBSection>
          </>
        )}

        {variant === 'field_sylhet' && (
          <>
            <WBSection number="1" title="Scope &amp; Data Sources">
              <p style={pStyle}>This programme note covers 847 field officer visit records across 22 sub-districts of Sylhet Division for Q1 2026 (1 January – 31 March). Data was extracted from the Field Reporting System (FRS) and cross-referenced with borrower contact logs and PO Q1 narrative submissions.</p>
            </WBSection>
            <WBSection number="2" title="Visit Coverage by Sub-District (Gap Zones)">
              <WBReportTable
                headers={['Sub-District', 'Target Coverage', 'Q1 Actual', 'Gap', 'Under-Contacted Borrowers', '_flag']}
                flagCol={5}
                rows={[
                  ['Jaintiapur', '80%', '68.9%', '−11.1pp', '183', true],
                  ['Gowainghat', '80%', '71.1%', '−8.9pp', '162', true],
                  ['Companiganj', '80%', '75.4%', '−4.6pp', '128', true],
                  ['Zakiganj', '80%', '76.8%', '−3.2pp', '107', true],
                  ['Kanaighat', '80%', '83.2%', '+3.2pp', '—', false],
                  ['Beanibazar', '80%', '87.6%', '+7.6pp', '—', false],
                ]}
              />
              <p style={{ ...pStyle, marginTop: 8, fontStyle: 'italic', color: '#7090aa' }}>Table 1 — Sub-district visit coverage, Sylhet Q1 2026. Under-contacted = fewer than 2 officer contacts in the quarter.</p>
            </WBSection>
            <WBSection number="3" title="Borrower Risk Analysis">
              <p style={pStyle}>Of 1,340 borrowers in the four gap sub-districts, <strong>580 (43.3%)</strong> received fewer than 2 officer contacts in Q1. Arrears correlation for under-contacted borrowers stands at <strong>+2.1σ above the divisional mean</strong>, indicating a materially elevated risk of slippage into PAR-30 by Q2 end if contact rates are not restored.</p>
              <p style={pStyle}><strong>Root cause (confirmed):</strong> PO-SYL-04 and PO-SYL-07 both self-flagged transport cost constraints in their Q1 narrative submissions. Fuel cost increases and seasonal road access issues in the Jaintiapur–Gowainghat corridor are the primary operational driver. This finding is not an isolated management failure — it reflects a systemic input cost pressure affecting multiple POs.</p>
            </WBSection>
            <WBSection number="4" title="Recommendations &amp; Q2 Plan">
              <ol style={olStyle}>
                <li>Approve a <strong>transport cost uplift</strong> for PO-SYL-04 and PO-SYL-07 — costed mitigation plans are attached as Annex A. Budget impact: BDT 3.2 lakh per PO per quarter.</li>
                <li>Designate <strong>580 under-contacted borrowers</strong> as Q2 priority visit targets; assign dedicated visit slots in officer schedules by 15 May 2026.</li>
                <li>Introduce a <strong>monthly transport constraint flag</strong> in PO narrative templates to enable earlier detection in future quarters.</li>
              </ol>
              <p style={{ ...pStyle, marginTop: 10, fontStyle: 'italic' }}>Q2 forecast (with uplift approved): visit coverage rises to 89% across gap zones; under-contacted borrowers fall from 580 to ~180 by June 2026.</p>
            </WBSection>
          </>
        )}

        {/* ── Approval & signature block ────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8, marginBottom: 20 }}>
          {[
            { label: 'Prepared by', value: meta.preparedBy, sub: 'AI-assisted analysis' },
            { label: 'Reviewed &amp; approved by', value: meta.reviewedBy, sub: 'Human approval gate — signed' },
          ].map(({ label, value, sub }, i) => (
            <div key={i} style={{ border: '1px solid #d8e8f4', borderTop: `3px solid ${meta.accentBg}`, borderRadius: 3, padding: '12px 14px' }}>
              <div style={{ fontSize: '0.65em', color: '#7090aa', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 5 }} dangerouslySetInnerHTML={{ __html: label }} />
              <div style={{ fontSize: '0.88em', fontWeight: 700, color: '#0d2c4a', marginBottom: 3 }}>{value}</div>
              <div style={{ fontSize: '0.72em', color: '#7090aa' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Audit trail ───────────────────────────────────── */}
        <div style={{ background: '#f5f9fc', border: '1px solid #d8e8f4', borderLeft: `4px solid ${meta.accentBg}`, borderRadius: 3, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <CheckCircle2 size={17} color={meta.accentBg} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.78em', color: '#0d2c4a', lineHeight: 1.6 }}>
            <strong>Audit &amp; Traceability:</strong> This document was produced by a multi-agent AI workflow comprising {meta.agentCount} specialist agents. All intermediate reasoning steps, tool calls, data citations, and human approval decisions are stored in the immutable run log. Report released under PKSF policy gate. Classification: {meta.classLabel}.
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <div style={{ background: '#0d2c4a', padding: '10px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: '0.68em', color: '#5ab4e0', letterSpacing: 0.8 }}>Palli Karma-Sahayak Foundation · Agnetic AI Workflow</span>
        <span className="font-mono" style={{ fontSize: '0.68em', color: '#5ab4e0' }}>{meta.reportNo} · {meta.date} · {meta.classLabel}</span>
      </div>
    </div>
  );
}

const pStyle = { fontSize: '0.82em', lineHeight: 1.65, color: '#3e6080', margin: '6px 0' };
const ulStyle = { fontSize: '0.82em', lineHeight: 1.7, color: '#3e6080', paddingLeft: 18, margin: '6px 0' };
const olStyle = { fontSize: '0.82em', lineHeight: 1.7, color: '#3e6080', paddingLeft: 20, margin: '6px 0' };

