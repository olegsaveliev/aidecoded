import { useState, useCallback, useRef, useEffect } from 'react'
import ModuleIcon from './ModuleIcon.jsx'
import SuggestedModules from './SuggestedModules.jsx'
import { CheckIcon, CrossIcon, WarningIcon } from './ContentIcons.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import './SystemDesignInterview.css'

/* ══════════════════════════════════════
   SCENARIO DATA
   ══════════════════════════════════════ */

const SCENARIOS = {
  support: {
    id: 'support',
    title: 'Customer Support AI',
    difficulty: 'Intermediate',
    difficultyClass: 'intermediate',
    brief: 'Design an AI system that handles 50,000 support tickets per day for a fintech company. Users expect answers in under 2 seconds. Wrong answers cost customer trust and can violate financial regulations.',
    tensions: ['Helpfulness', 'Safety', 'Cost'],
    decides: ['RAG pipeline architecture', 'Agent autonomy boundaries', 'Escalation and fallback strategy'],
    constraints: ['2s SLA', 'Fintech regs', '50K tickets/day'],
    systemBrief: 'You are designing the AI backbone for Finova, a Series B fintech with 2M customers. Their support team handles 50,000 tickets/day. Average handle time: 8 minutes per ticket. Goal: resolve 70% with AI. Keep humans for complex and regulated queries. SLA: under 2 seconds for AI responses. Constraint: GDPR and FCA regulations apply. Your interview starts now.',
    diagramNodes: [
      { id: 'ingestion', label: 'Ingestion', x: 75, y: 30 },
      { id: 'classifier', label: 'Classifier', x: 225, y: 30 },
      { id: 'rag', label: 'RAG Store', x: 75, y: 80 },
      { id: 'agent', label: 'Agent Layer', x: 225, y: 80 },
      { id: 'knowledge', label: 'Knowledge', x: 75, y: 130 },
      { id: 'response', label: 'Response Gen', x: 225, y: 130 },
      { id: 'escalation', label: 'Human Escalation', x: 150, y: 185 },
    ],
    diagramEdges: [
      ['ingestion', 'classifier'],
      ['ingestion', 'rag'],
      ['classifier', 'agent'],
      ['rag', 'knowledge'],
      ['agent', 'response'],
      ['knowledge', 'response'],
      ['response', 'escalation'],
    ],
    decisions: [
      {
        title: 'How does the system find answers?',
        context: 'Finova has 15,000 support articles, 3 years of resolved ticket history, and live account data. The AI needs to pull the right context to answer each query accurately. Your retrieval architecture is the foundation of everything else.',
        options: [
          {
            label: 'Full RAG Pipeline',
            desc: 'Embed all 15K articles + ticket history. Semantic search retrieves top-K chunks. Full context passed to LLM.',
            deltas: { performance: 5, cost: -8, trust: 10 },
          },
          {
            label: 'Keyword + Semantic Hybrid',
            desc: 'Fast keyword pre-filter narrows candidates. Semantic re-ranking on the shortlist. Lower embedding cost, slightly lower recall.',
            deltas: { performance: 8, cost: -3, trust: 5 },
          },
          {
            label: 'Live Database Lookup Only',
            desc: 'No embeddings. SQL queries against structured knowledge base + account data. Fast and cheap. Limited to structured data.',
            deltas: { performance: 12, cost: 12, trust: -5 },
          },
        ],
        consequences: [
          'Full RAG gives you the best semantic recall across your knowledge base. At 50K tickets/day, embedding retrieval adds ~$4,200/month in inference costs. The trade-off: higher accuracy but real cost at this volume.',
          'Hybrid search is how most production RAG systems actually run. You capture 90% of full RAG quality at ~40% of the embedding cost. At your scale, that saves ~$2,500/month vs Option A.',
          'SQL-only is fast and cheap but you are leaving all unstructured knowledge inaccessible. Article content, ticket history, nuanced answers \u2014 all gone. Your resolution rate will suffer.',
        ],
        priya: [
          'Solid foundation. Make sure you have a re-indexing pipeline for when articles update. Stale embeddings are a silent accuracy killer.',
          'This is what I would ship. Pure semantic search sounds better in theory. In practice the hybrid usually wins on recall AND cost.',
          'This will fail the first time a user asks something that is not in your structured fields. You have 15K articles for a reason.',
        ],
        marcus: [
          'If this improves resolution rate by even 5%, the cost pays back in hours saved per agent. I can sell this to finance.',
          'Good. As long as the answer quality holds up, I am happy with the efficiency.',
          'This worries me. Our support articles exist because agents need them. Why would the AI not need them too?',
        ],
      },
      {
        title: 'How much can the AI act on its own?',
        context: 'Beyond answering questions, the AI could take actions: issue refunds under \u00A350, update account details, initiate chargebacks. More autonomy = faster resolution. But Finova operates under FCA regulations where incorrect actions have legal consequences.',
        options: [
          {
            label: 'Answer-Only Agent',
            desc: 'AI provides answers and recommendations. All account actions require human approval. Zero autonomous transactions.',
            deltas: { performance: -8, cost: 6, trust: 12 },
          },
          {
            label: 'Bounded Autonomy',
            desc: 'AI executes pre-approved action types (refunds \u2264\u00A350, address changes, password resets). Escalates outside those bounds.',
            deltas: { performance: 8, cost: -5, trust: 6 },
          },
          {
            label: 'Full Autonomy with Logging',
            desc: 'AI executes any action it classifies as appropriate. Full audit log. Humans review logs, not individual actions.',
            deltas: { performance: 15, cost: -10, trust: -15 },
          },
        ],
        consequences: [
          'Answer-only is the safest choice and the most defensible to regulators. But you will resolve about 40% of tickets, not 70%. Every action still needs a human touch \u2014 your handle time drops, not your headcount.',
          'Bounded autonomy is the production-ready choice for regulated environments. Define the action space carefully and you get meaningful automation within FCA guardrails. 70% resolution is achievable.',
          'Full autonomy will perform beautifully in demos. It will also eventually execute a \u00A350,000 refund by mistake. In fintech, that mistake is a regulatory incident, not a bug report.',
        ],
        priya: [
          'Safe, but this barely qualifies as AI-assisted. You are just adding a chatbot in front of your ticket queue.',
          'This is the right call. Define the permission boundary in code, not in the LLM\'s judgment.',
          'Hard no. LLMs are non-deterministic. You cannot give non-deterministic systems financial authority without a human checkpoint.',
        ],
        marcus: [
          'Support leads will love this. But we promised the board 70% AI resolution. This gets us to 40% at best.',
          'This is what I pitched to compliance. Specific allowed actions, everything else escalated. They signed off.',
          'I appreciate the confidence but one wrong refund goes viral and we are on the front page of FinTech Futures for the wrong reason.',
        ],
      },
      {
        title: 'Which model powers the responses?',
        context: 'Your response generation model is your biggest inference cost lever. The gap between frontier and mid-tier models has narrowed significantly but frontier models still lead on nuanced, multi-step financial queries. Every request needs to be answered and every answer needs to be accurate.',
        options: [
          {
            label: 'Frontier Model (Claude / GPT-5 class)',
            desc: 'Best accuracy on complex queries. ~$0.015 per 1K output tokens. At 50K tickets/day: ~$22,500/month.',
            deltas: { performance: 5, cost: -15, trust: 12 },
          },
          {
            label: 'Mid-Tier Model (Sonnet / GPT-4o class)',
            desc: 'Strong accuracy, better speed. ~$0.003 per 1K output tokens. At 50K tickets/day: ~$4,500/month.',
            deltas: { performance: 8, cost: -5, trust: 6 },
          },
          {
            label: 'Small Model + Fallback Routing',
            desc: 'Fast small model handles simple queries. Escalates complex queries to mid-tier. ~$1,200/month average with smart routing.',
            deltas: { performance: 6, cost: 10, trust: 3 },
          },
        ],
        consequences: [
          'Frontier accuracy is real \u2014 especially on complex financial queries where the AI needs to reason across multiple account states. But $22,500/month is a board-level conversation, not an engineering choice.',
          'Mid-tier models handle 85-90% of support queries with near-frontier quality. The cost/quality ratio at this tier is the best in the market right now. This is the practical production choice.',
          'Routing is elegant in theory. The complexity is the classifier that decides which model handles each query. Get it wrong and you send hard queries to the cheap model and simple queries to the expensive one.',
        ],
        priya: [
          'Defensible if your ticket complexity justifies it. Can you show that 20% of queries actually need frontier reasoning?',
          'I would start here. Profile your query complexity after a month and upgrade selectively if you see failures.',
          'The routing classifier needs to be really good. What is its accuracy? That is the hidden cost you have not accounted for.',
        ],
        marcus: [
          'Finance will ask why we are spending $270K a year on inference. What is the answer?',
          'This I can defend to the board. Clear ROI story.',
          'I like the cost. I worry about the "wrong model" failure mode. Users will not know which model they got.',
        ],
      },
      {
        title: 'How do you hit the 2-second SLA?',
        context: 'Your 2-second SLA is tight. RAG retrieval + LLM inference + response delivery typically runs 2.5-4 seconds without optimisation. You need a strategy. Different approaches solve the problem differently and have different failure modes.',
        options: [
          {
            label: 'Response Streaming',
            desc: 'Stream tokens to the user as they generate. Perceived latency drops dramatically. First token in ~400ms, full response in 2-4 seconds.',
            deltas: { performance: 12, cost: -4, trust: 3 },
          },
          {
            label: 'Aggressive Caching',
            desc: 'Cache embeddings, common query results, and top-K retrievals. ~35% of support queries are near-duplicates.',
            deltas: { performance: 10, cost: 8, trust: -3 },
          },
          {
            label: 'Tiered Response \u2014 Acknowledge + Answer',
            desc: 'Instant acknowledgement ("Looking into your account...") buys 4-6 seconds for full processing. Two-phase UX.',
            deltas: { performance: 8, cost: -2, trust: 5 },
          },
        ],
        consequences: [
          'Streaming is the right UX choice for a chat interface. Users tolerate 3 seconds of streaming far better than 3 seconds of blank screen. The SLA perception problem is largely solved by first-token latency.',
          'Caching is technically correct but requires careful invalidation. A customer gets a cached answer to "what is my balance" from 6 hours ago. That is a support ticket, not a support resolution.',
          'Two-phase UX is underrated. "On it..." buys genuine processing time and creates the perception of a thoughtful agent rather than an instant machine. Used well by every major AI chat product.',
        ],
        priya: [
          'Correct choice for chat. Just make sure your streaming implementation handles partial JSON and retry logic cleanly.',
          'Caching works for static knowledge. Be very careful about caching anything that touches live account state. That way lies incidents.',
          'Honest and effective. The UX team needs to design this carefully so it does not feel like a loading spinner.',
        ],
        marcus: [
          'This is what users expect from chat now. The typing indicator pattern. Good.',
          'The stale data risk worries me. One wrong balance shown to a customer and we have a complaints incident.',
          'I actually like this. It sets the tone that the AI is thinking, not just pattern-matching.',
        ],
      },
      {
        title: 'What happens when the AI is wrong?',
        context: 'Your system will hallucinate. Not often \u2014 but at 50,000 tickets per day, a 0.5% hallucination rate is 250 wrong answers every single day. In a regulated financial context, wrong answers about rates, limits, or account status have real consequences.',
        options: [
          {
            label: 'Confidence Scoring + Hard Threshold',
            desc: 'Every response includes a confidence score. Below 75% confidence: escalate to human. Above 75%: send AI response with disclaimer.',
            deltas: { performance: -6, cost: -3, trust: 10 },
          },
          {
            label: 'Citation-Only Responses',
            desc: 'AI only answers if it can cite a specific article or account data field as source. No source = escalate. Reduces hallucination to near zero.',
            deltas: { performance: -12, cost: -2, trust: 15 },
          },
          {
            label: 'Human Review Sample + Monitoring',
            desc: 'AI answers freely. 5% of responses reviewed by humans. Statistical monitoring alerts on anomalies. Fast feedback loop.',
            deltas: { performance: 10, cost: 8, trust: -5 },
          },
        ],
        consequences: [
          'Confidence scoring is widely used but poorly understood. LLM confidence scores are not reliable probability estimates \u2014 models can be confidently wrong. Use this as a signal, not a guarantee.',
          'Citation-only is the most defensible approach for a regulated environment. If the AI cannot point to the source, it does not answer. Your resolution rate drops but every answer is traceable.',
          'Statistical monitoring catches systematic failures but misses individual harmful responses. In a regulated context, "we catch it in aggregate" is not a sufficient answer to a compliance team.',
        ],
        priya: [
          'Confidence scores from LLMs are not calibrated probabilities. They are useful signals but you cannot treat 75% as a reliable threshold without empirical calibration.',
          'The most honest architecture for a regulated environment. The AI answers what it can prove. Everything else goes to humans. I respect this choice.',
          'This works at a consumer scale where some wrong answers are acceptable. Fintech is not that context.',
        ],
        marcus: [
          'Compliance will ask what 75% means. You need a crisp answer.',
          'I can explain this to the FCA. "The AI only answers from verified sources." That is a clean story.',
          '5% review sample sounds good until someone gets wrong account information and complains. We were in the 95%.',
        ],
      },
      {
        title: 'How do you handle traffic spikes?',
        context: 'Finova runs a marketing campaign next month. Projected ticket volume: 5\u00D7 normal for 72 hours. Your current infrastructure handles 50K/day. You need a plan for 250K/day without degrading response quality or SLA compliance.',
        options: [
          {
            label: 'Auto-scaling Inference Pool',
            desc: 'Spin up additional model instances automatically when queue depth spikes. True elastic scaling. Higher cost during peaks.',
            deltas: { performance: 12, cost: -10, trust: 4 },
          },
          {
            label: 'Queue + Rate Limiting',
            desc: 'Cap throughput at steady-state capacity. Overflow tickets queued with estimated wait time shown to users.',
            deltas: { performance: -8, cost: 12, trust: 2 },
          },
          {
            label: 'Graceful Degradation',
            desc: 'Under high load, switch to faster/cheaper model tier automatically. Quality drops slightly. SLA maintained. No queue.',
            deltas: { performance: 6, cost: 6, trust: -8 },
          },
        ],
        consequences: [
          'Auto-scaling is the right engineering answer but the cost spike is real. 5\u00D7 traffic for 72 hours means your monthly inference bill could double. Make sure finance knows before the campaign.',
          'Queue management is honest. Telling a user "your ticket is number 847 and you will hear back in 14 minutes" is better than a slow degraded experience. But it changes your SLA story.',
          'Graceful degradation is smart systems engineering. The risk: during a spike is exactly when your most frustrated customers are reaching out. Giving them a degraded response when they are already angry is a retention risk.',
        ],
        priya: [
          'Set a cost ceiling in your auto-scaling config. Unlimited scale-up without a cap is how you accidentally spend $80K in a weekend.',
          'Clean and honest. Queue visibility is better than mystery slowness. Just test the queue system before the campaign.',
          'The model routing needs to be invisible to the user. If they perceive quality drop during a spike, the correlation is obvious and trust erodes.',
        ],
        marcus: [
          'I need to know the cost ceiling before I approve the campaign. What is the worst case number?',
          'Support leads will hate the queue. They will want to staff up manually instead. Can we negotiate a hybrid?',
          'Does this mean our angry customers get worse AI? That is backwards.',
        ],
      },
      {
        title: 'The trade-off you cannot avoid',
        context: 'Your architecture is nearly complete. But Finova\'s compliance team has raised a concern: under GDPR Article 22, customers have the right to request human review of any automated decision that affects them. Your AI responses technically qualify. You need a compliance pathway.',
        options: [
          {
            label: 'Full Human Review On Request',
            desc: 'Any customer can request human review of any AI response. 48-hour SLA. Requires a dedicated review team. Additional ~\u00A3180K/year in headcount.',
            deltas: { performance: -5, cost: -12, trust: 18 },
          },
          {
            label: 'AI Decision Explanation Layer',
            desc: 'Add an explainability module: every AI response includes its reasoning and sources. Satisfies Article 22 technically. Adds ~200ms latency.',
            deltas: { performance: -5, cost: -6, trust: 12 },
          },
          {
            label: 'Classify + Exempt',
            desc: 'Work with legal to classify AI responses as informational, not decisions. Reduces GDPR scope. Risk: if regulator disagrees, full retrofit required.',
            deltas: { performance: 6, cost: 8, trust: -15 },
          },
        ],
        consequences: [
          '\u00A3180K/year is real money. But GDPR compliance is not optional and the human review team builds genuine trust with regulators. This is the choice that makes the system defensible not just functional.',
          'The explainability approach is technically clever and legally arguable. The 200ms latency hit is manageable. Whether it fully satisfies Article 22 depends on your legal counsel.',
          'Legal classification is a legitimate strategy but it is a bet on your legal team\'s interpretation. If the FCA disagrees, you are retrofitting compliance into a live production system.',
        ],
        priya: [
          'This is the defensible choice. Build the review queue into your system architecture now \u2014 retrofitting it later is a nightmare.',
          'Elegant. Explainability is good practice regardless of GDPR. Get legal sign-off on whether it satisfies Article 22 specifically.',
          'I have seen this go wrong. The moment you are in a grey area with a regulator, you want to be over-compliant, not under.',
        ],
        marcus: [
          'I can sell this to the board. "We invested in a compliance pathway that protects our customers" is a strong story.',
          'Legal needs to sign off. I will not ship this without their written confirmation.',
          'This keeps me up at night. What if we are wrong about the classification?',
        ],
      },
    ],
    stressTests: [
      {
        title: 'The Traffic Spike',
        desc: 'Finova announces a fee change. Every customer wants to know how it affects their account. Ticket volume hits 8\u00D7 normal for 48 hours. Your system is receiving 400K tickets per day.',
        linkedDecision: 5,
        outcomes: [
          { grade: 'survived', text: 'Your elastic inference pool scaled to demand. Cost spike: +\u00A34,200 for those 48 hours. Finance flagged it. You should have set a cost ceiling.' },
          { grade: 'partial', text: 'Queue backed up to 6 hours at peak. 12% of users abandoned before getting an answer. But the AI quality stayed consistent.' },
          { grade: 'partial', text: 'Your cheaper model handled the spike but response accuracy dropped 18% on complex account queries. At exactly the moment customers needed correct information most.' },
        ],
      },
      {
        title: 'The Viral Incident',
        desc: 'An AI response tells a customer their account was "not eligible for the government hardship scheme" \u2014 incorrectly. The customer screenshots it and posts to Twitter. It goes viral. 40K impressions in 2 hours.',
        linkedDecision: 4,
        outcomes: [
          { grade: 'partial', text: 'Your confidence threshold should have caught this \u2014 the query was in a policy area with sparse training data. Check your calibration. The PR damage is real.' },
          { grade: 'survived', text: 'Your system escalated this query because the hardship scheme was updated 3 days ago and the AI had no verified source to cite. A human agent gave the correct answer.' },
          { grade: 'failed', text: 'Your monitoring flagged the pattern 6 hours after the viral moment. By then 40K people had seen the wrong answer. "We catch errors statistically" is not a crisis communications statement.' },
        ],
      },
      {
        title: 'The Compliance Audit',
        desc: 'The FCA sends a Section 166 notice. They want to review your AI decision system. You have 30 days to produce: a log of all automated responses, evidence of how customers can challenge AI decisions, and accuracy metrics.',
        linkedDecision: 6,
        outcomes: [
          { grade: 'survived', text: 'You have the review trail, the log, and a clear human escalation pathway. Your compliance documentation is solid. The FCA auditor leaves satisfied.' },
          { grade: 'partial', text: 'You have the logs and the explanation trails. The auditor questions whether explanation satisfies Article 22\'s "human review" requirement. You need legal counsel urgently.' },
          { grade: 'failed', text: 'Your legal classification that AI responses are "informational not decisional" does not hold under FCA scrutiny. You are now retrofitting a compliance pathway into a live production system under regulatory observation.' },
        ],
      },
    ],
  },
  moderation: {
    id: 'moderation',
    title: 'Content Moderation System',
    difficulty: 'Advanced',
    difficultyClass: 'advanced',
    brief: 'Design a moderation pipeline for a social platform with 10M daily posts. You need to catch harmful content before it reaches users while keeping false positive rates low enough that real users do not get wrongly silenced.',
    tensions: ['Speed', 'Accuracy', 'Fairness'],
    decides: ['Classifier pipeline stages', 'Human-in-the-loop placement', 'Appeal and correction mechanisms'],
    constraints: ['10M posts/day', '<1% false positives', '24hr coverage'],
    systemBrief: 'You are designing the moderation infrastructure for Orbit, a social platform with 10 million daily active users generating 10M posts per day. Your moderation system must catch: CSAM (zero tolerance), hate speech, harassment, misinformation, and spam. Constraint: false positive rate below 1%. Appeals that take more than 24 hours generate user complaints and press coverage. Your interview starts now.',
    diagramNodes: [
      { id: 'prefilter', label: 'Pre-filter', x: 150, y: 25 },
      { id: 'classifier', label: 'ML Classifier', x: 150, y: 70 },
      { id: 'confidence', label: 'Confidence', x: 150, y: 115 },
      { id: 'autoaction', label: 'Auto-action', x: 60, y: 160 },
      { id: 'humanqueue', label: 'Human Queue', x: 240, y: 160 },
      { id: 'reviewer', label: 'Reviewer UI', x: 240, y: 200 },
      { id: 'appeal', label: 'Appeal Pipeline', x: 150, y: 200 },
    ],
    diagramEdges: [
      ['prefilter', 'classifier'],
      ['classifier', 'confidence'],
      ['confidence', 'autoaction'],
      ['confidence', 'humanqueue'],
      ['humanqueue', 'reviewer'],
      ['reviewer', 'appeal'],
    ],
    decisions: [
      {
        title: 'How is content evaluated?',
        context: '10M posts per day is 115 posts per second. You need a pipeline that evaluates every piece of content before or just after it reaches the feed. Your architecture choice determines speed, accuracy, and cost at this scale.',
        options: [
          { label: 'Single ML Classifier', desc: 'One fine-tuned classifier scores all content on all violation types simultaneously. Unified model. Fast. Needs careful training.', deltas: { performance: 10, cost: 8, trust: -5 } },
          { label: 'Staged Pipeline', desc: 'Stage 1: Fast heuristic pre-filter. Stage 2: ML classifier on survivors. Stage 3: LLM review for edge cases.', deltas: { performance: 6, cost: -5, trust: 12 } },
          { label: 'Parallel Specialist Models', desc: 'Separate fine-tuned models for each violation category run simultaneously. Highest accuracy per category. Highest compute cost.', deltas: { performance: -3, cost: -14, trust: 15 } },
        ],
        consequences: [
          'A unified classifier is elegant but violation categories have very different feature signatures. A model good at detecting spam is different from one good at detecting nuanced hate speech.',
          'The staged pipeline is how every major platform actually runs moderation at scale. Cheap and fast rules catch ~60% of violations. ML handles the rest.',
          'Specialist models give you the best per-category performance. The cost is real \u2014 you are running N models in parallel for every post.',
        ],
        priya: [
          'The failure mode is adversarial content designed to look like two categories simultaneously. A unified model is more exploitable.',
          'This is what I would build. The heuristic layer catches the easy violations cheaply. Save your ML budget for the hard cases.',
          'Correct choice if accuracy is the top priority and cost is not your binding constraint. Is it?',
        ],
        marcus: [
          'One model sounds simpler to explain. I worry about the edge cases \u2014 when it is wrong, what category did it get wrong and why?',
          'I like that we have an explanation for each stage. When a user appeals, we can say at which stage they were caught.',
          'The accuracy story is strong. Can we show the accuracy per category in our transparency report?',
        ],
      },
      {
        title: 'Where do humans sit in this pipeline?',
        context: 'With 10M posts per day, you cannot have humans review everything. But pure automation makes mistakes with real consequences \u2014 wrongly removed content harms users and wrongly allowed content harms communities.',
        options: [
          { label: 'Humans Review Low-Confidence Only', desc: 'ML classifier outputs a confidence score. Below threshold: human review queue. Above threshold: automated action. ~3% to human queue = 300K posts/day.', deltas: { performance: -10, cost: -8, trust: 8 } },
          { label: 'Humans Review Appeals Only', desc: 'All moderation decisions are automated. Users who believe they were wrongly actioned can appeal. ~0.8% appeal rate = 80K/day.', deltas: { performance: 15, cost: 10, trust: -8 } },
          { label: 'Pre-Publication Review for High-Risk', desc: 'High-risk accounts (flagged history, new accounts, viral posts) get pre-publication human review. Everything else automated. ~1.5% = 150K/day.', deltas: { performance: -6, cost: -5, trust: 6 } },
        ],
        consequences: [
          'Sending 300K posts/day to human review requires a massive moderation team. At 200 reviews per moderator per day, that is 1,500 moderators. The staffing cost alone is significant.',
          'Appeals-only is the most efficient but the damage is done before the appeal is filed. Harmful content reaches users. Wrongly removed content silences voices. Both happen before any human sees it.',
          'Pre-publication review for high-risk accounts is targeted and efficient. The challenge is defining "high-risk" without introducing bias against new users or specific communities.',
        ],
        priya: ['That is 1,500 moderators at minimum. Can the business absorb that headcount?', 'Fast but reactive. The harm happens, then you fix it. For CSAM that is unacceptable.', 'The "high-risk" classifier is itself a policy decision. Who defines high-risk and what biases does that introduce?'],
        marcus: ['The cost concerns me. But the quality of moderation with human review is genuinely better.', 'Our users will say we only care after they complain. The optics are difficult.', 'I like the targeting. But we need to be transparent about what triggers pre-publication review.'],
      },
      {
        title: 'How do you calibrate confidence thresholds?',
        context: 'Your classifier outputs a confidence score between 0 and 1 for each violation type. You need to set thresholds that balance false positives (wrongly removing content) against false negatives (missing violations). Different content types need different thresholds.',
        options: [
          { label: 'Single Global Threshold', desc: 'One threshold (e.g. 0.85) for all content types. Simple to maintain. Same treatment for spam and hate speech.', deltas: { performance: 8, cost: 6, trust: -6 } },
          { label: 'Per-Category Thresholds', desc: 'Different thresholds per violation type. CSAM: 0.5 (low \u2014 catch everything). Spam: 0.95 (high \u2014 minimize false positives). Hate speech: 0.8 (balanced).', deltas: { performance: -2, cost: -4, trust: 12 } },
          { label: 'Dynamic Thresholds with Feedback Loop', desc: 'Thresholds auto-adjust based on appeal rates and false positive monitoring. Learns from moderator decisions over time.', deltas: { performance: 4, cost: -6, trust: 8 } },
        ],
        consequences: [
          'A global threshold is simple but treats all violations equally. A 0.85 threshold that works for spam will miss subtle hate speech and over-flag sarcasm.',
          'Per-category thresholds are the production standard. CSAM tolerance should be near-zero (catch everything). Spam can tolerate higher thresholds because false positives are less harmful.',
          'Dynamic thresholds are sophisticated but introduce a feedback loop. If moderators are biased, the system learns their bias. If appeal rates drop because users give up, thresholds drift.',
        ],
        priya: ['Simple is good for v1 but you will outgrow this fast. Hate speech at 0.85 misses the most harmful subtle content.', 'This is correct. CSAM at 0.5 means you over-flag and review everything suspicious. That is the right trade-off.', 'Elegant but risky. Who monitors the monitor? If the dynamic system drifts, how do you detect it?'],
        marcus: ['I can explain this to regulators easily. But the first wrongful removal of a journalist\'s post will test it.', 'I like that we can explain why CSAM has a different threshold than spam. That is a principled story.', 'The "auto-adjusting" story is compelling until something drifts and we cannot explain why a post was removed.'],
      },
      {
        title: 'How do you handle CSAM?',
        context: 'CSAM (child sexual abuse material) is not a trade-off. It is a legal obligation with zero tolerance. Every major platform has specific obligations. The question is not whether to catch it but how to architect the system to guarantee it.',
        options: [
          { label: 'Hash Matching + ML + Human Verification', desc: 'PhotoDNA hash matching for known material. ML classifier for novel material. Every detection verified by trained specialist before law enforcement report.', deltas: { performance: -4, cost: -8, trust: 15 } },
          { label: 'Hash Matching Only', desc: 'Match against NCMEC and IWF hash databases. Known material caught instantly. Novel material relies on general classifier.', deltas: { performance: 6, cost: 4, trust: -2 } },
          { label: 'Full Pipeline with Proactive Scanning', desc: 'Hash matching + ML + behavioral pattern analysis (grooming detection, age estimation). Most comprehensive. Highest cost and privacy concerns.', deltas: { performance: -6, cost: -12, trust: 12 } },
        ],
        consequences: [
          'This is the industry standard and the right answer. Hash matching catches known material instantly. ML catches novel material. Human verification prevents false reports to law enforcement.',
          'Hash-only catches known material but misses novel CSAM entirely. Your general classifier was not trained for this specific detection task. This is a gap regulators will identify immediately.',
          'Proactive scanning is the most comprehensive but raises legitimate privacy concerns. Behavioral analysis of user patterns crosses into surveillance territory. The legal landscape here is evolving.',
        ],
        priya: ['This is the correct architecture. No shortcuts on CSAM. Hash matching for known, ML for novel, human verification for accuracy.', 'This will not pass a regulator audit. Novel CSAM detection requires purpose-built models, not general classifiers.', 'Technically strongest but the privacy implications of behavioral scanning need legal review in every jurisdiction you operate.'],
        marcus: ['This is non-negotiable. I will defend this cost to any board.', 'Our legal team will flag this immediately. We cannot rely on general classifiers for CSAM.', 'The privacy story is tricky. We need to be transparent about what we scan and why.'],
      },
      {
        title: 'How do you moderate across cultures?',
        context: 'Orbit operates in 40 countries. What is considered hate speech varies dramatically by culture and legal jurisdiction. Satire in one country is a criminal offense in another. Your moderation system needs to handle this nuance at scale.',
        options: [
          { label: 'Universal Policy + Local Exceptions', desc: 'One global content policy with documented exceptions per jurisdiction. Legal teams maintain exception lists. AI applies the base policy, local teams handle exceptions.', deltas: { performance: 4, cost: -4, trust: 6 } },
          { label: 'Per-Region Moderation Models', desc: 'Train separate classifiers per region with region-specific training data and cultural context. Each model understands local norms.', deltas: { performance: -6, cost: -12, trust: 12 } },
          { label: 'Community-Based Moderation', desc: 'Local trusted users flag content using community-specific guidelines. AI pre-filters obvious violations. Community handles nuance.', deltas: { performance: 8, cost: 8, trust: -4 } },
        ],
        consequences: [
          'Universal policy with exceptions is the standard approach. The challenge is keeping exception lists current. Laws change. Social norms evolve. Your exception database is never "done".',
          'Per-region models give you the best cultural sensitivity but the cost and maintenance burden is enormous. 40 models, 40 training datasets, 40 update cycles.',
          'Community moderation is cost-effective but introduces bias. Who are the "trusted users"? What biases do they bring? When community norms conflict with platform policy, who wins?',
        ],
        priya: ['Manageable and scalable. Make sure the exception database has an owner and a review cycle.', '40 separate models is an engineering nightmare. Updates, training, monitoring \u2014 all multiplied by 40.', 'Community moderation has well-documented bias problems. The "trusted users" tend to reflect majority perspectives.'],
        marcus: ['I can explain this to local regulators. "We follow your laws plus our global baseline." Clean story.', 'The accuracy per region would be excellent. But the cost of maintaining 40 models is a real concern.', 'Community moderation is great for engagement but terrible for consistency. Our brand is one platform, not 40.'],
      },
      {
        title: 'What is your appeals SLA?',
        context: 'A wrongly moderated post generates an appeal. Your appeal SLA determines how long a user waits to get their voice back. Too slow and you are censoring speech. Too fast and you are not reviewing properly. Every second matters.',
        options: [
          { label: '4-Hour SLA with Priority Queue', desc: 'Appeals reviewed within 4 hours. Priority queue for accounts with large followings or verified status. Requires 24/7 moderation team.', deltas: { performance: -6, cost: -10, trust: 14 } },
          { label: '24-Hour SLA with AI Pre-Review', desc: 'AI re-evaluates the flagged content with additional context. If AI reverses, instant reinstatement. If AI upholds, human review within 24 hours.', deltas: { performance: 6, cost: -2, trust: 6 } },
          { label: '72-Hour Standard SLA', desc: 'All appeals reviewed in order within 72 hours. No priority system. Equal treatment for all users regardless of status.', deltas: { performance: 10, cost: 8, trust: -8 } },
        ],
        consequences: [
          '4-hour SLA is gold standard but expensive. 24/7 moderation coverage with 4-hour response requires significant headcount. Priority queuing for large accounts will generate accusations of preferential treatment.',
          '24-hour SLA with AI pre-review is pragmatic. The AI reversal catches obvious false positives instantly. Human review within 24 hours for the rest. This is what most platforms actually ship.',
          '72-hour SLA is defensible on paper but in practice, 3 days of silence after wrongful removal feels like censorship. Journalists, activists, and public figures will not wait 72 hours.',
        ],
        priya: ['4 hours is ambitious. Make sure your on-call moderation team is actually staffed for it.', 'The AI reversal is a nice touch. It catches the easy wins instantly and reserves humans for the hard calls.', '72 hours is too long. One wrongful removal of a journalist during a breaking news event and we are in the press for the wrong reasons.'],
        marcus: ['The priority queue will generate controversy. But a 4-hour SLA for everyone is expensive.', 'This balances speed and cost. I can defend 24 hours to most stakeholders.', 'Equal treatment sounds fair until a public figure is silenced for 3 days. The reputational cost is real.'],
      },
      {
        title: 'How transparent is your moderation?',
        context: 'Regulators, journalists, and users increasingly demand transparency about how moderation works. You need to decide what you publish and how much of your system you reveal. Transparency builds trust but also gives adversaries information about how to evade your systems.',
        options: [
          { label: 'Full Transparency Report', desc: 'Quarterly reports with: false positive rates, appeal overturn rates, response times, accuracy per violation type, regional breakdowns. Published publicly.', deltas: { performance: -4, cost: -6, trust: 16 } },
          { label: 'Summary Metrics Only', desc: 'Annual report with high-level stats: total content removed, total appeals, average response time. No per-category breakdowns or accuracy metrics.', deltas: { performance: 6, cost: 6, trust: -6 } },
          { label: 'Researcher Access Program', desc: 'Full data available to vetted academic researchers under NDA. Public report with summary metrics. Best of both worlds \u2014 transparency without helping adversaries.', deltas: { performance: -2, cost: -4, trust: 10 } },
        ],
        consequences: [
          'Full transparency is the gold standard for trust but it gives adversarial actors a roadmap. When you publish that your hate speech classifier has 94% accuracy, bad actors now know they need to get into the 6%.',
          'Summary metrics satisfy minimum regulatory requirements but will not satisfy journalists, researchers, or advocacy groups. The perception gap between what you do and what you report will generate criticism.',
          'Researcher access is the emerging best practice. Academic research validates your system without publishing a playbook for evasion. The NDA framework requires legal investment but scales well.',
        ],
        priya: ['Full transparency is the right default. The adversarial risk is real but obscurity is not security.', 'This will not satisfy the EU Digital Services Act requirements. You will need more granularity.', 'Smart approach. Let researchers validate your system. Their published papers build credibility without giving away thresholds.'],
        marcus: ['I can defend this to any regulator. The question is whether we are ready for the scrutiny that comes with real numbers.', 'We will be compared unfavorably to platforms that publish more. The "hiding something" narrative is hard to counter.', 'Researcher access is great PR. "Independently validated by MIT" is a story that writes itself.'],
      },
    ],
    stressTests: [
      {
        title: 'Coordinated Inauthentic Behaviour',
        desc: 'A network of 50,000 bot accounts begins posting borderline content designed to stay just below your classifier thresholds. Your false positive rate stays at 0.8% but harmful content volume increases 15\u00D7.',
        linkedDecision: 0,
        outcomes: [
          { grade: 'partial', text: 'Your single classifier treats each post independently. It cannot detect coordinated behaviour patterns. The bots stay just below your threshold by design.' },
          { grade: 'survived', text: 'Your staged pipeline\'s heuristic layer catches the pattern \u2014 50,000 new accounts posting similar content triggers volume-based rules before ML even runs.' },
          { grade: 'survived', text: 'Your specialist models catch subtle variations that a unified model would miss. The coordination is detected by cross-category signal correlation.' },
        ],
      },
      {
        title: 'The Wrongful Removal',
        desc: 'A journalist\'s account is suspended after posting a news article containing graphic imagery covered by press freedom protections. They tweet about it. The Guardian picks it up. Your appeals queue is 72 hours deep.',
        linkedDecision: 5,
        outcomes: [
          { grade: 'survived', text: 'Your 4-hour SLA kicks in. The journalist\'s appeal is reviewed within 3 hours. Account reinstated with an apology. The Guardian story becomes "platform responds quickly to error."' },
          { grade: 'partial', text: 'Your AI pre-review correctly identifies the press freedom context and reverses automatically within minutes. But the initial removal still generated 2 hours of press coverage.' },
          { grade: 'failed', text: '72 hours of silence while a journalist is suspended. The Guardian runs a follow-up. Advocacy groups pile on. Your "equal treatment" policy looks like indifference.' },
        ],
      },
      {
        title: 'Government Takedown Request',
        desc: 'A government requests removal of 2,000 posts that are legal in most countries but violate local law. Your pipeline has no geo-targeted moderation capability. You must respond within 24 hours.',
        linkedDecision: 4,
        outcomes: [
          { grade: 'survived', text: 'Your universal policy with local exceptions was designed for this. Your legal team cross-references the request against the exception database and responds with targeted geo-blocking.' },
          { grade: 'partial', text: 'Your per-region models handle the content classification but you have no geo-blocking infrastructure. You can identify the posts but cannot restrict them to a single country.' },
          { grade: 'failed', text: 'Your community moderators are split on whether to comply. Some regions\' trusted users refuse. You have no centralized mechanism to handle a government legal request.' },
        ],
      },
    ],
  },
  coding: {
    id: 'coding',
    title: 'AI Coding Assistant',
    difficulty: 'Expert',
    difficultyClass: 'expert',
    brief: 'Design an AI coding assistant for enterprise software teams. Your customers include banks and defence contractors \u2014 their code cannot leave their infrastructure. Developers demand sub-100ms completions. The best models are cloud-only.',
    tensions: ['Capability', 'Privacy', 'Latency'],
    decides: ['Local vs cloud model routing', 'Context and codebase indexing', 'Data residency architecture'],
    constraints: ['Sub-100ms', 'Air-gapped enterprise', '10K devs'],
    systemBrief: 'You are designing an AI coding assistant for Vanta Engineering, a 10,000-developer enterprise software company. Their clients include three major banks and two defence contractors. The security requirement is absolute: no source code leaves their private cloud. But developers are revolting against slow tools \u2014 they want sub-100ms completions. The best completion models (Claude Code, Cursor, Copilot) are all cloud-hosted. This is the core tension you are being hired to resolve. Your interview starts now.',
    diagramNodes: [
      { id: 'context', label: 'Context Engine', x: 150, y: 25 },
      { id: 'router', label: 'Router', x: 150, y: 70 },
      { id: 'local', label: 'Local Model', x: 60, y: 115 },
      { id: 'cloud', label: 'Cloud API', x: 240, y: 115 },
      { id: 'cache', label: 'Cache Layer', x: 60, y: 165 },
      { id: 'privacy', label: 'Privacy Filter', x: 240, y: 165 },
      { id: 'completion', label: 'Completion Engine', x: 150, y: 200 },
    ],
    diagramEdges: [
      ['context', 'router'],
      ['router', 'local'],
      ['router', 'cloud'],
      ['local', 'cache'],
      ['cloud', 'privacy'],
      ['cache', 'completion'],
      ['privacy', 'completion'],
    ],
    decisions: [
      {
        title: 'Where does inference run?',
        context: 'This is the founding decision. Every other choice flows from it. Your company\'s security requirement prohibits code leaving the private cloud. But your best AI models live on the internet. You need an architecture that resolves this tension.',
        options: [
          { label: 'On-Premise Model Deployment', desc: 'Deploy open-weight models (Codestral, DeepSeek-Coder, Qwen-Coder) on private GPU infrastructure. Code never leaves. Performance gap vs cloud frontier: ~15-20%.', deltas: { performance: -8, cost: -15, trust: 18 } },
          { label: 'Hybrid Routing Architecture', desc: 'Local model for code that touches sensitive files (flagged by policy engine). Cloud model for non-sensitive completions (documentation, test boilerplate, configs).', deltas: { performance: 10, cost: -6, trust: 10 } },
          { label: 'Private Cloud Proxy', desc: 'Deploy cloud model API inside the company\'s private cloud (VPC). Code goes to the model but stays within the network boundary. Requires cloud provider agreement.', deltas: { performance: 5, cost: -10, trust: 14 } },
        ],
        consequences: [
          'On-premise gives you the strongest security story. The 15-20% performance gap is real but narrows every quarter as open-weight models improve. The hardware cost is significant: estimate \u00A32-4M in GPU infrastructure for 10,000 developers.',
          'Hybrid routing is the pragmatic solution. The policy engine that classifies sensitive vs non-sensitive files is the critical component \u2014 and it is harder to build correctly than it sounds.',
          'Private cloud proxy resolves the technical problem but the legal problem remains. Your defence contractor clients may not accept "stays within AWS" as "does not leave our infrastructure" even with a private VPC.',
        ],
        priya: [
          'Strongest security posture. The open-weight model ecosystem is improving fast. In 12 months the gap will be smaller.',
          'The policy engine is the weak link. One misclassification sends sensitive code to the cloud. How do you test for that?',
          'Technically sound but the legal definition of "our infrastructure" differs between clients. Get written sign-off from each one.',
        ],
        marcus: [
          'Defence clients will love this. Banks will ask about the performance gap. Can we show benchmarks?',
          'The dual-mode story is complicated. Can a developer explain to their security team which code goes where?',
          'Legal will need to review every client contract. "Private VPC" is not the same as "on our hardware" in legal terms.',
        ],
      },
      {
        title: 'How much context does the model get?',
        context: 'A code completion model is only as good as the context it receives. More context means better completions but also higher latency, higher cost, and more data moving through your system. The context window is your accuracy lever.',
        options: [
          { label: 'Whole Repository Indexing', desc: 'Index the entire codebase into a vector database. RAG retrieves relevant files, imports, and patterns for every completion. Maximum context, maximum cost.', deltas: { performance: -4, cost: -10, trust: 8 } },
          { label: 'File-Level + Imports', desc: 'Context is the current file plus imported modules. Fast, simple, covers 80% of cases. Misses cross-file patterns and architectural conventions.', deltas: { performance: 10, cost: 6, trust: 2 } },
          { label: 'Smart Context Selection', desc: 'AST analysis identifies relevant symbols, recently edited files, and git blame context. Dynamic context window sized per request.', deltas: { performance: 4, cost: -4, trust: 10 } },
        ],
        consequences: [
          'Whole-repo indexing gives the best completions for complex, cross-file work. But indexing 10,000 developers\' repositories requires significant infrastructure. Reindexing after every commit adds latency.',
          'File-level context is fast and simple. It works well for single-file completions but struggles with multi-file refactors, API usage patterns, and architectural consistency.',
          'Smart context selection is the emerging best practice. AST-based symbol resolution gives you cross-file awareness without indexing everything. The complexity is in the context selection algorithm itself.',
        ],
        priya: ['The indexing infrastructure for 10K repos is non-trivial. Incremental indexing with commit hooks is the path.', 'Fast and predictable. Developers will not be surprised by what the model knows or does not know.', 'AST analysis is the right approach but it needs to be fast. If context selection adds 50ms, you have blown half your latency budget.'],
        marcus: ['The completion quality improvement with repo-level context is real. Can we justify the infrastructure cost?', 'Simple story for security review. "The model only sees the file you are editing." Easy to explain.', 'I like that context scales with complexity. Simple edits get fast context, complex work gets rich context.'],
      },
      {
        title: 'Which model tier do you deploy?',
        context: 'Your model choice directly determines completion quality, latency, and cost. Frontier models produce the best code but are slower and more expensive. Small models are fast but miss nuanced patterns. At 10,000 developers, the cost difference is enormous.',
        options: [
          { label: 'Frontier Code Model', desc: 'Latest Codestral or DeepSeek-Coder V3. Best completion quality. ~200ms per completion on dedicated GPUs.', deltas: { performance: -4, cost: -12, trust: 12 } },
          { label: 'Optimised Small Model', desc: 'Quantized 7B model (Qwen2.5-Coder-7B). Sub-50ms completions. Good for line-level completions, weaker on multi-line.', deltas: { performance: 12, cost: 10, trust: -2 } },
          { label: 'Tiered: Small + Frontier Fallback', desc: 'Small model for keystroke-level completions. Frontier model for explicit "generate" requests and multi-line blocks.', deltas: { performance: 6, cost: -2, trust: 8 } },
        ],
        consequences: [
          'Frontier models produce noticeably better multi-line completions and understand complex patterns. But 200ms per completion is perceptible \u2014 developers feel the lag on every keystroke.',
          'The 7B model delivers instant completions that feel native. Line completions are strong. But ask it to generate a function body and the quality gap versus frontier is obvious.',
          'Tiered routing is elegant and cost-effective. The UX must clearly distinguish between instant suggestions and generated blocks so developers know what to expect.',
        ],
        priya: ['200ms is above your target. You will need speculative decoding or KV cache optimization to get under 100ms.', 'Sub-50ms is excellent for flow state. The quality trade-off is real but acceptable for most completions.', 'Smart routing. Make sure the transition between tiers is invisible. Developers should not feel the model switch.'],
        marcus: ['Developers will compare us to Copilot. If our quality is noticeably worse, adoption drops.', 'Speed matters more than developers admit. A fast mediocre tool beats a slow great one for daily use.', 'I like the flexibility. Power users get frontier quality when they need it. Everyone gets fast suggestions by default.'],
      },
      {
        title: 'How do you hit sub-100ms?',
        context: 'Your latency target is aggressive. Even with a fast model, tokenization + inference + detokenization + network round-trip adds up. You need a latency optimization strategy that does not sacrifice quality.',
        options: [
          { label: 'Speculative Decoding', desc: 'Small draft model generates candidates. Large model verifies in parallel. Gets frontier quality at near-small-model speed. Complex to implement.', deltas: { performance: 10, cost: -6, trust: 6 } },
          { label: 'KV Cache + Prefix Warmup', desc: 'Pre-compute attention KV cache for common prefixes (imports, class definitions). Cache survives across completions in the same file.', deltas: { performance: 8, cost: -2, trust: 4 } },
          { label: 'Predictive Pre-fetching', desc: 'Predict what the developer will type next based on cursor position and edit patterns. Pre-compute completions before they are requested.', deltas: { performance: 12, cost: -8, trust: 2 } },
        ],
        consequences: [
          'Speculative decoding is the most promising latency technique. You get 80-90% of frontier quality at 2-3\u00D7 the speed. The implementation complexity is significant but the results are worth it.',
          'KV caching eliminates redundant computation for repeated context. In a single file editing session, this can reduce latency by 40-60% after the first completion.',
          'Pre-fetching is the most aggressive optimization. It works brilliantly when predictions are correct and wastes compute when they are wrong. At scale, the wasted compute adds up.',
        ],
        priya: ['Speculative decoding is cutting edge. Make sure your engineering team has the depth to implement and maintain it.', 'KV caching is well-understood and reliable. Lower ceiling but lower risk.', 'Pre-fetching accuracy degrades on unfamiliar code patterns. Your hit rate will vary wildly between developers.'],
        marcus: ['If this gets us frontier quality at fast speed, developers will love us. That is the competitive moat.', 'Reliable and explainable. If someone asks "why is it fast?" we have a clear answer.', 'The developer experience of instant suggestions is magical when it works. The wasted compute is invisible to users.'],
      },
      {
        title: 'How much should developers trust the AI?',
        context: 'Your coding assistant suggests code. Developers can accept, modify, or reject. The trust calibration question: should the tool auto-insert suggestions (like Copilot) or require explicit approval? This affects adoption, productivity, and bug introduction rates.',
        options: [
          { label: 'Inline Auto-Suggestions', desc: 'Ghost text appears as developer types. Tab to accept. Most natural flow. Risk: developers tab-accept without reading.',
            deltas: { performance: 10, cost: 2, trust: -6 } },
          { label: 'Suggestion-Only with Diff View', desc: 'Completions shown in a side panel with clear diff highlighting. Developer must explicitly click to apply. Slower but more deliberate.',
            deltas: { performance: -8, cost: 4, trust: 12 } },
          { label: 'Adaptive Trust Based on Confidence', desc: 'High-confidence single-line completions auto-suggest inline. Multi-line or low-confidence suggestions go to diff panel. Trust level adapts to developer behaviour.',
            deltas: { performance: 6, cost: -2, trust: 6 } },
        ],
        consequences: [
          'Inline suggestions maximize adoption and flow state. Studies show developers accept 30-40% of suggestions. The risk: security-sensitive code accepted without review.',
          'Diff view forces deliberate review but breaks flow state. Adoption rates drop 40% compared to inline suggestions. Developers feel like the tool slows them down.',
          'Adaptive trust is the most sophisticated UX. It requires confidence calibration and user behavior tracking. Done well, it is the best of both worlds.',
        ],
        priya: ['For enterprise, inline auto-accept of code is a security conversation. Your CISO will have opinions.', 'Diff view is the right choice for security-sensitive environments. Developers will complain about speed but security teams will approve.', 'The adaptive model needs careful calibration. If developers learn to always tab-accept, the adaptive system degrades.'],
        marcus: ['Developer adoption is our metric. If the tool breaks flow state, they will turn it off. We need inline.', 'Security teams love diff view. Developers hate it. This is the tension we have to navigate.', 'Adaptive is the right vision. The question is whether we can ship it well enough for v1 or if we need to pick a simpler mode first.'],
      },
      {
        title: 'How do you keep the index fresh?',
        context: 'Your codebase context is only useful if it reflects the current state of the code. 10,000 developers push thousands of commits per day. Your indexing strategy determines whether the model suggests patterns from yesterday or patterns from six months ago.',
        options: [
          { label: 'Real-Time Incremental Indexing', desc: 'Git hooks trigger re-indexing on every push. Affected files and their dependents updated within seconds. Always current. High infrastructure cost.',
            deltas: { performance: -4, cost: -10, trust: 10 } },
          { label: 'Nightly Batch Re-index', desc: 'Full re-index runs every night. During the day, the model works with yesterday\'s codebase snapshot. Simple and cheap.',
            deltas: { performance: 8, cost: 8, trust: -6 } },
          { label: 'On-Demand Indexing', desc: 'No background indexing. When a developer opens a file, index that file and its imports on the fly. Pay-per-use model.',
            deltas: { performance: 4, cost: 4, trust: 2 } },
        ],
        consequences: [
          'Real-time indexing gives you the freshest context but processing thousands of commits per day requires dedicated infrastructure. The indexing pipeline itself needs monitoring and alerting.',
          'Nightly re-indexing is simple but developers working on actively changing code will get stale suggestions. In a fast-moving codebase, yesterday\'s patterns may already be deprecated.',
          'On-demand indexing is efficient but adds latency to the first completion in each file. Cold start penalty of 1-3 seconds when opening a new file.',
        ],
        priya: ['Real-time is the right architecture. The infrastructure cost is justified by suggestion accuracy. Stale context is worse than no context.', 'Nightly batch is acceptable for stable codebases. For active development, developers will notice stale suggestions within hours.', 'On-demand has a nice pay-per-use property. The cold start penalty is annoying but acceptable if subsequent suggestions are fast.'],
        marcus: ['Developers expect the tool to know their code. If it suggests deprecated patterns, trust drops immediately.', 'Can we show developers when their index was last updated? Transparency about staleness builds trust.', 'The cold start penalty means the first impression of every file is "the tool is slow." First impressions matter.'],
      },
      {
        title: 'The air-gap ultimatum',
        context: 'One of your three bank clients\' legal teams has concluded that even a private VPC is non-compliant with their data residency requirements. They want a fully air-gapped deployment with zero network connectivity to any external service. This client represents 15% of Vanta\'s revenue.',
        options: [
          { label: 'Build Air-Gapped Tier', desc: 'Create a fully isolated deployment tier. Own hardware, own models, own updates. Ship model updates on physical media. Additional \u00A31.2M/year in infrastructure and staffing.',
            deltas: { performance: -6, cost: -14, trust: 16 } },
          { label: 'Negotiate Compromise Architecture', desc: 'Propose a technical compromise: encrypted model inference with no data persistence. Code enters, completion exits, nothing stored. Try to satisfy the spirit of air-gap without the full cost.',
            deltas: { performance: 4, cost: -4, trust: 4 } },
          { label: 'Decline the Requirement', desc: 'Tell the client this requirement is architecturally incompatible with your product. Risk losing the client. Focus engineering resources on serving the other 85%.',
            deltas: { performance: 8, cost: 10, trust: -12 } },
        ],
        consequences: [
          '\u00A31.2M/year is significant but this client represents 15% of revenue. The air-gapped tier also becomes a selling point for other security-conscious clients. The ROI calculation may justify it.',
          'The compromise is technically sound but legally untested with this specific client. "No data persistence" may not satisfy their legal team\'s definition of air-gapped. You need their lawyers to agree before you build it.',
          'Declining a 15% revenue client is a bold business decision. It focuses your engineering team but risks setting a precedent that you cannot serve the most security-conscious enterprises.',
        ],
        priya: ['The air-gapped tier is hard to build but it becomes your competitive advantage. No other vendor offers this.', 'This is a negotiation, not an architecture decision. If their lawyers accept it, it works. If not, you have wasted 3 months.', 'Walking away from 15% of revenue is a clear signal to the market about what you will and will not build. Choose carefully.'],
        marcus: ['15% of revenue buys a lot of engineering time. I would build the tier. It opens doors to other defence clients.', 'This needs to be a conversation with their CISO, not just their legal team. Technical compromise might satisfy both.', 'If we lose this client, the competitors who serve them will use it against us in every pitch. The "they could not handle enterprise" narrative sticks.'],
      },
    ],
    stressTests: [
      {
        title: 'The Security Audit',
        desc: 'Your defence contractor client commissions an independent security audit. The auditor asks: show me evidence that no customer source code traversed a network boundary in the past 90 days.',
        linkedDecision: 0,
        outcomes: [
          { grade: 'survived', text: 'Your on-premise deployment has complete network isolation logs. The auditor verifies that all inference happened on local GPUs. Audit passes with zero findings.' },
          { grade: 'partial', text: 'Your hybrid routing logs show that non-sensitive code went to cloud. The auditor questions your "sensitive" classification accuracy. You need to prove the policy engine never misclassified.' },
          { grade: 'failed', text: 'Your private VPC logs show code traversing to an external API endpoint. Even within the VPC, the auditor classifies this as a network boundary crossing. Audit fails.' },
        ],
      },
      {
        title: 'Model Quality Regression',
        desc: 'Your local model vendor releases an update. After deployment, developer satisfaction scores drop 22%. Investigation reveals the new version is worse at Rust and Go \u2014 which your developers use heavily.',
        linkedDecision: 2,
        outcomes: [
          { grade: 'partial', text: 'Your frontier model is the one that regressed. Rolling back requires GPU reallocation and 4 hours of downtime. Developers are frustrated for a full day.' },
          { grade: 'survived', text: 'Your small optimised model was unaffected \u2014 it uses a different base model. You roll back the frontier tier and the small model continues serving basic completions seamlessly.' },
          { grade: 'survived', text: 'Your tiered system continues serving basic completions from the unaffected small model. You roll back only the frontier tier. Developers barely notice because 80% of completions come from the fast tier.' },
        ],
      },
      {
        title: 'The Scale Inflection',
        desc: 'Vanta acquires a 3,000-developer company running on Windows machines with no GPU infrastructure. They need your coding assistant working for them in 6 weeks.',
        linkedDecision: 6,
        outcomes: [
          { grade: 'failed', text: 'Your air-gapped tier requires on-premise GPUs that take 12 weeks to procure and install. The acquisition timeline is incompatible with your architecture.' },
          { grade: 'survived', text: 'Your compromise architecture works immediately \u2014 no local GPU needed, encrypted inference via network. The new developers are onboarded within 2 weeks.' },
          { grade: 'partial', text: 'You declined the air-gap requirement, so your standard cloud-based tier works immediately. But the acquired company has defence contracts that require air-gap. You have the same problem again.' },
        ],
      },
    ],
  },
}

