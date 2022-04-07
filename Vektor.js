class Vektor {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get r() {
        if (typeof this._r === 'undefined') {
            this._x2 = Math.pow(this._x, 2);
            this._y2 = Math.pow(this._y, 2);
            this._r2 = this._x2 + this._y2;
            this._r = Math.sqrt(this._r2);
        }

        return this._r;
    }

    get w() {
        if (typeof this._w === 'undefined') {
            this._w = Math.atan2(this._y, this._x);
        }

        return this._w;
    }

    plus(addend) {
        return new Vektor(this.x + addend.x, this.y + addend.y);
    }

    minus(subtrahend) {
        return new Vektor(this.x - subtrahend.x,
            this.y - subtrahend.y);
    }

    invertiert() {
        return new Vektor(-this.x, -this.y);
    }

    rotiertUm(dw) {
        var w_ = this.w + dw,
            x_ = this.r * Math.cos(w_),
            y_ = this.r * Math.sin(w_);

        return new Vektor(x_, y_);
    }

    skaliertUm(faktor) {
        return new Vektor(this.x * faktor, this.y * faktor);
    }

    gleich(vektor) {
        return vektor.x == this.x && vektor.y == this.y;
    }

    fastGleich(vektor) {
        return Math.abs(vektor.x - this.x) + Math.abs(vektor.y - this.y) < 0.0001;
    }

    toString() {
        return "(" + this.x + "," + this.y + ")";
    }
}
