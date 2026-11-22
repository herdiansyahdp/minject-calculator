/**
 * AST evaluator for the calculator.
 * Walks the AST produced by parser.js and returns a number.
 * Throws CalcError for: division by zero, sqrt of negative.
 */

import { CalcError } from './lexer.js';

/**
 * @param {object} node - AST node from parser
 * @returns {number}
 */
export function evaluate(node) {
  switch (node.type) {
    case 'Number':
      return node.value;

    case 'UnaryOp': {
      const operand = evaluate(node.operand);
      if (node.op === '-') return -operand;
      if (node.op === '√') {
        if (operand < 0) throw new CalcError('Akar dari bilangan negatif tidak terdefinisi');
        return Math.sqrt(operand);
      }
      throw new CalcError(`Operator unary tidak dikenal: '${node.op}'`);
    }

    case 'BinaryOp': {
      const left = evaluate(node.left);
      const right = evaluate(node.right);
      switch (node.op) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/':
          if (right === 0) throw new CalcError('Pembagian dengan nol tidak diizinkan');
          return left / right;
        case '^': return Math.pow(left, right);
        default: throw new CalcError(`Operator tidak dikenal: '${node.op}'`);
      }
    }

    default:
      throw new CalcError(`Tipe node tidak dikenal: '${node.type}'`);
  }
}
