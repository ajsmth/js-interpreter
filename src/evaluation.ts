export function evaluate(statements: any[]) {
  let result;

  for (let statement of statements) {
    result = evaluateStatement(statement);
    
    if (statement.type === 'return') {
      return result;
    }
  }

  return result;

  function evaluateStatement(statement: any) {
    if (statement.type === 'integer-literal') {
      return statement.value;
    }

    if (statement.type === 'boolean-literal') {
      return statement.value;
    }

    if (statement.type === 'infix-operator') {
      const left = evaluateStatement(statement.left);
      const right = evaluateStatement(statement.right);

      if (statement.operator === '+') {
        return left + right;
      }

      if (statement.operator === '-') {
        return left - right;
      }

      if (statement.operator === '*') {
        return left * right;
      }

      if (statement.operator === '/') {
        return left / right;
      }

      if (statement.operator === '<') {
        return left < right;
      }

      if (statement.operator === '>') {
        return left > right;
      }

      if (statement.operator === '!=') {
        return left != right;
      }

      if (statement.operator === '==') {
        return left == right;
      }
    }

    if (statement.type === 'prefix-operator') {
      const value = evaluateStatement(statement.value);

      if (statement.operator === '!') {
        return !value;
      }

      if (statement.operator === '-') {
        return -value;
      }
    }

    if (statement.type === 'if') {
      const condition = evaluateStatement(statement.condition);
      if (Boolean(condition)) {
        const csq = evaluateStatement(statement.consequence);
        return csq
      } else if (statement.alternative != null) {
        return evaluateStatement(statement.alternative);
      } else {
        return null;
      }
    }

    if (statement.type === 'block') {
      return evaluateBlock(statement);
    }

    if (statement.type === 'return') {
      return evaluateStatement(statement.value);
    }
  }

  function evaluateBlock(blockStatement: any) {
    let result;

    for (let s of blockStatement.statements) {
      result = evaluateStatement(s);

      s.type === 'return';
      return result;
    }

    return result;
  }
}
