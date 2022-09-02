
class ProcessNode {
    constructor({programNode, node, scope, loopNode, callerNode, canCreateVariablesInScope}) {
        // Reference to the parsed program tree node that this node is processing.
        this.programNode = programNode;
        // Immediate ancestor of this node
        this.parentNode = node;
        // Ancestor node with the previous scope. This let's us skip intermediate ancestors with the same scope.
        this.parentScopeNode = scope ? node : node.parentScopeNode;
        // current scope for this node.
        this.scope = scope ? scope : node.scope;
        this.loopNode = loopNode ? loopNode : (node && node.loopNode);
        this.callerNode = callerNode ? callerNode : (node && node.callerNode);
        // Last result calculated by a child node. Used to "return" values to parent nodes.
        this.lastResult;
        // Set when the node has an unconsumed result from a child node.
        this.hasResult = false;
    }

    setLastResult(value) {
        this.lastResult = value;
        this.hasResult = true;
    }

    consumeLastResult() {
        this.hasResult = false;
        const result = this.lastResult;
        delete this.lastResult;
        return result;
    }
}
class ProcessFunction {
    constructor({functionProgramNode}) {
        this.functionProgramNode = functionProgramNode;
    }
}

Array.prototype._mjsRead = function (key) {
    return this[key];
}

class RootScope {
    constructor(reserved, globals = {}) {
        this.reserved = reserved;
        this.reserved.root = this;
        this.globals = globals;
    }
    _mjsRead(key) {
        if (this.reserved.hasOwnProperty(key)) {
            return this.reserved[key];
        }
        return this.globals[key];
    }
    _mjsWrite(key, value) {
        if (this.reserved.hasOwnProperty(key)) {
            throw new Error(`${key} is reserved.`)
        }
        this.globals[key] = value;
    }
    _mjsEvaluate() {
        return Object.keys(this.reserved).join(', ') + ' : ' + Object.keys(this.globals).join(', ')
    }
}

function getCycles() {
    return state.cycles;
}
getCycles._mjsCallable = true;

function makeRootScope() {
    return new RootScope({ui: game, log: logInfo, cycles: getCycles});
}

function parseAndRunProgram(program, rootScope = {}, steps = 10, fromSystem = false) {
    return runProgram(parseProgram(program), rootScope, steps, fromSystem);
}

function parseProgram(program) {
    return mjs.parse(program);
}

function runProgram(program, rootScope = {}, steps = 1, fromSystem = false) {
    var rootNode = new ProcessNode({programNode: program, scope: rootScope});
    return runProgramSteps(rootNode, steps, fromSystem);
}

function runProgramSteps(currentNode, steps, fromSystem) {
    while (steps-- > 0) {
        if (!fromSystem && !spendCycles(1)) {
            logError('Ran out of cycles!');
            return;
        }
        currentNode = runProgramStep(currentNode);
        // Once the program is finished, return the value of the last statement.
        if (!(currentNode instanceof ProcessNode)) return currentNode;
    }
    return currentNode;
}

