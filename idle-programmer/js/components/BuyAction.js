
class BuyAction extends Component {
    constructor(props) {
        super(props);
        this.addMjsMethods(['buy']);
    }
    render() {
        let buyRow = '';
        if (this.available()) {
            buyRow =
                `<div>
                    ${this.child(Button, {action: 'this.buy();', label: '+'})}
                    ${this.child(Text, {action: 'this.price();'})} Cycles
                </div>`
        }
        return `<div class="sectionAction">
            <div class="actionHeader">
                ${this.renderHeader()}
            </div>
            ${buyRow}
        </div>`;
    }
    buy() {
        if (!this.available()) return false;
        if (!spendCycles(this.price())) return false;
        return this.onBuy();
    }
    available() {
        return true;
    }
}
