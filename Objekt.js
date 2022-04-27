
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


function cssVonWinkel(winkel) {
    // Die Winkel in CSS sind wie die Uhr: Sie beginnen (mit 0) bei 12 Uhr und gehen
    // gehen sie dem Uhrzeiger nach.
    // Mathematische Winkel beginnen aber rechts (bei 3 Uhr) und gehen dann gegen
    // den Uhrzeigersinn.

    return (Math.PI / 2) - winkel;
};

function platziereElement(htmlElement, x, y, winkel, nachRechts, nachUnten) {
    if (!winkel) winkel = 0;
    if (!nachRechts) nachRechts = 0;
    if (!nachUnten) nachUnten = 0;

    htmlElement.style.transform = " "
            + "translateX(" + (x - htmlElement.clientWidth / 2) + "px) "
            + "translateY(" + (800 - y - htmlElement.clientHeight / 2) + "px) "
            + "rotate(" + cssVonWinkel(winkel) + "rad) "
            + "translateX(" + nachRechts + "px) "
            + "translateY(" + nachUnten + "px) ";
};

class ObjektDarsteller {

    constructor(htmlElement, objekt, nachRechts, nachUnten) {
        this.htmlElement = htmlElement;
        this.objekt = objekt;
        this.nachRechts = nachRechts ? nachRechts : 0;
        this.nachUnten = nachUnten ? nachUnten : 0;
    }

    stelleDar() {
        if (this.objekt.lebt()) {
            platziereElement(this.htmlElement, this.objekt.ort.x, this.objekt.ort.y, this.objekt.winkel, this.nachRechts, this.nachUnten);
        }
    }

}
