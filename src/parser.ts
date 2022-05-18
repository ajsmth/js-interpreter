import { Token, TokenType } from './lexer';

const LOWEST = 1;
const EQUALS = 2;
const LESSGREATER = 3;
const SUM = 4;
const PRODUCT = 5;
const PREFIX = 6;
const CALL = 7;

const precedenceMap: Map<TokenType, number> = new Map([
  ['eq', EQUALS],
  ['neq', EQUALS],
  ['lt', LESSGREATER],
  ['gt', LESSGREATER],
  ['plus', SUM],
  ['minus', SUM],
  ['slash', PRODUCT],
  ['asterisk', PRODUCT],
  ['lparen', CALL],
]);

const prefixOperators: TokenType[] = ['bang', 'minus'];
const infixOperators: TokenType[] = [
  'bang',
  'minus',
  'plus',
  'asterisk',
  'slash',
  'gt',
  'lt',
  'eq',
  'neq',
];

export function parser(tokens: Token[]) {
  let statements: any = [];
  let errors: string[] = [];

  let index = 0;

  let currentToken = tokens[index];
  let nextToken = tokens[index + 1];

  function advanceTokens(amount = 1) {
    index += amount;
    currentToken = tokens[index];
    nextToken = tokens[index + 1];
  }

  function peekToken(amount = 1) {
    return tokens[index + amount];
  }

  while (currentToken?.type != 'eof') {
    const statement = parseStatement();

    if (statement != null) {
      statements.push(statement);
    }

    advanceTokens();
  }

  function parseStatement() {
    if (currentToken.type === 'let') {
      const statement = parseLetStatement();
      return statement;
    }
    //
    else if (currentToken.type === 'return') {
      const statement = parseReturnStatement();
      return statement;
    }
    //
    else {
      const statement = parseExpressionStatement();
      return statement;
    }
  }

  function parseLetStatement() {
    let statement: any = {
      type: 'let',
    };

    advanceTokens();

    if (currentToken.type != 'ident') {
      // throw error
      errors.push(`Expected ident token`);
    }

    statement.identifier = currentToken.literal;

    advanceTokens();

    if (currentToken.type != 'assign') {
      // throw error
      errors.push(`Expected eq token`);
    }

    advanceTokens();

    const expression = parseExpression();
    statement.value = expression;

    return statement;
  }

  function parseReturnStatement() {
    if (currentToken.type != 'return') {
      // throw error
      errors.push(`Expected return`);
    }

    let statement: any = {
      type: 'return',
    };

    advanceTokens();

    const expression = parseExpression();
    statement.value = expression;

    return statement;
  }

  function parseExpressionStatement() {
    return parseExpression(LOWEST);
  }

  function parseExpression(precedence = 0) {
    let expression;

    // -<expression> or !<expression>
    if (isPrefixOperator(currentToken)) {
      expression = {
        type: 'prefix-operator',
        operator: currentToken.literal,
      };

      advanceTokens();

      const value = parseExpression(PREFIX);
      expression.value = value;
    }

    if (currentToken.type === 'int') {
      expression = {
        type: 'integer-literal',
        value: parseInt(currentToken.literal),
      };

      advanceTokens();
    }
    //
    else if (currentToken.type === 'ident') {
      if (nextToken.type === 'lparen') {
        expression = parseCallExpression();
      } else {
        expression = {
          type: 'identifier',
          value: currentToken.literal,
        };
      }

      advanceTokens();
    }
    //
    else if (currentToken.type === 'true') {
      expression = {
        type: 'boolean-literal',
        value: true,
      };

      advanceTokens();
    }
    //
    else if (currentToken.type === 'false') {
      expression = {
        type: 'boolean-literal',
        value: false,
      };

      advanceTokens();
    }
    //
    else if (currentToken.type === 'lparen') {
      advanceTokens();

      expression = parseExpression(LOWEST);

      // @ts-expect-error
      if (currentToken.type !== 'rparen') {
        errors.push(`Expected rparen`);
      }

      advanceTokens();
    }
    //
    else if (currentToken.type === 'if') {
      expression = {
        type: 'if',
      };

      if (nextToken.type !== 'lparen') {
        errors.push(`Expected lparen`);
      }

      advanceTokens();

      const condition = parseExpression();
      expression.condition = condition;

      // @ts-expect-error
      if (currentToken.type !== 'lbrace') {
        errors.push(`Expected lbrace`);
      }

      advanceTokens();

      const consequence = parseBlockStatement();
      expression.consequence = consequence;

      advanceTokens();

      // @ts-expect-error
      if (currentToken.type === 'else') {
        advanceTokens();

        // @ts-ignore
        if (currentToken.type !== 'lbrace') {
          errors.push(`Expected lbrace`);
        }

        advanceTokens();

        const alternative = parseBlockStatement();
        expression.alternative = alternative;
      }
    }
    //
    else if (currentToken.type === 'function') {
      expression = parseFunctionLiteral();
    }

    const nextPrecedence = precedenceMap.get(currentToken.type) || 0;

    // <expression> <infix> <expression>
    while (isInfixOperator(currentToken) && precedence < nextPrecedence) {
      const infixExpression = parseInfixExpression(expression);
      expression = infixExpression;
    }

    return expression;
  }

  function parseBlockStatement() {
    const statements: any[] = [];

    while (currentToken.type !== 'rbrace' && currentToken.type != 'eof') {
      const statement = parseStatement();

      if (statement != null) {
        statements.push(statement);
      }

      if (currentToken.type === 'semicolon') {
        advanceTokens();
      }
    }

    return {
      statements,
      type: 'block',
    };
  }

  function parseCallExpression() {
    if (currentToken.type !== 'ident') {
      errors.push(`Expected ident`);
    }

    const expression: any = {
      type: 'call',
      function: {
        type: 'function-identifier',
        identifier: currentToken.literal,
      },
    };

    const args: any[] = [];

    advanceTokens(2);

    while (currentToken.type !== 'rparen') {
      const argument = parseExpression();
      args.push(argument);

      if (currentToken.type === 'comma') {
        advanceTokens();
      }

      if (currentToken.type === 'rbrace') {
        advanceTokens();
      }
    }

    expression.arguments = args;
    return expression;
  }

  function parseFunctionLiteral() {
    if (currentToken.type !== 'function') {
      errors.push(`Expected function`);
    }
    advanceTokens();

    if (currentToken.type !== 'lparen') {
      errors.push(`Expected lparen`);
    }

    advanceTokens();

    const parameters: any[] = [];

    while (currentToken.type === 'ident') {
      const parameter = {
        type: 'identifier',
        value: currentToken.literal,
      };

      parameters.push(parameter);

      if (nextToken.type === 'comma') {
        advanceTokens();
      }

      advanceTokens();
    }

    if (currentToken.type !== 'rparen') {
      errors.push(`Expected rparen`);
    }

    advanceTokens();

    if (currentToken.type !== 'lbrace') {
      errors.push(`Expected lbrace`);
    }

    advanceTokens();

    const body = parseBlockStatement();

    return {
      type: 'function-literal',
      parameters,
      body,
    };
  }

  function parseInfixExpression(left) {
    const precedence = precedenceMap.get(currentToken.type) || 0;

    const expression: any = {
      type: 'infix-operator',
      operator: currentToken.literal,
      left,
    };

    advanceTokens();

    const right = parseExpression(precedence);
    expression.right = right;

    return expression;
  }

  function isPrefixOperator(token: Token) {
    return prefixOperators.includes(token.type);
  }

  function isInfixOperator(token: Token) {
    return infixOperators.includes(token.type);
  }

  return { statements, errors };
}
