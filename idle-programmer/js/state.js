var state = {
    cyclesChanged: true,
    cycles: 5000,
    clockSpeed: 0
};

function gainCycles(cycles) {
    state.cycles += cycles;
    state.cyclesChanged = true;
    return true;
}
function spendCycles(cycles) {
    if (cycles > state.cycles) return false;
    state.cycles -= cycles;
    state.cyclesChanged = true;
    return true;
}

String.prototype.abbreviate = function () {
    if (!isNaN(Number(this))) return Number(this).abbreviate();
    return this;
}
Number.prototype.abbreviate = function () {
    if (this >= 10e21) {
        return (this / 1e21 + '').slice(0, 5) + 'Sx';
    }
    if (this >= 10e18) {
        return (this / 1e18 + '').slice(0, 5) + 'Qt';
    }
    if (this >= 10e15) {
        return (this / 1e15 + '').slice(0, 5) + 'Qd';
    }
    if (this >= 10e12) {
        return (this / 1e12 + '').slice(0, 5) + 'T';
    }
    if (this >= 10e9) {
        return (this / 1e9 + '').slice(0, 5) + 'B';
    }
    if (this >= 10e6) {
        return (this / 1e6 + '').slice(0, 5) + 'M';
    }
    if (this >= 10e3) {
        return (this / 1e3 + '').slice(0, 5) + 'K';
    }
    return this;
}