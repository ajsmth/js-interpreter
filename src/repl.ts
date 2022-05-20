import * as readline from 'readline';
import { evaluate } from './evaluation';
import { lexer } from './lexer';
import { parser } from './parser';

export function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>> ',
  });

  rl.on('line', (input: string) => {
    const tokens = lexer(input);
    const ast = parser(tokens);

    const { statements } = ast;

    statements.forEach(statement => {
      const output = evaluate(statement);
      console.log(JSON.stringify(output, null, 2));
    });

    rl.prompt();
  });

  function start() {
    rl.prompt();
  }

  return {
    start,
  };
}
