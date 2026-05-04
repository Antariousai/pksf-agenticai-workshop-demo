/**
 * Source document data per agent — Google Workspace references.
 * Kept in a separate .js file so pksf_agent_drawer_panels.jsx
 * only exports React components (required for Vite Fast Refresh).
 */

export const GOOGLE_SERVICE = {
  excel:    { name: 'Google Sheets', base: 'https://docs.google.com/spreadsheets/d/', suffix: '/edit?usp=sharing' },
  word:     { name: 'Google Docs',   base: 'https://docs.google.com/document/d/',    suffix: '/edit?usp=sharing' },
  pdf:      { name: 'Google Drive',  base: 'https://drive.google.com/file/d/',       suffix: '/view?usp=sharing'  },
  database: null,
};

export const AGENT_SOURCES = {
  a3: [
    {
      id: 'mis-po', label: 'MIS_PO_Quarterly_KHL_Q1-2026.xlsx', type: 'excel', size: '42 KB',
      description: 'Official PO roster with Q1 2026 submission timestamps',
      driveId: '1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1u',
      preview: {
        type: 'table',
        headers: ['PO ID', 'Partner Name', 'MIS ID', 'Last Report', 'Field Officer', 'Status'],
        rows: [
          ['KHL-01', 'Padma Microfinance', 'MIS-KH-101', '28 Mar 2026', 'FO-221', 'Active'],
          ['KHL-02', 'Bishwa Unnayan', 'MIS-KH-102', '25 Mar 2026', 'FO-218', 'Active'],
          ['KHL-03', 'Grameen Barta', 'MIS-KH-103', '27 Mar 2026', 'FO-219', 'Active'],
          ['KHL-04', 'Narikel MFI', 'MIS-KH-104', '22 Mar 2026', 'FO-211', 'Review'],
          ['KHL-05', 'Surovi Finance', 'MIS-KH-105', '29 Mar 2026', 'FO-224', 'Active'],
          ['KHL-09', 'Shapla Credit', 'MIS-KH-109', '19 Mar 2026', 'FO-208', 'Review'],
          ['KHL-12', 'Agrani MFI', 'MIS-KH-112', '31 Mar 2026', 'FO-230', 'Active'],
        ],
      },
    },
    {
      id: 'po-reg', label: 'Partner_Registry_2026.xlsx', type: 'excel', size: '18 KB',
      description: 'PKSF partner organisation registration database',
      driveId: '2bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU2v',
      preview: {
        type: 'table',
        headers: ['MIS ID', 'Registration Date', 'Category', 'Active Loans', 'District'],
        rows: [
          ['MIS-KH-101', '2018-06-12', 'Category A', '3,241', 'Khulna City'],
          ['MIS-KH-104', '2016-03-08', 'Category B', '2,108', 'Dumuria'],
          ['MIS-KH-109', '2017-11-22', 'Category B', '1,875', 'Dacope'],
        ],
      },
    },
  ],
  a6: [
    {
      id: 'loan-port', label: 'Loan_Portfolio_KHL_Q1-2026.xlsx', type: 'excel', size: '128 KB',
      description: 'Full loan portfolio extract with repayment KPIs',
      driveId: '3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3w',
      preview: {
        type: 'table',
        headers: ['PO ID', 'Active Loans', 'On-Time %', 'PAR-30', 'Balance (Cr BDT)', 'Z-Score'],
        rows: [
          ['KHL-01', '3,241', '91%', '1.2%', '4.8', '+1.2σ'],
          ['KHL-02', '2,876', '88%', '1.5%', '3.9', '+0.9σ'],
          ['KHL-04', '2,108', '47%', '9.8%', '3.1', '−2.1σ ⚠'],
          ['KHL-09', '1,875', '54%', '7.3%', '2.6', '−1.7σ ⚠'],
          ['KHL-12', '2,113', '86%', '1.8%', '3.4', '+0.7σ'],
        ],
      },
    },
    {
      id: 'risk-out', label: 'Risk_Model_Score_Q1-2026.pdf', type: 'pdf', size: '86 KB',
      description: 'Statistical portfolio risk model Z-scores output',
      driveId: '4dE5fG6hI7jK8lM9nO0pQ1rS2tU3vW4x',
      preview: {
        type: 'document', title: 'Risk Model Score Report — Khulna Q1 2026',
        sections: [
          { heading: 'Model Methodology', body: 'Pooled regional Z-score model with winsorised tails (5th–95th percentile). Regional baseline n=12 POs. Outlier threshold: |Z| > 1.5σ.' },
          { heading: 'Outliers Identified', body: 'PO-KHL-04: Z = −2.1σ (on-time 47.2% vs regional 78.4%)\nPO-KHL-09: Z = −1.7σ (on-time 53.8% vs regional 78.4%)' },
          { heading: 'Model Confidence (KHL-09)', body: 'Calibrated probability for disbursement anomaly: 0.62. Below autonomous action threshold (0.85). Human gate required per policy HY-2.' },
        ],
      },
    },
  ],
  a4: [
    {
      id: 'field-rep', label: 'Field_Reports_KHL04_KHL09_Q1-2026.pdf', type: 'pdf', size: '2.1 MB',
      description: 'Digitised field officer visit logs — last 90 days',
      driveId: '5eF6gH7iJ8kL9mN0oP1qR2sT3uV4wX5y',
      preview: {
        type: 'document', title: 'Field Investigation Report Bundle',
        sections: [
          { heading: 'PO-KHL-04 · Field Officer: J. Karim · March 2026', body: '"Significant flooding in Dumuria, Batiaghata, and Dacope sub-districts from 8 March 2026. Approximately 340 borrowers in 3 unions reported temporary income disruption. Group meetings suspended 8–28 March. Environmental root cause confirmed — no management failure noted."' },
          { heading: 'PO-KHL-09 · Field Officer: T. Ali · March 2026', body: '"Partial flooding overlap in Dacope sub-district. 80–90 borrowers affected. Disbursement scheduling concerns noted separately by compliance team — see ledger review. Environmental and operational factors may overlap."' },
        ],
      },
    },
    {
      id: 'flood-map', label: 'Flood_Impact_Assessment_KHL_Mar2026.pdf', type: 'pdf', size: '3.8 MB',
      description: 'Flood polygon data with union-level impact zones',
      driveId: '6fG7hI8jK9lM0nO1pQ2rS3tU4vW5xY6z',
      preview: {
        type: 'document', title: 'Khulna Division Flood Impact Assessment — March 2026',
        sections: [
          { heading: 'Affected Unions', body: 'Dumuria Sadar, Batiaghata, Dacope, Kaliganj. Total 12 unions. Inundation depth: 30–90 cm for 14–21 days.' },
          { heading: 'PO Footprint Overlap', body: 'PO-KHL-04: 3 of 12 affected unions (Dumuria, Batiaghata, Dacope).\nPO-KHL-09: 1 affected union (Dacope — partial overlap only).' },
        ],
      },
    },
  ],
  a5: [
    {
      id: 'bene-inc', label: 'Beneficiary_Income_Cohort_KHL_Q1-2026.xlsx', type: 'excel', size: '67 KB',
      description: 'Active borrower income cohorts — flood-affected unions',
      driveId: '7gH8iJ9kL0mN1oP2qR3sT4uV5wX6yZ7a',
      preview: {
        type: 'table',
        headers: ['Union', 'Active Borrowers', 'Avg Income (BDT/mo)', 'Delta vs Q4 2025', 'Stress Level'],
        rows: [
          ['Dumuria Sadar', '1,240', '8,200', '−18%', 'High'],
          ['Batiaghata', '890', '7,600', '−14%', 'High'],
          ['Dacope', '1,210', '8,900', '−10%', 'Moderate'],
          ['Kaliganj', '860', '9,100', '−6%', 'Low'],
        ],
      },
    },
  ],
  a8: [
    {
      id: 'ledger', label: 'Disbursement_Ledger_KHL09_T3.xlsx', type: 'excel', size: '34 KB',
      description: 'Tranche T3 disbursement ledger — immutable audit extract',
      driveId: '8hI9jK0lM1nO2pQ3rS4tU5vW6xY7zA8b',
      preview: {
        type: 'table',
        headers: ['Ledger Row', 'Amount (BDT)', 'Posted Date', 'Approved Window', 'Days Outside', 'Rule'],
        rows: [
          ['L-88421', '12,50,000', '16 Mar 2026', '01–14 Mar', '+2 days', 'R-DISB-12'],
          ['L-88422', '8,75,000', '16 Mar 2026', '01–14 Mar', '+2 days', 'R-DISB-12'],
          ['L-88423', '11,00,000', '17 Mar 2026', '01–14 Mar', '+3 days', 'R-DISB-12'],
          ['L-88424', '9,50,000', '18 Mar 2026', '01–14 Mar', '+4 days', 'R-DISB-12'],
          ['L-88425–427', '~30,75,000', '19 Mar 2026', '01–14 Mar', '+5 days', 'R-DISB-12'],
        ],
      },
    },
    {
      id: 'audit-log', label: 'Audit_Trail_T3-KHL09_Signed.pdf', type: 'pdf', size: '44 KB',
      description: 'Immutable audit hash log for compliance review',
      driveId: '9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8aB9c',
      preview: {
        type: 'document', title: 'Audit Trail Log — T3-KHL-09',
        sections: [
          { heading: 'Audit Hash (SHA-256)', body: '3f9a8c2e1b7d4f6a0e5c9b3d8f2a1c7e\nTimestamp: 2026-03-31T23:59:59Z (immutable)' },
          { heading: 'Rule Reference', body: 'R-DISB-12: Disbursements must post within the approved tranche calendar window. Approved window T3-KHL-09: 1–14 March 2026. All 7 rows fall outside this window.' },
          { heading: 'Compliance Status', body: 'Model confidence 0.62. Does not meet autonomous freeze threshold (0.85). Escalated to human reviewer per policy HY-2.' },
        ],
      },
    },
  ],
  a7: [
    {
      id: 'memo-draft', label: 'PKSF_Khulna_Q1-2026_Board_Memo_DRAFT.docx', type: 'word', size: '156 KB',
      description: 'Draft board memorandum — pending human gate approval',
      driveId: '0jK1lM2nO3pQ4rS5tU6vW7xY8zA9bC0d',
      preview: {
        type: 'document', title: 'PKSF Board Memorandum — DRAFT',
        sections: [
          { heading: 'Status', body: '⚠ DRAFT — Pending Human Memo Gate Approval\nRef: PKSF/PI/KHL/Q1-2026/BM-007 · Date: 2 April 2026' },
          { heading: 'Contents', body: '3-page board briefing. Sections: Executive Summary, Key Findings, Root Cause Analysis, Recommendations. Auto-generated from MIS + Field + Compliance pipeline.' },
          { heading: 'Recommendations (Summary)', body: '① 90-day repayment grace · ~340 borrowers · KHL-04 flood corridor\n② Full ledger audit · KHL-09 T3 · before next disbursement\n③ Review field reporting timelines · all Khulna POs · Q2 prep' },
        ],
      },
    },
    {
      id: 'memo-tmpl', label: 'CORP-MEMO-2026_Template.docx', type: 'word', size: '28 KB',
      description: 'PKSF corporate memorandum template 2026',
      driveId: '1kL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1e',
      preview: {
        type: 'document', title: 'Corporate Memorandum Template 2026',
        sections: [
          { heading: 'Version', body: 'CORP-MEMO-2026 · Approved by Corporate Secretariat 1 January 2026' },
          { heading: 'Structure', body: 'Classification Banner → To/From/Date/Ref → Subject → Body (max 4 sections) → Recommendations → Signatures' },
        ],
      },
    },
  ],
  a2: [
    {
      id: 'pdo-ind', label: 'PDO_Indicator_Table_Q1-2026.xlsx', type: 'excel', size: '52 KB',
      description: 'PDO indicators cross-verified against MIS source values',
      driveId: '2lM3nO4pQ5rS6tU7vW8xY9zA0bC1dE2f',
      preview: {
        type: 'table',
        headers: ['Indicator', 'PDO Value', 'MIS Value', 'Delta', 'Pass'],
        rows: [
          ['Repayment Rate', '78.4%', '78.4%', '0.0%', 'Yes ✓'],
          ['PAR-30', '4.1%', '4.0%', '+0.1%', 'Yes ✓'],
          ['KHL-04 Z-Score', '−2.1σ', '−2.13σ', '+0.03', 'Yes ✓'],
          ['KHL-09 Z-Score', '−1.7σ', '−1.72σ', '+0.02', 'Yes ✓'],
          ['Borrowers Affected', '340', '338', '+2', 'Yes ✓'],
          ['Cohort Size', '~4,200', '4,183', '+17', 'Yes ✓'],
          ['PDO-3 Portfolio Quality', '78.4%', '78.4%', '0.0%', 'Yes ✓'],
        ],
      },
    },
  ],
  a9: [
    {
      id: 'forecast', label: 'Forecast_Model_Q2-2026_Khulna.xlsx', type: 'excel', size: '89 KB',
      description: 'Q2 2026 on-time repayment recovery forecast model',
      driveId: '3mN4oP5qR6sT7uV8wX9yZ0aB1cD2eF3g',
      preview: {
        type: 'table',
        headers: ['Quarter', 'Actual (%)', 'Baseline Fcst (%)', 'Key Assumptions'],
        rows: [
          ['Q3 2025', '82%', '—', 'Actual result'],
          ['Q4 2025', '83%', '—', 'Actual result'],
          ['Q1 2026', '78%', '82%', 'Flood impact −4pp vs forecast'],
          ['Q2 2026 (forecast)', '—', '84%', 'Normal rainfall; grace window active'],
        ],
      },
    },
  ],
};
