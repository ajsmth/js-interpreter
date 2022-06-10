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
        value: {
          type: 'integer-literal',
          value: 5,
        },
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
        value: {
          type: 'integer-literal',
          value: 5,
        },
      },
      {
        type: 'let',
        identifier: 'y',
        value: {
          type: 'integer-literal',
          value: 10,
        },
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
      {
        type: 'let',
        identifier: 'foobar',
        value: {
          type: 'boolean-literal',
          value: true,
        },
      },
      {
        type: 'let',
        identifier: 'barfoo',
        value: {
          type: 'boolean-literal',
          value: false,
        },
      },
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

  test('call expressions', () => {
    const input = `
      add(1, 2 * 3, 4 + 5);
    `;

    const tokens = lexer(input);
    const { statements, errors } = parser(tokens);

    const expected = [
      {
        type: 'call',
        function: {
          type: 'function-identifier',
          identifier: 'add',
        },
        arguments: [
          { type: 'integer-literal', value: 1 },
          {
            type: 'infix-operator',
            operator: '*',
            left: { type: 'integer-literal', value: 2 },
            right: { type: 'integer-literal', value: 3 },
          },
          {
            type: 'infix-operator',
            operator: '+',
            left: { type: 'integer-literal', value: 4 },
            right: { type: 'integer-literal', value: 5 },
          },
        ],
      },
    ];

    expect(statements).toEqual(expected);
    expect(errors.length).toEqual(0);
  });

  test('more call expressions', () => {
    const input = `
    add(2 + 2, 3 * 3 * 3);
    callsFunction(2, 3, fn(x,y) { x + y; });
    `;

    const expected = [
      // add(2 + 2, 3 * 3 * 3);
      {
        type: 'call',
        function: {
          type: 'function-identifier',
          identifier: 'add',
        },
        arguments: [
          {
            type: 'infix-operator',
            operator: '+',
            left: {
              type: 'integer-literal',
              value: 2,
            },
            right: {
              type: 'integer-literal',
              value: 2,
            },
          },
          {
            type: 'infix-operator',
            operator: '*',
            left: {
              type: 'infix-operator',
              operator: '*',
              left: {
                type: 'integer-literal',
                value: 3,
              },
              right: {
                type: 'integer-literal',
                value: 3,
              },
            },
            right: {
              type: 'integer-literal',
              value: 3,
            },
          },
        ],
      },
      // callsFunction(2, 3, fn(x,y) { x + y; });
      {
        type: 'call',
        function: {
          type: 'function-identifier',
          identifier: 'callsFunction',
        },
        arguments: [
          {
            type: 'integer-literal',
            value: 2,
          },
          {
            type: 'integer-literal',
            value: 3,
          },
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
              ],
            },
          },
        ],
      },
    ];

    const tokens = lexer(input);
    const { statements, errors } = parser(tokens);
    expect(statements).toEqual(expected);
    expect(errors.length).toBe(0);
  });

  test('strings', () => {
    expectOutput(`"hello world"`, [
      {
        type: 'string-literal',
        value: 'hello world',
      },
    ]);
  });

  test('array literal', () => {
    expectOutput(`[1, 2 * 2, 3 + 3]`, [
      {
        type: 'array-literal',
        elements: [
          { type: 'integer-literal', value: 1 },
          {
            type: 'infix-operator',
            operator: '*',
            left: {
              type: 'integer-literal',
              value: 2,
            },
            right: {
              type: 'integer-literal',
              value: 2,
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
              value: 3,
            },
          },
        ],
      },
    ]);
  });

  // TODO
  test('array index', () => {
    expectOutput(`myArray[0];`, [
      {
        type: 'infix-operator',
        operator: 'index',
        left: {
          type: 'identifier',
          value: 'myArray',
        },
        right: {
          type: 'integer-literal',
          value: 0,
        },
      },
    ]);

    expectOutput(`myArray[1 + 2];`, [
      {
        type: 'infix-operator',
        operator: 'index',
        left: {
          type: 'identifier',
          value: 'myArray',
        },
        right: {
          type: 'infix-operator',
          operator: '+',
          left: {
            type: 'integer-literal',
            value: 1,
          },
          right: {
            type: 'integer-literal',
            value: 2,
          },
        },
      },
    ]);
  });

  test('operator precendence in index', () => {
    expectOutput(
      `
      a * [1,2,3,4][b*c] * d
    `,
      [
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
              type: 'infix-operator',
              operator: 'index',
              right: {
                type: 'infix-operator',
                operator: '*',
                left: {
                  type: 'identifier',
                  value: 'b',
                },
                right: {
                  type: 'identifier',
                  value: 'c',
                },
              },
              left: {
                type: 'array-literal',
                elements: [
                  {
                    type: 'integer-literal',
                    value: 1,
                  },
                  {
                    type: 'integer-literal',
                    value: 2,
                  },
                  {
                    type: 'integer-literal',
                    value: 3,
                  },
                  {
                    type: 'integer-literal',
                    value: 4,
                  },
                ],
              },
            },
          },
          right: {
            type: 'identifier',
            value: 'd',
          },
        },
      ]
    );

    expectOutput(`add(a * b[2])`, [
      {
        type: 'call',
        function: {
          type: 'function-identifier',
          identifier: 'add',
        },
        arguments: [
          {
            type: 'infix-operator',
            operator: '*',
            left: { type: 'identifier', value: 'a' },
            right: {
              type: 'infix-operator',
              operator: 'index',
              left: { type: 'identifier', value: 'b' },
              right: { type: 'integer-literal', value: 2 },
            },
          },
        ],
      },
    ]);
  });

  test('multiple index operators', () => {
    expectOutput(`myArray[0] + myArray[2]`, [
      {
        type: 'infix-operator',
        operator: '+',
        left: {
          type: 'infix-operator',
          operator: 'index',
          left: {
            type: 'identifier',
            value: 'myArray',
          },
          right: {
            type: 'integer-literal',
            value: 0,
          },
        },
        right: {
          type: 'infix-operator',
          operator: 'index',
          left: {
            type: 'identifier',
            value: 'myArray',
          },
          right: {
            type: 'integer-literal',
            value: 2,
          },
        },
      },
    ]);
  });

  test('basic hashes', () => {
    expectOutput(`{"one": 1, "two": 2 }`, [
      {
        type: 'hash-literal',
        entries: [
          {
            key: { type: 'string-literal', value: 'one' },
            value: { type: 'integer-literal', value: 1 },
          },
          {
            key: { type: 'string-literal', value: 'two' },
            value: { type: 'integer-literal', value: 2 },
          },
        ],
      },
    ]);
  });

  test('hashes w/ expressions', () => {
    expectOutput(`{"one": 0 + 1, "two": 10 - 8, "three": [0, 1]  }`, [
      {
        type: 'hash-literal',
        entries: [
          {
            key: { type: 'string-literal', value: 'one' },
            value: {
              type: 'infix-operator',
              operator: '+',
              left: { type: 'integer-literal', value: 0 },
              right: { type: 'integer-literal', value: 1 },
            },
          },
          {
            key: { type: 'string-literal', value: 'two' },
            value: {
              type: 'infix-operator',
              operator: '-',
              left: { type: 'integer-literal', value: 10 },
              right: { type: 'integer-literal', value: 8 },
            },
          },
          {
            key: { type: 'string-literal', value: 'three' },
            value: {
              type: 'array-literal',
              elements: [
                { type: 'integer-literal', value: 0 },
                { type: 'integer-literal', value: 1 },
              ],
            },
          },
        ],
      },
    ]);
  });

  test('hash index operator', () => {
    expectOutput(`{ "one": 2 }["one"]`, [
      {
        type: 'infix-operator',
        operator: 'index', 
        left: {
          type: 'hash-literal',
          entries: [
            {
              key: {
                type: 'string-literal',
                value: "one",
              },
              value: {
                type: 'integer-literal',
                value: 2
              }
            }
          ]
        },
        right: {
          type: "string-literal",
          value: "one"
        }
      }
    ])
  })

  function expectOutput(input: string, expected: any[]) {
    const tokens = lexer(input);
    const { statements, errors } = parser(tokens);
    expect(statements).toEqual(expected);
    if (errors.length > 1) {
      errors.forEach(e => console.log({ e }))
    }
    expect(errors.length).toBe(0);
  }
});
