import { evaluate } from './evaluation';
import { lexer } from './lexer';
import { parser } from './parser';

describe('evaluation', () => {
  test('integers', () => {
    const input = `
      5;
      10;
    `;

    expectToEqual('5', 5);
    expectToEqual('10', 10);
  });

  test('booleans', () => {
    expectToEqual('true', true);
    expectToEqual('false', false);
    expectToEqual('1 < 2', true);
    expectToEqual('1 > 2', false);
    expectToEqual('1 < 1', false);
    expectToEqual('1 != 1', false);
    expectToEqual('1 == 1', true);
    expectToEqual('1 != 2', true);
    expectToEqual('1 == 2', false);
  });

  test('infix', () => {
    expectToEqual('5 * 5', 25);
    expectToEqual('5 + 5', 10);
    expectToEqual('5 / 5', 1);
    expectToEqual('5 - 5', 0);
    expectToEqual('5 * 2 + 10', 20);
    expectToEqual('(5 + 10) * 2', 30);
    expectToEqual('50 / (2 + 3)', 10);
  });

  test('prefix', () => {
    expectToEqual('!true', false);
    expectToEqual('!false', true);
    expectToEqual('!5', false);
    expectToEqual('!!true', true);
    expectToEqual('!!false', false);
    expectToEqual('!!5', true);
  });

  test('conditionals', () => {
    expectToEqual('if (true) { 10 };', 10);
    expectToEqual('if (false) { 10 };', null);
    expectToEqual('if (1) { 10 };', 10);
    expectToEqual('if (1 > 2) { 10 };', null);
    expectToEqual('if (1 < 2) { 10 };', 10);
    expectToEqual('if (1 > 2 ) { 10 } else { 20 };', 20);
    expectToEqual('if (1 < 2) { 10 } else { 20 };', 10);
  });

  test('return', () => {
    const input = `
      5 * 5 * 5;
      return 10;
      9 * 9 * 9;
    `;

    expectToEqual(
      `  
      5 * 5 * 5;
      return 10;
      9 * 9 * 9;
    `,
      10
    );

    expectToEqual(
      `
      if (10 > 1) {
        if (10 > 1) {
          return 10;
        }

        return 1;
      }
    `,
      10
    );
  });
});

function expectToEqual(input: string, expected: any) {
  const tokens = lexer(input);
  const ast = parser(tokens);
  const output = evaluate(ast.statements);
  expect(output).toEqual(expected);
}
