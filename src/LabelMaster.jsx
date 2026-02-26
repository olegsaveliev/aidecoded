import { useState, useEffect, useRef, useCallback } from 'react'
import ModuleIcon from './ModuleIcon.jsx'
import SuggestedModules from './SuggestedModules.jsx'
import { TipIcon, WarningIcon, LockIcon, StarIcon } from './ContentIcons.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import './LabelMaster.css'

/* ══════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════ */

const BOX_COLORS = ['#F59E0B', '#5856D6', '#34C759', '#FF3B30', '#3B82F6', '#EC4899', '#06B6D4']

const CANVAS_W = 600
const CANVAS_H = 400

/* ══════════════════════════════════════════
   SVG SCENES — simple geometric illustrations
   ══════════════════════════════════════════ */

function SceneBg({ children, bg }) {
  return (
    <g>
      <rect x="0" y="0" width={CANVAS_W} height={CANVAS_H} fill={bg || 'var(--bg-secondary)'} rx="0" />
      {children}
    </g>
  )
}

/* Cat SVG — large, sitting */
function CatShape({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Body */}
      <ellipse cx="0" cy="30" rx="40" ry="35" fill="#8B7355" stroke="#6B5640" strokeWidth="1.5" />
      {/* Head */}
      <circle cx="0" cy="-15" r="25" fill="#A08060" stroke="#6B5640" strokeWidth="1.5" />
      {/* Left ear */}
      <polygon points="-20,-30 -10,-55 0,-30" fill="#A08060" stroke="#6B5640" strokeWidth="1.5" />
      {/* Right ear */}
      <polygon points="0,-30 10,-55 20,-30" fill="#A08060" stroke="#6B5640" strokeWidth="1.5" />
      {/* Inner ears */}
      <polygon points="-16,-32 -10,-48 -4,-32" fill="#D4A882" />
      <polygon points="4,-32 10,-48 16,-32" fill="#D4A882" />
      {/* Eyes */}
      <ellipse cx="-9" cy="-18" rx="4" ry="5" fill="#FFD700" />
      <ellipse cx="9" cy="-18" rx="4" ry="5" fill="#FFD700" />
      <ellipse cx="-9" cy="-17" rx="2" ry="4" fill="#1a1a1a" />
      <ellipse cx="9" cy="-17" rx="2" ry="4" fill="#1a1a1a" />
      {/* Nose */}
      <polygon points="-3,-8 3,-8 0,-5" fill="#E8A0A0" />
      {/* Whiskers */}
      <line x1="-8" y1="-6" x2="-35" y2="-12" stroke="#6B5640" strokeWidth="1" />
      <line x1="-8" y1="-4" x2="-35" y2="-2" stroke="#6B5640" strokeWidth="1" />
      <line x1="8" y1="-6" x2="35" y2="-12" stroke="#6B5640" strokeWidth="1" />
      <line x1="8" y1="-4" x2="35" y2="-2" stroke="#6B5640" strokeWidth="1" />
      {/* Tail */}
      <path d="M 35,30 Q 65,10 55,-10" fill="none" stroke="#8B7355" strokeWidth="6" strokeLinecap="round" />
      {/* Paws */}
      <ellipse cx="-18" cy="60" rx="10" ry="6" fill="#A08060" stroke="#6B5640" strokeWidth="1" />
      <ellipse cx="18" cy="60" rx="10" ry="6" fill="#A08060" stroke="#6B5640" strokeWidth="1" />
    </g>
  )
}

/* Bird SVG — small, on a branch */
function BirdShape({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Branch */}
      <line x1="-60" y1="20" x2="60" y2="18" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" />
      {/* Leaves */}
      <ellipse cx="-40" cy="14" rx="8" ry="4" fill="#5B8C3A" transform="rotate(-30 -40 14)" />
      <ellipse cx="40" cy="12" rx="8" ry="4" fill="#5B8C3A" transform="rotate(20 40 12)" />
      {/* Body */}
      <ellipse cx="0" cy="5" rx="16" ry="12" fill="#E8453C" stroke="#B33A30" strokeWidth="1" />
      {/* Wing */}
      <ellipse cx="6" cy="4" rx="10" ry="7" fill="#C73B33" />
      {/* Head */}
      <circle cx="-12" cy="-6" r="8" fill="#E8453C" stroke="#B33A30" strokeWidth="1" />
      {/* Eye */}
      <circle cx="-14" cy="-8" r="2" fill="#1a1a1a" />
      <circle cx="-14.5" cy="-8.5" r="0.7" fill="white" />
      {/* Beak */}
      <polygon points="-20,-6 -26,-4 -20,-3" fill="#FF9500" />
      {/* Tail */}
      <polygon points="14,0 28,-6 26,4" fill="#C73B33" />
      {/* Legs */}
      <line x1="-4" y1="16" x2="-6" y2="20" stroke="#666" strokeWidth="1.5" />
      <line x1="4" y1="16" x2="2" y2="20" stroke="#666" strokeWidth="1.5" />
    </g>
  )
}

/* Car SVG */
function CarShape({ x, y, scale = 1, color = '#3B82F6' }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Body lower */}
      <rect x="-50" y="-10" width="100" height="30" rx="4" fill={color} stroke="#1a1a1a" strokeWidth="1.5" />
      {/* Body upper (cabin) */}
      <path d="M-30,-10 L-20,-30 L20,-30 L30,-10" fill={color} stroke="#1a1a1a" strokeWidth="1.5" />
      {/* Windows */}
      <path d="M-26,-10 L-18,-26 L-2,-26 L-2,-10" fill="#B8D4F0" stroke="#1a1a1a" strokeWidth="1" />
      <path d="M2,-10 L2,-26 L18,-26 L26,-10" fill="#B8D4F0" stroke="#1a1a1a" strokeWidth="1" />
      {/* Wheels */}
      <circle cx="-28" cy="20" r="10" fill="#333" stroke="#1a1a1a" strokeWidth="1.5" />
      <circle cx="-28" cy="20" r="5" fill="#666" />
      <circle cx="28" cy="20" r="10" fill="#333" stroke="#1a1a1a" strokeWidth="1.5" />
      <circle cx="28" cy="20" r="5" fill="#666" />
      {/* Headlights */}
      <rect x="44" y="-4" width="6" height="8" rx="2" fill="#FFE066" />
      <rect x="-50" y="-4" width="6" height="8" rx="2" fill="#FF4444" />
    </g>
  )
}

/* Person SVG — stick figure style */
function PersonShape({ x, y, scale = 1, color = '#5856D6' }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Head */}
      <circle cx="0" cy="-30" r="10" fill={color} stroke="#333" strokeWidth="1" />
      {/* Body */}
      <line x1="0" y1="-20" x2="0" y2="10" stroke={color} strokeWidth="4" strokeLinecap="round" />
      {/* Arms */}
      <line x1="0" y1="-10" x2="-18" y2="2" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="0" y1="-10" x2="18" y2="2" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Legs */}
      <line x1="0" y1="10" x2="-12" y2="35" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="0" y1="10" x2="12" y2="35" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

/* Traffic cone */
function ConeShape({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <polygon points="-15,25 15,25 5,-20 -5,-20" fill="#FF6600" stroke="#CC5500" strokeWidth="1.5" />
      <rect x="-18" y="25" width="36" height="5" rx="2" fill="#333" />
      <rect x="-10" y="-5" width="20" height="4" rx="1" fill="white" />
      <rect x="-8" y="8" width="16" height="4" rx="1" fill="white" />
    </g>
  )
}

