class Component {
    constructor({path, key, index}) {
        this.path = path;
        this.key = key;
        this.index = index;
        this.children = {};
        this.renderCache = {};
        this.mjsMethods = {};
        this.needsUpdate = true;
    }

    // Make given methods callable from the mjs context. This involves binding
    // the instance to them (so this will always be set correctly) and then
    // setting _mjsCallable true on the bound method.
    addMjsMethods(methodNames) {
        for (var method of methodNames) {
            this[method] = this[method].bind(this);
            this[method]._mjsCallable = true;
            this.mjsMethods[method] = this[method];
        }
    }

    _mjsRead(key) {
        if (this.children[key]) return this.children[key];
        if (this[key] && this[key]._mjsCallable) return this[key];
    }
    _mjsEvaluate() {
        var fieldKeys = Object.keys(this.children), methodKeys = Object.keys(this.mjsMethods);
        return `Instance of ${this.constructor.name}. `
            + `\n Fields: [${fieldKeys.join(', ')}]`
            + `\n Methods: [${methodKeys.join(', ')}]`;
    }

    child(classOrFunction, props) {
        for (var k in props) {
            if (typeof props[k] !== 'string') continue;
            props[k] = this.expandExpression(props[k]);
        }
        if (!(classOrFunction.prototype instanceof Component)) {

            return classOrFunction(props);
        }
        if (!props.key) {
            throw new Error(`${classOrFunction} Component requires a key`);
        }
        props.path = (this.path || '') + props.key + '.';
        let instance, isNew = false;
        if (typeof props.index === 'number') {
            props.path = `${(this.path || '')}${props.key}[${props.index}].`;
            instance = new classOrFunction(props);
            this.children[props.key] = this.children[props.key] || [];
            instance = this.children[props.key][props.index];
            if (!instance) {
                isNew = true;
                instance = new classOrFunction(props);
                instance.parent = this;
                this.children[props.key][props.index] = instance;
            }
        } else {
            instance = this.children[props.key];
            if (!instance) {
                isNew = true;
                instance = new classOrFunction(props);
                instance.parent = this;
                this.children[props.key] = instance;
            }
        }
        var renderKey = `cmp-${props.path}`.replace(/[.\[\]]/g, '_');
        if (!this.renderCache[renderKey] || instance.needsUpdate) {
            this.renderCache[renderKey] = $(instance.render()).attr('id', renderKey)[0].outerHTML;
            instance.needsUpdate = false;
            // Add a class to mark this as updated.
            return $(this.renderCache[renderKey]).addClass(isNew ? 'cmp-new' : 'cmp-updated')[0].outerHTML;
        }
        return this.renderCache[renderKey];
    }

    expandExpression(expression) {
        return expression.replace('this.', this.path);
    }

    markToUpdate() {
        this.needsUpdate = true;
        if (this.parent) this.parent.markToUpdate();
    }
}

var Button = ({action, label}) => {
    return `<button class="gameButton" action="${action}">${label}</button>`;
};

var Text = ({action}) => {
    var rootScope = makeRootScope();
    var value = parseAndRunProgram(action, rootScope, 20, true).abbreviate();
    return `<span class="textValue" action="${action}">${value}</span>`;
};
