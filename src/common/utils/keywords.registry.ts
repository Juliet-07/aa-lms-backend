/**
 * Question-specific keyword registry for all 4 modules.
 *
 * Key format:
 *   Reflections : `${moduleId}-${segmentId}-${promptId}`
 *   Scenarios   : `${moduleId}-${segmentId}`
 *
 * segmentId = 0-based index of the segment inside the module's `segments` array.
 *
 * MODULE 1  (21 segments, indices 0-20)
 *   3  → Reflection: COVID-19 in Your Country        (prompts 1-2)
 *   11 → Scenario:   Risk Communication
 *   15 → Reflection: Invisible Until Counted          (prompts 1-3)
 *   18 → Reflection: Preparedness Through Community Evidence (prompts 1-3)
 *
 * MODULE 2  (20 segments, indices 0-19)
 *   5  → Scenario:   The CLM Cycle in Your Context
 *   10 → Reflection: When Evidence Hurts              (prompts 1-3)
 *   15 → Reflection: Case Study Reflection            (prompt 1)
 *   18 → Scenario:   Applied Scenario – PPPR in Practice
 *
 * MODULE 3  (17 segments, indices 0-16)
 *   4  → Reflection: PPPR Integration in Your Context (prompts 1-3)
 *   9  → Scenario:   Positioning CLM Evidence
 *   14 → Scenario:   Applied Scenario – CLM Integration
 *   16 → Reflection: Self-Assessment – Your Role in Integration (prompts 1-3)
 *
 * MODULE 4  (14 segments, indices 0-13)
 *   4  → Reflection: From Evidence to Action          (prompts 1-2)
 *   8  → Scenario:   Sustainability
 *   12 → Scenario:   Applied Reflection
 */

