import { Token, TokenType } from './lexer';

const LOWEST = 1;
const EQUALS = 2;
const LESSGREATER = 3;
const SUM = 4;
const PRODUCT = 5;
const PREFIX = 6;
const CALL = 7;

export function parser(tokens: Token[]) {
  let statements: any = [];
  let errors: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'let') {
      const { statement, endIndex } = parseLetStatement(i);
      statements.push(statement);
      i = endIndex;
    } else if (token.type === 'return') {
      const { statement, endIndex } = parseReturnStatement(i);
      statements.push(statement);
      i = endIndex;
    } else {
      const { statement, endIndex } = parseExpressionStatement(i);
      statements.push(statement);
      i = endIndex;
    }
  }

  function parseLetStatement(startIndex: number) {
    const startToken = tokens[startIndex];
    const identifierToken = tokens[startIndex + 1];

    if (identifierToken.type !== 'ident') {
      errors.push(
        `identifier token not found for token ${JSON.stringify({
          token: startToken,
          index: startIndex,
        })}`
      );
    }

    const identifier = identifierToken.literal;

    const assignToken = tokens[startIndex + 2];

    if (assignToken.type !== 'assign') {
      errors.push(
        `assign token not found for token ${JSON.stringify({
          token: identifierToken,
          index: startIndex + 2,
        })}`
      );
    }

    const { endIndex, expression } = parseExpression(startIndex + 3);

    return {
      startIndex,
      endIndex,
      statement: {
        ...expression,
        type: 'let',
        identifier,
      },
    };
  }

  function parseReturnStatement(startIndex: number) {
    const { endIndex, expression } = parseExpression(startIndex + 1);

    return {
      statement: {
        ...expression,
        type: 'return',
      },
      endIndex,
    };
  }

  function parseExpressionStatement(startIndex: number) {
    const { endIndex, expression } = parseExpression(startIndex);

    return {
      startIndex,
      endIndex,
      statement: expression,
    };
  }

  function parseExpression(startIndex: number, precedence: number = LOWEST) {
    let expression: any = {};
    let endIndex = startIndex;

    const token = tokens[startIndex];

    if (token.type === 'bang' || token.type === 'minus') {
      const { endIndex: end, expression: e } = parseExpression(
        startIndex + 1,
        PREFIX
      );

      expression.type = 'prefix-operator';
      expression.value = e;
      expression.operator = token.literal;

      endIndex = end;
    }

    if (token.type === 'int') {
      expression.type = 'integer-literal';
      expression.value = parseInt(token.literal);
      endIndex = startIndex + 1;
    }

    if (token.type === 'ident') {
      expression.type = 'identifier';
      expression.value = token.literal;
      endIndex = startIndex + 1;
    }

    const nextToken = tokens[endIndex];
    const nextPrecendence = precedenceMap[nextToken?.type] || LOWEST;

    const isInfix =
      nextPrecendence > precedence && nextToken.type != 'semicolon';

    if (isInfix) {
      const { endIndex: end, expression: right } = parseExpression(
        endIndex + 1,
        nextPrecendence
      );

      const left = expression;

      expression = {
        left,
        operator: nextToken.literal,
        right,
      };

      endIndex = end;
    }

    return { expression, endIndex, startIndex };
  }

  return { statements, errors };
}

// @ts-ignore
const precedenceMap: Record<TokenType, number> = {
  eq: EQUALS,
  neq: EQUALS,
  lt: LESSGREATER,
  gt: LESSGREATER,
  plus: SUM,
  minus: SUM,
  slash: PRODUCT,
  asterisk: PRODUCT,
};
