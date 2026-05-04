/**
 * PKSF Glass Box demo — scenario data (aligned to workshop curriculum agent numbering).
 */
import {
  Brain,
  FileBarChart,
  Activity,
  MapPin,
  Users,
  TrendingDown,
  FileText,
  ShieldAlert,
  Sparkles,
  Database,
  Calculator,
  Cpu,
  Search,
  Lock,
  ScrollText,
  FileCheck,
} from 'lucide-react';
import { COMPLIANCE_AGENT_GLASS, KHULNA_AGENT_GLASS } from './pksf_agent_glass_data.js';

const khAgent = (delay, id, presenterNote) => ({
  delay,
  type: 'agent',
  id,
  presenterNote,
  ...KHULNA_AGENT_GLASS[id],
});

const coAgent = (delay, id, presenterNote) => ({
  delay,
  type: 'agent',
  id,
  presenterNote,
  ...COMPLIANCE_AGENT_GLASS[id],
});

export const COLORS = {
  bg: '#F2F7F4',
  surface: '#FFFFFF',
  surfaceHi: '#E9F2EC',
  border: '#C9DDD2',
  borderHi: '#A3C9B3',
  mint: '#169454',
  mintDim: '#127A45',
  teal: '#0D9488',
  text: '#12261C',
  textDim: '#425A4E',
  textMute: '#4d6258',
  amber: '#B45309',
  red: '#DC2626',
  redDim: '#FECACA',
  /** Foreground on mint / red fills (icons, button labels) */
  onAccent: '#041308',
};

/** Curriculum order: Agent 01–09 */
export const AGENTS = [
  { id: 'a1', n: 1, name: 'Programme Intelligence (Freya)', role: 'Core · Orchestrator', icon: Brain },
  { id: 'a2', n: 2, name: 'M&E Report Generator', role: 'Monitoring & evaluation', icon: FileBarChart },
  { id: 'a3', n: 3, name: 'PO Performance Monitor', role: 'Tracking · alerts', icon: Activity },
  { id: 'a4', n: 4, name: 'Field Data Analyst', role: 'Ground synthesis', icon: MapPin },
  { id: 'a5', n: 5, name: 'Beneficiary Analytics', role: 'Impact tracking', icon: Users },
  { id: 'a6', n: 6, name: 'Loan Portfolio Monitor', role: 'Portfolio health', icon: TrendingDown },
  { id: 'a7', n: 7, name: 'Document Drafting', role: 'Memos · narratives', icon: FileText },
  { id: 'a8', n: 8, name: 'Compliance & Risk Sentinel', role: 'Risk flagging', icon: ShieldAlert },
  { id: 'a9', n: 9, name: 'Programme Forecasting', role: 'Scenario modelling', icon: Sparkles },
];

