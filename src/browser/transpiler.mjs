// Browser-friendly tokenizer + parser + transpiler for HomyLang (ES module)
// Exports: transpile(source: string) -> string (JavaScript source)
// This is a near-port of the repository's server-side transpiler for in-browser use.

const isWhitespace = (ch) => /\s/.test(ch);
const isDigit = (ch) => /[0-9]/.test(ch);
const isAlpha = (ch) => /[A-Za-z_]/.test(ch);
const isAlnum = (ch) => /[A-Za-z0-9_]/.test(ch);

const keywords = new Set(['let', 'fn', 'return', 'if', 'else', 'while', 'true', 'false', 'null']);

function tokenize(input) {
  const tokens = [];
  let i = 0;
  const len = input.length;

  function peek(n = 0) { return input[i + n]; }
  function next() { return input[i++]; }

  while (i < len) {
    let ch = peek();

    if (isWhitespace(ch)) { next(); continue; }

    // single-line comment
    if (ch === '/' && peek(1) === '/') {
      while (i < len && peek() !== '\n') next();
      continue;
    }

    // numbers
    if (isDigit(ch)) {
      let num = '';
      while (isDigit(peek())) num += next();
      if (peek() === '.' && isDigit(peek(1))) {
        num += next();
        while (isDigit(peek())) num += next();
      }
      tokens.push({ type: 'Number', value: num });
      continue;
    }

    // identifiers / keywords
    if (isAlpha(ch)) {
      let id = '';
      while (isAlnum(peek())) id += next();
      const type = keywords.has(id) ? 'Keyword' : 'Identifier';
      tokens.push({ type, value: id });
      continue;
    }

    // strings (double/single)
    if (ch === '"' || ch === "'") {
      const quote = next();
      let str = '';
      while (i < len && peek() !== quote) {
        if (peek() === '\\') { next(); const esc = next(); str += esc === 'n' ? '\n' : esc; }
        else str += next();
      }
      if (peek() === quote) next();
      tokens.push({ type: 'String', value: str });
      continue;
    }

    // two-character operators
    const two = ch + peek(1);
    if (two === '==' || two === '!=' || two === '>=' || two === '<=') {
      tokens.push({ type: 'Punctuator', value: two }); i += 2; continue;
    }

    // single-character punctuators
    const singlePunct = '(){},;+*-/%<>='; // include '=' for assignment and operators
    if (singlePunct.includes(ch)) {
      tokens.push({ type: 'Punctuator', value: next() });
      continue;
    }

    // fallback: unknown char - emit and advance
    tokens.push({ type: 'Unknown', value: next() });
  }

  tokens.push({ type: 'EOF', value: null });
  return tokens;
}

