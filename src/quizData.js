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

export const ragQuiz = [
  {
    question: 'What problem does RAG primarily solve?',
    options: ['Making AI faster', 'Making AI know your specific documents', 'Reducing API costs', 'Improving AI creativity'],
    correct: 1,
  },
  {
    question: 'What does RAG stand for?',
    options: ['Random Answer Generation', 'Retrieval Augmented Generation', 'Recursive AI Generation', 'Rapid Answer Grouping'],
    correct: 1,
  },
  {
    question: 'RAG has two phases. What are they?',
    options: ['Training and Testing', 'Indexing and Querying', 'Encoding and Decoding', 'Loading and Saving'],
    correct: 1,
  },
  {
    question: 'What is the typical chunk size for RAG?',
    options: ['10 tokens', '50,000 tokens', '200-500 tokens', 'Exactly 1 paragraph'],
    correct: 2,
  },
  {
    question: 'Why is vector search better than keyword search for RAG?',
    options: ['It is faster', 'It matches meaning not just exact words', 'It is cheaper', 'It works offline'],
    correct: 1,
  },
  {
    question: 'What is chunk overlap used for?',
    options: ['Saving storage space', 'Preventing context loss at chunk boundaries', 'Improving search speed', 'Reducing embedding costs'],
    correct: 1,
  },
  {
    question: 'Which is NOT a vector database?',
    options: ['Pinecone', 'Weaviate', 'PostgreSQL (standard)', 'Chroma'],
    correct: 2,
  },
  {
    question: 'In RAG, how many chunks are typically retrieved per query?',
    options: ['1 chunk', '3-5 chunks', '50 chunks', 'All chunks'],
    correct: 1,
  },
  {
    question: 'What is ANN search?',
    options: ['Artificial Neural Network search', 'Approximate Nearest Neighbor search', 'Automated Node Navigation', 'Advanced Natural language search'],
    correct: 1,
  },
  {
    question: 'What is the biggest advantage of RAG vs fine-tuning?',
    options: ['RAG is always more accurate', 'RAG requires no model retraining', 'RAG is free', 'RAG works with any language'],
    correct: 1,
  },
]

export const machineLearningQuiz = [
  {
    question: 'What is the key difference between ML and traditional programming?',
    options: ['ML is faster', 'ML learns rules from data instead of being explicitly programmed', 'ML requires more memory', 'ML only works for images'],
    correct: 1,
  },
  {
    question: 'Which type of ML learns from labeled examples?',
    options: ['Unsupervised Learning', 'Reinforcement Learning', 'Supervised Learning', 'Transfer Learning'],
    correct: 2,
  },
  {
    question: 'What is overfitting?',
    options: ['Training for too long', 'Model memorizes training data but fails on new data', 'Using too much data', 'Model is too simple'],
    correct: 1,
  },
  {
    question: 'What percentage of ML project time is typically spent on data?',
    options: ['10%', '30%', '55%', '~80%'],
    correct: 3,
  },
  {
    question: 'Which algorithm is best known for winning tabular data competitions?',
    options: ['Neural Networks', 'Decision Trees', 'XGBoost', 'K-Nearest Neighbors'],
    correct: 2,
  },
  {
    question: 'What is gradient descent?',
    options: ['A type of neural network', 'An optimization algorithm that minimizes error', 'A data cleaning technique', 'A regularization method'],
    correct: 1,
  },
  {
    question: 'What is "data drift"?',
    options: ['Data corruption', 'When real-world data changes making models less accurate', 'Slow data loading', 'Missing data values'],
    correct: 1,
  },
  {
    question: 'Which ML type does RLHF in ChatGPT use?',
    options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Transfer Learning'],
    correct: 2,
  },
  {
    question: 'What is the test set used for?',
    options: ['Training the model', 'Evaluating model on data it has never seen', 'Cleaning data', 'Feature engineering'],
    correct: 1,
  },
  {
    question: 'Deep Learning refers to:',
    options: ['Thorough data analysis', 'Neural networks with many hidden layers', 'Slow training processes', 'Underground data centers'],
    correct: 1,
  },
]

