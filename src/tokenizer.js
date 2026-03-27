// Minimal tokenizer for HomyLang
// Produces tokens: {type, value, pos}

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
    if (two === '==' || two === '!=' || two === '>=' || two === '<=' || two === '=>') {
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

module.exports = { tokenize };