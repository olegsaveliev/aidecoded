import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { TipIcon, WarningIcon, CheckIcon, ZapIcon, CodeIcon, SearchIcon, PlayIcon, EyeIcon, ShieldIcon, RocketIcon, GlobeIcon, LayersIcon, WrenchIcon, FileIcon, BarChartIcon, SparklesIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { generativeAIQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './GenerativeAI.css'

const STAGES = [
  { key: 'what-is-genai', label: 'What Is It?' },
  { key: 'how-generation-works', label: 'How It Works' },
  { key: 'text-generation', label: 'Text' },
  { key: 'image-generation', label: 'Images' },
  { key: 'audio-generation', label: 'Audio' },
  { key: 'video-code', label: 'Video & Code' },
  { key: 'risks', label: 'Risks' },
  { key: 'future', label: 'The Future' },
]

const STAGE_TOOLTIPS = {
  'what-is-genai': 'What generative AI is and how it differs from other AI',
  'how-generation-works': 'How AI learns to generate from noise',
  'text-generation': 'Text generation — the foundation of everything',
  'image-generation': 'Image generation — from words to pictures',
  'audio-generation': 'Audio and music generation',
  'video-code': 'Video and code generation',
  'risks': 'The risks and limits of generative AI',
  'future': 'Where generative AI is going next',
}

const NEXT_LABELS = [
  'Next: How It Works \u2192',
  'Next: Text Generation \u2192',
  'Next: Image Generation \u2192',
  'Next: Audio Generation \u2192',
  'Next: Video & Code \u2192',
  'Next: Risks & Limits \u2192',
  'Next: The Future \u2192',
  'Test my knowledge \u2192',
]

const EXPLANATIONS = [
  {
    title: 'Stage 1: AI That Creates, Not Just Predicts',
    content: "Most AI you have used is discriminative \u2014 it looks at something and decides what it is. Spam or not spam. Cat or dog. Positive or negative.\n\nGenerative AI does the opposite. It creates something new that did not exist before.\n\nThe family:\nDiscriminative AI: given X, predict Y\nGenerative AI: given nothing (or a prompt), create X\n\nWhat it can generate today:\nText: articles, code, emails, stories\nImages: photos, art, illustrations, logos\nAudio: music, voice, sound effects\nVideo: clips, animations, deepfakes\nCode: entire applications from descriptions\n3D: models, scenes, virtual worlds\n\nThe common thread: every generative model learns the patterns of existing human-made content \u2014 then uses those patterns to create new content that follows the same rules.",
  },
  {
    title: 'Stage 2: From Noise to Masterpiece',
    content: "Here is the beautiful idea at the heart of most generative AI:\n\nStart with pure random noise. Slowly, step by step, remove the randomness. What remains is something meaningful.\n\nThis is called Diffusion \u2014 and it powers DALL-E, Stable Diffusion, Midjourney and Sora.\n\nThe training process (learning):\n1. Take a real image\n2. Gradually add random noise until it is pure static\n3. Train the model to reverse this process \u2014 to predict what the image looked like one step before the noise was added\n4. Repeat millions of times on millions of images\n\nThe generation process (creating):\n1. Start with pure random noise\n2. Ask the model: what would this look like with a little less noise?\n3. Repeat 20\u201350 times\n4. Arrive at a coherent image\n\nThe magic: the model learned to navigate from chaos to meaning.",
  },
  {
    title: 'Stage 3: One Word at a Time',
    content: "Text generation works differently from images. Instead of denoising, it predicts.\n\nThe core loop (autoregressive generation):\n1. You provide a prompt: \u2018The cat sat on\u2019\n2. Model predicts the most likely next token\n3. That token is added to the context\n4. Model predicts the next token again\n5. Repeat until done\n\nWhat makes it remarkable: each prediction considers ALL previous tokens. The model does not just predict the next word \u2014 it predicts the next word given everything that came before.\n\nTemperature controls creativity:\nLow temp (0.1): predictable, focused, repetitive\nMedium temp (0.7): balanced, coherent, varied\nHigh temp (1.5): creative, surprising, sometimes wild\n\nThis is why the same prompt gives different answers each time \u2014 randomness is intentional.",
  },
  {
    title: 'Stage 4: Painting With Words',
    content: "Text-to-image AI translates language into pixels. But how does it know what \u2018mysterious\u2019 or \u2018impressionist style\u2019 looks like?\n\nIt learned from us. Training data: billions of image-caption pairs scraped from the internet.\n\nThe model learned:\nWhich pixel patterns correspond to \u2018cat\u2019\nWhich compositions feel \u2018dramatic\u2019\nWhich brushstrokes look \u2018impressionist\u2019\nWhich colors feel \u2018melancholy\u2019\n\nThe prompt is your paintbrush:\nSimple prompt \u2192 generic result\nRich prompt \u2192 specific, stunning result\n\nAnatomy of a great image prompt:\nSubject: what you want\nStyle: artistic style or reference\nMood: emotional quality\nLighting: how it is lit\nDetails: specific elements\nFormat: aspect ratio, quality\n\nExample:\nWeak: \u2018a dog\u2019\nStrong: \u2018golden retriever puppy, soft morning light, impressionist oil painting style, warm amber tones, shallow depth of field\u2019\n\nThe model treats each word as a direction in a vast space of possible images.",
  },
  {
    title: 'Stage 5: AI Finds Its Voice',
    content: "Sound is just waves \u2014 and waves are just numbers. If AI can learn patterns in pixel numbers, it can learn patterns in sound wave numbers.\n\nMusic generation:\nTrained on millions of songs with metadata: genre, tempo, mood, instruments, era. You describe what you want \u2192 AI composes it.\n\nVoice generation (TTS):\nTrained on thousands of hours of human speech. Learns: pronunciation, rhythm, emotion, accent. Modern TTS is indistinguishable from humans.\n\nVoice cloning:\nGive the model 3 seconds of someone\u2019s voice. It captures the unique vocal fingerprint. Generate that voice saying anything.\n\nSound effects:\nDescribe a sound \u2192 AI generates the audio file. Used in film, games, podcasts.\n\nThe models work similarly to image diffusion: start from audio noise, denoise toward meaningful sound patterns, conditioned on your text description.",
  },
  {
    title: 'Stage 6: The Final Frontiers',
    content: "Two of the most exciting and challenging frontiers in generative AI:\n\nVIDEO GENERATION:\nVideo is just many images over time. But consistency across frames is incredibly hard. The same character must look the same in frame 1 and frame 300. Physics must be consistent. Objects cannot randomly appear or disappear.\n\nCurrent state:\nShort clips (5\u201320 seconds): impressive quality\nLong-form video: still unreliable\nText-to-video: improving rapidly\n\nCODE GENERATION:\nTrained on billions of lines of public code from GitHub, Stack Overflow, documentation. Understands: syntax, logic, patterns, APIs.\n\nCode generation is arguably the most mature and useful form of generative AI today:\nComplete functions from docstrings\nExplain existing code\nDebug and fix errors\nTranslate between languages\nGenerate tests automatically\n\nWhy code works so well: code has clear right/wrong signals. Tests either pass or fail. This makes evaluation and training easier than subjective creative tasks.",
  },
  {
    title: 'Stage 7: What Could Go Wrong',
    content: "Generative AI is powerful. That makes understanding its risks just as important as understanding its capabilities.\n\nHALLUCINATION:\nGenerates plausible-sounding but false content. AI writes confident citations to papers that do not exist. Presents invented facts as established truth.\n\nDEEPFAKES:\nRealistic fake videos of real people. Political figures saying things they never said. Non-consensual intimate imagery. Fraud using cloned voices.\n\nCOPYRIGHT AND OWNERSHIP:\nTrained on copyrighted human work. Who owns AI-generated content? Do original artists deserve compensation? Active legal battles globally.\n\nHOMOGENIZATION:\nIf everyone uses the same AI tools, does creativity converge toward sameness? Does the diversity of human expression shrink?\n\nENVIRONMENTAL COST:\nTraining large generative models uses enormous amounts of energy and water. Single image generation multiplied by billions of images.\n\nMISINFORMATION AT SCALE:\nGenerating false text, images, and video is now trivially cheap and fast. The cost of creating misinformation has dropped to near zero.",
  },
  {
    title: 'Stage 8: This Is Just the Beginning',
    content: "In 2020, generating a realistic human face took specialized expertise and hours of compute. Today, anyone can do it in seconds for free.\n\nThe pace is not slowing down.\n\nWHAT IS COMING:\n\nReal-time generation: Generate video as fast as you can watch it. Interactive worlds that generate themselves.\n\nMultimodal fluency: One model that seamlessly understands and generates text, images, audio, and video together. GPT-4o is an early version of this.\n\nPersonalized generation: AI that knows your style, voice, preferences. Generates content that sounds and looks like you.\n\nPhysical world generation: AI that generates 3D objects for manufacturing. Drug molecules. Building designs. Materials.\n\nWorld models: AI that generates entire simulated environments. Used to train robots and autonomous vehicles.\n\nTHE QUESTION WORTH SITTING WITH:\nWhen AI can generate any creative work \u2014 what becomes the value of human creativity?\n\nThe answer most thoughtful people arrive at: The idea, the intention, the curation, the meaning behind the creation. Tools change. Human expression endures.",
  },
]

const TIP_CONTENT = {
  0: 'Generative AI does not have imagination. It has incredibly sophisticated pattern completion. The creativity comes from humans \u2014 both who made the training data and who write the prompts.',
  1: 'The other major approach is autoregressive \u2014 predicting one token at a time, like GPT. Both approaches create remarkable things through completely different mechanisms.',
  2: 'GPT-4 predicts the next token from a vocabulary of ~100,000 possible tokens. It does this for every single token in your response. A 500-word reply might involve 700 individual predictions.',
  3: 'Negative prompts tell the model what NOT to include. Adding \u2018blurry, low quality, distorted hands\u2019 as negative prompts dramatically improves output quality in most diffusion models.',
  5: 'AI-generated code must always be reviewed. It can be syntactically correct but logically wrong \u2014 confidently generating code that looks right but has subtle bugs or security issues. Think of it as a very fast junior developer.',
  7: 'The most valuable skill in a world of generative AI is not prompt writing \u2014 it is judgment. Knowing what is worth creating, what is good, and what matters. That is irreducibly human.',
}

const WARNING_CONTENT = {
  4: 'Voice cloning is one of the most ethically fraught areas of generative AI. It enables fraud, misinformation, and non-consensual impersonation. Most platforms have terms prohibiting cloning voices without consent.',
  6: 'These are not reasons to avoid generative AI \u2014 they are reasons to use it thoughtfully. Understanding the risks makes you a better, more responsible user of these tools.',
}

const GAI_TOOLS = {
  0: [
    { name: 'GPT-4', color: '#FF9500', desc: 'OpenAI\u2019s flagship large language model for text generation' },
    { name: 'DALL-E', color: '#FF9500', desc: 'OpenAI\u2019s text-to-image generation model' },
    { name: 'Stable Diffusion', color: '#FF9500', desc: 'Open-source image generation through diffusion' },
    { name: 'Midjourney', color: '#FF9500', desc: 'AI art generation with distinctive aesthetic styles' },
    { name: 'Suno', color: '#FF9500', desc: 'AI music generation from text descriptions' },
    { name: 'Runway', color: '#FF9500', desc: 'AI video generation and editing platform' },
  ],
  1: [
    { name: 'Stable Diffusion', color: '#FF9500', desc: 'Open-source diffusion-based image generation' },
    { name: 'DALL-E 3', color: '#FF9500', desc: 'OpenAI\u2019s latest text-to-image diffusion model' },
    { name: 'Midjourney', color: '#FF9500', desc: 'AI art generation with distinctive aesthetic styles' },
    { name: 'Sora', color: '#FF9500', desc: 'OpenAI\u2019s text-to-video generation model' },
    { name: 'Flux', color: '#FF9500', desc: 'High-quality open-source image generation model' },
    { name: 'Adobe Firefly', color: '#FF9500', desc: 'Adobe\u2019s generative AI trained on licensed content' },
  ],
  2: [
    { name: 'GPT-4', color: '#FF9500', desc: 'OpenAI\u2019s flagship autoregressive language model' },
    { name: 'Claude', color: '#FF9500', desc: 'Anthropic\u2019s conversational AI assistant' },
    { name: 'Gemini', color: '#FF9500', desc: 'Google\u2019s multimodal AI model family' },
    { name: 'Llama', color: '#FF9500', desc: 'Meta\u2019s open-source large language model' },
    { name: 'Mistral', color: '#FF9500', desc: 'European open-source LLM with strong performance' },
    { name: 'Cohere', color: '#FF9500', desc: 'Enterprise-focused language AI platform' },
  ],
  3: [
    { name: 'DALL-E 3', color: '#FF9500', desc: 'OpenAI\u2019s text-to-image model with prompt understanding' },
    { name: 'Midjourney', color: '#FF9500', desc: 'AI art generation known for aesthetic quality' },
    { name: 'Stable Diffusion', color: '#FF9500', desc: 'Open-source image generation ecosystem' },
    { name: 'Adobe Firefly', color: '#FF9500', desc: 'Adobe\u2019s commercially-safe generative AI' },
    { name: 'Ideogram', color: '#FF9500', desc: 'AI image generation with strong text rendering' },
    { name: 'Leonardo AI', color: '#FF9500', desc: 'AI art platform for game assets and production art' },
  ],
  4: [
    { name: 'Suno', color: '#FF9500', desc: 'AI music generation from text descriptions' },
    { name: 'Udio', color: '#FF9500', desc: 'AI music composition with high-fidelity audio' },
    { name: 'ElevenLabs', color: '#FF9500', desc: 'Voice synthesis and cloning platform' },
    { name: 'OpenAI TTS', color: '#FF9500', desc: 'OpenAI\u2019s text-to-speech API' },
    { name: 'Stable Audio', color: '#FF9500', desc: 'Stability AI\u2019s music and sound generation' },
    { name: 'Play.ht', color: '#FF9500', desc: 'AI voice generation for content creators' },
  ],
  5: [
    { name: 'Sora', color: '#FF9500', desc: 'OpenAI\u2019s text-to-video generation model' },
    { name: 'Runway', color: '#FF9500', desc: 'AI video generation and creative tools' },
    { name: 'Kling', color: '#FF9500', desc: 'Kuaishou\u2019s text-to-video AI model' },
    { name: 'GitHub Copilot', color: '#FF9500', desc: 'AI pair programmer for code generation' },
    { name: 'Cursor', color: '#FF9500', desc: 'AI-first code editor with generation capabilities' },
    { name: 'Claude Code', color: '#FF9500', desc: 'Anthropic\u2019s AI coding assistant' },
  ],
  6: [
    { name: 'Content Credentials', color: '#FF9500', desc: 'Adobe-led standard for content provenance' },
    { name: 'C2PA', color: '#FF9500', desc: 'Coalition for Content Provenance and Authenticity' },
    { name: 'SynthID', color: '#FF9500', desc: 'Google\u2019s watermarking for AI-generated content' },
    { name: 'Nightshade', color: '#FF9500', desc: 'Tool for artists to protect work from AI training' },
    { name: 'Glaze', color: '#FF9500', desc: 'Style cloaking tool to prevent AI style mimicry' },
    { name: 'Have I Been Trained', color: '#FF9500', desc: 'Check if your work appears in AI training data' },
  ],
  7: [
    { name: 'GPT-5', color: '#FF9500', desc: 'Next-generation language model from OpenAI' },
    { name: 'Gemini Ultra', color: '#FF9500', desc: 'Google\u2019s most capable multimodal AI model' },
    { name: 'Claude', color: '#FF9500', desc: 'Anthropic\u2019s frontier conversational AI' },
    { name: 'Sora', color: '#FF9500', desc: 'OpenAI\u2019s text-to-video generation model' },
    { name: 'World Labs', color: '#FF9500', desc: 'Fei-Fei Li\u2019s spatial intelligence AI company' },
    { name: 'Runway', color: '#FF9500', desc: 'Real-time creative AI tools and video generation' },
  ],
}

const TOOLKIT = [
  { concept: 'Discriminative vs Generative', takeaway: 'Discriminative classifies; generative creates new content' },
  { concept: 'Diffusion', takeaway: 'Start from noise, remove it step by step to create images' },
  { concept: 'Autoregressive', takeaway: 'Predict one token at a time, using all previous context' },
  { concept: 'Image Prompting', takeaway: 'Subject + style + mood + lighting + details = better results' },
  { concept: 'Audio Generation', takeaway: 'Music, voice, and sound effects from text descriptions' },
  { concept: 'Video & Code', takeaway: 'Frame consistency for video; testability makes code generation mature' },
  { concept: 'Risks', takeaway: 'Hallucination, deepfakes, copyright, homogenization, misinformation' },
  { concept: 'The Future', takeaway: 'Real-time, multimodal, personalized, physical-world generation' },
]

/* ==============================
   Stage Visualizations
   ============================== */

const MODALITIES = [
  { label: 'Text', desc: 'Articles, code, emails, stories, conversations' },
  { label: 'Images', desc: 'Photos, art, illustrations, logos, design assets' },
  { label: 'Audio', desc: 'Music, voice, sound effects, podcasts' },
  { label: 'Video', desc: 'Clips, animations, trailers, deepfakes' },
  { label: 'Code', desc: 'Applications, functions, tests, debugging' },
  { label: '3D', desc: 'Models, scenes, virtual worlds, product design' },
]

function DiscrimVsGenViz({ active }) {
  const [visibleRows, setVisibleRows] = useState(0)
  const [activeModality, setActiveModality] = useState(null)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!active) return
    clearTimers()
    setVisibleRows(0)
    const rows = 3
    for (let i = 0; i < rows; i++) {
      timersRef.current.push(setTimeout(() => {
        setVisibleRows(i + 1)
      }, 300 * (i + 1)))
    }
    return () => clearTimers()
  }, [active])

  return (
    <div className="gai-viz gai-discrim-viz">
      <div className="gai-compare-panels">
        <div className="gai-compare-panel gai-compare-discrim">
          <div className="gai-compare-header">Discriminative AI</div>
          <div className="gai-compare-rows">
            {visibleRows >= 1 && (
              <div className="gai-compare-row gai-fade-in">
                <span className="gai-compare-input">
                  <EyeIcon size={14} color="#FF9500" /> Image of cat
                </span>
                <span className="gai-compare-arrow">&rarr;</span>
                <span className="gai-compare-output">&ldquo;Cat (94%)&rdquo;</span>
              </div>
            )}
            {visibleRows >= 2 && (
              <div className="gai-compare-row gai-fade-in">
                <span className="gai-compare-input">
                  <FileIcon size={14} color="#FF9500" /> Email text
                </span>
                <span className="gai-compare-arrow">&rarr;</span>
                <span className="gai-compare-output">&ldquo;Spam&rdquo;</span>
              </div>
            )}
            {visibleRows >= 3 && (
              <div className="gai-compare-row gai-fade-in">
                <span className="gai-compare-input">
                  <BarChartIcon size={14} color="#FF9500" /> Review
                </span>
                <span className="gai-compare-arrow">&rarr;</span>
                <span className="gai-compare-output">&ldquo;Positive&rdquo;</span>
              </div>
            )}
          </div>
          <div className="gai-compare-label">Classifies what exists</div>
        </div>
        <div className="gai-compare-panel gai-compare-gen">
          <div className="gai-compare-header">Generative AI</div>
          <div className="gai-compare-rows">
            {visibleRows >= 1 && (
              <div className="gai-compare-row gai-fade-in">
                <span className="gai-compare-input">
                  <SparklesIcon size={14} color="#34C759" /> &ldquo;a cat on the moon&rdquo;
                </span>
                <span className="gai-compare-arrow">&rarr;</span>
                <span className="gai-compare-output gai-output-created">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#34C759" strokeWidth="1.5">
                    <circle cx="10" cy="8" r="4" />
                    <line x1="6" y1="14" x2="8" y2="12" />
                    <line x1="14" y1="14" x2="12" y2="12" />
                    <path d="M4 18 Q10 14 16 18" />
                  </svg>
                </span>
              </div>
            )}
            {visibleRows >= 2 && (
              <div className="gai-compare-row gai-fade-in">
                <span className="gai-compare-input">
                  <PlayIcon size={14} color="#34C759" /> &ldquo;jazz melody&rdquo;
                </span>
                <span className="gai-compare-arrow">&rarr;</span>
                <span className="gai-compare-output gai-output-created">
                  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="#34C759" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 8 Q6 2 12 8 Q18 14 22 8" />
                  </svg>
                </span>
              </div>
            )}
            {visibleRows >= 3 && (
              <div className="gai-compare-row gai-fade-in">
                <span className="gai-compare-input">
                  <ZapIcon size={14} color="#34C759" /> &ldquo;hello&rdquo;
                </span>
                <span className="gai-compare-arrow">&rarr;</span>
                <span className="gai-compare-output gai-output-created">&ldquo;Hello! How can I help?&rdquo;</span>
              </div>
            )}
          </div>
          <div className="gai-compare-label">Creates what doesn&rsquo;t exist yet</div>
        </div>
      </div>
      <div className="gai-modality-pills">
        {MODALITIES.map((m) => (
          <button
            key={m.label}
            className={`gai-modality-pill${activeModality === m.label ? ' gai-modality-active' : ''}`}
            onClick={() => setActiveModality(activeModality === m.label ? null : m.label)}
          >
            {m.label}
          </button>
        ))}
      </div>
      {activeModality && (
        <div className="gai-modality-desc gai-fade-in">
          {MODALITIES.find((m) => m.label === activeModality)?.desc}
        </div>
      )}
    </div>
  )
}

