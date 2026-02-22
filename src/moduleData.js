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
  { id: 'machine-learning', title: 'Machine Learning', description: 'How machines actually learn from data — the foundation of all modern AI', tag: 'Technical', tagColor: '#5856D6' },
  { id: 'fine-tuning', title: 'Fine-Tuning', description: 'Turn a general-purpose AI into a domain expert trained on your specific data and style', tag: 'Technical', tagColor: '#5856D6' },
  { id: 'ai-lab-explorer', title: 'AI Lab Explorer', description: 'Walk through an AI research lab. Unlock each room by completing hands-on challenges.', tag: 'Game', tagColor: '#F59E0B' },
]

export function getRandomModules(excludeId, count = 3) {
  const others = ALL_MODULES.filter((m) => m.id !== excludeId)
  const shuffled = others.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default ALL_MODULES
