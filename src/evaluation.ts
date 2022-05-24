export function evaluate(statements: any[], environment: any = {}) {
  let result;

  for (let statement of statements) {
    result = evaluateStatement(statement);

    if (statement.type === 'return') {
      return result;
    }
  }

  return result;

  function evaluateStatement(statement: any, scope = {}) {
    // console.log({ statement });
    if (statement.type === 'let') {
      const value = evaluateStatement(statement.value, scope);
      environment[statement.identifier] = value;
      scope[statement.identifier] = value;
    }

    if (statement.type === 'identifier') {
      if (!environment[statement.value] && !scope[statement.value]) {
        console.error(`unable to find identifier: ${statement.value}`);
      }

      const local = scope?.[statement.value];
      const outer = environment?.[statement.value];

      if (local != null) {
        return local;
      }

      return outer;
    }

    if (statement.type === 'call') {
      const fn: any = environment[statement.function.identifier];
      let inner = { ...scope, ...fn?.scope };

      if (!fn) {
        console.error(
          `unable to find function identifier: ${statement.function.identifier}`
        );
      }

      for (let i = 0; i < fn.parameters.length; i++) {
        const parameter = fn.parameters[i];
        const arg = statement.arguments[i];

        if (arg != null) {
          const value = evaluateStatement(arg, inner);
          inner[parameter.value] = value;
          // environment[parameter.value] = value;
        }
      }

      for (let s of fn.body.statements) {
        return evaluateStatement(s, inner);
      }
    }

    if (statement.type === 'function-literal') {
      return {
        ...statement,
        scope,
      };
    }

    if (statement.type === 'integer-literal') {
      return statement.value;
    }

    if (statement.type === 'boolean-literal') {
      return statement.value;
    }

    if (statement.type === 'infix-operator') {
      const left = evaluateStatement(statement.left, scope);
      const right = evaluateStatement(statement.right, scope);

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
      const value = evaluateStatement(statement.value, scope);

      if (statement.operator === '!') {
        return !value;
      }

      if (statement.operator === '-') {
        return -value;
      }
    }

    if (statement.type === 'if') {
      const condition = evaluateStatement(statement.condition, scope);
      if (Boolean(condition)) {
        const csq = evaluateStatement(statement.consequence, scope);
        return csq;
      } else if (statement.alternative != null) {
        return evaluateStatement(statement.alternative, scope);
      } else {
        return null;
      }
    }

    if (statement.type === 'block') {
      return evaluateBlock(statement, scope);
    }

    if (statement.type === 'return') {
      return evaluateStatement(statement.value, scope);
    }
  }

  function evaluateBlock(blockStatement: any, scope = {}) {
    let result;

    for (let s of blockStatement.statements) {
      result = evaluateStatement(s, scope);

      s.type === 'return';
      return result;
    }

    return result;
  }
}
