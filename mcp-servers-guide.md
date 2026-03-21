# GitHub Copilot CLI & MCP Servers Guide

This guide outlines the best Model Context Protocol (MCP) servers tailored for your work on the **VibeHealth** project (Angular, TypeScript, Frontend/Backend), alongside general favorites, and step-by-step instructions on how to add them to the GitHub Copilot CLI.
## 🌟 Best MCP Servers Based on Your Stack

Given your focus on frontend design implementation (Angular, Tailwind), backend testing, and project roadmapping, these servers will supercharge your workflow:

### 1. Puppeteer / Playwright (Browser Automation)
- **Why you need it:** You can ask Copilot to open your local Angular dev server (e.g., `http://localhost:4200`), capture screenshots, evaluate Tailwind layouts, or debug console errors directly. This is extremely helpful for your "pixel-perfect frontend design implementation".
- **Executable:** `npx -y @modelcontextprotocol/server-puppeteer`

### 2. PostgreSQL / SQLite (Database Interactions)
- **Why you need it:** As you're working on "Backend Tests" and managing user health data, this server allows Copilot to query your database sequentially. You can ask Copilot to "show me the schema for the vitals tracking table" or "write a query to find missing health checks."
- **Executable:** `npx -y @modelcontextprotocol/server-postgres <database-url>`

### 3. Fetch (Web & API Interaction)
- **Why you need it:** Perfect for testing out your backend endpoints during development or fetching external API schemas. You can tell Copilot, "call this local API endpoint and write a test based on the JSON response."
- **Executable:** `npx -y @modelcontextprotocol/server-fetch`

### 4. GitHub (Repository Management)
- **Why you need it:** While sometimes built-in, extending or specifically configuring GitHub capabilities allows Copilot to read your project's issues, fetch pull requests, or review PR comments without leaving the terminal.
- **Executable:** `npx -y @modelcontextprotocol/server-github`

---

## 🚀 Specific Framework & Tool Integrations (Your Stack)

Beyond the general tools, here is exactly how your specific frameworks interact with the MCP ecosystem:

### 1. Prisma (Official)
- **Status:** **Available**. 
- **What it does:** Prisma has an official MCP server. It allows Copilot to read your schema safely, generate migrations directly from natural language prompts, and run queries without exposing credentials.
- **Executable:** `npx -y @prisma/mcp`

### 2. Tailwind CSS
- **Status:** **Available**.
- **What it does:** The `tailwindcss-mcp-server` provides AI access to Tailwind utilities, documentation, and can even help generate pre-styled component templates directly in your IDE.
- **Executable:** `npx -y tailwindcss-mcp-server`

### 3. Motion.dev
- **Status:** **Available (Community)**.
- **What it does:** Feeds Motion.dev's complex offline documentation directly into the AI, enabling Copilot to generate production-ready, highly-complex animation code for your React/Vue/JS components on the first try.

### 4. Zod
- **Status:** **Available**.
- **What it does:** Provides a documentation MCP server, so whether you're configuring validation in external tests or managing the runtime schemas, your AI can pull up the latest TypeScript syntax combinations.

### 5. Angular
- **Status:** **Experimental**.
- **What it does:** The Angular team is actively building MCP support into the Angular CLI. Soon, you will be able to have Copilot natively query your `angular.json` workspace and the latest Angular 17+ best practices docs simultaneously.

### 6. Bun & Hono
- **Status:** **Runtimes & SDKs**.
- **What they do:** Rather than standalone servers, they power the ecosystem. Bun is heavily used as an ultra-fast runtime (via `bunx`) to execute MCP servers. Hono provides an official `@hono/mcp` package that developers use natively to build high-performance streaming MCP servers.

### 7. Better-Auth & Lottie
- **Status:** **Not Currently Available**.
- **Alternative:** For now, utilizing the **Fetch** or **Brave Search** MCP server is the best way to pull in their specific documentation directly into Copilot.

---

## 🌎 General Best-in-Class MCP Servers

If you want to expand your capabilities further, these are currently community favorites:

1. **Brave Search:** (`npx -y @modelcontextprotocol/server-brave-search`) Gives Copilot the ability to search the live web. Perfect for looking up the latest Angular documentation or specific medical/health standard updates.
2. **Google Drive:** (`npx -y @modelcontextprotocol/server-gdrive`) Excellent for reading roadmap documents, feature suggestions, or Vidal articles directly into your coding context.
3. **Memory / Knowledge Graph:** (`npx -y @modelcontextprotocol/server-memory`) Allows the AI to persist knowledge across sessions—great for keeping track of your complex app architecture and varied roadmaps.

---

## 🛠️ How to Add MCP Servers to GitHub Copilot CLI

GitHub Copilot CLI natively supports adding MCP servers to allow your AI to execute these tools.

### Method 1: The Interactive CLI (Recommended)

1. Open your terminal and start Copilot in interactive mode:
   ```bash
   copilot
   ```
2. Inside the Copilot session, type the add command:
   ```bash
   /mcp add
   ```
3. **Follow the interactive prompts:**
   - **Server Name:** Give it a clear name (e.g., `puppeteer-server`).
   - **Server Type:** Choose the type of connection (usually you run local npx scripts).
   - **Command:** Specify the command to run (e.g., `npx -y @modelcontextprotocol/server-puppeteer`).
4. Press `Ctrl + S` (or `Cmd + S`) to save your configuration.

### Method 2: Manual Configuration File

If you prefer to configure everything at once, you can edit the JSON configuration file directly. 

1. Edit the Copilot MCP configuration file.
   - For repository-specific servers: Create or edit `.copilot/mcp-config.json` in the root of your `VibeHealth` project.
   - For global servers: Edit `~/.copilot/mcp-config.json` (or your Windows equivalent in your user directory).
2. Add the servers following the standard configuration structure:

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/vibehealth"]
    }
  }
}
```

Once saved, restart your Copilot CLI, and the new MCP tools will automatically be registered and ready for you to use!
