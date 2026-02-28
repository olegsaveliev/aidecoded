import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { TipIcon, WarningIcon, CheckIcon, CpuIcon, SlidersIcon, ZapIcon, LayersIcon, PlayIcon, TargetIcon, RefreshIcon, RepeatIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { neuralNetworksQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './NeuralNetworks.css'
import { scrollStageToTop } from './scrollUtils.js'

/* ── Constants ── */

const STAGES = [
  { key: 'neuron', label: 'The Neuron' },
  { key: 'weights', label: 'Weights & Bias' },
  { key: 'activation', label: 'Activation' },
  { key: 'layers', label: 'Layers' },
  { key: 'forward', label: 'Forward Pass' },
  { key: 'loss', label: 'Loss Function' },
  { key: 'backprop', label: 'Backpropagation' },
  { key: 'training', label: 'Training Loop' },
]

const STAGE_TOOLTIPS = {
  neuron: 'What is a neuron and what does it do?',
  weights: 'Weights and bias — the adjustable knobs',
  activation: 'Activation functions — adding non-linearity',
  layers: 'Layers — building depth',
  forward: 'Forward pass — making a prediction',
  loss: 'Loss — measuring how wrong we are',
  backprop: 'Backpropagation — learning from mistakes',
  training: 'Training — watch the network get smarter',
}

const NEXT_LABELS = [
  'Weights and bias →',
  'Activation functions →',
  'Build layers →',
  'Forward pass →',
  'Loss function →',
  'Backpropagation →',
  'Training loop →',
  'Test my knowledge →',
]

const NN_TOOLS = {
  0: [
    { name: 'PyTorch', color: '#5856D6', desc: 'Open-source deep learning framework by Meta' },
    { name: 'TensorFlow', color: '#5856D6', desc: 'End-to-end ML platform by Google' },
    { name: 'Keras', color: '#5856D6', desc: 'High-level neural network API' },
    { name: 'NumPy', color: '#5856D6', desc: 'Numerical computing library for Python' },
    { name: 'scikit-learn', color: '#5856D6', desc: 'Machine learning library for classical ML' },
    { name: 'JAX', color: '#5856D6', desc: 'High-performance numerical computing by Google' },
  ],
  1: [
    { name: 'PyTorch nn.Linear', color: '#5856D6', desc: 'Applies a linear transformation with weights and bias' },
    { name: 'TensorFlow Dense', color: '#5856D6', desc: 'Fully-connected layer with configurable weights' },
    { name: 'Keras weights', color: '#5856D6', desc: 'Access and modify layer weights directly' },
    { name: 'NumPy random', color: '#5856D6', desc: 'Generate random weight matrices for experiments' },
  ],
  2: [
    { name: 'PyTorch F.relu', color: '#5856D6', desc: 'Apply ReLU activation function' },
    { name: 'tf.nn.relu', color: '#5856D6', desc: 'TensorFlow ReLU activation' },
    { name: 'F.sigmoid', color: '#5856D6', desc: 'Apply sigmoid activation function' },
    { name: 'torch.tanh', color: '#5856D6', desc: 'Apply hyperbolic tangent activation' },
  ],
  3: [
    { name: 'PyTorch nn.Sequential', color: '#5856D6', desc: 'Stack layers sequentially for forward pass' },
    { name: 'Keras Sequential', color: '#5856D6', desc: 'Linear stack of layers for simple models' },
    { name: 'nn.Linear', color: '#5856D6', desc: 'Fully connected layer (dense)' },
    { name: 'Conv2d', color: '#5856D6', desc: 'Convolutional layer for image processing' },
  ],
  4: [],
  5: [
    { name: 'nn.BCELoss', color: '#5856D6', desc: 'Binary Cross-Entropy loss for classification' },
    { name: 'nn.MSELoss', color: '#5856D6', desc: 'Mean Squared Error loss for regression' },
    { name: 'nn.CrossEntropyLoss', color: '#5856D6', desc: 'Multi-class classification loss' },
    { name: 'tf.keras losses', color: '#5856D6', desc: 'TensorFlow loss function library' },
  ],
  6: [
    { name: 'loss.backward()', color: '#5856D6', desc: 'Compute gradients via automatic differentiation' },
    { name: 'optimizer.step()', color: '#5856D6', desc: 'Update weights using computed gradients' },
    { name: 'optimizer.zero_grad()', color: '#5856D6', desc: 'Reset gradients before each training step' },
    { name: 'autograd', color: '#5856D6', desc: 'PyTorch automatic differentiation engine' },
    { name: 'GradientTape', color: '#5856D6', desc: 'TensorFlow gradient recording context' },
  ],
  7: [
    { name: 'model.train()', color: '#5856D6', desc: 'Set model to training mode (enables dropout, etc.)' },
    { name: 'DataLoader', color: '#5856D6', desc: 'PyTorch batching and shuffling utility' },
    { name: 'model.fit()', color: '#5856D6', desc: 'Keras one-line training loop' },
  ],
}

const TOOLKIT_ITEMS = [
  { name: 'The Neuron', desc: 'Weighted sum + activation = one decision unit', icon: <CpuIcon size={16} color="#5856D6" /> },
  { name: 'Weights & Bias', desc: 'The only things a network changes when it learns', icon: <SlidersIcon size={16} color="#5856D6" /> },
  { name: 'Activation', desc: 'Non-linearity that lets networks learn curves', icon: <ZapIcon size={16} color="#5856D6" /> },
  { name: 'Layers', desc: 'Depth lets networks learn patterns of patterns', icon: <LayersIcon size={16} color="#5856D6" /> },
  { name: 'Forward Pass', desc: 'Data flows input to output to make a prediction', icon: <PlayIcon size={16} color="#5856D6" /> },
  { name: 'Loss Function', desc: 'A single number measuring how wrong the prediction is', icon: <TargetIcon size={16} color="#5856D6" /> },
  { name: 'Backpropagation', desc: 'Gradients propagated backwards to fix each weight', icon: <RefreshIcon size={16} color="#5856D6" /> },
  { name: 'Training Loop', desc: 'Forward, loss, backward, update — repeat until smart', icon: <RepeatIcon size={16} color="#5856D6" /> },
]

const EXPLANATIONS = [
  {
    title: 'Stage 1: One Neuron, One Idea',
    content: `Before there were neural networks, there was one neuron.

A biological neuron receives signals from other neurons, adds them up, and fires if the total is strong enough. An artificial neuron does exactly the same thing in three steps:

Step 1 — Receive: Take in one or more numbers as input.

Step 2 — Combine: Multiply each input by a weight. Add them all together. Add a bias (a baseline number).

Step 3 — Decide: Pass the total through an activation function. Output a single number.

That is it. One neuron. The entire intelligence of any AI system — from a spam filter to GPT — is built from billions of these doing exactly this, connected together.`,
    tip: 'The word "neuron" is borrowed from biology but do not take the analogy too far. Artificial neurons are much simpler than biological ones. They are really just a weighted sum followed by a function. The power comes from connecting millions of them.',
  },
  {
    title: 'Stage 2: The Adjustable Knobs',
    content: `Weights and bias are the only things a neural network actually changes when it learns. Everything else — the architecture, the activation functions, the number of layers — is fixed before training starts.

Learning = adjusting weights and biases. That is all learning ever is in a neural network.

What weights do: each weight controls how much one input influences the output. Weight = 0 means the input is ignored. Weight = 1 passes it unchanged. Weight = 2 amplifies it. Weight = -1 gives the opposite effect.

What bias does: bias shifts the entire output up or down. Without bias, the neuron can only pass through the origin. Bias lets the network learn an offset — a baseline that is always added regardless of the inputs. Think of bias as the neuron's default opinion before it sees any evidence.

Why weights start random: before training, we do not know what the right weights are. So we start with small random numbers. Training adjusts them toward correct values.`,
    tip: 'Weight initialisation matters more than most beginners realise. Too large: neurons saturate and gradients vanish. Too small: signals fade before reaching deep layers. Modern networks use carefully designed initialisation schemes like Xavier and He initialisation.',
  },
  {
    title: 'Stage 3: Adding the Spark of Non-Linearity',
    content: `Without activation functions, a neural network — no matter how many layers — would just be a single linear equation. You could stack 100 layers. It would still be equivalent to one matrix multiply. No depth. No complexity. No power.

Activation functions break that linearity. They let networks learn curves, thresholds, complex patterns — not just straight lines.

Sigmoid (the classic): squashes any input to 0–1. Best for output layers (probabilities). Problem: vanishing gradients in deep networks.

ReLU (the modern default): outputs max(0, x). Best for hidden layers. Advantages: simple, fast, no vanishing gradient. Problem: dying ReLU — if input always negative, neuron stops learning entirely.

Tanh (the balanced): S-curve from -1 to 1. Better than sigmoid for hidden layers because zero-centred output. Still suffers vanishing gradients at extremes.`,
    tip: 'GELU (Gaussian Error Linear Unit) is what GPT and BERT use in their hidden layers. It is a smooth approximation of ReLU that works better in transformer architectures. You will see it everywhere in modern LLM code.',
  },
  {
    title: 'Stage 4: Going Deeper',
    content: `One neuron can learn one simple pattern. A layer of neurons can learn many patterns simultaneously. Multiple layers can learn patterns of patterns. This is why depth matters.

Input layer: just the raw data. No computation happens here. Width = number of input features.

Hidden layers: where the learning happens. Each neuron looks at all neurons in the previous layer. Early layers learn simple patterns (edges, tones). Later layers learn complex combinations (shapes, phrases, concepts).

Output layer: final prediction. Width depends on task — binary classification: 1 neuron, multi-class: 10 neurons, regression: 1 neuron with no activation.

Why depth beats width: a wide-but-shallow network needs exponentially more neurons to approximate the same function as a deep network. Depth = efficiency. Each layer builds on what the previous layer learned.

The universal approximation theorem says one hidden layer with enough neurons can approximate any continuous function. But "enough neurons" might be astronomical. Depth is far more practical.`,
    tip: 'In modern LLMs, "depth" means transformer layers, each with its own attention heads and feed-forward sublayers. GPT-4 is estimated to have ~96 transformer layers. Each layer refines the representation of the input before passing it to the next.',
  },
  {
    title: 'Stage 5: Making a Prediction',
    content: `The forward pass is the network making a prediction. Data flows in from the left, through every layer, and a prediction comes out the right. It is called "forward" because information only flows forward — left to right, input to output.

The full 2 → 3 → 1 forward pass: Step 1, input values enter the network. Step 2, each hidden neuron computes its weighted sum plus bias, then applies ReLU. Step 3, the output neuron computes its weighted sum plus bias, then applies sigmoid to get a probability.

Every ChatGPT response, every image classifier, every recommendation engine runs a forward pass like this — just with billions more neurons and hundreds of layers.`,
    tip: 'The forward pass is deterministic: same inputs and same weights always produce the same output. This is what makes neural networks useful — once trained, they give consistent predictions. The randomness only exists during training (dropout, data shuffling, initialisation).',
  },
  {
    title: 'Stage 6: Measuring How Wrong We Are',
    content: `The network made a prediction. Now we need to measure how wrong it was. This is the loss function's job.

Loss = a single number representing how bad the current prediction is. Loss = 0 means a perfect prediction. High loss means a terrible prediction. The entire learning process is: find the weights that minimise the loss.

Binary cross-entropy (for classification): used when output is a probability (0 to 1). Penalises confident wrong predictions heavily. A prediction of 0.90 when the true label is 1 gives loss = 0.105 (good). A prediction of 0.10 when the true label is 1 gives loss = 2.303 (terrible).

Mean squared error (for regression): used when output is a continuous number. Squaring means large errors are punished more than small errors.

The loss landscape: imagine all possible weight combinations as a high-dimensional surface. The loss is the height at each point. Training is finding the lowest valley.`,
    warning: 'Choosing the wrong loss function is a common mistake. Cross-entropy for classification. MSE for regression. Using MSE for classification leads to poor training dynamics — the gradients become saturated and learning stalls.',
  },
  {
    title: 'Stage 7: Learning from Mistakes',
    content: `We have a loss. Now we need to fix it. Backpropagation (backprop) is the algorithm that figures out: for each weight in the entire network, should it increase or decrease, and by exactly how much?

It does this by computing gradients. A gradient tells you the slope of the loss with respect to one weight. Positive gradient: increasing this weight makes the loss worse. Negative gradient: increasing this weight makes the loss better.

The chain rule (the math behind backprop): to compute how a hidden layer weight affected the loss, you multiply the gradients at each step backwards through the network. This is why it is called backPROPAGATION: gradients are propagated backwards through the network, layer by layer.

Gradient descent (the update rule): new_weight = old_weight - learning_rate × gradient. The learning rate controls how big each step is. Too large: overshoot minimum, diverge. Too small: training takes forever.`,
    tip: 'Vanishing gradients are the central problem in training deep networks. When gradients are multiplied through many layers (chain rule), they can shrink toward zero — early layers stop learning. ReLU activations, batch normalisation, and residual connections (skip connections in ResNets) all exist primarily to solve this problem.',
  },
  {
    title: 'Stage 8: Watch It Get Smarter',
    content: `One forward pass + one backprop step = one training iteration. Real training repeats this thousands or millions of times.

Epoch: one complete pass through all training data. Small datasets: train for hundreds of epochs. Large datasets (LLMs): often less than one epoch — so much data, you rarely see it all twice.

Batch size: how many examples per gradient update. Batch size 1 (SGD): noisy but fast updates. Batch size 32: common balance. Batch size 256+: smooth gradients, needs more memory.

Overfitting: when the network memorises training data but fails on new data. Training loss: falling. Validation loss: rising. Fixes: more data, dropout, regularisation, early stopping.

Underfitting: network too simple. Cannot capture the pattern. Both losses stay high. Fixes: bigger network, more epochs.

The training goal: find weights where training loss is low, validation loss is also low, and the gap between them is small.`,
    tip: 'Modern LLM training uses AdamW optimiser, cosine learning rate schedule, and trains on trillions of tokens. GPT-3 trained for about 300 billion tokens. The principles are identical to what you learned here — forward pass, loss, backprop, update — just at incomprehensible scale.',
  },
]

/* ── Helpers ── */

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}
function relu(x) {
  return Math.max(0, x)
}
function tanhFn(x) {
  return Math.tanh(x)
}

/* ── Visualisation: Stage 1 — Single Neuron ── */

function NeuronViz({ active }) {
  const [step, setStep] = useState(0)
  const [x1, setX1] = useState(0.8)
  const [x2, setX2] = useState(0.6)
  const w1 = 0.5, w2 = 0.8, bias = 0.1

  const total = w1 * x1 + w2 * x2 + bias
  const output = sigmoid(total)

  useEffect(() => {
    if (!active) setStep(0)
  }, [active])

  return (
    <div className="nn-viz nn-neuron-viz">
      <div className="nn-viz-intro">
        <strong>Interactive: Build a neuron step by step</strong>
        <p>This is a single artificial neuron. Two inputs (x1, x2) come in from the left, get multiplied by weights, summed with a bias, and passed through an activation function. Click the three steps below the diagram to watch it happen, then use the sliders to experiment.</p>
      </div>
      <svg viewBox="0 0 480 240" className="nn-neuron-svg">
        {/* Input arrows */}
        <line x1="60" y1="80" x2="180" y2="120" stroke={step >= 1 ? '#5856D6' : 'var(--border)'} strokeWidth={step >= 2 ? 3 : 1.5} opacity={step >= 1 ? 1 : 0.5} />
        <line x1="60" y1="160" x2="180" y2="120" stroke={step >= 1 ? '#5856D6' : 'var(--border)'} strokeWidth={step >= 2 ? 3 : 1.5} opacity={step >= 1 ? 1 : 0.5} />

        {/* Input labels */}
        <text x="30" y="80" textAnchor="middle" className="nn-svg-label" fill="var(--text-primary)">x1</text>
        <text x="30" y="96" textAnchor="middle" className="nn-svg-value" fill="var(--text-secondary)">{x1.toFixed(1)}</text>
        <text x="30" y="160" textAnchor="middle" className="nn-svg-label" fill="var(--text-primary)">x2</text>
        <text x="30" y="176" textAnchor="middle" className="nn-svg-value" fill="var(--text-secondary)">{x2.toFixed(1)}</text>

        {/* Weight labels */}
        <text x="110" y="88" textAnchor="middle" className="nn-svg-weight" fill={step >= 2 ? '#5856D6' : 'var(--text-tertiary)'}>
          w1={step >= 2 ? w1.toFixed(1) : '?'}
        </text>
        <text x="110" y="168" textAnchor="middle" className="nn-svg-weight" fill={step >= 2 ? '#5856D6' : 'var(--text-tertiary)'}>
          w2={step >= 2 ? w2.toFixed(1) : '?'}
        </text>

        {/* Neuron circle */}
        <circle cx="210" cy="120" r="30" fill={step >= 3 ? '#5856D6' : 'var(--bg-secondary)'} stroke={step >= 1 ? '#5856D6' : 'var(--border)'} strokeWidth="2" className={step >= 3 ? 'nn-neuron-active' : ''} />
        <text x="210" y="125" textAnchor="middle" className="nn-svg-neuron-label" fill={step >= 3 ? '#fff' : 'var(--text-secondary)'}>
          {step >= 3 ? output.toFixed(2) : 'f'}
        </text>

        {/* Output arrow */}
        <line x1="240" y1="120" x2="360" y2="120" stroke={step >= 3 ? '#5856D6' : 'var(--border)'} strokeWidth={step >= 3 ? 3 : 1.5} opacity={step >= 3 ? 1 : 0.5} />
        <text x="390" y="124" textAnchor="middle" className="nn-svg-label" fill={step >= 3 ? '#5856D6' : 'var(--text-tertiary)'}>
          {step >= 3 ? output.toFixed(2) : 'output'}
        </text>

        {/* Signal pulse dots */}
        {step >= 1 && step < 2 && (
          <>
            <circle r="4" fill="#5856D6" opacity="0.8">
              <animateMotion dur="0.6s" repeatCount="1" path="M60,80 L180,120" />
            </circle>
            <circle r="4" fill="#5856D6" opacity="0.8">
              <animateMotion dur="0.6s" repeatCount="1" path="M60,160 L180,120" />
            </circle>
          </>
        )}
      </svg>

      {/* Step buttons */}
      <div className="nn-step-buttons">
        <button className={`nn-step-btn${step >= 1 ? ' nn-step-done' : ''}`} onClick={() => setStep(1)} disabled={step >= 1}>
          <span className="nn-step-num-badge">1</span> Receive inputs
        </button>
        <button className={`nn-step-btn${step >= 2 ? ' nn-step-done' : ''}`} onClick={() => setStep(2)} disabled={step < 1 || step >= 2}>
          <span className="nn-step-num-badge">2</span> Multiply by weights
        </button>
        <button className={`nn-step-btn${step >= 3 ? ' nn-step-done' : ''}`} onClick={() => setStep(3)} disabled={step < 2 || step >= 3}>
          <span className="nn-step-num-badge">3</span> Apply activation
        </button>
      </div>

      {/* Calculation display */}
      {step >= 2 && (
        <div className="nn-calc-panel how-fade-in">
          <div className="nn-calc-line">{w1} &times; {x1.toFixed(1)} = {(w1 * x1).toFixed(2)}</div>
          <div className="nn-calc-line">{w2} &times; {x2.toFixed(1)} = {(w2 * x2).toFixed(2)}</div>
          <div className="nn-calc-line">bias = {bias}</div>
          <div className="nn-calc-total">total = {total.toFixed(2)}</div>
          {step >= 3 && <div className="nn-calc-output">sigmoid({total.toFixed(2)}) = <strong>{output.toFixed(2)}</strong></div>}
        </div>
      )}

      {/* Interactive sliders */}
      <div className="nn-input-sliders">
        <label className="nn-slider-label">
          x1: {x1.toFixed(1)}
          <input type="range" min="0" max="1" step="0.1" value={x1} onChange={e => { setX1(+e.target.value); if (step >= 2) setStep(3) }} className="nn-slider" />
        </label>
        <label className="nn-slider-label">
          x2: {x2.toFixed(1)}
          <input type="range" min="0" max="1" step="0.1" value={x2} onChange={e => { setX2(+e.target.value); if (step >= 2) setStep(3) }} className="nn-slider" />
        </label>
        <p className="nn-slider-hint">Try making the neuron fire strongly (output &gt; 0.8) and weakly (output &lt; 0.2)</p>
      </div>
    </div>
  )
}

/* ── Visualisation: Stage 2 — Weight Editor ── */

const SCENARIOS = [
  { label: 'Exclamation Spam', w1: 0.9, w2: -0.8, bias: 0.1, desc: 'Exclamation marks strongly predict spam; known contacts strongly predict not-spam.' },
  { label: 'Equal Importance', w1: 0.5, w2: 0.5, bias: 0.0, desc: 'Both inputs contribute equally with no default bias.' },
  { label: 'Ignore Input 1', w1: 0.0, w2: 1.0, bias: 0.1, desc: 'Input 1 has zero influence. Only input 2 matters.' },
  { label: 'Amplify Both', w1: 1.5, w2: 1.5, bias: -0.5, desc: 'Both inputs amplified, but high threshold from negative bias.' },
]

function WeightEditorViz({ active }) {
  const [w1, setW1] = useState(0.5)
  const [w2, setW2] = useState(0.8)
  const [bias, setBias] = useState(0.1)
  const [activeScenario, setActiveScenario] = useState(null)
  const x1 = 0.7, x2 = 0.4

  const total = w1 * x1 + w2 * x2 + bias
  const output = sigmoid(total)

  function applyScenario(s, i) {
    setW1(s.w1); setW2(s.w2); setBias(s.bias)
    setActiveScenario(i)
  }

  const getLineColor = (w) => w >= 0 ? '#5856D6' : '#FF3B30'
  const getLineWidth = (w) => Math.max(1, Math.min(6, Math.abs(w) * 3))
  const getLineOpacity = (w) => Math.max(0.15, Math.min(1, Math.abs(w) * 0.5))

  return (
    <div className="nn-viz nn-weight-viz">
      <div className="nn-viz-intro">
        <strong>Interactive: Adjust weights and see what happens</strong>
        <p>Drag the weight sliders to change how much each input influences the output. Line thickness shows weight strength. Line colour shows sign: indigo = positive, red = negative. Try the preset scenarios below to see how real applications use different weight patterns.</p>
      </div>
      <svg viewBox="0 0 480 200" className="nn-weight-svg">
        {/* Connections with weight encoding — border to border */}
        <line x1="78" y1="73" x2="197" y2="95" stroke={getLineColor(w1)} strokeWidth={getLineWidth(w1)} opacity={getLineOpacity(w1)} />
        <line x1="78" y1="127" x2="197" y2="105" stroke={getLineColor(w2)} strokeWidth={getLineWidth(w2)} opacity={getLineOpacity(w2)} />

        {/* Weight badges */}
        <rect x="118" y="62" width="44" height="18" rx="4" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
        <text x="140" y="75" textAnchor="middle" className="nn-svg-weight-badge" fill={getLineColor(w1)}>{w1.toFixed(2)}</text>
        <rect x="118" y="120" width="44" height="18" rx="4" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
        <text x="140" y="133" textAnchor="middle" className="nn-svg-weight-badge" fill={getLineColor(w2)}>{w2.toFixed(2)}</text>

        {/* Input nodes */}
        <circle cx="60" cy="70" r="18" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="2" />
        <text x="60" y="67" textAnchor="middle" className="nn-svg-label" fill="var(--text-primary)">x1</text>
        <text x="60" y="80" textAnchor="middle" className="nn-svg-value" fill="var(--text-secondary)">{x1}</text>
        <circle cx="60" cy="130" r="18" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="2" />
        <text x="60" y="127" textAnchor="middle" className="nn-svg-label" fill="var(--text-primary)">x2</text>
        <text x="60" y="140" textAnchor="middle" className="nn-svg-value" fill="var(--text-secondary)">{x2}</text>

        {/* Neuron */}
        <circle cx="220" cy="100" r="24" fill={output > 0.5 ? '#5856D6' : 'var(--bg-secondary)'} stroke="#5856D6" strokeWidth="2" opacity={Math.max(0.3, output)} />
        <text x="220" y="105" textAnchor="middle" className="nn-svg-neuron-label" fill={output > 0.5 ? '#fff' : 'var(--text-secondary)'}>{output.toFixed(2)}</text>

        {/* Output arrow */}
        <line x1="244" y1="100" x2="340" y2="100" stroke="#5856D6" strokeWidth="2" opacity="0.6" />
        <text x="370" y="105" textAnchor="middle" className="nn-svg-label" fill="#5856D6">{output.toFixed(2)}</text>
      </svg>

      {/* Weight sliders */}
      <div className="nn-weight-sliders">
        <label className="nn-slider-label">
          w1: <span style={{ color: getLineColor(w1) }}>{w1.toFixed(1)}</span>
          <input type="range" min="-2" max="2" step="0.1" value={w1} onChange={e => { setW1(+e.target.value); setActiveScenario(null) }} className="nn-slider" />
        </label>
        <label className="nn-slider-label">
          w2: <span style={{ color: getLineColor(w2) }}>{w2.toFixed(1)}</span>
          <input type="range" min="-2" max="2" step="0.1" value={w2} onChange={e => { setW2(+e.target.value); setActiveScenario(null) }} className="nn-slider" />
        </label>
        <label className="nn-slider-label">
          bias: {bias.toFixed(1)}
          <input type="range" min="-1" max="1" step="0.1" value={bias} onChange={e => { setBias(+e.target.value); setActiveScenario(null) }} className="nn-slider" />
        </label>
      </div>

      {/* Live calculation */}
      <div className="nn-calc-panel">
        <div className="nn-calc-line">w1 &times; x1 = {w1.toFixed(2)} &times; {x1} = {(w1 * x1).toFixed(3)}</div>
        <div className="nn-calc-line">w2 &times; x2 = {w2.toFixed(2)} &times; {x2} = {(w2 * x2).toFixed(3)}</div>
        <div className="nn-calc-line">bias = {bias.toFixed(2)}</div>
        <div className="nn-calc-total">total = {total.toFixed(3)}</div>
        <div className="nn-calc-output">output = sigmoid({total.toFixed(3)}) = <strong>{output.toFixed(3)}</strong></div>
        <div className="nn-calc-interpretation">
          {output > 0.8 ? `The neuron fires strongly (${(output * 100).toFixed(0)}% confidence). The weighted inputs clearly exceed the threshold.`
            : output > 0.6 ? `The neuron leans toward firing (${(output * 100).toFixed(0)}%). The inputs push it above 0.5 but not by much.`
            : output > 0.4 ? `The neuron is uncertain (${(output * 100).toFixed(0)}%). The inputs nearly cancel out — close to the decision boundary.`
            : output > 0.2 ? `The neuron leans toward not firing (${(output * 100).toFixed(0)}%). The negative bias or weights pull it below 0.5.`
            : `The neuron stays silent (${(output * 100).toFixed(0)}%). The weighted sum is strongly negative — sigmoid squashes it near zero.`}
        </div>
      </div>

      {/* Scenario buttons */}
      <div className="nn-scenario-buttons">
        {SCENARIOS.map((s, i) => (
          <button key={s.label} className={`nn-scenario-btn${activeScenario === i ? ' nn-scenario-active' : ''}`} onClick={() => applyScenario(s, i)}>
            {s.label}
          </button>
        ))}
      </div>
      {activeScenario !== null && (
        <p className="nn-scenario-desc how-fade-in">{SCENARIOS[activeScenario].desc}</p>
      )}

      {/* Weight magnitude legend */}
      <div className="nn-weight-legend">
        <span className="nn-legend-title">Connection thickness = weight strength</span>
        <div className="nn-legend-strip">
          <div className="nn-legend-item"><span className="nn-legend-line nn-legend-thin" /><span>Near zero</span></div>
          <div className="nn-legend-item"><span className="nn-legend-line nn-legend-med" /><span>|0.5|</span></div>
          <div className="nn-legend-item"><span className="nn-legend-line nn-legend-thick" /><span>|1.0|</span></div>
          <div className="nn-legend-item"><span className="nn-legend-line nn-legend-max" /><span>|2.0|</span></div>
        </div>
      </div>
    </div>
  )
}

/* ── Visualisation: Stage 3 — Activation Functions ── */

function ActivationViz({ active }) {
  const [activeTab, setActiveTab] = useState('sigmoid')
  const [inputVal, setInputVal] = useState(0)
  const [showComparison, setShowComparison] = useState(false)
  const canvasRef = useRef(null)

  const fns = useMemo(() => ({
    sigmoid: { fn: sigmoid, label: 'Sigmoid', formula: 'σ(x) = 1 / (1 + e^(-x))', range: [0, 1], color: '#5856D6' },
    relu: { fn: relu, label: 'ReLU', formula: 'ReLU(x) = max(0, x)', range: [0, 4], color: '#34C759' },
    tanh: { fn: tanhFn, label: 'Tanh', formula: 'tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))', range: [-1, 1], color: '#FF9500' },
  }), [])

  const currentFn = fns[activeTab]
  const outputVal = currentFn.fn(inputVal)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const cssW = 460, cssH = 220
    canvas.width = cssW * dpr
    canvas.height = cssH * dpr
    canvas.style.width = cssW + 'px'
    canvas.style.height = cssH + 'px'
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    const w = cssW, h = cssH
    ctx.clearRect(0, 0, w, h)

    const padX = 40, padY = 20
    const plotW = w - padX * 2, plotH = h - padY * 2

    // Draw grid
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#d2d2d7'
    ctx.lineWidth = 0.5
    // Axes
    const xAxis = padY + plotH * (currentFn.range[1] / (currentFn.range[1] - currentFn.range[0]))
    const yAxis = padX + plotW * (4 / 8) // x=0 at center
    ctx.beginPath()
    ctx.moveTo(padX, xAxis); ctx.lineTo(w - padX, xAxis)
    ctx.moveTo(yAxis, padY); ctx.lineTo(yAxis, h - padY)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || '#86868b'
    ctx.font = '10px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('-4', padX, xAxis + 14)
    ctx.fillText('4', w - padX, xAxis + 14)
    ctx.fillText('0', yAxis - 10, xAxis + 14)

    function toCanvas(xVal, yVal) {
      const cx = padX + ((xVal + 4) / 8) * plotW
      const cy = padY + ((currentFn.range[1] - yVal) / (currentFn.range[1] - currentFn.range[0])) * plotH
      return [cx, cy]
    }

    if (showComparison) {
      // Draw all three
      Object.values(fns).forEach(fnObj => {
        ctx.strokeStyle = fnObj.color
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let px = 0; px <= plotW; px++) {
          const xVal = (px / plotW) * 8 - 4
          let yVal = fnObj.fn(xVal)
          yVal = Math.max(currentFn.range[0], Math.min(currentFn.range[1], yVal))
          const [cx, cy] = toCanvas(xVal, yVal)
          px === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy)
        }
        ctx.stroke()
      })
    } else {
      // Draw single function
      ctx.strokeStyle = currentFn.color
      ctx.lineWidth = 2.5
      ctx.beginPath()
      for (let px = 0; px <= plotW; px++) {
        const xVal = (px / plotW) * 8 - 4
        let yVal = currentFn.fn(xVal)
        yVal = Math.max(currentFn.range[0], Math.min(currentFn.range[1], yVal))
        const [cx, cy] = toCanvas(xVal, yVal)
        px === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy)
      }
      ctx.stroke()

      // Draw input/output markers
      let markerY = currentFn.fn(inputVal)
      markerY = Math.max(currentFn.range[0], Math.min(currentFn.range[1], markerY))
      const [mx, my] = toCanvas(inputVal, markerY)

      // Vertical dashed line
      ctx.setLineDash([4, 3])
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || '#86868b'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(mx, xAxis); ctx.lineTo(mx, my)
      ctx.stroke()
      // Horizontal dashed line
      ctx.beginPath()
      ctx.moveTo(yAxis, my); ctx.lineTo(mx, my)
      ctx.stroke()
      ctx.setLineDash([])

      // Dot at intersection
      ctx.fillStyle = currentFn.color
      ctx.beginPath()
      ctx.arc(mx, my, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [activeTab, inputVal, showComparison, fns, currentFn])

  return (
    <div className="nn-viz nn-activation-viz">
      <div className="nn-viz-intro">
        <strong>Interactive: Explore three activation functions</strong>
        <p>Switch between Sigmoid, ReLU, and Tanh to see how each transforms an input number. Drag the slider to move the input value and watch the output change on the graph. Without these functions, a neural network could only learn straight lines.</p>
      </div>
      {/* Tabs */}
      <div className="nn-act-tabs">
        {Object.entries(fns).map(([key, obj]) => (
          <button key={key} className={`nn-act-tab${activeTab === key ? ' nn-act-tab-active' : ''}`} style={activeTab === key ? { borderColor: obj.color, color: obj.color } : {}} onClick={() => { setActiveTab(key); setShowComparison(false) }}>
            {obj.label}
          </button>
        ))}
        <button className={`nn-act-tab nn-act-tab-compare${showComparison ? ' nn-act-tab-active' : ''}`} onClick={() => setShowComparison(!showComparison)}>
          Compare all
        </button>
      </div>

      {/* Formula card */}
      {!showComparison && (
        <div className="nn-formula-card how-fade-in">
          <code>{currentFn.formula}</code>
          <span className="nn-formula-range">Output: [{currentFn.range[0]}, {currentFn.range[1] === 4 ? '∞' : currentFn.range[1]}]</span>
        </div>
      )}

      {/* Graph */}
      <canvas ref={canvasRef} className="nn-act-canvas" />

      {/* Input slider */}
      {!showComparison && (
        <div className="nn-act-input">
          <label className="nn-slider-label">
            Input: {inputVal.toFixed(1)}
            <input type="range" min="-4" max="4" step="0.1" value={inputVal} onChange={e => setInputVal(+e.target.value)} className="nn-slider" />
          </label>
          <div className="nn-act-output">
            f({inputVal.toFixed(2)}) = <strong>{outputVal.toFixed(4)}</strong>
          </div>
        </div>
      )}

      {showComparison && (
        <div className="nn-act-legend how-fade-in">
          <span style={{ color: '#5856D6' }}>Sigmoid</span>
          <span style={{ color: '#34C759' }}>ReLU</span>
          <span style={{ color: '#FF9500' }}>Tanh</span>
        </div>
      )}

      {/* Dead ReLU callout */}
      {activeTab === 'relu' && inputVal < 0 && !showComparison && (
        <div className="nn-dead-relu how-fade-in">
          <WarningIcon size={14} color="#FF9500" />
          <span>This neuron is dead &mdash; gradient = 0, no learning possible through it.</span>
        </div>
      )}
    </div>
  )
}

