# How to Release a New Module

Step-by-step guide for hiding and releasing modules via Supabase.

---

## How It Works

- A Supabase table called `module_releases` controls which modules are visible
- Modules **without** a row in the table are **visible by default**
- A row with `released = false` **hides** the module everywhere (nav, home, landing canvas, suggestions, deep links)
- Setting `released = true` (or deleting the row) makes the module **visible again**
- Changes take effect on page refresh — no redeployment needed

---

## Before First Use (One-Time Setup)

The `module_releases` table should already exist. If not, run this SQL in the Supabase SQL Editor:

```sql
create table module_releases (
  module_id text primary key,
  released boolean not null default true,
  created_at timestamptz default now()
);

alter table module_releases enable row level security;

create policy "Anyone can read module releases"
  on module_releases for select using (true);
```

---

## Step-by-Step: Hide a Module Before Release

Use this when you've built and deployed a module but aren't ready to show it to users yet.

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Table Editor** in the left sidebar
4. Select the `module_releases` table
5. Click **Insert row** (top right)
6. Fill in:
   - `module_id`: the module's tab ID (e.g., `spec-driven-dev`)
   - `released`: `false`
   - `created_at`: leave as default (auto-fills)
7. Click **Save**

The module will be hidden on the next page load.

---

## Step-by-Step: Release a Hidden Module

When you're ready to make the module visible to users:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) > Table Editor > `module_releases`
2. Find the row for your module
3. Click the `released` cell
4. Change `false` to `true`
5. Click **Save** (or press Enter)

The module will appear on the next page load.

**Alternative:** You can also delete the row entirely — modules without a row default to visible.

---

## Module IDs Reference

These are the `module_id` values to use in the table. Copy the exact ID — it must match exactly.

### Tools
| Module | ID |
|---|---|
| Playground | `playground` |
| Tokenizer | `tokenizer` |
| Token Generation | `generation` |

### Foundations
| Module | ID |
|---|---|
| How LLMs Work | `how-llms-work` |
| Model Training | `model-training` |
| Machine Learning | `machine-learning` |
| Neural Networks | `neural-networks` |
| Computer Vision | `computer-vision` |
| Precision & Recall | `precision-recall` |
| Deep Learning | `deep-learning` |
| Fine-Tuning | `fine-tuning` |
| Generative AI | `generative-ai` |

### Skills
| Module | ID |
|---|---|
| Prompt Engineering | `prompt-engineering` |
| Context Engineering | `context-engineering` |
| AI Safety & Hallucinations | `ai-safety` |
| AI Fluency | `ai-fluency` |
| Choosing the Right AI Model | `choosing-ai-model` |
| Run AI Locally | `ollama` |
| Claude Code | `claude-code` |
| Spec-Driven Development | `spec-driven-dev` |

### Advanced
| Module | ID |
|---|---|
| RAG | `rag` |
| Agentic AI | `agentic-ai` |
| Agent Teams | `agent-teams` |
| Custom Agents | `custom-agents` |
| Why RAG Fails | `rag-under-the-hood` |
| AI in Production | `ai-in-production` |

### Play (Games)
| Module | ID |
|---|---|
| AI City Builder | `ai-city-builder` |
| AI Lab Explorer | `ai-lab-explorer` |
| Prompt Heist | `prompt-heist` |
| Token Budget | `token-budget` |
| AI Ethics Tribunal | `ai-ethics-tribunal` |
| PM Simulator | `pm-simulator` |
| AI Startup Simulator | `ai-startup-simulator` |
| The Alignment Game | `alignment-game` |
| Label Master | `label-master` |
| Draw & Deceive | `draw-and-deceive` |
| Agent Office | `agent-office` |
| Model Training Tycoon | `model-training-tycoon` |

### Professional
| Module | ID |
|---|---|
| AI-Native PM | `ai-native-pm` |

---

## Quick SQL Alternatives

If you prefer SQL over the Table Editor UI:

**Hide a module:**
```sql
insert into module_releases (module_id, released) values ('your-module-id', false);
```

**Release a module:**
```sql
update module_releases set released = true where module_id = 'your-module-id';
```

**Check what's currently hidden:**
```sql
select * from module_releases where released = false;
```

**See all rows:**
```sql
select * from module_releases;
```

---

## What Gets Hidden

When a module has `released = false`, it disappears from:

- Navigation dropdown (desktop + mobile)
- Home screen cards
- Landing page neural network canvas
- "What to learn next" suggestions (quiz end + final screens)
- Deep link access (`/?tab=module-id` redirects to home)
- JSON-LD structured data
- User profile stats (badge thresholds adjust automatically)

The module's code is still deployed — it just can't be reached through any UI path.

---

## Typical Workflow for a New Module

1. Build the module on a feature branch
2. Before merging, insert a row: `insert into module_releases (module_id, released) values ('new-module-id', false)`
3. Merge and deploy — module is live in code but invisible to users
4. Test on production by temporarily setting `released = true`, verify everything works, set back to `false`
5. When ready for launch: set `released = true` in the Table Editor
6. Module appears for all users on their next page load
