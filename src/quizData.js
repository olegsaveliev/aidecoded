export const tokenizerQuiz = [
  {
    question: 'What is a token in AI language models?',
    options: ['A complete word', 'A roughly 3-4 character chunk of text', 'A single character', 'A sentence'],
    correct: 1,
  },
  {
    question: 'Why do AI models have token limits instead of word limits?',
    options: ['Because words are too complex', 'Because AI processes tokens not words', 'To save memory', "It's just a convention"],
    correct: 1,
  },
  {
    question: 'How many tokens is the word "Supercalifragilistic" approximately?',
    options: ['1 token', '3 tokens', '6-7 tokens', '20 tokens'],
    correct: 2,
  },
  {
    question: 'What tokenizer does GPT-4 use?',
    options: ['WordPiece', 'SentencePiece', 'cl100k_base (tiktoken)', 'BertTokenizer'],
    correct: 2,
  },
  {
    question: 'A common word like "the" is usually how many tokens?',
    options: ['3 tokens', '2 tokens', '1 token', '0 tokens'],
    correct: 2,
  },
  {
    question: 'What happens to spaces in GPT tokenization?',
    options: ['They are removed', 'They are separate tokens', 'They are often included at the start of the next token', 'They count double'],
    correct: 2,
  },
  {
    question: 'GPT-4 can handle up to how many tokens?',
    options: ['4,096 tokens', '32,000 tokens', '128,000 tokens', '1 million tokens'],
    correct: 2,
  },
  {
    question: 'What is the GPT vocabulary size approximately?',
    options: ['1,000 tokens', '10,000 tokens', '50,257 tokens', '1 million tokens'],
    correct: 2,
  },
  {
    question: 'Code compared to plain English is usually:',
    options: ['Much less token efficient', 'More token efficient', 'Exactly the same', 'Impossible to tokenize'],
    correct: 1,
  },
  {
    question: 'An emoji typically costs how many tokens?',
    options: ['0 tokens', '1-2 tokens', '5 tokens', '10 tokens'],
    correct: 1,
  },
]

export const howLLMsWorkQuiz = [
  {
    question: 'What is the first stage when you send a prompt to an LLM?',
    options: ['Embedding', 'Tokenization', 'Attention', 'Generation'],
    correct: 1,
  },
  {
    question: 'What are embeddings?',
    options: ['Images of words', 'Lists of numbers capturing word meaning', 'Audio recordings of text', 'Compressed files'],
    correct: 1,
  },
  {
    question: 'What makes the Transformer architecture revolutionary?',
    options: ['It reads text backwards', 'It looks at all tokens simultaneously', 'It uses images to understand text', 'It memorizes everything'],
    correct: 1,
  },
  {
    question: 'How does an LLM generate its response?',
    options: ['By searching the internet', 'By retrieving stored answers', 'By predicting one token at a time', 'By translating from another language'],
    correct: 2,
  },
  {
    question: 'Similar words in embedding space are:',
    options: ['Far apart', 'Randomly placed', 'Close together', 'On opposite sides'],
    correct: 2,
  },
  {
    question: 'What does "attention" mean in a Transformer?',
    options: ['The model pays attention to humans', 'Tokens focus on relevant other tokens', 'The model alerts users', 'A type of memory storage'],
    correct: 1,
  },
  {
    question: 'How many dimensions does a GPT embedding vector have?',
    options: ['3 dimensions', '100 dimensions', '768-1536 dimensions', '1 million dimensions'],
    correct: 2,
  },
  {
    question: 'Temperature in generation controls:',
    options: ["The model's processing speed", 'The randomness of token selection', 'The length of responses', "The model's memory"],
    correct: 1,
  },
  {
    question: 'What is "greedy decoding"?',
    options: ['Always picking a random token', 'Always picking the highest probability token', 'Picking the longest token', 'Skipping unlikely tokens'],
    correct: 1,
  },
  {
    question: 'What is Top-k sampling?',
    options: ['Only using the top model', 'Limiting selection to k most likely tokens', 'Sampling k sentences', 'A type of attention mechanism'],
    correct: 1,
  },
]

