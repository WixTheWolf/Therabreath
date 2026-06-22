---
name: regenerate-or-update-booklet
description: Workflow command scaffold for regenerate-or-update-booklet in Therabreath.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /regenerate-or-update-booklet

Use this workflow when working on **regenerate-or-update-booklet** in `Therabreath`.

## Goal

Modify the workshop booklet source or design, then regenerate the output PDF.

## Common Files

- `build_booklet.py`
- `dist/therabreath_capabilities_workshop_booklet.pdf`
- `README.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit build_booklet.py to change booklet generation logic or content.
- Regenerate dist/therabreath_capabilities_workshop_booklet.pdf.
- Update README.md if documentation changes.
- Commit the changes.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.