
class Game extends Component {
    render() {
        this.path = 'ui.';
        return `<div id="cmp-ui." class="cmp-updated">` + this.child(Clicker, {key: 'clicker'}) + this.child(Adder, {key: 'adder'}) + `<div>`;
    }
}