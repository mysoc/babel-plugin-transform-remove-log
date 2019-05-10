'use strict';

module.exports = function({ types: t }) {
  // either a literal log.level or a log['level'] will be replaced
  const isExcluded = (property, excludeArray) => excludeArray && excludeArray.some(name => property.isIdentifier({ name }) || property.isStringLiteral({ value: name }));

  const isLogId = id => id.isIdentifier({ name: 'log' });

  const isExcludedLog = (memberExpr, excludeArray) => {
    const object = memberExpr.get('object');
    const property = memberExpr.get('property');

    if (!isExcluded(property, excludeArray)) return false;
    if (isLogId(object)) return true;

    return isLogId(object.get('object')) && (property.isIdentifier({ name: 'call' }) || property.isIdentifier({ name: 'apply' }));
  };

  const createNoop = () => t.functionExpression(null, [], t.blockStatement([]));

  const createVoid0 = () => t.unaryExpression('void', t.numericLiteral(0));

  const isExcludedLogBind = (memberExpr, excludeArray) => {
    const object = memberExpr.get('object');
    if (!object.isMemberExpression()) return false;

    const property = object.get('property');

    if (!isExcluded(property, excludeArray)) return false;

    return isLogId(object.get('object')) && memberExpr.get('property').isIdentifier({ name: 'bind' });
  };


  return {
    name: 'transform-remove-log',
    visitor: {
      CallExpression(path, state) {
        const callee = path.get('callee');
        if (!callee.isMemberExpression()) return;

        if (isExcludedLog(callee, state.opts.exclude)) {
          if (path.parentPath.isExpressionStatement()) {
            path.remove();
          }
          else {
            path.replaceWith(createVoid0());
          }
        }
        else if (isExcludedLogBind(callee, state.opts.exclude)) {
          path.replaceWith(createNoop());
        }
      },
      MemberExpression: {
        exit(path, state) {
          if (isExcludedLog(path, state.opts.exclude) && !path.parentPath.isMemberExpression()) {
            if (path.parentPath.isAssignmentExpression() && path.parentKey === 'left') {
              path.parentPath.get('right').replaceWith(createNoop());
            }
            else {
              path.replaceWith(createNoop());
            }
          }
        }
      }
    }
  };
};
