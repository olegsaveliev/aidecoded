# LLM Playground

An interactive React app for exploring how Large Language Models work. Includes a tokenizer visualizer, real-time text generation with OpenAI's API, word embedding maps, and a model training overview.

## Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

## Run locally

```bash
# Clone the repo
git clone <your-repo-url>
cd LLMPlayground

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key

# Start the dev server
npm run dev
```

## Environment variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key (required for generation and embedding features) |

Create a `.env` file in the project root (see `.env.example`).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In the Vercel project settings, add the environment variable:
   - `OPENAI_API_KEY` = your OpenAI API key
4. Deploy. Vercel will auto-detect Vite and use the settings from `vercel.json`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
