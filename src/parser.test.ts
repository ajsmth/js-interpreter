import { lexer } from './lexer';
import { parser } from './parser';

describe('parser', () => {
  test('let statements', () => {
    const input = `let x = 5;`;
    const tokens = lexer(input);
    const { statements } = parser(tokens);

    const expected = [
      {
        type: 'let',
        identifier: 'x',
        value: 5,
      },
    ];

    expect(statements).toEqual(expected);
  });

  test('let statements (multiple)', () => {
    const input = `
      let x = 5;
      let y = 10;
    `;
    const tokens = lexer(input);
    const { statements } = parser(tokens);

    const expected = [
      {
        type: 'let',
        identifier: 'x',
        value: 5,
      },
      {
        type: 'let',
        identifier: 'y',
        value: 10,
      },
    ];

    expect(statements).toEqual(expected);
  });

  test('capturing errors', () => {
    const input = `
      let x 5;
      let = 10;
    `;

    const tokens = lexer(input);
    const { errors } = parser(tokens);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('return statements', () => {
    const input = `
      return 10;
      return 993322;
    `;

    const tokens = lexer(input);
    const { statements, errors } = parser(tokens);

    const expected = [
      {
        type: 'return',
        value: {
          type: 'integer-literal',
          value: 10,
        },
      },
      {
        type: 'return',
        value: {
          type: 'integer-literal',
          value: 993322,
        },
      },
    ];

    expect(statements).toEqual(expected);
  });

  test('identifier expression', () => {
    const input = `
      foobar;
    `;

    const tokens = lexer(input);
    const { statements } = parser(tokens);

    const expected = [
      {
        type: 'identifier',
        value: 'foobar',
      },
    ];

    expect(statements).toEqual(expected);
  });

  test('integer expression', () => {
    const input = `
    5;
  `;

    const tokens = lexer(input);
    const { statements, errors } = parser(tokens);

    const expected = [
      {
        type: 'integer-literal',
        value: 5,
      },
    ];

    expect(statements).toEqual(expected);
    expect(errors.length).toEqual(0);
  });

  test('prefix operators', () => {
    const input = `
      !5;
      -15;
    `;

    const tokens = lexer(input);
    const { statements, errors } = parser(tokens);

    const expected = [
      {
        type: 'prefix-operator',
        operator: '!',
        value: {
          type: 'integer-literal',
          value: 5,
        },
      },
      {
        type: 'prefix-operator',
        operator: '-',
        value: {
          type: 'integer-literal',
          value: 15,
        },
      },
    ];

    expect(statements).toEqual(expected);
    expect(errors.length).toEqual(0);
  });

  test('infix operators', () => {
    const input = `
      5 + 5;
      5 - 5;
      5 * 5;
      5 / 5;
      5 > 5;
      5 < 5;
      5 == 5;
      5 != 5;
    `;

    const tokens = lexer(input);
    const { statements, errors } = parser(tokens);

    function getInfixStatement(operator: string) {
      return {
        left: {
          type: 'integer-literal',
          value: 5,
        },
        operator,
        right: {
          type: 'integer-literal',
          value: 5,
        },
        type: 'infix-operator',
      };
    }

    const expected = ['+', '-', '*', '/', '>', '<', '==', '!='].map(
      getInfixStatement
    );

    expect(statements).toEqual(expected);
    expect(errors.length).toEqual(0);
  });

  test('operator precedence', () => {
    const input = `
      -a * b;
      !-a;
      a * b * c;
      a + b + c;
      3 + 4; -5 * 5;
      5 > 4 == 3 < 4;
    `;

    const tokens = lexer(input);
    const { statements, errors } = parser(tokens);

    const expected = [
      {
        left: {
          type: 'prefix-operator',
          operator: '-',
          value: {
            type: 'identifier',
            value: 'a',
          },
        },
        operator: '*',
        right: {
          type: 'identifier',
          value: 'b',
        },
        type: 'infix-operator',
      },
      {
        type: 'prefix-operator',
        operator: '!',
        value: {
          operator: '-',
          type: 'prefix-operator',
          value: {
            type: 'identifier',
            value: 'a',
          },
        },
      },
      {
        type: 'infix-operator',
        operator: '*',
        left: {
          type: 'infix-operator',
          operator: '*',
          left: {
            type: 'identifier',
            value: 'a',
          },
          right: {
            type: 'identifier',
            value: 'b',
          },
        },
        right: {
          type: 'identifier',
          value: 'c',
        },
      },
      {
        type: 'infix-operator',
        operator: '+',
        left: {
          type: 'infix-operator',
          operator: '+',
          left: {
            type: 'identifier',
            value: 'a',
          },
          right: {
            type: 'identifier',
            value: 'b',
          },
        },
        right: {
          type: 'identifier',
          value: 'c',
        },
      },
      {
        type: 'infix-operator',
        operator: '+',
        left: {
          type: 'integer-literal',
          value: 3,
        },
        right: {
          type: 'integer-literal',
          value: 4,
        },
      },
      {
        type: 'infix-operator',
        operator: '*',
        left: {
          type: 'prefix-operator',
          operator: '-',
          value: {
            type: 'integer-literal',
            value: 5,
          },
        },
        right: {
          type: 'integer-literal',
          value: 5,
        },
      },
      {
        type: 'infix-operator',
        operator: '==',
        left: {
          type: 'infix-operator',
          operator: '>',
          left: {
            type: 'integer-literal',
            value: 5,
          },
          right: {
            type: 'integer-literal',
            value: 4,
          },
        },
        right: {
          type: 'infix-operator',
          operator: '<',
          left: {
            type: 'integer-literal',
            value: 3,
          },
          right: {
            type: 'integer-literal',
            value: 4,
          },
        },
      },
    ];

    expect(statements).toEqual(expected);
    expect(errors.length).toEqual(0);
  });

  test('booleans', () => {
    const input = `
      true;
      false;
      let foobar = true;
      let barfoo = false;
    `;

    const tokens = lexer(input);
    const { statements, errors } = parser(tokens);

    const expected = [
      { type: 'boolean-literal', value: true },
      { type: 'boolean-literal', value: false },
      { type: 'let', identifier: 'foobar', value: true },
      { type: 'let', identifier: 'barfoo', value: false },
    ];

    expect(statements).toEqual(expected);
    expect(errors.length).toEqual(0);
  });

  test('grouped expressions', () => {
    const input = `
      1 + (2 + 3) + 4;
    `;

    const tokens = lexer(input);
    const { statements, errors } = parser(tokens);

    // expected = ((1 + (2 + 3)) + 4)
    const expected = [
      {
        type: 'infix-operator',
        operator: '+',
        left: {
          type: 'infix-operator',
          operator: '+',
          left: {
            type: 'integer-literal',
            value: 1,
          },
          right: {
            type: 'infix-operator',
            operator: '+',
            left: {
              type: 'integer-literal',
              value: 2,
            },
            right: {
              type: 'integer-literal',
              value: 3,
            },
          },
        },
        right: {
          type: 'integer-literal',
          value: 4,
        },
      },
    ];

    expect(statements).toEqual(expected);
    expect(errors.length).toEqual(0);
  });

  test('if expressions', () => {
    const input = `
      if (x < y) { x } else { y }
    `;

    const tokens = lexer(input);
    const { statements, errors } = parser(tokens);

    const expected = [
      {
        type: 'if',
        condition: {
          type: 'infix-operator',
          operator: '<',
          left: {
            type: 'identifier',
            value: 'x',
          },
          right: {
            type: 'identifier',
            value: 'y',
          },
        },
        consequence: {
          type: 'block',
          statements: [
            {
              type: 'identifier',
              value: 'x',
            },
          ],
        },
        alternative: {
          type: 'block',
          statements: [
            {
              type: 'identifier',
              value: 'y',
            },
          ],
        },
      },
    ];

    expect(statements).toEqual(expected);
    expect(errors.length).toEqual(0);
  });

  test('functions', () => {
    const input = `
      fn (x, y) {
        return x + y;
      }
    `;

    const tokens = lexer(input);
    const { statements, errors } = parser(tokens);

    const expected = [
      {
        type: 'function-literal',
        parameters: [
          { type: 'identifier', value: 'x' },
          { type: 'identifier', value: 'y' },
        ],
        body: {
          type: 'block',
          statements: [
            {
              type: 'return',
              value: {
                type: 'infix-operator',
                operator: '+',
                left: {
                  type: 'identifier',
                  value: 'x',
                },
                right: {
                  type: 'identifier',
                  value: 'y',
                },
              },
            },
          ],
        },
      },
    ];
    expect(statements).toEqual(expected);
    expect(errors.length).toEqual(0);
  });
});
