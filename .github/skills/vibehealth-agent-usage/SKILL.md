---
name: vibehealth-agent-usage
description: Agent usage guide. Use this for vibehealth-agent-usage related tasks.
---

# Agent Usage — Loading VibeHealth Skill Files

This document explains how to make the `.github/.vibehealth` skill files the primary context for AI agents and humans using three common interfaces:
- GitHub Copilot CLI (terminal-based Copilot agent)
- Antigravity (agent orchestrator)
- GitHub Copilot Chat (VS Code / GitHub)

File created here: `.github/.vibehealth/agent-usage.md`

---

## 1. Principles (applies to all tools)

- Load the master skill first: `.github/.vibehealth/SKILL.md`.
- Load only required subskills next (frontend.md, backend.md, design.md, testing.md, prompts.md) to avoid token overload.
- Use the deep references (`.github/.angular/*`, `.github/.hono/*`, `.github/.gsap/*`) only when you need framework-level details.
- Verify the agent by asking it to list loaded files and summarize key conventions.

---

## 2. GitHub Copilot CLI (interactive)

Recommended workflow (prompt-driven):

1. Open Copilot CLI in the repo root (start an interactive session).
2. Paste this prompt to load and set session context:

```
Load and index the following repository files as the session's canonical style guide and conventions, then confirm what was loaded:
- .github/copilot-instructions.md
- .github/.vibehealth/SKILL.md
- .github/.vibehealth/frontend.md
- .github/.vibehealth/backend.md
- .github/.vibehealth/design.md
- README.md

After loading, provide a 3-line summary of conventions and list any file names you could not load.
```

3. Ask follow-up tasks normally; the CLI will reference the indexed files. For a specific task, include: "Follow SKILL.md conventions".

Notes:
- If the CLI supports a `load-file` or `context` command, prefer that to pasting large content.
- Keep load sets minimal per session; reload different subskills per task (frontend vs backend).

---

## 3. Antigravity (agent orchestrator)

Antigravity-style agents often accept a config file / manifest to autoload context files. Example config snippet (JSON):

```json
{
  "autoload": [
    ".github/.vibehealth/SKILL.md",
    ".github/.vibehealth/frontend.md",
    ".github/.vibehealth/backend.md",
    ".github/copilot-instructions.md"
  ],
  "index": {
    "enabled": true,
    "patterns": [".github/.vibehealth/**/*.md", "README.md"]
  }
}
```

Usage:
- Save this as `.antigravity.json` at the repo root or provide it to the agent when starting.
- Start the agent with `antigravity start --config .antigravity.json` (or use the GUI config to point to the file list).
- The orchestrator should index the files, store them as the initial context, and attach them to every spawned worker/agent by default.

If Antigravity has a plugin for your LLM runtime, configure the plugin's `documentIndex` with the same file list.

---

## 4. GitHub Copilot Chat (VS Code / GitHub web)

Copilot Chat can accept repo context or uploaded files. Two practical approaches:

A. Manual prompt-based (universal)

Open Copilot Chat and send this instruction:

```
Please read and index the following repository docs as the canonical VibeHealth style and rules for this chat session:
- .github/.vibehealth/SKILL.md
- .github/.vibehealth/frontend.md
- .github/copilot-instructions.md
- README.md

Confirm loaded and summarize the main conventions in three bullets.
```

B. Use the "Add files" or "Include repo context" feature (if available)

- Use the UI to attach the `.github/.vibehealth/*` files or specify path filters (e.g., `.github/.vibehealth/**`).
- Then ask Copilot Chat to "Use these docs as the project style guide".

---

## 5. Verifying the load (all tools)

After loading, ask the agent a simple verification prompt:

```
List the top 5 conventions you loaded from SKILL.md (one per line) and confirm the file names you indexed.
```

Expected reply example:
- "Standalone Angular components > signals; OnPush; input()/output(); inject()..."
- Then a list of loaded file paths.

If anything is missing, re-run the load with only the missing files.

---

## 6. CI / Automation (optional)

To create a single index artifact that agents can fetch (useful for reproducible sessions), add a lightweight GitHub Action that concatenates skill docs and uploads them as an artifact. Example (workflow snippet):

```yaml
name: Build LLM Context
on: [push, workflow_dispatch]
jobs:
  build-context:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Concatenate skill docs
        run: |
          mkdir -p .artifacts/llm
          cat .github/.vibehealth/SKILL.md .github/.vibehealth/*.md > .artifacts/llm/llm_context.md || true
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: llm-context
          path: .artifacts/llm/llm_context.md
```

Agents that support pulling artifacts from GitHub Actions can fetch `llm-context` and use it as the canonical context.

---

## 7. Best practices & tips

- Always load `SKILL.md` first then subskills — this reduces contradictions.
- Avoid loading all large `llms-full.txt` files at once — load them on demand.
- Keep prompts explicit: e.g., "Follow SKILL.md conventions for naming, testing, and i18n." 
- Use the verification step after any load.
- If the agent supports persistence, store the file list rather than raw content.

---

## 8. Quick example prompts

- Copilot CLI: `Load SKILL.md + frontend.md, summarize conventions, then run: "Add autocomplete to onboarding"`
- Antigravity config: provide `.antigravity.json` and start the agent; ask: "Index skill docs and run `lint` on frontend`".
- Copilot Chat: `Please index SKILL.md and frontend.md; when ready, propose a small PR to add date-picker improvements.`

---

If any of these tools need a specific config file (e.g., `.antigravity.json`) or a special startup flag, copy the JSON snippet above into that tool's config and point the agent at it.

*File created: `.github/.vibehealth/agent-usage.md`*
