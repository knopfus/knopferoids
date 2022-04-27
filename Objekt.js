
class Objekt {
    
    constructor(ort, geschwindigkeit, masse, radius, winkel, winkelGeschwindigkeit, lebensPunkte, spiel) {
        this.ort = ort;
        this.geschwindigkeit = geschwindigkeit;
        this.masse = masse;
        this.radius = radius;
        this.winkel = winkel;
        this.winkelGeschwindigkeit = winkelGeschwindigkeit;
        this.lebensPunkte = lebensPunkte;
        this.spiel = spiel;
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

    constructor(htmlElement, objekt, nachRechts, nachUnten, explosionVorlage) {
        this.htmlElement = htmlElement;
        this.objekt = objekt;
        this.nachRechts = nachRechts ? nachRechts : 0;
        this.nachUnten = nachUnten ? nachUnten : 0;

        this.explosionVorlage = explosionVorlage;
        this.kannExplodieren = !!explosionVorlage;
        this.explodiertUm = 0;
        this.verschwundenUm = 0;
    }

    stelleDar() {
        if (this.verschwundenUm) { return; }

        if (this.explodiertUm) {
            if (Date.now() - this.explodiertUm > 2000) {
                this.verschwundenUm = Date.now();
                this.explosionDiv.parentElement.removeChild(this.explosionDiv);
                this.explosionDiv = null;
            }
            return;
        }

        if (this.objekt.istZerstört()) {
            this.htmlElement.style.display = "none";

            if (this.kannExplodieren) {
                this.explodieren();
            }
        }

        if (this.objekt.lebt()) {
            this.htmlElement.style.display = "";
            platziereElement(this.htmlElement, this.objekt.ort.x, this.objekt.ort.y, this.objekt.winkel, this.nachRechts, this.nachUnten);
        }
    }

    explodieren() {
        var explosionDiv = elementKopieren(this.explosionVorlage);
        var explosionImg = explosionDiv.querySelector("img");

        platziereElement(explosionDiv, this.objekt.ort.x, this.objekt.ort.y, this.objekt.winkel, this.nachRechts, this.nachUnten);
        
        explosionImg.setAttribute("src", explosionImg.getAttribute("src"));
        spieleTon("explosion");

        this.explosionDiv = explosionDiv;
        this.explodiertUm = Date.now();
    }

}