const SCENARIO_ICONS = {
  support: (
    <svg className="sdi-scenario-icon" viewBox="0 0 48 48" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="18" r="10" />
      <path d="M14 18c0-5.5 4.5-10 10-10s10 4.5 10 10" />
      <path d="M14 18v4a2 2 0 0 0 2 2h0M34 18v4a2 2 0 0 1-2 2h0" />
      <path d="M20 30h8l4 6H16l4-6z" />
    </svg>
  ),
  moderation: (
    <svg className="sdi-scenario-icon" viewBox="0 0 48 48" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 4L6 12v12c0 10 8 16 18 20 10-4 18-10 18-20V12L24 4z" />
      <circle cx="24" cy="22" r="6" />
      <circle cx="24" cy="22" r="2" fill="#F59E0B" />
    </svg>
  ),
  coding: (
    <svg className="sdi-scenario-icon" viewBox="0 0 48 48" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 14 8 24 16 34" />
      <polyline points="32 14 40 24 32 34" />
      <line x1="22" y1="10" x2="26" y2="38" />
      <path d="M36 8l3 3-3 3M39 8h-5" />
    </svg>
  ),
}

const CONCEPT_PILLS = ['RAG', 'Agent Autonomy', 'Latency vs Quality', 'Confidence Scoring', 'Human-in-the-Loop', 'Scaling', 'Compliance', 'Trade-off Analysis', 'System Architecture', 'Production AI']

