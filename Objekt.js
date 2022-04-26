
class Objekt {
    
    constructor(ort, geschwindigkeit, masse, radius, winkel, winkelGeschwindigkeit, lebensPunkte) {
        this.ort = ort;
        this.geschwindigkeit = geschwindigkeit;
        this.masse = masse;
        this.radius = radius;
        this.winkel = winkel;
        this.winkelGeschwindigkeit = winkelGeschwindigkeit;
        this.lebensPunkte = lebensPunkte;
    }

    lebt() {
        return this.lebensPunkte > 0;
    }

    istZerstört() {
        return this.lebensPunkte == 0;
    }

    zerstören() {
        this.lebensPunkte = 0;
    }

    lebensPunkteAbziehen(delta) {
        this.lebensPunkte = Math.max(0, this.lebensPunkte - delta);
    }

    lebensPunkteSetzenAuf(lebensPunkte) {
        this.lebensPunkte = lebensPunkte;
    }

    weiter() {
        if (this.lebt()) {
            this.ort = this.ort.plus(this.geschwindigkeit);
            this.winkel += this.winkelGeschwindigkeit;
        }
    }

    beschleunige(vektor) {
        if (this.lebt()) {
            this.geschwindigkeit = this.geschwindigkeit.plus(vektor);
        }
    }
}


class ObjektDarsteller {

    constructor(htmlElement, objekt) {
        this.htmlElement = htmlElement;
        this.objekt = objekt;
    }

    stelleDar() {}

}