export const UI_STRINGS = {
  en: {
    headerTitle: 'Agnetic AI',
    headerBadge: 'PKSF Edition',
    headerSubtitle: 'Workshop walkthrough (not live production data)',
    audienceBanner:
      'This screen compares a simple chat reply with an assisted workflow: clear steps, checks, and human approval — similar in spirit to how PKSF would review important programme decisions.',
    live: 'Live',
    moduleTag: 'Module 6 — demonstration',
    compareHint: 'Same question, two approaches — watch how the answers differ.',
    runDemo: 'Start demonstration',
    running: 'Running…',
    runAgain: 'Play again',
    reset: 'Start over',
    userPromptLabel: 'Example question from a programme manager',
    chatbotTitle: 'Plain chatbot (for comparison)',
    chatbotSub: 'One general reply. It cannot open PKSF systems or verify numbers.',
    agentTitle: 'Agnetic AI workflow (for comparison)',
    agentSub: 'Several focused steps, data checks, and explicit human sign-off where needed.',
    output: 'Output',
    awaiting: 'Awaiting prompt…',
    thinking: 'Thinking…',
    chatbotWarn:
      'This is only a generic suggestion. The chatbot cannot open PKSF records or check real numbers, so it is not a programme report.',
    workflowProgress: 'Overall progress',
    taskDecomposition: 'How the big question was split into smaller tasks',
    onePrompt: 'From one request to',
    subtasks: 'smaller tasks',
    agentActivations: 'Which specialists are working',
    toolCalls: 'System checks run along the way',
    executed: 'executed',
    noToolsYet: 'No tools called yet.',
    earlierCalls: 'earlier calls',
    reasoningTitle: 'Short notes shown as the workflow runs',
    waitingReasoning: 'Notes will appear here when the demonstration runs.',
    sourceData: 'Supporting record',
    footnote: 'Agnetic AI · Velondra Group · Confidential · Workshop demo build',
    buildId: 'PKSF.WORKSHOP.APR-2026',
    verdictTitle: 'What you saw, in plain terms',
    paused: 'Paused — press Space to continue',
    presenterBar: 'Notes for the facilitator',
    scenarioLabel: 'Scenario',
    langLabel: 'Language',
    stepMode: 'Step mode',
    nextStep: 'Next step',
    keyboardHints: 'Space pause · R reset · N step · ` notes · B bilingual',
    presenterTip: 'Facilitator: Space pauses or resumes; R starts over. Other keys are optional.',
    notesPlaceholder: 'Facilitator notes for this moment in the story.',
    hidePresenterBar: 'Hide notes bar',
    humanGateTitle: 'Human check required',
    humanGateSub: 'The risk step paused so a person can decide before continuing.',
    memoGateTitle: 'Human approval before wider sharing',
    memoGateSub: 'The draft memo waits for an authorised sign-off before it can leave the internal workspace.',
    acknowledge: 'Acknowledge & continue',
    approveRelease: 'Approve external release',
    viewLedger: 'View supporting ledger lines',
    rejectEscalate: 'Stop and escalate further',
    escalationExplain:
      'The system is not sure enough to move forward on its own. It stops and asks a person to decide — nothing continues until someone approves.',
    memoGateExplain:
      'Board- and donor-facing documents stay gated until an authorised officer explicitly releases them.',
    glassBoxTheatre: 'Transparent view',
    glassBoxPerAgent: 'Behind each specialist',
    glassBoxSub: 'What the lead coordinator asked for, why, the numbers checked, and what came out.',
    noAgentGlassYet: 'Press “Start demonstration” to fill this section step by step.',
    freyaHandoff: 'Instructions from the lead coordinator (Freya)',
    agentReasoningTrace: 'Why this step was done this way',
    calcBreakdown: 'Numbers checked (summary)',
    agentStructuredOutput: 'What this specialist produced',
    glassMetric: 'What we looked at',
    glassHow: 'How it was counted',
    glassValue: 'Result',
    panelActive: 'In motion',
    tasksSmall: 'small tasks completed so far',
    nowWorking: 'Now working',
    waitingToStart: 'Waiting for demonstration to begin…',
    agentWaiting: 'On standby',
    stepDone: 'Done',
    stepActive: 'Running',
    activationFlow: 'How specialists were called in',
    runBy: 'Run by',
  },
  bn: {
    headerTitle: 'এজেন্টিক AI',
    headerBadge: 'পিকেএসএফ সংস্করণ',
    headerSubtitle: 'কর্মশালার নমুনা (প্রকৃত লাইভ ডেটা নয়)',
    audienceBanner:
      'এই পর্দায় সাধারণ চ্যাটের উত্তরের সঙ্গে একটি ধাপে ধাপে সহায়তা তুলনা করা হয়েছে—পরিষ্কার কাজ, যাচাই, এবং প্রয়োজনে মানুষের অনুমোদন; পিকেএসএফের গুরুত্বপূর্ণ সিদ্ধান্ত পর্যালোচনার মতোই চিন্তা করা যায়।',
    live: 'সরাসরি',
    moduleTag: 'মডিউল ৬ — প্রদর্শনী',
    compareHint: 'একই প্রশ্ন, দুটি উপায় — উত্তরের পার্থক্য দেখুন।',
    runDemo: 'প্রদর্শন শুরু করুন',
    running: 'চলছে…',
    runAgain: 'আবার চালান',
    reset: 'আবার শুরু',
    userPromptLabel: 'প্রোগ্রাম ব্যবস্থাপকের একটি নমুনা প্রশ্ন',
    chatbotTitle: 'সাধারণ চ্যাটবট (তুলনার জন্য)',
    chatbotSub: 'একটি সাধারণ উত্তর। এটি পিকেএসএফের সিস্টেম খুলতে বা সংখ্যা যাচাই করতে পারে না।',
    agentTitle: 'এজেন্টিক AI কাজের ধারা (তুলনার জন্য)',
    agentSub: 'কয়েকটি পরিষ্কার ধাপ, ডেটা যাচাই, এবং প্রয়োজনে স্পষ্ট মানব অনুমোদন।',
    output: 'আউটপুট',
    awaiting: 'প্রম্পটের অপেক্ষায়…',
    thinking: 'চিন্তা করছে…',
    chatbotWarn:
      'এটি শুধু সাধারণ পরামর্শ। চ্যাটবট পিকেএসএফের নথি খুলতে বা আসল সংখ্যা যাচাই করতে পারে না, তাই এটি প্রোগ্রাম রিপোর্ট নয়।',
    workflowProgress: 'সামগ্রিক অগ্রগতি',
    taskDecomposition: 'বড় প্রশ্নটি ছোট কাজে কীভাবে ভাগ করা হয়েছে',
    onePrompt: 'এক অনুরোধ থেকে',
    subtasks: 'ছোট কাজগুলো',
    agentActivations: 'কোন বিশেষজ্ঞ কাজ করছে',
    toolCalls: 'পথে চালানো যাচাইগুলো',
    executed: 'সম্পন্ন',
    noToolsYet: 'এখনও কোনো টুল কল নেই।',
    earlierCalls: 'আগের কল',
    reasoningTitle: 'কাজ চলাকালীন সংক্ষিপ্ত নোট',
    waitingReasoning: 'প্রদর্শন চালালে এখানে নোট দেখা যাবে।',
    sourceData: 'সহায়ক রেকর্ড',
    footnote: 'এজেন্টিক AI · ভেলন্ড্রা গ্রুপ · গোপনীয় · কর্মশালা ডেমো',
    buildId: 'পিকেএসএফ.কর্মশালা.এপ্রিল-২০২৬',
    verdictTitle: 'সহজ ভাষায় কী দেখলেন',
    paused: 'বিরতি — চালিয়ে যেতে স্পেস চাপুন',
    presenterBar: 'উপস্থাপকের জন্য নোট',
    scenarioLabel: 'দৃশ্য',
    langLabel: 'ভাষা',
    stepMode: 'ধাপ মোড',
    nextStep: 'পরের ধাপ',
    keyboardHints: 'স্পেস বিরতি · R রিসেট · N ধাপ · ` নোট · B দ্বিভাষিক',
    presenterTip: 'উপস্থাপক: স্পেস বিরতি/চালু; R আবার শুরু। বাকি চাবিগুলো ঐচ্ছিক।',
    notesPlaceholder: 'গল্পের এই মুহূর্তে উপস্থাপকের নোট।',
    hidePresenterBar: 'নোট বার লুকান',
    humanGateTitle: 'মানুষের যাচাই লাগবে',
    humanGateSub: 'ঝুঁকির ধাপটি থেমেছে যেন একজন সিদ্ধান্ত নিতে পারেন।',
    memoGateTitle: 'আরও ছড়ানোর আগে মানুষের অনুমোদন',
    memoGateSub: 'খসড়া ব্রিফিং অভ্যন্তরীণ কাজক্ষেত্র ছাড়তে অনুমোদিত স্বাক্ষর লাগে।',
    acknowledge: 'স্বীকার করে চালিয়ে যান',
    approveRelease: 'বাহ্যিক প্রকাশ অনুমোদন',
    viewLedger: 'সহায়ক লেজার লাইন দেখুন',
    rejectEscalate: 'থামিয়ে আরও এসকেলেট করুন',
    escalationExplain:
      'নিজে থেকে এগোতে যথেষ্ট নিশ্চিত নয়। তাই থেমে একজন মানুষের সিদ্ধান্ত চায় — কেউ অনুমোদন না দিলে কিছু এগোয় না।',
    memoGateExplain:
      'বোর্ড ও দাতাদের দিকের নথি প্রকাশ করতে অনুমোদিত কর্মকর্তার স্পষ্ট অনুমোদন লাগে।',
    glassBoxTheatre: 'স্বচ্ছ দৃশ্য',
    glassBoxPerAgent: 'প্রতিটি বিশেষজ্ঞের পেছনে',
    glassBoxSub: 'নেতৃস্থানীয় সমন্বয়কারী কী চেয়েছেন, কেন, কোন সংখ্যা যাচাই হয়েছে, এবং কী বের হয়েছে।',
    noAgentGlassYet: 'ধাপে ধাপে ভরতে “প্রদর্শন শুরু করুন” চাপুন।',
    freyaHandoff: 'নেতৃস্থানীয় সমন্বয়কারীর নির্দেশনা (ফ্রেয়া)',
    agentReasoningTrace: 'এই ধাপটি এভাবেই কেন করা হয়েছে',
    calcBreakdown: 'যাচাই করা সংখ্যার সারাংশ',
    agentStructuredOutput: 'এই বিশেষজ্ঞ কী তৈরি করেছে',
    glassMetric: 'কী দেখা হয়েছে',
    glassHow: 'কীভাবে গণনা হয়েছে',
    glassValue: 'ফল',
    panelActive: 'চলছে',
    tasksSmall: 'এ পর্যন্ত ছোট কাজ সম্পন্ন',
    nowWorking: 'এখন কাজ করছে',
    waitingToStart: 'প্রদর্শন শুরুর অপেক্ষায়…',
    agentWaiting: 'অপেক্ষমাণ',
    stepDone: 'সম্পন্ন',
    stepActive: 'চলছে',
    activationFlow: 'বিশেষজ্ঞরা কীভাবে ডাকা হয়েছে',
    runBy: 'পরিচালিত',
  },
};

