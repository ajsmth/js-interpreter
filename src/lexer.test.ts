import { lexer, Token } from './lexer';

describe('lexer', () => {
  test('special characters: =+(){},;', () => {
    const input = '=+(){},;';
    const tokens = lexer(input);

    const expected = [
      { type: 'assign', literal: '=' },
      { type: 'plus', literal: '+' },
      { type: 'lparen', literal: '(' },
      { type: 'rparen', literal: ')' },
      { type: 'lbrace', literal: '{' },
      { type: 'rbrace', literal: '}' },
      { type: 'comma', literal: ',' },
      { type: 'semicolon', literal: ';' },
    ];

    expect(tokens).toEqual(expected);
  });

  test(`identifiers and numbers`, () => {
    const input = `
      let five = 5;
      let ten = 10;
    `;

    const expected: Token[] = [
      { type: 'let', literal: 'let' },
      { type: 'ident', literal: 'five' },
      { type: 'assign', literal: '=' },
      { type: 'int', literal: '5' },
      { type: 'semicolon', literal: ';' },
      { type: 'let', literal: 'let' },
      { type: 'ident', literal: 'ten' },
      { type: 'assign', literal: '=' },
      { type: 'int', literal: '10' },
      { type: 'semicolon', literal: ';' },
    ];

    const tokens = lexer(input);
    expect(tokens).toEqual(expected);
  });

  test('fn keyword', () => {
    const input = `
      let add = fn(x, y) {
        x + y;
      };
      let result = add(five, ten);
    `;

    const expected: Token[] = [
      { type: 'let', literal: 'let' },
      { type: 'ident', literal: 'add' },
      { type: 'assign', literal: '=' },
      { type: 'function', literal: 'function' },
      { type: 'lparen', literal: '(' },
      { type: 'ident', literal: 'x' },
      { type: 'comma', literal: ',' },
      { type: 'ident', literal: 'y' },
      { type: 'rparen', literal: ')' },
      { type: 'lbrace', literal: '{' },
      { type: 'ident', literal: 'x' },
      { type: 'plus', literal: '+' },
      { type: 'ident', literal: 'y' },
      { type: 'semicolon', literal: ';' },
      { type: 'rbrace', literal: '}' },
      { type: 'semicolon', literal: ';' },
      { type: 'let', literal: 'let' },
      { type: 'ident', literal: 'result' },
      { type: 'assign', literal: '=' },
      { type: 'ident', literal: 'add' },
      { type: 'lparen', literal: '(' },
      { type: 'ident', literal: 'five' },
      { type: 'comma', literal: ',' },
      { type: 'ident', literal: 'ten' },
      { type: 'rparen', literal: ')' },
      { type: 'semicolon', literal: ';' },
    ];

    const tokens = lexer(input);
    expect(tokens).toEqual(expected);
  });

  test('more special characters: !-/*><', () => {
    const input = `
      !-/*5;
      5 < 10 > 5;
    `;

    const expected: Token[] = [
      { type: 'bang', literal: '!' },
      { type: 'minus', literal: '-' },
      { type: 'slash', literal: '/' },
      { type: 'asterisk', literal: '*' },
      { type: 'int', literal: '5' },
      { type: 'semicolon', literal: ';' },
      { type: 'int', literal: '5' },
      { type: 'lt', literal: '<' },
      { type: 'int', literal: '10' },
      { type: 'gt', literal: '>' },
      { type: 'int', literal: '5' },
      { type: 'semicolon', literal: ';' },
    ];

    const tokens = lexer(input);
    expect(tokens).toEqual(expected);
  });

  test('conditionals', () => {
    const input = `
      if (5 < 10) {
        return true;
      } else {
        return false;
      }
    `;

    const expected: Token[] = [
      { type: 'if', literal: 'if' },
      { type: 'lparen', literal: '(' },
      { type: 'int', literal: '5' },
      { type: 'lt', literal: '<' },
      { type: 'int', literal: '10' },
      { type: 'rparen', literal: ')' },
      { type: 'lbrace', literal: '{' },
      { type: 'return', literal: 'return' },
      { type: 'true', literal: 'true' },
      { type: 'semicolon', literal: ';' },
      { type: 'rbrace', literal: '}' },
      { type: 'else', literal: 'else' },
      { type: 'lbrace', literal: '{' },
      { type: 'return', literal: 'return' },
      { type: 'false', literal: 'false' },
      { type: 'semicolon', literal: ';' },
      { type: 'rbrace', literal: '}' },
    ];

    const tokens = lexer(input);
    expect(tokens).toEqual(expected);
  });

  test('eq and neq', () => {
    const input = `
      10 == 10;
      10 != 9;
    `;

    const expected: Token[] = [
      { type: 'int', literal: '10' },
      { type: 'eq', literal: '==' },
      { type: 'int', literal: '10' },
      { type: 'semicolon', literal: ';' },
      { type: 'int', literal: '10' },
      { type: 'neq', literal: '!=' },
      { type: 'int', literal: '9' },
      { type: 'semicolon', literal: ';' },
    ];

    const tokens = lexer(input);
    expect(tokens).toEqual(expected);
  });
});