// Parser (recursive-descent) — returns AST similar to server version
function parse(input) {
  const tokens = tokenize(input);
  let i = 0;
  function peek(n = 0) { return tokens[i + n] || { type: 'EOF' }; }
  function next() { return tokens[i++]; }
  function expect(type, value = undefined) {
    const t = peek();
    if (t.type !== type || (value !== undefined && t.value !== value)) {
      throw new Error(`Expected ${type}${value ? ' ' + value : ''} but got ${t.type} ${t.value}`);
    }
    return next();
  }

  function parseProgram() {
    const body = [];
    while (peek().type !== 'EOF') {
      body.push(parseStatement());
    }
    return { type: 'Program', body };
  }

  function parseStatement() {
    const t = peek();
    if (t.type === 'Keyword' && t.value === 'let') return parseLet();
    if (t.type === 'Keyword' && t.value === 'fn') return parseFunction();
    if (t.type === 'Keyword' && t.value === 'return') return parseReturn();
    if (t.type === 'Keyword' && t.value === 'if') return parseIf();
    if (t.type === 'Keyword' && t.value === 'while') return parseWhile();
    // expression statement
    const expr = parseExpression();
    // optional semicolon
    if (peek().type === 'Punctuator' && peek().value === ';') next();
    return { type: 'ExpressionStatement', expression: expr };
  }

  function parseLet() {
    expect('Keyword', 'let');
    const id = expect('Identifier').value;
    expect('Punctuator', '=');
    const value = parseExpression();
    if (peek().type === 'Punctuator' && peek().value === ';') next();
    return { type: 'VariableDeclaration', id, init: value };
  }

  function parseFunction() {
    expect('Keyword', 'fn');
    const nameToken = peek();
    let name = null;
    if (nameToken.type === 'Identifier') name = next().value;
    expect('Punctuator', '(');
    const params = [];
    while (peek().type !== 'Punctuator' || peek().value !== ')') {
      if (peek().type === 'Identifier') {
        params.push(next().value);
      }
      if (peek().type === 'Punctuator' && peek().value === ',') next();
    }
    expect('Punctuator', ')');
    const body = parseBlock();
    return { type: 'FunctionDeclaration', name, params, body };
  }

  function parseBlock() {
    expect('Punctuator', '{');
    const stmts = [];
    while (peek().type !== 'Punctuator' || peek().value !== '}') {
      stmts.push(parseStatement());
    }
    expect('Punctuator', '}');
    return { type: 'BlockStatement', body: stmts };
  }

  function parseReturn() {
    expect('Keyword', 'return');
    const argument = parseExpression();
    if (peek().type === 'Punctuator' && peek().value === ';') next();
    return { type: 'ReturnStatement', argument };
  }

  function parseIf() {
    expect('Keyword', 'if');
    expect('Punctuator', '(');
    const test = parseExpression();
    expect('Punctuator', ')');
    const consequent = parseBlock();
    let alternate = null;
    if (peek().type === 'Keyword' && peek().value === 'else') {
      next();
      if (peek().type === 'Punctuator' && peek().value === '{') alternate = parseBlock();
      else alternate = parseStatement();
    }
    return { type: 'IfStatement', test, consequent, alternate };
  }

  function parseWhile() {
    expect('Keyword', 'while');
    expect('Punctuator', '(');
    const test = parseExpression();
    expect('Punctuator', ')');
    const body = parseBlock();
    return { type: 'WhileStatement', test, body };
  }

  // Expressions
  function parseExpression() {
    return parseAssignment();
  }

  function parseAssignment() {
    const left = parseEquality();
    if (peek().type === 'Punctuator' && peek().value === '=') {
      // only simple identifier assignment supported for now
      if (left.type !== 'Identifier') throw new Error('Left-hand side of assignment must be identifier');
      next();
      const right = parseAssignment();
      return { type: 'AssignmentExpression', id: left.name, value: right };
    }
    return left;
  }

  function parseEquality() {
    let node = parseAddition();
    while (peek().type === 'Punctuator' && (peek().value === '==' || peek().value === '!=')) {
      const op = next().value;
      const right = parseAddition();
      node = { type: 'BinaryExpression', operator: op, left: node, right };
    }
    return node;
  }

  function parseAddition() {
    let node = parseMultiplication();
    while (peek().type === 'Punctuator' && (peek().value === '+' || peek().value === '-')) {
      const op = next().value;
      const right = parseMultiplication();
      node = { type: 'BinaryExpression', operator: op, left: node, right };
    }
    return node;
  }

  function parseMultiplication() {
    let node = parseUnary();
    while (peek().type === 'Punctuator' && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
      const op = next().value;
      const right = parseUnary();
      node = { type: 'BinaryExpression', operator: op, left: node, right };
    }
    return node;
  }

  function parseUnary() {
    if (peek().type === 'Punctuator' && (peek().value === '-' || peek().value === '!')) {
      const op = next().value;
      const arg = parseUnary();
      return { type: 'UnaryExpression', operator: op, argument: arg };
    }
    return parseCall();
  }

  function parseCall() {
    let node = parsePrimary();
    while (peek().type === 'Punctuator' && peek().value === '(') {
      next();
      const args = [];
      while (peek().type !== 'Punctuator' || peek().value !== ')') {
        args.push(parseExpression());
        if (peek().type === 'Punctuator' && peek().value === ',') next();
        else break;
      }
      expect('Punctuator', ')');
      node = { type: 'CallExpression', callee: node, arguments: args };
    }
    return node;
  }

  function parsePrimary() {
    const t = peek();
    if (t.type === 'Number') { next(); return { type: 'Literal', value: Number(t.value) }; }
    if (t.type === 'String') { next(); return { type: 'Literal', value: t.value }; }
    if (t.type === 'Keyword' && (t.value === 'true' || t.value === 'false' || t.value === 'null')) {
      next(); return { type: 'Literal', value: t.value === 'true' ? true : t.value === 'false' ? false : null };
    }
    if (t.type === 'Identifier') { next(); return { type: 'Identifier', name: t.value }; }
    if (t.type === 'Punctuator' && t.value === '(') {
      next(); const expr = parseExpression(); expect('Punctuator', ')'); return expr;
    }
    if (t.type === 'Punctuator' && t.value === '{') {
      // inline block expression (parse as block statement)
      return parseBlock();
    }
    throw new Error('Unexpected token in primary: ' + JSON.stringify(t));
  }

  return parseProgram();
}

// Transpiler: AST -> JavaScript
function transpileAst(ast) {
  function gen(node) {
    switch (node.type) {
      case 'Program':
        return node.body.map(gen).join('\n');
      case 'VariableDeclaration':
        return `let ${node.id} = ${gen(node.init)};`;
      case 'FunctionDeclaration': {
        const name = node.name || '';
        const params = node.params.join(', ');
        return `function ${name}(${params}) ${gen(node.body)}`;
      }
      case 'BlockStatement':
        return `{ ${node.body.map(gen).join(' ')} }`;
      case 'ReturnStatement':
        return `return ${gen(node.argument)};`;
      case 'IfStatement': {
        const alt = node.alternate ? ` else ${gen(node.alternate)}` : '';
        return `if (${gen(node.test)}) ${gen(node.consequent)}${alt}`;
      }
      case 'WhileStatement':
        return `while (${gen(node.test)}) ${gen(node.body)}`;
      case 'ExpressionStatement':
        return `${gen(node.expression)};`;
      case 'CallExpression':
        return `${gen(node.callee)}(${node.arguments.map(gen).join(', ')})`;
      case 'AssignmentExpression':
        return `${node.id} = ${gen(node.value)}`;
      case 'BinaryExpression':
        return `(${gen(node.left)} ${node.operator} ${gen(node.right)})`;
      case 'UnaryExpression':
        return `${node.operator}${gen(node.argument)}`;
      case 'Literal':
        return JSON.stringify(node.value);
      case 'Identifier':
        return node.name;
      default:
        throw new Error('Unsupported node type in transpiler: ' + node.type);
    }
  }

  const js = gen(ast);
  // Provide a small runtime print function name that will be replaced in caller or handled by sandbox
  const final = `const __homy_print = (...args) => console.log(...args);\n` + js.replace(/\bprint\(/g, '__homy_print(');
  return final;
}

// Public API
export function transpile(source) {
  const ast = parse(source);
  return transpileAst(ast);
}