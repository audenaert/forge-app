---
name: "Teams need to follow implications across the tree, not just drill down through it"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW support lateral navigation — following evidence chains, tracing implications across branches, and jumping between related artifacts — not just top-down tree traversal?"
---

## Description

The Opportunity Solution Tree has a natural hierarchy (objective → opportunity → idea → assumption → experiment), and it's tempting to use that as the primary navigation model. But in practice, the interesting traversals are lateral: "I just validated an assumption — what other ideas depend on it? An experiment invalidated something — what's the blast radius across the tree?"

Teams don't explore the tree top-down like a file system. They jump between nodes connected by implication, evidence, and shared context. A sidebar tree reinforces a top-down mental model that doesn't match how discovery thinking actually works.

## Evidence

- CDH practitioners report that the most valuable moments in discovery happen when connections across branches become visible — e.g., realizing two ideas share the same risky assumption
- Graph databases (like the planned Neo4j backend) excel at exactly this kind of traversal, but the value is lost if the UI only exposes a tree view