function runProgramStep(node) {
    // if (node) console.log({...node.programNode}, {...node});
    // else console.log(node)
    // Many nodes create arrays of elements to process as nodes (expressions, statements, variables).
    if (node.arrayToProcess) {
        // Once all statements are run, return the last result
        if (node.nextIndexToProcess >= node.arrayToProcess.length) {
            // If this is not the root node, then set last result and step back out to the parent.
            if (node.parentNode) {
                node.parentNode.setLastResult(node.consumeLastResult());
                return node.parentNode;
            }
            // If this is the root node, just return the final result.
            let value = node.consumeLastResult();
            if (value && value._mjsEvaluate) value = value._mjsEvaluate();
            return value;
        }
        // Return the node for processing the next statement.
        return new ProcessNode({programNode: node.arrayToProcess[node.nextIndexToProcess++], node});
    }
    // This will happen when an empty node or string/number/boolean is reached.
    if (!node.programNode || !(node.programNode instanceof Object)) {
        node.parentNode.setLastResult(node.programNode);
        return node.parentNode;
    }
    // Program will have array of elements on it.
    if (node.programNode.elements) {
        node.arrayToProcess = [];
        for (var element of node.programNode.elements) {
            if (!element) continue; // skip empty lines
            if (element instanceof Object && element.type === 'function') {
                node.scope[element.id] = new ProcessFunction(element);
                continue;
            }
            node.arrayToProcess.push(element);
        }
        node.nextIndexToProcess = 0;
        return runProgramStep(node);
    }
    // CompoundStatement will have array of statements on it.
    if (node.programNode.statements) {
        node.arrayToProcess = node.programNode.statements;
        node.nextIndexToProcess = 0;
        // Evaluate the first statement this step.
        return runProgramStep(node);
    }
    if (node.programNode.variables) {
        node.arrayToProcess = node.programNode.variables;
        node.nextIndexToProcess = 0;
        // Evaluate the first variable this step.
        return runProgramStep(node);
    }
    if (node.programNode.expressions) {
        node.arrayToProcess = node.programNode.expressions;
        node.nextIndexToProcess = 0;
        // Evaluate the first expression this step.
        return runProgramStep(node);
    }
    // Start of a For loop.
    if (node.programNode.hasOwnProperty('variablesOrExpressions') && !node.processedVariables) {
        node.processedVariables = true;
        if (node.programNode.variablesOrExpressions) {
            return new ProcessNode({programNode: node.programNode.variablesOrExpressions, node});
        }
    }
    // Condition for if, for, or while loop.
    if (node.programNode.hasOwnProperty('conditionExpressions') && !node.processedCondition) {
        node.processedCondition = true;
        return new ProcessNode({programNode: {expressions: node.programNode.conditionExpressions}, node});
    }
    if (node.programNode.type === 'ifelse') {
        if (!node.processedBranch) {
            node.processedBranch = true;
            const conditionResult = node.consumeLastResult();
            if (conditionResult && node.programNode.trueStatement) {
                return new ProcessNode({programNode: node.programNode.trueStatement, node});
            }
            if (!conditionResult && node.programNode.falseStatement) {
                return new ProcessNode({programNode: node.programNode.falseStatement, node});
            }
        }
        node.parentNode.setLastResult(node.consumeLastResult());
        return node.parentNode;
    }
    if (node.programNode.type === 'while') {
        if (node.consumeLastResult()) {
            // Clear this to run it again after this iteration completes.
            node.processedCondition = false;
            return new ProcessNode({programNode: node.programNode.statement, node, loopNode: node});
        }
        // If the condition is false, return control back to the parent.
        node.parentNode.setLastResult(undefined);
        return node.parentNode;
    }
    if (node.programNode.type === 'for') {
        if (!node.processedBody) {
            node.processedBody = true;
            var conditionResult = node.consumeLastResult();
            if (conditionResult) {
                // Clear this to run it again after this iteration completes.
                return new ProcessNode({programNode: node.programNode.statement, node});
            }
            // If the condition is false, return control back to the parent.
            node.parentNode.setLastResult(undefined);
            return node.parentNode;
        }
        // Set these to false so they will run again for the next iteration.
        node.processedCondition = false;
        node.processedBody = false;
        if (node.programNode.incrementExpressions) {
            return new ProcessNode({programNode: {expressions: node.programNode.incrementExpressions}, node});
        }
        // If there is no increment expression, then just keep processing the for loop.
        return node;
    }
    if (node.programNode.type === 'continue') {
        if (!node.loopNode) throw new Error('Unexpected "continue" statement.');
        return node.loopNode;
    }
    if (node.programNode.type === 'break') {
        if (!node.loopNode) throw new Error('Unexpected "break" statement.');
        return node.loopNode.parentNode;
    }
    if (node.programNode.type === 'return') {
        if (!node.callerNode) throw new Error('Unexpected "return" statement.');
        if (!node.processedExpression) {
            node.processedExpression = true;
            if (node.programNode.expressions) {
                return new ProcessNode({programNode: node.programNode.expressions, node});
            }
        }
        node.callerNode.setLastResult(node.consumeLastResult());
        return node.callerNode;
    }
    // Handle type 'forin' here (evaluate iterableExpression, set array of values on node, then run the body for each value).

    // Scoped assignment is simple because the value is always set in the current scope.
    if (node.programNode.type === 'scopedAssignment') {
        if (node.programNode.hasOwnProperty('valueExpression') && !node.hasResult) {
            return new ProcessNode({programNode: node.programNode.valueExpression, node});
        }
        var value = node.consumeLastResult();
        node.scope._mjsWrite(node.programNode.id, value);
        node.parentNode.setLastResult(value);
        return node.parentNode;
    }
    // This is used by regular assignments, incrementBefore, and incrementAfter.
    if (node.programNode.hasOwnProperty('targetExpression') && !node.targetObject) {
        if (!node.hasResult) {
            return new ProcessNode({programNode: node.programNode.targetExpression, node});
        }
        var value = node.consumeLastResult();
        node.targetObject = value.targetObject;
        node.targetKey = value.targetKey;
    }
    // Normal assignment is tricky since we have to evaluate the member expression, and search for the base member in parent
    // scopes if it isn't found.
    if (node.programNode.type === 'assignment') {
        if (!node.hasResult) {
            return new ProcessNode({programNode: node.programNode.valueExpression, node});
        }
        var value = node.consumeLastResult();
        var currentValue = node.targetObject._mjsRead(node.targetKey);
        switch (node.programNode.assignmentOperator) {
            case '=':
                currentValue = value;
                break;
            case '+=':
                currentValue += value;
                break;
            case '=':
                currentValue -= value;
                break;
        }
        writeToNodeTarget(node, currentValue);
        node.parentNode.setLastResult(currentValue);
        return node.parentNode;
    }
    // {type: 'binary', leftExpression: $1, operator: $2, rightExpression: $3}
    if (node.programNode.type === 'binary') {
        if (!node.processedLeftValue) {
            if (!node.hasResult) {
                return new ProcessNode({programNode: node.programNode.leftExpression, node});
            }
            node.processedLeftValue = true;
            node.leftValue = node.consumeLastResult();
        }
        // Short circuit && and || operators.
        if (
            (node.programNode.operator === '&&' && !node.leftValue) ||
            (node.programNode.operator === '||' && node.leftValue)
        ) {
            node.parentNode.setLastResult(node.leftValue);
            return node.parentNode;
        }
        if (!node.hasResult) {
            return new ProcessNode({programNode: node.programNode.rightExpression, node});
        }
        var result = evaluateBinaryExpression(node.leftValue, node.programNode.operator, node.consumeLastResult());
        node.parentNode.setLastResult(result);
        return node.parentNode;
    }
    if (node.programNode.type === 'unary') {
        if (!node.hasResult) {
            return new ProcessNode({programNode: node.programNode.expression, node});
        }
        var result = node.consumeLastResult();
        if (result && result._mjsEvaluate) result = result._mjsEvaluate();
        switch (node.programNode.operator){
            case '-':
                result = -result;
                break;
            case '!':
                result = !result;
                break;
        }
        node.parentNode.setLastResult(result);
        return node.parentNode;
    }
    // This is just used to retrieve the value of a variable (as opposed to returning targeting info for it).
    if (node.programNode.type === 'evaluate') {
        node.parentNode.setLastResult(getNodeTarget(node));
        return node.parentNode;
    }
    if (node.programNode.type === 'incrementBefore') {
        var currentValue = node.targetObject._mjsRead(node.targetKey);
        if (currentValue && currentValue._mjsEvaluate) currentValue = currentValue._mjsEvaluate();
        if (node.programNode.operator === '++') currentValue++;
        else currentValue--;
        writeToNodeTarget(node, currentValue);
        node.parentNode.setLastResult(currentValue);
        return node.parentNode;
    }
    if (node.programNode.type === 'incrementAfter') {
        var currentValue = node.targetObject._mjsRead(node.targetKey);
        if (currentValue && currentValue._mjsEvaluate) currentValue = currentValue._mjsEvaluate();
        node.parentNode.setLastResult(currentValue);
        if (node.programNode.operator === '++') currentValue++;
        else currentValue--;
        writeToNodeTarget(node, currentValue);
        return node.parentNode;
    }
    if (node.programNode.type === 'delete') {
        writeToNodeTarget(node, undefined);
        // delete node.targetObject[node.targetKey];
        return node.parentNode;
    }
    if (node.programNode.type === 'readVariable') {
        var id = node.programNode.id;
        var scope = node.scope;
        while (!scope.hasOwnProperty(id) && node.parentScopeNode) {
            scope = node.parentScopeNode;
        }
        node.parentNode.setLastResult({targetObject: scope, targetKey: id});
        return node.parentNode;
    }
    if (node.programNode.type === 'readMember') {
        var targetObject = getNodeTarget(node);
        node.parentNode.setLastResult({targetObject, targetKey: node.programNode.id});
        return node.parentNode;
    }
    if (node.programNode.type === 'readKey') {
        if (!node.hasResult) {
            // scopedObject will cause whatever is evaulated to be read from that object.
            return new ProcessNode({programNode: node.programNode.keyExpression, node});
        }
        var targetObject = getNodeTarget(node);
        node.parentNode.setLastResult({targetObject, targetKey: node.consumeLastResult()});
        return node.parentNode;
    }
    if (node.programNode.type === 'call') {
        if (!node.argumentsReady) {
            node.argumentValues = node.argumentValues || [];
            if (node.hasResult) node.argumentValues.push(node.consumeLastResult());
            if (node.argumentValues.length < node.programNode.arguments.length) {
                return new ProcessNode({programNode: node.programNode.arguments[node.argumentValues.length], node});
            }
            node.argumentsReady = true;
        }
        var targetFunction = getNodeTarget(node);
        // Calling a function defined by the container, we just execute the actual js function.
        if (targetFunction instanceof Function && targetFunction._mjsCallable) {
            node.parentNode.setLastResult({targetObject: targetFunction.apply(node.targetObject, node.argumentValues)});
            return node.parentNode;
        }
        if (node.hasResult) {
            node.parentNode.setLastResult({targetObject: node.consumeLastResult()});
            return node.parentNode;
        }
        if (!(targetFunction instanceof ProcessFunction)) {
            throw new Error(`${node.targetKey} is not a function.`);
        }
        var functionProgramNode = targetFunction.functionProgramNode;
        // Create a new scope populated with the parameter names assigned to the argument values.
        var scope = {};
        for (var i = 0; i < functionProgramNode.parameters.length; i++) {
            var id = functionProgramNode.parameters[i];
            scope[id] = node.argumentValues[i];
        }
        // Mark the current node as the caller (for return statements).
        return new ProcessNode({programNode: functionProgramNode, node, callerNode: node, scope});
    }
    console.log("Unhandled node state:", node)
    throw new Error("Unhandled node state:");
}

function getNodeTarget(node) {
    if (!node.hasOwnProperty('targetKey') || typeof(node.targetKey) === 'undefined') return node.targetObject;
    return node.targetObject._mjsRead(node.targetKey);
}
function writeToNodeTarget(node, value) {
    if (!node.targetObject._mjsWrite) throw new Error(`Cannot write to ${node.targetKey}`);
    node.targetObject._mjsWrite(node.targetKey, value);
}

function evaluateBinaryExpression(l, o, r) {
    if (l && l._mjsEvaluate) l = l._mjsEvaluate();
    if (r && r._mjsEvaluate) r = r._mjsEvaluate();
    switch (o) {
        case '||': return l || r;
        case '&&': return l && r;
        case '|': return l | r;
        case '^': return l ^ r;
        case '&': return l & r;
        case '==': return l == r;
        case '===': return l === r;
        case '!=': return l != r;
        case '!==': return l !== r;
        case '<': return l < r;
        case '<=': return l <= r;
        case '>': return l > r;
        case '>=': return l >= r;
        case '<<': return l << r;
        case '>>': return l >> r;
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return l / r;
        case '%': return l % r;
    }
    throw new Error(`unhandled binary operator: ${o} `);
}
