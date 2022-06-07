import { evaluate } from './evaluation';
import { lexer } from './lexer';
import { parser } from './parser';

describe('evaluation', () => {
  test('integers', () => {
    const input = `
      5;
      10;
    `;

    expectOutput('5', 5);
    expectOutput('10', 10);
  });

  test('booleans', () => {
    expectOutput('true', true);
    expectOutput('false', false);
    expectOutput('1 < 2', true);
    expectOutput('1 > 2', false);
    expectOutput('1 < 1', false);
    expectOutput('1 != 1', false);
    expectOutput('1 == 1', true);
    expectOutput('1 != 2', true);
    expectOutput('1 == 2', false);
  });

  test('infix', () => {
    expectOutput('5 * 5', 25);
    expectOutput('5 + 5', 10);
    expectOutput('5 / 5', 1);
    expectOutput('5 - 5', 0);
    expectOutput('5 * 2 + 10', 20);
    expectOutput('(5 + 10) * 2', 30);
    expectOutput('50 / (2 + 3)', 10);
  });

  test('prefix', () => {
    expectOutput('!true', false);
    expectOutput('!false', true);
    expectOutput('!5', false);
    expectOutput('!!true', true);
    expectOutput('!!false', false);
    expectOutput('!!5', true);
  });

  test('conditionals', () => {
    expectOutput('if (true) { 10 };', 10);
    expectOutput('if (false) { 10 };', null);
    expectOutput('if (1) { 10 };', 10);
    expectOutput('if (1 > 2) { 10 };', null);
    expectOutput('if (1 < 2) { 10 };', 10);
    expectOutput('if (1 > 2 ) { 10 } else { 20 };', 20);
    expectOutput('if (1 < 2) { 10 } else { 20 };', 10);
  });

  test('return', () => {
    const input = `
      5 * 5 * 5;
      return 10;
      9 * 9 * 9;
    `;

    expectOutput(
      `  
      5 * 5 * 5;
      return 10;
      9 * 9 * 9;
    `,
      10
    );

    expectOutput(
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

  test('bindings', () => {
    expectOutput('let a = 5; a;', 5);
    expectOutput('let a = 5 * 5; a;', 25);
    expectOutput('let a = 5; let b = a; b;', 5);
    expectOutput('let a = 5; let b = a; let c = a + b + 5; c;', 15);
  });

  test('functions', () => {
    expectOutput(`let identity = fn(x) { x; }; identity(5);`, 5);
    expectOutput(`let identity = fn(x) { return x; }; identity(5);`, 5);
    expectOutput(`let double = fn(x) { return x * 2; }; double(5);`, 10);
    expectOutput(`let add = fn(x,y) { return x + y; }; add(1, 5);`, 6);
    expectOutput(`let add = fn(x,y) { return x + y; }; add(1, -5);`, -4);
    expectOutput(`fn(x) { x; }(5)`, 5);
    expectOutput(
      `let add = fn(x,y) { return x + y; }; add(add(1, -5), add(1, 2));`,
      -1
    );

    expectOutput(
      `
      let newAdder = fn(x) {
        fn(y) { x + y };
      };
      let addTwo = newAdder(2);
      addTwo(2);
    `,
      4
    );
  });

  test('strings', () => {
    expectOutput('"hello world"', 'hello world');
    expectOutput(`"hello" + " " + "world"`, 'hello world');
  });

  test('len()', () => {
    expectOutput(`len("hi")`, 2);
    expectOutput(`len("")`, 0);
    expectOutput(`len(1)`, undefined);
    expectOutput('len(1, 2)', undefined);
  });

  test('array literal', () => {
    expectOutput(`[1, 2 * 2, 3 + 3]`, [1, 4, 6])
  })

  test('array index operator', () => {
    expectOutput(`[1,2,3][0]`, 1)
    expectOutput(`[1,2,3][1]`, 2)
    expectOutput(`let i = 0; [1][i]`, 1)
    expectOutput(`let i = 1; [1,2][i]`, 2)
    expectOutput(`[1,2,3][1 + 1]`, 3)
    expectOutput(`let myArray = [1, 2, 3]; myArray[0] + myArray[2];`, 4)
    expectOutput(`let myArray = [1,2,3]; let i = myArray[0]; myArray[i];`, 2)
    expectOutput(`[1,2,3][3]`, undefined)
  })
});

function expectOutput(input: string, expected: any) {
  const tokens = lexer(input);
  const ast = parser(tokens);
  const output = evaluate(ast.statements);
  expect(output).toEqual(expected);
}
