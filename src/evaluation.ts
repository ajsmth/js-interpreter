const builtIn = {
  len: (value: any) => {
    return value.length;
  },
  first: (value: any) => {
    return value[0];
  },
  last: (value: any) => {
    return value[value.length - 1];
  },
  rest: (array: any[]) => {
    return array.slice(1);
  },
  push: (arr: any[], value: any) => {
    arr.push(value);
    return arr;
  },
};

export function evaluate(statements: any[], environment: any = {}) {
  environment = {
    ...builtIn,
    ...environment,
  };

  let result;

  for (let statement of statements) {
    result = evaluateStatement(statement);

    if (statement.type === 'return') {
      return result;
    }
  }

  return result;

  function evaluateStatement(statement: any, scope = {}) {
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

      if (builtIn[statement.function.identifier]) {
        const args = statement.arguments.map(argument =>
          evaluateStatement(argument, inner)
        );
        return builtIn[statement.function.identifier](...args);
      }

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

    if (statement.type === 'string-literal') {
      return statement.value;
    }

    if (statement.type === 'array-literal') {
      return evaluateArray(statement, scope);
    }

    if (statement.type === 'hash-literal') {
      return evaluateHash(statement, scope);
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

      if (statement.operator === 'index') {
        return left[right];
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

  function evaluateArray(arrayLiteralStatement: any, scope: any) {
    let arr: any = [];

    for (let element of arrayLiteralStatement.elements) {
      arr.push(evaluateStatement(element, scope));
    }

    return arr;
  }

  function evaluateHash(hashStatement: any, scope: any) {
    let hash = {};

    for (const entry of hashStatement.entries) {
      const key = evaluateStatement(entry.key);
      const value = evaluateStatement(entry.value);
      hash[key] = value;
    }

    return hash;
  }
}