export interface QuestionKeywordConfig {
    required: string[];
    contextual: string[];
    minRequired: number;
    minContextual: number;
  }
  
  export const QUESTION_KEYWORD_MAP: Record<string, QuestionKeywordConfig> = {
  
    // ═══════════════════════════════════════════════════════════════════════════
    // MODULE 1 — Understanding the Foundations of PPPR and CLM
    // ═══════════════════════════════════════════════════════════════════════════
  
    // Segment 3 — Reflection: COVID-19 in Your Country
    // Prompt 1: Who noticed the problem first — communities or institutions?
    '1-3-1': {
      required: ['community', 'institution', 'first', 'covid'],
      contextual: ['local', 'government', 'health', 'official', 'outbreak', 'pandemic', 'example', 'notice', 'problem', 'response', 'witness', 'people'],
      minRequired: 2,
      minContextual: 2,
    },
    // Prompt 2: How quickly did local concerns reach decision-makers?
    '1-3-2': {
      required: ['concern', 'decision', 'local', 'reach'],
      contextual: ['government', 'authority', 'community', 'policy', 'delay', 'response', 'communication', 'escalat', 'barrier', 'access', 'official', 'quickly'],
      minRequired: 2,
      minContextual: 2,
    },
  
    // Segment 11 — Scenario: Risk Communication
    // How could CLM contribute to ensuring communication is inclusive, trusted, and grounded in local realities?
    '1-11': {
      required: ['clm', 'communication', 'community', 'trust'],
      contextual: ['monitor', 'data', 'channel', 'local', 'marginalized', 'feedback', 'barrier', 'language', 'misinformation', 'health', 'voice', 'inclusive', 'engage', 'radio', 'network', 'message', 'loop'],
      minRequired: 2,
      minContextual: 3,
    },
  
    // Segment 15 — Reflection: Invisible Until Counted
    // Prompt 1: What made them invisible to official systems?
    '1-15-1': {
      required: ['invisible', 'system', 'official', 'community'],
      contextual: ['marginalized', 'excluded', 'migrant', 'worker', 'documentation', 'stigma', 'isolation', 'geographic', 'vulnerable', 'barrier', 'access', 'recorded'],
      minRequired: 2,
      minContextual: 2,
    },
    // Prompt 2: What kind of data or evidence could have made them visible earlier?
    '1-15-2': {
      required: ['data', 'evidence', 'community', 'collect'],
      contextual: ['monitor', 'survey', 'clm', 'report', 'record', 'track', 'identify', 'health', 'service', 'visible', 'earlier', 'access'],
      minRequired: 2,
      minContextual: 2,
    },
    // Prompt 3: How might a CLM approach have changed their outcome?
    '1-15-3': {
      required: ['clm', 'community', 'monitor', 'outcome'],
      contextual: ['data', 'evidence', 'advocate', 'voice', 'accountability', 'system', 'response', 'health', 'service', 'visibility', 'empower', 'change'],
      minRequired: 2,
      minContextual: 2,
    },
  
    // Segment 18 — Reflection: Preparedness Through Community Evidence
    // Prompt 1: What would preparedness look like if every community could produce evidence?
    '1-18-1': {
      required: ['preparedness', 'community', 'evidence'],
      contextual: ['data', 'monitor', 'clm', 'health', 'response', 'local', 'trust', 'accountab', 'equity', 'capacity', 'strengthen', 'system', 'produce'],
      minRequired: 2,
      minContextual: 2,
    },
    // Prompt 2: What barriers prevent communities from generating real-time data?
    '1-18-2': {
      required: ['barrier', 'community', 'data', 'prevent'],
      contextual: ['resource', 'capacity', 'access', 'technology', 'funding', 'training', 'infrastructure', 'trust', 'literacy', 'network', 'support', 'context'],
      minRequired: 2,
      minContextual: 2,
    },
    // Prompt 3: How could you establish a CLM system to monitor vaccine or health service delivery?
    '1-18-3': {
      required: ['clm', 'monitor', 'community', 'health'],
      contextual: ['vaccine', 'service', 'delivery', 'data', 'collect', 'train', 'network', 'advocate', 'feedback', 'implement', 'establish', 'engage', 'system'],
      minRequired: 2,
      minContextual: 2,
    },
  
  
    // ═══════════════════════════════════════════════════════════════════════════
    // MODULE 2 — The Principles and Practice of CLM
    // ═══════════════════════════════════════════════════════════════════════════
  
    // Segment 5 — Scenario: The CLM Cycle in Your Context
    // Which step has been strongest, and which has been weakest?
    '2-5': {
      required: ['clm', 'cycle', 'step', 'community'],
      contextual: ['identify', 'collect', 'analys', 'share', 'act', 'track', 'redesign', 'monitor', 'data', 'evidence', 'strong', 'weak', 'barrier', 'gap', 'context', 'feedback'],
      minRequired: 2,
      minContextual: 3,
    },
  
    // Segment 10 — Reflection: When Evidence Hurts
    // Prompt 1: Describe the risk — who could be harmed, and how?
    '2-10-1': {
      required: ['risk', 'harm', 'data', 'community'],
      contextual: ['vulnerable', 'marginalized', 'criminali', 'stigma', 'migrant', 'worker', 'population', 'violence', 'arrest', 'retaliation', 'exposure', 'safety', 'protect', 'health'],
      minRequired: 2,
      minContextual: 2,
    },
    // Prompt 2: Suggest two ways CLM teams could use evidence while protecting those involved
    '2-10-2': {
      required: ['protect', 'evidence', 'data', 'community'],
      contextual: ['anonymi', 'storage', 'secure', 'closed', 'advocacy', 'confiden', 'consent', 'access', 'clm', 'safe', 'publish', 'aggregate', 'private', 'control'],
      minRequired: 2,
      minContextual: 2,
    },
    // Prompt 3: Who should have the final say on how that data is used?
    '2-10-3': {
      required: ['community', 'data', 'decision'],
      contextual: ['control', 'ownership', 'consent', 'power', 'final', 'disseminat', 'share', 'govern', 'accountab', 'right', 'voice', 'protect', 'clm'],
      minRequired: 2,
      minContextual: 2,
    },
  
    // Segment 15 — Reflection: Case Study Reflection (Oxygen and IPC)
    // Prompt 1: What one extra indicator would you add to capture equity concerns?
    '2-15-1': {
      required: ['indicator', 'equity', 'community', 'monitor'],
      contextual: ['ipc', 'oxygen', 'access', 'marginalized', 'vulnerable', 'facility', 'service', 'data', 'measure', 'track', 'gap', 'health', 'supply', 'add'],
      minRequired: 2,
      minContextual: 2,
    },
  
    // Segment 18 — Applied Scenario: PPPR in Practice
    // Describe how you would use the CLM cycle to turn these findings into action (120-150 words)
    '2-18': {
      required: ['clm', 'community', 'action', 'evidence', 'stakeholder'],
      contextual: ['ipc', 'diagnostic', 'stockout', 'communicate', 'share', 'negotiate', 'decision', 'health', 'monitor', 'follow', 'track', 'advocate', 'district', 'national', 'plan', 'supply', 'cycle'],
      minRequired: 3,
      minContextual: 3,
    },
  
  
    // ═══════════════════════════════════════════════════════════════════════════
    // MODULE 3 — Integrating CLM into PPPR
    // ═══════════════════════════════════════════════════════════════════════════
  
    // Segment 4 — Reflection: PPPR Integration in Your Context
    // Prompt 1: Name one point where CLM evidence could be integrated into a PPPR process
    '3-4-1': {
      required: ['clm', 'integration', 'pppr', 'evidence'],
      contextual: ['preparedness', 'plan', 'review', 'assessment', 'monitor', 'community', 'entry', 'point', 'system', 'national', 'health', 'policy', 'data', 'process'],
      minRequired: 2,
      minContextual: 2,
    },
    // Prompt 2: What would make integration easier or harder?
    '3-4-2': {
      required: ['integration', 'barrier', 'community', 'evidence'],
      contextual: ['political', 'power', 'will', 'resource', 'trust', 'relationship', 'mandate', 'incentive', 'resist', 'support', 'data', 'clm', 'credib', 'system', 'easier', 'harder'],
      minRequired: 2,
      minContextual: 2,
    },
    // Prompt 3: Who holds the power to decide whether community evidence is taken seriously?
    '3-4-3': {
      required: ['power', 'decision', 'community', 'evidence'],
      contextual: ['government', 'authority', 'ministry', 'official', 'donor', 'institution', 'political', 'govern', 'accountab', 'civil', 'advocate', 'health', 'holder', 'serious'],
      minRequired: 2,
      minContextual: 2,
    },
  
    // Segment 9 — Scenario: Positioning CLM Evidence
    // Choose one process and explain how you would position your CLM data for integration
    '3-9': {
      required: ['clm', 'evidence', 'integration', 'community', 'data'],
      contextual: ['preparedness', 'review', 'dashboard', 'action', 'response', 'resist', 'partner', 'credib', 'frame', 'advocate', 'monitor', 'official', 'present', 'national', 'findings', 'after-action'],
      minRequired: 3,
      minContextual: 3,
    },
  
    // Segment 14 — Applied Scenario: CLM Integration (120-150 words)
    // Explain your approach to integrating CLM evidence
    '3-14': {
      required: ['clm', 'integration', 'evidence', 'community', 'preparedness'],
      contextual: ['entry', 'point', 'barrier', 'partner', 'data', 'ipc', 'health', 'facility', 'official', 'monitor', 'frame', 'complement', 'assess', 'national', 'plan', 'address'],
      minRequired: 3,
      minContextual: 3,
    },
  
    // Segment 16 — Reflection: Self-Assessment – Your Role in Integration
    // Prompt 1: One concrete action in the next 3 months
    '3-16-1': {
      required: ['action', 'clm', 'integration', 'advocate'],
      contextual: ['pppr', 'community', 'evidence', 'engage', 'partner', 'network', 'present', 'policy', 'process', 'concrete', 'plan', 'month', 'step'],
      minRequired: 2,
      minContextual: 2,
    },
    // Prompt 2: What skills or relationships would you need to develop?
    '3-16-2': {
      required: ['skill', 'relationship', 'develop', 'community'],
      contextual: ['network', 'partner', 'advocate', 'communication', 'data', 'analys', 'trust', 'negotiat', 'engage', 'capacity', 'train', 'build', 'clm'],
      minRequired: 2,
      minContextual: 2,
    },
    // Prompt 3: What support would you need from your network or organisation?
    '3-16-3': {
      required: ['support', 'network', 'organisation', 'community'],
      contextual: ['resource', 'fund', 'partner', 'capacity', 'train', 'technical', 'advocacy', 'clm', 'data', 'time', 'team', 'collaborat', 'connect'],
      minRequired: 2,
      minContextual: 2,
    },
  
  
    // ═══════════════════════════════════════════════════════════════════════════
    // MODULE 4 — Action, Advocacy, and Sustainability
    // ═══════════════════════════════════════════════════════════════════════════
  
    // Segment 4 — Reflection: From Evidence to Action
    // Prompt 1: Identify one decision-maker or institution you would target
    '4-4-1': {
      required: ['decision', 'institution', 'target', 'evidence'],
      contextual: ['ministry', 'government', 'health', 'official', 'authority', 'budget', 'parliament', 'donor', 'advocate', 'community', 'clm', 'power', 'preparedness'],
      minRequired: 2,
      minContextual: 2,
    },
    // Prompt 2: Explain how you would frame the evidence to push for action
    '4-4-2': {
      required: ['evidence', 'frame', 'action', 'advocacy'],
      contextual: ['message', 'data', 'clm', 'budget', 'policy', 'negotiate', 'risk', 'cost', 'equity', 'demand', 'narrative', 'preparedness', 'political', 'community', 'decision'],
      minRequired: 2,
      minContextual: 2,
    },
  
    // Segment 8 — Scenario: Sustainability
    // Explain one sustainability strategy, where you would seek anchoring, and one risk
    '4-8': {
      required: ['sustain', 'clm', 'community', 'fund'],
      contextual: ['anchor', 'governance', 'policy', 'budget', 'institutio', 'donor', 'domestic', 'long-term', 'embed', 'risk', 'mitigat', 'advocacy', 'monitor', 'network', 'evidence', 'financ'],
      minRequired: 2,
      minContextual: 3,
    },
  
    // Segment 12 — Applied Reflection (Scenario)
    // How CLM in your context could move from integrated evidence to sustained impact (120-150 words)
    '4-12': {
      required: ['clm', 'evidence', 'sustain', 'advocacy', 'community'],
      contextual: ['strategy', 'fund', 'governance', 'policy', 'risk', 'budget', 'anchor', 'monitor', 'institutio', 'impact', 'partner', 'preparedness', 'manage', 'embed', 'priorit', 'financ'],
      minRequired: 3,
      minContextual: 3,
    },
  };
  
  
  // ─── Lookup helpers ──────────────────────────────────────────────────────────
  
  /**
   * Look up config for a reflection prompt.
   * Falls back to permissive default when no specific config exists.
   */
  export const getReflectionKeywordConfig = (
    moduleId: number,
    segmentId: number,
    promptId: number,
  ): QuestionKeywordConfig => {
    const key = `${moduleId}-${segmentId}-${promptId}`;
    return QUESTION_KEYWORD_MAP[key] ?? getDefaultConfig();
  };
  
  /**
   * Look up config for a scenario response.
   */
  export const getScenarioKeywordConfig = (
    moduleId: number,
    segmentId: number,
  ): QuestionKeywordConfig => {
    const key = `${moduleId}-${segmentId}`;
    return QUESTION_KEYWORD_MAP[key] ?? getDefaultConfig();
  };
  
  /**
   * Permissive fallback — only gibberish check applies in practice.
   * Used for any question not yet listed above.
   */
  export const getDefaultConfig = (): QuestionKeywordConfig => ({
    required: ['community', 'health', 'data', 'system'],
    contextual: ['clm', 'evidence', 'response', 'access', 'service', 'advocate'],
    minRequired: 1,
    minContextual: 1,
  });