function khulnaScript() {
  return [
    { delay: 600, type: 'reason', text: 'Receiving instruction. Parsing intent: quarterly review · regional scope · partner organisation analysis · memo deliverable.', presenterNote: 'Open with intent parsing — tie to Module 1–3.' },
    khAgent(800, 'a1', 'Orchestrator lights up first.'),
    { delay: 600, type: 'reason', text: 'Programme Intelligence taking orchestration. Decomposing into 7 sub-tasks…', presenterNote: 'Contrast with chatbot: multi-step plan + tools.' },
    { delay: 400, type: 'task', id: 't1', state: 'active' },
    { delay: 300, type: 'task', id: 't2', state: 'active' },
    { delay: 300, type: 'task', id: 't3', state: 'active' },
    { delay: 300, type: 'task', id: 't4', state: 'active' },
    { delay: 300, type: 'task', id: 't5', state: 'active' },
    { delay: 300, type: 'task', id: 't6', state: 'active' },
    { delay: 300, type: 'task', id: 't7', state: 'active' },
    khAgent(600, 'a3', 'Agent 03 · PO Performance — curriculum mapping.'),
    { delay: 300, type: 'tool', icon: Database, label: 'po_quarterly · region=Khulna · Q1-2026 → 12 records' },
    { delay: 700, type: 'reason', text: 'Pulled 12 partner organisations operating in Khulna region during Q1 2026.', presenterNote: 'Click source chip — drill-down teaching moment.', sources: [{ id: 'po-q', label: 'MIS · PO quarterly Khulna', detail: 'Official PO roster & quarterly submission timestamps · internal MIS extract Q1-2026.' }] },
    { delay: 200, type: 'task', id: 't1', state: 'done' },
    khAgent(600, 'a6', 'Agent 06 · Loan Portfolio Monitor.'),
    { delay: 400, type: 'tool', icon: Calculator, label: 'compute_repayment_ratio() × 12 POs' },
    { delay: 600, type: 'reason', text: 'Khulna regional baseline · on-time repayment: 78.4% · portfolio-at-risk (PAR-30): 4.1%.', sources: [{ id: 'mis-bl', label: 'Regional MIS baseline', detail: 'Aggregated repayment KPIs · Khulna vs national comparison table · refreshed weekly.' }] },
    { delay: 200, type: 'task', id: 't2', state: 'done' },
    { delay: 200, type: 'task', id: 't3', state: 'done' },
    { delay: 600, type: 'tool', icon: Cpu, label: 'risk_model · score_portfolio_health() → 2 outliers' },
    { delay: 700, type: 'reason', text: 'PO-KHL-04 → 47.2% on-time, 2.1σ below mean. PO-KHL-09 → 53.8% on-time, 1.7σ below mean. Both flagged.' },
    { delay: 200, type: 'task', id: 't4', state: 'done' },
    khAgent(700, 'a4', 'Agent 04 · Field Data Analyst.'),
    { delay: 400, type: 'tool', icon: Search, label: 'field_reports · po IN (KHL-04, KHL-09) → 8 reports' },
    { delay: 800, type: 'reason', text: 'Field officer log (PO-KHL-04, March 2026): "Significant flooding in 3 sub-districts. ~340 borrowers lost income temporarily."', sources: [{ id: 'fld', label: 'Field report bundle', detail: 'Digitised officer logs & visit notes · synced twice weekly from regional hub.' }] },
    { delay: 800, type: 'reason', text: 'Hypothesis: Performance dip is environmental, not management failure. Recommendation should reflect this.' },
    { delay: 200, type: 'task', id: 't5', state: 'done' },
    khAgent(500, 'a5', 'Optional: Beneficiary Analytics cross-check (abbreviated).'),
    { delay: 400, type: 'reason', text: 'Beneficiary income cohorts in flood-affected unions show expected temporary stress — consistent with field narrative.', presenterNote: 'Shows Agent 05 without heavy tool noise.' },
    khAgent(600, 'a8', 'Agent 08 · Compliance — threshold story starts.'),
    { delay: 400, type: 'tool', icon: Lock, label: 'audit_disbursements · po=KHL-09 → 1 anomaly' },
    {
      delay: 700,
      type: 'reason',
      text: 'Compliance Sentinel · PO-KHL-09 disbursement ledger entry may exceed approved tranche limits. Confidence: 0.62. Below auto-act threshold (0.85).',
      sources: [
        {
          id: 'ledger-khl09',
          label: 'Disbursement ledger · PO-KHL-09',
          detail:
            'Posted tranche T3-KHL-09 vs approved window 2026-03-01–2026-03-14 · row refs L-88421–L-88427 · immutable audit hash attached. Model confidence 0.62 does not meet autonomous freeze threshold 0.85.',
        },
      ],
    },
    { delay: 400, type: 'escalate', presenterNote: 'STOP — first human gate. Explain confidence vs autonomy.' },
    { delay: 600, type: 'reason', text: 'Human reviewer approved continuation. Resuming workflow.', presenterNote: 'Acknowledge real accountability — not rubber-stamp.' },
    { delay: 200, type: 'task', id: 't6', state: 'done' },
    khAgent(600, 'a7', 'Agent 07 · Document Drafting.'),
    { delay: 400, type: 'tool', icon: ScrollText, label: 'compile_board_memo · sections=4 · charts=2 · ~3 pages' },
    { delay: 800, type: 'reason', text: 'Drafting memo. Structure: Executive summary → Findings → Root causes → Recommendations.' },
    { delay: 700, type: 'reason', text: 'Recommendation drafted: temporary repayment grace for affected borrowers (PO-KHL-04); full ledger audit (PO-KHL-09) before next disbursement.' },
    { delay: 200, type: 'task', id: 't7', state: 'done' },
    khAgent(400, 'a2', 'Agent 02 · M&E narrative alignment pass.'),
    { delay: 400, type: 'reason', text: 'M&E Report Generator cross-checks indicators vs narrative — PDO indicators cited consistently.', presenterNote: 'Links product demo to Exercise 2.' },
    { delay: 500, type: 'tool', icon: FileCheck, label: 'PKSF_Khulna_Q1-2026_Board_Memo.pdf · internal draft ready' },
    { delay: 400, type: 'humanMemoGate', presenterNote: 'Second human gate — external release (Module 4).' },
    khAgent(400, 'a9', 'Agent 09 · quick outlook — optional flourish.'),
    { delay: 500, type: 'reason', text: 'Programme Forecasting: baseline Q2 outlook assumes flood recovery path; stress scenario available if requested.', presenterNote: 'Close loop — forward view without automating decisions.' },
    { delay: 400, type: 'artifact', presenterNote: 'Reveal memo — point to audit strip.' },
  ];
}

