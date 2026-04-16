---
name: "Teams get lost exploring a vast opportunity space"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
specializes: curate-vast-opportunity-space
hmw: "HMW let a team explore an opportunity space without getting lost in it?"
---

## Description

Exploration is the non-goal-directed case. The user is wandering — following interesting threads, noticing adjacencies, hoping to surface something they didn't know they were looking for. A lot of creative work happens exactly here, and it is the job tree views and filtered lists are worst at. The reader is not asking *where is X?* or *what is the shape of the whole?* — they are asking *what's over there?* and then, a minute later, *what's over there?* about somewhere else.

Past a certain scale the wandering stops being productive and starts being anxious. Two failure modes show up together. First, **orientation decay**: "where am I, how did I get here, and what am I missing by being here instead of somewhere else?" The [M1 hypertext model](../../development/specs/web-ui-discovery-explorer.md) is clean and fast, but it has no you-are-here layer — no history of where you've been this session, no breadcrumb back to where you started, no way to mark a thread for later without losing your place in the current one. Second, **infinite branching**: every artifact has typed relationships in several directions, and following them all is fractal. The user needs to prune without feeling like closing a door permanently.

The emotional shape of the job matters as much as the mechanical one. "I'll just click this and see" is a healthy exploratory move when the cost of being wrong is trivial; it is a paralyzing one when the user is already six clicks deep and has forgotten what brought them here. Navigation safety is the affordance that turns the first state into the default and makes the second one rare.

Exploration also has to support the move from wandering to holding. A user notices something worth coming back to — an opportunity that feels adjacent to something they are actively working on, an assumption they hadn't thought of, a pair of ideas that might share a risk. The interface has to let them mark it without forcing them to commit to it, and has to bring them back to the thread they were on.

The outcome we want: wandering through the opportunity space feels safe enough that people actually do it — and the things they notice along the way don't evaporate by the time they get back to their desk.

## Evidence

- Classic hypertext research (Vannevar Bush's memex, and three decades of follow-on work in Hypertext conference proceedings) identifies exactly this pattern: non-goal-directed browsing is where the serendipitous insights happen, and it is where users most often get lost. Tools that solved orientation — trails, history, bookmarks — dominated.
- Etak dogfooding: navigating `docs/discovery/` via file paths already produces the "wait, what was I looking at?" feeling after three or four jumps. With one author and 30-something opportunities, the wandering mode is already fragile.
- Workshop ideation sessions rely heavily on "huh, that's interesting, let me note that" moments. Miro preserves the note poorly (detached from context) and destroys the thread entirely (there is no trail).
- This specialization lives next to [`lateral-navigation-across-discovery-graph`](./lateral-navigation-across-discovery-graph.md): lateral navigation is the *mechanism* that makes exploration valuable; navigation safety is what keeps it from becoming its own failure mode.

## Potential directions (illustrative, non-exhaustive)

These are solution shapes. Ideas addressing this opportunity may pick any subset.

- Session history and trails — "where have I been in this session, and how do I get back?" — made visible and reversible.
- Lightweight marking affordances (pin, flag, save for later) that do not require committing to a formal artifact or disrupting the current thread.
- Orientation overlays that show the reader where the current artifact sits in the broader space without forcing them to leave it.
- Graceful "back to where I started" moves that survive deep exploratory dives.

## Relationship to other opportunities

- **Parent:** [`curate-vast-opportunity-space`](./curate-vast-opportunity-space.md) — the general editorial job of keeping a large space workable.
- **Sibling (findability):** [`find-relevant-work-in-vast-space`](./find-relevant-work-in-vast-space.md) — findability is the targeted case; exploration is the untargeted one. The same user switches between modes constantly.
- **Sibling (sensemaking):** [`make-sense-of-vast-opportunity-space`](./make-sense-of-vast-opportunity-space.md) — sensemaking is about *being* oriented; navigation safety is about *staying* oriented while moving.
- **Related:** [`lateral-navigation-across-discovery-graph`](./lateral-navigation-across-discovery-graph.md) — the navigation model exploration depends on; this opportunity is about what the reader needs in order to use that model without paying a cognitive tax for it.
