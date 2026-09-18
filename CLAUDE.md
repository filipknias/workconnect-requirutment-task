### Rules

- Never speculate about code you have not opened. If the user references a
  specific file, you MUST read the file before answering. Make sure to
  investigate and read relevant files BEFORE answering questions about the
  codebase. Never make any claims about code before investigating unless you are
  certain of the correct answer - give grounded and hallucination-free answers.

### Deep Modules

Prefer deep modules: small interface, deep implementation. A few methods with
simple params hiding complex logic behind them.

Avoid shallow modules: large interface with many methods that just pass through
to thin implementation. When designing, ask: can I reduce the number of methods?
Can I simplify the parameters? Can I hide more complexity inside?

### Additional tips

- Do not verify with browsers or computer use unless the user explicitly agrees
  or requests it.
- Security is important but should not be over-indexed on, especially for
  dev-mode or maintainer-only features.
