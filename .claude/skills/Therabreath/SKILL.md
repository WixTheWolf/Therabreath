```markdown
# Therabreath Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns, coding conventions, and common workflows for the Therabreath codebase. The repository is primarily Python, with supporting HTML and documentation files, and focuses on generating and maintaining workshop content such as landing pages and booklets. No specific framework is used, and the codebase follows clear conventions for file naming, imports, and exports.

## Coding Conventions

- **File Naming:**  
  Use `snake_case` for Python files and assets.  
  *Example:*  
  ```
  build_booklet.py
  therabreath_utils.py
  ```

- **Import Style:**  
  Use relative imports within the package.  
  *Example:*  
  ```python
  from .helpers import format_section
  ```

- **Export Style:**  
  Use named exports (explicitly listing what is exported).  
  *Example:*  
  ```python
  __all__ = ['generate_booklet', 'format_section']
  ```

- **Commit Messages:**  
  Freeform, usually concise (~37 characters), with or without prefixes.

## Workflows

### Update Workshop Site Content
**Trigger:** When you need to adjust the copy, layout, or branding of the main workshop site.  
**Command:** `/update-site-content`

1. Edit `index.html` to update content, layout, or styling.
2. If your changes affect site navigation or documentation, optionally update `404.html` or `README.md`.
3. Commit your changes with a clear message.

*Example:*
```html
<!-- index.html -->
<h1>Welcome to the Therabreath Workshop!</h1>
<p>Updated event details for 2024.</p>
```

### Regenerate or Update Booklet
**Trigger:** When you want to update the workshop booklet's content or appearance.  
**Command:** `/update-booklet`

1. Edit `build_booklet.py` to change booklet generation logic or content.
2. Regenerate the PDF output: `dist/therabreath_capabilities_workshop_booklet.pdf`.
3. If documentation changes, update `README.md`.
4. Commit your changes.

*Example:*
```python
# build_booklet.py
def add_new_section():
    # Add new content to the booklet
    pass
```
```bash
python build_booklet.py
# Output: dist/therabreath_capabilities_workshop_booklet.pdf
```

## Testing Patterns

- **Framework:** Unknown (no specific testing framework detected).
- **File Pattern:** Test files use the pattern `*.test.*` (e.g., `utils.test.py`).
- **How to Write Tests:**  
  Place your test files alongside the code, using the `.test.` infix in the filename.  
  *Example:*  
  ```
  build_booklet.test.py
  ```

## Commands

| Command              | Purpose                                                        |
|----------------------|----------------------------------------------------------------|
| /update-site-content | Refine or update the workshop site landing page content/design. |
| /update-booklet      | Modify and regenerate the workshop booklet PDF.                |
```
