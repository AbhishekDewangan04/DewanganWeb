# ⚡ DewanganWeb — Private AI Search Engine

**DewanganWeb** is a high-performance, zero-tracking, private AI search engine designed with a sleek glassmorphic aesthetic (inspired by Arc and Perplexity). It combines live meta-search capabilities via SearXNG with an AI synthesis engine to deliver structured answers with inline citations, interactive knowledge graphs, and multi-stage deep research.

---

## ✨ Core Features

* **🕵️ Off-The-Record Incognito Mode:** Toggle complete privacy with zero query logging, zero `localStorage` persistence, and bypassed backend history storage.
* **⚡ Live Web Synthesis:** Synthesizes live web results into structured answers complete with inline markdown citations (`[1]`, `[2]`), source favicons, domain badges, and key takeaways.
* **🔍 Multi-Mode Search:** Dedicated search filters for **Web**, **Deep Research**, **Academic**, **Code**, and **Media**.
* **🧠 Multi-Stage Deep Research Agent:** Animated status pipeline displaying real-time research progress ("Scanning repositories" → "Synthesizing dossier") generating deep markdown reports.
* **🕸️ Interactive Knowledge Graph:** 2D/Canvas node network visualizer mapping relationships between search queries, sub-topics, and cited evidence.
* **🔒 Private Device Vault:** Local search history vault with fuzzy search filtering, category tagging, and pin-to-top collection cards.
* **🎨 Atmospheric Glassmorphic UI:** Centered radial cyan spotlight background, smooth sidebar collapse layout transitions, and full-width glass bottom navigation.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React 18 + Vite
* **Routing:** TanStack Router (file-based routing)
* **Styling:** Tailwind CSS + Framer Motion
* **Typography:** Plus Jakarta Sans & Inter
* **Icons:** Lucide React

### **Backend**
* **Server:** Node.js + Express (`:5000`)
* **Meta-Search Engine:** SearXNG (`:8080` via Docker)
* **Persistence:** Local JSON Vault (`backend/data/vault.json`)
* **API Proxy:** Vite Dev Proxy (`:5173` → `:5000`)

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Docker Desktop](https://www.docker.com/) (for running SearXNG)

---

### 2. Run SearXNG Meta-Search Container
Launch SearXNG locally in Docker to handle anonymous multi-source web search requests:

```bash
docker run -d -p 8080:8080 -e "SEARXNG_BASE_URL=http://localhost:8080/" searxng/searxng
