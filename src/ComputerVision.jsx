import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { TipIcon, WarningIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { computerVisionQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './ComputerVision.css'

/* ── Tool chips per stage ── */
const CV_TOOLS = {
  0: [
    { name: 'OpenCV', color: '#5856D6', desc: 'Open-source computer vision and image processing library' },
    { name: 'PIL/Pillow', color: '#5856D6', desc: 'Python Imaging Library for basic image operations' },
    { name: 'NumPy', color: '#5856D6', desc: 'Fundamental package for numerical computing' },
    { name: 'torchvision', color: '#5856D6', desc: 'Datasets, transforms, and models for vision' },
    { name: 'Matplotlib', color: '#5856D6', desc: 'Plotting library for visualising images and data' },
    { name: 'scikit-image', color: '#5856D6', desc: 'Image processing algorithms built on NumPy' },
  ],
  1: [
    { name: 'RGB', color: '#5856D6', desc: 'Red-Green-Blue colour model used by displays' },
    { name: 'PyTorch tensor', color: '#5856D6', desc: 'Multi-dimensional array for neural network input' },
    { name: 'NumPy array', color: '#5856D6', desc: 'N-dimensional array for numerical operations' },
    { name: 'torchvision.transforms', color: '#5856D6', desc: 'Image transformation pipeline for preprocessing' },
    { name: 'Normalize', color: '#5856D6', desc: 'Scale pixel values for stable training' },
  ],
  2: [
    { name: 'torch.nn.Conv2d', color: '#5856D6', desc: '2D convolution layer in PyTorch' },
    { name: 'F.conv2d', color: '#5856D6', desc: 'Functional convolution operation' },
    { name: 'tf.keras.layers.Conv2D', color: '#5856D6', desc: '2D convolution layer in TensorFlow' },
    { name: 'OpenCV filter2D', color: '#5856D6', desc: 'Apply custom convolution filters to images' },
    { name: 'scipy.signal.convolve2d', color: '#5856D6', desc: '2D convolution in SciPy' },
  ],
  3: [
    { name: 'torch.nn.MaxPool2d', color: '#5856D6', desc: 'Max pooling layer to downsample feature maps' },
    { name: 'AvgPool2d', color: '#5856D6', desc: 'Average pooling layer for smoother downsampling' },
    { name: 'AdaptiveAvgPool2d', color: '#5856D6', desc: 'Global average pooling to a target output size' },
    { name: 'stride', color: '#5856D6', desc: 'Step size for filter movement across the image' },
  ],
  4: [
    { name: 'torch.nn.Conv2d', color: '#5856D6', desc: '2D convolution layer' },
    { name: 'MaxPool2d', color: '#5856D6', desc: 'Max pooling layer' },
    { name: 'Linear', color: '#5856D6', desc: 'Fully connected layer' },
    { name: 'Softmax', color: '#5856D6', desc: 'Converts logits to probabilities' },
    { name: 'ReLU', color: '#5856D6', desc: 'Rectified Linear Unit activation function' },
    { name: 'torchsummary', color: '#5856D6', desc: 'Print model architecture summary' },
  ],
  5: [
    { name: 'torchvision.transforms', color: '#5856D6', desc: 'Image transformation pipeline' },
    { name: 'RandomHorizontalFlip', color: '#5856D6', desc: 'Randomly flip images horizontally' },
    { name: 'RandomRotation', color: '#5856D6', desc: 'Randomly rotate images by a given angle' },
    { name: 'ColorJitter', color: '#5856D6', desc: 'Randomly change brightness, contrast, saturation' },
    { name: 'DataLoader', color: '#5856D6', desc: 'Batch and shuffle training data efficiently' },
    { name: 'pretrained=True', color: '#5856D6', desc: 'Load ImageNet pretrained weights' },
  ],
  6: [
    { name: 'torchvision.models', color: '#5856D6', desc: 'Pre-built model architectures in PyTorch' },
    { name: 'ResNet50', color: '#5856D6', desc: 'Residual network with 50 layers' },
    { name: 'EfficientNet', color: '#5856D6', desc: 'Compound-scaled efficient architecture' },
    { name: 'ViT', color: '#5856D6', desc: 'Vision Transformer for image classification' },
    { name: 'CLIP', color: '#5856D6', desc: 'Contrastive Language-Image Pre-training by OpenAI' },
    { name: 'timm library', color: '#5856D6', desc: 'PyTorch Image Models — hundreds of pretrained models' },
    { name: 'HuggingFace', color: '#5856D6', desc: 'Hub for state-of-the-art models and datasets' },
  ],
  7: [
    { name: 'YOLO', color: '#5856D6', desc: 'Real-time object detection model' },
    { name: 'Faster R-CNN', color: '#5856D6', desc: 'Two-stage object detection architecture' },
    { name: 'U-Net', color: '#5856D6', desc: 'Architecture for semantic segmentation, popular in medical imaging' },
    { name: 'Mask R-CNN', color: '#5856D6', desc: 'Instance segmentation with pixel-level masks' },
    { name: 'SAM', color: '#5856D6', desc: 'Segment Anything Model by Meta — zero-shot segmentation' },
    { name: 'DETR', color: '#5856D6', desc: 'Detection Transformer — end-to-end object detection' },
  ],
}

const STAGES = [
  { key: 'see', label: 'How Computers See' },
  { key: 'pixels', label: 'Pixels & Colour' },
  { key: 'convolutions', label: 'Convolutions' },
  { key: 'features', label: 'Feature Maps' },
  { key: 'cnn', label: 'CNN Architecture' },
  { key: 'training', label: 'Training' },
  { key: 'modern', label: 'Modern Architectures' },
  { key: 'realworld', label: 'Real World' },
]

const STAGE_TOOLTIPS = {
  see: 'Images are grids of numbers — no shapes, no objects, just pixel values',
  pixels: 'Colour images use three channels (RGB) stacked into a tensor',
  convolutions: 'A tiny filter slides across the image, detecting edges and patterns',
  features: 'Stack layers of feature maps and shrink with pooling to build abstraction',
  cnn: 'Conv, ReLU, Pool — repeat. Then flatten and classify',
  training: 'Transfer learning, data augmentation, and fighting overfitting',
  modern: 'From AlexNet (2012) to Vision Transformers and CLIP',
  realworld: 'Classification, detection, segmentation — and where CV still fails',
}

const NEXT_LABELS = [
  'Pixels and colour',
  'Convolutions',
  'Feature maps and pooling',
  'CNN architecture',
  'Training',
  'Modern architectures',
  'Real-world applications',
  'Test my knowledge',
]

/* ── 16x16 Cat pixel grid ── */
const BG = '#E5E7EB'
const FUR = '#9CA3AF'
const DFUR = '#6B7280'
const EYE = '#10B981'
const PUPIL = '#111827'
const NOSE = '#F472B6'
const WHISK = '#374151'
const EAR_IN = '#FCA5A5'

// prettier-ignore
const CAT_PIXELS = [
  [BG,BG,BG,BG,BG,BG,BG,BG,BG,BG,BG,BG,BG,BG,BG,BG],
  [BG,BG,BG,DFUR,BG,BG,BG,BG,BG,BG,BG,BG,DFUR,BG,BG,BG],
  [BG,BG,DFUR,EAR_IN,DFUR,BG,BG,BG,BG,BG,DFUR,EAR_IN,DFUR,BG,BG,BG],
  [BG,BG,DFUR,FUR,FUR,DFUR,FUR,FUR,FUR,DFUR,FUR,FUR,DFUR,BG,BG,BG],
  [BG,BG,BG,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,BG,BG,BG,BG],
  [BG,BG,FUR,FUR,EYE,PUPIL,FUR,FUR,FUR,PUPIL,EYE,FUR,FUR,BG,BG,BG],
  [BG,BG,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,BG,BG,BG],
  [BG,BG,FUR,FUR,FUR,FUR,FUR,NOSE,FUR,FUR,FUR,FUR,FUR,BG,BG,BG],
  [BG,WHISK,WHISK,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,WHISK,WHISK,BG,BG],
  [BG,BG,WHISK,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,WHISK,BG,BG,BG],
  [BG,BG,BG,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,BG,BG,BG,BG],
  [BG,BG,BG,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,FUR,BG,BG,BG,BG],
  [BG,BG,BG,BG,FUR,FUR,FUR,FUR,FUR,FUR,FUR,BG,BG,BG,BG,BG],
  [BG,BG,BG,BG,BG,FUR,FUR,FUR,FUR,FUR,BG,BG,BG,BG,BG,BG],
  [BG,BG,BG,BG,BG,BG,FUR,FUR,FUR,BG,BG,BG,BG,BG,BG,BG],
  [BG,BG,BG,BG,BG,BG,BG,BG,BG,BG,BG,BG,BG,BG,BG,BG],
]

/* Grayscale values for number overlay */
function hexToGray(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b)
}

function hexToRGB(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

const CAT_GRAY = CAT_PIXELS.map(row => row.map(hexToGray))

/* ── Convolution filters ── */
const FILTERS = {
  edge: { name: 'Edge Detect', values: [[-1,-1,-1],[-1,8,-1],[-1,-1,-1]], desc: 'Highlights all edges. Centre pixel times 8 minus all neighbours — flat areas become 0, boundaries light up.' },
  blur: { name: 'Blur', values: [[1,1,1],[1,1,1],[1,1,1]].map(r => r.map(v => v / 9)), desc: 'Averages each pixel with its neighbours. Smooths out detail and noise — the image gets softer.' },
  sharpen: { name: 'Sharpen', values: [[0,-1,0],[-1,5,-1],[0,-1,0]], desc: 'Amplifies the centre pixel versus neighbours. Edges become crisper, detail pops out.' },
  horizEdge: { name: 'Horizontal Edge', values: [[-1,-1,-1],[0,0,0],[1,1,1]], desc: 'Detects horizontal boundaries. Top row negative, bottom positive — fires where brightness changes vertically.' },
  vertEdge: { name: 'Vertical Edge', values: [[-1,0,1],[-1,0,1],[-1,0,1]], desc: 'Detects vertical boundaries. Left column negative, right positive — fires where brightness changes horizontally.' },
}

function applyConvolution(gray, filter) {
  const rows = gray.length
  const cols = gray[0].length
  const out = []
  for (let r = 0; r <= rows - 3; r++) {
    const outRow = []
    for (let c = 0; c <= cols - 3; c++) {
      let sum = 0
      for (let fr = 0; fr < 3; fr++) {
        for (let fc = 0; fc < 3; fc++) {
          sum += gray[r + fr][c + fc] * filter[fr][fc]
        }
      }
      outRow.push(sum)
    }
    out.push(outRow)
  }
  return out
}

/* ── Pre-compute feature maps for stage 3-4 ── */
const FEATURE_MAPS = {
  edge: applyConvolution(CAT_GRAY, FILTERS.edge.values),
  blur: applyConvolution(CAT_GRAY, FILTERS.blur.values),
  sharpen: applyConvolution(CAT_GRAY, FILTERS.sharpen.values),
  horizEdge: applyConvolution(CAT_GRAY, FILTERS.horizEdge.values),
  vertEdge: applyConvolution(CAT_GRAY, FILTERS.vertEdge.values),
}

/* ── Explanations per stage ── */
const EXPLANATIONS = [
  {
    title: 'Stage 1: A Computer Sees Numbers',
    content: `When you look at a photo of a cat, you see fur, whiskers, and attitude.

A computer sees a grid of numbers.

That is it. No shapes. No objects. Just a matrix of values between 0 and 255, arranged in rows and columns.

Every image is a grid of pixels. Every pixel is a number (or three numbers for colour).

The entire job of computer vision is: take these numbers, output a useful description. "This is a cat." "Tumour detected." "Stop sign."

The same cat, photographed twice, produces completely different numbers. Different lighting: different numbers. Different angle: different numbers. Cat moved 1 pixel left: completely different grid.

A model cannot just memorise the exact pixel pattern for "cat" and look it up. There are infinite variations of cat images.

The solution — which took decades to discover — is to learn features instead of pixels. Not "this exact arrangement of numbers = cat" but "this arrangement has eyes + ears + fur texture = probably cat."

Learning features from pixels is what convolutional neural networks do. That is what the next seven stages explain.`,
  },
  {
    title: 'Stage 2: Three Numbers Per Pixel',
    content: `A black-and-white photo needs just one number per pixel — how bright it is, from 0 (black) to 255 (white).

Colour photos need three. One number for how much red, one for green, one for blue. Mix them together and you get every colour you can see on screen. Pure red is R=255, G=0, B=0. The grayish fur on our cat is R=156, G=163, B=175 — a little of each channel, roughly equal.

So a colour image is really three grids stacked on top of each other — one for red, one for green, one for blue. Our tiny 16×16 image becomes 16×16×3, which is 768 numbers in total. This stacked structure is called a tensor.

When a CNN looks at an image, it reads all three channels at once. That matters because colour is a feature. "Orange fur" only makes sense when you combine all three channels — no single channel tells you the full story.

One small detail that trips people up: before feeding pixels to a neural network, values get scaled from 0–255 down to 0–1. Networks learn more smoothly when inputs are small numbers close to zero.`,
  },
  {
    title: 'Stage 3: The Filter That Finds Edges',
    content: `Imagine a tiny magnifying glass — just 3×3 pixels — that slides across the image one step at a time. At each position, it multiplies each of its 9 weights by the pixel underneath, adds everything up, and writes a single number to a new grid. That new grid is called a feature map.

The clever part is what the weights are. An edge detector, for example, puts a large positive number in the centre and negative numbers around it. If the centre pixel looks just like its neighbours (a flat area), the positives and negatives cancel out — the output is close to zero. But where the centre pixel is very different from its neighbours (an edge), the output spikes.

Different weight patterns find different things. A blur filter averages everything together. A sharpen filter amplifies the centre against its neighbours.

Here is the key insight: a neural network does not use hand-designed filters. It learns the weights from training data. Show it 10,000 cat images and it will discover on its own which filters fire on ears, which fire on whiskers, which fire on eyes.

Nobody programs "look for edges here." The network figures it out. The filter weights are what the model has learned about which visual patterns matter.`,
  },
  {
    title: 'Stage 4: Building Abstraction Layer by Layer',
    content: `One filter gives you one feature map. But a single layer usually runs 32 or 64 filters at the same time, producing dozens of feature maps — each one highlighting something different.

What makes CNNs powerful is stacking these layers. The first layer detects simple things: edges, colour gradients, basic textures. The second layer takes those outputs and combines them — edges and curves become an eye shape. The third layer goes further — eye shape plus ear shape plus fur texture becomes a face.

Each layer sees the world a little more abstractly than the one before it. That is the magic of depth.

Between layers, there is a step called pooling. It takes small regions (usually 2×2) and keeps only the strongest value, throwing the rest away. The feature map shrinks to half its size, but the important signals survive.

Why shrink? Because it makes the network care less about exact position. A cat's eye at pixel (50, 60) in one photo and pixel (55, 65) in another will produce very similar values after pooling. The network learns to recognise "eye" regardless of where it appears.`,
  },
  {
    title: 'Stage 5: Putting the Pipeline Together',
    content: `Now you have all the building blocks. A Convolutional Neural Network is just these pieces stacked together in a repeating pattern: convolve, activate, pool — then repeat.

Think of it like an assembly line. The image enters at the top. Each convolution layer asks "what features do I see here?" ReLU throws away anything the network is not confident about (negative values become zero). Pooling shrinks the result so the next layer can focus on bigger patterns instead of individual pixels.

After a few rounds of this, the spatial maps get flattened into a single list of numbers — like turning a spreadsheet into one long row. That list feeds into a fully connected layer, which learns how to combine all those features into a final answer.

The very last step is Softmax. It takes the raw output numbers and converts them into probabilities that add up to 100%. The class with the highest probability is the prediction — "91% cat, 4% dog, 2% bird."

Our tiny 16×16 cat classifier has roughly 52,000 learnable parameters. A real classifier working on 224×224 photos would have millions. The architecture is the same — just bigger.`,
  },
  {
    title: 'Stage 6: Teaching the Network to See',
    content: `Training a vision model works the same way as any neural network: show it an image, compare its prediction to the correct answer, calculate how wrong it was, and nudge the weights in a better direction. Repeat millions of times.

The big question is: where do all those training images come from? The most famous dataset is ImageNet — 14 million images across thousands of categories. It is the benchmark that launched modern computer vision.

But here is the good news: you almost never need to train from scratch. A technique called transfer learning lets you take a model that already learned on ImageNet and reuse it. Its early layers already know edges, textures, and shapes — those are universal. You just swap out the final layer and teach it your specific task. A model fine-tuned this way with just 500 images can beat one trained from scratch on 50,000.

There is also a trick to make your training data go further: data augmentation. You randomly flip, rotate, crop, and colour-shift each image during training. The model sees a slightly different version every time, which forces it to learn the real patterns instead of memorising specific photos.

Watch for overfitting — when training accuracy hits 99% but the model only gets 72% right on new images. That means it memorised the training set instead of learning. Augmentation is one of the best cures.`,
  },
  {
    title: 'Stage 7: From AlexNet to Vision Transformers',
    content: `AlexNet (2012): the first deep CNN to win ImageNet. 8 layers, 60M parameters. Won by a massive margin — started the deep learning revolution.

VGG (2014): very deep, 16-19 layers. Key insight: stack 3×3 convolutions instead of large kernels. Still used today for transfer learning.

ResNet (2015): the skip connection revolution. Very deep networks (50+ layers) got worse as they got deeper. ResNet's solution: add the input directly to the output. If the layer learns nothing useful, output = input (identity mapping). Skip connections let gradients flow directly without vanishing. Trained 152-layer networks successfully.

EfficientNet (2019): simultaneously scale depth, width, and resolution. 1/10 the parameters of ResNet-50 with better accuracy.

Vision Transformer — ViT (2020): split the image into patches. Each patch becomes a "token." Feed all tokens to a standard transformer. No convolutions. No pooling. Matches or beats CNNs on large datasets.

CLIP (2021): train a vision model and text model together. Result: zero-shot classification from text descriptions. The foundation of DALL-E, Stable Diffusion, and GPT-4V.`,
  },
  {
    title: 'Stage 8: Computer Vision in the Wild',
    content: `Image classification: input one image, output one label. Object detection: input one image, output bounding boxes + labels. Semantic segmentation: a label for every pixel. Instance segmentation: distinguish individual instances.

Real applications you use every day: Face ID, Google Photos, Google Lens, Tesla Autopilot, medical AI, quality control on production lines.

Where computer vision fails: distribution shift (trained on sunny roads, fails in fog). Adversarial examples (tiny invisible pixel changes cause misclassification). Dataset bias (performs worse on underrepresented demographics). Out-of-distribution inputs. Small object detection. Occlusion.

The reliability principle: always evaluate on data from your actual deployment environment. A model with 99% accuracy on ImageNet may have 60% accuracy on your specific dataset. Distribution shift is the primary cause of production failures.`,
  },
]

const TIP_CONTENT = [
  'This "grid of numbers" insight is why image classification was considered nearly impossible for traditional programming. You cannot write rules for every possible cat image. CNNs learn the rules automatically from examples — the same way children learn to recognise cats.',
  'When you see a model failing on images with unusual colour profiles (night vision, medical scans, satellite imagery) — it is often because the model was trained on normal RGB images and the channel statistics are completely different.',
  <>A 3&times;3 filter on one input channel has 9 weights. A layer with 64 such filters has 9 &times; 64 = 576 weights (plus biases). On an RGB input, each filter is 3&times;3&times;3 = 27 weights, so 64 filters = 1,728. Compare: a fully connected layer on a 224&times;224&times;3 image would need 150,528 &times; 64 = 9.6 million parameters. Convolutions are efficient because the same filter applies everywhere.</>,
  'Max pooling was the standard for years. Modern architectures increasingly skip pooling and use strided convolutions instead — they learn the downsampling rather than hardcoding it. Vision Transformers skip both and use patch embeddings.',
  <>The "FLATTEN &rarr; FULLY CONNECTED" transition is where spatial information is lost. Modern architectures like ResNet use Global Average Pooling instead of flattening, producing far fewer parameters. The fully-connected layers at the end are also called the "classifier head."</>,
  'Transfer learning is almost always the right answer for image classification tasks. Start with a pretrained model (ResNet-50, EfficientNet, ViT). Replace the classifier head. Fine-tune. You will get 90%+ accuracy on most tasks with under 1,000 images per class.',
  'ResNet-50 is still the workhorse of computer vision. When you need efficiency: EfficientNet-B0. When you need state-of-the-art: ViT-L. When you need vision + language: use a CLIP-based model.',
  null,
]

const WARNING_CONTENT = [
  null, null, null, null, null, null, null,
  'Computer vision bias is a documented, serious problem. Models trained on datasets that underrepresent certain demographics perform worse on those groups. Always test your model across the full range of people, conditions, and environments it will encounter in production.',
]

/* ── Toolkit items for final screen ── */
const TOOLKIT_ITEMS = [
  { name: 'Pixel Grids', desc: 'Images are grids of numbers — width × height × channels' },
  { name: 'Convolutions', desc: '3×3 filters slide across images to detect features' },
  { name: 'Feature Maps', desc: 'Output of convolution — shows where features activate' },
  { name: 'Pooling', desc: 'Downsample while keeping strongest activations' },
  { name: 'CNN Pipeline', desc: 'Conv → ReLU → Pool, stacked into deep networks' },
  { name: 'Transfer Learning', desc: 'Start pretrained, fine-tune on your data' },
  { name: 'Skip Connections', desc: 'ResNet\'s key idea — gradient highways through depth' },
  { name: 'Vision Transformers', desc: 'Images as patch tokens — attention replaces convolution' },
]

/* ══════════════════════════════════════
   STAGE VISUALISATIONS
   ══════════════════════════════════════ */

/* ── Shared pixel grid component ── */
function PixelGrid({ pixels, showNumbers, selectedPixel, onPixelClick, highlightRegion, className = '', scanned }) {
  return (
    <div className={`cv-pixel-grid ${className}`} role="img" aria-label="16 by 16 pixel grid of a cat image">
      {pixels.map((row, r) =>
        row.map((color, c) => {
          const gray = hexToGray(color)
          const isSelected = selectedPixel && selectedPixel[0] === r && selectedPixel[1] === c
          const isHighlighted = highlightRegion && r >= highlightRegion.r && r < highlightRegion.r + 3 && c >= highlightRegion.c && c < highlightRegion.c + 3
          // Contrast threshold 128: white text on dark pixels, black text on light pixels
          const textColor = gray < 128 ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)'
          const visible = scanned === undefined || (r * 16 + c) < scanned
          return (
            <div
              key={`${r}-${c}`}
              className={`cv-pixel${isSelected ? ' cv-pixel-selected' : ''}${isHighlighted ? ' cv-pixel-highlighted' : ''}`}
              style={{
                backgroundColor: visible ? color : 'transparent',
                animationDelay: scanned !== undefined ? `${(r * 16 + c) * 8}ms` : undefined, // 16 = grid width

                opacity: visible ? 1 : 0,
              }}
              onClick={() => onPixelClick?.(r, c)}
              title={`Row ${r}, Col ${c}`}
            >
              {showNumbers && visible && (
                <span className="cv-pixel-number" style={{ color: textColor }}>{gray}</span>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

/* ── Feature map display ── */
function FeatureMapGrid({ featureMap, label, highlightCell }) {
  if (!featureMap || featureMap.length === 0) return null
  const vals = featureMap.flat().filter(v => v != null)
  const absVals = vals.map(Math.abs)
  // Use 95th percentile instead of max to avoid outlier crushing
  const sorted = [...absVals].sort((a, b) => a - b)
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 1
  const maxAbs = Math.max(p95, 1)

  return (
    <div className="cv-feature-map-wrap">
      {label && <div className="cv-feature-map-label">{label}</div>}
      <div className="cv-feature-map" role="img" aria-label="Convolution feature map output" style={{ gridTemplateColumns: `repeat(${featureMap[0].length}, 1fr)` }}>
        {featureMap.map((row, r) =>
          row.map((val, c) => {
            if (val == null) {
              return <div key={`${r}-${c}`} className="cv-feature-cell" style={{ backgroundColor: 'var(--bg-secondary)' }} />
            }
            // sqrt scale: makes mid-range values much more visible
            const rawNorm = Math.min(Math.abs(val) / maxAbs, 1)
            const brightness = Math.sqrt(rawNorm)
            // Simple intensity: black = nothing, white = strong feature
            // Dark theme inverts: dark bg = nothing, light = strong
            const v = Math.round(brightness * 255)
            const bg = val === 0 ? 'var(--bg-secondary)' : `rgb(${v}, ${v}, ${v})`
            const isHighlighted = highlightCell && highlightCell.r === r && highlightCell.c === c
            return (
              <div
                key={`${r}-${c}`}
                className={`cv-feature-cell${isHighlighted ? ' cv-feature-cell-highlight' : ''}`}
                style={{ backgroundColor: bg }}
                title={`Row ${r + 1}, Col ${c + 1}: ${Math.round(val)}`}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

/* ── Stage 0: How Computers See ── */
function PixelRevealViz({ active }) {
  const [showNumbers, setShowNumbers] = useState(false)
  const [selectedPixel, setSelectedPixel] = useState(null)
  const [scanned, setScanned] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active) {
      clearInterval(timerRef.current)
      setScanned(0)
      return
    }
    setScanned(0)
    let count = 0
    // 16×16 = 256 pixels, reveal 4 at a time every 8ms (~500ms total)
    timerRef.current = setInterval(() => {
      count += 4
      if (count >= 256) {
        count = 256
        clearInterval(timerRef.current)
      }
      setScanned(count)
    }, 8)
    return () => clearInterval(timerRef.current)
  }, [active])

  const selInfo = selectedPixel ? {
    row: selectedPixel[0],
    col: selectedPixel[1],
    gray: CAT_GRAY[selectedPixel[0]][selectedPixel[1]],
    rgb: hexToRGB(CAT_PIXELS[selectedPixel[0]][selectedPixel[1]]),
  } : null

  return (
    <div className="cv-viz cv-reveal-viz">
      <p className="cv-viz-note">Toggle between the image and the numbers underneath. This is the same cat &mdash; one view for humans, one for machines.</p>
      <div className="cv-reveal-panels">
        <div className="cv-reveal-panel">
          <div className="cv-reveal-panel-label">{showNumbers ? 'What the computer sees' : 'What you see'}</div>
          <PixelGrid
            pixels={CAT_PIXELS}
            showNumbers={showNumbers}
            selectedPixel={selectedPixel}
            onPixelClick={(r, c) => setSelectedPixel([r, c])}
            scanned={scanned}
          />
          <div className="cv-reveal-panel-sublabel">{showNumbers ? 'A 16×16 grid of numbers' : 'A cat'}</div>
        </div>
      </div>

      <div className="cv-reveal-controls">
        <button
          className={`cv-toggle-btn${!showNumbers ? ' cv-toggle-active' : ''}`}
          onClick={() => setShowNumbers(false)}
        >
          See as Image
        </button>
        <button
          className={`cv-toggle-btn${showNumbers ? ' cv-toggle-active' : ''}`}
          onClick={() => setShowNumbers(true)}
        >
          See as Numbers
        </button>
      </div>

      {selInfo && (
        <div className="cv-pixel-info">
          <div className="cv-pixel-info-title">Pixel ({selInfo.row}, {selInfo.col})</div>
          <div className="cv-pixel-info-value">Grayscale: {selInfo.gray}</div>
          <div className="cv-pixel-info-value">RGB: R={selInfo.rgb.r}, G={selInfo.rgb.g}, B={selInfo.rgb.b}</div>
          <div className="cv-pixel-info-swatch" style={{ backgroundColor: CAT_PIXELS[selInfo.row][selInfo.col] }} />
        </div>
      )}

      <p className="cv-instruction">Click any pixel to see its value</p>

      <div className="cv-stat-row">
        <span>This image: 256 pixels</span>
        <span className="cv-stat-sep">&middot;</span>
        <span>A phone photo: ~12M pixels</span>
      </div>
    </div>
  )
}

/* ── Stage 1: Pixels and Colour ── */
function ChannelSplitterViz({ active }) {
  const [channel, setChannel] = useState('combined')
  const [selectedPixel, setSelectedPixel] = useState(null)
  const [mixR, setMixR] = useState(156)
  const [mixG, setMixG] = useState(163)
  const [mixB, setMixB] = useState(175)

  function getChannelPixels() {
    if (channel === 'combined') return CAT_PIXELS
    return CAT_PIXELS.map(row =>
      row.map(hex => {
        const rgb = hexToRGB(hex)
        // Show each channel as grayscale intensity — this is how CNNs see it:
        // one separate brightness map per channel
        const v = channel === 'red' ? rgb.r : channel === 'green' ? rgb.g : rgb.b
        return `rgb(${v}, ${v}, ${v})`
      })
    )
  }

  const selInfo = selectedPixel ? hexToRGB(CAT_PIXELS[selectedPixel[0]][selectedPixel[1]]) : null
  const mixColor = `rgb(${mixR}, ${mixG}, ${mixB})`

  function handlePixelClick(r, c) {
    setSelectedPixel([r, c])
    const rgb = hexToRGB(CAT_PIXELS[r][c])
    setMixR(rgb.r)
    setMixG(rgb.g)
    setMixB(rgb.b)
  }

  return (
    <div className="cv-viz cv-channel-viz">
      <p className="cv-viz-note">A colour image is really three separate grayscale layers stacked together. Click Red, Green, or Blue to see that channel's intensity map &mdash; bright means more of that colour, dark means less. This is exactly how a CNN sees the image: three independent number grids.</p>

      <div className="cv-channel-buttons">
        {['combined', 'red', 'green', 'blue'].map(ch => (
          <button
            key={ch}
            className={`cv-channel-btn cv-channel-${ch}${channel === ch ? ' cv-channel-active' : ''}`}
            onClick={() => setChannel(ch)}
          >
            {ch === 'combined' ? 'Combined RGB' : ch.charAt(0).toUpperCase() + ch.slice(1)}
          </button>
        ))}
      </div>

      <div className="cv-channel-layout">
        <div className="cv-channel-left">
          <PixelGrid
            pixels={getChannelPixels()}
            selectedPixel={selectedPixel}
            onPixelClick={handlePixelClick}
          />
          <p className="cv-instruction">Click any pixel</p>
        </div>

        <div className="cv-channel-right">
          <div className={`cv-channel-info${selInfo ? '' : ' cv-channel-info-empty'}`}>
            <div className="cv-pixel-info-title">{selInfo ? `Pixel (${selectedPixel[0]}, ${selectedPixel[1]})` : 'No pixel selected'}</div>
            {selInfo ? (
              <div className="cv-channel-bars">
                <div className="cv-channel-bar">
                  <span className="cv-bar-label" style={{ color: '#EF4444' }}>R</span>
                  <div className="cv-bar-track"><div className="cv-bar-fill" style={{ width: `${(selInfo.r / 255) * 100}%`, background: '#EF4444' }} /></div>
                  <span className="cv-bar-value">{selInfo.r}</span>
                </div>
                <div className="cv-channel-bar">
                  <span className="cv-bar-label" style={{ color: '#22C55E' }}>G</span>
                  <div className="cv-bar-track"><div className="cv-bar-fill" style={{ width: `${(selInfo.g / 255) * 100}%`, background: '#22C55E' }} /></div>
                  <span className="cv-bar-value">{selInfo.g}</span>
                </div>
                <div className="cv-channel-bar">
                  <span className="cv-bar-label" style={{ color: '#3B82F6' }}>B</span>
                  <div className="cv-bar-track"><div className="cv-bar-fill" style={{ width: `${(selInfo.b / 255) * 100}%`, background: '#3B82F6' }} /></div>
                  <span className="cv-bar-value">{selInfo.b}</span>
                </div>
              </div>
            ) : (
              <p className="cv-instruction" style={{ margin: 0 }}>Click a pixel on the grid to inspect its RGB values</p>
            )}
          </div>

          <div className="cv-mixer">
            <div className="cv-mixer-title">Colour Mixer</div>
            <div className="cv-mixer-row">
              <span className="cv-bar-label" style={{ color: '#EF4444' }}>R</span>
              <input type="range" min="0" max="255" value={mixR} onChange={e => setMixR(+e.target.value)} className="cv-mixer-slider cv-slider-red" />
              <span className="cv-bar-value">{mixR}</span>
            </div>
            <div className="cv-mixer-row">
              <span className="cv-bar-label" style={{ color: '#22C55E' }}>G</span>
              <input type="range" min="0" max="255" value={mixG} onChange={e => setMixG(+e.target.value)} className="cv-mixer-slider cv-slider-green" />
              <span className="cv-bar-value">{mixG}</span>
            </div>
            <div className="cv-mixer-row">
              <span className="cv-bar-label" style={{ color: '#3B82F6' }}>B</span>
              <input type="range" min="0" max="255" value={mixB} onChange={e => setMixB(+e.target.value)} className="cv-mixer-slider cv-slider-blue" />
              <span className="cv-bar-value">{mixB}</span>
            </div>
            <div className="cv-mixer-preview">
              <div className="cv-mixer-swatch" style={{ backgroundColor: mixColor }} />
              <span className="cv-mixer-label">R:{mixR} G:{mixG} B:{mixB}</span>
            </div>
          </div>

          <div className="cv-tensor-display">
            <code>torch.Size([3, 16, 16])</code>
            <span className="cv-tensor-note">[channels=3, height=16, width=16]</span>
          </div>
          <p className="cv-viz-note">This stacked structure &mdash; 3 colour channels, each 16&times;16 pixels &mdash; is called a <strong>tensor</strong>. It's how neural networks see every image: one multi-dimensional array of numbers.</p>
        </div>
      </div>
    </div>
  )
}

/* ── Stage 2: Convolutions ── */
const CONV_SPEEDS = { slow: 200, normal: 60, fast: 15 }

function ConvolutionViz({ active }) {
  const [activeFilter, setActiveFilter] = useState('edge')
  // Identity filter (pass-through) as default — intentionally not edge detect
  const [customFilter, setCustomFilter] = useState([[0,0,0],[0,1,0],[0,0,0]])
  const [isCustom, setIsCustom] = useState(false)
  const [convPos, setConvPos] = useState(null)
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState('normal')
  const [outputCells, setOutputCells] = useState([])
  const timersRef = useRef([])

  const currentFilter = isCustom ? customFilter : FILTERS[activeFilter].values
  const currentFeatureMap = isCustom
    ? applyConvolution(CAT_GRAY, customFilter)
    : FEATURE_MAPS[activeFilter]

  function clearConvTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function stopConv() {
    clearConvTimers()
    setRunning(false)
  }

  function runConvolution() {
    stopConv()
    setOutputCells([])
    setConvPos(null)
    setRunning(true)

    const speedMs = CONV_SPEEDS[speed]
    const totalPositions = 14 * 14

    for (let idx = 0; idx < totalPositions; idx++) {
      const r = Math.floor(idx / 14)
      const c = idx % 14
      timersRef.current.push(setTimeout(() => {
        setConvPos({ r, c })
        setOutputCells(prev => [...prev, { r, c, val: currentFeatureMap[r][c] }])
        if (idx === totalPositions - 1) {
          setRunning(false)
          setConvPos(null)
        }
      }, speedMs * (idx + 1)))
    }
  }

  function stepConv() {
    const nextIdx = outputCells.length
    if (nextIdx >= 196) return
    const r = Math.floor(nextIdx / 14)
    const c = nextIdx % 14
    setConvPos({ r, c })
    setOutputCells(prev => [...prev, { r, c, val: currentFeatureMap[r][c] }])
  }

  useEffect(() => {
    return () => clearConvTimers()
  }, [])

  useEffect(() => {
    clearConvTimers()
    setRunning(false)
    setOutputCells([])
    setConvPos(null)
  }, [activeFilter, isCustom])

  function handleCustomChange(r, c, val) {
    const v = Math.round(parseFloat(val)) || 0
    // Clamped to ±9: keeps single-digit display in the 3×3 grid cells
    const next = customFilter.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? Math.max(-9, Math.min(9, v)) : cell))
    )
    setCustomFilter(next)
  }



  return (
    <div className="cv-viz cv-conv-viz">
      <div className="cv-filter-tabs">
        {Object.entries(FILTERS).map(([key, f]) => (
          <button
            key={key}
            className={`cv-filter-tab${!isCustom && activeFilter === key ? ' cv-filter-tab-active' : ''}`}
            onClick={() => { setIsCustom(false); setActiveFilter(key) }}
          >
            {f.name}
          </button>
        ))}
        <button
          className={`cv-filter-tab${isCustom ? ' cv-filter-tab-active' : ''}`}
          onClick={() => setIsCustom(true)}
        >
          Custom
        </button>
      </div>

      {/* How it works explainer */}
      <div className="cv-conv-explainer">
        <p className="cv-conv-explainer-text">
          <strong>How it works:</strong> The blue box slides across the input image. At each position, it multiplies the 3&times;3 patch of pixels by the filter weights, sums the results, and writes one number to the output.
          {!isCustom && FILTERS[activeFilter] && <> <em>{FILTERS[activeFilter].desc}</em></>}
        </p>
      </div>

      {/* Three columns: Input → Filter → Feature Map */}
      <div className="cv-conv-row">
        <div className="cv-conv-col">
          <div className="cv-conv-label">Input</div>
          <div className="cv-pixel-grid-wrap-relative">
            <PixelGrid
              pixels={CAT_PIXELS}
              highlightRegion={convPos}
            />
            {convPos && (
              <div
                className="cv-conv-overlay"
                style={{
                  top: `${(convPos.r / 16) * 100}%`,
                  left: `${(convPos.c / 16) * 100}%`,
                  width: `${(3 / 16) * 100}%`,
                  height: `${(3 / 16) * 100}%`,
                }}
              />
            )}
          </div>
        </div>

        <div className="cv-conv-col cv-conv-col-filter">
          <div className="cv-conv-label">{convPos ? 'Multiply + Sum' : 'Filter (3×3)'}</div>
          <div className="cv-filter-grid">
            {currentFilter.map((row, r) =>
              row.map((val, c) => {
                const product = convPos ? CAT_GRAY[convPos.r + r][convPos.c + c] * val : null
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`cv-filter-cell${convPos ? (product > 0 ? ' cv-filter-positive' : product < 0 ? ' cv-filter-negative' : '') : (val > 0 ? ' cv-filter-positive' : val < 0 ? ' cv-filter-negative' : '')}`}
                  >
                    {isCustom && !convPos ? (
                      <input
                        type="number"
                        className="cv-filter-input"
                        value={customFilter[r][c]}
                        onChange={e => handleCustomChange(r, c, e.target.value)}
                        min="-9"
                        max="9"
                      />
                    ) : convPos ? (
                      <span>{Math.round(product)}</span>
                    ) : (
                      <span>{Number.isInteger(val) ? val : val.toFixed(2)}</span>
                    )}
                  </div>
                )
              })
            )}
          </div>
          {convPos ? (
            <p className="cv-conv-sum">
              = <strong>{Math.round(currentFeatureMap[convPos.r][convPos.c])}</strong>
            </p>
          ) : (
            <p className="cv-filter-legend"><span className="cv-legend-pos">Positive</span> = amplify &nbsp; <span className="cv-legend-neg">Negative</span> = suppress &nbsp; Zero = ignore</p>
          )}
        </div>

        <div className="cv-conv-col">
          <div className="cv-conv-label">Feature Map</div>
          <FeatureMapGrid
            featureMap={currentFeatureMap}
            highlightCell={convPos}
          />
          <p className="cv-output-legend">Bright = strong feature detected. Dark = nothing found.</p>
        </div>
      </div>

      {/* Controls row */}
      <div className="cv-conv-controls">
        <button className="cv-control-btn" onClick={runConvolution} disabled={running}>
          {outputCells.length > 0 && !running ? 'Replay' : 'Run Convolution'}
        </button>
        <button className="cv-control-btn cv-control-secondary" onClick={stepConv} disabled={running || outputCells.length >= 196}>
          Step
        </button>
        <div className="cv-speed-controls">
          {['slow', 'normal', 'fast'].map(s => (
            <button
              key={s}
              className={`cv-speed-btn${speed === s ? ' cv-speed-active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {convPos && (
        <p className="cv-conv-status">
          Row {convPos.r + 1}, Col {convPos.c + 1} &mdash; {outputCells.length}/196 positions
        </p>
      )}

      {outputCells.length === 196 && !running && (
        <div className="cv-conv-result">
          The feature map shows <strong>where this filter detected its pattern</strong>. Try a different filter above.
        </div>
      )}

      {isCustom && !convPos && <p className="cv-instruction">Edit the filter values above, then run</p>}
      {!isCustom && outputCells.length === 0 && !running && (
        <p className="cv-instruction">Click "Run Convolution" or "Step" to watch the filter scan</p>
      )}
    </div>
  )
}

/* ── Stage 3: Feature Maps & Pooling ── */
function FeaturePoolViz({ active }) {
  const [poolType, setPoolType] = useState('max')

  const featureMapsData = [
    { key: 'vertEdge', label: 'Vertical edges', map: FEATURE_MAPS.vertEdge },
    { key: 'horizEdge', label: 'Horizontal edges', map: FEATURE_MAPS.horizEdge },
    { key: 'edge', label: 'All edges', map: FEATURE_MAPS.edge },
    { key: 'blur', label: 'Blur (averaging)', map: FEATURE_MAPS.blur },
    { key: 'sharpen', label: 'Sharpened', map: FEATURE_MAPS.sharpen },
  ]

  // 4x4 pooling demo
  const poolInput = [[4, 1, 7, 2], [3, 8, 5, 0], [6, 2, 9, 1], [1, 3, 4, 7]]
  function poolBlock(input, r, c) {
    const block = [input[r][c], input[r][c + 1], input[r + 1][c], input[r + 1][c + 1]]
    return poolType === 'max' ? Math.max(...block) : Math.round(block.reduce((a, b) => a + b, 0) / 4)
  }

  const poolOutput = [
    [poolBlock(poolInput, 0, 0), poolBlock(poolInput, 0, 2)],
    [poolBlock(poolInput, 2, 0), poolBlock(poolInput, 2, 2)],
  ]

  return (
    <div className="cv-viz cv-pool-viz">
      <p className="cv-viz-note">One convolution layer produces many feature maps &mdash; each filter finds something different. Pooling then shrinks each map, keeping only the strongest signals.</p>
      <div className="cv-pool-layout">
        <div className="cv-pool-maps">
          <div className="cv-pool-maps-title">Multiple Feature Maps</div>
          <div className="cv-pool-maps-grid">
            {featureMapsData.map(fm => (
              <div key={fm.key} className="cv-pool-map-card">
                <FeatureMapGrid featureMap={fm.map} />
                <div className="cv-pool-map-name">{fm.label}</div>
              </div>
            ))}
          </div>
          <p className="cv-pool-maps-note">A typical first layer produces 32-64 feature maps like these. Each filter detects something different.</p>
        </div>

        <div className="cv-pool-demo">
          <div className="cv-pool-demo-title">{poolType === 'max' ? 'Max' : 'Average'} Pooling</div>
          <div className="cv-pool-toggle">
            <button className={`cv-toggle-btn${poolType === 'max' ? ' cv-toggle-active' : ''}`} onClick={() => setPoolType('max')}>Max Pooling</button>
            <button className={`cv-toggle-btn${poolType === 'avg' ? ' cv-toggle-active' : ''}`} onClick={() => setPoolType('avg')}>Average Pooling</button>
          </div>
          <div className="cv-pool-grids">
            <div>
              <div className="cv-pool-grid-label">Before: 4&times;4</div>
              <div className="cv-pool-input-grid" role="img" aria-label="4 by 4 pooling input grid">
                {poolInput.map((row, r) =>
                  row.map((val, c) => (
                    <div key={`${r}-${c}`} className={`cv-pool-cell cv-pool-block-${Math.floor(r / 2)}-${Math.floor(c / 2)}`}>
                      {val}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="cv-pool-arrow">&rarr;</div>
            <div>
              <div className="cv-pool-grid-label">After: 2&times;2</div>
              <div className="cv-pool-output-grid" role="img" aria-label="2 by 2 pooling result">
                {poolOutput.map((row, r) =>
                  row.map((val, c) => (
                    <div key={`${r}-${c}`} className={`cv-pool-cell cv-pool-result cv-pool-block-${r}-${c}`}>
                      {val}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <p className="cv-pool-note">Size halved. {poolType === 'max' ? 'Key activations preserved.' : 'Smooth average computed.'}</p>
        </div>
      </div>

      <div className="cv-depth-viz">
        <div className="cv-depth-title">Layer-by-layer abstraction</div>
        <p className="cv-depth-intro">Each layer builds on the previous one. Early layers detect simple patterns. Deeper layers combine those patterns into complex concepts &mdash; edges become shapes, shapes become objects.</p>
        <div className="cv-depth-layers">
          {[
            { label: 'Layer 1', maps: '32 maps', size: '14×14', desc: 'Edges, colours, corners', width: '100%' },
            { label: 'Layer 2', maps: '64 maps', size: '7×7', desc: 'Textures, shapes', width: '75%' },
            { label: 'Layer 3', maps: '128 maps', size: '3×3', desc: 'Object parts', width: '50%' },
            { label: 'Layer 4', maps: '256 maps', size: '1×1', desc: 'Faces, objects', width: '30%' },
          ].map((layer, i) => (
            <div key={i} className="cv-depth-layer" style={{ width: layer.width }}>
              <div className="cv-depth-layer-bar">
                <span className="cv-depth-layer-label">{layer.label}</span>
                <span className="cv-depth-layer-maps">{layer.maps} &middot; {layer.size}</span>
              </div>
              <div className="cv-depth-layer-desc">{layer.desc}</div>
              {i < 3 && <div className="cv-depth-arrow">&darr; conv + pool</div>}
            </div>
          ))}
        </div>
        <div className="cv-depth-summary">
          <div className="cv-depth-summary-item">
            <span className="cv-depth-summary-label">Maps double each layer</span>
            <span className="cv-depth-summary-detail">More filters = more complex features detected</span>
          </div>
          <div className="cv-depth-summary-item">
            <span className="cv-depth-summary-label">Spatial size halves each layer</span>
            <span className="cv-depth-summary-detail">Pooling discards position, keeps what matters</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Stage 4: CNN Architecture Pipeline ── */
function CNNPipelineViz({ active }) {
  const [activeBlock, setActiveBlock] = useState(null)
  const [running, setRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [paramCount, setParamCount] = useState(0)
  const timersRef = useRef([])

  const pipeline = [
    { id: 'input', label: 'Input', shape: '16×16×3', params: 0, code: '# Input image', desc: 'Cat image with 3 colour channels' },
    { id: 'conv1', label: 'Conv1 (32)', shape: '14×14×32', params: 896, code: 'nn.Conv2d(3, 32, 3)', desc: '32 filters detect edges and colour blobs' },
    { id: 'relu1', label: 'ReLU', shape: '14×14×32', params: 0, code: 'nn.ReLU()', desc: 'Negative values → 0, adds non-linearity' },
    { id: 'pool1', label: 'MaxPool', shape: '7×7×32', params: 0, code: 'nn.MaxPool2d(2)', desc: 'Halve spatial size, keep strongest activations' },
    { id: 'conv2', label: 'Conv2 (64)', shape: '5×5×64', params: 18496, code: 'nn.Conv2d(32, 64, 3)', desc: '64 filters detect shapes and textures' },
    { id: 'relu2', label: 'ReLU + Pool', shape: '2×2×64', params: 0, code: 'nn.ReLU(), nn.MaxPool2d(2)', desc: 'Activate and downsample again' },
    { id: 'flatten', label: 'Flatten', shape: '256', params: 0, code: 'nn.Flatten()', desc: 'Convert spatial maps to a 1D vector' },
    { id: 'fc1', label: 'FC (128)', shape: '128', params: 32896, code: 'nn.Linear(256, 128)', desc: 'Dense layer learns class combinations' },
    { id: 'output', label: 'Output (10)', shape: '10 classes', params: 1290, code: 'nn.Linear(128, 10)', desc: 'Softmax probabilities for each class' },
  ]

  const totalParams = pipeline.reduce((s, p) => s + p.params, 0)

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function runPipeline() {
    clearTimers()
    setCurrentStep(-1)
    setParamCount(0)
    setRunning(true)

    pipeline.forEach((block, i) => {
      timersRef.current.push(setTimeout(() => {
        setCurrentStep(i)
        setParamCount(prev => prev + block.params)
        if (i === pipeline.length - 1) setRunning(false)
      }, 500 * (i + 1)))
    })
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  const classProbs = [
    { name: 'cat', prob: 0.91 },
    { name: 'dog', prob: 0.04 },
    { name: 'bird', prob: 0.02 },
    { name: 'rabbit', prob: 0.02 },
    { name: 'other', prob: 0.01 },
  ]

  return (
    <div className="cv-viz cv-pipeline-viz">
      <p className="cv-viz-note">The full pipeline: image enters on the left, class probabilities come out on the right. Click any block to see its details, or "Run Pipeline" to watch data flow through.</p>
      <div className="cv-pipeline-blocks">
        {pipeline.map((block, i) => (
          <div key={block.id} className="cv-pipeline-step">
            <div
              className={`cv-arch-block${activeBlock === block.id ? ' cv-arch-block-active' : ''}${currentStep >= i ? ' cv-arch-block-lit' : ''}`}
              onClick={() => setActiveBlock(activeBlock === block.id ? null : block.id)}
            >
              <div className="cv-arch-block-label">{block.label}</div>
              <div className="cv-arch-block-shape">{block.shape}</div>
            </div>
            {i < pipeline.length - 1 && <div className="cv-pipeline-connector">&rarr;</div>}
          </div>
        ))}
      </div>

      <div className="cv-pipeline-controls">
        <button className="cv-control-btn" onClick={runPipeline} disabled={running}>
          Run Pipeline
        </button>
        <button className={`cv-control-btn cv-control-secondary cv-fade-element${currentStep >= 0 && !running ? ' cv-fade-visible' : ''}`} onClick={() => { clearTimers(); setCurrentStep(-1); setParamCount(0); setActiveBlock(null) }}>
          Reset
        </button>
      </div>

      <div className={`cv-pipeline-counter cv-fade-element${currentStep >= 0 ? ' cv-fade-visible' : ''}`}>
        Parameters so far: {paramCount.toLocaleString()} / {totalParams.toLocaleString()}
      </div>

      <div className={`cv-pipeline-detail cv-fade-element${activeBlock ? ' cv-fade-visible' : ''}`}>
        {(() => {
          const b = activeBlock ? pipeline.find(p => p.id === activeBlock) : null
          if (!b) return null
          return (
            <>
              <span className="cv-detail-desc">{b.desc}</span>
              <span className="cv-detail-sep">&middot;</span>
              <span className="cv-detail-shape">{b.shape}</span>
              <span className="cv-detail-sep">&middot;</span>
              <code className="cv-detail-code">{b.code}</code>
              <span className="cv-detail-sep">&middot;</span>
              <span className="cv-detail-params">{b.params.toLocaleString()} params</span>
            </>
          )
        })()}
      </div>

      <div className={`cv-class-probs cv-fade-element${currentStep >= pipeline.length - 1 ? ' cv-fade-visible' : ''}`}>
        <div className="cv-class-probs-title">Classification Output</div>
        {classProbs.map((cp, i) => (
          <div key={cp.name} className="cv-class-bar-row" style={{ animationDelay: `${i * 100}ms` }}>
            <span className="cv-class-name">{cp.name}</span>
            <div className="cv-class-bar-track">
              <div className="cv-class-bar-fill" style={{ '--target-width': currentStep >= pipeline.length - 1 ? `${cp.prob * 100}%` : '0%' }} />
            </div>
            <span className="cv-class-value">{(cp.prob * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Stage 5: Training / Data Augmentation ── */
function AugmentationViz({ active }) {
  const [transforms, setTransforms] = useState([])
  const [augView, setAugView] = useState('with')

  function applyTransform(t) {
    setTransforms(prev => [...prev, t])
  }

  function resetTransforms() {
    setTransforms([])
  }

  function randomCombo() {
    const options = ['flipH', 'flipV', 'rotateCW', 'brightness', 'grayscale']
    const shuffled = options.sort(() => Math.random() - 0.5)
    setTransforms(shuffled.slice(0, 3))
  }

  function getTransformStyle() {
    let scaleX = 1, scaleY = 1, rotate = 0, brightness = 1, saturate = 1
    for (const t of transforms) {
      if (t === 'flipH') scaleX *= -1
      if (t === 'flipV') scaleY *= -1
      if (t === 'rotateCW') rotate += 15
      if (t === 'rotateCCW') rotate -= 15
      if (t === 'brightness') brightness = 1.3
      if (t === 'contrast') brightness = 0.7
      if (t === 'grayscale') saturate = 0
    }
    return {
      transform: `scaleX(${scaleX}) scaleY(${scaleY}) rotate(${rotate}deg)`,
      filter: `brightness(${brightness}) saturate(${saturate})`,
    }
  }

  return (
    <div className="cv-viz cv-aug-viz">
      <p className="cv-viz-note">Apply transforms to the cat image &mdash; the model should still recognise it. This is data augmentation: creating training variety from a single image so the model generalises better.</p>

      <div className="cv-aug-image-wrap">
        <div className="cv-aug-image" style={getTransformStyle()}>
          <PixelGrid pixels={CAT_PIXELS} />
        </div>
        <div className="cv-aug-transforms-applied">
          {transforms.length === 0 ? 'Original' : transforms.join(' + ')}
        </div>
      </div>

      <div className="cv-aug-buttons">
        <button className="cv-aug-btn" onClick={() => applyTransform('flipH')}>Flip H</button>
        <button className="cv-aug-btn" onClick={() => applyTransform('flipV')}>Flip V</button>
        <button className="cv-aug-btn" onClick={() => applyTransform('rotateCW')}>Rotate +15&deg;</button>
        <button className="cv-aug-btn" onClick={() => applyTransform('rotateCCW')}>Rotate -15&deg;</button>
        <button className="cv-aug-btn" onClick={() => applyTransform('brightness')}>Brightness</button>
        <button className="cv-aug-btn" onClick={() => applyTransform('contrast')}>Contrast</button>
        <button className="cv-aug-btn" onClick={() => applyTransform('grayscale')}>Grayscale</button>
        <button className="cv-aug-btn cv-aug-btn-accent" onClick={randomCombo}>Random Combo</button>
        <button className="cv-aug-btn cv-aug-btn-secondary" onClick={resetTransforms}>Reset</button>
      </div>

      <div className="cv-aug-curves">
        <div className="cv-aug-curves-title">Training Curves</div>
        <p className="cv-aug-curves-desc">
          How do we know augmentation works? Compare the gap between training accuracy (how well the model memorizes) and validation accuracy (how well it generalizes to new images). A big gap means the model is overfitting — it learned the training images by heart but can't handle anything new.
        </p>
        <div className="cv-aug-toggle">
          <button className={`cv-toggle-btn${augView === 'without' ? ' cv-toggle-active' : ''}`} onClick={() => setAugView('without')}>No Augmentation</button>
          <button className={`cv-toggle-btn${augView === 'with' ? ' cv-toggle-active' : ''}`} onClick={() => setAugView('with')}>With Augmentation</button>
        </div>
        <div className="cv-aug-chart">
          <div className="cv-aug-chart-inner">
            <div className="cv-aug-axis-label">Accuracy</div>
            <div className="cv-aug-bar-group">
              <div className="cv-aug-bar-pair">
                <div className="cv-aug-bar cv-aug-bar-train" style={{ height: '99%' }}>
                  <span>99%</span>
                </div>
                <div className="cv-aug-bar-label">Train</div>
              </div>
              <div className="cv-aug-bar-pair">
                <div className={`cv-aug-bar cv-aug-bar-val`} style={{ height: augView === 'with' ? '89%' : '73%' }}>
                  <span>{augView === 'with' ? '89%' : '73%'}</span>
                </div>
                <div className="cv-aug-bar-label">Val</div>
              </div>
            </div>
          </div>
          <div className="cv-aug-gap-label">
            Gap: {augView === 'with' ? '10%' : '26%'} {augView === 'with' ? '(healthy)' : '(overfitting!)'}
          </div>
        </div>
      </div>

      <div className="cv-transfer-diagram">
        <div className="cv-transfer-title">Transfer Learning</div>
        <p className="cv-transfer-desc">
          Why train from scratch when someone already trained a model on millions of images? Transfer learning takes a pretrained model (the "backbone"), freezes its learned features — edges, textures, shapes — and only trains a tiny new "head" on your specific task. You get 25 million parameters worth of knowledge for free, and only need to train ~5,000 new ones.
        </p>
        <div className="cv-transfer-flow">
          <div className="cv-transfer-block cv-transfer-frozen">
            <div className="cv-transfer-block-label">Backbone</div>
            <div className="cv-transfer-block-desc">25M params (frozen)</div>
            <div className="cv-transfer-block-detail">Edges, textures, shapes</div>
          </div>
          <div className="cv-transfer-arrow">&rarr;</div>
          <div className="cv-transfer-block cv-transfer-trainable">
            <div className="cv-transfer-block-label">Head</div>
            <div className="cv-transfer-block-desc">5,120 params (trainable)</div>
            <div className="cv-transfer-block-detail">Your classes</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Stage 6: Modern Architectures ── */
function ArchitectureTimelineViz({ active }) {
  const [activeArch, setActiveArch] = useState(null)

  const architectures = [
    {
      id: 'alexnet', year: 2012, name: 'AlexNet',
      innovation: 'First deep CNN to win ImageNet',
      params: '60M', error: '15.3%',
      detail: '8 layers. Used ReLU and dropout. Won ImageNet 2012 by a massive margin.',
    },
    {
      id: 'vgg', year: 2014, name: 'VGG-16',
      innovation: 'Stack of 3×3 convolutions',
      params: '138M', error: '7.3%',
      detail: '16-19 layers. Simple and elegant. Two 3×3 convolutions = same receptive field as one 5×5, but more efficient.',
    },
    {
      id: 'resnet', year: 2015, name: 'ResNet-50',
      innovation: 'Skip connections solve vanishing gradients',
      params: '25M', error: '5.25%',
      detail: 'Add the input directly to the output: output = F(x) + x. Trained 152-layer networks successfully.',
    },
    {
      id: 'efficientnet', year: 2019, name: 'EfficientNet',
      innovation: 'Compound scaling: depth + width + resolution',
      params: '5.3M', error: '2.9%',
      detail: 'Simultaneously scale depth, width, and resolution. 1/10 the parameters of ResNet-50.',
    },
    {
      id: 'vit', year: 2020, name: 'ViT',
      innovation: 'Images as sequences of patches',
      params: '86M', error: '3.5%',
      detail: 'Split image into 16×16 patches. Each patch is a token. Feed to a standard transformer. No convolutions.',
    },
    {
      id: 'clip', year: 2021, name: 'CLIP',
      innovation: 'Vision meets language',
      params: 'varies', error: 'zero-shot',
      detail: 'Train vision + text model together. Zero-shot classification. Foundation of DALL-E and GPT-4V.',
    },
  ]

  return (
    <div className="cv-viz cv-timeline-viz">
      <p className="cv-viz-note">Click any architecture on the timeline to see what made it revolutionary. Each breakthrough solved a problem the previous one could not.</p>
      <div className="cv-timeline">
        <div className="cv-timeline-line" />
        {architectures.map(arch => (
          <div
            key={arch.id}
            className={`cv-timeline-item${activeArch === arch.id ? ' cv-timeline-item-active' : ''}`}
            onClick={() => setActiveArch(activeArch === arch.id ? null : arch.id)}
          >
            <div className={`cv-timeline-node${activeArch === arch.id ? ' cv-timeline-node-active' : ''}`} />
            <div className="cv-timeline-year">{arch.year}</div>
            <div className="cv-timeline-name">{arch.name}</div>
          </div>
        ))}
      </div>

      {activeArch && (() => {
        const arch = architectures.find(a => a.id === activeArch)
        if (!arch) return null
        return (
          <div className="cv-arch-detail how-fade-in">
            <div className="cv-arch-detail-header">
              <strong>{arch.name}</strong> ({arch.year})
            </div>
            <div className="cv-arch-detail-innovation">{arch.innovation}</div>
            <div className="cv-arch-detail-badges">
              <span className="cv-badge">Params: {arch.params}</span>
              <span className="cv-badge">Error: {arch.error}</span>
            </div>
            <p className="cv-arch-detail-text">{arch.detail}</p>
          </div>
        )
      })()}

      <div className="cv-resnet-demo">
        <div className="cv-resnet-title">ResNet Skip Connection</div>
        <p className="cv-resnet-desc">
          Deeper networks should be smarter, right? Not always — after ~20 layers, gradients shrink so much during backpropagation that early layers stop learning. ResNet's fix is simple: add a shortcut that lets the input skip past a block and get added directly to the output. Now gradients have a "highway" to flow through, and networks can be 100+ layers deep.
        </p>
        <div className="cv-resnet-block">
          <div className="cv-resnet-path cv-resnet-learned">
            <div className="cv-resnet-node">Conv</div>
            <div className="cv-resnet-arrow-small">&darr;</div>
            <div className="cv-resnet-node">BN</div>
            <div className="cv-resnet-arrow-small">&darr;</div>
            <div className="cv-resnet-node">ReLU</div>
            <div className="cv-resnet-arrow-small">&darr;</div>
            <div className="cv-resnet-node">Conv</div>
            <div className="cv-resnet-arrow-small">&darr;</div>
            <div className="cv-resnet-node">BN</div>
          </div>
          <div className="cv-resnet-skip">
            <div className="cv-resnet-skip-label">Identity shortcut</div>
            <svg className="cv-resnet-skip-line" viewBox="0 0 40 160" fill="none">
              <path d="M20 0 L20 160" stroke="#5856D6" strokeWidth="2" strokeDasharray="6 4" />
            </svg>
          </div>
          <div className="cv-resnet-add">
            <div className="cv-resnet-plus">+</div>
            <div className="cv-resnet-output">F(x) + x</div>
          </div>
        </div>
        <p className="cv-resnet-note">Even if the learned path has vanishing gradient, the skip path provides a direct gradient highway</p>
      </div>

      <div className="cv-vit-demo">
        <div className="cv-vit-title">ViT: Image as Patch Tokens</div>
        <p className="cv-vit-desc">
          What if we skip convolutions entirely and use a Transformer — the same architecture behind ChatGPT? Vision Transformer (ViT) cuts an image into small patches, treats each patch like a "word," and feeds them into a Transformer. Self-attention lets every patch look at every other patch at once, so the model captures both local details and global context from the start.
        </p>
        <div className="cv-vit-patches">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="cv-vit-patch" style={{ borderColor: ['#5856D6', '#FF9500', '#34C759', '#0071E3'][i] }}>
              <div className="cv-vit-patch-label">Patch {i + 1}</div>
            </div>
          ))}
        </div>
        <div className="cv-vit-flow">
          <span>[Patch tokens]</span>
          <span>&rarr;</span>
          <span>Transformer</span>
          <span>&rarr;</span>
          <span>"cat"</span>
        </div>
      </div>
    </div>
  )
}

/* ── Stage 7: Real-world Applications ── */
function TaskShowcaseViz({ active }) {
  const [activeTask, setActiveTask] = useState(null)
  const [noiseLevel, setNoiseLevel] = useState(0)

  const tasks = [
    {
      id: 'classification', name: 'Classification',
      desc: 'One image → one label',
      model: 'ResNet, EfficientNet, ViT',
      useCase: 'Medical diagnosis, content moderation',
    },
    {
      id: 'detection', name: 'Object Detection',
      desc: 'Find and locate multiple objects',
      model: 'YOLO, Faster R-CNN, DETR',
      useCase: 'Autonomous vehicles, security cameras',
    },
    {
      id: 'segmentation', name: 'Segmentation',
      desc: 'A label for every pixel',
      model: 'U-Net, DeepLab, SegFormer',
      useCase: 'Medical imaging, autonomous driving',
    },
    {
      id: 'instance', name: 'Instance Segmentation',
      desc: 'Distinguish individual instances',
      model: 'Mask R-CNN, SAM',
      useCase: 'Robotics, augmented reality',
    },
  ]

  const applications = [
    { name: 'Face ID', useCase: 'Device authentication', model: 'FaceNet embeddings', challenge: 'Lighting and angles' },
    { name: 'Medical Imaging', useCase: 'Tumour detection in scans', model: 'U-Net + ResNet', challenge: 'Rare conditions, dataset bias' },
    { name: 'Autonomous Vehicles', useCase: 'Real-time scene understanding', model: 'YOLO + depth estimation', challenge: 'Adverse weather, edge cases' },
    { name: 'Google Lens', useCase: 'Image-to-search classification', model: 'CLIP + retrieval', challenge: 'Infinite query diversity' },
    { name: 'Quality Control', useCase: 'Defect detection on production lines', model: 'Custom CNN classifiers', challenge: 'Rare defect types' },
    { name: 'Content Moderation', useCase: 'Detect harmful visual content', model: 'Multi-label classifiers', challenge: 'Cultural context and nuance' },
  ]

  return (
    <div className="cv-viz cv-tasks-viz">
      <p className="cv-viz-note">Click a task to see what models power it. Then explore real applications and the limits of computer vision below.</p>
      <div className="cv-task-panels">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`cv-task-panel${activeTask === task.id ? ' cv-task-panel-active' : ''}`}
            onClick={() => setActiveTask(activeTask === task.id ? null : task.id)}
          >
            <div className="cv-task-panel-icon">
              {task.id === 'classification' && (
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="#5856D6" strokeWidth="1.5"><rect x="8" y="8" width="32" height="32" rx="4" /><rect x="14" y="20" width="20" height="10" rx="3" fill="rgba(88,86,214,0.15)" /><polyline points="18 24 21 27 28 22" strokeWidth="2" /></svg>
              )}
              {task.id === 'detection' && (
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="#5856D6" strokeWidth="1.5"><rect x="8" y="8" width="32" height="32" rx="4" /><rect x="12" y="14" width="18" height="16" rx="2" strokeDasharray="4 2" /></svg>
              )}
              {task.id === 'segmentation' && (
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="#5856D6" strokeWidth="1.5"><rect x="8" y="8" width="32" height="32" rx="4" /><path d="M14 30c4-8 10-12 18-10" fill="rgba(88,86,214,0.2)" /></svg>
              )}
              {task.id === 'instance' && (
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="#5856D6" strokeWidth="1.5"><rect x="8" y="8" width="32" height="32" rx="4" /><circle cx="20" cy="24" r="6" fill="rgba(88,86,214,0.2)" /><circle cx="32" cy="24" r="5" fill="rgba(52,199,89,0.2)" stroke="#34C759" /></svg>
              )}
            </div>
            <div className="cv-task-panel-name">{task.name}</div>
            <div className="cv-task-panel-desc">{task.desc}</div>
            {activeTask === task.id && (
              <div className="cv-task-panel-detail how-fade-in">
                <div className="cv-task-panel-model"><strong>Model:</strong> {task.model}</div>
                <div className="cv-task-panel-use"><strong>Use case:</strong> {task.useCase}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="cv-adversarial">
        <div className="cv-adversarial-title">Adversarial Example Demo</div>
        <div className="cv-adversarial-panels">
          <div className="cv-adversarial-panel">
            <PixelGrid pixels={CAT_PIXELS} className="cv-adversarial-grid" />
            <div className="cv-adversarial-label">Cat: 94%</div>
          </div>
          <div className="cv-adversarial-plus">+</div>
          <div className="cv-adversarial-panel">
            <div className="cv-adversarial-noise">noise ({noiseLevel}%)</div>
          </div>
          <div className="cv-adversarial-equals">=</div>
          <div className="cv-adversarial-panel">
            <div className="cv-adversarial-result">
              {noiseLevel < 15 ? `Cat: ${Math.max(50, 94 - noiseLevel * 2)}%` : `Dog: ${50 + noiseLevel}%`}
            </div>
          </div>
        </div>
        <div className="cv-adversarial-slider-wrap">
          <span>Noise: 0%</span>
          <input
            type="range"
            min="0"
            max="40"
            value={noiseLevel}
            onChange={e => setNoiseLevel(+e.target.value)}
            className="cv-adversarial-slider"
          />
          <span>40%</span>
        </div>
        <p className="cv-adversarial-note">
          {noiseLevel < 15 ? 'Still classified correctly' : 'Model flips to wrong class — noise invisible to humans'}
        </p>
      </div>

      <div className="cv-apps-grid">
        {applications.map(app => (
          <div key={app.name} className="cv-app-card">
            <div className="cv-app-name">{app.name}</div>
            <div className="cv-app-use">{app.useCase}</div>
            <div className="cv-app-challenge">{app.challenge}</div>
          </div>
        ))}
      </div>

      <div className="cv-concept-pills">
        {['Pixels', 'Convolution', 'Feature Maps', 'CNN', 'Transfer Learning', 'ViT', 'Detection', 'Segmentation', 'CLIP'].map((concept, i) => (
          <span key={concept} className="cv-concept-pill" style={{ animationDelay: `${i * 150}ms` }}>
            {concept}
          </span>
        ))}
      </div>
      <p className="cv-concept-summary">You now understand how machines see the world.</p>
    </div>
  )
}


/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */

function ComputerVision({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('computer-vision', -1)
  const [maxStageReached, setMaxStageReached] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [fading, setFading] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const fadeTimerRef = useRef(null)
  const transitionRef = useRef(null)
  const activeStepRef = useRef(null)

  /* ── Stage tracking ── */
  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage])

  /* ── Scroll on stage change ── */
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    window.scrollTo(0, 0)
  }, [stage])

  /* ── Progressive learn tips ── */
  useEffect(() => {
    if (stage === 2 && !dismissedTips.has('stage2')) {
      setLearnTip({ key: 'stage2', text: 'Click the Custom tab and try setting the centre value to 8 and all others to -1 — you just built the classic edge detector' })
    } else if (stage === 5 && !dismissedTips.has('stage5')) {
      setLearnTip({ key: 'stage5', text: 'Click "Random combo" three times and notice how different each augmented cat looks — all of these are treated as different training examples, multiplying your effective dataset size' })
    } else if (stage === 6 && !dismissedTips.has('stage6')) {
      setLearnTip({ key: 'stage6', text: 'Click on ResNet-50 on the timeline, then look at the skip connection diagram — this is the most copied idea in all of deep learning' })
    }
  }, [stage, dismissedTips])

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
      if (transitionRef.current) clearTimeout(transitionRef.current)
    }
  }, [])

  function dismissLearnTip() {
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 300)
  }

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
      if (transitionRef.current) clearTimeout(transitionRef.current)
      transitionRef.current = setTimeout(() => {
        setShowFinal(true)
        setStage(STAGES.length)
        markModuleComplete('computer-vision')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.cv-root')
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
    if (transitionRef.current) clearTimeout(transitionRef.current)
  }

  /* ── Viz components mapped by stage ── */
  const vizComponents = {
    0: <PixelRevealViz active={stage === 0} />,
    1: <ChannelSplitterViz active={stage === 1} />,
    2: <ConvolutionViz active={stage === 2} />,
    3: <FeaturePoolViz active={stage === 3} />,
    4: <CNNPipelineViz active={stage === 4} />,
    5: <AugmentationViz active={stage === 5} />,
    6: <ArchitectureTimelineViz active={stage === 6} />,
    7: <TaskShowcaseViz active={stage === 7} />,
  }

  /* ── Entry Screen ── */
  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="computer-vision" size={48} style={{ color: '#5856D6' }} />}
        title="Computer Vision"
        subtitle="How Machines Learn to See"
        description={<>Your phone unlocks with your face. Doctors find tumours in scans. Self-driving cars read stop signs. All of it runs on the same fundamental idea &mdash; an idea you are about to fully understand, from raw pixels to modern vision AI.</>}
        buttonText="Open Your Eyes"
        onStart={() => { setStage(0); markModuleStarted('computer-vision') }}
      />
    )
  }

  /* ── Quiz ── */
  if (showQuiz) {
    return (
      <Quiz
        questions={computerVisionQuiz}
        tabName="Computer Vision"
        onBack={() => setShowQuiz(false)}
        onStartOver={reset}
        onSwitchTab={onSwitchTab}
        currentModuleId="computer-vision"
      />
    )
  }

  /* ── Final Screen ── */
  if (showFinal) {
    return (
      <div className="how-llms cv-root">
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You now understand Computer Vision!</div>

          {/* pe-final-grid/card are shared toolkit card styles from App.css, used across modules */}
          <div className="pe-final-grid">
            {TOOLKIT_ITEMS.map(item => (
              <div key={item.name} className="pe-final-card">
                <div className="pe-final-card-name">{item.name}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Computer Vision Toolkit</div>
            <table className="pe-reference">
              <thead><tr><th>Concept</th><th>Key Idea</th></tr></thead>
              <tbody>
                {TOOLKIT_ITEMS.map(item => (
                  <tr key={item.name}>
                    <td className="pe-ref-technique">{item.name}</td>
                    <td>{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>Test Your Knowledge &rarr;</button>
            <button className="how-secondary-btn" onClick={reset}>Start over</button>
          </div>

          <SuggestedModules currentModuleId="computer-vision" onSwitchTab={onSwitchTab} />
        </div>
      </div>
    )
  }

  /* ── Main Stage View ── */
  return (
    <div className={`how-llms cv-root${fading ? ' cv-fading' : ''}`}>
      {/* Welcome banner */}
      {showWelcome && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Computer Vision</strong> — this tutorial takes you from a single pixel to modern vision transformers. Every stage uses the same image &mdash; a photo of a cat &mdash; processed in a different way. By the end you will understand exactly how AI sees, what it actually detects, and why it sometimes fails.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>8 stages</strong> from raw pixels to real-world applications</li>
              <li>Drag convolution filters, explore feature maps, and run the CNN pipeline</li>
              <li>At the end, review your <strong>Computer Vision toolkit</strong> and take the quiz</li>
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
          <button className="learn-tip-dismiss" onClick={() => { setDismissedTips(prev => new Set(prev).add(learnTip.key)); dismissLearnTip() }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* Stepper */}
      <div className="how-stepper-wrapper how-fade-in">
        <div className="how-stepper cv-stepper">
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : i + 1}
                    </div>
                    <div className="how-step-label">
                      {s.label}
                      <Tooltip text={STAGE_TOOLTIPS[s.key]} />
                    </div>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={`how-step-arrow${stage > i ? ' how-arrow-active' : ''}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stage content */}
      {stage >= 0 && stage < STAGES.length && (
        <div className="how-stage how-fade-in" key={stage}>
          {/* Info card */}
          <div className="how-info-card how-info-card-edu">
            <div className="how-info-card-header">
              <strong>{EXPLANATIONS[stage].title}</strong>
            </div>
            {EXPLANATIONS[stage].content.split('\n\n').map((para, i) => {
              const lines = para.split('\n')
              const isList = lines.length > 1 && lines.every(l => l.startsWith('- '))
              if (isList) {
                return (
                  <ul key={i} className="cv-bullet-list">
                    {lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}
                  </ul>
                )
              }
              return <p key={i}>{para}</p>
            })}

            {TIP_CONTENT[stage] && (
              <div className="how-info-tip">
                <TipIcon size={16} color="#eab308" />
                {TIP_CONTENT[stage]}
              </div>
            )}

            {/* Warning boxes use semantic #FF9500 orange in both themes — intentional per design system */}
            {WARNING_CONTENT[stage] && (
              <div className="how-info-tip" style={{ background: 'rgba(255, 149, 0, 0.06)', borderLeftColor: '#FF9500' }}>
                <WarningIcon size={16} color="#FF9500" />
                {WARNING_CONTENT[stage]}
              </div>
            )}

            <ToolChips tools={CV_TOOLS[stage]} />
          </div>

          {/* Visualization */}
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
  )
}

export default ComputerVision