function complianceScript() {
  return [
    { delay: 500, type: 'reason', text: 'Instruction received: investigate clustered disbursement anomalies in Rajshahi cluster · compliance-first scope.', presenterNote: 'Scenario B — compliance-led story arc.' },
    coAgent(600, 'a1'),
    { delay: 500, type: 'reason', text: 'Programme Intelligence routes to Compliance Sentinel as primary controller for this query type.' },
    { delay: 400, type: 'task', id: 'c1', state: 'active' },
    { delay: 300, type: 'task', id: 'c2', state: 'active' },
    { delay: 300, type: 'task', id: 'c3', state: 'active' },
    { delay: 300, type: 'task', id: 'c4', state: 'active' },
    coAgent(600, 'a8', 'Lead with Agent 08.'),
    { delay: 400, type: 'tool', icon: Lock, label: 'disbursement_rules_engine · cluster=RJH-Q1 → 4 hits' },
    { delay: 600, type: 'reason', text: 'Four POs show timing anomalies vs approved tranche calendar. Highest severity: PO-RJH-11.', sources: [{ id: 'rule', label: 'Rule engine · Tranche calendar', detail: 'Authorised tranche windows vs actual posting timestamps · immutable audit log.' }] },
    { delay: 200, type: 'task', id: 'c1', state: 'done' },
    coAgent(600, 'a6'),
    { delay: 400, type: 'tool', icon: Calculator, label: 'portfolio_link · exposure × anomaly score' },
    { delay: 600, type: 'reason', text: 'Loan Portfolio Monitor: stressed exposure on flagged routes exceeds comfort band — escalate recommended.', presenterNote: 'Hybrid rule + model — Module 4.' },
    { delay: 200, type: 'task', id: 'c2', state: 'done' },
    coAgent(600, 'a3'),
    { delay: 400, type: 'tool', icon: Database, label: 'po_profile · PO-RJH-11 · last 90d events' },
    { delay: 600, type: 'reason', text: 'PO Performance context: reporting cadence dropped in weeks aligned with anomaly spikes — correlation only, not causation.', sources: [{ id: 'po', label: 'PO event stream', detail: 'Submission history & officer assignment changes · operational metadata.' }] },
    { delay: 200, type: 'task', id: 'c3', state: 'done' },
    { delay: 400, type: 'escalate', presenterNote: 'Pause for human decision — same threshold pedagogy.' },
    { delay: 600, type: 'reason', text: 'Reviewer acknowledged: continue under enhanced monitoring — no disbursement freeze without secondary evidence.', presenterNote: 'Nuanced outcome — not binary.' },
    coAgent(600, 'a7'),
    { delay: 400, type: 'tool', icon: ScrollText, label: 'compile_compliance_bulletin · RJH-Q1 · confidential' },
    { delay: 600, type: 'reason', text: 'Drafting internal compliance bulletin with citations to ledger rows and rule IDs.', presenterNote: 'Transparency for audit.' },
    { delay: 200, type: 'task', id: 'c4', state: 'done' },
    { delay: 400, type: 'humanMemoGate', presenterNote: 'Release gate for internal restricted bulletin.' },
    { delay: 400, type: 'artifact', presenterNote: 'Show compliance artifact variant.' },
  ];
}