export const fineTuningQuiz = [
  {
    question: 'What is the main advantage of fine-tuning over prompting?',
    options: ['It\'s cheaper', 'More consistent behavior and domain expertise', 'Faster to set up', 'Works without examples'],
    correct: 1,
  },
  {
    question: 'What does LoRA stand for?',
    options: ['Large Output Ranking Algorithm', 'Low-Rank Adaptation', 'Loss Optimization and Regularization', 'Layered Output Reduction Approach'],
    correct: 1,
  },
  {
    question: 'What is the minimum recommended number of training examples?',
    options: ['5', '10', '50-100', '10,000'],
    correct: 2,
  },
  {
    question: 'What is catastrophic forgetting?',
    options: ['Model forgets training data', 'Model loses general knowledge when fine-tuned', 'Training data gets deleted', 'Model forgets the system prompt'],
    correct: 1,
  },
  {
    question: 'LoRA reduces trainable parameters by approximately:',
    options: ['2x', '10x', '100x', '1000x'],
    correct: 2,
  },
  {
    question: 'What is the best approach for frequently changing information?',
    options: ['Fine-tuning', 'Training from scratch', 'RAG', 'Prompting'],
    correct: 2,
  },
  {
    question: 'What is LLM-as-judge evaluation?',
    options: ['A legal AI system', 'Using a powerful LLM to rate another model', 'Human lawyers evaluating AI', 'An automated benchmark'],
    correct: 1,
  },
  {
    question: 'Fine-tuning is most effective for:',
    options: ['Teaching new facts', 'Replacing RAG', 'Consistent style, tone and domain behavior', 'Reducing hallucinations'],
    correct: 2,
  },
  {
    question: 'What is QLoRA?',
    options: ['A type of neural network', 'Quantized LoRA \u2014 more memory efficient', 'A quality evaluation metric', 'A dataset format'],
    correct: 1,
  },
  {
    question: 'When should you train from scratch instead of fine-tuning?',
    options: ['When fine-tuning fails', 'For any specialized domain', 'Truly unique domain and massive budget', 'When you have 1000+ examples'],
    correct: 2,
  },
]