/* Dog SVG */
function DogShape({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Body */}
      <ellipse cx="0" cy="10" rx="30" ry="20" fill="#D4A055" stroke="#A67B3D" strokeWidth="1.5" />
      {/* Head */}
      <circle cx="-25" cy="-8" r="16" fill="#D4A055" stroke="#A67B3D" strokeWidth="1.5" />
      {/* Ear */}
      <ellipse cx="-35" cy="-16" rx="8" ry="12" fill="#B8863A" stroke="#A67B3D" strokeWidth="1" />
      {/* Eye */}
      <circle cx="-28" cy="-12" r="3" fill="#1a1a1a" />
      <circle cx="-29" cy="-13" r="1" fill="white" />
      {/* Nose */}
      <ellipse cx="-38" cy="-4" rx="4" ry="3" fill="#1a1a1a" />
      {/* Tail */}
      <path d="M 28,0 Q 45,-15 40,-25" fill="none" stroke="#D4A055" strokeWidth="5" strokeLinecap="round" />
      {/* Legs */}
      <rect x="-18" y="25" width="6" height="18" rx="3" fill="#D4A055" stroke="#A67B3D" strokeWidth="1" />
      <rect x="12" y="25" width="6" height="18" rx="3" fill="#D4A055" stroke="#A67B3D" strokeWidth="1" />
    </g>
  )
}

/* Sofa SVG — for occlusion level */
function SofaShape({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <rect x="-60" y="-20" width="120" height="50" rx="6" fill="#6B5B95" stroke="#4A3F6B" strokeWidth="1.5" />
      <rect x="-55" y="-30" width="110" height="15" rx="4" fill="#7B6BA5" stroke="#4A3F6B" strokeWidth="1" />
      <rect x="-65" y="-25" width="15" height="55" rx="4" fill="#7B6BA5" stroke="#4A3F6B" strokeWidth="1" />
      <rect x="50" y="-25" width="15" height="55" rx="4" fill="#7B6BA5" stroke="#4A3F6B" strokeWidth="1" />
      <rect x="-55" y="30" width="12" height="10" rx="2" fill="#4A3F6B" />
      <rect x="43" y="30" width="12" height="10" rx="2" fill="#4A3F6B" />
    </g>
  )
}

/* ── Scene renderers per level ── */

const SCENES = [
  // Level 1: Single cat
  () => (
    <SceneBg bg="var(--bg-secondary)">
      <rect x="0" y="320" width={CANVAS_W} height="80" fill="#C4A96A" opacity="0.3" />
      <rect x="400" y="80" width="100" height="120" rx="4" fill="none" stroke="var(--border)" strokeWidth="1.5" />
      <line x1="450" y1="80" x2="450" y2="200" stroke="var(--border)" strokeWidth="1" />
      <line x1="400" y1="140" x2="500" y2="140" stroke="var(--border)" strokeWidth="1" />
      <CatShape x={260} y={230} scale={1.4} />
    </SceneBg>
  ),
  // Level 2: Bird on a branch
  () => (
    <SceneBg bg="var(--lm-sky)">
      <ellipse cx="120" cy="60" rx="60" ry="25" fill="var(--bg-card)" opacity="0.5" />
      <ellipse cx="500" cy="90" rx="50" ry="20" fill="var(--bg-card)" opacity="0.3" />
      <line x1="350" y1="350" x2="380" y2="150" stroke="#8B6914" strokeWidth="8" strokeLinecap="round" />
      <line x1="380" y1="150" x2="450" y2="100" stroke="#8B6914" strokeWidth="5" strokeLinecap="round" />
      <line x1="380" y1="200" x2="320" y2="170" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="310" cy="165" rx="14" ry="8" fill="#5B8C3A" transform="rotate(-15 310 165)" />
      <BirdShape x={430} y={86} scale={0.9} />
    </SceneBg>
  ),
  // Level 3: Car, person, traffic cone
  () => (
    <SceneBg bg="var(--lm-street)">
      <rect x="0" y="300" width={CANVAS_W} height="100" fill="#888" />
      <line x1="0" y1="350" x2={CANVAS_W} y2="350" stroke="#FFE066" strokeWidth="3" strokeDasharray="20 15" />
      <rect x="0" y="260" width={CANVAS_W} height="40" fill="#A0A0A0" />
      <CarShape x={150} y={310} scale={1.1} />
      <PersonShape x={370} y={270} scale={1.0} />
      <ConeShape x={510} y={310} scale={0.9} />
    </SceneBg>
  ),
  // Level 4: 5 objects — timed
  () => (
    <SceneBg bg="var(--lm-park)">
      <rect x="0" y="320" width={CANVAS_W} height="80" fill="#6B8E4E" opacity="0.3" />
      <rect x="0" y="300" width={CANVAS_W} height="20" fill="#999" />
      <CarShape x={100} y={265} scale={0.8} color="#E74C3C" />
      <CarShape x={470} y={310} scale={0.9} color="#2ECC71" />
      <PersonShape x={250} y={250} scale={0.9} />
      <PersonShape x={340} y={260} scale={0.85} color="#E67E22" />
      <DogShape x={530} y={245} scale={0.7} />
    </SceneBg>
  ),
  // Level 5: Occlusion — cat behind sofa, person at edge
  () => (
    <SceneBg bg="var(--bg-secondary)">
      <rect x="0" y="330" width={CANVAS_W} height="70" fill="#C4A96A" opacity="0.2" />
      <CatShape x={250} y={220} scale={1.2} />
      <SofaShape x={300} y={280} scale={1.1} />
      <PersonShape x={560} y={210} scale={1.1} color="#3B82F6" />
    </SceneBg>
  ),
  // Level 6: Crowded scene — multiple people
  () => (
    <SceneBg bg="var(--lm-crowd)">
      <rect x="0" y="310" width={CANVAS_W} height="90" fill="#999" />
      <PersonShape x={100} y={240} scale={1.0} color="#E74C3C" />
      <PersonShape x={170} y={250} scale={0.95} color="#3B82F6" />
      <PersonShape x={240} y={235} scale={1.05} color="#2ECC71" />
      <PersonShape x={310} y={248} scale={0.9} color="#F59E0B" />
      <PersonShape x={380} y={242} scale={1.0} color="#8B5CF6" />
      <PersonShape x={440} y={255} scale={0.85} color="#EC4899" />
      <PersonShape x={510} y={238} scale={0.95} color="#06B6D4" />
    </SceneBg>
  ),
  // Level 7: Fix labels — same as level 3 scene but with pre-drawn boxes
  () => (
    <SceneBg bg="var(--lm-street)">
      <rect x="0" y="300" width={CANVAS_W} height="100" fill="#888" />
      <line x1="0" y1="350" x2={CANVAS_W} y2="350" stroke="#FFE066" strokeWidth="3" strokeDasharray="20 15" />
      <rect x="0" y="260" width={CANVAS_W} height="40" fill="#A0A0A0" />
      <CarShape x={150} y={310} scale={1.1} />
      <PersonShape x={370} y={270} scale={1.0} />
      <ConeShape x={510} y={310} scale={0.9} />
      <DogShape x={80} y={255} scale={0.65} />
      <CatShape x={460} y={240} scale={0.7} />
    </SceneBg>
  ),
  // Level 8: Segmentation — single cat for polygon
  () => (
    <SceneBg bg="var(--bg-secondary)">
      <rect x="0" y="320" width={CANVAS_W} height="80" fill="#C4A96A" opacity="0.3" />
      <CatShape x={300} y={200} scale={1.6} />
    </SceneBg>
  ),
]