/* ══════════════════════════════════════
   HELPERS
   ══════════════════════════════════════ */

function meterColor(value) {
  if (value >= 70) return '#34C759'
  if (value >= 50) return '#F59E0B'
  return '#FF3B30'
}

function computeFinalScore(scores, stressResults) {
  const meterAvg = (scores.performance + scores.cost + scores.trust) / 3
  const stressBonus = stressResults.reduce((sum, r) => {
    if (r.grade === 'survived') return sum + 5
    if (r.grade === 'partial') return sum + 2
    return sum
  }, 0)
  return Math.min(100, Math.round(meterAvg + stressBonus))
}

function getScoreBand(score) {
  if (score >= 85) return { label: 'Outstanding', cls: 'outstanding', tagline: 'Your architecture is production-ready.' }
  if (score >= 70) return { label: 'Strong', cls: 'strong', tagline: 'Solid design with manageable trade-offs.' }
  if (score >= 50) return { label: 'Needs Refinement', cls: 'needs-work', tagline: 'Real issues to address before launch.' }
  return { label: 'Back to the Drawing Board', cls: 'weak', tagline: 'Fundamental architectural problems.' }
}

function getInsight(scores) {
  if (scores.trust > scores.cost + 10 && scores.trust > scores.performance) {
    return 'You built a conservative architecture. Correct for regulated environments. The cost of trust is real but the cost of losing it is higher.'
  }
  const diff = Math.max(scores.performance, scores.cost, scores.trust) - Math.min(scores.performance, scores.cost, scores.trust)
  if (diff < 15) {
    return 'You made pragmatic trade-offs throughout. This is what real systems look like \u2014 not optimal on any single axis, defensible on all three.'
  }
  return 'You built a fast, efficient system that will struggle under regulatory or reputational scrutiny. Speed is valuable. Trustworthiness is not optional.'
}

