// Minimal recursive-descent parser for HomyLang
// Produces a simple AST for our transpiler.

const { tokenize } = require('./tokenizer');

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
    if (peek().type === 'Keyword' && t.value === 'else') {
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

  // Expressions: lowest precedence up to binary operators and calls
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

module.exports = { parse };