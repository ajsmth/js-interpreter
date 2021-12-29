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
        value: 10,
      },
      {
        type: 'return',
        value: 993322,
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
    `;

    const tokens = lexer(input);
    const { statements } = parser(tokens);

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
      },
    ];

    expect(statements).toEqual(expected);
  });
});
