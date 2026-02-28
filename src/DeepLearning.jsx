import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { TipIcon, WarningIcon, CheckIcon, LayersIcon, CpuIcon, ZapIcon, EyeIcon, SearchIcon, GearIcon, RocketIcon, TrendingUpIcon, BarChartIcon, CodeIcon, FlaskIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { deepLearningQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './DeepLearning.css'

/* ── Tool chips per stage ── */
const DL_TOOLS = {
  0: [
    { name: 'TensorFlow', color: '#5856D6', desc: 'End-to-end open-source ML platform by Google' },
    { name: 'PyTorch', color: '#5856D6', desc: 'Deep learning framework by Meta, research favorite' },
    { name: 'Keras', color: '#5856D6', desc: 'High-level API for building neural networks' },
    { name: 'JAX', color: '#5856D6', desc: 'Google framework for high-performance ML research' },
  ],
  1: [
    { name: 'NumPy', color: '#5856D6', desc: 'Fundamental package for numerical computing in Python' },
    { name: 'PyTorch', color: '#5856D6', desc: 'Deep learning framework by Meta' },
    { name: 'TensorFlow', color: '#5856D6', desc: 'End-to-end open-source ML platform' },
  ],
  2: [
    { name: 'PyTorch nn.Module', color: '#5856D6', desc: 'Base class for all neural network modules in PyTorch' },
    { name: 'Keras Sequential', color: '#5856D6', desc: 'Stack layers linearly to build models' },
    { name: 'TensorFlow', color: '#5856D6', desc: 'End-to-end open-source ML platform' },
    { name: 'Weights & Biases', color: '#5856D6', desc: 'ML experiment tracking and visualization' },
  ],
  3: [
    { name: 'PyTorch autograd', color: '#5856D6', desc: 'Automatic differentiation engine for PyTorch' },
    { name: 'TensorFlow GradientTape', color: '#5856D6', desc: 'Records ops for automatic differentiation' },
  ],
  4: [
    { name: 'PyTorch Conv2d', color: '#5856D6', desc: '2D convolution layer for image processing' },
    { name: 'TensorFlow Conv2D', color: '#5856D6', desc: '2D convolution layer in TensorFlow' },
    { name: 'OpenCV', color: '#5856D6', desc: 'Open-source computer vision library' },
    { name: 'torchvision', color: '#5856D6', desc: 'Datasets, transforms, and models for computer vision' },
  ],
  5: [
    { name: 'HuggingFace', color: '#5856D6', desc: 'The hub for state-of-the-art NLP models' },
    { name: 'PyTorch', color: '#5856D6', desc: 'Deep learning framework by Meta' },
    { name: 'BERT', color: '#5856D6', desc: 'Bidirectional encoder for text understanding' },
    { name: 'GPT', color: '#5856D6', desc: 'Generative pre-trained transformer for text generation' },
  ],
  6: [
    { name: 'PyTorch BatchNorm', color: '#5856D6', desc: 'Batch normalization layer for stable training' },
    { name: 'Weights & Biases', color: '#5856D6', desc: 'ML experiment tracking and visualization' },
    { name: 'fast.ai', color: '#5856D6', desc: 'High-level library making DL accessible to all' },
  ],
  7: [
    { name: 'HuggingFace', color: '#5856D6', desc: 'The hub for state-of-the-art models' },
    { name: 'PyTorch', color: '#5856D6', desc: 'Deep learning framework by Meta' },
    { name: 'TensorFlow', color: '#5856D6', desc: 'End-to-end open-source ML platform' },
    { name: 'OpenAI API', color: '#5856D6', desc: 'API for accessing GPT and other foundation models' },
  ],
}

const STAGES = [
  { key: 'what', label: 'What is DL?' },
  { key: 'neuron', label: 'The Neuron' },
  { key: 'networks', label: 'Networks' },
  { key: 'backprop', label: 'Backprop' },
  { key: 'cnns', label: 'CNNs' },
  { key: 'transformers', label: 'Transformers' },
  { key: 'tricks', label: 'Tricks' },
  { key: 'future', label: 'The Future' },
]

const STAGE_TOOLTIPS = {
  what: 'What deep learning is and why it changed everything',
  neuron: 'How a single neuron makes decisions',
  networks: 'How neurons connect into powerful networks',
  backprop: 'How networks learn from mistakes',
  cnns: 'CNNs — how AI sees the world',
  transformers: 'RNNs and Transformers — how AI reads',
  tricks: 'Training tricks that make networks work',
  future: 'Where deep learning is taking us next',
}

const NEXT_LABELS = [
  'Show me a neuron \u2192',
  'Connect the neurons \u2192',
  'How does it learn? \u2192',
  'How AI sees images \u2192',
  'How AI reads text \u2192',
  'Training tricks \u2192',
  'The future \u2192',
  'See Your Toolkit \u2192',
]

const EXPLANATIONS = [
  {
    title: 'Stage 1: What is Deep Learning?',
    content: `Think about how you recognize a friend's face. You don't analyze individual pixels — your brain processes edges, shapes, features, and identity in layers. Deep learning works the same way: stacking layers of simple pattern-detectors to understand complex things.

Machine learning taught computers to learn from data. Deep learning taught them to think in layers — and that single idea changed everything.

What makes it "deep": Shallow learning uses 1\u20132 layers of processing. Deep learning uses dozens or hundreds. Each layer finds increasingly abstract patterns:

- Layer 1 sees: raw pixels
- Layer 5 sees: edges and shapes
- Layer 20 sees: eyes, noses, faces
- Layer 50 sees: "this is a cat"`,
  },
  {
    title: 'Stage 2: The Neuron \u2014 Nature\u2019s Computing Unit',
    content: `Your brain has 86 billion neurons. Each one does something surprisingly simple \u2014 and that simplicity, multiplied billions of times, creates intelligence. An artificial neuron works the same way:

- RECEIVE inputs \u2014 each input has a weight (importance multiplier). High weight = this input matters a lot.
- SUM everything up \u2014 add all (input \u00d7 weight) together, plus a bias (shifts the result).
- ACTIVATE or not \u2014 pass sum through activation function. If output strong enough \u2192 neuron fires. If too weak \u2192 stays quiet.

The math: output = activation(\u03a3(input \u00d7 weight) + bias)`,
  },
  {
    title: 'Stage 3: Layers of Intelligence',
    content: `One neuron is dumb. Millions connected in layers become capable of anything.

- INPUT LAYER \u2014 Receives raw data. Image: each pixel is one input node. Text: each token is one input node.
- HIDDEN LAYERS \u2014 Where the magic happens. Each layer learns increasingly complex patterns. Early layers: simple features. Deep layers: complex concepts.
- OUTPUT LAYER \u2014 Gives the final answer. Classification: one node per category. Generation: probability over vocabulary.

How information flows: Data enters input layer \u2192 each neuron processes + passes forward \u2192 hidden layers transform step by step \u2192 output layer produces prediction. This is called the FORWARD PASS.`,
  },
  {
    title: 'Stage 4: Learning from Mistakes',
    content: `How do you learn to throw a basketball? You throw, miss, adjust, and repeat. Neural networks learn exactly the same way — just millions of times faster.

A fresh neural network is completely random \u2014 it knows nothing. Training teaches it everything through a loop:

- FORWARD PASS \u2014 Feed a training example through the network. Get a prediction (probably wrong at first).
- CALCULATE LOSS \u2014 Compare prediction to the correct answer. Loss is a number: high = very wrong, zero = perfect.
- BACKWARD PASS (Backpropagation) \u2014 The key insight: work backwards through the network. For each weight, calculate "if I increased this weight slightly, would the loss go up or down?" This measurement is called the gradient.
- UPDATE WEIGHTS \u2014 Nudge each weight in the direction that reduces loss. The learning rate controls how big each nudge is \u2014 too big and you overshoot, too small and training takes forever.
- REPEAT \u2014 Thousands or millions of times. Each pass: slightly less wrong. Eventually: surprisingly right.

Gradient descent finds the minimum of the loss function \u2014 like rolling a ball downhill to find the lowest point in a landscape.`,
  },
  {
    title: 'Stage 5: How AI Sees the World',
    content: `Regular neural networks treat an image as a flat list of pixels \u2014 completely ignoring that nearby pixels are related. CNNs (Convolutional Neural Networks) fix this brilliantly.

THE KEY INSIGHT \u2014 A cat\u2019s ear looks the same whether it\u2019s in the top-left or bottom-right of the image. CNNs learn features once, then find them everywhere.

How convolution works: A small filter (3\u00d73 grid of weights) slides across the entire image. At each position it multiplies filter \u00d7 pixels and sums up. This creates a feature map showing WHERE that pattern exists.

Full CNN pipeline:

- Input image \u2192 Conv layer (detect edges) \u2192 Pooling (shrink)
- \u2192 Conv layer (detect shapes) \u2192 Pooling (shrink)
- \u2192 Conv layer (detect objects) \u2192 Flatten
- \u2192 Dense layers \u2192 Output (cat: 94%, dog: 6%)`,
  },
  {
    title: 'Stage 6: From Reading Left-to-Right to Reading Everything at Once',
    content: `Images are 2D grids — CNNs handle those. Text is sequences of words. That required a completely different approach, and three generations of architecture:

- RNNs (1980s\u20132010s) \u2014 Read text left to right, one word at a time. Maintain a "memory" of what came before. Problem: by the end of a long paragraph, the model has already forgotten the beginning. Like reading a book but forgetting page 1 by page 10.
- LSTMs (1997) \u2014 Smarter memory with gates that decide what to remember and what to forget. Better, but still struggled with long documents.
- THE TRANSFORMER (2017) \u2014 The breakthrough. Instead of reading sequentially, it reads ALL words at once and uses "attention" to figure out which words relate to each other. No memory problem because nothing is sequential.

Attention mechanism example: "The cat sat on the mat because it was tired." What does "it" refer to? The transformer calculates: "it" attends to "cat" (0.92) much more than "mat" (0.08). It figured out the reference — just from the math of attention.

This single architecture now powers GPT, BERT, DALL-E, Whisper, and AlphaFold. It is the most important invention in modern AI.`,
  },
  {
    title: 'Stage 7: The Tricks That Make It All Work',
    content: `Everything you've learned so far is the theory. But here's a secret: raw deep learning theory alone doesn't work in practice. These six engineering tricks are what make it actually trainable.

- BATCH NORMALIZATION \u2014 Normalize layer inputs during training so they don't drift wildly. Result: networks train up to 10x faster and more stably.
- DROPOUT \u2014 Randomly disable neurons during training (like removing team members to force others to step up). Prevents the network from memorizing training data.
- RESIDUAL CONNECTIONS \u2014 Add input directly to output: y = F(x) + x. This simple shortcut lets gradients flow through 100+ layers without vanishing. Before this trick, 20 layers was the limit.
- DATA AUGMENTATION \u2014 Artificially expand training data by flipping, rotating, and cropping images (or replacing synonyms in text). Can double your effective dataset for free.
- LEARNING RATE SCHEDULING \u2014 Start with big steps (fast, rough learning), then slow down for precision. Like walking quickly to the right neighborhood, then carefully finding the exact house.
- WEIGHT INITIALIZATION \u2014 How you set the initial weights matters enormously. He initialization for ReLU, Xavier for sigmoid/tanh. Bad initialization = the network never learns.`,
  },
  {
    title: 'Stage 8: The Next Frontier',
    content: `You've now learned the full deep learning stack. Let's look at what it has already enabled \u2014 and where it's headed.

What deep learning has made possible:

- Foundation Models \u2014 train once on everything, adapt to anything. GPT-4, Claude, and LLaMA are all foundation models.
- Multimodal AI \u2014 models that see, hear, and read simultaneously. GPT-4o processes text, images, and audio in one model.
- Generative AI \u2014 create images (DALL-E, Midjourney), videos (Sora), music (Suno), and code (Copilot, Cursor) from descriptions.
- Scientific AI \u2014 AlphaFold solved protein folding, a 50-year grand challenge, in months.

What is actively being built:

- Reasoning models that think step by step, catch their own mistakes, and solve complex problems (o1, Claude)
- AI agents that browse the web, write code, use tools, and complete real tasks autonomously
- Embodied AI \u2014 robots that understand language and manipulate objects in the physical world
- Neuromorphic chips \u2014 hardware built like brains, potentially 1000x more energy-efficient

The open questions: How do we make AI reliably honest? Can AI truly reason or is it sophisticated pattern matching? What happens when AI designs better AI?`,
  },
]

/* ── Viz sub-components ── */

function HierarchyViz({ active }) {
  const [visibleLevels, setVisibleLevels] = useState(0)
  const [expandedTimeline, setExpandedTimeline] = useState(null)

  useEffect(() => {
    if (!active) return
    setVisibleLevels(0)
    let i = 0
    const id = setInterval(() => {
      i++
      setVisibleLevels(i)
      if (i >= 5) clearInterval(id)
    }, 400)
    return () => clearInterval(id)
  }, [active])

  const levels = [
    { label: 'Artificial Intelligence', sub: 'The broadest field', depth: 0 },
    { label: 'Machine Learning', sub: 'Learning from data', depth: 1 },
    { label: 'Deep Learning', sub: 'Learning in layers', depth: 2, highlight: true, badge: 'YOU ARE HERE' },
    { label: 'Neural Networks', sub: 'Interconnected neurons', depth: 3 },
    { label: 'Transformers', sub: 'Powers ChatGPT', depth: 4 },
  ]

  const timeline = [
    { year: '2012', desc: 'AlexNet wins ImageNet', detail: 'First deep learning model to dominate image recognition, beating traditional methods by a huge margin.' },
    { year: '2016', desc: 'AlphaGo beats champion', detail: 'DeepMind\'s AlphaGo defeats world champion Lee Sedol at Go, a game thought to be decades away from AI mastery.' },
    { year: '2017', desc: 'Transformer invented', detail: '"Attention is All You Need" paper introduces the architecture that would power GPT, BERT, and the entire LLM revolution.' },
    { year: '2020', desc: 'GPT-3 shocks the world', detail: '175 billion parameters. Could write essays, code, and poetry. Showed that scale alone could unlock capabilities.' },
    { year: '2022', desc: 'ChatGPT: 100M users', detail: 'ChatGPT reached 100 million users in just 60 days, the fastest-growing consumer application in history.' },
    { year: '2024', desc: 'AI generates everything', detail: 'Video (Sora), music (Suno), code (Copilot), 3D models, and scientific discoveries. AI creates across every medium.' },
  ]

  return (
    <div className="dl-viz">
      <div className="dl-tree">
        {levels.map((level, i) => (
          <div key={level.label} className="dl-tree-row" style={{ '--depth': level.depth }}>
            {i > 0 && (
              <div className="dl-tree-branch">
                <svg width="20" height="24" viewBox="0 0 20 24">
                  <path d="M0 0v12h20" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <div className={`dl-tree-node ${visibleLevels > i ? 'dl-tree-node-visible' : ''} ${level.highlight ? 'dl-tree-node-highlight' : ''}`} style={{ transitionDelay: `${i * 0.15}s` }}>
              <div className="dl-tree-node-content">
                <span className="dl-tree-node-label">{level.label}</span>
                <span className="dl-tree-node-sub">{level.sub}</span>
              </div>
              {level.badge && <div className="dl-hierarchy-badge">{level.badge}</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="dl-demo-label">Key breakthroughs (click to expand):</div>
      <div className="dl-timeline">
        {timeline.map((item, i) => (
          <div key={item.year} className="dl-timeline-item" onClick={() => setExpandedTimeline(expandedTimeline === i ? null : i)}>
            {i < timeline.length - 1 && <div className="dl-timeline-line" />}
            <div className={`dl-timeline-dot ${expandedTimeline === i ? 'dl-timeline-dot-active' : ''}`} />
            <div className="dl-timeline-year">{item.year}</div>
            <div className="dl-timeline-desc">{item.desc}</div>
            {expandedTimeline === i && <div className="dl-timeline-detail">{item.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function NeuronViz({ active }) {
  const [weights, setWeights] = useState([0.8, -0.9, 0.3])
  const [activation, setActivation] = useState('relu')
  const inputs = [0.6, 1.0, 0.4]
  const labels = ['contains "FREE"', 'known sender', 'has attachments']
  const bias = -0.1

  const sum = inputs.reduce((acc, inp, i) => acc + inp * weights[i], 0) + bias

  let output
  if (activation === 'relu') output = Math.max(0, sum)
  else if (activation === 'sigmoid') output = 1 / (1 + Math.exp(-sum))
  else output = Math.tanh(sum)

  const fired = output > 0.5

  function activationPoints() {
    const pts = []
    for (let x = -3; x <= 3; x += 0.1) {
      let y
      if (activation === 'relu') y = Math.max(0, x)
      else if (activation === 'sigmoid') y = 1 / (1 + Math.exp(-x))
      else y = Math.tanh(x)
      const px = ((x + 3) / 6) * 300
      const py = (1 - (y + 1) / 3) * 100
      pts.push(`${px},${py}`)
    }
    return pts.join(' ')
  }

  return (
    <div className="dl-viz">
      <div className="dl-neuron-builder">
        <div className="dl-neuron-title">Interactive Neuron: Is this email spam?</div>
        <div className="dl-neuron-guide">
          This simulates a single neuron deciding if an email is spam. Each row is an input signal (like "contains FREE") with a fixed value on the left. Drag the sliders to change the <strong>weights</strong> — how much the neuron cares about each signal. The neuron multiplies each input by its weight, adds them up, then passes the result through an <strong>activation function</strong>. If the output is above 0.5, it flags the email as spam.
        </div>
        <div className="dl-neuron-layout">
          <div className="dl-neuron-inputs">
            {inputs.map((inp, i) => (
              <div key={i} className="dl-neuron-input-row">
                <div className="dl-neuron-input-label">{labels[i]}</div>
                <div className="dl-neuron-input-val">{inp}</div>
                <input
                  type="range"
                  className="dl-neuron-slider"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={weights[i]}
                  onChange={(e) => {
                    const w = [...weights]
                    w[i] = parseFloat(e.target.value)
                    setWeights(w)
                  }}
                />
                <div className="dl-neuron-weight-val">{weights[i] > 0 ? '+' : ''}{weights[i].toFixed(1)}</div>
              </div>
            ))}
          </div>
          <div className={`dl-neuron-circle ${fired ? 'dl-neuron-circle-fired' : ''}`}>
            {activation === 'relu' ? 'ReLU' : activation === 'sigmoid' ? '\u03c3' : 'tanh'}
          </div>
          <div className="dl-neuron-output">
            <div className="dl-neuron-output-label">Output</div>
            <div className={`dl-neuron-output-val ${fired ? 'dl-neuron-output-fired' : 'dl-neuron-output-quiet'}`}>
              {output.toFixed(3)}
            </div>
            <div className="dl-neuron-output-label">{fired ? 'SPAM' : 'safe'}</div>
          </div>
        </div>
        <div className="dl-neuron-calc">
          {inputs.map((inp, i) => (
            <span key={i}>{inp} \u00d7 {weights[i] > 0 ? '+' : ''}{weights[i].toFixed(1)}{i < inputs.length - 1 ? ' + ' : ''}</span>
          ))}
          <span> + bias({bias}) = <strong>{sum.toFixed(3)}</strong></span>
          <br />
          <span>{activation}({sum.toFixed(3)}) = <strong>{output.toFixed(3)}</strong></span>
        </div>
        <div className="dl-demo-label">Activation function — determines how the neuron transforms its sum into an output:</div>
        <div className="dl-activation-tabs">
          {['relu', 'sigmoid', 'tanh'].map((fn) => (
            <button key={fn} className={`dl-activation-tab ${activation === fn ? 'dl-activation-tab-active' : ''}`} onClick={() => setActivation(fn)}>
              {fn === 'relu' ? 'ReLU' : fn === 'sigmoid' ? 'Sigmoid' : 'Tanh'}
            </button>
          ))}
        </div>
        <div className="dl-activation-graph">
          <svg viewBox="0 0 300 100">
            <line x1="0" y1="66.7" x2="300" y2="66.7" stroke="var(--border-light)" strokeWidth="0.5" />
            <line x1="150" y1="0" x2="150" y2="100" stroke="var(--border-light)" strokeWidth="0.5" />
            <polyline points={activationPoints()} fill="none" stroke="#5856D6" strokeWidth="2" />
          </svg>
        </div>
        <div className="dl-activation-desc">
          {activation === 'relu' && 'ReLU: outputs zero for negative inputs, passes positive values through unchanged. Simple and fast — the default choice for most networks.'}
          {activation === 'sigmoid' && 'Sigmoid: squashes any input into a 0\u20131 range. Good for probabilities, but gradients vanish at extremes.'}
          {activation === 'tanh' && 'Tanh: squashes input into -1 to +1. Centered at zero, which helps training, but also suffers from vanishing gradients.'}
        </div>
      </div>
    </div>
  )
}

function NetworkViz({ active }) {
  const [hiddenLayers, setHiddenLayers] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [pulseLayer, setPulseLayer] = useState(-1)
  const [selectedNode, setSelectedNode] = useState(null)
  const [showOutcome, setShowOutcome] = useState(false)

  const inputNodes = 4
  const outputNodes = 3
  const layers = [inputNodes, ...Array(hiddenLayers).fill(6), outputNodes]
  const layerLabels = ['Input', ...Array(hiddenLayers).fill('Hidden'), 'Output']

  function animate() {
    if (animating) return
    setAnimating(true)
    setSelectedNode(null)
    setPulseLayer(0)
    let l = 0
    const id = setInterval(() => {
      l++
      if (l >= layers.length) {
        clearInterval(id)
        setTimeout(() => { setAnimating(false); setShowOutcome(true) }, 500)
      } else {
        setPulseLayer(l)
      }
    }, 400)
  }

  const svgW = 400
  const svgH = 200
  const layerSpacing = svgW / (layers.length + 1)

  const totalConnections = layers.reduce((acc, count, i) => i < layers.length - 1 ? acc + count * layers[i + 1] : acc, 0)

  return (
    <div className="dl-viz">
      <div className="dl-neuron-guide">
        This is a neural network with <strong>{layers.length} layers</strong> and <strong>{totalConnections} connections</strong>. Data enters the <strong>Input</strong> layer on the left, gets transformed through {hiddenLayers} <strong>Hidden</strong> {hiddenLayers === 1 ? 'layer' : 'layers'} in the middle, and produces a result at the <strong>Output</strong> layer. Click <strong>Send Data</strong> to watch the signal flow through. Use the slider to add more hidden layers — more layers let the network learn more complex patterns, which is what makes it "deep."
      </div>
      <div className="dl-network-wrapper">
        <svg className="dl-network-svg" viewBox={`0 0 ${svgW} ${svgH}`}>
          {layers.map((count, li) =>
            li < layers.length - 1 &&
            Array.from({ length: count }).map((_, ni) =>
              Array.from({ length: layers[li + 1] }).map((_, nj) => {
                const x1 = layerSpacing * (li + 1)
                const y1 = (svgH / (count + 1)) * (ni + 1)
                const x2 = layerSpacing * (li + 2)
                const y2 = (svgH / (layers[li + 1] + 1)) * (nj + 1)
                const isActive = pulseLayer > li
                return (
                  <line
                    key={`c-${li}-${ni}-${nj}`}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    className={`dl-network-connection ${isActive ? 'dl-network-connection-active' : ''}`}
                  />
                )
              })
            )
          )}
          {layers.map((count, li) =>
            Array.from({ length: count }).map((_, ni) => {
              const cx = layerSpacing * (li + 1)
              const cy = (svgH / (count + 1)) * (ni + 1)
              const isActive = pulseLayer >= li
              return (
                <circle
                  key={`n-${li}-${ni}`}
                  cx={cx} cy={cy} r={8}
                  fill={isActive ? '#5856D6' : 'var(--bg-secondary)'}
                  stroke={isActive ? '#5856D6' : 'var(--border)'}
                  strokeWidth="1.5"
                  className="dl-network-node"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNode({ layer: li, node: ni })}
                />
              )
            })
          )}
          {layers.map((_, li) => (
            <text
              key={`l-${li}`}
              x={layerSpacing * (li + 1)}
              y={svgH - 4}
              textAnchor="middle"
              className="dl-network-label"
              fontSize="10"
            >
              {layerLabels[li]}
            </text>
          ))}
        </svg>
      </div>
      <div className="dl-network-controls">
        <button className="dl-network-btn" onClick={animate} disabled={animating}>
          {animating ? 'Running...' : 'Send Data'}
        </button>
      </div>
      <div className="dl-layer-slider">
        <span className="dl-layer-slider-label">Hidden layers:</span>
        <input type="range" className="dl-neuron-slider" min="1" max="4" value={hiddenLayers} onChange={(e) => { setHiddenLayers(parseInt(e.target.value)); setSelectedNode(null) }} style={{ width: 120 }} />
        <span className="dl-layer-slider-val">{hiddenLayers}</span>
      </div>
      {showOutcome && (
        <div className="dl-network-outcome">
          <span>Data passed through {layers.length} layers and {totalConnections} connections. Each hidden layer extracted higher-level patterns — {hiddenLayers === 1 ? 'with 1 layer, the network can learn simple patterns like edges.' : hiddenLayers === 2 ? 'with 2 layers, it can combine simple patterns into shapes and textures.' : hiddenLayers === 3 ? 'with 3 layers, it can recognize objects and complex features.' : 'with 4 layers, it can understand abstract concepts and context.'} This is why deeper networks are more powerful.</span>
          <button className="dl-outcome-dismiss" onClick={() => { setShowOutcome(false); setPulseLayer(-1) }}>Got it</button>
        </div>
      )}
      {selectedNode && (
        <div className="dl-node-info">
          <strong>{layerLabels[selectedNode.layer]} layer, node {selectedNode.node + 1}</strong>
          <br />
          {selectedNode.layer === 0 ? 'Receives raw input data and passes it forward.' :
            selectedNode.layer === layers.length - 1 ? 'Produces the final prediction output.' :
              `Processes ${layers[selectedNode.layer - 1]} inputs, applies weights + activation, outputs to ${layers[selectedNode.layer + 1]} nodes.`}
        </div>
      )}
    </div>
  )
}

function BackpropViz({ active }) {
  const [step, setStep] = useState(0)
  const maxSteps = 10

  const surfacePoints = []
  for (let x = 0; x <= 100; x += 1) {
    const y = 30 + 40 * Math.sin(x * 0.06) * Math.cos(x * 0.03) + 15 * Math.sin(x * 0.12)
    surfacePoints.push(`${x},${y}`)
  }
  const surfacePath = `M${surfacePoints.join(' L')}`

  const ballPositions = []
  for (let i = 0; i <= maxSteps; i++) {
    const x = 15 + (i / maxSteps) * 55
    const xNorm = x
    const y = 30 + 40 * Math.sin(xNorm * 0.06) * Math.cos(xNorm * 0.03) + 15 * Math.sin(xNorm * 0.12) - 4
    ballPositions.push({ x, y })
  }

  const lossValues = ballPositions.map((_, i) => {
    const t = i / maxSteps
    return Math.max(0.02, 2.5 * Math.pow(1 - t, 2) + 0.02)
  })

  const lossLinePoints = lossValues.map((v, i) => {
    const x = 10 + (i / maxSteps) * 80
    const y = 10 + (1 - v / 2.5) * 80
    return `${x},${y}`
  }).slice(0, step + 1)

  return (
    <div className="dl-viz">
      <div className="dl-neuron-guide">
        The <strong>loss landscape</strong> is a surface where height represents how wrong the model is. The ball represents your model's current state. Click <strong>Train Step</strong> to nudge it downhill — each step uses gradients to find a lower point. The <strong>loss curve</strong> below tracks the error over time. A good training run shows the ball rolling down and the loss curve dropping toward zero.
      </div>
      <div className="dl-loss-landscape">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <path d={surfacePath} className="dl-loss-surface" />
          <circle cx={ballPositions[step].x} cy={ballPositions[step].y} r="5" className="dl-loss-ball-glow" />
          <circle cx={ballPositions[step].x} cy={ballPositions[step].y} r="3" className="dl-loss-ball" />
        </svg>
      </div>
      <div className="dl-loss-info">
        <div className="dl-loss-info-item">
          <div className="dl-loss-info-label">Step</div>
          <div className="dl-loss-info-val">{step}/{maxSteps}</div>
        </div>
        <div className="dl-loss-info-item">
          <div className="dl-loss-info-label">Loss</div>
          <div className="dl-loss-info-val">{lossValues[step].toFixed(3)}</div>
        </div>
      </div>
      <div className="dl-loss-controls">
        <button className="dl-network-btn" onClick={() => setStep(Math.min(step + 1, maxSteps))} disabled={step >= maxSteps}>Train Step</button>
        <button className="dl-network-btn-outline dl-network-btn" onClick={() => setStep(0)}>Reset</button>
      </div>
      <div className="dl-loss-curve">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <line x1="10" y1="90" x2="90" y2="90" className="dl-loss-axis" />
          <line x1="10" y1="10" x2="10" y2="90" className="dl-loss-axis" />
          <text x="50" y="99" textAnchor="middle" className="dl-loss-axis-label">Training Steps</text>
          <text x="3" y="50" textAnchor="middle" className="dl-loss-axis-label" transform="rotate(-90, 3, 50)">Loss</text>
          {lossLinePoints.length > 1 && (
            <polyline points={lossLinePoints.join(' ')} className="dl-loss-curve-line" />
          )}
        </svg>
      </div>
    </div>
  )
}

function CNNViz({ active }) {
  const [filterType, setFilterType] = useState('edges')
  const [convPos, setConvPos] = useState(0)
  const [playing, setPlaying] = useState(false)
  const intervalRef = useRef(null)

  const gridSize = 8
  const filterSize = 3

  const imageGrid = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]

  const filters = {
    edges: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]],
    shapes: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]],
    blur: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
  }

  const maxPos = (gridSize - filterSize) * (gridSize - filterSize + 1) + (gridSize - filterSize)
  const filterRow = Math.floor(convPos / (gridSize - filterSize + 1))
  const filterCol = convPos % (gridSize - filterSize + 1)

  function computeOutput() {
    const result = []
    const f = filters[filterType]
    for (let r = 0; r <= gridSize - filterSize; r++) {
      const row = []
      for (let c = 0; c <= gridSize - filterSize; c++) {
        let sum = 0
        for (let fr = 0; fr < filterSize; fr++) {
          for (let fc = 0; fc < filterSize; fc++) {
            sum += imageGrid[r + fr][c + fc] * f[fr][fc]
          }
        }
        row.push(sum)
      }
      result.push(row)
    }
    return result
  }

  const outputGrid = computeOutput()

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setConvPos((p) => {
          if (p >= maxPos) {
            setPlaying(false)
            return 0
          }
          return p + 1
        })
      }, 200)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, maxPos])

  function isHighlighted(r, c) {
    return r >= filterRow && r < filterRow + filterSize && c >= filterCol && c < filterCol + filterSize
  }

  const filterDescriptions = {
    edges: 'Detects horizontal edges by subtracting the row above from the row below. High values in the feature map mean a strong edge was found at that position.',
    shapes: 'Highlights the center pixel and subtracts neighbors — this finds corners and sharp outlines in the image, making shapes stand out.',
    blur: 'Averages all neighboring pixels together, smoothing out the image. Every cell gets the sum of its 3x3 neighborhood, removing fine detail.',
    sharpen: 'Boosts the center pixel and subtracts neighbors — the opposite of blur. Makes edges crisper and details more pronounced.',
  }

  return (
    <div className="dl-viz">
      <div className="dl-neuron-guide">
        A <strong>convolution</strong> slides a small filter (3x3 grid) across the input image, multiplying and summing at each position to produce the feature map. Different filters detect different patterns. Try each filter below to see what it highlights.
      </div>
      <div className="dl-conv-filter-tabs">
        {Object.keys(filters).map((f) => (
          <button key={f} className={`dl-conv-filter-tab ${filterType === f ? 'dl-conv-filter-tab-active' : ''}`} onClick={() => { setFilterType(f); setConvPos(0) }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="dl-activation-desc">{filterDescriptions[filterType]}</div>
      <div className="dl-conv-demo">
        <div className="dl-conv-grids">
          <div className="dl-conv-grid-wrapper">
            <div className="dl-conv-grid-label">Input Image</div>
            <div className="dl-conv-grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {imageGrid.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`dl-conv-cell ${isHighlighted(r, c) ? 'dl-conv-cell-highlight' : ''}`}
                    style={{ background: val ? 'rgba(88, 86, 214, 0.3)' : 'var(--bg-surface)' }}
                  >
                    {val}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="dl-conv-arrow">
            <svg width="24" height="12" viewBox="0 0 24 12">
              <path d="M0 6h20M16 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="dl-conv-grid-wrapper">
            <div className="dl-conv-grid-label">Filter ({filterType})</div>
            <div className="dl-conv-grid" style={{ gridTemplateColumns: `repeat(${filterSize}, 1fr)` }}>
              {filters[filterType].map((row, r) =>
                row.map((val, c) => (
                  <div key={`f-${r}-${c}`} className="dl-conv-cell" style={{ background: val > 0 ? `rgba(88, 86, 214, ${Math.min(val / 5, 0.4)})` : val < 0 ? `rgba(255, 59, 48, ${Math.min(Math.abs(val) / 5, 0.3)})` : 'var(--bg-surface)' }}>
                    {val}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="dl-conv-arrow">
            <svg width="24" height="12" viewBox="0 0 24 12">
              <path d="M0 6h20M16 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="dl-conv-grid-wrapper">
            <div className="dl-conv-grid-label">Feature Map</div>
            <div className="dl-conv-grid" style={{ gridTemplateColumns: `repeat(${gridSize - filterSize + 1}, 1fr)` }}>
              {outputGrid.map((row, r) =>
                row.map((val, c) => {
                  const isCurrentOutput = r === filterRow && c === filterCol
                  const intensity = Math.min(Math.abs(val) / 4, 1)
                  return (
                    <div
                      key={`o-${r}-${c}`}
                      className={`dl-conv-cell ${isCurrentOutput ? 'dl-conv-cell-highlight' : ''}`}
                      style={{ background: val > 0 ? `rgba(88, 86, 214, ${intensity * 0.5})` : val < 0 ? `rgba(255, 149, 0, ${intensity * 0.3})` : 'var(--bg-surface)' }}
                    >
                      {val}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="dl-conv-controls">
        <button className="dl-network-btn" onClick={() => setPlaying(!playing)}>
          {playing ? 'Pause' : 'Play Convolution'}
        </button>
        <button className="dl-network-btn-outline dl-network-btn" onClick={() => { setConvPos(0); setPlaying(false) }}>Reset</button>
      </div>
    </div>
  )
}

function TransformerViz({ active }) {
  const [sentence, setSentence] = useState('The cat sat on the mat because it was tired')
  const [selectedWord, setSelectedWord] = useState(null)
  const [rnnStep, setRnnStep] = useState(-1)

  const words = sentence.split(/\s+/).filter(Boolean)

  useEffect(() => {
    if (!active) return
    setRnnStep(-1)
    let i = -1
    const id = setInterval(() => {
      i++
      if (i >= words.length) { clearInterval(id); return }
      setRnnStep(i)
    }, 400)
    return () => clearInterval(id)
  }, [active, sentence])

  function getAttention(fromIdx) {
    const attn = words.map(() => 0.1 + Math.random() * 0.2)
    if (words[fromIdx]?.toLowerCase() === 'it') {
      const catIdx = words.findIndex((w) => w.toLowerCase() === 'cat')
      if (catIdx >= 0) attn[catIdx] = 0.85 + Math.random() * 0.1
      const matIdx = words.findIndex((w) => w.toLowerCase() === 'mat')
      if (matIdx >= 0) attn[matIdx] = 0.1 + Math.random() * 0.05
    }
    attn[fromIdx] = 0.3 + Math.random() * 0.1
    const total = attn.reduce((a, b) => a + b, 0)
    return attn.map((v) => v / total)
  }

  const attentionWeights = selectedWord !== null ? getAttention(selectedWord) : null

  return (
    <div className="dl-viz">
      <div className="dl-neuron-guide">
        Before transformers, neural networks read text <strong>one word at a time</strong> (left panel). This meant distant words often got forgotten. Transformers changed everything — they read <strong>all words at once</strong> and use <strong>attention</strong> to figure out which words relate to each other. The heatmap below shows this: click any word in a row to see how much attention it pays to every other word. Try clicking "it" — notice how the model connects it back to "cat."
      </div>
      <div className="dl-comparison">
        <div className="dl-comp-panel dl-comp-rnn">
          <div className="dl-comp-header">RNN — Sequential</div>
          <div className="dl-comp-viz">
            {words.slice(0, 8).map((w, i) => (
              <div key={i} className={`dl-comp-word ${rnnStep >= i ? 'dl-comp-word-active' : ''}`} style={{ transitionDelay: `${i * 0.05}s` }}>{w}</div>
            ))}
          </div>
          <div className="dl-comp-desc">Reads one word at a time, left to right. Memory fades for long sequences.</div>
        </div>
        <div className="dl-comp-panel dl-comp-transformer">
          <div className="dl-comp-header">Transformer — Parallel</div>
          <div className="dl-comp-viz">
            {words.slice(0, 8).map((w, i) => (
              <div key={i} className={`dl-comp-word ${active ? 'dl-comp-word-active' : ''}`} style={{ transitionDelay: '0.3s' }}>{w}</div>
            ))}
          </div>
          <div className="dl-comp-desc">Reads all words at once. Attention connects every word to every other word.</div>
        </div>
      </div>
      <div className="dl-attention-input">
        <div className="dl-attention-input-label">Try a sentence (click a word to see its attention pattern):</div>
        <input
          type="text"
          className="dl-attention-input-field"
          value={sentence}
          onChange={(e) => { setSentence(e.target.value); setSelectedWord(null) }}
        />
      </div>
      <div className="dl-demo-label" style={{ marginTop: 24 }}>Attention heatmap — click any word row to highlight it:</div>
      {selectedWord !== null && attentionWeights ? (() => {
        const topIdx = attentionWeights.reduce((best, val, i) => val > attentionWeights[best] ? i : best, 0)
        const topWord = words[topIdx]
        const selfScore = attentionWeights[selectedWord]
        return (
          <div className="dl-network-outcome">
            <span>
              When the model reads "<strong>{words[selectedWord]}</strong>", it pays the most attention to "<strong>{topWord}</strong>" ({(attentionWeights[topIdx] * 100).toFixed(0)}%).
              {topIdx !== selectedWord
                ? ` This means the model thinks "${topWord}" is the most important context for understanding "${words[selectedWord]}".`
                : ` The word mostly attends to itself (${(selfScore * 100).toFixed(0)}%), meaning it carries strong independent meaning.`}
              {' '}The numbers in each cell are attention weights — they always add up to 1.00 across the row.
            </span>
            <button className="dl-outcome-dismiss" onClick={() => setSelectedWord(null)}>Got it</button>
          </div>
        )
      })() : (
        <div className="dl-activation-desc">Each row represents one word. Click a row to see how that word distributes its attention across all other words. Higher numbers (darker cells) mean a stronger connection — this is how the transformer decides which words are relevant to each other.</div>
      )}
      <div className="dl-attention-heatmap">
        <div className="dl-attention-row">
          <div className="dl-attention-label" />
          {words.slice(0, 8).map((w, i) => (
            <div key={i} className="dl-attention-cell" style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600, background: 'transparent' }}>{w.slice(0, 6)}</div>
          ))}
        </div>
        {words.slice(0, 8).map((w, i) => {
          const weights = selectedWord === i ? attentionWeights : null
          return (
            <div key={i} className="dl-attention-row" onClick={() => setSelectedWord(selectedWord === i ? null : i)} style={{ cursor: 'pointer' }}>
              <div className="dl-attention-label" style={{ color: selectedWord === i ? '#5856D6' : undefined }}>{w.slice(0, 8)}</div>
              {words.slice(0, 8).map((_, j) => {
                const val = weights ? weights[j] : 0
                return (
                  <div
                    key={j}
                    className="dl-attention-cell"
                    style={{ background: weights ? `rgba(88, 86, 214, ${val})` : 'var(--bg-surface)', color: val > 0.3 ? '#fff' : 'var(--text-secondary)' }}
                  >
                    {weights ? val.toFixed(2) : ''}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TricksViz({ active }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showCurves, setShowCurves] = useState(false)

  const techniques = [
    { name: 'Batch Normalization', desc: 'Normalize layer inputs for stable, 10x faster training', icon: <BarChartIcon size={16} color="#5856D6" /> },
    { name: 'Dropout', desc: 'Randomly disable neurons to prevent overfitting', icon: <LayersIcon size={16} color="#5856D6" /> },
    { name: 'Residual Connections', desc: 'Skip connections enable 100+ layer networks', icon: <ZapIcon size={16} color="#5856D6" /> },
    { name: 'Data Augmentation', desc: 'Artificially expand training data with transforms', icon: <EyeIcon size={16} color="#5856D6" /> },
    { name: 'LR Scheduling', desc: 'Start fast, slow down for precise convergence', icon: <TrendingUpIcon size={16} color="#5856D6" /> },
    { name: 'Weight Initialization', desc: 'Smart starting values so training actually works', icon: <GearIcon size={16} color="#5856D6" /> },
  ]

  function revealNext() {
    if (visibleCount < techniques.length) {
      setVisibleCount(visibleCount + 1)
    } else if (!showCurves) {
      setShowCurves(true)
    }
  }

  const withoutTricksPoints = Array.from({ length: 20 }, (_, i) => {
    const x = 10 + (i / 19) * 80
    const y = 80 - (50 * (1 - Math.exp(-i * 0.08))) + Math.sin(i * 1.5) * 12
    return `${x},${y}`
  }).join(' ')

  const withTricksPoints = Array.from({ length: 20 }, (_, i) => {
    const x = 10 + (i / 19) * 80
    const y = 80 - (65 * (1 - Math.exp(-i * 0.2)))
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="dl-viz">
      <div className="dl-techniques-grid">
        {techniques.map((t, i) => (
          <div key={t.name} className={`dl-technique-card ${visibleCount > i ? 'dl-technique-card-visible' : ''}`} style={{ transitionDelay: `${i * 0.05}s` }}>
            <div className="dl-technique-card-header">
              {t.icon}
              <div className="dl-technique-card-name">{t.name}</div>
            </div>
            <div className="dl-technique-card-desc">{t.desc}</div>
          </div>
        ))}
      </div>
      <div className="dl-network-controls">
        <button className="dl-network-btn" onClick={revealNext}>
          {visibleCount < techniques.length ? `Show next technique (${visibleCount}/${techniques.length})` : !showCurves ? 'Show comparison' : 'All revealed'}
        </button>
      </div>
      {showCurves && (
        <div className="dl-curves-comparison">
          <div className="dl-curves-header">Training Loss: With vs Without Tricks</div>
          <div className="dl-curves-chart">
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <line x1="10" y1="80" x2="90" y2="80" className="dl-loss-axis" />
              <line x1="10" y1="10" x2="10" y2="80" className="dl-loss-axis" />
              <polyline points={withoutTricksPoints} fill="none" stroke="#FF3B30" strokeWidth="2" opacity="0.7" />
              <polyline points={withTricksPoints} fill="none" stroke="#34C759" strokeWidth="2" />
            </svg>
          </div>
          <div className="dl-curves-legend">
            <div className="dl-curves-legend-item">
              <div className="dl-curves-legend-dot" style={{ background: '#FF3B30' }} />
              Without tricks (unstable)
            </div>
            <div className="dl-curves-legend-item">
              <div className="dl-curves-legend-dot" style={{ background: '#34C759' }} />
              With tricks (smooth)
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FutureViz({ active }) {
  const [expandedCard, setExpandedCard] = useState(null)

  const futureItems = [
    { year: '2024', title: 'Multimodal models, AI agents', detail: 'GPT-4o processes text, images, and audio together. AI agents browse the web, write code, and use tools autonomously. AI generates video, music, and 3D models.' },
    { year: '2025', title: 'Reasoning models, coding agents', detail: 'Models like o1 and Claude think step by step, catch mistakes, and solve complex multi-step problems. AI coding assistants write entire applications.' },
    { year: '2026', title: 'Autonomous agents everywhere', detail: 'AI agents that plan, use tools, and complete real-world tasks with minimal human supervision. Computer-use agents interact with software like humans do.' },
    { year: '2027+', title: 'Embodied AI & scientific discovery', detail: 'Robots that understand language and manipulate the physical world. AI accelerating drug discovery, materials science, and fundamental physics research.' },
    { year: '2030+', title: 'AI-designed AI', detail: 'Neural architecture search at scale — AI systems designing more efficient AI systems. The pace of progress makes specific predictions unreliable.' },
    { year: '???', title: 'The fundamentals remain', detail: 'Models will change every 6 months. But neurons, backpropagation, CNNs, attention, and training tricks — the fundamentals you learned here — will remain relevant for decades.' },
  ]

  const projects = [
    { name: 'Image Classifier', desc: 'Build a model that identifies objects in photos', tools: 'PyTorch + torchvision, 50 lines of code' },
    { name: 'Sentiment Analyzer', desc: 'Classify text as positive or negative', tools: 'HuggingFace, 10 lines of code' },
    { name: 'Fine-tuned Chatbot', desc: 'Create an expert AI for your specific domain', tools: 'OpenAI fine-tuning API' },
  ]

  return (
    <div className="dl-viz">
      <div className="dl-future-timeline">
        {futureItems.map((item, i) => (
          <div key={item.year} className="dl-future-card" onClick={() => setExpandedCard(expandedCard === i ? null : i)}>
            <div className="dl-future-card-header">
              <div className="dl-future-card-year">{item.year}</div>
              <div className="dl-future-card-title">{item.title}</div>
              <div className={`dl-future-card-chevron ${expandedCard === i ? 'dl-future-card-chevron-open' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            {expandedCard === i && <div className="dl-future-card-detail">{item.detail}</div>}
          </div>
        ))}
      </div>
      <div className="dl-demo-label">What you can build TODAY:</div>
      <div className="dl-project-cards">
        {projects.map((p) => (
          <div key={p.name} className="dl-project-card">
            <div className="dl-project-card-name">{p.name}</div>
            <div className="dl-project-card-desc">{p.desc}</div>
            <div className="dl-project-card-tools">{p.tools}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Quick reference for final screen ── */
const TOOLKIT_ITEMS = [
  { name: 'Neurons', desc: 'Weighted sum + activation = decision unit', icon: <CpuIcon size={16} color="#5856D6" /> },
  { name: 'Networks', desc: 'Layers of neurons = universal approximator', icon: <LayersIcon size={16} color="#5856D6" /> },
  { name: 'Backprop', desc: 'Learn from mistakes via gradient descent', icon: <ZapIcon size={16} color="#5856D6" /> },
  { name: 'CNNs', desc: 'Convolutions for spatial pattern detection', icon: <EyeIcon size={16} color="#5856D6" /> },
  { name: 'Transformers', desc: 'Attention mechanism for parallel sequence processing', icon: <SearchIcon size={16} color="#5856D6" /> },
  { name: 'Training Tricks', desc: 'BatchNorm, Dropout, Skip connections', icon: <GearIcon size={16} color="#5856D6" /> },
  { name: 'Foundation Models', desc: 'Train once, adapt to everything', icon: <RocketIcon size={16} color="#5856D6" /> },
  { name: 'The Future', desc: 'Reasoning, agents, embodied AI', icon: <TrendingUpIcon size={16} color="#5856D6" /> },
]

/* ── Main component ── */
function DeepLearning({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('deep-learning', -1)
  const [maxStageReached, setMaxStageReached] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [fading, setFading] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const fadeTimerRef = useRef(null)
  const activeStepRef = useRef(null)

  function goToStage(target) {
    if (target < 0 || target > maxStageReached) return
    setShowFinal(false)
    setStage(target)
  }

  function nextStage() {
    if (stage < STAGES.length - 1) {
      setStage(stage + 1)
    } else {
      setFading(true)
      setTimeout(() => {
        setShowFinal(true)
        setStage(STAGES.length)
        markModuleComplete('deep-learning')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.dl-root')
          while (el) {
            if (el.scrollTop > 0) el.scrollTop = 0
            el = el.parentElement
          }
          window.scrollTo(0, 0)
        })
      }, 250)
    }
  }

  function prevStage() {
    if (stage > 0) setStage(stage - 1)
  }

  function dismissLearnTip() {
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 300)
  }

  function reset() {
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
    setShowWelcome(true)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
  }

  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    window.scrollTo(0, 0)
  }, [stage])

  // Progressive learn tips — milestone-based
  useEffect(() => {
    if (stage === 0 && !dismissedTips.has('stage0')) {
      setLearnTip({ key: 'stage0', text: 'You\'re at the beginning! This hierarchy shows where deep learning fits in the AI family. Click the timeline events below to explore key breakthroughs.' })
    } else if (stage === 1 && !dismissedTips.has('stage1')) {
      setLearnTip({ key: 'stage1', text: 'Drag the weight sliders to see how a neuron decides. Try making "known sender" very negative — the email becomes spam even from trusted contacts!' })
    } else if (stage === 3 && !dismissedTips.has('stage3')) {
      setLearnTip({ key: 'stage3', text: 'Click Train Step repeatedly and watch the loss drop. Each step is like turning a dial slightly to reduce error — that\'s gradient descent in action.' })
    } else if (stage === 5 && !dismissedTips.has('stage5')) {
      setLearnTip({ key: 'stage5', text: 'Click the word "it" in the heatmap — see how the model connects it to "cat"? This one insight is why Transformers power every modern AI.' })
    } else if (stage === 7 && !dismissedTips.has('stage7')) {
      setLearnTip({ key: 'stage7', text: 'You\'ve covered the entire deep learning stack — from a single neuron to the Transformer. The starter projects below are real things you can build today.' })
    } else {
      setLearnTip(null)
      setLearnTipFading(false)
    }
  }, [stage]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  const vizComponents = {
    0: <HierarchyViz active={stage === 0} />,
    1: <NeuronViz active={stage === 1} />,
    2: <NetworkViz active={stage === 2} />,
    3: <BackpropViz active={stage === 3} />,
    4: <CNNViz active={stage === 4} />,
    5: <TransformerViz active={stage === 5} />,
    6: <TricksViz active={stage === 6} />,
    7: <FutureViz active={stage === 7} />,
  }

  const tipContent = [
    'Deep learning existed since the 1980s but needed two things to take off: massive datasets and fast GPUs. Both arrived around 2012 \u2014 and the AI revolution began.',
    'The activation function is what makes neural networks non-linear \u2014 without it, stacking 100 layers would mathematically collapse into a single layer. Non-linearity is what gives depth its power.',
    'A network with 1 hidden layer can approximate ANY function \u2014 but needs astronomical width. Deep networks achieve the same with far fewer total neurons. That\'s the magic of depth.',
    'Backpropagation is the single most important algorithm in deep learning. Every AI model you use \u2014 ChatGPT, DALL-E, self-driving cars \u2014 learned everything it knows through this exact loop.',
    'ResNet (2015) introduced skip connections \u2014 letting gradients jump over layers. This allowed networks 152 layers deep. Before ResNet, 20 layers was the practical limit.',
    'Transformers are so powerful because attention is computed in parallel \u2014 not sequentially like RNNs. This meant they could finally be trained on internet-scale data using GPU farms.',
    'You\'ve now seen all the core tricks. In practice, combining these techniques is an art \u2014 and it\'s what separates a research paper from a working product.',
    'The most important skill is not knowing today\u2019s models \u2014 it is understanding the fundamentals. Models change every 6 months. Fundamentals last forever. You now have the fundamentals.',
  ]

  const warningContent = [
    null, null, null,
    'Vanishing gradients: in very deep networks, gradients shrink to near zero by the time they reach early layers \u2014 so those layers stop learning. This is why residual connections (Stage 7) were invented: they let gradients bypass layers entirely.',
    null, null,
    'Without these tricks, even the best architecture fails to train. The difference between a model that learns and one that doesn\u2019t is often just the right combination of these techniques.',
    null,
  ]

  /* ── Entry screen ── */
  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="deep-learning" size={48} style={{ color: '#5856D6' }} />}
        title="Deep Learning"
        subtitle="The Engine Behind Every AI Breakthrough"
        description="Every image AI sees, every word ChatGPT writes, every move AlphaGo makes — all powered by deep learning. This is where the magic actually happens. No PhD required."
        buttonText="Let's Go Deep"
        onStart={() => { setStage(0); markModuleStarted('deep-learning') }}
      />
    )
  }

  /* ── Quiz ── */
  if (showQuiz) {
    return (
      <div className="how-llms dl-root quiz-fade-in">
        <Quiz
          questions={deepLearningQuiz}
          tabName="Deep Learning"
          onBack={() => setShowQuiz(false)}
          onStartOver={() => reset()}
          onSwitchTab={onSwitchTab}
          currentModuleId="deep-learning"
        />
      </div>
    )
  }

  /* ── Final screen ── */
  if (showFinal) {
    return (
      <div className="how-llms dl-root">
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You now understand Deep Learning!</div>

          <div className="pe-final-grid">
            {TOOLKIT_ITEMS.map((item) => (
              <div key={item.name} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.name}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Deep Learning Toolkit</div>
            <table className="pe-reference">
              <thead><tr><th>Concept</th><th>Key Idea</th></tr></thead>
              <tbody>
                {TOOLKIT_ITEMS.map((item) => (
                  <tr key={item.name}>
                    <td className="pe-ref-technique">{item.name}</td>
                    <td>{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
              Test Your Knowledge &rarr;
            </button>
            <button className="how-secondary-btn" onClick={reset}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="deep-learning" onSwitchTab={onSwitchTab} />
        </div>
      </div>
    )
  }

  return (
    <div className={`how-llms dl-root ${fading ? 'dl-fading' : ''}`}>
      {/* Welcome banner */}
      {showWelcome && stage === 0 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Deep Learning</strong> — here's how to explore:
            <ol className="module-welcome-steps">
              <li>Walk through <strong>8 stages</strong> — from a single neuron to the Transformer architecture that powers ChatGPT</li>
              <li>Play with the <strong>interactive demos</strong> — drag sliders, click neurons, and watch data flow through networks</li>
              <li>At the end, review your <strong>Deep Learning toolkit</strong> and test your knowledge with a quiz</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Learn tip */}
      {learnTip && (
        <div className={`learn-tip${learnTipFading ? ' learn-tip-fading' : ''}`} role="status" aria-live="polite">
          <TipIcon size={16} color="#eab308" />
          <span className="learn-tip-text">{learnTip.text}</span>
          <button className="learn-tip-dismiss" onClick={() => { setDismissedTips(prev => new Set(prev).add(learnTip.key)); dismissLearnTip() }} aria-label="Dismiss tip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* Stepper */}
      <div className="how-stepper-wrapper how-fade-in">
        <div className="how-stepper dl-stepper">
          <div className="how-stepper-inner">
            {STAGES.map((s, i) => {
              const isCompleted = stage > i
              const isCurrent = stage === i
              const isActive = stage >= i
              const isClickable = i <= maxStageReached && !isCurrent
              return (
                <div key={s.key} className="how-step-wrapper" ref={isCurrent ? activeStepRef : null}>
                  <div
                    className={`how-step ${isActive ? 'how-step-active' : ''} ${isCurrent ? 'how-step-current' : ''} ${isCompleted ? 'how-step-completed' : ''} ${isClickable ? 'how-step-clickable' : ''}`}
                    onClick={isClickable ? () => goToStage(i) : undefined}
                  >
                    <div className="how-step-num">
                      {isCompleted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (i + 1)}
                    </div>
                    <div className="how-step-label">
                      {s.label}
                      <Tooltip text={STAGE_TOOLTIPS[s.key]} />
                    </div>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={`how-step-arrow ${stage > i ? 'how-arrow-active' : ''}`}>
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

      {/* Stage content */}
      <div className="how-content">
        {stage >= 0 && stage < STAGES.length && (
          <div className="how-stage how-fade-in" key={stage}>
            <div className="how-info-card how-info-card-edu">
              <div className="how-info-card-header">
                <strong>{EXPLANATIONS[stage].title}</strong>
              </div>
              {EXPLANATIONS[stage].content.split('\n\n').map((para, i) => {
                const lines = para.split('\n')
                const isList = lines.every((l) => l.startsWith('- '))
                if (isList) {
                  return (
                    <ul key={i} className="dl-bullet-list">
                      {lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}
                    </ul>
                  )
                }
                return <p key={i}>{para}</p>
              })}

              {/* Tip box */}
              {tipContent[stage] && (
                <div className="how-info-tip">
                  <TipIcon size={16} color="#eab308" />
                  {tipContent[stage]}
                </div>
              )}

              {/* Warning box */}
              {warningContent[stage] && (
                <div className="how-info-tip" style={{ background: 'rgba(255, 149, 0, 0.06)', borderLeftColor: '#FF9500' }}>
                  <WarningIcon size={16} color="#FF9500" />
                  {warningContent[stage]}
                </div>
              )}

              <ToolChips tools={DL_TOOLS[stage]} />
            </div>

            {vizComponents[stage]}

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
      </div>

    </div>
  )
}

export default DeepLearning