export const deepLearningQuiz = [
  {
    question: 'What makes a neural network "deep"?',
    options: ['It uses a lot of data', 'It has many layers of processing', 'It runs on powerful hardware', 'It uses complex mathematics'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What does an activation function do?',
    options: ['Speeds up training', 'Reduces overfitting', 'Introduces non-linearity', 'Normalizes inputs'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'What is backpropagation?',
    options: ['Running data forward through the network', 'Calculating how each weight contributed to error', 'Adding more layers to the network', 'Reducing the learning rate'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What problem do CNNs solve for images?',
    options: ['Images are too large', 'Pixels have no relationship to each other', 'Features appear at different locations', 'Images have too many colors'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'What was revolutionary about the Transformer?',
    options: ['It used more layers', 'It processed all words simultaneously', 'It used better activation functions', 'It required less training data'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What does dropout do during training?',
    options: ['Removes training examples', 'Randomly disables neurons to prevent overfitting', 'Reduces learning rate automatically', 'Normalizes layer outputs'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What are residual connections?',
    options: ['Connections between different networks', 'Skip connections that add input to output', 'Connections that carry gradients only', 'Links between layers that skip pooling'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What is the vanishing gradient problem?',
    options: ['Gradients become too large in deep networks', 'Gradients shrink to near zero in early layers', 'Loss function stops decreasing', 'Network weights become negative'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What did AlphaFold achieve?',
    options: ['Beat humans at chess', 'Generated realistic images', 'Solved protein structure prediction', 'Translated between 100 languages'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'What is a foundation model?',
    options: ['The first layer of a neural network', 'A model trained on everything, adapted to anything', 'A model used only for research', 'The base architecture before fine-tuning'],
    correct: 1,
    accentColor: '#5856D6',
  },
]

export const agenticAIQuiz = [
  {
    question: 'What is the key difference between a chatbot and an agent?',
    options: ['Agents use better language models', 'Agents take multi-step actions toward goals', 'Agents are faster than chatbots', 'Agents only work with text'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What is the ReAct framework?',
    options: ['A way to build faster neural networks', 'Reason, Act, Observe repeated in a loop', 'A multi-agent communication protocol', 'A memory management system'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What do tools give an agent?',
    options: ['Better language understanding', 'Faster response times', 'Ability to interact with external systems', 'Longer context windows'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'What is the orchestrator in a multi-agent system?',
    options: ['The most powerful LLM in the system', 'The agent that manages and assigns tasks', 'The agent that writes final outputs', 'The quality control agent'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What is the main challenge with agent memory?',
    options: ['Memory is too expensive to implement', 'Balancing context size with information retention', 'Agents cannot store any information', 'Memory only works in cloud systems'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What is episodic memory in agents?',
    options: ['Memory of how to perform tasks', 'Memory stored in vector databases', 'Summaries and records of past sessions', 'The agent\'s current context window'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'Why do multi-agent systems outperform single agents on complex tasks?',
    options: ['They use more computing power', 'Specialists work in parallel on subtasks', 'They have larger context windows', 'They cost less to run'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What does a critic agent do?',
    options: ['Manages the other agents', 'Performs web searches', 'Reviews and improves other agents\' outputs', 'Handles user communication'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'What is computer use in the context of agents?',
    options: ['Using computers to train AI models', 'Agents that control browsers and interfaces', 'AI that designs computer hardware', 'Using multiple computers in parallel'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What do most experts see as the human role in an agentic AI world?',
    options: ['Operating the servers that run agents', 'Writing all the code for agents', 'Judgment, creativity and directing agents', 'Training the underlying models'],
    correct: 2,
    accentColor: '#5856D6',
  },
]

export const generativeAIQuiz = [
  {
    question: 'What distinguishes generative AI from discriminative AI?',
    options: ['It uses more computing power', 'It creates new content rather than classifying existing content', 'It only works with text', 'It requires labeled data'],
    correct: 1,
    accentColor: '#FF9500',
  },
  {
    question: 'What is diffusion in image generation?',
    options: ['Spreading training data across servers', 'Starting from noise and removing it step by step to create images', 'Combining multiple images together', 'Compressing images for faster generation'],
    correct: 1,
    accentColor: '#FF9500',
  },
  {
    question: 'How does autoregressive text generation work?',
    options: ['Generates all tokens simultaneously', 'Predicts one token at a time using all previous context', 'Copies from training data directly', 'Uses a fixed template'],
    correct: 1,
    accentColor: '#FF9500',
  },
  {
    question: 'What does temperature control in text generation?',
    options: ['Processing speed of the model', 'How much memory the model uses', 'The randomness and creativity of outputs', 'The length of generated text'],
    correct: 2,
    accentColor: '#FF9500',
  },
  {
    question: 'What did generative models learn from to generate images?',
    options: ['Mathematical formulas for art', 'Billions of image-caption pairs from the internet', 'Rules programmed by designers', '3D models converted to 2D'],
    correct: 1,
    accentColor: '#FF9500',
  },
  {
    question: 'Why is code generation considered more mature than image generation?',
    options: ['Code is simpler than images', 'Tests provide clear right/wrong feedback signals', 'There is more code than images on the internet', 'Code requires less computing power'],
    correct: 1,
    accentColor: '#FF9500',
  },
  {
    question: 'What is a deepfake?',
    options: ['A very detailed AI-generated image', 'AI-generated realistic fake video or audio of real people', 'A type of image diffusion model', 'A music generation technique'],
    correct: 1,
    accentColor: '#FF9500',
  },
  {
    question: 'What makes video generation harder than image generation?',
    options: ['Videos require more storage', 'Character and physics must stay consistent across many frames', 'Video has more colors than images', 'Training data is harder to collect'],
    correct: 1,
    accentColor: '#FF9500',
  },
  {
    question: 'What is negative prompting in image generation?',
    options: ['Giving the model negative feedback', 'Telling the model what NOT to include in the output', 'Reducing the model temperature', 'Decreasing image resolution'],
    correct: 1,
    accentColor: '#FF9500',
  },
  {
    question: 'What do most experts see as the enduring human value in a world of generative AI?',
    options: ['Faster typing speed', 'Technical knowledge of AI systems', 'Judgment, intention and meaning behind creation', 'The ability to detect AI content'],
    correct: 2,
    accentColor: '#FF9500',
  },
]

export const aiNativePMQuiz = [
  {
    question: 'What do AI engineers actually need from PMs instead of PRDs?',
    options: ['More detailed user stories', 'System instructions and evals', 'Better acceptance criteria', 'More frequent standups'],
    correct: 1,
    accentColor: '#0EA5E9',
  },
  {
    question: 'What is a system instruction?',
    options: ['A technical spec for developers', 'A precise behavioral specification for the AI', 'A user story for AI features', 'A prompt written by engineers'],
    correct: 1,
    accentColor: '#0EA5E9',
  },
  {
    question: 'What are evals?',
    options: ['Performance reviews for the AI team', 'User feedback surveys', 'Measurable test cases for AI behavior', 'Documentation of AI features'],
    correct: 2,
    accentColor: '#0EA5E9',
  },
  {
    question: 'What is structured logic in AI PM work?',
    options: ['Writing code for the AI', 'Explicit IF/THEN rules that define AI behavior', 'The project management methodology', 'The AI model architecture'],
    correct: 1,
    accentColor: '#0EA5E9',
  },
  {
    question: 'What should system instructions include?',
    options: ['Business requirements and KPIs', 'Identity, scope, behavior, constraints, escalation', 'User personas and journey maps', 'Technical architecture decisions'],
    correct: 1,
    accentColor: '#0EA5E9',
  },
  {
    question: 'What are safety evals designed to test?',
    options: ['Performance and speed of AI responses', 'Whether the AI avoids behavior it must never do', 'Grammar and spelling of outputs', 'Response time benchmarks'],
    correct: 1,
    accentColor: '#0EA5E9',
  },
  {
    question: 'What causes model drift?',
    options: ['Too many users accessing the system', 'Model updates, input changes, or prompt changes', 'Running out of API credits', 'Poor system instruction quality'],
    correct: 1,
    accentColor: '#0EA5E9',
  },
  {
    question: 'When should you write evals?',
    options: ['After the AI feature ships', 'During user acceptance testing', 'Before writing system instructions', 'Only when bugs are found'],
    correct: 2,
    accentColor: '#0EA5E9',
  },
  {
    question: 'What is the right response when model drift is detected?',
    options: ['Immediately upgrade to the latest model', 'Rewrite the entire system instruction', 'Revert or fix forward, update evals, document', 'Ask the model provider to fix it'],
    correct: 2,
    accentColor: '#0EA5E9',
  },
  {
    question: 'What is the most important thing that distinguishes AI-native PMs?',
    options: ['They can write code', 'They understand model architectures', 'They produce testable behavioral specifications', 'They have data science backgrounds'],
    correct: 2,
    accentColor: '#0EA5E9',
  },
]

export const aiSafetyQuiz = [
  {
    question: 'Why do language models hallucinate?',
    options: ['They have bugs in their code', 'They predict likely tokens rather than retrieving verified facts', 'They run out of memory', 'Their training data is always wrong'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'What makes a hallucination especially dangerous?',
    options: ['When it happens frequently', 'When the model expresses uncertainty', 'When it is stated with high confidence', 'When it involves technical topics'],
    correct: 2,
    accentColor: '#34C759',
  },
  {
    question: 'What is sycophancy in AI systems?',
    options: ['The model talking about itself too much', 'Agreeing with false premises to please users', 'Repeating the same answer multiple times', 'Refusing to answer difficult questions'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'What does RAG stand for?',
    options: ['Rapid Answer Generation', 'Retrieval Augmented Generation', 'Robust AI Grounding', 'Random Answer Guidance'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'How does grounding reduce hallucinations?',
    options: ['It makes the model slower and more careful', 'It gives the model facts to answer from rather than relying on memory', 'It prevents the model from generating text', 'It checks answers against the internet'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'What is a prompt injection attack?',
    options: ['Adding too many instructions to a prompt', 'Malicious instructions that hijack AI behavior', 'A technique to improve prompt quality', 'Injecting code into AI responses'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'What is the purpose of grounding evals?',
    options: ['Test if the AI is fast enough', 'Check if AI stays within provided context rather than inventing answers', 'Verify the AI uses correct grammar', 'Measure response length'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'What is overreliance in AI safety?',
    options: ['Using AI too frequently', 'Trusting AI output without critical evaluation for consequential decisions', 'Relying on one AI provider only', 'Using AI for tasks it was not designed for'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'When should you run hallucination evals?',
    options: ['Only when launching a new product', 'Once a year during annual reviews', 'Regularly and after any model or prompt changes', 'Only when users report problems'],
    correct: 2,
    accentColor: '#34C759',
  },
  {
    question: 'What is the single best habit for protecting against hallucinations?',
    options: ['Always use the newest AI model', 'Never use AI for important tasks', 'Independently verify AI output for anything consequential', 'Ask the AI to check its own work'],
    correct: 2,
    accentColor: '#34C759',
  },
]

export const aiFluencyQuiz = [
  {
    question: 'What does research show about iterative AI conversations compared to passive ones?',
    options: ['They take much longer to complete', 'They show more than double the fluency behaviors', 'They produce worse results on average', 'They require more technical skill'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'What is the most important habit shift for AI fluency?',
    options: ['Learning more prompt templates', 'Using more powerful AI models', 'Treating responses as drafts to refine', 'Typing longer prompts'],
    correct: 2,
    accentColor: '#34C759',
  },
  {
    question: 'What does "setting the terms" mean in AI collaboration?',
    options: ["Agreeing to the AI provider's terms of service", 'Telling AI how you want it to work with you', 'Setting a budget for AI usage', 'Defining the output length upfront'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'What happens to critical evaluation when AI produces polished-looking outputs?',
    options: ['It increases because output quality is higher', 'It stays the same regardless of output format', 'It decreases even though it matters more', 'It becomes automatic and effortless'],
    correct: 2,
    accentColor: '#34C759',
  },
  {
    question: 'What is the context equation in AI fluency?',
    options: ['More tokens always means better output', 'Vague context leads to vague output', 'Context only matters for long tasks', 'Less context keeps AI more creative'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'What is the thinking partner approach?',
    options: ['Having two people work with AI together', 'Sharing your reasoning and thinking out loud rather than just asking questions', 'Using AI to complete tasks independently', 'Setting up a multi-agent system'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'How should trust in AI outputs be calibrated?',
    options: ['Never trust AI for anything important', 'Always trust AI for everything', 'By the consequence of being wrong on the specific task', 'By how confident the AI sounds'],
    correct: 2,
    accentColor: '#34C759',
  },
  {
    question: 'What are high-trust AI tasks?',
    options: ['Legal and medical advice', 'Specific statistics and citations', 'Brainstorming and internal first drafts', 'Production code and published content'],
    correct: 2,
    accentColor: '#34C759',
  },
  {
    question: 'How does AI fluency compound over time?',
    options: ['It does not \u2014 habits stay separate', 'Each fluency habit reinforces and improves the others', 'Only the most recent habit matters', 'It requires constant effort to maintain'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'What is the recommended approach for building AI fluency quickly?',
    options: ['Practice all five habits simultaneously', 'Take a formal AI certification course', 'Pick one habit and make it automatic before adding the next', 'Use AI for every task without exception'],
    correct: 2,
    accentColor: '#34C759',
  },
]

export const precisionRecallQuiz = [
  {
    question: 'A model classifies 1000 emails. 10 are spam. It labels everything as "not spam." What is its accuracy?',
    options: ['0%', '1%', '99%', '50%'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'What does a True Positive mean?',
    options: ['The model correctly predicted the negative class', 'The model incorrectly flagged a legitimate item', 'The model correctly identified a positive case', 'The model missed a positive case'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'A spam filter flags 50 emails as spam. 40 of them were actually spam. 10 were legitimate. What is its precision?',
    options: ['40%', '80%', '50%', '20%'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'There are 50 actual spam emails. The model catches 40 of them and misses 10. What is recall?',
    options: ['40%', '50%', '80%', '20%'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'What does a False Negative represent?',
    options: ['Correctly identifying a legitimate item', 'Incorrectly flagging a legitimate item as positive', 'A positive case the model missed', 'Correctly identifying a spam email'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'You raise the detection threshold from 50% to 90%. What happens?',
    options: ['Both precision and recall increase', 'Precision increases, recall decreases', 'Recall increases, precision decreases', 'Neither precision nor recall changes'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'Why does F1 use harmonic mean instead of regular average?',
    options: ['It is easier to calculate', 'It punishes extreme imbalance between precision and recall', 'It gives more weight to precision', 'It works better on large datasets'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'A cancer screening model has precision 95% and recall 30%. What should you optimise?',
    options: ['Precision — it is already high', 'Recall — missing cancer is catastrophic', 'F1 — balance both equally', 'Accuracy — most patients are healthy'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What does FP stand for and what does it mean?',
    options: ['Final Positive — the last positive prediction', 'False Positive — model predicted positive but it was actually negative', 'False Positive — model missed a positive case', 'Forced Positive — threshold was forced high'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'When is optimising for F1 score most appropriate?',
    options: ['When false positives are much more costly', 'When false negatives are much more costly', 'When the dataset is perfectly balanced', 'When both precision and recall matter roughly equally'],
    correct: 3,
    accentColor: '#5856D6',
  },
]

export const ragUnderTheHoodQuiz = [
  {
    question: 'What is the most common reason RAG fails in production when it worked in demos?',
    options: ['The LLM model is not powerful enough', 'Pipeline failures in chunking and metadata', 'The vector database is too slow', 'The embedding dimensions are too small'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What problem does fixed-size chunking cause?',
    options: ['Chunks are too large to embed efficiently', 'Content is split mid-sentence destroying context', 'Too many chunks are created slowing retrieval', 'Metadata cannot be attached to fixed chunks'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What is the purpose of chunk overlap?',
    options: ['Reduce the total number of chunks stored', 'Make embeddings more accurate', 'Ensure content at boundaries appears in both adjacent chunks', 'Speed up retrieval at query time'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'Why does metadata prevent outdated documents from being retrieved?',
    options: ['Metadata makes embeddings more accurate', 'It allows filtering by date and status before semantic search runs', 'It reduces the size of the vector database', 'It improves the embedding model quality'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What is the sweet spot chunk size for most document types?',
    options: ['50\u2013100 tokens', '300\u2013500 tokens', '1000\u20132000 tokens', 'Chunk size does not affect retrieval quality'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'Why does hybrid search outperform semantic-only retrieval?',
    options: ['It is faster than vector search alone', 'It combines meaning-based and exact-term matching to handle both synonyms and abbreviations', 'It requires less metadata to work correctly', 'It uses smaller embedding dimensions'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What does a reranker do in the retrieval pipeline?',
    options: ['Splits documents into better chunks', 'Generates metadata for retrieved documents', 'Re-scores retrieved candidates for more precise final selection', 'Filters documents before vector search'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'What is the main benefit of metadata pre-filtering before semantic search?',
    options: ['It improves embedding quality', 'It reduces search space and noise, improving speed and relevance', 'It eliminates the need for a reranker', 'It allows larger chunk sizes to be used'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'Which metadata fields are considered the minimum for production RAG?',
    options: ['Only the source filename', 'Source, date, section, department, and status', 'Embedding dimension and model name', 'Chunk size and overlap percentage'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What is the recommended order for fixing RAG pipeline layers?',
    options: ['Filtering first, then embeddings, then chunking', 'Embeddings first since they affect all other layers', 'Chunking and metadata first, then retrieval, then filtering', 'The order does not matter \u2014 fix whichever is easiest'],
    correct: 2,
    accentColor: '#5856D6',
  },
]

export const aiInProductionQuiz = [
  {
    question: 'Why do AI features fail silently in production?',
    options: ['AI models have more bugs than traditional software', 'Wrong answers do not generate errors or exceptions like traditional failures', 'AI features are never tested before shipping', 'Production traffic is too high for AI to handle'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What does LLM-as-judge mean in AI monitoring?',
    options: ['Using a human lawyer to review AI outputs', 'Using a separate LLM to evaluate the quality of another LLM\'s responses', 'A benchmark test run before deployment', 'A legal compliance review of AI outputs'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'Why should you track P99 latency rather than just average latency?',
    options: ['P99 is easier to calculate than average', 'Average latency is always misleading', 'P99 shows the worst real user experiences that averages hide', 'P99 latency determines your AI model cost'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'What is data drift in AI production?',
    options: ['The model weights changing over time', 'Your knowledge base becoming stale while the AI keeps answering from old information', 'User data being lost from the database', 'Training data being deleted after deployment'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What is the shadow testing pattern?',
    options: ['Deploying to production after midnight', 'Running new version in parallel with production without serving its answers to users', 'Testing only with internal employees', 'Copying production data to a test environment'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What is the canary deployment pattern for AI?',
    options: ['Deploying to users named in your canary group', 'Rolling out to a small percentage of traffic and monitoring before expanding', 'Testing the AI with bird-related questions', 'Deploying to the cheapest infrastructure first'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'Why is alert fatigue dangerous in production?',
    options: ['Too many alerts slow down the monitoring system', 'Engineers start ignoring all alerts including the important ones', 'Alerts are expensive to send at high volume', 'Alert fatigue only affects junior engineers'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What triggers a regression alert in AI monitoring?',
    options: ['The AI giving a wrong answer to one query', 'User satisfaction dropping below 4 stars', 'Eval suite scores dropping significantly compared to the previous run', 'Response latency exceeding 1 second'],
    correct: 2,
    accentColor: '#5856D6',
  },
  {
    question: 'What is model drift?',
    options: ['The model becoming smarter over time', 'Changes in underlying LLM behavior due to provider updates, affecting your prompts', 'The model forgetting previous conversations', 'Model weights drifting during fine-tuning'],
    correct: 1,
    accentColor: '#5856D6',
  },
  {
    question: 'What is the recommended order for building an AI production observability stack?',
    options: ['Build everything before launch or do not launch', 'Start with complex anomaly detection first', 'User signals and cost tracking first, then evals, then drift detection, then A/B', 'A/B testing infrastructure must come first'],
    correct: 2,
    accentColor: '#5856D6',
  },
]

export const choosingAIModelQuiz = [
  {
    question: 'What is the most useful question to ask when choosing an AI model?',
    options: ['Which model scores highest on MMLU?', 'Which company has the best reputation?', 'Which model is the right fit for this task, budget, and constraints?', 'Which model was released most recently?'],
    correct: 2,
    accentColor: '#34C759',
  },
  {
    question: 'What does context window refer to in AI models?',
    options: ['The visual interface of the AI chatbot', 'How much text the model can see and reason over at once', 'The training data size of the model', 'The number of languages the model supports'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'Llama 4 Scout has a 10 million token context window. What is its main advantage over closed models?',
    options: ['It has better reasoning than all closed models', 'It is always faster than closed API models', 'It can be self-hosted with no API costs and data stays on your infrastructure', 'It is supported by all major cloud providers'],
    correct: 2,
    accentColor: '#34C759',
  },
  {
    question: 'What is benchmark contamination?',
    options: ['When a model produces harmful outputs', 'When training data includes test questions, inflating benchmark scores', 'When different benchmarks disagree', 'When providers use outdated test sets'],
    correct: 1,
    accentColor: '#34C759',
  },
  {
    question: 'Which model family is currently best known for coding and agentic software tasks?',
    options: ['Grok (xAI) \u2014 real-time information strength', 'DeepSeek \u2014 cost optimization focus', 'Claude (Anthropic) \u2014 SWE-bench leader, stable long-running agent behavior', 'Gemini Flash \u2014 speed and throughput focus'],
    correct: 2,
    accentColor: '#34C759',
  },
  {
    question: 'What is the hybrid routing strategy?',
    options: ['Using two models from the same provider', 'Routing all queries to the frontier model for maximum quality', 'Classifying queries by complexity and sending them to appropriately-priced models', 'Switching models every month as new ones launch'],
    correct: 2,
    accentColor: '#34C759',
  },
  {
    question: 'DeepSeek V3.2 costs approximately $0.27 per million input tokens. GPT-5.2 Pro costs approximately $21 per million. What does this price difference mean for a high-volume app?',
    options: ['GPT-5.2 is always worth the premium cost', 'DeepSeek is always better \u2014 ignore expensive models', 'For the right high-volume tasks DeepSeek can save 70-90% with near-equivalent quality', 'The price difference means DeepSeek is lower quality across all tasks'],
    correct: 2,
    accentColor: '#34C759',
  },
  {
    question: 'What should you do before committing to a model for production?',
    options: ['Trust the provider\'s benchmark claims', 'Use whatever model is currently #1 on the LMArena leaderboard', 'Build an eval suite from your real use case and test candidate models on it', 'Choose the most expensive model available'],
    correct: 2,
    accentColor: '#34C759',
  },
  {
    question: 'Which model has the largest context window as of early 2026?',
    options: ['GPT-5.2 (400K tokens)', 'Claude Opus 4.5 (200K tokens)', 'Gemini 3 Pro (1M tokens)', 'Llama 4 Scout (10M tokens)'],
    correct: 3,
    accentColor: '#34C759',
  },
  {
    question: 'How often should you re-evaluate your model selection in a production application?',
    options: ['Never \u2014 switching models is too risky', 'Only when your model is deprecated', 'Approximately quarterly, checking for new models, price drops and eval changes', 'Every week to stay current with benchmarks'],
    correct: 2,
    accentColor: '#34C759',
  },
]
