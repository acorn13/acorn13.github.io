
state.adder = {
    unlocked: false,
    operands: [1,1],
    operator: '+',
    range: 1
};

function rerollOperands() {
    for (let i = 0; i < state.adder.operands.length; i++) {
        state.adder.operands[i] = Math.floor((1 + Math.random()) * state.adder.range);
    }
}

class Adder extends Component {
    constructor(props) {
        super(props);
        this.addMjsMethods(['submitAnswer','price','buy','operand','operator']);
    }
    render() {
        if (!state.adder.unlocked) {
            return `<div class="sectionAction" style="width: 200px;">
                <div class="actionHeader">
                    <span>
                        Buy Adder
                    </span>
                </div>
                <div>
                    ${this.child(Button, {action: 'this.buy();', label: '+'})}
                    ${this.child(Text, {action: 'this.price();'})} Cycles
                </div>
            </div>`;
        }
        return `<div class="gameSection">
                <div class="flexRow">
                    <div class="js-actions sectionActions">
                        ${this.child(AdderRange, {key: 'range'})}
                        ${this.child(AdderOperands, {key: 'terms'})}
                    </div>
                    <div class="sectionContent">
                        <div class="flexRow">
                            ${this.getOperands()}&nbsp;=&nbsp;
                            <input id="adderAnswer" class="gameInput" submit-action="${this.path}submitAnswer({value});">
                        </div>
                    </div>
                </div>
            </div>`;
    }
    getOperands() {
        const operands = [];
        for (let index = 0; index < state.adder.operands.length; index++) {
            operands.push( this.child(Text, {action: `this.operand(${index});`}) );
        }
        return operands.join( '&nbsp;' + this.child(Text, {action: `this.operator();`}) + '&nbsp;' );
    }
    buy() {
        if (state.adder.unlocked) return false;
        if (!spendCycles(this.price())) return false;
        state.adder.unlocked = true;
        this.markToUpdate();
        return true;
    }
    price() {
        return 50;
    }
    operand(index) {
        return state.adder.operands[index];
    }
    operator() {
        return state.adder.operator;
    }
    submitAnswer(answer = null) {
        // let answer = $('#adderAnswer').val();
        if (answer === null || answer.length === 0) return false;
        let total = 0;
        for (let i = 0; i < state.adder.operands.length; i++) {
            total += state.adder.operands[i];
        }
        if (answer === total) {
            gainCycles( Math.ceil(total * Math.log2(total)) );
            this.markToUpdate();
            rerollOperands();
            return true;
        }
        $('#adderAnswer').val('Try again!');
        return false;
    }
}

class AdderRange extends BuyAction {
    constructor(props) {
        super(props);
        this.addMjsMethods(['price','minValue','maxValue']);
    }
    renderHeader() {
        return `<span>
                    Range ${this.child(Text, {action: 'this.minValue();'})} -
                    ${this.child(Text, {action: 'this.maxValue();'})}
                </span>`;
    }
    price() {
        return 10 * state.adder.range;
    }
    minValue() {
        return state.adder.range;
    }
    maxValue() {
        return state.adder.range * 2 - 1;
    }
    onBuy() {
        state.adder.range++;
        this.markToUpdate();
        rerollOperands();
        return true;
    }
}

class AdderOperands extends BuyAction {
    constructor(props) {
        super(props);
        this.addMjsMethods(['price','value']);
    }
    renderHeader() {
        return `<span>Terms ${this.child(Text, {action: 'this.value();'})} </span>`;
    }
    available() {
        return state.adder.operands.length < 5;
    }
    price() {
        return 10 * 100 ** (state.adder.operands.length - 1);
    }
    value() {
        return state.adder.operands.length;
    }
    onBuy() {
        state.adder.operands.push(0);
        this.markToUpdate();
        rerollOperands();
        return true;
    }
}

