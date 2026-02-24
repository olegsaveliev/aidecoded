/* Shared module metadata for cross-module suggestions (quiz end screen, etc.) */

const ALL_MODULES = [
  { id: 'playground', title: 'Playground', description: 'Chat directly with AI and experiment with parameters in real time', tag: 'Interactive', tagColor: '#0071E3' },
  { id: 'tokenizer', title: 'Tokenizer', description: 'See exactly how AI reads your text — broken into tokens in real time', tag: 'Visual', tagColor: '#AF52DE' },
  { id: 'generation', title: 'Token Generation', description: 'Watch AI predict the next word live — Manual or Simulate', tag: 'Interactive', tagColor: '#0071E3' },
  { id: 'how-llms-work', title: 'How LLMs Work', description: 'An interactive 5-stage journey from your prompt to the AI response', tag: 'Journey', tagColor: '#FF9500' },
  { id: 'model-training', title: 'Model Training', description: 'Discover how AI models like ChatGPT are built from scratch — data to deployment', tag: 'Journey', tagColor: '#FF9500' },
  { id: 'prompt-engineering', title: 'Prompt Engineering', description: 'Learn how to write better prompts and get dramatically better results from any AI', tag: 'Practical', tagColor: '#34C759' },
  { id: 'context-engineering', title: 'Context Engineering', description: 'Learn how to give AI the right context to get dramatically better results every time', tag: 'Practical', tagColor: '#34C759' },
  { id: 'rag', title: 'RAG', description: 'How AI learns from YOUR documents — Retrieval Augmented Generation explained', tag: 'Journey', tagColor: '#FF9500' },
  { id: 'agentic-ai', title: 'Agentic AI', description: 'AI that plans, acts and learns on its own — understand the systems changing what AI can do', tag: 'Technical', tagColor: '#5856D6' },
  { id: 'machine-learning', title: 'Machine Learning', description: 'How machines actually learn from data — the foundation of all modern AI', tag: 'Technical', tagColor: '#5856D6' },
  { id: 'deep-learning', title: 'Deep Learning', description: 'Discover the neural networks powering every AI breakthrough — from image recognition to ChatGPT', tag: 'Technical', tagColor: '#5856D6' },
  { id: 'fine-tuning', title: 'Fine-Tuning', description: 'Turn a general-purpose AI into a domain expert trained on your specific data and style', tag: 'Technical', tagColor: '#5856D6' },
  { id: 'generative-ai', title: 'Generative AI', description: 'From noise to masterpiece — discover how AI creates images, music, video, code and text that never existed before', tag: 'Journey', tagColor: '#FF9500' },
  { id: 'ai-lab-explorer', title: 'AI Lab Explorer', description: 'Walk through an AI research lab. Unlock each room by completing hands-on challenges.', tag: 'Game', tagColor: '#F59E0B' },
  { id: 'prompt-heist', title: 'Prompt Heist', description: 'Craft the perfect prompt to outsmart AI security systems and pull off 5 legendary heists.', tag: 'Game', tagColor: '#F59E0B' },
  { id: 'token-budget', title: 'Token Budget', description: 'Rewrite prompts to fit strict token limits without losing quality. Real API cost thinking through play.', tag: 'Game', tagColor: '#F59E0B' },
  { id: 'ai-ethics-tribunal', title: 'AI Ethics Tribunal', description: 'Preside over real-world AI dilemmas. Weigh the arguments. Deliver your verdict. No easy answers.', tag: 'Game', tagColor: '#F59E0B' },
  { id: 'pm-simulator', title: 'PM Simulator', description: 'You are the PM. Write system instructions, design evals, fix hallucinations. Ship the AI feature — or watch it fail.', tag: 'Game', tagColor: '#F59E0B' },
  { id: 'ai-native-pm', title: 'AI-Native PM', description: 'The deliverables AI engineers actually need from PMs — system instructions, evals, and structured logic.', tag: 'Professional', tagColor: '#0EA5E9' },
  { id: 'ai-safety', title: 'AI Safety & Hallucinations', description: 'Why AI confidently makes things up — and the practical techniques that stop it.', tag: 'Practical', tagColor: '#34C759' },
  { id: 'ai-fluency', title: 'AI Fluency', description: 'The collaboration habits that separate AI power users from passive ones — backed by real research.', tag: 'Practical', tagColor: '#34C759' },
  { id: 'ai-startup-simulator', title: 'AI Startup Simulator', description: 'You just got funded. Build vs buy, RAG vs fine-tune, which data to collect. Make the right calls or watch your startup fail.', tag: 'Game', tagColor: '#F59E0B' },
  { id: 'precision-recall', title: 'Precision & Recall', description: 'Why accuracy is a lie and what to measure instead. Master TP, TN, FP, FN, precision, recall and F1 through interactive real-world scenarios.', tag: 'Technical', tagColor: '#5856D6' },
  { id: 'rag-under-the-hood', title: 'Why RAG Fails', description: 'Your RAG works in the demo and breaks in production. Learn exactly why — chunking, metadata, retrieval, filtering — and how to fix each layer.', tag: 'Technical', tagColor: '#5856D6' },
  { id: 'ai-in-production', title: 'AI in Production', description: 'Shipping an AI feature is the beginning, not the end. Learn how to monitor quality, measure latency, track cost, detect drift and know when your AI is silently failing.', tag: 'Technical', tagColor: '#5856D6' },
]

export function getRandomModules(excludeId, count = 3) {
  const others = ALL_MODULES.filter((m) => m.id !== excludeId)
  const shuffled = others.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default ALL_MODULES
