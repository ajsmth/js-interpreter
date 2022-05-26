export function lexer(input: string) {
  const tokens: Token[] = [];

  for (let index = 0; index < input.length; index++) {
    let char = input[index];
    let nextChar = input[index + 1];

    if (isWhitespace(char)) {
      continue;
    }

    let token: Token = { type: 'unknown', literal: char };

    if (specialChars[char]) {
      token = specialChars[char];
    }

    if (token.type === 'bang' && nextChar === '=') {
      token = { type: 'neq', literal: '!=' };
      index += 1;
    }

    if (token.type === 'assign' && nextChar === '=') {
      token = { type: 'eq', literal: '==' };
      index += 1;
    }

    if (token.type === 'unknown' && char != null) {
      if (isLetter(char)) {
        let i = index;
        let c = input[i];
        let word = '';

        while (isLetter(c)) {
          word += c;
          i += 1;
          c = input[i];
        }

        if (keywords[word]) {
          token = keywords[word];
        } else {
          token = {
            type: 'ident',
            literal: word,
          };
        }

        index = i - 1;
      }

      if (char === '"') {
        let string = '';

        index += 1 
        char = input[index]

        while (char !== '"') {
          string += char;
          index += 1;
          char = input[index];
        }

        token = {
          type: 'string',
          literal: string,
        };
      }

      if (isDigitCode(char)) {
        let i = index;
        let c = input[i];
        let digits = '';

        while (isDigitCode(c)) {
          digits += c;
          i += 1;
          c = input[i];
        }

        token = {
          type: 'int',
          literal: digits,
        };

        index = i - 1;
      }
    }

    tokens.push(token);
  }

  tokens.push({ type: 'eof', literal: 'eof' });

  return tokens;
}

const keywords: Record<string, Token> = {
  let: { type: 'let', literal: 'let' },
  fn: { type: 'function', literal: 'function' },
  if: { type: 'if', literal: 'if' },
  else: { type: 'else', literal: 'else' },
  true: { type: 'true', literal: 'true' },
  false: { type: 'false', literal: 'false' },
  return: { type: 'return', literal: 'return' },
};

const specialChars: Record<string, Token> = {
  '+': { type: 'plus', literal: '+' },
  '-': { type: 'minus', literal: '-' },
  '>': { type: 'gt', literal: '>' },
  '<': { type: 'lt', literal: '<' },
  '!': { type: 'bang', literal: '!' },
  '*': { type: 'asterisk', literal: '*' },
  '/': { type: 'slash', literal: '/' },
  ',': { type: 'comma', literal: ',' },
  ';': { type: 'semicolon', literal: ';' },
  '=': { type: 'assign', literal: '=' },
  '(': { type: 'lparen', literal: '(' },
  ')': { type: 'rparen', literal: ')' },
  '{': { type: 'lbrace', literal: '{' },
  '}': { type: 'rbrace', literal: '}' },
};

function isLetter(c?: string) {
  return c?.toLowerCase() != c?.toUpperCase();
}

function isDigitCode(char: string) {
  return char >= '0' && char <= '9';
}

function isWhitespace(ch: string) {
  return ch == ' ' || ch == '\t' || ch == '\n';
}

export type Token = {
  type: TokenType;
  literal: string;
};

export type TokenType =
  | 'assign'
  | 'illegal'
  | 'semicolon'
  | 'lparen'
  | 'rparen'
  | 'comma'
  | 'plus'
  | 'minus'
  | 'bang'
  | 'asterisk'
  | 'slash'
  | 'lt'
  | 'gt'
  | 'lbrace'
  | 'rbrace'
  | 'eof'
  | 'let'
  | 'ident'
  | 'int'
  | 'function'
  | 'eof'
  | 'true'
  | 'false'
  | 'if'
  | 'else'
  | 'return'
  | 'eq'
  | 'neq'
  | 'unknown'
  | 'string';
