# Auth Diagrams

## Reading order

1. Use case diagram in README.md — who uses auth and why
2. Module context diagram in README.md — auth next to storage and Trello
3. Data flow diagram in DATA_FLOW.md — login and restore paths
4. Interaction diagram in FUNCTIONS.md — how provider functions relate
5. Sequence diagram in CALL_CHAINS.md — exact login call order

## Diagram inventory

- Use case diagram: actors and auth capabilities, in README.md
- Module context diagram: neighbors of the auth module, in README.md
- Data flow diagram: token and profile movement, in DATA_FLOW.md
- Interaction diagram: function relationships, in FUNCTIONS.md
- Sequence diagram: login chain with storage and API, in CALL_CHAINS.md

## Prerequisites

Understand the API client contract in [ARCHITECTURE.md](../../ARCHITECTURE.md) first, since auth failures drive the global logout behavior.
