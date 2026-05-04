/**
 * Per-agent glass-box content for workshop demo (orchestrator → specialist handoffs).
 * Spread onto `{ type: 'agent', id }` script steps in pksf_demo_scenarios.js.
 */

export const KHULNA_AGENT_GLASS = {
  a1: {
    freyaPrompt: `Programme Intelligence (Freya) · internal routing
Digest user intent: Q1 2026 Khulna partner-organisation review, portfolio signals, root-cause narrative, board-ready memo with recommendations.
Constraints: MIS + field tools only; compliance gate before any external release; no autonomous disbursement actions.`,
    reasoning: `Intent parse confidence 0.94. Geo locked to Khulna; period Q1-2026. Deliverable class = regional performance memo (not donor report). Decompose into 7 serialisable sub-tasks; parallelise data pulls only where dependencies allow (PO roster before KPIs; field narrative after outlier list).`,
    calculations: [
      { label: 'Required intent slots', expression: 'filled / total', value: '6 / 6' },
      { label: 'Projected specialist chain depth', expression: 'agents in critical path', value: '8' },
      { label: 'Policy gates in run', expression: 'escalation + memo release', value: '2' },
    ],
    output: `Published task graph: a3 → a6 → a4 → a5 → a8 → (human escalation) → a7 → a2 → a9 → artefact. PO-KHL-04 / PO-KHL-09 flagged early for narrative focus.`,
    outputData: {
      reportTitle: 'Orchestration Plan — Khulna Q1 2026',
      sections: [
        {
          type: 'metrics',
          items: [
            { label: 'Intent slots filled', value: '6 / 6', sub: 'All confirmed', color: 'mint' },
            { label: 'Specialists activated', value: '8', sub: 'Sequential chain', color: 'teal' },
            { label: 'Human approval gates', value: '2', sub: 'Required by policy', color: 'amber' },
          ],
        },
        {
          type: 'text',
          content: 'Scope confirmed: Khulna division · Q1 2026 · Partner organisation performance review → board-ready memo with recommendations.',
          variant: 'callout',
        },
        {
          type: 'flow',
          steps: [
            { label: 'Agent 03', sub: 'PO Roster', color: 'mint' },
            { label: 'Agent 06', sub: 'Portfolio', color: 'mint' },
            { label: 'Agent 04', sub: 'Field Data', color: 'mint' },
            { label: 'Agent 05', sub: 'Beneficiary', color: 'mint' },
            { label: 'Agent 08', sub: 'Compliance', color: 'amber' },
            { label: '⚠ Human Gate', sub: 'Escalation', color: 'amber' },
            { label: 'Agent 07', sub: 'Draft Memo', color: 'teal' },
            { label: 'Agent 02', sub: 'M&E Check', color: 'teal' },
            { label: 'Agent 09', sub: 'Forecast', color: 'teal' },
            { label: '✓ Artefact', sub: 'Released', color: 'mint' },
          ],
        },
      ],
    },
  },

  a3: {
    freyaPrompt: `Handoff to Agent 03 · PO Performance Monitor
Task T1: Pull canonical Khulna Q1-2026 PO roster from MIS core. Return stable PO identifiers, last submission timestamps, assigned field officer IDs. Flag reporting gaps >14 days.`,
    reasoning: `Denominator integrity before any KPI math — avoids mis-ranking merged or dormant PO shells. Prefer view \`po_quarterly\` (signed ETL) over raw extracts.`,
    calculations: [
      { label: 'Rows returned', expression: 'SELECT count(*)', value: '12' },
      { label: 'Null primary officer', expression: 'integrity check', value: '0' },
      { label: 'Stale reporting (>14d)', expression: 'max gap', value: '9 days' },
    ],
    output: `12 active PO records (KHL-01 … KHL-12) with MIS lineage IDs; no blocking data-quality errors.`,
    outputData: {
      reportTitle: 'PO Performance Roster — Khulna Q1 2026',
      sections: [
        {
          type: 'metrics',
          items: [
            { label: 'POs retrieved', value: '12', sub: 'Khulna Q1-2026', color: 'mint' },
            { label: 'Data quality issues', value: '0', sub: 'No blocking errors', color: 'mint' },
            { label: 'Max reporting gap', value: '9 days', sub: 'Limit: 14 days ✓', color: 'teal' },
          ],
        },
        {
          type: 'table',
          title: 'Khulna PO Roster — Q1 2026',
          headers: ['PO ID', 'Partner Organisation', 'Field Officer', 'Last Report', 'Status'],
          rows: [
            ['KHL-01', 'Padma Microfinance', 'A. Rahman', 'Mar 28', 'Active'],
            ['KHL-02', 'Bishwa Unnayan', 'S. Begum', 'Mar 25', 'Active'],
            ['KHL-03', 'Grameen Barta', 'M. Islam', 'Mar 27', 'Active'],
            ['KHL-04', 'Narikel MFI', 'J. Karim', 'Mar 22', 'Review'],
            ['KHL-05', 'Surovi Finance', 'R. Hossain', 'Mar 29', 'Active'],
            ['KHL-06', 'Rupali Credit', 'N. Akter', 'Mar 30', 'Active'],
            ['KHL-07', 'Brac Khulna', 'K. Sarker', 'Mar 26', 'Active'],
            ['KHL-08', 'Agrani Seba', 'M. Mia', 'Mar 24', 'Active'],
            ['KHL-09', 'Shapla Credit', 'T. Ali', 'Mar 19', 'Review'],
            ['KHL-10', 'Uttaran MFI', 'D. Roy', 'Mar 28', 'Active'],
            ['KHL-11', 'Probaho Finance', 'S. Sen', 'Mar 27', 'Active'],
            ['KHL-12', 'Agrani MFI', 'P. Das', 'Mar 31', 'Active'],
          ],
          highlightRows: [3, 8],
          statusCol: 4,
        },
      ],
    },
  },

  a6: {
    freyaPrompt: `Handoff to Agent 06 · Loan Portfolio Monitor
Tasks T2–T3: Compute Khulna weighted on-time repayment and PAR-30 vs rolling national baseline; run \`risk_model.score_portfolio_health\` for per-PO z-scores vs regional mean.`,
    reasoning: `Regional baseline first — absolute thresholds would over-penalise a stressed geography. σ uses pooled σ_regional (n=12) with winsorised tails.`,
    calculations: [
      { label: 'Regional on-time (weighted)', expression: 'Σ balance × on_time / Σ balance', value: '78.4%' },
      { label: 'PAR-30 (regional)', expression: 'par bucket / active loans', value: '4.1%' },
      { label: 'Outliers (|z| > 1.5)', expression: 'model output', value: '2 POs' },
    ],
    output: `PO-KHL-04 at −2.1σ and PO-KHL-09 at −1.7σ vs Khulna mean; both tagged for qualitative follow-up.`,
    outputData: {
      reportTitle: 'Loan Portfolio Health Report — Khulna Q1 2026',
      sections: [
        {
          type: 'metrics',
          items: [
            { label: 'Regional on-time repayment', value: '78.4%', sub: 'Weighted avg · Q1 2026', color: 'teal' },
            { label: 'Portfolio-at-risk (PAR-30)', value: '4.1%', sub: 'Regional aggregate', color: 'teal' },
            { label: 'Statistical outliers', value: '2 POs', sub: '|z-score| > 1.5σ', color: 'amber' },
          ],
        },
        {
          type: 'bar-chart',
          title: 'On-time repayment by PO — Khulna Q1 2026',
          baseline: { value: 78.4, label: 'Regional avg 78.4%' },
          bars: [
            { label: 'KHL-01', value: 91, color: 'mint' },
            { label: 'KHL-02', value: 88, color: 'mint' },
            { label: 'KHL-03', value: 85, color: 'mint' },
            { label: 'KHL-04', value: 47, color: 'red', note: '−2.1σ ⚠' },
            { label: 'KHL-05', value: 83, color: 'mint' },
            { label: 'KHL-06', value: 79, color: 'teal' },
            { label: 'KHL-07', value: 82, color: 'mint' },
            { label: 'KHL-08', value: 76, color: 'teal' },
            { label: 'KHL-09', value: 54, color: 'amber', note: '−1.7σ ⚠' },
            { label: 'KHL-10', value: 80, color: 'mint' },
            { label: 'KHL-11', value: 78, color: 'teal' },
            { label: 'KHL-12', value: 86, color: 'mint' },
          ],
        },
        {
          type: 'text',
          content: 'KHL-04 and KHL-09 fall significantly below the regional mean. Both POs are located in flood-affected sub-districts — field data analysis is next in the pipeline.',
          variant: 'warning',
        },
      ],
    },
  },

  a4: {
    freyaPrompt: `Handoff to Agent 04 · Field Data Analyst
Task T5: Pull digitised officer logs and visit notes for PO-KHL-04 and PO-KHL-09 (last 90d). Summarise environmental vs operational hypotheses with citations.`,
    reasoning: `Keyword + geo overlap on March 2026 flood polygons; treat correlation spikes as hypothesis-only in memo language.`,
    calculations: [
      { label: 'Reports retrieved', expression: 'indexed hits', value: '8' },
      { label: 'Flood-affected unions (overlap)', expression: 'spatial join', value: '3' },
      { label: 'Borrowers income shock (est.)', expression: 'cohort proxy', value: '~340' },
    ],
    output: `Narrative: Q1 dip largely environmental (flooding) for KHL-04; KHL-09 mixed signals pending ledger audit.`,
    outputData: {
      reportTitle: 'Field Data Synthesis — PO-KHL-04 & KHL-09',
      sections: [
        {
          type: 'metrics',
          items: [
            { label: 'Field reports reviewed', value: '8', sub: 'PO-KHL-04 & KHL-09', color: 'teal' },
            { label: 'Flood-affected unions', value: '3', sub: 'Spatial overlap confirmed', color: 'amber' },
            { label: 'Borrowers income-shocked', value: '~340', sub: 'Estimated (cohort proxy)', color: 'amber' },
          ],
        },
        {
          type: 'text',
          content: '📋 Field Officer Log · PO-KHL-04 · March 2026\n"Significant flooding in Dumuria, Batiaghata, and Dacope sub-districts. Approximately 340 borrowers experienced temporary income disruption due to livestock and paddy crop losses. Group meetings suspended for 3 weeks."',
          variant: 'callout',
        },
        {
          type: 'findings',
          items: [
            { label: 'KHL-04 root cause', value: 'Environmental (flooding)', status: 'info' },
            { label: 'Recommended action', value: 'Temporary repayment grace window', status: 'pass' },
            { label: 'KHL-09 root cause', value: 'Mixed signals — pending compliance audit', status: 'warn' },
            { label: 'Management failure?', value: 'Not indicated for KHL-04', status: 'pass' },
          ],
        },
      ],
    },
  },

  a5: {
    freyaPrompt: `Handoff to Agent 05 · Beneficiary Analytics
Cross-check income cohort stress in unions overlapping KHL-04 flood footprint; bounded query — no national scan.`,
    reasoning: `Keeps demo latency low; aligns quantitative stress with field logs before compliance audit narrative.`,
    calculations: [
      { label: 'Cohort size', expression: 'active borrowers in footprint', value: '≈4.2k' },
      { label: 'Mean income delta vs Q4-2025', expression: 'cohort avg', value: '−12%' },
      { label: 'Expected recovery half-life', expression: 'seasonal model', value: '8–10 wk' },
    ],
    output: `Quant support for temporary repayment grace recommendation in flood-affected corridor.`,
    outputData: {
      reportTitle: 'Beneficiary Impact Assessment — Flood Corridor',
      sections: [
        {
          type: 'metrics',
          items: [
            { label: 'Active borrowers in footprint', value: '≈4,200', sub: 'KHL-04 flood corridor', color: 'teal' },
            { label: 'Mean income delta', value: '−12%', sub: 'vs Q4 2025 baseline', color: 'amber' },
            { label: 'Est. recovery period', value: '8–10 wk', sub: 'Seasonal model', color: 'mint' },
          ],
        },
        {
          type: 'bar-chart',
          title: 'Borrower income cohort distribution — flood-affected unions',
          bars: [
            { label: '< 5k BDT/mo', value: 28, color: 'amber', note: '28%' },
            { label: '5–10k BDT/mo', value: 41, color: 'teal', note: '41%' },
            { label: '10–20k BDT/mo', value: 22, color: 'mint', note: '22%' },
            { label: '> 20k BDT/mo', value: 9, color: 'mint', note: '9%' },
          ],
        },
        {
          type: 'text',
          content: 'Cohort stress is consistent with the environmental disruption narrative from field data. Income recovery aligns with seasonal patterns — supporting a time-limited grace window, not permanent write-off.',
          variant: 'callout',
        },
      ],
    },
  },

  a8: {
    freyaPrompt: `Handoff to Agent 08 · Compliance & Risk Sentinel
Audit disbursements for PO-KHL-09 only: compare posted tranche T3-KHL-09 timestamps vs approved calendar window. Return rule citations + model confidence; no autonomous freeze.`,
    reasoning: `Policy HY-2: autonomous act only if confidence ≥ 0.85 on disbursement anomaly class. Here 0.62 → mandatory human gate.`,
    calculations: [
      { label: 'Ledger rows in window conflict', expression: 'rule R-DISB-12', value: '7 rows' },
      { label: 'Model confidence', expression: 'calibrated prob', value: '0.62' },
      { label: 'Autonomy threshold', expression: 'policy constant', value: '0.85' },
    ],
    output: `Escalation packet prepared; workflow paused until human acknowledgement (simulated).`,
    outputData: {
      reportTitle: 'Compliance Audit Report — PO-KHL-09',
      sections: [
        {
          type: 'alert',
          severity: 'warning',
          title: 'Human Escalation Required',
          text: 'Disbursement anomaly detected for PO-KHL-09. Model confidence (0.62) is below the autonomous action threshold (0.85). A human reviewer must decide before workflow continues.',
        },
        {
          type: 'metrics',
          items: [
            { label: 'Ledger rows in conflict', value: '7', sub: 'Rule R-DISB-12', color: 'red' },
            { label: 'Model confidence', value: '0.62', sub: 'Calibrated probability', color: 'amber' },
            { label: 'Autonomy threshold', value: '0.85', sub: 'Policy HY-2 constant', color: 'teal' },
          ],
        },
        {
          type: 'table',
          title: 'Flagged ledger rows — PO-KHL-09 Tranche T3',
          headers: ['Ledger Row', 'Posted Date', 'Approved Window', 'Status', 'Rule'],
          rows: [
            ['L-88421', '16 Mar 2026', '01–14 Mar', 'Outside window', 'R-DISB-12'],
            ['L-88422', '16 Mar 2026', '01–14 Mar', 'Outside window', 'R-DISB-12'],
            ['L-88423', '17 Mar 2026', '01–14 Mar', 'Outside window', 'R-DISB-12'],
            ['L-88424–427', '18–19 Mar', '01–14 Mar', 'Outside window', 'R-DISB-12'],
          ],
          highlightRows: [0, 1, 2, 3],
          statusCol: 3,
        },
      ],
    },
  },

  a7: {
    freyaPrompt: `Handoff to Agent 07 · Document Drafting
Compose board briefing: executive summary, findings, root causes (environmental framing where evidence supports), recommendations — grace window KHL-04; full ledger audit KHL-09 prior to next disbursement.`,
    reasoning: `Template CORP-MEMO-2026; inline citations to MIS IDs and field bundle hashes; external classification = gated.`,
    calculations: [
      { label: 'Sections', expression: 'template slots', value: '4' },
      { label: 'Charts / tables', expression: 'auto from MIS', value: '2' },
      { label: 'Est. pages', expression: 'layout engine', value: '~3' },
    ],
    output: `Internal draft \`PKSF_Khulna_Q1-2026_Board_Memo.pdf\` ready — release still blocked by human memo gate.`,
    outputData: {
      reportTitle: 'Board Memorandum Draft — PKSF/PI/KHL/Q1-2026',
      sections: [
        {
          type: 'memo',
          to: 'PKSF Board of Directors',
          from: 'AI-Assisted Programme Intelligence Unit',
          date: '2 April 2026',
          ref: 'PKSF/PI/KHL/Q1-2026/BM-007',
          subject: 'Khulna Region Q1 2026 — Partner Organisation Performance Review & Recommendations',
          classification: 'INTERNAL — BOARD USE ONLY',
          sections: [
            {
              heading: '1. Executive Summary',
              body: 'Twelve partner organisations operated in Khulna division during Q1 2026. Regional weighted on-time repayment stands at 78.4%. Two POs require targeted attention: KHL-04 due to environmental disruption, and KHL-09 due to a pending compliance inquiry.',
            },
            {
              heading: '2. Key Findings',
              body: 'KHL-04 scored −2.1σ below the regional mean. Field data confirms flooding across 3 unions affected ~340 borrowers.\nKHL-09 scored −1.7σ below mean. A compliance review flagged 7 ledger rows potentially outside the approved disbursement window (model confidence 0.62).',
            },
            {
              heading: '3. Root Cause Analysis',
              body: 'KHL-04 performance decline is attributed to the March 2026 seasonal floods — an environmental event, not a management failure. KHL-09 shows overlapping environmental and potential process compliance factors pending full audit.',
            },
            {
              heading: '4. Recommendations',
              body: '① Grant KHL-04 a 90-day repayment grace window for ~340 affected borrowers in flood zones.\n② Initiate full ledger audit for KHL-09 tranche T3 prior to next disbursement approval.\n③ Review field reporting timelines across all Khulna POs ahead of Q2.',
            },
          ],
        },
        {
          type: 'text',
          content: '📎  Draft · 3 pages · 2 auto-generated charts · Release blocked pending Human Memo Gate approval.',
          variant: 'warning',
        },
      ],
    },
  },

  a2: {
    freyaPrompt: `Handoff to Agent 02 · M&E Report Generator
PDO indicator alignment pass: every numeric claim in draft memo must match MIS indicator table for same period (tolerance ±2%).`,
    reasoning: `Prevents donor / board Q&A on inconsistent KPIs; cheap pass relative to full re-run of analytics.`,
    calculations: [
      { label: 'Numeric checks', expression: 'claims traced', value: '14' },
      { label: 'Mismatches', expression: '|delta| > 2%', value: '0' },
      { label: 'Max drift observed', expression: 'largest delta', value: '0.4%' },
    ],
    output: `Narrative cleared for PDO consistency; still subject to external release approval.`,
    outputData: {
      reportTitle: 'M&E Indicator Consistency Check — Q1 2026',
      sections: [
        {
          type: 'metrics',
          items: [
            { label: 'Numeric claims verified', value: '14', sub: 'Against MIS indicators', color: 'teal' },
            { label: 'Mismatches found', value: '0', sub: 'Within ±2% tolerance', color: 'mint' },
            { label: 'Max drift observed', value: '0.4%', sub: 'Well within tolerance', color: 'mint' },
          ],
        },
        {
          type: 'checklist',
          title: 'PDO Indicator Consistency Check',
          items: [
            { label: 'Regional on-time repayment (78.4%)', status: 'pass' },
            { label: 'Portfolio-at-risk PAR-30 (4.1%)', status: 'pass' },
            { label: 'KHL-04 z-score (−2.1σ)', status: 'pass' },
            { label: 'KHL-09 z-score (−1.7σ)', status: 'pass' },
            { label: 'Borrowers income-shocked (~340)', status: 'pass' },
            { label: 'Cohort size in flood footprint (~4,200)', status: 'pass' },
            { label: 'PDO Indicator 3 — portfolio quality', status: 'pass' },
            { label: 'PDO Indicator 7 — active borrower count', status: 'pass' },
            { label: 'Compliance escalation framing', status: 'pass' },
          ],
        },
        {
          type: 'text',
          content: 'All 14 numeric claims in the draft memo are traceable to signed MIS extracts. Memo is cleared for PDO consistency and ready for release — subject to Human Memo Gate approval.',
          variant: 'callout',
        },
      ],
    },
  },

  a9: {
    freyaPrompt: `Handoff to Agent 09 · Programme Forecasting
One-paragraph Q2 baseline outlook assuming normalised rainfall; stress scenario off for workshop brevity — no pricing or disbursement automation.`,
    reasoning: `Forward view for appendix only; must not imply autonomous scheduling of tranches.`,
    calculations: [
      { label: 'Implied on-time recovery QoQ', expression: 'baseline only', value: '+6 pp (indicative)' },
      { label: 'Stress branch', expression: 'user toggle', value: 'skipped' },
    ],
    output: `Short forward-looking paragraph appended to memo appendix for leadership context.`,
    outputData: {
      reportTitle: 'Q2 2026 Programme Forecast — Khulna',
      sections: [
        {
          type: 'metrics',
          items: [
            { label: 'Q2 2026 baseline recovery', value: '+6 pp', sub: 'On-time repayment QoQ', color: 'mint' },
            { label: 'Forecast horizon', value: 'Q2 2026', sub: 'Apr – Jun 2026', color: 'teal' },
            { label: 'Stress scenario', value: 'Not run', sub: 'Workshop brevity', color: 'textMute' },
          ],
        },
        {
          type: 'forecast-chart',
          title: 'Khulna on-time repayment — quarterly trend & Q2 outlook',
          points: [
            { label: 'Q3 2025', value: 82, type: 'actual' },
            { label: 'Q4 2025', value: 83, type: 'actual' },
            { label: 'Q1 2026', value: 78, type: 'actual' },
            { label: 'Q2 2026', value: 84, type: 'forecast' },
          ],
        },
        {
          type: 'text',
          content: 'Baseline assumes normal Q2 rainfall and activation of the KHL-04 grace window. KHL-04 borrowers are projected to return to full repayment within 8–10 weeks. KHL-09 outlook remains conditional on the outcome of the ledger audit.',
          variant: 'normal',
        },
      ],
    },
  },
};

