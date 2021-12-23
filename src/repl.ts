import * as readline from 'readline';
import { lexer } from './lexer';

export function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>> ',
  });

  rl.on('line', (input: string) => {
    const tokens = lexer(input);

    tokens.forEach(token => {
      console.log({ token });
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