/* ══════════════════════════════════════════
   LEVEL DATA
   ══════════════════════════════════════════ */

const LEVELS = [
  {
    title: 'Single Object, Plenty of Room',
    type: 'bbox',
    targetIou: 0.7,
    timeLimit: null,
    objects: [
      { id: 'cat', label: 'Cat', gt: { x: 180, y: 130, w: 175, h: 190 } },
    ],
    lesson: {
      title: 'Annotation',
      text: 'Every object detection model was trained on images annotated exactly like this. ImageNet (14 million images) was annotated by 49,000 workers over 2.5 years. When you use Google Lens or Tesla Autopilot, you are benefiting from millions of hours of human labelling.',
    },
  },
  {
    title: 'Tight Fit',
    type: 'bbox',
    targetIou: 0.8,
    timeLimit: null,
    objects: [
      { id: 'bird', label: 'Bird', gt: { x: 398, y: 58, w: 70, h: 60 } },
    ],
    lesson: {
      title: 'Intersection over Union (IoU)',
      text: 'IoU measures how well two boxes align. Your box \u2229 ground truth box \u00F7 your box \u222A ground truth box. Perfect overlap: IoU = 1.0. No overlap: IoU = 0.0. The PASCAL VOC benchmark considers IoU \u2265 0.5 a correct detection. MS COCO requires IoU \u2265 0.75.',
    },
  },
  {
    title: 'Multiple Objects',
    type: 'bbox',
    targetIou: 0.7,
    timeLimit: null,
    objects: [
      { id: 'car', label: 'Car', gt: { x: 82, y: 275, w: 140, h: 80 } },
      { id: 'person', label: 'Person', gt: { x: 345, y: 230, w: 55, h: 105 } },
      { id: 'cone', label: 'Cone', gt: { x: 490, y: 278, w: 42, h: 55 } },
    ],
    lesson: {
      title: 'Precision and Recall in Detection',
      text: 'Missed object = false negative (hurts recall). Extra wrong box = false positive (hurts precision). Detection models are evaluated on mAP (mean Average Precision) across all IoU thresholds \u2014 the standard metric for comparing YOLO, Faster R-CNN, DETR and others.',
    },
  },
  {
    title: 'Speed Round',
    type: 'bbox',
    targetIou: 0.7,
    timeLimit: 20,
    objects: [
      { id: 'car1', label: 'Car', gt: { x: 48, y: 240, w: 110, h: 65 } },
      { id: 'car2', label: 'Car', gt: { x: 410, y: 275, w: 120, h: 75 } },
      { id: 'person1', label: 'Person', gt: { x: 225, y: 215, w: 50, h: 95 } },
      { id: 'person2', label: 'Person', gt: { x: 310, y: 222, w: 50, h: 90 } },
      { id: 'dog', label: 'Dog', gt: { x: 498, y: 230, w: 65, h: 55 } },
    ],
    lesson: {
      title: 'Real-Time Detection',
      text: 'YOLO (You Only Look Once) processes the entire image in a single forward pass. No region proposals. No second passes. 30\u201360 FPS on a modern GPU. Tesla Autopilot runs 36 cameras at real-time rates \u2014 processing billions of bounding box predictions per kilometre driven.',
    },
  },
  {
    title: 'Partial Occlusion',
    type: 'bbox',
    targetIou: 0.7,
    timeLimit: null,
    objects: [
      { id: 'cat', label: 'Cat', gt: { x: 185, y: 120, w: 140, h: 185 } },
      { id: 'person', label: 'Person', gt: { x: 530, y: 170, w: 70, h: 140 } },
    ],
    lesson: {
      title: 'Occlusion and Inference',
      text: 'When an object is partially hidden, should the box cover only visible pixels or the full inferred extent? Most annotation guidelines say: box the full object. But annotators disagree. This inconsistency is one reason detection models struggle with occluded objects in production.',
    },
  },
  {
    title: 'Crowded Scene',
    type: 'bbox',
    targetIou: 0.65,
    timeLimit: null,
    objects: [
      { id: 'p1', label: 'Person', gt: { x: 75, y: 200, w: 50, h: 110 } },
      { id: 'p2', label: 'Person', gt: { x: 145, y: 212, w: 50, h: 100 } },
      { id: 'p3', label: 'Person', gt: { x: 212, y: 192, w: 55, h: 115 } },
      { id: 'p4', label: 'Person', gt: { x: 285, y: 210, w: 48, h: 100 } },
      { id: 'p5', label: 'Person', gt: { x: 355, y: 202, w: 50, h: 108 } },
      { id: 'p6', label: 'Person', gt: { x: 415, y: 218, w: 48, h: 95 } },
      { id: 'p7', label: 'Person', gt: { x: 485, y: 198, w: 50, h: 108 } },
    ],
    lesson: {
      title: 'Non-Maximum Suppression (NMS)',
      text: 'Before NMS: every sliding window that looks like a person gets its own bounding box. Result: 50 boxes around one person. NMS keeps only the highest-confidence box when boxes overlap above a threshold (IoU > 0.5). Result: one box per object. NMS has been in YOLO since 2015.',
    },
  },
  {
    title: 'Wrong Label Challenge',
    type: 'fix',
    targetIou: 0.7,
    timeLimit: null,
    objects: [
      { id: 'car', label: 'Car', gt: { x: 82, y: 275, w: 140, h: 80 } },
      { id: 'person', label: 'Person', gt: { x: 345, y: 230, w: 55, h: 105 } },
      { id: 'cone', label: 'Cone', gt: { x: 490, y: 278, w: 42, h: 55 } },
      { id: 'dog', label: 'Dog', gt: { x: 48, y: 235, w: 65, h: 55 } },
      { id: 'cat', label: 'Cat', gt: { x: 420, y: 195, w: 80, h: 85 } },
    ],
    predrawn: [
      { x: 60, y: 260, w: 190, h: 110, label: 'Car', isWrong: true },   // too big
      { x: 345, y: 230, w: 55, h: 105, label: 'Person', isWrong: false }, // correct
      { x: 495, y: 300, w: 30, h: 30, label: 'Cone', isWrong: true },    // too small & offset
      { x: 48, y: 235, w: 65, h: 55, label: 'Dog', isWrong: false },     // correct
      { x: 430, y: 210, w: 55, h: 50, label: 'Cat', isWrong: true },     // too small
    ],
    lesson: {
      title: 'Label Quality',
      text: 'Bad annotations create bad models. A box that is 20% too large teaches the model that the extra background pixels belong to the object. Multiply by 1 million images: systematic labelling errors produce systematic model failures. This is why annotation guidelines run to 50+ pages for serious datasets.',
    },
  },
  {
    title: 'Boss: Segmentation',
    type: 'segment',
    targetIou: 0.6,
    timeLimit: null,
    objects: [
      { id: 'cat', label: 'Cat', gt: [
        { x: 225, y: 100 }, { x: 245, y: 75 }, { x: 260, y: 65 }, { x: 275, y: 60 },
        { x: 290, y: 55 }, { x: 310, y: 60 }, { x: 325, y: 65 }, { x: 340, y: 75 },
        { x: 355, y: 100 }, { x: 370, y: 120 }, { x: 385, y: 140 },
        { x: 400, y: 155 }, { x: 410, y: 140 }, { x: 415, y: 120 },
        { x: 390, y: 170 }, { x: 380, y: 200 }, { x: 375, y: 240 },
        { x: 370, y: 270 }, { x: 365, y: 295 }, { x: 340, y: 310 },
        { x: 310, y: 315 }, { x: 290, y: 315 }, { x: 260, y: 310 },
        { x: 235, y: 295 }, { x: 230, y: 270 }, { x: 225, y: 240 },
        { x: 220, y: 200 }, { x: 215, y: 170 },
      ] },
    ],
    lesson: {
      title: 'Segmentation: The Next Level',
      text: 'Bounding boxes are fast to annotate but lose shape information. Segmentation masks preserve exact boundaries. SAM (Segment Anything Model) from Meta (2023) can segment any object from a single click \u2014 it was trained on 1.1 billion segmentation masks annotated with SAM-assisted human labelling. A feedback loop: AI helps humans annotate, annotations train better AI.',
    },
  },
]

