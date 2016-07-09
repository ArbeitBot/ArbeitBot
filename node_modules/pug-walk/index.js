'use strict';

module.exports = walkAST;
function walkAST(ast, before, after, options) {
  if (after && typeof after === 'object' && typeof options === 'undefined') {
    options = after;
    after = null;
  }
  options = options || {includeDependencies: false};
  function replace(replacement) {
    ast = replacement;
  }
  var result = before && before(ast, replace);
  if (before && result === false) {
    return ast;
  }
  switch (ast.type) {
    case 'NamedBlock':
    case 'Block':
      ast.nodes = ast.nodes.map(function (node) {
        return walkAST(node, before, after, options);
      });
      break;
    case 'Case':
    case 'Filter':
    case 'Mixin':
    case 'Tag':
    case 'InterpolatedTag':
    case 'When':
    case 'Code':
    case 'While':
      if (ast.block) {
        ast.block = walkAST(ast.block, before, after, options);
      }
      break;
    case 'Each':
      if (ast.block) {
        ast.block = walkAST(ast.block, before, after, options);
      }
      if (ast.alternate) {
        ast.alternate = walkAST(ast.alternate, before, after, options);
      }
      break;
    case 'Conditional':
      if (ast.consequent) {
        ast.consequent = walkAST(ast.consequent, before, after, options);
      }
      if (ast.alternate) {
        ast.alternate = walkAST(ast.alternate, before, after, options);
      }
      break;
    case 'Include':
      walkAST(ast.block, before, after, options);
      walkAST(ast.file, before, after, options);
      break;
    case 'Extends':
    case 'RawInclude':
      walkAST(ast.file, before, after, options);
      break;
    case 'Attrs':
    case 'BlockComment':
    case 'Comment':
    case 'Doctype':
    case 'Literal':
    case 'MixinBlock':
    case 'YieldBlock':
    case 'Text':
      break;
    case 'FileReference':
      if (options.includeDependencies && ast.ast) {
        walkAST(ast.ast, before, after, options);
      }
      break;
    default:
      throw new Error('Unexpected node type ' + ast.type);
      break;
  }
  after && after(ast, replace);
  return ast;
};
