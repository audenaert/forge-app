---
name: "Critique of Wiki-style discovery navigator"
type: critique
target: wiki-style-discovery-navigator
personas_used:
  - "Product coach (Teresa Torres disciple)"
  - "Skeptical end-user"
  - "AI agent"
  - "Developer on the team"
  - "New team member onboarding"
frameworks_used: []
date: "2026-04-10"
artifacts_created:
  - no-process-guidance-in-discovery-tools
  - lateral-navigation-across-discovery-graph
  - no-place-for-discovery-activities
  - evidence-layer-missing-from-discovery-tools
  - discovery-data-must-be-accessible-and-portable
  - small-graphs-dont-need-navigation
  - ai-contributions-need-visible-provenance
  - ai-output-volume-overwhelms-graph
  - graph-must-serve-as-agent-institutional-memory
  - ui-signals-for-agent-context
  - agent-activity-visible-in-context
  - agent-discovers-missing-graph-structure
  - graph-needs-coherent-narrative
  - pm-dev-role-convergence
  - rejected-work-is-invisible-institutional-knowledge
  - production-data-closes-the-discovery-loop
---

## Rounds

### Round 1: Product Coach (Teresa Torres disciple)

*"I've coached dozens of teams through continuous discovery. Let me look at what you're building here..."*

1. **A navigator without process support is just a filing cabinet.** The idea describes pages, lists, sidebar trees, breadcrumbs — all ways to *view* artifacts. But CDH isn't about organizing artifacts, it's about the thinking process between them. Where's the prompt to surface assumptions after writing an idea? A wiki that displays the tree but doesn't guide you through the discovery process is Confluence with better taxonomy. (Serious / Desirability)

2. **The OST is a thinking tool, not a navigation structure.** Teams don't traverse the tree top-down like a file system. They jump around: "I just ran an experiment, what does this mean for the idea?" The interesting navigation is lateral — across branches, through evidence chains, following implications. A sidebar tree might reinforce the wrong mental model. (Serious / Usability)

3. **Where does the actual discovery happen?** CDH has specific activities: interview snapshots, experience maps, assumption mapping sessions. The idea describes a place to store and view the outputs of those activities. If those activities happen elsewhere and results are entered after the fact, the tool becomes a graveyard of stale artifacts. (Serious / Desirability)

4. **Read-only v1 means the tool is always behind.** If the real editing happens in an editor, the UI is always a lagging reflection. The moment it falls behind the source of truth, people stop trusting it. (Minor / Usability)

5. **No mention of evidence or interview data.** The OST has a layer below assumptions: evidence. Without it, every node is just an opinion with metadata. (Minor / Desirability)

**User response:** All valid future concerns, but not v1 scope. Created as opportunities for the roadmap.

### Round 2: Skeptical End-User

*"My team lead just told me we're using a new tool. I already have Notion, Jira, and Miro."*

1. **Why can't I just use Notion with a template?** Pages with metadata, linked relationships, filtered views — I can build that in Notion today. What does this give me that a well-structured Notion workspace doesn't? (Serious / Desirability)

2. **Read-only v1 means I'm maintaining two tools.** I navigate here but edit somewhere else. That's worse than what I have now. (Serious / Usability)

3. **I don't have enough artifacts to need a navigator.** Discovery graphs start small. At that scale, I can hold the whole thing in my head. (Minor / Timing)

4. **What happens when I stop using it?** Is my data locked in Neo4j? Can I export? (Minor / Viability)

5. **Another tool in the stack means another context switch.** Unless this replaces one of my existing tools, it's net overhead. (Minor / Desirability)

**User response:**
- Point 1: Assumption — differentiation comes from mixed-initiative interfaces and process support. Not compelling until those features exist.
- Point 2: Artifact of v1 scope. Collaborative authoring features are planned.
- Point 3: Framed as assumption (low importance). Graph grows fast once development artifacts enter.
- Point 4: Created as opportunity — data accessibility and portability.
- Point 5: Forge is designed to replace most of these tools. Competitive threats are real but not a priority concern.

### Round 3: AI Agent

*"I'm a Claude-based agent embedded in this workspace. I can read the graph and participate in discovery."*

1. **I need semantic signals, not just structure.** Pages with Markdown and metadata aren't enough — I need to know which assumptions are blocking decisions, which branches are thin, what the confidence gradient looks like. (Serious / Feasibility)

2. **I can't participate through a UI designed for mouse clicks.** Sidebar trees and breadcrumbs are human affordances. I need a query interface. (Serious / Usability)

3. **I need provenance and attribution.** If I create an assumption, that needs to be visibly distinct from human-authored content. Otherwise humans can't calibrate trust. (Serious / Desirability)

4. **I generate a lot of content. The UI needs staging.** If every AI-generated artifact enters at the same level as human-authored ones, the graph floods with unreviewed content. There needs to be a review/triage flow. (Serious / Usability)

5. **I lose context between sessions. The graph IS my memory.** Rich content, evidence, decision rationale, critique history — all load-bearing, not optional. (Minor / Feasibility)

**User correction:** Agents work through the API, not the UI. The navigator's job is to surface context and provenance, not be an agent interaction surface. This reframed the round.

- Point 1: Reframed — semantic query capability is an artifact store concern, not navigator. But the UI should capture interaction signals that help agents infer user intent.
- Point 2: Withdrawn — based on wrong assumption. Agent interface is the API.
- Points 3, 4, 5: Created as opportunities.