/* ══════════════════════════════════════════
   NMS DEMO DATA
   ══════════════════════════════════════════ */

function generateNmsBoxes(gt) {
  const boxes = []
  gt.forEach(obj => {
    const count = 3 + Math.floor(Math.random() * 4)
    for (let i = 0; i < count; i++) {
      const jx = (Math.random() - 0.5) * 30
      const jy = (Math.random() - 0.5) * 30
      const jw = (Math.random() - 0.5) * 20
      const jh = (Math.random() - 0.5) * 20
      const conf = 0.3 + Math.random() * 0.7
      boxes.push({
        x: obj.gt.x + jx,
        y: obj.gt.y + jy,
        w: obj.gt.w + jw,
        h: obj.gt.h + jh,
        confidence: conf,
        objectId: obj.id,
        suppressed: false,
      })
    }
  })
  return boxes.sort((a, b) => b.confidence - a.confidence)
}

/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */

function calculateIou(box, gt) {
  const x1 = Math.max(box.x, gt.x)
  const y1 = Math.max(box.y, gt.y)
  const x2 = Math.min(box.x + box.w, gt.x + gt.w)
  const y2 = Math.min(box.y + box.h, gt.y + gt.h)
  if (x2 <= x1 || y2 <= y1) return 0
  const inter = (x2 - x1) * (y2 - y1)
  const union = box.w * box.h + gt.w * gt.h - inter
  return union <= 0 ? 0 : inter / union
}

