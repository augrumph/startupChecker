# Thesis data

This folder is the StartupChecker database.

Each thesis is stored as one Markdown file:

```
data/theses/<THESIS_ID>.md
```

The file has two layers:

1. **Human-readable Markdown** at the top.
2. A delimited `~~~json` machine record between:
   - `<!-- STARTUPCHECKER_RECORD_V1 -->`
   - `<!-- END_STARTUPCHECKER_RECORD_V1 -->`

The JSON record is the machine source of truth and contains the complete thesis state:

- thesis context
- router signals
- expert signals
- learning / potential / Blue Ocean
- Founder Fit
- critical hypotheses and observations
- candidate experiments
- experiment ledger
- outcomes
- decision history
- latest evaluation

## Why Markdown

- Git gives version history and diff.
- A human can inspect or edit a thesis without database tooling.
- Research and decision state live together.
- Export/backup is the repository itself.
- OutcomeNet later gets an auditable training corpus.

## Runtime

Default directory:

```
data/theses
```

Override with:

```
THESIS_DATA_DIR=/absolute/or/persistent/path
```

The API writes atomically through a temporary file and rename.

Important: the deployment must have a writable/persistent checkout if runtime writes are expected. On read-only/stateless hosting, use a repo-backed write adapter instead of local filesystem writes.
