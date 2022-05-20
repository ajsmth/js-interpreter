export function evaluate(statement: any) {
  if (statement.type === 'integer-literal') {
    return statement.value;
  }

  if (statement.type === 'boolean-literal') {
    return statement.value;
  }

  if (statement.type === 'infix-operator') {
    const left = evaluate(statement.left);
    const right = evaluate(statement.right);

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
      return left < right
    }

    if (statement.operator === '>') {
      return left > right
    }

    if (statement.operator === '!=') {
      return left != right
    }

    if (statement.operator === '==') {
      return left == right
    }
  }

  if (statement.type === 'prefix-operator') {
    const value = evaluate(statement.value);

    if (statement.operator === '!') {
      return !value;
    }

    if (statement.operator === '-') {
      return -value;
    }
  }
}
