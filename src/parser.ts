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
    const { statement, endIndex } = parseStatement(i);
    statements.push(statement);
    i = endIndex;
  }

  function parseStatement(startIndex: number = 0) {
    let endIndex = startIndex;
    let statement: any;
    const token = tokens[startIndex];

    if (token.type === 'let') {
      const { statement: s, endIndex: e } = parseLetStatement(startIndex);
      statement = s;
      endIndex = e;
    } else if (token.type === 'return') {
      const { statement: s, endIndex: e } = parseReturnStatement(startIndex);
      statement = s;
      endIndex = e;
    } else {
      const { statement: s, endIndex: e } = parseExpressionStatement(
        startIndex
      );
      statement = s;
      endIndex = e;
    }

    return { endIndex, statement };
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
        type: 'return',
        value: expression,
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

  function parseGroupedExpression(startIndex: number) {
    const { expression, endIndex } = parseExpression(startIndex + 1);

    if (tokens[endIndex].type != 'rparen') {
      errors.push('grouped expression parsing error');
    }

    return { expression, endIndex: endIndex + 1 };
  }

  function parseIfExpression(startIndex: number) {
    let nextToken = tokens[startIndex + 1];

    if (nextToken.type != 'lparen') {
      errors.push(`parseIfExpression() missing lparen`);
    }

    const {
      endIndex: conditionEndIndex,
      expression: condition,
    } = parseExpression(startIndex + 2, LOWEST);

    nextToken = tokens[conditionEndIndex];

    if (nextToken.type != 'rparen') {
      errors.push(`parseIfExpression() missing rparen`);
    }

    nextToken = tokens[conditionEndIndex + 1];
    if (nextToken.type != 'lbrace') {
      errors.push(`parseIfExpression() missing lbrace`);
    }

    const { expression: consequence, endIndex } = parseBlockStatement(
      conditionEndIndex + 2
    );

    nextToken = tokens[endIndex + 1];

    if (nextToken.type === 'else') {
      nextToken = tokens[endIndex + 2];

      if (nextToken.type != 'lbrace') {
        errors.push(`parseIfExpression() missing lbrace`);
      }

      const { expression: alternative, endIndex: e } = parseBlockStatement(
        endIndex + 3
      );

      return {
        expression: {
          type: 'if',
          condition,
          consequence,
          alternative,
        },

        endIndex: e,
      };
    }

    return {
      expression: {
        type: 'if',
        condition,
        consequence,
      },

      endIndex,
    };
  }

  function parseBlockStatement(startIndex: number) {
    let index = startIndex;
    const statements: any = [];

    for (let i = index; i < tokens.length; i++) {
      if (tokens[i].type === 'rbrace') {
        index = i;
        break;
      }

      const { endIndex, statement } = parseStatement(i);

      statements.push(statement);
      i = endIndex;

      if (tokens[i].type === 'rbrace') {
        index = i;
        break;
      }
    }

    return {
      expression: {
        type: 'block',
        statements,
      },
      endIndex: index,
    };
  }

  function parseFunctionLiteral(startIndex: number) {
    let position = startIndex;
    let parameters: any[] = [];

    if (tokens[startIndex + 1].type != 'lparen') {
      errors.push('parseFunctionLiteral() missing lparen');
    }

    for (let i = startIndex + 2; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'comma') {
        continue;
      }

      if (token.type === 'rparen') {
        position = i + 1;
        break;
      }

      parameters.push({
        type: 'identifier',
        value: token.literal,
      });
    }

    if (tokens[position].type != 'lbrace') {
      errors.push('parseFunctionLiteral() missing lbrace');
    }

    position += 1;

    const { expression: body, endIndex: e } = parseBlockStatement(position);

    return {
      expression: {
        type: 'function-literal',
        parameters,
        body: body,
      },
      endIndex: e,
    };
  }

  function parseExpression(startIndex: number, precedence: number = LOWEST) {
    let expression: any = {};
    let endIndex = startIndex;

    const token = tokens[startIndex];

    if (token.type === 'if') {
      const { expression: e, endIndex: i } = parseIfExpression(startIndex);
      expression = e;
      endIndex = i;
    }

    if (token.type === 'function') {
      const { expression: e, endIndex: i } = parseFunctionLiteral(startIndex);
      expression = e;
      endIndex = i;
    }

    if (token.type === 'lparen') {
      const { expression: e, endIndex: i } = parseGroupedExpression(startIndex);
      expression = e;
      endIndex = i;
    }

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

    if (token.type === 'true' || token.type === 'false') {
      expression.type = 'boolean-literal';
      expression.value = token.literal === 'true' ? true : false;
      endIndex = startIndex + 1;
    }

    let nextToken = tokens[endIndex];
    let nextPrecendence = precedenceMap[nextToken?.type] || LOWEST;

    while (
      nextPrecendence > precedence &&
      nextToken != null &&
      nextToken.type !== 'semicolon'
    ) {
      const { endIndex: end, expression: right } = parseExpression(
        endIndex + 1,
        nextPrecendence
      );

      const left = expression;

      expression = {
        type: 'infix-operator',
        left,
        operator: nextToken.literal,
        right,
      };

      endIndex = end;
      nextToken = tokens[endIndex];
      nextPrecendence = precedenceMap[nextToken?.type] || LOWEST;
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
