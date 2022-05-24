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

  let env = {};

  rl.on('line', (input: string) => {
    const tokens = lexer(input);
    const ast = parser(tokens);

    const { statements } = ast;
    const output = evaluate(statements, env);

    console.log({ output });

    rl.prompt();
  });

  function start() {
    rl.prompt();
  }

  return {
    start,
  };
}