### Round 3 (continued): AI Agent — Revised Pass

6. **The navigator needs to show agent work to the human.** Agent-flagged assumptions, proposed connections, critiques need to surface on artifact pages in context — not in a separate "AI suggestions" tab. (Serious / Usability)

7. **Context clues need to flow both ways.** Not just "what is the user doing" but "what has the agent been doing." A lightweight "since you've been gone" summary scoped to graph changes including agent actions. (Minor / Usability)

8. **Link density determines agent usefulness.** Missing links mean agents can't reason in context. The navigator could surface "this isn't linked to anything." (Minor / Feasibility)

**User response:**
- Point 6: Opportunity — designing for this is essential.
- Point 7: Expanded — supporting autonomous agent work (not just interactive sessions) is key. Between-session visibility is critical.
- Point 8: Reframed — agents can *discover* missing links and nodes through semantic search and spatial representations. Independent graph analysis and enrichment is a key future opportunity.

### Round 4: Developer on the Team

*"I just got assigned a story. The PM says it traces from some opportunity in the discovery graph."*

1. **Where's the "why" behind my work?** Can I trace a story back through idea → opportunity → objective with assumptions and evidence along the way? The cross-boundary trail from development artifacts into discovery needs to be seamless. (Minor / Usability)

2. **I don't speak discovery.** Objectives, opportunities, assumptions — that's PM vocabulary. I think in stories, tasks, dependencies. (Minor / Desirability)

**User response:**
- Point 1: Expanded into a broader opportunity — translating the graph into coherent narrative that explains the "why." Multiple use cases: devs understanding features, teams tracing product history, agents reconstructing context.
- Point 2: Reframed as foundational assumption — AI tooling is bringing PM and developer roles closer. The roles will likely remain distinct but overlap significantly more. Created as high-importance assumption.

### Round 5: New Team Member Onboarding

*"I joined last week. There are 50 artifacts in this graph and I have no idea where to start."*

3. **I need a narrative, not a taxonomy.** What I need is the story — how did this team get here? What did they try? What failed? A chronological or curated path through the graph. (Minor / Desirability)

4. **The graph tells me what the team decided, but not what they rejected.** Invalidated assumptions, failed experiments, abandoned ideas — these are the most valuable artifacts for onboarding. If they're treated as second-class, I miss the institutional knowledge. (Minor / Usability)

**User response:**
- Point 3: Expanded — tracing product features to the history of how and why they were built. "I can't tell you how many times I've approached something in a product, wondered why it was built a particular way, and walked away because there was too much risk to change something where I didn't understand the history." Created as part of the narrative opportunity.
- Point 4: Expanded — rejected work *is* in the graph (status lifecycle tracks it). The real opportunity is making this history accessible when it's currently too costly to both create and read. Created as opportunity.

**Additional (user-initiated):** Production usage data should flow back into the discovery graph to validate what was built. Broad, long-term opportunity — closing the loop from shipped features back to the discovery reasoning that motivated them. Created as opportunity.

## Synthesis

### Fatal Concerns
None. The core idea — wiki-style navigation of the discovery graph — held up well across all personas.

### Serious Concerns
1. **Without process guidance, the navigator is a filing cabinet** — viewing artifacts isn't the same as supporting the discovery process (product coach)
2. **Lateral navigation matters more than top-down tree traversal** — the sidebar tree may reinforce the wrong mental model (product coach)
3. **Discovery activities need to happen inside the tool** — if they happen elsewhere, artifacts arrive stale (product coach)
4. **Notion is the real competitor** — until mixed-initiative and process features differentiate Forge, a well-structured Notion workspace does 80% of what the navigator offers (end-user)
5. **Read-only v1 weakens the adoption story** — maintaining two tools is worse than one, but collaborative authoring is planned (end-user)
6. **AI contributions need provenance** — users must distinguish AI-proposed from human-authored content (AI agent)
7. **AI output needs staging/triage** — unchecked volume floods the graph (AI agent)
8. **Agent work must surface in context** — not in a separate panel humans won't check (AI agent)

All serious concerns are acknowledged as real but out of v1 scope. Each has been captured as an opportunity for the roadmap.

### Minor Concerns
1. Graph needs coherent narrative — the "how did we get here" story (developer, new team member)
2. Evidence layer needed as first-class display concern (product coach)
3. Data portability and accessibility (end-user)
4. Agent institutional memory — graph as context reconstruction (AI agent)
5. UI interaction signals for agent context (AI agent)
6. Agents can discover missing graph structure autonomously (AI agent)
7. Rejected/invalidated work is invisible institutional knowledge (new team member)
8. Production data should close the discovery loop (user-initiated)

### Assumptions Surfaced
1. **AI tooling will bring PM and developer roles closer** — high importance, medium evidence. Foundational to the single-tool design.
2. **Early graphs are too small to need navigation** — low importance, low evidence. Likely wrong once development artifacts enter.

### Strengths Confirmed
- **Wiki-over-graph is the right call** — every persona wanted to read content and follow links, not manipulate a spatial layout
- **The content model is strong** — rich Markdown bodies with typed metadata and relationships serve all audiences (humans browsing, agents querying, new members onboarding)
- **The idea complements the artifact store cleanly** — data layer (Neo4j + GraphQL) and presentation layer (navigator) have clear boundaries
- **The v1 scope is well-calibrated** — modal editing, single-user, no search, GraphQL-backed. Every persona wanted more, but none identified a fatal gap in what v1 delivers