/* ── Visualisation: Stage 4 — Network Growth ── */

function LayerViz({ active }) {
  const [buildStep, setBuildStep] = useState(0)
  const [showWideVsDeep, setShowWideVsDeep] = useState(false)
  const timersRef = useRef([])
  // Pre-generate random connection weights to avoid flicker on re-render
  const connWeights = useMemo(() => {
    const w = {}
    const inputs = ['x1', 'x2']
    const hidden = ['h1', 'h2', 'h3']
    const output = ['y']
    inputs.forEach(inp => hidden.forEach(hid => {
      w[`${inp}-${hid}`] = { width: 1 + Math.random() * 3, opacity: 0.3 + Math.random() * 0.7 }
    }))
    hidden.forEach(hid => output.forEach(out => {
      w[`${hid}-${out}`] = { width: 1 + Math.random() * 3, opacity: 0.3 + Math.random() * 0.7 }
    }))
    return w
  }, [])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function playBuild() {
    clearTimers()
    setBuildStep(0)
    for (let i = 1; i <= 5; i++) {
      timersRef.current.push(setTimeout(() => setBuildStep(i), i * 600))
    }
  }

  useEffect(() => () => clearTimers(), [])

  const nodes = {
    inputs: buildStep >= 3 ? [{ label: 'x1', y: 60 }, { label: 'x2', y: 160 }] : [],
    hidden: buildStep >= 2 ? [{ label: 'h1', y: 40 }, { label: 'h2', y: 110 }, { label: 'h3', y: 180 }] : buildStep >= 1 ? [{ label: 'h1', y: 110 }] : [],
    output: buildStep >= 4 ? [{ label: 'y', y: 110 }] : [],
  }

  return (
    <div className="nn-viz nn-layer-viz">
      <div className="nn-viz-intro">
        <strong>Interactive: Watch a network build itself</strong>
        <p>Click "Build network" to watch neurons arrange into layers step by step. The network grows from a single neuron into a full 2 &rarr; 3 &rarr; 1 architecture &mdash; 2 inputs, 3 hidden neurons, 1 output. This is the network you will train in the final stages.</p>
      </div>
      <svg viewBox="0 0 480 220" className="nn-layer-svg">
        {/* Input layer */}
        {nodes.inputs.map(n => (
          <g key={n.label}>
            <circle cx="80" cy={n.y} r="18" fill="var(--bg-secondary)" stroke="#5856D6" strokeWidth="2" className="nn-node-appear" />
            <text x="80" y={n.y + 4} textAnchor="middle" className="nn-svg-label" fill="var(--text-primary)">{n.label}</text>
          </g>
        ))}

        {/* Connections: input -> hidden */}
        {buildStep >= 3 && nodes.inputs.map(inp =>
          nodes.hidden.map(hid => (
            <line key={`${inp.label}-${hid.label}`} x1="98" y1={inp.y} x2="222" y2={hid.y} stroke="#5856D6" strokeWidth={buildStep >= 5 ? connWeights[`${inp.label}-${hid.label}`].width : 1.5} opacity={buildStep >= 5 ? connWeights[`${inp.label}-${hid.label}`].opacity : 0.4} className="nn-conn-appear" />
          ))
        )}

        {/* Hidden layer */}
        {nodes.hidden.map(n => (
          <g key={n.label}>
            <circle cx="240" cy={n.y} r="18" fill="var(--bg-secondary)" stroke="#5856D6" strokeWidth="2" className="nn-node-appear" />
            <text x="240" y={n.y + 4} textAnchor="middle" className="nn-svg-label" fill="var(--text-primary)">{n.label}</text>
          </g>
        ))}

        {/* Connections: hidden -> output */}
        {buildStep >= 4 && nodes.hidden.map(hid =>
          nodes.output.map(out => (
            <line key={`${hid.label}-${out.label}`} x1="258" y1={hid.y} x2="382" y2={out.y} stroke="#5856D6" strokeWidth={buildStep >= 5 ? connWeights[`${hid.label}-${out.label}`].width : 1.5} opacity={buildStep >= 5 ? connWeights[`${hid.label}-${out.label}`].opacity : 0.4} className="nn-conn-appear" />
          ))
        )}

        {/* Output layer */}
        {nodes.output.map(n => (
          <g key={n.label}>
            <circle cx="400" cy={n.y} r="18" fill="var(--bg-secondary)" stroke="#5856D6" strokeWidth="2" className="nn-node-appear" />
            <text x="400" y={n.y + 4} textAnchor="middle" className="nn-svg-label" fill="var(--text-primary)">{n.label}</text>
          </g>
        ))}

        {/* Layer labels */}
        {buildStep >= 3 && <text x="80" y="210" textAnchor="middle" className="nn-svg-layer-label" fill="var(--text-secondary)">Input</text>}
        {buildStep >= 2 && <text x="240" y="210" textAnchor="middle" className="nn-svg-layer-label" fill="var(--text-secondary)">Hidden</text>}
        {buildStep >= 4 && <text x="400" y="210" textAnchor="middle" className="nn-svg-layer-label" fill="var(--text-secondary)">Output</text>}
      </svg>

      <div className="nn-layer-controls">
        <button className="nn-step-btn" onClick={playBuild}>
          {buildStep >= 5 ? 'Replay build' : 'Build network'}
        </button>
        {buildStep >= 5 && (
          <div className="nn-layer-stats how-fade-in">
            <span>2 inputs</span> <span className="nn-dot">&middot;</span>
            <span>3 hidden</span> <span className="nn-dot">&middot;</span>
            <span>1 output</span> <span className="nn-dot">&middot;</span>
            <span>11 parameters</span>
          </div>
        )}
      </div>

      {buildStep >= 5 && (
        <button className="nn-toggle-btn" onClick={() => setShowWideVsDeep(!showWideVsDeep)}>
          {showWideVsDeep ? 'Hide' : 'Show'} depth vs width comparison
        </button>
      )}

      {showWideVsDeep && (
        <div className="nn-depth-comparison how-fade-in">
          <div className="nn-depth-card">
            <strong>Wide: 2 &rarr; 10 &rarr; 1</strong>
            <p>33 parameters. One hidden layer with 10 neurons.</p>
          </div>
          <div className="nn-depth-card">
            <strong>Deep: 2 &rarr; 3 &rarr; 3 &rarr; 1</strong>
            <p>22 parameters. Two hidden layers. Learns more complex functions with fewer parameters.</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Visualisation: Stage 5 — Forward Pass ── */

// Fixed network weights for forward pass demo
const FP_WEIGHTS = {
  w11: 0.5, w12: 0.3, b1: 0.1,
  w21: 0.7, w22: -0.4, b2: 0.2,
  w31: -0.2, w32: 0.9, b3: 0.0,
  wh1: 0.6, wh2: 0.8, wh3: 0.5, bout: -0.3,
}

function computeForward(x1, x2, W) {
  const h1 = relu(W.w11 * x1 + W.w12 * x2 + W.b1)
  const h2 = relu(W.w21 * x1 + W.w22 * x2 + W.b2)
  const h3 = relu(W.w31 * x1 + W.w32 * x2 + W.b3)
  const y = sigmoid(W.wh1 * h1 + W.wh2 * h2 + W.wh3 * h3 + W.bout)
  return { h1, h2, h3, y }
}

function ForwardPassViz({ active }) {
  const [x1, setX1] = useState(0.8)
  const [x2, setX2] = useState(0.6)
  const [animStep, setAnimStep] = useState(-1)
  const [speed, setSpeed] = useState('normal')
  const timersRef = useRef([])

  const result = computeForward(x1, x2, FP_WEIGHTS)

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  const delays = { slow: 1200, normal: 600, fast: 250 }

  function runForward() {
    clearTimers()
    setAnimStep(0)
    const d = delays[speed]
    for (let i = 1; i <= 7; i++) {
      timersRef.current.push(setTimeout(() => setAnimStep(i), d * i))
    }
  }

  function stepThrough() {
    setAnimStep(prev => Math.min(prev + 1, 7))
  }

  useEffect(() => () => clearTimers(), [])

  const getNodeFill = (val, minStep) => animStep >= minStep ? `rgba(88, 86, 214, ${Math.max(0.2, Math.min(1, val))})` : 'var(--bg-secondary)'
  const getTextColor = (val, minStep) => animStep >= minStep && val > 0.3 ? '#fff' : 'var(--text-secondary)'

  // Node positions
  const inp = [{ x: 60, y: 70, label: 'x1', val: x1 }, { x: 60, y: 170, label: 'x2', val: x2 }]
  const hid = [
    { x: 220, y: 40, label: 'h1', val: result.h1, step: 2 },
    { x: 220, y: 120, label: 'h2', val: result.h2, step: 3 },
    { x: 220, y: 200, label: 'h3', val: result.h3, step: 4 },
  ]
  const out = [{ x: 400, y: 120, label: 'y', val: result.y, step: 6 }]

  return (
    <div className="nn-viz nn-forward-viz">
      <div className="nn-viz-intro">
        <strong>Interactive: Run data through the network</strong>
        <p>This is the full 2 &rarr; 3 &rarr; 1 network with real weights on every connection. Click "Run Forward Pass" to watch input values flow left to right &mdash; each neuron computes its weighted sum, applies an activation, and passes the result forward. The final output is a prediction. Use "Step through" for a slower, one-step-at-a-time walkthrough.</p>
      </div>
      <svg viewBox="0 0 480 240" className="nn-forward-svg">
        {/* Input -> Hidden connections */}
        {inp.map(i => hid.map(h => (
          <line key={`${i.label}-${h.label}`} x1={i.x + 18} y1={i.y} x2={h.x - 18} y2={h.y}
            stroke={animStep >= 1 ? '#5856D6' : 'var(--border)'} strokeWidth="1.5" opacity={animStep >= 1 ? 0.6 : 0.3} />
        )))}
        {/* Hidden -> Output connections */}
        {hid.map(h => out.map(o => (
          <line key={`${h.label}-${o.label}`} x1={h.x + 18} y1={h.y} x2={o.x - 18} y2={o.y}
            stroke={animStep >= 5 ? '#5856D6' : 'var(--border)'} strokeWidth="1.5" opacity={animStep >= 5 ? 0.6 : 0.3} />
        )))}

        {/* Input nodes */}
        {inp.map(n => (
          <g key={n.label}>
            <circle cx={n.x} cy={n.y} r="18" fill={animStep >= 0 ? 'rgba(88, 86, 214, 0.7)' : 'var(--bg-secondary)'} stroke="#5856D6" strokeWidth="2" />
            <text x={n.x} y={n.y - 4} textAnchor="middle" className="nn-svg-small" fill={animStep >= 0 ? '#fff' : 'var(--text-secondary)'}>{n.label}</text>
            <text x={n.x} y={n.y + 10} textAnchor="middle" className="nn-svg-small" fill={animStep >= 0 ? '#fff' : 'var(--text-secondary)'}>{n.val.toFixed(1)}</text>
          </g>
        ))}

        {/* Hidden nodes */}
        {hid.map(n => (
          <g key={n.label}>
            <circle cx={n.x} cy={n.y} r="18" fill={getNodeFill(n.val, n.step)} stroke="#5856D6" strokeWidth="2" />
            <text x={n.x} y={n.y - 4} textAnchor="middle" className="nn-svg-small" fill={getTextColor(n.val, n.step)}>{n.label}</text>
            {animStep >= n.step && <text x={n.x} y={n.y + 10} textAnchor="middle" className="nn-svg-small" fill={getTextColor(n.val, n.step)}>{n.val.toFixed(2)}</text>}
          </g>
        ))}

        {/* Output node */}
        {out.map(n => (
          <g key={n.label}>
            <circle cx={n.x} cy={n.y} r="18" fill={getNodeFill(n.val, n.step)} stroke="#5856D6" strokeWidth="2" />
            <text x={n.x} y={n.y - 4} textAnchor="middle" className="nn-svg-small" fill={getTextColor(n.val, n.step)}>{n.label}</text>
            {animStep >= n.step && <text x={n.x} y={n.y + 10} textAnchor="middle" className="nn-svg-small" fill={getTextColor(n.val, n.step)}>{n.val.toFixed(3)}</text>}
          </g>
        ))}

        {/* Layer labels */}
        <text x="60" y="230" textAnchor="middle" className="nn-svg-layer-label" fill="var(--text-secondary)">Input</text>
        <text x="220" y="230" textAnchor="middle" className="nn-svg-layer-label" fill="var(--text-secondary)">Hidden</text>
        <text x="400" y="230" textAnchor="middle" className="nn-svg-layer-label" fill="var(--text-secondary)">Output</text>
      </svg>

      {/* Prediction label */}
      {animStep >= 7 && (
        <div className="nn-prediction how-fade-in">
          Prediction: Class {result.y > 0.5 ? '1' : '0'} ({(result.y * 100).toFixed(1)}%)
        </div>
      )}

      {/* Controls */}
      <div className="nn-forward-controls">
        <button className="nn-step-btn" onClick={runForward}>Run Forward Pass</button>
        <button className="nn-step-btn nn-step-secondary" onClick={stepThrough} disabled={animStep >= 7}>Step through</button>
        <div className="nn-speed-control">
          {['slow', 'normal', 'fast'].map(s => (
            <button key={s} className={`nn-speed-btn${speed === s ? ' nn-speed-active' : ''}`} onClick={() => setSpeed(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Computation panel */}
      {animStep >= 2 && (
        <div className="nn-calc-panel nn-forward-calc how-fade-in">
          {animStep >= 2 && <div className="nn-calc-line">h1 = ReLU({FP_WEIGHTS.w11}&times;{x1.toFixed(1)} + {FP_WEIGHTS.w12}&times;{x2.toFixed(1)} + {FP_WEIGHTS.b1}) = {result.h1.toFixed(2)}</div>}
          {animStep >= 3 && <div className="nn-calc-line">h2 = ReLU({FP_WEIGHTS.w21}&times;{x1.toFixed(1)} + {FP_WEIGHTS.w22}&times;{x2.toFixed(1)} + {FP_WEIGHTS.b2}) = {result.h2.toFixed(2)}</div>}
          {animStep >= 4 && <div className="nn-calc-line">h3 = ReLU({FP_WEIGHTS.w31}&times;{x1.toFixed(1)} + {FP_WEIGHTS.w32}&times;{x2.toFixed(1)} + {FP_WEIGHTS.b3}) = {result.h3.toFixed(2)}</div>}
          {animStep >= 6 && <div className="nn-calc-output">y = sigmoid(...) = <strong>{result.y.toFixed(3)}</strong></div>}
        </div>
      )}

      {/* Input sliders */}
      <div className="nn-input-sliders">
        <label className="nn-slider-label">
          x1: {x1.toFixed(1)}
          <input type="range" min="0" max="1" step="0.1" value={x1} onChange={e => setX1(+e.target.value)} className="nn-slider" />
        </label>
        <label className="nn-slider-label">
          x2: {x2.toFixed(1)}
          <input type="range" min="0" max="1" step="0.1" value={x2} onChange={e => setX2(+e.target.value)} className="nn-slider" />
        </label>
        <p className="nn-slider-hint">Try x1=0.1, x2=0.1 vs x1=0.9, x2=0.9 &mdash; see how the network responds differently</p>
      </div>
    </div>
  )
}

/* ── Visualisation: Stage 6 — Loss Function ── */

const LOSS_EXAMPLES = [
  { pred: 0.88, actual: 1, label: 'Email 1' },
  { pred: 0.12, actual: 0, label: 'Email 2' },
  { pred: 0.65, actual: 0, label: 'Email 3' },
  { pred: 0.45, actual: 1, label: 'Email 4' },
  { pred: 0.92, actual: 1, label: 'Email 5' },
]

function bce(yTrue, yPred) {
  const p = Math.max(0.001, Math.min(0.999, yPred))
  return -(yTrue * Math.log(p) + (1 - yTrue) * Math.log(1 - p))
}

function LossViz({ active }) {
  const [yTrue, setYTrue] = useState(1)
  const [yPred, setYPred] = useState(0.5)
  const [lossWeight, setLossWeight] = useState(0)

  const lossVal = bce(yTrue, yPred)
  // Loss landscape: simple parabolic approximation for 1 weight
  const landscapeLoss = (w) => (w - 0.7) * (w - 0.7) + 0.1

  return (
    <div className="nn-viz nn-loss-viz">
      <div className="nn-viz-intro">
        <strong>Interactive: See how loss measures mistakes</strong>
        <p>The network made predictions. Now we compare them to the correct answers. Green rows are correct, red rows are wrong. Below, drag the slider to see how the loss value changes as a prediction moves closer to or further from the truth. The loss landscape at the bottom shows how loss varies across different weight values &mdash; training tries to reach the valley.</p>
      </div>
      {/* Panel 1: Predictions vs Reality */}
      <div className="nn-loss-table">
        <div className="nn-loss-table-header">
          <span>Example</span><span>Predicted</span><span>Actual</span><span>Loss</span>
        </div>
        {LOSS_EXAMPLES.map((ex, i) => {
          const correct = (ex.pred >= 0.5) === (ex.actual === 1)
          const loss = bce(ex.actual, ex.pred)
          return (
            <div key={i} className={`nn-loss-row ${correct ? 'nn-loss-correct' : 'nn-loss-wrong'}`}>
              <span>{ex.label}</span>
              <span>{ex.pred.toFixed(2)}</span>
              <span>{ex.actual}</span>
              <span>{loss.toFixed(2)}</span>
            </div>
          )
        })}
        <div className="nn-loss-row nn-loss-total">
          <span>Average</span><span /><span /><span>{(LOSS_EXAMPLES.reduce((s, e) => s + bce(e.actual, e.pred), 0) / LOSS_EXAMPLES.length).toFixed(2)}</span>
        </div>
      </div>

      {/* Panel 2: Interactive loss calculator */}
      <div className="nn-loss-calculator">
        <div className="nn-loss-toggle">
          <span>y_true:</span>
          <button className={`nn-toggle-option${yTrue === 0 ? ' nn-toggle-active' : ''}`} onClick={() => setYTrue(0)}>0</button>
          <button className={`nn-toggle-option${yTrue === 1 ? ' nn-toggle-active' : ''}`} onClick={() => setYTrue(1)}>1</button>
        </div>
        <p className="nn-control-hint">The correct answer — what the output should be. {yTrue === 1 ? '1 = "yes, this is spam" (positive class).' : '0 = "no, not spam" (negative class).'}</p>
        <label className="nn-slider-label">
          y_pred: {yPred.toFixed(2)}
          <input type="range" min="0.01" max="0.99" step="0.01" value={yPred} onChange={e => setYPred(+e.target.value)} className="nn-slider" />
        </label>
        <p className="nn-control-hint">The network's prediction — its confidence that the answer is 1. {yPred > 0.5 ? `At ${(yPred * 100).toFixed(0)}%, it thinks "yes."` : yPred < 0.5 ? `At ${(yPred * 100).toFixed(0)}%, it thinks "no."` : 'At 50%, it has no idea.'}</p>
        <div className="nn-loss-result">
          Binary cross-entropy loss = <strong className={lossVal > 1 ? 'nn-loss-high' : lossVal < 0.3 ? 'nn-loss-low' : ''}>{lossVal.toFixed(3)}</strong>
        </div>
        <div className="nn-loss-interpretation">
          {(() => {
            const correct = (yTrue === 1 && yPred >= 0.5) || (yTrue === 0 && yPred < 0.5)
            const confidence = yTrue === 1 ? yPred : 1 - yPred
            if (yPred > 0.48 && yPred < 0.52) {
              return 'The prediction is 50/50 — maximum uncertainty. Loss = 0.693 (log 2). The network has no idea and is effectively guessing.'
            }
            if (correct && confidence > 0.9) {
              return `Correct and confident (${(yPred * 100).toFixed(0)}% vs truth ${yTrue}). Loss is tiny — the network nailed this one.`
            }
            if (correct && confidence > 0.7) {
              return `Correct but not fully confident (${(yPred * 100).toFixed(0)}% vs truth ${yTrue}). Loss is low but the network could be more sure.`
            }
            if (correct) {
              return `Barely correct (${(yPred * 100).toFixed(0)}% vs truth ${yTrue}). The prediction is on the right side of 0.5 but just barely. Loss is moderate.`
            }
            if (!correct && confidence < 0.3) {
              return `Wrong but not confident (${(yPred * 100).toFixed(0)}% vs truth ${yTrue}). The prediction is on the wrong side of 0.5, but close. Loss is moderate.`
            }
            return `Confidently wrong (${(yPred * 100).toFixed(0)}% vs truth ${yTrue}). This is the worst case — the network is sure about the wrong answer. Loss is very high because cross-entropy heavily penalises confident mistakes.`
          })()}
        </div>
      </div>

      {/* Panel 3: Loss landscape */}
      <div className="nn-loss-landscape">
        <svg viewBox="0 0 300 160" className="nn-loss-landscape-svg">
          {/* Grid */}
          <line x1="40" y1="130" x2="280" y2="130" stroke="var(--border)" strokeWidth="1" />
          <line x1="40" y1="20" x2="40" y2="130" stroke="var(--border)" strokeWidth="1" />
          <text x="160" y="152" textAnchor="middle" className="nn-svg-axis" fill="var(--text-tertiary)">weight value</text>
          <text x="15" y="75" textAnchor="middle" className="nn-svg-axis" fill="var(--text-tertiary)" transform="rotate(-90, 15, 75)">loss</text>

          {/* Loss curve */}
          <path d={(() => {
            let d = ''
            for (let i = 0; i <= 100; i++) {
              const w = -2 + (i / 100) * 4
              const l = landscapeLoss(w)
              const x = 40 + (i / 100) * 240
              const y = 130 - Math.min(l, 3) * 36
              d += i === 0 ? `M${x},${y}` : `L${x},${y}`
            }
            return d
          })()} fill="none" stroke="#5856D6" strokeWidth="2" />

          {/* Current weight dot */}
          {(() => {
            const x = 40 + ((lossWeight + 2) / 4) * 240
            const l = landscapeLoss(lossWeight)
            const y = 130 - Math.min(l, 3) * 36
            return <circle cx={x} cy={y} r="5" fill="#5856D6" stroke="#fff" strokeWidth="1.5" />
          })()}
        </svg>
        <label className="nn-slider-label">
          Weight: {lossWeight.toFixed(1)}
          <input type="range" min="-2" max="2" step="0.1" value={lossWeight} onChange={e => setLossWeight(+e.target.value)} className="nn-slider" />
        </label>
        <p className="nn-control-hint">The minimum is where we want to be. The gradient tells us which direction to go.</p>
      </div>
    </div>
  )
}

/* ── Visualisation: Stage 7 — Backpropagation ── */

function BackpropViz({ active }) {
  const [phase, setPhase] = useState(-1)
  const [lr, setLr] = useState(0.1)
  const [weights, setWeights] = useState({ wh1: 0.6, wh2: 0.8, wh3: 0.5 })
  const [newLoss, setNewLoss] = useState(null)
  const timersRef = useRef([])

  const gradients = { wh1: -0.124, wh2: 0.089, wh3: -0.156 }
  const hiddenGrads = { h1: -0.037, h2: 0.026, h3: -0.047 }
  const initialLoss = 0.41

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function runBackprop() {
    clearTimers()
    setPhase(0)
    setNewLoss(null)
    setWeights({ wh1: 0.6, wh2: 0.8, wh3: 0.5 })

    timersRef.current.push(setTimeout(() => setPhase(1), 500))
    timersRef.current.push(setTimeout(() => setPhase(2), 1300))
    timersRef.current.push(setTimeout(() => setPhase(3), 2100))
    timersRef.current.push(setTimeout(() => {
      setPhase(4)
      setWeights(prev => ({
        wh1: prev.wh1 - lr * gradients.wh1,
        wh2: prev.wh2 - lr * gradients.wh2,
        wh3: prev.wh3 - lr * gradients.wh3,
      }))
    }, 2700))
    timersRef.current.push(setTimeout(() => {
      setPhase(5)
      const improvement = initialLoss * (0.05 + Math.random() * 0.1)
      setNewLoss(initialLoss - improvement)
    }, 3300))
  }

  useEffect(() => () => clearTimers(), [])

  const phaseLabels = [
    'Computing loss...',
    'Computing output gradients...',
    'Propagating to hidden layer...',
    'Computing hidden gradients...',
    'Updating weights...',
    'Forward pass with new weights...',
  ]

  return (
    <div className="nn-viz nn-backprop-viz">
      <div className="nn-viz-intro">
        <strong>Interactive: Watch the network learn from its mistake</strong>
        <p>Click "Run Backprop" to see error signals (red arrows) flow backwards from the output to the hidden layer. Each arrow carries a gradient &mdash; a number that says how much to adjust each weight. After the gradients arrive, all weights update simultaneously. The loss drops. Try changing the learning rate to see how it affects the size of each update.</p>
      </div>
      {/* Network diagram with gradient arrows */}
      <svg viewBox="0 0 480 220" className="nn-backprop-svg">
        {/* Simplified 3-1 network (hidden -> output) */}
        {/* Hidden nodes */}
        {[{ y: 40, label: 'h1', grad: hiddenGrads.h1 }, { y: 110, label: 'h2', grad: hiddenGrads.h2 }, { y: 180, label: 'h3', grad: hiddenGrads.h3 }].map(n => (
          <g key={n.label}>
            <circle cx="120" cy={n.y} r="18"
              fill={phase >= 3 ? 'rgba(255, 59, 48, 0.2)' : 'var(--bg-secondary)'}
              stroke={phase >= 3 ? '#FF3B30' : 'var(--border)'} strokeWidth="2" />
            <text x="120" y={n.y + 4} textAnchor="middle" className="nn-svg-label" fill="var(--text-primary)">{n.label}</text>
            {phase >= 3 && (
              <text x="120" y={n.y + 32} textAnchor="middle" className="nn-svg-grad" fill="#FF3B30">{n.grad.toFixed(3)}</text>
            )}
          </g>
        ))}

        {/* Connections */}
        {[{ y: 40, w: weights.wh1, g: gradients.wh1 }, { y: 110, w: weights.wh2, g: gradients.wh2 }, { y: 180, w: weights.wh3, g: gradients.wh3 }].map((c, i) => (
          <g key={i}>
            <line x1="138" y1={c.y} x2="282" y2="110"
              stroke={c.w >= 0 ? '#5856D6' : '#FF3B30'}
              strokeWidth={Math.max(1, Math.abs(c.w) * 4)}
              opacity={Math.max(0.2, Math.abs(c.w) * 0.8)} />
            {/* Gradient arrow (backward) */}
            {phase >= 2 && (
              <line x1="270" y1="110" x2="150" y2={c.y}
                stroke="#FF3B30" strokeWidth={Math.max(1, Math.abs(c.g) * 15)} opacity="0.6"
                markerEnd="url(#arrowhead)" className="nn-grad-arrow" />
            )}
            {/* Weight update badge */}
            {phase >= 4 && (
              <text x="210" y={c.y + (110 - c.y) / 2 - 8} textAnchor="middle" className="nn-svg-update" fill="#5856D6">
                {(-lr * c.g) > 0 ? '+' : ''}{(-lr * c.g).toFixed(3)}
              </text>
            )}
          </g>
        ))}

        {/* Output node */}
        <circle cx="300" cy="110" r="18"
          fill={phase >= 1 ? 'rgba(255, 59, 48, 0.3)' : 'var(--bg-secondary)'}
          stroke={phase >= 1 ? '#FF3B30' : 'var(--border)'} strokeWidth="2" />
        <text x="300" y="114" textAnchor="middle" className="nn-svg-label" fill="var(--text-primary)">y</text>

        {/* Loss label */}
        {phase >= 0 && (
          <text x="370" y="114" textAnchor="start" className="nn-svg-loss" fill="#FF3B30">
            Loss = {newLoss !== null ? newLoss.toFixed(2) : initialLoss.toFixed(2)}
          </text>
        )}

        {/* Arrow marker definition */}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#FF3B30" />
          </marker>
        </defs>
      </svg>

      {/* Phase status */}
      {phase >= 0 && (
        <div className="nn-backprop-status how-fade-in">
          {phaseLabels[Math.min(phase, phaseLabels.length - 1)]}
        </div>
      )}

      {/* Loss improvement */}
      {phase >= 5 && newLoss !== null && (
        <div className="nn-backprop-improvement how-fade-in">
          <CheckIcon size={16} color="#34C759" />
          <span>Loss: {initialLoss.toFixed(2)} &rarr; {newLoss.toFixed(2)} ({((1 - newLoss / initialLoss) * 100).toFixed(1)}% improvement)</span>
        </div>
      )}

      {/* Controls */}
      <div className="nn-backprop-controls">
        <button className="nn-step-btn" onClick={runBackprop}>Run Backprop</button>
        <label className="nn-slider-label nn-lr-slider">
          Learning rate: {lr.toFixed(3)}
          <input type="range" min="0.001" max="1" step="0.001" value={lr} onChange={e => setLr(+e.target.value)} className="nn-slider" />
        </label>
        {lr > 0.5 && <p className="nn-lr-warning"><WarningIcon size={14} color="#FF9500" /> Too large &mdash; weight updates may be unstable</p>}
        {lr < 0.005 && <p className="nn-lr-warning"><WarningIcon size={14} color="#FF9500" /> Too small &mdash; learning will be very slow</p>}
      </div>

      {/* Gradient legend */}
      <div className="nn-grad-legend">
        <div className="nn-legend-item"><span className="nn-legend-arrow nn-legend-red" /><span>Gradient flow (backward)</span></div>
        <div className="nn-legend-item"><span className="nn-legend-dot nn-legend-indigo" /><span>Signal flow (forward)</span></div>
      </div>
    </div>
  )
}

/* ── Visualisation: Stage 8 — Training Loop ── */

function generateData(n) {
  const data = []
  for (let i = 0; i < n; i++) {
    const x1 = Math.random()
    const x2 = Math.random()
    const label = (x1 + x2 > 1) ? 1 : 0
    data.push({ x1, x2, label })
  }
  return data
}

/* He initialisation: weights ~ N(0, sqrt(2/fan_in)), biases small random */
function initWeights() {
  const he = () => (Math.random() - 0.5) * 2.0   // ±1.0 (He scale for fan_in=2)
  const bInit = () => (Math.random() - 0.5) * 0.2 // small random bias to break symmetry
  return {
    w11: he(), w12: he(), b1: bInit(),
    w21: he(), w22: he(), b2: bInit(),
    w31: he(), w32: he(), b3: bInit(),
    wh1: (Math.random() - 0.5) * 1.4, wh2: (Math.random() - 0.5) * 1.4, wh3: (Math.random() - 0.5) * 1.4, bout: bInit(),
  }
}

function TrainingViz({ active }) {
  const [data] = useState(() => generateData(20))
  const [step, setStep] = useState(0)
  const [losses, setLosses] = useState([])
  const [weights, setWeights] = useState(() => initWeights())
  const [lr, setLr] = useState(0.1)
  const [running, setRunning] = useState(false)
  const [milestone, setMilestone] = useState(null)
  const runRef = useRef(false)
  const stepRef = useRef(0)
  const rafRef = useRef(null)

  function getMilestone(currentStep, currentLoss, currentAcc) {
    if (currentStep === 200) {
      if (currentAcc >= 85) return 'Training complete — the network learned the boundary well.'
      if (lr >= 0.1) return 'Training complete — accuracy is ' + Math.round(currentAcc) + '%. This random weight init struggled. Hit Reset to try new random weights.'
      if (currentAcc >= 65) return 'Training complete — some learning happened but the boundary is rough. Reset and try learning rate 0.1.'
      return 'Training complete — the network barely learned. Learning rate ' + lr + ' is too small for 200 steps. Reset and try 0.1.'
    }
    if (currentStep === 10) {
      if (currentLoss < 0.65) return 'Weights moving. The network is starting to learn.'
      if (lr >= 0.1) return 'Weights updated but loss barely changed — this can happen with unlucky random init.'
      return 'Weights updated but loss barely changed — the learning rate may be too small.'
    }
    if (currentStep === 50) {
      if (currentAcc >= 70) return 'Over 70% accuracy. The boundary is forming.'
      if (currentLoss < 0.6) return 'Loss is dropping. Training is making progress.'
      if (lr >= 0.1) return 'After 50 steps, loss is still high. Random init can cause this — try Reset for new weights.'
      return 'After 50 steps, loss is still high. Reset and try a larger learning rate.'
    }
    if (currentStep === 100) {
      if (currentAcc >= 80) return 'Over 80% accuracy. The decision boundary fits the data.'
      return null
    }
    return null
  }

  function trainOneStep(currentWeights) {
    const learningRate = lr
    // Numerical gradient approximation for simplicity
    const eps = 0.001
    const keys = Object.keys(currentWeights)
    const avgLoss = () => {
      let total = 0
      data.forEach(d => {
        const r = computeForward(d.x1, d.x2, currentWeights)
        total += bce(d.label, r.y)
      })
      return total / data.length
    }
    const baseLoss = avgLoss()
    const newW = { ...currentWeights }
    keys.forEach(k => {
      const saved = currentWeights[k]
      currentWeights[k] = saved + eps
      const lossPlus = avgLoss()
      currentWeights[k] = saved
      const grad = (lossPlus - baseLoss) / eps
      newW[k] = saved - learningRate * grad
    })
    return { weights: newW, loss: baseLoss }
  }

  function trainSteps(count) {
    runRef.current = true
    setRunning(true)
    let currentW = { ...weights }
    let currentStep = stepRef.current

    function doStep(remaining) {
      if (remaining <= 0 || !runRef.current || currentStep >= 200) {
        setRunning(false)
        runRef.current = false
        return
      }
      const result = trainOneStep(currentW)
      currentW = result.weights
      currentStep++
      stepRef.current = currentStep
      setWeights({ ...currentW })
      setStep(currentStep)
      setLosses(prev => [...prev, result.loss])

      if (currentStep === 10 || currentStep === 50 || currentStep === 100 || currentStep === 200) {
        let correct = 0
        data.forEach(d => {
          const r = computeForward(d.x1, d.x2, currentW)
          if ((r.y > 0.5) === (d.label === 1)) correct++
        })
        const acc = correct / data.length * 100
        const msg = getMilestone(currentStep, result.loss, acc)
        if (msg) setMilestone(msg)
      }

      rafRef.current = requestAnimationFrame(() => doStep(remaining - 1))
    }
    doStep(count)
  }

  function resetTraining() {
    runRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setRunning(false)
    stepRef.current = 0
    setStep(0)
    setLosses([])
    setMilestone(null)
    setWeights(initWeights())
  }

  // Cancel animation on unmount
  useEffect(() => () => {
    runRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  // Compute current accuracy
  const accuracy = useMemo(() => {
    let correct = 0
    data.forEach(d => {
      const r = computeForward(d.x1, d.x2, weights)
      if ((r.y > 0.5) === (d.label === 1)) correct++
    })
    return (correct / data.length * 100).toFixed(0)
  }, [weights, data])

  const currentLoss = losses.length > 0 ? losses[losses.length - 1] : null

  return (
    <div className="nn-viz nn-training-viz">
      <div className="nn-viz-intro">
        <strong>Interactive: Train the network on real data</strong>
        <p>The scatter plot shows 20 data points &mdash; red dots are spam, blue dots are legitimate. The dashed line is the network's current decision boundary. Click "Train 1 Step" to watch one round of forward pass + backprop, or "Train Until Converged" to watch the full training loop. The loss curve on the right tracks how the error drops over time.</p>
      </div>
      <div className="nn-training-panels">
        {/* Scatter plot */}
        <div className="nn-scatter-panel">
          <svg viewBox="0 0 200 200" className="nn-scatter-svg">
            <rect x="0" y="0" width="200" height="200" fill="var(--bg-secondary)" rx="8" />
            {/* Classification regions + decision boundary */}
            {step > 0 && (() => {
              // Light region shading (10x10 grid)
              const regions = []
              const sz = 20
              for (let ix = 0; ix < 10; ix++) {
                for (let iy = 0; iy < 10; iy++) {
                  const x1 = (ix + 0.5) / 10
                  const x2 = 1 - (iy + 0.5) / 10
                  const pred = computeForward(x1, x2, weights).y
                  regions.push(
                    <rect key={`${ix}-${iy}`} x={ix * sz} y={iy * sz} width={sz} height={sz}
                      fill={pred > 0.5 ? 'rgba(255,59,48,0.10)' : 'rgba(88,86,214,0.10)'} />
                  )
                }
              }
              // Boundary line via binary search per column
              const boundaryPts = []
              for (let px = 0; px <= 200; px += 3) {
                const x1v = px / 200
                const yTop = computeForward(x1v, 1, weights).y
                const yBot = computeForward(x1v, 0, weights).y
                if ((yTop - 0.5) * (yBot - 0.5) >= 0) continue
                let lo = 0, hi = 1
                for (let it = 0; it < 20; it++) {
                  const mid = (lo + hi) / 2
                  const yMid = computeForward(x1v, mid, weights).y
                  if ((yMid - 0.5) * (yTop - 0.5) > 0) hi = mid
                  else lo = mid
                }
                const x2v = (lo + hi) / 2
                boundaryPts.push(`${px},${(1 - x2v) * 200}`)
              }
              return (
                <>
                  {regions}
                  {boundaryPts.length >= 2 && (
                    <polyline points={boundaryPts.join(' ')} fill="none" stroke="#5856D6" strokeWidth="2" strokeDasharray="6 3" opacity="0.8" />
                  )}
                </>
              )
            })()}

            {/* Data points */}
            {data.map((d, i) => {
              const cx = d.x1 * 180 + 10
              const cy = (1 - d.x2) * 180 + 10
              const predicted = step > 0 ? computeForward(d.x1, d.x2, weights).y > 0.5 : null
              const isWrong = predicted !== null && (predicted !== (d.label === 1))
              return (
                <circle key={i} cx={cx} cy={cy} r="6"
                  fill={d.label === 1 ? '#FF3B30' : '#5856D6'}
                  stroke={isWrong ? '#FF9500' : 'none'} strokeWidth={isWrong ? 2 : 0}
                  opacity="0.9" />
              )
            })}
          </svg>
          <div className="nn-scatter-legend">
            <span><span className="nn-legend-dot" style={{ background: '#FF3B30' }} /> Spam</span>
            <span><span className="nn-legend-dot" style={{ background: '#5856D6' }} /> Legit</span>
          </div>
        </div>

        {/* Loss curve */}
        <div className="nn-loss-curve-panel">
          {(() => {
            const maxLoss = losses.length > 0 ? Math.max(...losses) * 1.2 : 1.0
            const yScale = maxLoss > 0 ? 120 / maxLoss : 120
            const ticks = [0, +(maxLoss * 0.5).toFixed(2), +maxLoss.toFixed(2)]
            return (
              <svg viewBox="0 0 300 160" className="nn-loss-curve-svg">
                <rect x="0" y="0" width="300" height="160" fill="var(--bg-secondary)" rx="8" />
                {/* Axes */}
                <line x1="40" y1="140" x2="290" y2="140" stroke="var(--border)" strokeWidth="1" />
                <line x1="40" y1="20" x2="40" y2="140" stroke="var(--border)" strokeWidth="1" />
                <text x="165" y="156" textAnchor="middle" className="nn-svg-axis" fill="var(--text-tertiary)">Steps</text>
                <text x="14" y="85" textAnchor="middle" className="nn-svg-axis" fill="var(--text-tertiary)" transform="rotate(-90 14 85)">Loss</text>

                {/* Y-axis ticks */}
                {ticks.map((t, i) => {
                  const ty = 140 - t * yScale
                  return (
                    <g key={i}>
                      <line x1="36" y1={ty} x2="40" y2={ty} stroke="var(--border)" strokeWidth="1" />
                      <text x="34" y={ty + 3} textAnchor="end" className="nn-svg-tick" fill="var(--text-tertiary)">{t}</text>
                      {i > 0 && <line x1="40" y1={ty} x2="290" y2={ty} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />}
                    </g>
                  )
                })}

                {/* Loss line */}
                {losses.length > 1 && (
                  <polyline
                    points={losses.map((l, i) => {
                      const x = 40 + (i / 200) * 250
                      const y = 140 - Math.min(l, maxLoss) * yScale
                      return `${x},${y}`
                    }).join(' ')}
                    fill="none" stroke={currentLoss < 0.3 ? '#34C759' : currentLoss < 0.5 ? '#FF9500' : '#FF3B30'} strokeWidth="2" />
                )}

              </svg>
            )
          })()}
        </div>
      </div>

      {/* Stats bar */}
      <div className="nn-training-stats">
        <span>Step: {step} / 200</span>
        <span>Loss: {currentLoss !== null ? currentLoss.toFixed(3) : '—'}</span>
        <span>Accuracy: {step > 0 ? accuracy + '%' : '—'}</span>
      </div>

      {/* Milestone message */}
      {milestone && (
        <div className="nn-milestone how-fade-in">{milestone}</div>
      )}

      {/* Controls */}
      <div className="nn-training-controls">
        <button className="nn-step-btn" onClick={() => trainSteps(1)} disabled={running || step >= 200}>Train 1 Step</button>
        <button className="nn-step-btn" onClick={() => trainSteps(10)} disabled={running || step >= 200}>Train 10 Steps</button>
        <button className="nn-step-btn" onClick={() => trainSteps(200 - step)} disabled={running || step >= 200}>Train Until Converged</button>
        <button className="nn-step-btn nn-step-secondary" onClick={resetTraining}>Reset</button>
      </div>

      <div className="nn-training-options">
        <label className="nn-slider-label nn-lr-slider">
          Learning rate:
          <select value={lr} onChange={e => setLr(+e.target.value)} className="nn-lr-select">
            <option value={0.001}>0.001</option>
            <option value={0.01}>0.01</option>
            <option value={0.1}>0.1</option>
          </select>
        </label>
        <span className="nn-lr-hint">
          {lr === 0.001 && 'Very slow — may need thousands of steps to converge'}
          {lr === 0.01 && 'Moderate — steady learning, good default'}
          {lr === 0.1 && 'Fast — learns quickly but may overshoot'}
        </span>
      </div>

      {step >= 200 && (
        <div className="nn-training-complete how-fade-in">
          <div className="nn-concept-pills">
            {['Forward Pass', 'Loss', 'Gradient', 'Backprop', 'Training Loop'].map(c => (
              <span key={c} className="nn-concept-pill">{c}</span>
            ))}
          </div>
          <p>You now understand how every AI model learns.</p>
        </div>
      )}
    </div>
  )
}

/* ── Main Component ── */

function NeuralNetworks({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('neural-networks', -1)
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

  /* ── Handlers ── */

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
      setLearnTip(null)
      setLearnTipFading(false)
      setTimeout(() => {
        setShowFinal(true)
        setStage(STAGES.length)
        markModuleComplete('neural-networks')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.nn-root')
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

  function handleStartOver() {
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

  /* ── Effects ── */

  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  useEffect(() => {
    const cancel = scrollStageToTop('.nn-root', activeStepRef)
    return cancel
  }, [stage])

  // Progressive learn tips
  useEffect(() => {
    if (stage === 1 && !dismissedTips.has('stage1')) {
      setLearnTip({ key: 'stage1', text: 'Try setting w1 to a negative value and watch the connection line turn red — the weight is now pushing the output down.' })
    } else if (stage === 4 && !dismissedTips.has('stage4')) {
      setLearnTip({ key: 'stage4', text: 'Click Step Through to walk the forward pass one computation at a time — this is exactly what PyTorch does internally.' })
    } else if (stage === 7 && !dismissedTips.has('stage7')) {
      setLearnTip({ key: 'stage7', text: 'Try training with learning rate 0.1 vs 0.001 — watch how differently the loss curve behaves. This is the most important hyperparameter to understand.' })
    } else {
      setLearnTip(null)
      setLearnTipFading(false)
    }
  }, [stage, dismissedTips])

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  /* ── Visualisation components per stage ── */

  const vizComponents = [
    <NeuronViz key="neuron" active={stage === 0} />,
    <WeightEditorViz key="weights" active={stage === 1} />,
    <ActivationViz key="activation" active={stage === 2} />,
    <LayerViz key="layers" active={stage === 3} />,
    <ForwardPassViz key="forward" active={stage === 4} />,
    <LossViz key="loss" active={stage === 5} />,
    <BackpropViz key="backprop" active={stage === 6} />,
    <TrainingViz key="training" active={stage === 7} />,
  ]

  /* ── Render: Entry Screen ── */

  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="neural-networks" size={48} style={{ color: '#5856D6' }} />}
        title="Neural Networks"
        subtitle="Watch One Learn in Real Time"
        description="Every AI model you have ever used was built from neurons, weights, and one simple idea: get the error, go backwards, adjust. This tutorial shows you exactly how that works &mdash; with animations that make the math click instantly."
        buttonText="Start Learning"
        onStart={() => { setStage(0); markModuleStarted('neural-networks') }}
      />
    )
  }

  /* ── Render: Quiz ── */

  if (showQuiz) {
    return (
      <div className="how-llms nn-root quiz-fade-in">
        <Quiz
          questions={neuralNetworksQuiz}
          tabName="Neural Networks"
          onBack={() => setShowQuiz(false)}
          onStartOver={() => handleStartOver()}
          onSwitchTab={onSwitchTab}
          currentModuleId="neural-networks"
        />
      </div>
    )
  }

  /* ── Render: Main ── */

  return (
    <div className={`how-llms nn-root${fading ? ' how-fading' : ''}`}>
      {/* Welcome banner */}
      {showWelcome && stage === 0 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Neural Networks</strong> &mdash; This module builds a complete neural network understanding from scratch. You will start with a single neuron and end by watching a real network train on live data &mdash; weights animating, loss falling, the network getting smarter with every example you feed it.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>8 stages</strong> from a single neuron to a trained network</li>
              <li>Use the <strong>interactive demos</strong> &mdash; adjust weights, run forward passes, watch backpropagation</li>
              <li>At the end, review your <strong>toolkit</strong> and test your knowledge with a quiz</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Learn tip */}
      {learnTip && !showFinal && (
        <div className={`learn-tip${learnTipFading ? ' learn-tip-fading' : ''}`} role="status" aria-live="polite">
          <TipIcon size={16} color="#eab308" />
          <span className="learn-tip-text">{learnTip.text}</span>
          <button className="learn-tip-dismiss" onClick={() => { setDismissedTips(prev => new Set(prev).add(learnTip.key)); dismissLearnTip() }} aria-label="Dismiss tip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* Stepper + Content */}
      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper nn-stepper">
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

          <div className="how-content">
            {stage >= 0 && stage < STAGES.length && (
              <div className="how-stage how-fade-in" key={stage}>
                {/* Info card */}
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>{EXPLANATIONS[stage].title}</strong>
                  </div>
                  {EXPLANATIONS[stage].content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  {EXPLANATIONS[stage].tip && (
                    <div className="how-info-tip">
                      <TipIcon size={16} color="#eab308" />
                      {EXPLANATIONS[stage].tip}
                    </div>
                  )}
                  {EXPLANATIONS[stage].warning && (
                    <div className="nn-warning-box">
                      <WarningIcon size={16} color="#FF9500" />
                      {EXPLANATIONS[stage].warning}
                    </div>
                  )}
                  <ToolChips tools={NN_TOOLS[stage]} />
                </div>

                {/* Visualisation */}
                {vizComponents[stage]}

                {/* Navigation */}
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
        </>
      )}

      {/* Final screen */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You now understand neural networks!</div>

          <div className="pe-final-grid">
            {TOOLKIT_ITEMS.map((item) => (
              <div key={item.name} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.name}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Neural Network Toolkit</div>
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
            <button className="how-secondary-btn" onClick={handleStartOver}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="neural-networks" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default NeuralNetworks