function getWeakest(scores) {
  const entries = Object.entries(scores)
  entries.sort((a, b) => a[1] - b[1])
  return entries[0][0]
}

/* ══════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════ */

function SystemDesignInterview({ onSwitchTab }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const gameRef = useRef(null)
  const timersRef = useRef([])

  /* ── Persisted entry state ── */
  const [showEntry, setShowEntry] = usePersistedState('sdi-entry', true)
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (!showEntry) return
    setVisibleLines(0)
    const t1 = setTimeout(() => setVisibleLines(1), 300)
    const t2 = setTimeout(() => setVisibleLines(2), 600)
    const t3 = setTimeout(() => setVisibleLines(3), 900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [showEntry])

  /* ── Game state (resets every play) ── */
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [gamePhase, setGamePhase] = useState('scenario') // scenario | playing | stress | results
  const [decision, setDecision] = useState(0)
  const [choices, setChoices] = useState([])
  const [scores, setScores] = useState({ performance: 60, cost: 60, trust: 60 })
  const [panelReactions, setPanelReactions] = useState([])
  const [stressResults, setStressResults] = useState([])
  const [finalScore, setFinalScore] = useState(null)

  /* ── UI state ── */
  const [selectedOption, setSelectedOption] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [showPriya, setShowPriya] = useState(false)
  const [showMarcus, setShowMarcus] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [deltas, setDeltas] = useState(null)
  const [stressIndex, setStressIndex] = useState(-1)
  const [stressLoading, setStressLoading] = useState(true)
  const [stressOutcome, setStressOutcome] = useState(null)
  const [expandedReview, setExpandedReview] = useState(null)
  const [hoveredOption, setHoveredOption] = useState(null)

  /* ── Best scores ── */
  const [bestScores, setBestScores] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sdi-best-scores')) || {} } catch { return {} }
  })

  /* ── Cleanup ── */
  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function scrollToTop() {
    requestAnimationFrame(() => {
      let el = gameRef.current
      while (el) {
        if (el.scrollTop > 0) el.scrollTop = 0
        el = el.parentElement
      }
      window.scrollTo(0, 0)
    })
  }

  /* ── Scroll on decision change ── */
  useEffect(() => {
    if (gamePhase === 'playing') window.scrollTo(0, 0)
  }, [decision, gamePhase])

  /* ── Entry dismiss ── */
  const handleEntryDismiss = useCallback(() => {
    setShowEntry(false)
    markModuleStarted('system-design-interview')
  }, [setShowEntry, markModuleStarted])

  /* ── Start Interview ── */
  function handleStartInterview() {
    if (!selectedScenario) return
    setGamePhase('playing')
    setDecision(0)
    setChoices([])
    setScores({ performance: 60, cost: 60, trust: 60 })
    setPanelReactions([])
    setStressResults([])
    setFinalScore(null)
    setSelectedOption(null)
    setConfirmed(false)
    setShowPriya(false)
    setShowMarcus(false)
    setShowNext(false)
    setDeltas(null)
    scrollToTop()
  }

  /* ── Select option ── */
  function handleSelectOption(idx) {
    if (confirmed) return
    setSelectedOption(idx)
  }

  /* ── Confirm decision ── */
  function handleConfirm() {
    if (selectedOption === null || confirmed) return
    clearTimers()
    setConfirmed(true)

    const scenario = SCENARIOS[selectedScenario]
    const d = scenario.decisions[decision]
    const opt = d.options[selectedOption]
    const newDeltas = opt.deltas

    // Apply score changes
    setScores(prev => ({
      performance: Math.max(0, Math.min(100, prev.performance + (newDeltas.performance || 0))),
      cost: Math.max(0, Math.min(100, prev.cost + (newDeltas.cost || 0))),
      trust: Math.max(0, Math.min(100, prev.trust + (newDeltas.trust || 0))),
    }))

    setDeltas(newDeltas)
    setChoices(prev => [...prev, selectedOption])
    setPanelReactions(prev => [...prev, {
      priya: d.priya[selectedOption],
      marcus: d.marcus[selectedOption],
    }])

    // Stagger reactions
    timersRef.current.push(setTimeout(() => setShowPriya(true), 400))
    timersRef.current.push(setTimeout(() => setShowMarcus(true), 800))
    timersRef.current.push(setTimeout(() => {
      setShowNext(true)
      setDeltas(null)
    }, 1200))
  }

  /* ── Next decision ── */
  function handleNextDecision() {
    clearTimers()
    const nextDec = decision + 1

    if (nextDec >= 7) {
      // All decisions made, go to stress tests
      setGamePhase('stress')
      setStressIndex(-1)
      setStressLoading(true)
      scrollToTop()

      // Start stress test prep
      timersRef.current.push(setTimeout(() => {
        setStressIndex(0)
        setStressLoading(false)
      }, 2500))
    } else {
      setDecision(nextDec)
      setSelectedOption(null)
      setConfirmed(false)
      setShowPriya(false)
      setShowMarcus(false)
      setShowNext(false)
      setDeltas(null)
      scrollToTop()
    }
  }

  /* ── Stress test outcome ── */
  function handleRevealStressOutcome() {
    const scenario = SCENARIOS[selectedScenario]
    const test = scenario.stressTests[stressIndex]
    const linkedChoice = choices[test.linkedDecision] ?? 0
    const outcome = test.outcomes[linkedChoice]

    setStressOutcome(outcome)
    setStressResults(prev => [...prev, outcome])

    // Apply stress test score adjustment
    const adjust = outcome.grade === 'survived' ? 3 : outcome.grade === 'partial' ? -2 : -5
    setScores(prev => ({
      performance: Math.max(0, Math.min(100, prev.performance + adjust)),
      cost: Math.max(0, Math.min(100, prev.cost + adjust)),
      trust: Math.max(0, Math.min(100, prev.trust + adjust)),
    }))
  }

  /* ── Next stress test ── */
  function handleNextStressTest() {
    clearTimers()
    setStressOutcome(null)
    const nextIdx = stressIndex + 1

    if (nextIdx >= 3) {
      // All stress tests done, compute final score
      const score = computeFinalScore(scores, [...stressResults])
      setFinalScore(score)
      setGamePhase('results')

      // Mark complete on first completion
      markModuleComplete('system-design-interview')

      // Save best score
      const scenarioId = selectedScenario
      if (!bestScores[scenarioId] || score > bestScores[scenarioId]) {
        const updated = { ...bestScores, [scenarioId]: score }
        setBestScores(updated)
        try { localStorage.setItem('sdi-best-scores', JSON.stringify(updated)) } catch {}
      }

      scrollToTop()
    } else {
      setStressIndex(nextIdx)
    }
  }

  /* ── Start Over ── */
  const handleStartOver = useCallback(() => {
    clearTimers()
    setSelectedScenario(null)
    setGamePhase('scenario')
    setDecision(0)
    setChoices([])
    setScores({ performance: 60, cost: 60, trust: 60 })
    setPanelReactions([])
    setStressResults([])
    setFinalScore(null)
    setSelectedOption(null)
    setConfirmed(false)
    setShowPriya(false)
    setShowMarcus(false)
    setShowNext(false)
    setDeltas(null)
    setStressIndex(-1)
    setStressLoading(true)
    setStressOutcome(null)
    setExpandedReview(null)
    setHoveredOption(null)
    scrollToTop()
  }, [])

  /* ── Play different scenario ── */
  function handleTryOther() {
    handleStartOver()
  }

  /* ── Play again (same scenario) ── */
  function handlePlayAgain() {
    const scenario = selectedScenario
    handleStartOver()
    setSelectedScenario(scenario)
  }

  /* ── Quick-select scenario from results ── */
  function handleQuickSelect(scenarioId) {
    handleStartOver()
    setSelectedScenario(scenarioId)
  }

  const scenario = selectedScenario ? SCENARIOS[selectedScenario] : null

  /* ══════════════════════════════════════
     RENDER — ENTRY SCREEN
     ══════════════════════════════════════ */

  if (showEntry) {
    return (
      <div className="sdi-root" ref={gameRef}>
        <div className="sdi-entry">
          <div className="sdi-entry-icon">
            <ModuleIcon module="system-design-interview" size={72} style={{ color: '#F59E0B' }} />
          </div>
          <h1 className="sdi-entry-title">System Design Interview</h1>
          <div className="sdi-tagline">
            <div className={`sdi-tagline-line ${visibleLines >= 1 ? 'visible' : ''}`}>You have 45 minutes.</div>
            <div className={`sdi-tagline-line ${visibleLines >= 2 ? 'visible' : ''}`}>Design an AI system that actually works.</div>
            <div className={`sdi-tagline-line ${visibleLines >= 3 ? 'visible' : ''}`}>Two engineers will push back on every choice.</div>
          </div>
          <div className="sdi-briefing">
            Real system design is not about knowing the right answer. It is about making informed trade-offs and defending them. In this interview you will make seven consecutive architecture decisions. Each one shifts your system&rsquo;s performance, cost, and trustworthiness. Choose carefully &mdash; your choices compound.
          </div>
          <div className="sdi-stat-badges">
            <span className="sdi-stat-badge">3 Scenarios</span>
            <span className="sdi-stat-badge">7 Decisions Each</span>
            <span className="sdi-stat-badge">Replayable</span>
          </div>
          <button className="sdi-entry-btn" onClick={handleEntryDismiss}>
            Enter the Interview Room
          </button>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════
     RENDER — SCENARIO SELECTION
     ══════════════════════════════════════ */

  if (gamePhase === 'scenario') {
    return (
      <div className="sdi-root" ref={gameRef}>
        <div className="sdi-scenario-screen">
          <div className="sdi-scenario-header">
            <h2>Choose Your System</h2>
            <p>Each scenario teaches different trade-offs. All three are worth playing.</p>
          </div>
          <div className="sdi-scenario-grid">
            {Object.values(SCENARIOS).map(s => (
              <div
                key={s.id}
                className={`sdi-scenario-card${selectedScenario === s.id ? ' selected' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedScenario(s.id)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedScenario(s.id) } }}
              >
                <div className="sdi-scenario-top-row">
                  {SCENARIO_ICONS[s.id]}
                  <span className={`sdi-difficulty-badge ${s.difficultyClass}`}>{s.difficulty}</span>
                </div>
                <h3>{s.title}</h3>
                <p className="sdi-scenario-brief">{s.brief}</p>
                <div className="sdi-tension-pills">
                  {s.tensions.map((t, i) => (
                    <span key={t}>
                      <span className="sdi-tension-pill">{t}</span>
                      {i < s.tensions.length - 1 && <span className="sdi-tension-vs"> vs </span>}
                    </span>
                  ))}
                </div>
                <div className="sdi-decide-list">
                  <strong>What you will decide:</strong>
                  {s.decides.map(d => <span key={d}>&bull; {d}<br /></span>)}
                </div>
                {bestScores[s.id] && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>
                    Best: {bestScores[s.id]}/100
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            className="sdi-start-btn"
            disabled={!selectedScenario}
            onClick={handleStartInterview}
          >
            Start Interview
          </button>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════
     RENDER — PLAYING (Decision Phase)
     ══════════════════════════════════════ */

  if (gamePhase === 'playing' && scenario) {
    const d = scenario.decisions[decision]
    const activeNodes = Math.min(scenario.diagramNodes.length, decision + 1)

    return (
      <div className="sdi-root" ref={gameRef}>
        {/* System brief on first decision */}
        {decision === 0 && (
          <div className="sdi-system-brief">
            <strong>{scenario.title}</strong> &mdash; {scenario.systemBrief}
          </div>
        )}

        <div className="sdi-game-layout">
          {/* LEFT PANEL */}
          <div className="sdi-left-panel">
            {/* Previous decisions summary */}
            {choices.length > 0 && (
              <div className="sdi-prev-decisions">
                {choices.map((choiceIdx, i) => {
                  const prevD = scenario.decisions[i]
                  const opt = prevD.options[choiceIdx]
                  const d2 = opt.deltas
                  return (
                    <div key={i} className="sdi-prev-row">
                      <span className="sdi-prev-num">{i + 1}.</span>
                      <span className="sdi-prev-choice">{opt.label}</span>
                      {d2.performance !== 0 && <span className={`sdi-prev-delta ${d2.performance > 0 ? 'pos' : 'neg'}`}>{d2.performance > 0 ? '+' : ''}{d2.performance}P</span>}
                      {d2.cost !== 0 && <span className={`sdi-prev-delta ${d2.cost > 0 ? 'pos' : 'neg'}`}>{d2.cost > 0 ? '+' : ''}{d2.cost}C</span>}
                      {d2.trust !== 0 && <span className={`sdi-prev-delta ${d2.trust > 0 ? 'pos' : 'neg'}`}>{d2.trust > 0 ? '+' : ''}{d2.trust}T</span>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Current Decision Card */}
            <div className="sdi-decision-card" key={decision}>
              <div className="sdi-decision-num">Decision {decision + 1} of 7</div>
              <div className="sdi-decision-title">{d.title}</div>
              <div className="sdi-decision-context">{d.context}</div>
              <div className="sdi-constraints">
                {scenario.constraints.map(c => (
                  <span key={c} className="sdi-constraint-pill">{c}</span>
                ))}
              </div>

              {/* Options */}
              <div className="sdi-options">
                {d.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`sdi-option${selectedOption === i && !confirmed ? ' selected' : ''}${confirmed && selectedOption === i ? ' chosen' : ''}${confirmed && selectedOption !== i ? ' disabled' : ''}`}
                    role="button"
                    tabIndex={confirmed ? -1 : 0}
                    onClick={() => handleSelectOption(i)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectOption(i) } }}
                    onMouseEnter={() => !confirmed && setHoveredOption(i)}
                    onMouseLeave={() => setHoveredOption(null)}
                  >
                    <div className="sdi-option-label">{opt.label}</div>
                    <div className="sdi-option-desc">{opt.desc}</div>
                    {(hoveredOption === i || selectedOption === i) && !confirmed && (
                      <div className="sdi-tradeoff-preview">
                        <span className={`sdi-tradeoff-pill ${opt.deltas.performance > 0 ? 'positive' : opt.deltas.performance < 0 ? 'negative' : 'neutral'}`}>
                          {opt.deltas.performance > 0 ? '▲' : opt.deltas.performance < 0 ? '▼' : '—'} {opt.deltas.performance > 0 ? '+' : ''}{opt.deltas.performance} Perf
                        </span>
                        <span className={`sdi-tradeoff-pill ${opt.deltas.cost > 0 ? 'positive' : opt.deltas.cost < 0 ? 'negative' : 'neutral'}`}>
                          {opt.deltas.cost > 0 ? '▲' : opt.deltas.cost < 0 ? '▼' : '—'} {opt.deltas.cost > 0 ? '+' : ''}{opt.deltas.cost} Cost
                        </span>
                        <span className={`sdi-tradeoff-pill ${opt.deltas.trust > 0 ? 'positive' : opt.deltas.trust < 0 ? 'negative' : 'neutral'}`}>
                          {opt.deltas.trust > 0 ? '▲' : opt.deltas.trust < 0 ? '▼' : '—'} {opt.deltas.trust > 0 ? '+' : ''}{opt.deltas.trust} Trust
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Confirm button */}
              {!confirmed && (
                <button
                  className="sdi-confirm-btn"
                  disabled={selectedOption === null}
                  onClick={handleConfirm}
                >
                  Confirm Decision
                </button>
              )}

              {/* Consequence */}
              {confirmed && (
                <>
                  <div className="sdi-consequence">
                    {d.consequences[selectedOption]}
                  </div>

                  {/* Reactions */}
                  <div className="sdi-reactions">
                    {showPriya && (
                      <div className="sdi-reaction">
                        <div className="sdi-reaction-avatar priya">P</div>
                        <div className="sdi-reaction-body">
                          <div className="sdi-reaction-name">
                            <span className="name">Priya</span>
                            <span className="sdi-reaction-role priya">Staff Engineer</span>
                          </div>
                          <div className="sdi-reaction-bubble priya">
                            {panelReactions[panelReactions.length - 1]?.priya}
                          </div>
                        </div>
                      </div>
                    )}
                    {showMarcus && (
                      <div className="sdi-reaction">
                        <div className="sdi-reaction-avatar marcus">M</div>
                        <div className="sdi-reaction-body">
                          <div className="sdi-reaction-name">
                            <span className="name">Marcus</span>
                            <span className="sdi-reaction-role marcus">PM</span>
                          </div>
                          <div className="sdi-reaction-bubble marcus">
                            {panelReactions[panelReactions.length - 1]?.marcus}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Next button */}
                  {showNext && (
                    <button className="sdi-next-btn" onClick={handleNextDecision}>
                      {decision < 6 ? 'Next Decision →' : 'Complete Design →'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="sdi-right-panel">
            {/* System Diagram */}
            <div className="sdi-diagram-wrap">
              <svg className="sdi-diagram-svg" viewBox="0 0 300 220" fill="none">
                {/* Connection edges (rendered behind nodes) */}
                {(scenario.diagramEdges || []).map(([fromId, toId], i) => {
                  const fromNode = scenario.diagramNodes.find(n => n.id === fromId)
                  const toNode = scenario.diagramNodes.find(n => n.id === toId)
                  if (!fromNode || !toNode) return null
                  const fromIdx = scenario.diagramNodes.indexOf(fromNode)
                  const toIdx = scenario.diagramNodes.indexOf(toNode)
                  const isDrawn = fromIdx < activeNodes && toIdx < activeNodes
                  // Smart edge routing: pick exit/entry side based on relative position
                  const dx = toNode.x - fromNode.x
                  const dy = toNode.y - fromNode.y
                  let x1, y1, x2, y2
                  if (Math.abs(dy) < 10) {
                    // Horizontal peers — connect right edge to left edge
                    x1 = fromNode.x + 55; y1 = fromNode.y
                    x2 = toNode.x - 55; y2 = toNode.y
                  } else if (Math.abs(dx) < 10) {
                    // Vertical stack — connect bottom to top
                    x1 = fromNode.x; y1 = fromNode.y + 14
                    x2 = toNode.x; y2 = toNode.y - 14
                  } else {
                    // Diagonal — exit bottom of from, enter top of to
                    x1 = fromNode.x + (dx > 0 ? 30 : -30); y1 = fromNode.y + 14
                    x2 = toNode.x + (dx > 0 ? -30 : 30); y2 = toNode.y - 14
                  }
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={`sdi-diagram-line${isDrawn ? ' drawn' : ''}`} />
                  )
                })}
                {/* Nodes */}
                {scenario.diagramNodes.map((node, i) => {
                  const isActive = i < activeNodes
                  const isNew = i === activeNodes - 1 && confirmed
                  return (
                    <g key={node.id} className={`sdi-diagram-node ${isActive ? 'active' : 'ghost'}${isNew ? ' pulse' : ''}`}>
                      <rect x={node.x - 55} y={node.y - 14} width={110} height={28} rx={6} stroke={isActive ? '#F59E0B' : 'var(--border)'} strokeWidth={1.5} fill={isActive ? 'rgba(245,158,11,0.08)' : 'none'} />
                      <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill={isActive ? 'var(--text-primary)' : 'var(--text-tertiary)'}>{node.label}</text>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Score Meters */}
            <div className="sdi-meters" role="status" aria-live="polite">
              {[
                { key: 'performance', label: 'Performance' },
                { key: 'cost', label: 'Cost' },
                { key: 'trust', label: 'Trust' },
              ].map(m => (
                <div key={m.key} className="sdi-meter">
                  <span className="sdi-meter-label">{m.label}</span>
                  <div className="sdi-meter-bar-wrap">
                    <div className="sdi-meter-bar" style={{ width: `${scores[m.key]}%`, background: meterColor(scores[m.key]) }} />
                  </div>
                  <span className="sdi-meter-value">
                    {scores[m.key]}
                    {deltas && deltas[m.key] !== 0 && (
                      <span className={`sdi-delta-badge ${deltas[m.key] > 0 ? 'positive' : 'negative'}`}>
                        {deltas[m.key] > 0 ? '+' : ''}{deltas[m.key]}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Decision Progress */}
            <div className="sdi-progress">
              <div className="sdi-progress-label">Decision {decision + 1} of 7</div>
              <div className="sdi-progress-dots">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className={`sdi-dot${i < decision ? ' completed' : i === decision ? ' current' : ''}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════
     RENDER — STRESS TESTS
     ══════════════════════════════════════ */

  if (gamePhase === 'stress' && scenario) {
    return (
      <div className="sdi-root" ref={gameRef}>
        <div className="sdi-stress-screen">
          {stressIndex === -1 && stressLoading && (
            <div className="sdi-stress-prep">
              <p>Your design is complete. Preparing stress tests&hellip;</p>
              <div className="sdi-stress-bar-wrap">
                <div className="sdi-stress-bar" />
              </div>
            </div>
          )}

          {stressIndex >= 0 && stressIndex < 3 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <span className="sdi-progress-label">Stress Test {stressIndex + 1} of 3</span>
              </div>
              <div className="sdi-incident-card">
                <span className="sdi-incident-badge">Incident</span>
                <div className="sdi-incident-title">{scenario.stressTests[stressIndex].title}</div>
                <div className="sdi-incident-desc">{scenario.stressTests[stressIndex].desc}</div>

                {!stressOutcome && (
                  <button className="sdi-stress-next-btn" onClick={handleRevealStressOutcome}>
                    See Outcome
                  </button>
                )}

                {stressOutcome && (
                  <>
                    <div className={`sdi-outcome-card ${stressOutcome.grade}`}>
                      <div className="sdi-outcome-label">
                        {stressOutcome.grade === 'survived' ? 'Survived' : stressOutcome.grade === 'partial' ? 'Partial' : 'Failed'}
                      </div>
                      {stressOutcome.text}
                    </div>
                    <button className="sdi-stress-next-btn" onClick={handleNextStressTest}>
                      {stressIndex < 2 ? 'Next Test →' : 'See Results →'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════
     RENDER — RESULTS
     ══════════════════════════════════════ */

  if (gamePhase === 'results' && scenario) {
    const band = getScoreBand(finalScore)
    const weakest = getWeakest(scores)
    const insight = getInsight(scores)
    const otherScenarios = Object.values(SCENARIOS).filter(s => s.id !== selectedScenario)

    return (
      <div className="sdi-root" ref={gameRef}>
        <div className="sdi-results">
          {/* Score */}
          <div className="sdi-results-score-section">
            <div className="sdi-big-score" style={{ color: meterColor(finalScore) }}>{finalScore}</div>
            <div className={`sdi-score-band ${band.cls}`}>{band.label}</div>
            <div className="sdi-score-tagline">{band.tagline}</div>
          </div>

          {/* Final Meters */}
          <div className="sdi-final-meters">
            <div className="sdi-meters" role="status" aria-live="polite">
              {[
                { key: 'performance', label: 'Performance' },
                { key: 'cost', label: 'Cost' },
                { key: 'trust', label: 'Trust' },
              ].map(m => (
                <div key={m.key} className="sdi-meter">
                  <span className="sdi-meter-label">{m.label}</span>
                  <div className="sdi-meter-bar-wrap">
                    <div className="sdi-meter-bar" style={{ width: `${scores[m.key]}%`, background: meterColor(scores[m.key]) }} />
                  </div>
                  <span className="sdi-meter-value">{scores[m.key]}</span>
                </div>
              ))}
            </div>
            <div className="sdi-weakest-label">Your weakest dimension: {weakest}</div>
          </div>

          {/* Panel Verdicts */}
          <div className="sdi-verdict">
            <div className="sdi-reaction">
              <div className="sdi-reaction-avatar priya">P</div>
              <div className="sdi-reaction-body">
                <div className="sdi-reaction-name">
                  <span className="name">Priya</span>
                  <span className="sdi-reaction-role priya">Staff Engineer</span>
                </div>
                <div className="sdi-reaction-bubble priya">
                  {panelReactions.length > 0 && panelReactions[panelReactions.length - 1].priya}{' '}
                  Overall: {scores.trust >= 70 ? 'Your trust architecture was well-considered.' : 'The trust layer needs more work.'}{' '}
                  {scores.performance >= 70 ? 'Performance choices were solid.' : 'Performance could be tighter.'}
                </div>
              </div>
            </div>
          </div>
          <div className="sdi-verdict">
            <div className="sdi-reaction">
              <div className="sdi-reaction-avatar marcus">M</div>
              <div className="sdi-reaction-body">
                <div className="sdi-reaction-name">
                  <span className="name">Marcus</span>
                  <span className="sdi-reaction-role marcus">PM</span>
                </div>
                <div className="sdi-reaction-bubble marcus">
                  From a product perspective, {scores.cost >= 70 ? 'the cost story holds up.' : 'the cost story needs work.'}{' '}
                  {stressResults.filter(r => r.grade === 'survived').length >= 2 ? 'Most stress tests passed \u2014 the architecture held.' : 'The stress tests exposed real gaps.'}
                </div>
              </div>
            </div>
          </div>

          {/* Stress Summary */}
          <div className="sdi-stress-summary">
            <h3>Stress Test Results</h3>
            {stressResults.map((r, i) => (
              <div key={i} className="sdi-stress-row">
                <span className="sdi-stress-icon">
                  {r.grade === 'survived' ? <CheckIcon size={14} /> : r.grade === 'partial' ? <WarningIcon size={14} /> : <CrossIcon size={14} />}
                </span>
                <span className="sdi-stress-name">{scenario.stressTests[i].title}</span>
                <span className={`sdi-stress-result ${r.grade}`}>
                  {r.grade === 'survived' ? 'Survived' : r.grade === 'partial' ? 'Partial' : 'Failed'}
                </span>
              </div>
            ))}
          </div>

          {/* Decisions Reviewed */}
          <div className="sdi-decisions-review">
            <h3>Your Decisions</h3>
            {choices.map((choiceIdx, i) => {
              const dec = scenario.decisions[i]
              const opt = dec.options[choiceIdx]
              return (
                <div key={i} className="sdi-review-row" role="button" tabIndex={0} onClick={() => setExpandedReview(expandedReview === i ? null : i)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedReview(expandedReview === i ? null : i) } }}>
                  <div className="sdi-review-header">
                    <span className="sdi-review-num">{i + 1}.</span>
                    <span className="sdi-review-choice">{opt.label}</span>
                  </div>
                  {expandedReview === i && (
                    <div className="sdi-review-detail">
                      {dec.consequences[choiceIdx]}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Insight */}
          <div className="sdi-insights">
            <div className="sdi-insight-card">{insight}</div>
          </div>

          {/* Replay */}
          <div className="sdi-replay-hook">
            You scored {finalScore}/100 with {scenario.title}. Try another scenario to see how the same trade-offs appear in different contexts.
          </div>

          {otherScenarios.length > 0 && (
            <div className="sdi-scenario-quick-cards">
              {otherScenarios.map(s => (
                <div key={s.id} className="sdi-quick-card" role="button" tabIndex={0} onClick={() => handleQuickSelect(s.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickSelect(s.id) } }}>
                  <h4>{s.title}</h4>
                  {bestScores[s.id] && <div className="best-score">Best: {bestScores[s.id]}/100</div>}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="sdi-result-actions">
            <button className="sdi-play-again-btn" onClick={handlePlayAgain}>Play Again</button>
            <button className="sdi-try-other-btn" onClick={handleTryOther}>Try Different Scenario</button>
          </div>

          {/* Concept Pills */}
          <div className="sdi-concepts">
            {CONCEPT_PILLS.map((pill, i) => (
              <span key={pill} className="sdi-concept-pill" style={{ animationDelay: `${i * 0.1}s` }}>{pill}</span>
            ))}
          </div>

          <SuggestedModules currentModuleId="system-design-interview" onSwitchTab={onSwitchTab} />
        </div>
      </div>
    )
  }

  return null
}

export default SystemDesignInterview