export const modelTrainingQuiz = [
  {
    question: 'What percentage of collected web data typically survives cleaning?',
    options: ['90%', '75%', '40-60%', '10%'],
    correct: 2,
  },
  {
    question: 'How many tokens do modern LLMs typically train on?',
    options: ['1 million tokens', '1 billion tokens', '10-15 trillion tokens', '100 quadrillion tokens'],
    correct: 2,
  },
  {
    question: 'What does SFT stand for?',
    options: ['Simple Fine Testing', 'Supervised Fine-Tuning', 'Sequential Feature Training', 'Standard Foundation Training'],
    correct: 1,
  },
  {
    question: 'What is RLHF?',
    options: ['Rapid Learning from Human Features', 'Reinforcement Learning from Human Feedback', 'Random Learning with High Frequency', 'Recursive Language with Human Functions'],
    correct: 1,
  },
  {
    question: 'Which GPU is most commonly used for LLM training?',
    options: ['AMD RX 7900', 'Intel Arc', 'NVIDIA H100', 'Apple M3 Ultra'],
    correct: 2,
  },
  {
    question: 'What does a reward model do in RLHF?',
    options: ['Gives the AI prizes', 'Scores AI responses based on human preferences', 'Rewards users for good prompts', 'Measures training speed'],
    correct: 1,
  },
  {
    question: 'What is LoRA used for?',
    options: ['Data collection', 'Efficient fine-tuning using low-rank adaptation', 'Tokenization', 'Reward modeling'],
    correct: 1,
  },
  {
    question: 'Which dataset is known as the largest public web crawl?',
    options: ['Wikipedia', 'GitHub', 'Common Crawl', 'ArXiv'],
    correct: 2,
  },
  {
    question: 'Training a frontier AI model typically costs:',
    options: ['$1,000', '$100,000', '$10-100 million', '$1 trillion'],
    correct: 2,
  },
  {
    question: 'Pre-training teaches a model to:',
    options: ['Follow instructions', 'Have conversations', 'Predict the next token', 'Generate images'],
    correct: 2,
  },
]

export const promptEngineeringQuiz = [
  {
    question: 'What is "zero-shot" prompting?',
    options: ['Giving many examples', 'Giving no examples, just instructions', 'Using zero temperature', 'Sending empty prompts'],
    correct: 1,
  },
  {
    question: 'What magic phrase triggers Chain of Thought reasoning?',
    options: ['"Be smart"', '"Use logic"', '"Think step by step"', '"Calculate carefully"'],
    correct: 2,
  },
  {
    question: 'Few-shot prompting works by:',
    options: ['Using fewer words', 'Showing examples before the actual question', 'Asking multiple questions', 'Reducing temperature'],
    correct: 1,
  },
  {
    question: 'Tree of Thoughts differs from Chain of Thought by:',
    options: ['Being faster', 'Exploring multiple reasoning paths', 'Using fewer tokens', 'Only working for math'],
    correct: 1,
  },
  {
    question: 'What is the best formula for a zero-shot prompt?',
    options: ['Question only', 'Role + Task + Format + Context', 'Examples + Question', 'System prompt only'],
    correct: 1,
  },
  {
    question: 'System prompts are:',
    options: ['Visible to all users', 'Hidden configuration instructions for the AI', 'Error messages', 'User interface elements'],
    correct: 1,
  },
  {
    question: 'Prompt chaining is best used for:',
    options: ['Simple one-step tasks', 'Complex multi-step tasks', 'Creative writing only', 'Math problems only'],
    correct: 1,
  },
  {
    question: 'When AI gives bad output, you should:',
    options: ['Switch to a different AI', 'Give up', 'Improve your prompt', 'Restart the conversation'],
    correct: 2,
  },
  {
    question: 'Role prompting works because:',
    options: ['AI has emotions', 'Different roles activate different knowledge patterns', 'It tricks the AI', 'It changes the model'],
    correct: 1,
  },
  {
    question: 'Adding constraints to prompts (word limits, bullet counts):',
    options: ['Limits creativity', 'Helps get more predictable, useful output', 'Makes AI slower', 'Is not recommended'],
    correct: 1,
  },
]

