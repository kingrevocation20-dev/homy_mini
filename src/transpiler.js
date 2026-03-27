// Transpile HomyLang AST to JavaScript source
// This is intentionally simple and maps nodes to JS equivalents.

function transpile(ast) {
  function gen(node) {
    switch (node.type) {
      case 'Program':
        return node.body.map(gen).join('\n');
      case 'VariableDeclaration':
        return `let ${node.id} = ${gen(node.init)};`;
      case 'FunctionDeclaration': {
        const name = node.name || '';
        const params = node.params.join(', ');
        // body is a BlockStatement AST node
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

  // Inject small runtime helpers (print)
  const prelude = `const __homy_print = (...args) => console.log(...args);\n`;
  const js = gen(ast);
  // Replace uses of `print(...)` with __homy_print(...) at runtime by simple replace:
  // (A future proper approach is to inject mapping at call generation)
  const final = prelude + js.replace(/\bprint\(/g, '__homy_print(');
  return final;
}

module.exports = { transpile };