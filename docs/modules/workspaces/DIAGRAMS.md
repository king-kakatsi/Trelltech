# Workspaces Diagrams

## Reading order

1. Use case diagram in README.md — what users do with workspaces
2. Module context diagram in README.md — neighbors of this module
3. Data flow diagram in DATA_FLOW.md — forms to API to refresh
4. Interaction diagram in FUNCTIONS.md — screens to service functions
5. Sequence diagram in CALL_CHAINS.md — member invite chain

## Diagram inventory

- Use case diagram: workspace capabilities, in README.md
- Module context diagram: boards and members neighbors, in README.md
- Data flow diagram: validation and refresh flow, in DATA_FLOW.md
- Interaction diagram: function map, in FUNCTIONS.md
- Sequence diagram: invite plus reload, in CALL_CHAINS.md

## Prerequisites

Read the [auth module](../auth/README.md) first for session handling, then this module before boards since workspace IDs flow downstream.