function pointInPolygon(px, py, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y
    const xj = polygon[j].x, yj = polygon[j].y
    const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

function calculatePolygonIou(userPoly, gtPoly) {
  const all = [...userPoly, ...gtPoly]
  const minX = Math.min(...all.map(p => p.x))
  const maxX = Math.max(...all.map(p => p.x))
  const minY = Math.min(...all.map(p => p.y))
  const maxY = Math.max(...all.map(p => p.y))
  const step = 4
  let intersection = 0, union = 0
  for (let x = minX; x <= maxX; x += step) {
    for (let y = minY; y <= maxY; y += step) {
      const inU = pointInPolygon(x, y, userPoly)
      const inG = pointInPolygon(x, y, gtPoly)
      if (inU || inG) union++
      if (inU && inG) intersection++
    }
  }
  return union === 0 ? 0 : intersection / union
}

function getStars(iou) {
  if (iou >= 0.85) return 3
  if (iou >= 0.70) return 2
  if (iou >= 0.50) return 1
  return 0
}

function getIouColor(iou) {
  if (iou >= 0.9) return '#34C759'
  if (iou >= 0.75) return '#F59E0B'
  if (iou >= 0.5) return '#FF9500'
  return '#FF3B30'
}

function getIouLabel(iou) {
  if (iou >= 0.9) return 'Excellent'
  if (iou >= 0.75) return 'Good'
  if (iou >= 0.5) return 'Acceptable'
  return 'Miss'
}

function matchBoxesToGt(boxes, gtObjects) {
  const results = []
  const usedBoxes = new Set()

  gtObjects.forEach(obj => {
    let bestIou = 0
    let bestIdx = -1
    boxes.forEach((box, idx) => {
      if (usedBoxes.has(idx)) return
      const iou = calculateIou(box, obj.gt)
      if (iou > bestIou) { bestIou = iou; bestIdx = idx }
    })
    if (bestIdx >= 0) usedBoxes.add(bestIdx)
    results.push({ object: obj, iou: bestIou, boxIdx: bestIdx })
  })

  return results
}

function scrollToTop() {
  const el = document.querySelector('.lm-container')
  if (el) {
    let p = el.parentElement
    while (p) { if (p.scrollTop > 0) p.scrollTop = 0; p = p.parentElement }
  }
  window.scrollTo(0, 0)
}

/* ══════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════ */

export default function LabelMaster({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [showEntry, setShowEntry] = usePersistedState('label-master-entry', true)

  /* ── Game state ── */
  const [screen, setScreen] = useState('levelSelect')
  const [currentLevel, setCurrentLevel] = useState(0)
  const [levelResults, setLevelResults] = useState(Array(8).fill(null))
  const [highestUnlocked, setHighestUnlocked] = useState(0)

  /* ── Annotation state ── */
  const [boxes, setBoxes] = useState([])
  const [drawing, setDrawing] = useState(null)
  const [polygonPoints, setPolygonPoints] = useState([])
  const [undoStack, setUndoStack] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [matchResults, setMatchResults] = useState(null)
  const [meanIou, setMeanIou] = useState(0)

  /* ── Fix mode (level 7) ── */
  const [fixSelections, setFixSelections] = useState(new Set())
  const [fixRedraws, setFixRedraws] = useState({})
  const [fixDrawing, setFixDrawing] = useState(null)
  const [activeFixIdx, setActiveFixIdx] = useState(-1)

  /* ── Timer (level 4) ── */
  const [timer, setTimer] = useState(null)
  const timerRef = useRef(null)

  /* ── NMS demo ── */
  const [showNms, setShowNms] = useState(false)
  const [nmsBoxes, setNmsBoxes] = useState([])
  const [nmsSuppressedCount, setNmsSuppressedCount] = useState(0)
  const nmsTimerRef = useRef(null)

  /* ── Entry screen animation ── */
  const [visibleLines, setVisibleLines] = useState(0)

  /* ── Refs ── */
  const svgRef = useRef(null)

  /* ── Entry tagline stagger ── */
  useEffect(() => {
    if (!showEntry) return
    const t1 = setTimeout(() => setVisibleLines(1), 300)
    const t2 = setTimeout(() => setVisibleLines(2), 600)
    const t3 = setTimeout(() => setVisibleLines(3), 900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [showEntry])

  /* ── Timer effect ── */
  useEffect(() => {
    if (timer === null || timer <= 0 || submitted) return
    timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [timer, submitted])

  /* auto-submit when time runs out */
  useEffect(() => {
    if (timer === 0 && !submitted) submitLabels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer])

  /* ── SVG coordinate conversion ── */
  const getSvgPoint = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = ((clientX - rect.left) / rect.width) * CANVAS_W
    const y = ((clientY - rect.top) / rect.height) * CANVAS_H
    return {
      x: Math.max(0, Math.min(CANVAS_W, x)),
      y: Math.max(0, Math.min(CANVAS_H, y)),
    }
  }, [])

  /* ── Dismiss entry ── */
  const dismissEntry = useCallback(() => {
    setShowEntry(false)
    markModuleStarted('label-master')
  }, [setShowEntry, markModuleStarted])

  /* ── Start a level ── */
  const startLevel = useCallback((idx) => {
    setCurrentLevel(idx)
    setScreen('game')
    setBoxes([])
    setPolygonPoints([])
    setUndoStack([])
    setSubmitted(false)
    setMatchResults(null)
    setMeanIou(0)
    setFixSelections(new Set())
    setFixRedraws({})
    setFixDrawing(null)
    setActiveFixIdx(-1)
    setDrawing(null)
    setShowNms(false)
    if (LEVELS[idx].timeLimit) {
      setTimer(LEVELS[idx].timeLimit)
    } else {
      setTimer(null)
    }
    scrollToTop()
  }, [])

  /* ══════════════════════════════════
     BBOX DRAWING HANDLERS
     ══════════════════════════════════ */

  const handlePointerDown = useCallback((e) => {
    if (submitted) return
    const level = LEVELS[currentLevel]
    if (level.type === 'segment') {
      // Polygon mode — add point
      const pt = getSvgPoint(e)
      setPolygonPoints(prev => {
        // Close polygon if clicking near first point
        if (prev.length >= 3) {
          const dx = pt.x - prev[0].x
          const dy = pt.y - prev[0].y
          if (Math.sqrt(dx * dx + dy * dy) < 15) {
            return prev // will close on submit
          }
        }
        return [...prev, pt]
      })
      return
    }
    if (level.type === 'fix') {
      if (activeFixIdx < 0) return
      const pt = getSvgPoint(e)
      setFixDrawing({ startX: pt.x, startY: pt.y, currentX: pt.x, currentY: pt.y })
      return
    }
    // Normal bbox drawing
    const pt = getSvgPoint(e)
    setDrawing({ startX: pt.x, startY: pt.y, currentX: pt.x, currentY: pt.y })
  }, [submitted, currentLevel, getSvgPoint, activeFixIdx])

  const handlePointerMove = useCallback((e) => {
    if (submitted) return
    const level = LEVELS[currentLevel]
    if (level.type === 'fix' && fixDrawing) {
      const pt = getSvgPoint(e)
      setFixDrawing(prev => prev ? { ...prev, currentX: pt.x, currentY: pt.y } : null)
      return
    }
    if (!drawing) return
    const pt = getSvgPoint(e)
    setDrawing(prev => prev ? { ...prev, currentX: pt.x, currentY: pt.y } : null)
  }, [submitted, currentLevel, drawing, fixDrawing, getSvgPoint])

  const handlePointerUp = useCallback(() => {
    if (submitted) return
    const level = LEVELS[currentLevel]
    if (level.type === 'fix' && fixDrawing) {
      const x = Math.min(fixDrawing.startX, fixDrawing.currentX)
      const y = Math.min(fixDrawing.startY, fixDrawing.currentY)
      const w = Math.abs(fixDrawing.currentX - fixDrawing.startX)
      const h = Math.abs(fixDrawing.currentY - fixDrawing.startY)
      if (w > 10 && h > 10) {
        setFixRedraws(prev => ({ ...prev, [activeFixIdx]: { x, y, w, h } }))
      }
      setFixDrawing(null)
      setActiveFixIdx(-1)
      return
    }
    if (!drawing) return
    const x = Math.min(drawing.startX, drawing.currentX)
    const y = Math.min(drawing.startY, drawing.currentY)
    const w = Math.abs(drawing.currentX - drawing.startX)
    const h = Math.abs(drawing.currentY - drawing.startY)
    if (w > 10 && h > 10) {
      const newBox = { x, y, w, h, color: BOX_COLORS[boxes.length % BOX_COLORS.length] }
      setUndoStack(prev => [...prev, boxes])
      setBoxes(prev => [...prev, newBox])
    }
    setDrawing(null)
  }, [submitted, currentLevel, drawing, fixDrawing, boxes, activeFixIdx])

  /* ── Delete box ── */
  const deleteBox = useCallback((idx) => {
    setUndoStack(prev => [...prev, boxes])
    setBoxes(prev => prev.filter((_, i) => i !== idx))
  }, [boxes])

  /* ── Undo ── */
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    setBoxes(prev)
    setUndoStack(s => s.slice(0, -1))
  }, [undoStack])

  /* ── Keyboard undo ── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleUndo])

  /* ══════════════════════════════════
     SUBMIT & SCORING
     ══════════════════════════════════ */

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const submitLabels = useCallback(() => {
    if (submitted) return
    setSubmitted(true)
    clearTimeout(timerRef.current)
    const level = LEVELS[currentLevel]

    if (level.type === 'segment') {
      if (polygonPoints.length < 3) {
        setMeanIou(0)
        setMatchResults([{ object: level.objects[0], iou: 0 }])
        return
      }
      const iou = calculatePolygonIou(polygonPoints, level.objects[0].gt)
      setMeanIou(iou)
      setMatchResults([{ object: level.objects[0], iou }])
      return
    }

    if (level.type === 'fix') {
      // Score the fix level
      const finalBoxes = level.predrawn.map((pd, idx) => {
        if (fixRedraws[idx]) return fixRedraws[idx]
        return { x: pd.x, y: pd.y, w: pd.w, h: pd.h }
      })
      const results = level.objects.map((obj, idx) => {
        const iou = calculateIou(finalBoxes[idx], obj.gt)
        return { object: obj, iou }
      })
      const avg = results.reduce((s, r) => s + r.iou, 0) / results.length
      setMeanIou(avg)
      setMatchResults(results)
      return
    }

    // Normal bbox levels
    const results = matchBoxesToGt(boxes, level.objects)
    const avg = results.length > 0 ? results.reduce((s, r) => s + r.iou, 0) / results.length : 0
    let finalIou = avg

    // Time bonus for timed level
    if (level.timeLimit && timer > 0) {
      const timeBonus = 1 + (timer / level.timeLimit) * 0.2
      finalIou = Math.min(1, avg * timeBonus)
    }

    setMeanIou(finalIou)
    setMatchResults(results)
  }, [submitted, currentLevel, boxes, polygonPoints, timer, fixRedraws])

  /* ── Save result & advance ── */
  const saveAndAdvance = useCallback(() => {
    const stars = getStars(meanIou)
    setLevelResults(prev => {
      const next = [...prev]
      if (!next[currentLevel] || stars > next[currentLevel].stars) {
        next[currentLevel] = { stars, iou: meanIou }
      }
      return next
    })
    const nextUnlocked = Math.max(highestUnlocked, currentLevel + 1)
    setHighestUnlocked(nextUnlocked)

    // Show lesson
    setScreen('lesson')
    scrollToTop()
  }, [currentLevel, meanIou, highestUnlocked])

  /* ── After lesson ── */
  const afterLesson = useCallback(() => {
    // Show NMS demo after level 6
    if (currentLevel === 5 && !showNms) {
      const boxes = generateNmsBoxes(LEVELS[5].objects)
      setNmsBoxes(boxes)
      setNmsSuppressedCount(0)
      setShowNms(true)
      setScreen('nmsDemo')
      scrollToTop()
      return
    }

    // Check if all levels done
    if (currentLevel >= 7) {
      markModuleComplete('label-master')
      setScreen('complete')
      scrollToTop()
      return
    }

    setScreen('levelSelect')
    scrollToTop()
  }, [currentLevel, showNms, markModuleComplete])

  /* ── NMS animation ── */
  const runNms = useCallback(() => {
    const kept = new Set()
    const sorted = [...nmsBoxes].sort((a, b) => b.confidence - a.confidence)
    const suppressed = new Set()

    sorted.forEach((box, idx) => {
      if (suppressed.has(idx)) return
      kept.add(idx)
      sorted.forEach((other, jdx) => {
        if (idx === jdx || suppressed.has(jdx) || kept.has(jdx)) return
        const iou = calculateIou(
          { x: box.x, y: box.y, w: box.w, h: box.h },
          { x: other.x, y: other.y, w: other.w, h: other.h }
        )
        if (iou > 0.4) suppressed.add(jdx)
      })
    })

    // Animate suppression one by one
    let delay = 0
    const suppressedArr = [...suppressed]
    suppressedArr.forEach((idx, i) => {
      nmsTimerRef.current = setTimeout(() => {
        setNmsBoxes(prev => prev.map((b, j) => j === idx ? { ...b, suppressed: true } : b))
        setNmsSuppressedCount(i + 1)
      }, delay)
      delay += 120
    })
  }, [nmsBoxes])

  /* cleanup NMS timer */
  useEffect(() => {
    return () => clearTimeout(nmsTimerRef.current)
  }, [])

  /* ── Fix level: toggle selection ── */
  const toggleFixSelection = useCallback((idx) => {
    if (submitted) return
    setFixSelections(prev => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
        setFixRedraws(r => { const n = { ...r }; delete n[idx]; return n })
        setActiveFixIdx(-1)
      } else {
        next.add(idx)
        setActiveFixIdx(idx)
      }
      return next
    })
  }, [submitted])

  /* ── Start over ── */
  const handleStartOver = useCallback(() => {
    setShowEntry(true)
    setScreen('levelSelect')
    setCurrentLevel(0)
    setLevelResults(Array(8).fill(null))
    setHighestUnlocked(0)
    setBoxes([])
    setPolygonPoints([])
    setUndoStack([])
    setSubmitted(false)
    setMatchResults(null)
    setMeanIou(0)
    setTimer(null)
    setShowNms(false)
    setNmsBoxes([])
    setFixSelections(new Set())
    setFixRedraws({})
    setFixDrawing(null)
    setActiveFixIdx(-1)
    setVisibleLines(0)
    clearTimeout(timerRef.current)
    clearTimeout(nmsTimerRef.current)
    scrollToTop()
  }, [setShowEntry])

  /* ══════════════════════════════════
     RENDER: ENTRY SCREEN
     ══════════════════════════════════ */

  if (showEntry) {
    return (
      <div className="lm-container">
        <div className="lm-entry">
          <ModuleIcon module="label-master" size={72} style={{ color: '#F59E0B' }} />
          <h1 className="lm-entry-title">Label Master</h1>
          <div className="lm-taglines">
            <p className={`lm-tagline ${visibleLines >= 1 ? 'visible' : ''}`}>Draw the box.</p>
            <p className={`lm-tagline ${visibleLines >= 2 ? 'visible' : ''}`}>Score on accuracy.</p>
            <p className={`lm-tagline ${visibleLines >= 3 ? 'visible' : ''}`}>Learn how detection works.</p>
          </div>

          <div className="lm-briefing">
            <p>
              You are an AI trainer. Your job: draw bounding boxes around objects in scenes.
              The tighter your box, the higher your IoU score. 8 increasingly difficult levels.
              Miss too many and the AI learns wrong.
              This is exactly what thousands of human labellers do every day to train vision models.
            </p>
          </div>

          <div className="lm-stats-row">
            <span className="lm-stat">8 Levels</span>
            <span className="lm-stat">IoU Scoring</span>
            <span className="lm-stat">Escalating</span>
          </div>

          <button className="lm-start-btn" onClick={dismissEntry}>
            Start Labelling
          </button>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════
     RENDER: LEVEL SELECT
     ══════════════════════════════════ */

  if (screen === 'levelSelect') {
    const totalStars = levelResults.reduce((s, r) => s + (r ? r.stars : 0), 0)
    return (
      <div className="lm-container">
        <div className="lm-level-select">
          <h2 className="lm-section-title">Select Level</h2>
          {totalStars > 0 && (
            <p className="lm-total-stars">
              <StarIcon size={16} color="#F59E0B" /> {totalStars}/24 stars
            </p>
          )}
          <div className="lm-level-path">
            {LEVELS.map((lvl, idx) => {
              const result = levelResults[idx]
              const isLocked = idx > highestUnlocked
              const isCurrent = idx === highestUnlocked && !result
              return (
                <div className="lm-level-path-item" key={idx}>
                  {idx > 0 && (
                    <div className={`lm-level-connector ${result ? 'completed' : ''}`} />
                  )}
                  <button
                    className={`lm-level-node ${result ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => !isLocked && startLevel(idx)}
                    disabled={isLocked}
                    title={lvl.title}
                  >
                    {isLocked ? (
                      <LockIcon size={14} color="var(--text-tertiary)" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </button>
                  {result && (
                    <div className="lm-level-stars">
                      {[1, 2, 3].map(s => (
                        <StarIcon key={s} size={10} color={s <= result.stars ? '#F59E0B' : 'var(--border)'} />
                      ))}
                    </div>
                  )}
                  <span className="lm-level-label">{lvl.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════
     RENDER: GAME
     ══════════════════════════════════ */

  if (screen === 'game') {
    const level = LEVELS[currentLevel]
    const drawRect = drawing ? {
      x: Math.min(drawing.startX, drawing.currentX),
      y: Math.min(drawing.startY, drawing.currentY),
      w: Math.abs(drawing.currentX - drawing.startX),
      h: Math.abs(drawing.currentY - drawing.startY),
    } : null

    const fixDrawRect = fixDrawing ? {
      x: Math.min(fixDrawing.startX, fixDrawing.currentX),
      y: Math.min(fixDrawing.startY, fixDrawing.currentY),
      w: Math.abs(fixDrawing.currentX - fixDrawing.startX),
      h: Math.abs(fixDrawing.currentY - fixDrawing.startY),
    } : null

    return (
      <div className="lm-container">
        <div className="lm-game-header">
          <div className="lm-game-header-left">
            <span className="lm-level-badge">Level {currentLevel + 1}</span>
            <h3 className="lm-level-title">{level.title}</h3>
          </div>
          <div className="lm-game-header-right">
            {timer !== null && (
              <span className={`lm-timer ${timer <= 5 ? 'urgent' : ''}`}>
                {timer}s
              </span>
            )}
            {level.type === 'bbox' && (
              <span className="lm-box-count">
                {boxes.length}/{level.objects.length} boxes
              </span>
            )}
          </div>
        </div>

        {level.type === 'fix' && !submitted && (
          <div className="lm-fix-instructions">
            <WarningIcon size={16} color="#FF9500" />
            <span>Some boxes are wrong. Click a box to mark it, then redraw it.</span>
          </div>
        )}

        {level.type === 'segment' && !submitted && (
          <div className="lm-fix-instructions">
            <TipIcon size={16} color="#eab308" />
            <span>Click around the cat to place polygon points. Click near the first point to close.</span>
          </div>
        )}

        {/* Canvas */}
        <div className="lm-canvas-wrap">
          <svg
            ref={svgRef}
            className="lm-canvas"
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            preserveAspectRatio="xMidYMid meet"
            onMouseDown={!submitted ? handlePointerDown : undefined}
            onMouseMove={!submitted ? handlePointerMove : undefined}
            onMouseUp={!submitted ? handlePointerUp : undefined}
            onTouchStart={!submitted ? handlePointerDown : undefined}
            onTouchMove={!submitted ? handlePointerMove : undefined}
            onTouchEnd={!submitted ? handlePointerUp : undefined}
          >
            {/* Scene */}
            {SCENES[currentLevel]()}

            {/* Pre-drawn boxes for fix level */}
            {level.type === 'fix' && level.predrawn.map((pd, idx) => {
              const redrawn = fixRedraws[idx]
              const box = redrawn || pd
              const isSelected = fixSelections.has(idx)
              return (
                <g key={`fix-${idx}`}>
                  <rect
                    x={box.x} y={box.y} width={box.w} height={box.h}
                    fill={isSelected ? 'rgba(255,59,48,0.1)' : 'rgba(245,158,11,0.08)'}
                    stroke={isSelected ? '#FF3B30' : '#F59E0B'}
                    strokeWidth="2"
                    strokeDasharray={redrawn ? 'none' : '6 3'}
                    style={{ cursor: submitted ? 'default' : 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); if (!submitted) toggleFixSelection(idx) }}
                  />
                  <rect
                    x={box.x} y={box.y - 16} width={pd.label.length * 7 + 12} height={16}
                    rx="3"
                    fill={isSelected ? '#FF3B30' : '#F59E0B'}
                  />
                  <text
                    x={box.x + 6} y={box.y - 4}
                    fill={isSelected ? '#fff' : '#000'}
                    fontSize="10" fontWeight="600" fontFamily="inherit"
                  >
                    {pd.label}
                  </text>
                </g>
              )
            })}

            {/* Fix mode redraw preview */}
            {fixDrawRect && fixDrawRect.w > 5 && fixDrawRect.h > 5 && (
              <rect
                x={fixDrawRect.x} y={fixDrawRect.y}
                width={fixDrawRect.w} height={fixDrawRect.h}
                fill="rgba(52,199,89,0.1)"
                stroke="#34C759"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
            )}

            {/* User bounding boxes */}
            {boxes.map((box, idx) => (
              <g key={`box-${idx}`}>
                <rect
                  x={box.x} y={box.y} width={box.w} height={box.h}
                  fill={`${box.color}14`}
                  stroke={box.color}
                  strokeWidth="2"
                  strokeDasharray="6 3"
                />
                {/* Corner handles */}
                {!submitted && (
                  <>
                    <rect x={box.x - 4} y={box.y - 4} width="8" height="8" fill={box.color} stroke="white" strokeWidth="1" rx="1" />
                    <rect x={box.x + box.w - 4} y={box.y - 4} width="8" height="8" fill={box.color} stroke="white" strokeWidth="1" rx="1" />
                    <rect x={box.x - 4} y={box.y + box.h - 4} width="8" height="8" fill={box.color} stroke="white" strokeWidth="1" rx="1" />
                    <rect x={box.x + box.w - 4} y={box.y + box.h - 4} width="8" height="8" fill={box.color} stroke="white" strokeWidth="1" rx="1" />
                  </>
                )}
                {/* Delete button */}
                {!submitted && (
                  <g
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); deleteBox(idx) }}
                  >
                    <circle cx={box.x + box.w} cy={box.y} r="8" fill="#FF3B30" />
                    <line x1={box.x + box.w - 3} y1={box.y - 3} x2={box.x + box.w + 3} y2={box.y + 3} stroke="white" strokeWidth="1.5" />
                    <line x1={box.x + box.w + 3} y1={box.y - 3} x2={box.x + box.w - 3} y2={box.y + 3} stroke="white" strokeWidth="1.5" />
                  </g>
                )}
              </g>
            ))}

            {/* Drawing preview */}
            {drawRect && drawRect.w > 5 && drawRect.h > 5 && (
              <rect
                x={drawRect.x} y={drawRect.y}
                width={drawRect.w} height={drawRect.h}
                fill="rgba(245,158,11,0.08)"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
            )}

            {/* Polygon points and lines (segmentation) */}
            {level.type === 'segment' && polygonPoints.length > 0 && (
              <>
                <polyline
                  points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill={polygonPoints.length >= 3 ? 'rgba(245,158,11,0.15)' : 'none'}
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                />
                {polygonPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x} cy={pt.y} r="5"
                    fill="#F59E0B" stroke="white" strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </>
            )}

            {/* Ground truth reveal on submit */}
            {submitted && level.type === 'bbox' && matchResults && matchResults.map((r, i) => (
              <g key={`gt-${i}`} className="lm-gt-reveal">
                <rect
                  x={r.object.gt.x} y={r.object.gt.y}
                  width={r.object.gt.w} height={r.object.gt.h}
                  fill="none"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                />
                {/* Intersection highlight */}
                {r.boxIdx >= 0 && (() => {
                  const b = boxes[r.boxIdx]
                  const ix1 = Math.max(b.x, r.object.gt.x)
                  const iy1 = Math.max(b.y, r.object.gt.y)
                  const ix2 = Math.min(b.x + b.w, r.object.gt.x + r.object.gt.w)
                  const iy2 = Math.min(b.y + b.h, r.object.gt.y + r.object.gt.h)
                  if (ix2 > ix1 && iy2 > iy1) {
                    return (
                      <rect
                        x={ix1} y={iy1} width={ix2 - ix1} height={iy2 - iy1}
                        fill="rgba(245,158,11,0.25)"
                      />
                    )
                  }
                  return null
                })()}
              </g>
            ))}

            {/* Ground truth reveal for fix level */}
            {submitted && level.type === 'fix' && level.objects.map((obj, i) => (
              <rect
                key={`gt-fix-${i}`}
                x={obj.gt.x} y={obj.gt.y} width={obj.gt.w} height={obj.gt.h}
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                strokeDasharray="6 3"
                className="lm-gt-reveal"
              />
            ))}

            {/* Ground truth polygon for segmentation */}
            {submitted && level.type === 'segment' && (
              <polygon
                points={level.objects[0].gt.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                strokeDasharray="6 3"
                className="lm-gt-reveal"
              />
            )}
          </svg>
        </div>

        {/* Toolbar */}
        {!submitted && (
          <div className="lm-toolbar">
            <button className="lm-tool-btn" onClick={handleUndo} disabled={undoStack.length === 0}>
              Undo
            </button>
            {level.type === 'segment' && polygonPoints.length >= 3 && (
              <button className="lm-tool-btn" onClick={() => setPolygonPoints([])}>
                Clear Points
              </button>
            )}
            <button
              className="lm-submit-btn"
              onClick={submitLabels}
              disabled={
                (level.type === 'bbox' && boxes.length === 0) ||
                (level.type === 'segment' && polygonPoints.length < 3) ||
                (level.type === 'fix' && fixSelections.size === 0 && Object.keys(fixRedraws).length === 0)
              }
            >
              Submit Labels
            </button>
          </div>
        )}

        {/* Results panel */}
        {submitted && matchResults && (
          <div className="lm-results">
            <div className="lm-iou-display" style={{ color: getIouColor(meanIou) }}>
              IoU: {meanIou.toFixed(2)}
            </div>
            <p className="lm-iou-label" style={{ color: getIouColor(meanIou) }}>
              {getIouLabel(meanIou)}
            </p>

            <div className="lm-stars-display">
              {[1, 2, 3].map(s => (
                <StarIcon key={s} size={28} color={s <= getStars(meanIou) ? '#F59E0B' : 'var(--border)'} />
              ))}
            </div>

            {/* Per-object breakdown */}
            {matchResults.length > 1 && (
              <div className="lm-breakdown">
                {matchResults.map((r, i) => (
                  <div key={i} className="lm-breakdown-row">
                    <span>{r.object.label} box:</span>
                    <span style={{ color: getIouColor(r.iou), fontWeight: 600 }}>
                      {r.iou.toFixed(2)} {r.iou >= 0.7 ? '\u2713' : r.iou >= 0.5 ? '\u25B3' : '\u2717'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="lm-industry-note">
              <TipIcon size={14} color="#eab308" />
              <div className="lm-industry-note-content">
                <strong>Industry IoU thresholds</strong>
                <span><strong>PASCAL VOC</strong> (2005&ndash;2012 benchmark for object detection): IoU &ge; 0.5 = correct detection</span>
                <span><strong>MS COCO</strong> (Microsoft&rsquo;s 330K-image dataset, current standard): IoU &ge; 0.75 = correct detection</span>
                <span><strong>Medical imaging</strong> (tumour segmentation, organ detection): often requires IoU &ge; 0.9</span>
              </div>
            </div>

            {getStars(meanIou) === 0 ? (
              <button className="lm-retry-btn" onClick={() => startLevel(currentLevel)}>
                Retry Level
              </button>
            ) : (
              <button className="lm-next-btn" onClick={saveAndAdvance}>
                Continue &rarr;
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  /* ══════════════════════════════════
     RENDER: LESSON
     ══════════════════════════════════ */

  if (screen === 'lesson') {
    const level = LEVELS[currentLevel]
    return (
      <div className="lm-container">
        <div className="lm-lesson">
          <div className="lm-lesson-card">
            <h3 className="lm-lesson-title">{level.lesson.title}</h3>
            <p className="lm-lesson-text">{level.lesson.text}</p>
          </div>
          <button className="lm-next-btn" onClick={afterLesson}>
            {currentLevel === 5 ? 'See NMS in Action' : currentLevel >= 7 ? 'See Results' : 'Next Level'} &rarr;
          </button>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════
     RENDER: NMS DEMO
     ══════════════════════════════════ */

  if (screen === 'nmsDemo') {
    const totalBoxes = nmsBoxes.length
    const remaining = nmsBoxes.filter(b => !b.suppressed).length
    return (
      <div className="lm-container">
        <div className="lm-nms">
          <h2 className="lm-section-title">What the AI Sees Before NMS</h2>
          <p className="lm-nms-subtitle">
            The model found {totalBoxes} boxes for {LEVELS[5].objects.length} people
          </p>

          <div className="lm-canvas-wrap">
            <svg
              className="lm-canvas"
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {SCENES[5]()}
              {nmsBoxes.map((box, i) => (
                <rect
                  key={i}
                  x={box.x} y={box.y} width={box.w} height={box.h}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1"
                  opacity={box.suppressed ? 0 : box.confidence * 0.8}
                  style={{ transition: 'opacity 0.3s ease, transform 0.3s ease' }}
                />
              ))}
            </svg>
          </div>

          <div className="lm-nms-stats">
            <span>Boxes remaining: <strong>{remaining}</strong> / {totalBoxes}</span>
          </div>

          {nmsSuppressedCount === 0 ? (
            <button className="lm-submit-btn" onClick={runNms}>
              Apply Non-Maximum Suppression
            </button>
          ) : (
            <div className="lm-nms-explanation">
              <p>
                NMS keeps only the highest-confidence box when boxes overlap above a threshold.
                Without NMS: every object gets 10&ndash;50 boxes. With NMS: exactly 1 box per object detected.
                This runs in microseconds during inference.
              </p>
              <button className="lm-next-btn" onClick={afterLesson}>
                Continue &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════
     RENDER: COMPLETION
     ══════════════════════════════════ */

  if (screen === 'complete') {
    const totalStars = levelResults.reduce((s, r) => s + (r ? r.stars : 0), 0)
    const avgIou = levelResults.reduce((s, r) => s + (r ? r.iou : 0), 0) / 8
    const bestLevel = levelResults.reduce((best, r, i) => {
      if (r && (!best || r.iou > best.iou)) return { ...r, level: i }
      return best
    }, null)

    let titleText, descText
    if (totalStars >= 20) {
      titleText = 'Head Annotator'
      descText = 'You understand precision, IoU, and why every pixel placement matters. Real datasets need people exactly like you.'
    } else if (totalStars >= 14) {
      titleText = 'Senior Labeller'
      descText = 'Strong spatial accuracy. A few occlusion and crowd scenes tripped you up \u2014 they trip everyone.'
    } else if (totalStars >= 8) {
      titleText = 'Junior Annotator'
      descText = 'You experienced firsthand why human annotation is hard, expensive, and often inconsistent. That is a more valuable lesson than a perfect score.'
    } else {
      titleText = 'Annotation is Harder Than It Looks'
      descText = 'You discovered the core challenge of supervised learning: getting the ground truth right. Without accurate labels, there is no accurate model.'
    }

    const badgeLevel = avgIou >= 0.85 ? 'Gold' : avgIou >= 0.70 ? 'Silver' : avgIou >= 0.55 ? 'Bronze' : null

    const discoveryPills = [
      'Bounding Boxes', 'IoU', 'Object Detection', 'Occlusion',
      'NMS', 'Segmentation', 'Annotation Quality', 'mAP',
    ]

    return (
      <div className="lm-container">
        <div className="lm-complete">
          <h2 className="lm-complete-title">{titleText}</h2>
          <p className="lm-complete-desc">{descText}</p>

          {/* Star display */}
          <div className="lm-complete-stars">
            <div className="lm-star-row">
              {Array.from({ length: 24 }).map((_, i) => (
                <StarIcon key={i} size={16} color={i < totalStars ? '#F59E0B' : 'var(--border)'} />
              ))}
            </div>
            <p className="lm-star-count">{totalStars}/24 stars</p>
          </div>

          {/* IoU chart */}
          <div className="lm-iou-chart">
            <h3 className="lm-chart-title">IoU Per Level</h3>
            <div className="lm-chart-bars">
              {levelResults.map((r, i) => (
                <div key={i} className="lm-chart-bar-wrap">
                  <div
                    className="lm-chart-bar"
                    style={{
                      height: `${(r ? r.iou : 0) * 100}%`,
                      background: r ? getIouColor(r.iou) : 'var(--border)',
                    }}
                  />
                  <span className="lm-chart-label">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="lm-complete-stats">
            <div className="lm-stat-card">
              <span className="lm-stat-value">{avgIou.toFixed(2)}</span>
              <span className="lm-stat-label">Avg IoU</span>
            </div>
            {bestLevel && (
              <div className="lm-stat-card">
                <span className="lm-stat-value">{bestLevel.iou.toFixed(2)}</span>
                <span className="lm-stat-label">Best (Level {bestLevel.level + 1})</span>
              </div>
            )}
            {badgeLevel && (
              <div className="lm-stat-card">
                <span className="lm-stat-value">{badgeLevel}</span>
                <span className="lm-stat-label">Accuracy Badge</span>
              </div>
            )}
          </div>

          {/* Discovery pills */}
          <div className="lm-pills">
            <h3 className="lm-pills-title">What you discovered</h3>
            <div className="lm-pills-row">
              {discoveryPills.map(p => (
                <span key={p} className="lm-pill">{p}</span>
              ))}
            </div>
          </div>

          <div className="lm-final-card">
            <p>
              The models you use every day &mdash; in your phone camera, in Google Maps, in medical AI
              &mdash; were trained on data annotated by humans doing exactly what you just did.
              The difference between a great model and a mediocre one is often
              the quality of the labels, not the architecture.
            </p>
          </div>

          <div className="lm-final-actions">
            <button className="lm-submit-btn" onClick={() => {
              setScreen('levelSelect')
              scrollToTop()
            }}>
              Play Again
            </button>
            <button className="lm-outline-btn" onClick={onGoHome}>
              Back to Home
            </button>
          </div>

          <SuggestedModules currentModuleId="label-master" onSwitchTab={onSwitchTab} />
        </div>
      </div>
    )
  }

  return null
}
