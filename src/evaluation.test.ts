import { evaluate } from './evaluation';
import { lexer } from './lexer';
import { parser } from './parser';

describe('evaluation', () => {
  test('integers', () => {
    const input = `
      5;
      10;
    `;

    const expected = [5, 10];

    testEvaluation(input, expected);
  });

  test('booleans', () => {
    const input = `
      true;
      false;
      1 < 2;
      1 > 2;
      1 < 1;
      1 > 1;
      1 != 1;
      1 == 1;
      1 != 2;
      1 == 2;
    `;

    const expected = [
      true,
      false,
      true,
      false,
      false,
      false,
      false,
      true,
      true,
      false,
    ];

    testEvaluation(input, expected);
  });

  test('infix', () => {
    const input = `
      5 * 5;
      5 + 5;
      5 - 5;
      5 / 5;
      5 * 2 + 10;
      2 * 2 * 2;
      (5 + 10) * 2;
      50 / (2 + 3);
  `;

    const expected = [25, 10, 0, 1, 20, 8, 30, 10];

    testEvaluation(input, expected);
  });

  test('prefix', () => {
    const input = `
      !true;
      !false;
      !5;
      !!true;
      !!false;
      !!5;
    `;

    const expected = [false, true, false, true, false, true];

    testEvaluation(input, expected);
  });
});

function testEvaluation(input: string, expected: any[]) {
  const tokens = lexer(input);
  const ast = parser(tokens);

  const output = ast.statements.map(evaluate);

  expect(output).toEqual(expected);
}