const KHULNA_TASKS = [
  { id: 't1', label: 'Pull PO records for Khulna · Q1 2026' },
  { id: 't2', label: 'Calculate loan portfolio health metrics' },
  { id: 't3', label: 'Compare each PO against regional baseline' },
  { id: 't4', label: 'Identify outliers (>1.5σ below mean)' },
  { id: 't5', label: 'Cross-reference with field reports for root cause' },
  { id: 't6', label: 'Run compliance check on flagged POs' },
  { id: 't7', label: 'Draft board briefing memo with recommendations' },
];

const COMPLIANCE_TASKS = [
  { id: 'c1', label: 'Run disbursement rules engine on Rajshahi cluster' },
  { id: 'c2', label: 'Join portfolio stress signals to flagged routes' },
  { id: 'c3', label: 'Pull PO operational context for top hit' },
  { id: 'c4', label: 'Draft confidential compliance bulletin with citations' },
];

export const SCENARIOS = {
  khulna: {
    key: 'khulna',
    label: 'Khulna Q1 regional review',
    escalation: {
      headline: 'PO-KHL-09',
      body:
        'Has a disbursement ledger entry that may exceed approved tranche limits. Confidence 0.62 — below the autonomous-act threshold of 0.85.',
      viewLedgerSourceId: 'ledger-khl09',
    },
    memoGate: {
      headline: 'Board briefing · external classification',
      body:
        'The memo contains operational detail suitable for leadership and donor-facing channels. Release requires an authorised programme sign-off.',
    },
    demoPrompt:
      'Generate a Q1 2026 performance review for our Khulna region partner organisations. Flag any POs with concerning loan portfolios, identify the root cause, and draft a board briefing memo with recommendations.',
    chatbotResponse: `To produce a performance review for Khulna region partner organisations, you would typically:

1. Collect Q1 2026 data from each partner organisation
2. Review KPIs: disbursement, repayment, beneficiary outreach
3. Identify organisations performing below regional targets
4. Investigate possible causes (operational, environmental, staffing)
5. Compile findings into a structured memo for the board

Would you like me to provide a template you could fill in?

Note: I don't have access to PKSF's actual data or systems, so I cannot perform the analysis or generate a real report on your behalf.`,
    tasks: KHULNA_TASKS,
    script: khulnaScript(),
    memoVariant: 'khulna',
    verdictDeliverable: 'Q1 2026 Khulna board briefing memo · 3 pages',
    decompositionHint: '7 sub-tasks',
  },
  compliance: {
    key: 'compliance',
    label: 'Rajshahi compliance sweep',
    escalation: {
      headline: 'PO-RJH-11',
      body:
        'Clustered postings cross tranche windows with medium model confidence 0.58. Policy requires human adjudication before any freeze or escalation to regulators.',
      viewLedgerSourceId: 'rule',
    },
    memoGate: {
      headline: 'Compliance bulletin · restricted circulation',
      body:
        'Contains ledger row IDs and rule citations. External sharing is blocked until risk committee acknowledgement.',
    },
    demoPrompt:
      'Investigate clustered disbursement anomalies in the Rajshahi cluster for Q1 2026. Prioritise compliance risk, cite ledger evidence, and produce a confidential internal bulletin for risk committee.',
    chatbotResponse: `I can outline a generic investigation checklist:

1. Define what counts as an "anomaly" in your organisation
2. Pull disbursement logs for the geography and period
3. Compare against policy thresholds
4. Summarise findings in a memo

I cannot access PKSF ledgers, rule engines, or produce an investigation grounded in your live data.`,
    tasks: COMPLIANCE_TASKS,
    script: complianceScript(),
    memoVariant: 'compliance',
    verdictDeliverable: 'Rajshahi Q1 compliance bulletin · confidential',
    decompositionHint: '4 sub-tasks',
  },
};
