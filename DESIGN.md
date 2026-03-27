# HomyLang — Design Notes

Goals
- Simple, readable syntax inspired by JavaScript / Python.
- Compile-to-JS backend initially for fast iteration.
- Strong focus on developer UX: helpful errors, REPL, good stdlib.
- Extendable architecture: add type checker, optimizing compiler or VM.

Core features (v0)
- let bindings: let x = 1
- function definitions: fn add(a, b) { return a + b }
- expression statements, returns, if / else, while
- function calls, basic built-in functions (print)
- Transpiles to JavaScript for portability

Pipeline
- Tokenizer → Parser → AST → Transpiler → JS
- Later add: type-checker and optimizer on AST, or alternative backend (WASM/native)

File layout (initial)
- bin/homy: CLI
- src/tokenizer.js
- src/parser.js
- src/transpiler.js
- examples/*.homy

Roadmap
- v0: this transpiler-based prototype
- v1: add REPL, module system, small standard library
- v2: optional static typing + type checker
- v3: improved diagnostics, language server (LSP)
- v4: optional native runtime / VM or WASM backend

Design decisions
- Build on top of JS to leverage existing ecosystem.
- Keep AST simple and human-readable to ease tooling and tests.