export const contextEngineeringQuiz = [
  {
    question: 'What is a context window?',
    options: ['A browser popup', 'Everything the AI can see when generating a response', 'A type of neural network', 'A prompt template'],
    correct: 1,
  },
  {
    question: 'What happens when the context window is full?',
    options: ['The AI crashes', 'Oldest content gets dropped', 'The response gets shorter', 'Nothing changes'],
    correct: 1,
  },
  {
    question: 'What is "context poisoning"?',
    options: ['A security attack', 'Including bad/contradictory info that confuses the AI', 'Using too many tokens', 'A type of prompt injection'],
    correct: 1,
  },
  {
    question: 'What does RAG stand for?',
    options: ['Random Answer Generation', 'Retrieval Augmented Generation', 'Recursive AI Generation', 'Ranked Answer Grouping'],
    correct: 1,
  },
  {
    question: 'Which model has the largest context window?',
    options: ['GPT-3.5 (16k)', 'GPT-4o (128k)', 'Gemini 1.5 (1M tokens)', 'Claude 3 (200k)'],
    correct: 2,
  },
  {
    question: 'The "Sandwich Method" means:',
    options: ['Breaking context into layers', 'Instructions + Content + Instructions again', 'Alternating user and AI messages', 'Splitting documents in half'],
    correct: 1,
  },
  {
    question: 'What is a vector database used for in RAG?',
    options: ['Storing images', 'Finding semantically similar document chunks', 'Training new models', 'Caching API responses'],
    correct: 1,
  },
  {
    question: 'Why should you NOT paste entire documents into context?',
    options: ['It costs too much', 'Irrelevant content dilutes focus and wastes tokens', "AI can't read long documents", 'It slows down the response'],
    correct: 1,
  },
  {
    question: 'Context refresh every 10 messages helps because:',
    options: ['It saves money', 'It prevents context drift in long conversations', 'It makes AI faster', "It's required by the API"],
    correct: 1,
  },
  {
    question: 'What makes RAG powerful for enterprises?',
    options: ['It trains a new custom model', 'It makes AI know your docs without retraining', 'It reduces API costs to zero', 'It works without an internet connection'],
    correct: 1,
  },
]

export const generationQuiz = [
  {
    question: 'How does an LLM actually generate text?',
    options: ['By copying from training data', 'By predicting one token at a time', 'By translating from code', 'By retrieving stored sentences'],
    correct: 1,
  },
  {
    question: 'What does higher temperature do?',
    options: ['Makes responses faster', 'Makes token selection more random', 'Makes responses longer', 'Makes the model smarter'],
    correct: 1,
  },
  {
    question: 'At temperature = 0, the model always:',
    options: ['Generates random text', 'Refuses to answer', 'Picks the highest probability token', 'Generates very short responses'],
    correct: 2,
  },
  {
    question: 'Top-p = 0.9 means:',
    options: ['Use top 90 tokens', 'Only consider tokens summing to 90% probability', '90% temperature', 'Use 90% of the vocabulary'],
    correct: 1,
  },
  {
    question: 'Why does "The sky is" always predict "blue" first?',
    options: ["It's programmed to", 'Training data heavily associates these words', 'Blue is the default color', "It's alphabetical"],
    correct: 1,
  },
  {
    question: 'What is "greedy" generation?',
    options: ['Generating too much text', 'Always picking the top probability token', 'Using expensive models', 'Caching responses'],
    correct: 1,
  },
  {
    question: 'Streaming in ChatGPT means:',
    options: ['Video content', "Tokens sent and displayed as they're generated", 'Audio output', 'Live internet search'],
    correct: 1,
  },
  {
    question: 'Why does AI sometimes repeat itself in loops?',
    options: ['Bug in the code', 'High temperature', 'A token becomes highest probability repeatedly', 'Too many tokens in context'],
    correct: 2,
  },
  {
    question: 'Top-k = 5 means the model considers:',
    options: ['5% of vocabulary', 'Only 5 possible next tokens', '5 previous tokens', '5 different responses'],
    correct: 1,
  },
  {
    question: 'Which mode lets YOU choose the next token?',
    options: ['Automatic', 'Simulate', 'Manual', 'Random'],
    correct: 2,
  },
]