function DiffusionViz({ active }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(null) // 'noise' | 'denoise'
  const [running, setRunning] = useState(false)
  const timersRef = useRef([])
  const totalSteps = 20

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function addNoise() {
    if (running) return
    clearTimers()
    setRunning(true)
    setDirection('noise')
    for (let i = 1; i <= totalSteps; i++) {
      timersRef.current.push(setTimeout(() => {
        setStep(i)
        if (i === totalSteps) setRunning(false)
      }, 120 * i))
    }
  }

  function denoise() {
    if (running) return
    clearTimers()
    setRunning(true)
    setDirection('denoise')
    for (let i = totalSteps - 1; i >= 0; i--) {
      timersRef.current.push(setTimeout(() => {
        setStep(i)
        if (i === 0) setRunning(false)
      }, 120 * (totalSteps - i)))
    }
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  const noiseLevel = step / totalSteps
  const blur = noiseLevel * 8
  const grain = noiseLevel * 0.7

  return (
    <div className="gai-viz gai-diffusion-viz">
      <div className="gai-diffusion-display">
        <div className="gai-diffusion-shape" style={{
          filter: `blur(${blur}px)`,
          opacity: 1 - grain * 0.5,
        }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="gai-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9500" />
                <stop offset="100%" stopColor="#FF6B00" />
              </linearGradient>
            </defs>
            <polygon
              points="60,10 72,45 110,45 80,68 90,105 60,82 30,105 40,68 10,45 48,45"
              fill="url(#gai-star-grad)"
              stroke="#FF9500"
              strokeWidth="2"
            />
          </svg>
        </div>
        {noiseLevel > 0.1 && (
          <div className="gai-noise-overlay" style={{ opacity: grain }} />
        )}
      </div>
      <div className="gai-diffusion-counter">
        Step {step} of {totalSteps}
      </div>
      <div className="gai-diffusion-bar">
        <div className="gai-diffusion-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
      </div>
      <div className="gai-diffusion-controls">
        <button
          className="gai-diff-btn"
          onClick={addNoise}
          disabled={running || step === totalSteps}
        >
          Add noise
        </button>
        <button
          className="gai-diff-btn gai-diff-btn-denoise"
          onClick={denoise}
          disabled={running || step === 0}
        >
          Denoise
        </button>
      </div>
      {step === 0 && direction === 'denoise' && (
        <div className="gai-diffusion-done gai-fade-in">
          This is exactly what DALL-E does \u2014 but with 50 steps and millions of parameters
        </div>
      )}
    </div>
  )
}

const TEXT_TOKENS = ['bright', ',', ' full', ' of', ' possibility', ' and', ' wonder', '.', ' Machines', ' will']
const TEXT_ALTS = [
  ['bright', 'promising', 'uncertain'],
  [',', '.', ' \u2014'],
  [' full', ' brimming', ' rich'],
  [' of', ' with', ' in'],
  [' possibility', ' potential', ' hope'],
  [' and', ' ,', ' yet'],
  [' wonder', ' curiosity', ' change'],
  ['.', '!', ' \u2014'],
  [' Machines', ' AI', ' Technology'],
  [' will', ' shall', ' can'],
]

function TextGenViz({ active }) {
  const [tokens, setTokens] = useState([])
  const [autoMode, setAutoMode] = useState(false)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function addToken() {
    setTokens((prev) => {
      if (prev.length >= TEXT_TOKENS.length) return prev
      return [...prev, TEXT_TOKENS[prev.length]]
    })
  }

  function autoComplete() {
    if (autoMode) return
    setAutoMode(true)
    clearTimers()
    const startIdx = tokens.length
    for (let i = startIdx; i < TEXT_TOKENS.length; i++) {
      timersRef.current.push(setTimeout(() => {
        setTokens((prev) => [...prev, TEXT_TOKENS[prev.length]])
        if (i === TEXT_TOKENS.length - 1) setAutoMode(false)
      }, 100 * (i - startIdx + 1)))
    }
  }

  function resetText() {
    clearTimers()
    setAutoMode(false)
    setTokens([])
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  return (
    <div className="gai-viz gai-textgen-viz">
      <div className="gai-textgen-prompt">
        <span className="gai-textgen-label">Prompt:</span>
        &ldquo;The future of AI is&rdquo;
      </div>
      <div className="gai-textgen-output">
        <span className="gai-textgen-prefix">The future of AI is </span>
        {tokens.map((t, i) => (
          <span key={i} className="gai-textgen-token gai-fade-in">{t}</span>
        ))}
        {tokens.length < TEXT_TOKENS.length && (
          <span className="gai-textgen-cursor" />
        )}
      </div>
      {tokens.length > 0 && tokens.length <= TEXT_TOKENS.length && (
        <div className="gai-textgen-alts">
          {TEXT_ALTS[tokens.length - 1]?.map((alt, i) => (
            <span key={i} className={`gai-textgen-alt${i === 0 ? ' gai-textgen-alt-chosen' : ''}`}>
              {alt} {i === 0 && <CheckIcon size={12} color="#34C759" />}
            </span>
          ))}
        </div>
      )}
      <div className="gai-textgen-controls">
        <button className="gai-diff-btn" onClick={addToken} disabled={autoMode || tokens.length >= TEXT_TOKENS.length}>
          Next Token
        </button>
        <button className="gai-diff-btn gai-diff-btn-denoise" onClick={autoComplete} disabled={autoMode || tokens.length >= TEXT_TOKENS.length}>
          Auto Complete
        </button>
        <button className="gai-diff-btn gai-diff-btn-reset" onClick={resetText}>
          Reset
        </button>
      </div>
    </div>
  )
}

const PROMPT_INGREDIENTS = {
  Subject: ['landscape', 'portrait', 'abstract', 'animal'],
  Style: ['photorealistic', 'oil painting', 'watercolor', 'anime'],
  Mood: ['dramatic', 'peaceful', 'mysterious', 'joyful'],
  Lighting: ['golden hour', 'neon', 'soft natural', 'studio'],
  Details: ['minimalist', 'highly detailed', 'vintage', 'modern'],
}

function ImagePromptViz({ active }) {
  const [selections, setSelections] = useState({})

  function toggle(category, value) {
    setSelections((prev) => {
      if (prev[category] === value) {
        const next = { ...prev }
        delete next[category]
        return next
      }
      return { ...prev, [category]: value }
    })
  }

  const assembledPrompt = Object.entries(selections).map(([, v]) => v).join(', ')
  const ingredientCount = Object.keys(selections).length
  const quality = ingredientCount === 0 ? 0 : Math.min(100, ingredientCount * 20)

  return (
    <div className="gai-viz gai-imgprompt-viz">
      <div className="gai-imgprompt-grid">
        {Object.entries(PROMPT_INGREDIENTS).map(([cat, options]) => (
          <div key={cat} className="gai-imgprompt-category">
            <div className="gai-imgprompt-cat-label">{cat}</div>
            <div className="gai-imgprompt-options">
              {options.map((opt) => (
                <button
                  key={opt}
                  className={`gai-imgprompt-opt${selections[cat] === opt ? ' gai-imgprompt-opt-active' : ''}`}
                  onClick={() => toggle(cat, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {assembledPrompt && (
        <div className="gai-imgprompt-result gai-fade-in">
          <div className="gai-imgprompt-result-label">Assembled prompt:</div>
          <div className="gai-imgprompt-result-text">&ldquo;{assembledPrompt}&rdquo;</div>
          <div className="gai-imgprompt-quality">
            <span className="gai-imgprompt-quality-label">Estimated quality:</span>
            <div className="gai-imgprompt-quality-bar">
              <div className="gai-imgprompt-quality-fill" style={{ width: `${quality}%` }} />
            </div>
            <span className="gai-imgprompt-quality-pct">{quality}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

const AUDIO_CATEGORIES = [
  {
    title: 'Music',
    tools: 'Suno, Udio, MusicLM',
    example: 'upbeat jazz, piano trio, evening cafe atmosphere',
    icon: 'music',
  },
  {
    title: 'Voice',
    tools: 'ElevenLabs, OpenAI TTS, Play.ht',
    example: 'Natural voice narration with warm tone',
    icon: 'voice',
  },
  {
    title: 'Sound Effects',
    tools: 'ElevenLabs, Adobe Podcast',
    example: 'rain on window, distant thunder',
    icon: 'sound',
  },
  {
    title: 'Voice Cloning',
    tools: 'ElevenLabs, Resemble AI',
    example: '3 seconds of input \u2192 full voice output',
    icon: 'clone',
  },
]

function AudioViz({ active }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="gai-viz gai-audio-viz">
      <div className="gai-audio-grid">
        {AUDIO_CATEGORIES.map((cat, i) => (
          <div
            key={cat.title}
            className={`gai-audio-card${expanded === i ? ' gai-audio-card-expanded' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => setExpanded(expanded === i ? null : i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(expanded === i ? null : i) } }}
          >
            <div className="gai-audio-card-icon">
              {cat.icon === 'music' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              )}
              {cat.icon === 'voice' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
              {cat.icon === 'sound' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
              {cat.icon === 'clone' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 0 0 8 11a4 4 0 1 1 8 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0 0 15.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 0 0 8 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              )}
            </div>
            <div className="gai-audio-card-title">{cat.title}</div>
            <div className="gai-audio-card-tools">{cat.tools}</div>
            {expanded === i && (
              <div className="gai-audio-card-example gai-fade-in">
                <span className="gai-audio-example-label">Example:</span> {cat.example}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function VideoCodeViz({ active }) {
  const [codeTokens, setCodeTokens] = useState([])
  const [showPass, setShowPass] = useState(false)
  const [frameIdx, setFrameIdx] = useState(0)
  const timersRef = useRef([])
  const codeLines = [
    '# Calculate compound interest',
    'def compound_interest(p, r, n, t):',
    '    amount = p * (1 + r/n) ** (n*t)',
    '    return round(amount - p, 2)',
  ]

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function runCodeAnimation() {
    clearTimers()
    setCodeTokens([])
    setShowPass(false)
    codeLines.forEach((line, i) => {
      timersRef.current.push(setTimeout(() => {
        setCodeTokens((prev) => [...prev, line])
        if (i === codeLines.length - 1) {
          timersRef.current.push(setTimeout(() => setShowPass(true), 400))
        }
      }, 400 * (i + 1)))
    })
  }

  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % 5)
    }, 600)
    return () => clearInterval(timer)
  }, [active])

  useEffect(() => {
    return () => clearTimers()
  }, [])

  return (
    <div className="gai-viz gai-videocode-viz">
      <div className="gai-vc-panels">
        <div className="gai-vc-panel gai-vc-video">
          <div className="gai-vc-panel-header">Video Generation</div>
          <div className="gai-vc-filmstrip">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`gai-vc-frame${frameIdx === i ? ' gai-vc-frame-active' : ''}`}>
                <svg width="40" height="30" viewBox="0 0 40 30" fill="none" stroke={frameIdx === i ? '#FF9500' : 'var(--text-tertiary)'} strokeWidth="1.5">
                  <circle cx="20" cy="12" r={5 + i * 0.3} />
                  <line x1="15" y1="22" x2="25" y2="22" />
                  <line x1={12 - i * 0.5} y1="26" x2={28 + i * 0.5} y2="26" />
                </svg>
                <div className="gai-vc-frame-num">F{i + 1}</div>
              </div>
            ))}
          </div>
          <div className="gai-vc-consistency">5 seconds = 150 frames to keep consistent</div>
        </div>
        <div className="gai-vc-panel gai-vc-code">
          <div className="gai-vc-panel-header">Code Generation</div>
          <div className="gai-vc-code-editor">
            {codeTokens.map((line, i) => (
              <div key={i} className="gai-vc-code-line gai-fade-in">{line}</div>
            ))}
            {codeTokens.length === 0 && (
              <div className="gai-vc-code-placeholder">Click &ldquo;Generate&rdquo; to watch code appear</div>
            )}
          </div>
          {showPass && (
            <div className="gai-vc-test-pass gai-fade-in">
              <CheckIcon size={14} color="#34C759" /> Test result: PASS
            </div>
          )}
          <button className="gai-diff-btn" onClick={runCodeAnimation} style={{ marginTop: '8px' }}>
            Generate
          </button>
        </div>
      </div>
    </div>
  )
}

const RISKS = [
  { title: 'Hallucination', desc: 'Generates plausible-sounding but false content. Confidently cites papers that do not exist.', example: 'A lawyer used ChatGPT to write a brief citing six fake court cases.' },
  { title: 'Deepfakes', desc: 'Realistic fake videos and audio of real people. Used for fraud and misinformation.', example: 'AI-generated voice calls impersonating family members to steal money.' },
  { title: 'Copyright', desc: 'Models trained on copyrighted work. Ownership of AI outputs is legally contested.', example: 'Artists filed class-action lawsuits against AI image generators.' },
  { title: 'Homogenization', desc: 'Same AI tools producing same-sounding content. Creative diversity may shrink.', example: 'AI-written articles across publications becoming indistinguishable.' },
  { title: 'Environmental Cost', desc: 'Training uses enormous energy. Generation at scale has growing carbon footprint.', example: 'A single large model training run can use as much energy as five cars over their lifetime.' },
  { title: 'Misinformation', desc: 'Generating false content is now trivially cheap and fast at massive scale.', example: 'AI-generated fake news articles spreading on social media within minutes.' },
]

function RisksViz({ active }) {
  const [visibleCount, setVisibleCount] = useState(0)

  function showNext() {
    setVisibleCount((prev) => Math.min(prev + 1, RISKS.length))
  }

  return (
    <div className="gai-viz gai-risks-viz">
      <div className="gai-risks-grid">
        {RISKS.slice(0, visibleCount).map((risk, i) => (
          <div key={risk.title} className="gai-risk-card gai-fade-in">
            <div className="gai-risk-header">
              <WarningIcon size={16} color="#FF9500" />
              <span className="gai-risk-title">{risk.title}</span>
            </div>
            <div className="gai-risk-desc">{risk.desc}</div>
            <div className="gai-risk-example">{risk.example}</div>
          </div>
        ))}
      </div>
      {visibleCount < RISKS.length && (
        <button className="gai-diff-btn" onClick={showNext}>
          Show next risk ({visibleCount + 1}/{RISKS.length})
        </button>
      )}
      {visibleCount >= RISKS.length && (
        <div className="gai-responsible gai-fade-in">
          <div className="how-info-tip">
            <TipIcon size={16} color="#eab308" />
            <div>
              <strong>How to use generative AI responsibly:</strong>
              <div className="gai-responsible-list">
                <div><CheckIcon size={14} color="#34C759" /> Always verify AI-generated facts before sharing</div>
                <div><CheckIcon size={14} color="#34C759" /> Disclose when content is AI-generated</div>
                <div><CheckIcon size={14} color="#34C759" /> Respect copyright and attribution</div>
                <div><CheckIcon size={14} color="#34C759" /> Never create non-consensual content of real people</div>
                <div><CheckIcon size={14} color="#34C759" /> Consider environmental impact of large-scale generation</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const TIMELINE = [
  { year: '2024', milestone: 'Text and image generation become mainstream. Sora previewed. Multimodal models emerge.' },
  { year: '2025', milestone: 'Real-time video generation. AI agents compose multimedia. Voice becomes indistinguishable.' },
  { year: '2026', milestone: 'Personalized content engines. AI generates interactive experiences. 3D generation matures.' },
  { year: '2027', milestone: 'World models generate full environments. Physical-world generation for manufacturing and science.' },
]

const STARTER_PROJECTS = [
  { title: 'AI Art Project', desc: 'Create a consistent visual style using Midjourney or DALL-E 3', tools: 'Midjourney, DALL-E 3, Adobe Firefly' },
  { title: 'AI Music', desc: 'Generate a full original song with Suno', tools: 'Suno, Udio, ElevenLabs' },
  { title: 'AI Writing Assistant', desc: 'Build a content pipeline with AI-assisted writing', tools: 'GPT-4, Claude, Gemini' },
]

function FutureViz({ active }) {
  const [expandedYear, setExpandedYear] = useState(null)

  return (
    <div className="gai-viz gai-future-viz">
      <div className="gai-timeline">
        {TIMELINE.map((t) => (
          <div
            key={t.year}
            className={`gai-timeline-node${expandedYear === t.year ? ' gai-timeline-active' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => setExpandedYear(expandedYear === t.year ? null : t.year)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedYear(expandedYear === t.year ? null : t.year) } }}
          >
            <div className="gai-timeline-year">{t.year}</div>
            {expandedYear === t.year && (
              <div className="gai-timeline-detail gai-fade-in">{t.milestone}</div>
            )}
          </div>
        ))}
      </div>
      <div className="gai-starter-section">
        <div className="gai-starter-title">What you can build TODAY</div>
        <div className="gai-starter-cards">
          {STARTER_PROJECTS.map((p) => (
            <div key={p.title} className="gai-starter-card">
              <div className="gai-starter-card-title">{p.title}</div>
              <div className="gai-starter-card-desc">{p.desc}</div>
              <div className="gai-starter-card-tools">{p.tools}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ==============================
   Main Component
   ============================== */

function GenerativeAI({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('generative-ai', -1)
  const [maxStageReached, setMaxStageReached] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [showQuiz, setShowQuiz] = useState(false)
  const [fading, setFading] = useState(false)
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const fadeTimerRef = useRef(null)
  const activeStepRef = useRef(null)

  // Track max stage for stepper clickability
  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  // Scroll active step into view
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    window.scrollTo(0, 0)
  }, [stage])

  // Clear learn tip on stage change, then set new one if applicable
  useEffect(() => {
    setLearnTip(null)
    setLearnTipFading(false)
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)

    const TIPS = {
      0: { id: 'genai-intro', text: 'Look at the two panels above \u2014 same input type, completely different purpose. Generative AI creates rather than classifies.' },
      1: { id: 'diffusion', text: 'Click "Add noise" then "Denoise" to see diffusion in action \u2014 the same process that powers DALL-E and Midjourney.' },
      3: { id: 'image-prompt', text: 'Try selecting ingredients in the prompt builder below \u2014 watch how adding details increases the estimated quality.' },
      5: { id: 'code-gen', text: 'Click "Generate" in the code panel to watch AI write a function token by token \u2014 then see the test pass.' },
    }
    const tip = TIPS[stage]
    if (tip && !dismissedTips.has(tip.id)) {
      setLearnTip(tip)
    }
  }, [stage])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current) }
  }, [])

  function dismissLearnTip() {
    if (!learnTip) return
    setDismissedTips((prev) => new Set(prev).add(learnTip.id))
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 400)
  }

  function reset() {
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
  }

  function handleStartOver() {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    reset()
    setShowWelcome(true)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
  }

  function goToStage(i) {
    setStage(i)
  }

  function prevStage() {
    if (stage > 0) setStage(stage - 1)
  }

  function nextStage() {
    if (stage < STAGES.length - 1) {
      setStage(stage + 1)
    } else {
      setFading(true)
      setTimeout(() => {
        setShowFinal(true)
        setStage(STAGES.length)
        markModuleComplete('generative-ai')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.gai-root')
          while (el) {
            if (el.scrollTop > 0) el.scrollTop = 0
            el = el.parentElement
          }
          window.scrollTo(0, 0)
        })
      }, 250)
    }
  }

  const vizComponents = {
    0: <DiscrimVsGenViz active={stage === 0} />,
    1: <DiffusionViz active={stage === 1} />,
    2: <TextGenViz active={stage === 2} />,
    3: <ImagePromptViz active={stage === 3} />,
    4: <AudioViz active={stage === 4} />,
    5: <VideoCodeViz active={stage === 5} />,
    6: <RisksViz active={stage === 6} />,
    7: <FutureViz active={stage === 7} />,
  }

  // Entry screen
  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="generative-ai" size={48} style={{ color: '#FF9500' }} />}
        title="Generative AI"
        subtitle="How AI Creates Things That Never Existed"
        description="Every AI-generated image, song, video and line of code starts from the same place: pure randomness. This is the story of how chaos becomes creativity &mdash; and how you can use it."
        buttonText="Start Creating"
        onStart={() => {
          setStage(0)
          markModuleStarted('generative-ai')
        }}
      />
    )
  }

  // Quiz view
  if (showQuiz) {
    return (
      <Quiz
        questions={generativeAIQuiz}
        tabName="Generative AI"
        onBack={() => setShowQuiz(false)}
        onStartOver={handleStartOver}
        onSwitchTab={onSwitchTab}
        currentModuleId="generative-ai"
      />
    )
  }

  return (
    <div className={`how-llms gai-root${fading ? ' how-fading' : ''}`}>
      {/* Start over (top-right) */}
      {!showFinal && (
        <button className="entry-start-over" onClick={handleStartOver}>&larr; Start over</button>
      )}

      {/* Welcome banner */}
      {showWelcome && stage === 0 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Generative AI</strong> &mdash; you have seen the outputs: the stunning images, the fluent text, the generated music. Now you will understand how they are actually made. It is stranger and more beautiful than you think.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>8 stages</strong> from what generative AI is to where it is going next</li>
              <li>Interact with diffusion, text generation, prompt building, and more</li>
              <li>Understand the risks, limits, and future of AI that creates</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Stepper */}
      {stage >= 0 && !showFinal && (
        <div className="how-stepper-wrapper how-fade-in">
          <div className="how-stepper gai-stepper">
            <div className="how-stepper-inner">
              {STAGES.map((s, i) => {
                const isCompleted = stage > i
                const isCurrent = stage === i
                const isActive = stage >= i
                const isClickable = i <= maxStageReached && !isCurrent
                return (
                  <div key={s.key} className="how-step-wrapper" ref={isCurrent ? activeStepRef : null}>
                    <div
                      className={`how-step${isActive ? ' how-step-active' : ''}${isCurrent ? ' how-step-current' : ''}${isCompleted ? ' how-step-completed' : ''}${isClickable ? ' how-step-clickable' : ''}`}
                      onClick={isClickable ? () => goToStage(i) : undefined}
                    >
                      <div className="how-step-num">
                        {isCompleted ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <div className="how-step-label">
                        {s.label}
                        <Tooltip text={STAGE_TOOLTIPS[s.key]} />
                      </div>
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className={`how-step-arrow${stage > i ? ' how-arrow-active' : ''}`}>
                        <svg width="24" height="12" viewBox="0 0 24 12">
                          <path d="M0 6h20M16 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stage content */}
      {stage >= 0 && !showFinal && (
        <div className="how-stage-content how-fade-in">
          <div className="how-info-card how-info-card-edu">
            <div className="how-info-card-header">
              <strong>{EXPLANATIONS[stage].title}</strong>
            </div>
            {EXPLANATIONS[stage].content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            {TIP_CONTENT[stage] && (
              <div className="how-info-tip">
                <TipIcon size={16} color="#eab308" />
                {TIP_CONTENT[stage]}
              </div>
            )}
            {WARNING_CONTENT[stage] && (
              <div className="gai-warning-tip">
                <WarningIcon size={16} color="#FF9500" />
                {WARNING_CONTENT[stage]}
              </div>
            )}
            <ToolChips tools={GAI_TOOLS[stage]} />
          </div>

          {vizComponents[stage]}

          {/* Learn tip */}
          {learnTip && (
            <div className={`learn-tip${learnTipFading ? ' learn-tip-fading' : ''}`} role="status" aria-live="polite">
              <span className="learn-tip-text">{learnTip.text}</span>
              <button className="learn-tip-dismiss" onClick={dismissLearnTip} aria-label="Dismiss tip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          <div className="how-nav-row">
            <div className="how-nav-buttons">
              {stage > 0 && (
                <button className="how-back-btn" onClick={prevStage}>&larr; Back</button>
              )}
              <button className="how-gotit-btn" onClick={nextStage}>
                {NEXT_LABELS[stage]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final screen */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You Now Understand Generative AI</div>

          <div className="gai-final-grid">
            {TOOLKIT.map((item) => (
              <div key={item.concept} className="gai-final-card">
                <div className="gai-final-card-concept">{item.concept}</div>
                <div className="gai-final-card-takeaway">{item.takeaway}</div>
              </div>
            ))}
          </div>

          <div className="gai-reference-wrapper">
            <div className="gai-reference-title">Your Generative AI Toolkit</div>
            <table className="gai-reference">
              <thead>
                <tr>
                  <th scope="col">Concept</th>
                  <th scope="col">Key Takeaway</th>
                </tr>
              </thead>
              <tbody>
                {TOOLKIT.map((item) => (
                  <tr key={item.concept}>
                    <td className="gai-ref-concept">{item.concept}</td>
                    <td>{item.takeaway}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
              Test Your Knowledge &rarr;
            </button>
            <button className="how-secondary-btn" onClick={handleStartOver}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="generative-ai" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default GenerativeAI