export const COMPLIANCE_AGENT_GLASS = {
  a1: {
    freyaPrompt: `Programme Intelligence (Freya) · compliance-first routing
User intent: Rajshahi cluster Q1 disbursement anomalies; prioritise compliance risk; cite ledger evidence; confidential bulletin for risk committee.`,
    reasoning: `Route primary controller to Agent 08 first; portfolio stress join second; PO operational context third; document last. Four-task decomposition with two human gates (escalation + restricted release).`,
    calculations: [
      { label: 'Cluster scope', expression: 'geo=Rajshahi Q1', value: 'RJH-Q1' },
      { label: 'Primary controller', expression: 'routing weight', value: 'a8 (1.0)' },
    ],
    output: `Task graph: a8 → a6 → a3 → (escalation) → a7 → artefact (compliance variant).`,
    outputData: {
      reportTitle: 'Orchestration Plan — Rajshahi Compliance',
      sections: [
        {
          type: 'metrics',
          items: [
            { label: 'Cluster scope', value: 'Rajshahi · Q1', sub: 'Compliance-first routing', color: 'amber' },
            { label: 'Primary specialist', value: 'Agent 08', sub: 'Compliance Sentinel', color: 'red' },
            { label: 'Human gates', value: '2', sub: 'Escalation + release', color: 'amber' },
          ],
        },
        {
          type: 'flow',
          steps: [
            { label: 'Agent 08', sub: 'Compliance', color: 'red' },
            { label: 'Agent 06', sub: 'Portfolio', color: 'amber' },
            { label: 'Agent 03', sub: 'PO Context', color: 'teal' },
            { label: '⚠ Human Gate', sub: 'Escalation', color: 'amber' },
            { label: 'Agent 07', sub: 'Bulletin', color: 'teal' },
            { label: '🔒 Artefact', sub: 'Restricted', color: 'red' },
          ],
        },
      ],
    },
  },
  a8: {
    freyaPrompt: `Handoff to Agent 08 · Compliance Sentinel
Run \`disbursement_rules_engine\` on cluster RJH-Q1; return PO-level hits with rule IDs and ledger row references.`,
    reasoning: `Immutable calendar vs posting timestamps — deterministic explainability for committee.`,
    calculations: [
      { label: 'Rule hits', expression: 'R-DISB family', value: '4 POs' },
      { label: 'Top severity PO', expression: 'weighted score', value: 'PO-RJH-11' },
    ],
    output: `Structured hit list with citations ready for portfolio join.`,
    outputData: {
      reportTitle: 'Compliance Anomaly Report — RJH-Q1',
      sections: [
        {
          type: 'alert',
          severity: 'error',
          title: 'Compliance Anomalies Detected — Rajshahi Cluster',
          text: '4 partner organisations show disbursement timing anomalies against the approved tranche calendar. Highest severity: PO-RJH-11.',
        },
        {
          type: 'metrics',
          items: [
            { label: 'POs with rule hits', value: '4', sub: 'Rajshahi Q1', color: 'red' },
            { label: 'Highest severity PO', value: 'RJH-11', sub: 'Weighted risk score', color: 'red' },
            { label: 'Rule family', value: 'R-DISB', sub: 'Tranche calendar rules', color: 'amber' },
          ],
        },
        {
          type: 'table',
          title: 'Compliance Rule Hits — RJH-Q1',
          headers: ['PO ID', 'Hits', 'Severity', 'Primary Rule'],
          rows: [
            ['PO-RJH-11', '5', 'High', 'R-DISB-12'],
            ['PO-RJH-04', '3', 'Medium', 'R-DISB-08'],
            ['PO-RJH-07', '2', 'Medium', 'R-DISB-12'],
            ['PO-RJH-02', '1', 'Low', 'R-DISB-03'],
          ],
          highlightRows: [0],
          statusCol: 2,
        },
      ],
    },
  },
  a6: {
    freyaPrompt: `Handoff to Agent 06 · Loan Portfolio Monitor
Join exposure-at-risk to anomaly scores on flagged routes; surface comfort-band breaches.`,
    reasoning: `Hybrid signal: rules flag timing; model flags concentration — both needed for proportionate escalation language.`,
    calculations: [
      { label: 'Routes above comfort band', expression: 'internal limit', value: '2' },
      { label: 'Escalation recommendation', expression: 'policy matrix', value: 'yes (advisory)' },
    ],
    output: `Stressed exposure narrative attached to same PO-RJH-11 focus.`,
    outputData: {
      reportTitle: 'Portfolio Risk Overlay — RJH-Q1',
      sections: [
        {
          type: 'metrics',
          items: [
            { label: 'Routes above comfort band', value: '2', sub: 'Internal limit breached', color: 'red' },
            { label: 'Escalation recommended', value: 'Yes', sub: 'Policy matrix · advisory', color: 'amber' },
          ],
        },
        {
          type: 'text',
          content: 'PO-RJH-11 shows concentrated exposure. Rule-based timing flag combined with portfolio stress signal warrants proportionate escalation — human review required before any action.',
          variant: 'warning',
        },
      ],
    },
  },
  a3: {
    freyaPrompt: `Handoff to Agent 03 · PO Performance Monitor
Pull PO-RJH-11 operational metadata: reporting cadence, staffing changes — correlation context only.`,
    reasoning: `Explicitly label correlation ≠ causation for committee defensibility.`,
    calculations: [
      { label: 'Cadence dip weeks', expression: '90d window', value: 'aligned w/ spikes' },
      { label: 'Causation claim', expression: 'blocked', value: 'not asserted' },
    ],
    output: `Context paragraph for bulletin without over-claiming.`,
    outputData: {
      reportTitle: 'PO Operational Context — PO-RJH-11',
      sections: [
        {
          type: 'findings',
          items: [
            { label: 'Reporting cadence', value: 'Dip aligned with anomaly weeks', status: 'warn' },
            { label: 'Staffing changes noted', value: 'Field officer reassignment Q1', status: 'warn' },
            { label: 'Causation asserted', value: 'No — correlation only', status: 'pass' },
          ],
        },
        {
          type: 'text',
          content: 'Operational context provided for committee without asserting causation. This framing preserves defensibility if challenged.',
          variant: 'callout',
        },
      ],
    },
  },
  a7: {
    freyaPrompt: `Handoff to Agent 07 · Document Drafting
Compile confidential RJH-Q1 compliance bulletin with ledger row IDs + rule citations; circulation restricted.`,
    reasoning: `Auto-redact external channels until risk committee acknowledgement (simulated memo gate).`,
    calculations: [
      { label: 'Citations generated', expression: 'rows + rules', value: 'auto' },
      { label: 'Classification', expression: 'DLP scan', value: 'RESTRICTED' },
    ],
    output: `Internal bulletin draft ready — compliance artefact variant.`,
    outputData: {
      reportTitle: 'Compliance Bulletin Draft — PKSF/COMP/RJH',
      sections: [
        {
          type: 'memo',
          to: 'PKSF Risk Committee',
          from: 'AI-Assisted Compliance Sentinel Unit',
          date: '2 April 2026',
          ref: 'PKSF/COMP/RJH/Q1-2026/CB-003',
          subject: 'Rajshahi Cluster Q1 2026 — Disbursement Compliance Bulletin',
          classification: '🔒 RESTRICTED — RISK COMMITTEE ONLY',
          sections: [
            {
              heading: 'Compliance Findings',
              body: 'Four POs in the Rajshahi cluster show disbursement timing anomalies against approved tranche calendars. PO-RJH-11 is the highest-severity case with 5 rule hits under R-DISB-12.',
            },
            {
              heading: 'Portfolio Risk Overlay',
              body: 'Loan Portfolio Monitor confirms stressed exposure on PO-RJH-11 routes exceeds the internal comfort band. Combined rule + model signal warrants enhanced monitoring.',
            },
            {
              heading: 'Recommended Actions',
              body: '① Place PO-RJH-11 under enhanced monitoring — no disbursement freeze without secondary evidence.\n② Risk Committee to acknowledge and confirm continuation under monitoring.\n③ Full audit to commence within 5 working days.',
            },
          ],
        },
        {
          type: 'text',
          content: '🔒  Bulletin classified RESTRICTED · Auto-redacted for external channels · Release requires Risk Committee acknowledgement.',
          variant: 'warning',
        },
      ],
    },
  },
};
