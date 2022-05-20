
class Raumschiff extends Objekt {

    constructor(x, y, winkel, spiel) {
        super(new Vektor(x, y), new Vektor(0, 0), 1, 10, winkel, 0, 100, spiel);

        this.gibtGas = false;
    }

    startLinksDrehung() {
        this.winkelGeschwindigkeit = 0.1;
    }

    stopLinksDrehung() {
        this.winkelGeschwindigkeit = 0;
    }

    startRechtsDrehung() {
        this.winkelGeschwindigkeit = -0.1;
    }

    stopRechtsDrehung() {
        this.winkelGeschwindigkeit = 0;
    }

    startGas() {
        this.gibtGas = true;
    }

    stopGas() {
        this.gibtGas = false;
    }

    weiter() {
        super.weiter();

        if (this.lebt() && this.gibtGas) { this.beschleunige(Vektor.vonWinkelUndRadius(this.winkel, 0.1)); }
    }

    schiesse() {
        var schussGeschwindigkeit = Vektor.vonWinkelUndRadius(this.winkel, 1),
            abstand = Vektor.vonWinkelUndRadius(this.winkel, this.radius * 3);

        this.spiel.schiesse(
            this.ort.plus(abstand),
            this.geschwindigkeit.plus(schussGeschwindigkeit)
        );

        this.beschleunige(schussGeschwindigkeit.skaliertUm(-0.3));
    }

    stoss(subjekt, winkel) {
        var v = this.geschwindigkeit.minus(subjekt.geschwindigkeit),
            v_ = v.rotiertUm(-winkel);

        if (v_.x < 0 && v.r > 1.5) {
            this.zerstören();
        }

        var v_neu = new Vektor(Math.max(v_.x, 0), 0),
            vneu = v_neu.rotiertUm(winkel),
            ovneu = vneu.plus(subjekt.geschwindigkeit);

        this.geschwindigkeit = ovneu;
    }

    schussSchlägtEin() {
        this.zerstören();
    }
}


class OffensivesRaumschiff extends Raumschiff {

    constructor(x, y, winkel, spiel, zielRaumschiff) {
        super(x, y, winkel, spiel);

        this.zielRaumschiff = zielRaumschiff;
        this.geschossenUm = 0;
    }

    weiter() {
        super.weiter();

        let delta = this.zielRaumschiff.ort.minus(this.ort).invertiert();
        let zielWinkel = delta.w;
        let winkelDelta = (zielWinkel - this.winkel) % (2 * Math.PI) - Math.PI;
        if (winkelDelta < 0) {
            this.startRechtsDrehung();
        } else if (winkelDelta > 0) {
            this.startLinksDrehung();
        }

        if (Math.abs(winkelDelta) < Math.PI / 4) {
            let beschleunigung = Vektor.vonWinkelUndRadius(this.winkel, 0.1);
            let neueGeschwindigkeit = this.geschwindigkeit.plus(beschleunigung);
            if (neueGeschwindigkeit.r > 5 && neueGeschwindigkeit.r > this.geschwindigkeit.r) {
                this.stopGas();
            } else {
                this.startGas();
            }
        } else {
            this.stopGas();
        }

        if (Math.abs(winkelDelta) < Math.PI / 12 && delta.r < 200 && (this.geschossenUm - Date.now() < -100)) {
            this.schiesse();
            this.geschossenUm = Date.now();
        }
    }
}

function neuesZufallsOffensivesRaumschiff(naheBeiX, naheBeiY, spiel, zielRaumschiff) {
    function zufallsZahl(max) {
        return (Math.random() * 2 - 1) * max;
    }

    return new OffensivesRaumschiff(
            naheBeiX + zufallsZahl(500 * 2),
            naheBeiY + zufallsZahl(500 * 2),
            zufallsZahl(Math.PI * 2),
            spiel,
            zielRaumschiff
        );
};


class RaumschiffDarsteller extends ObjektDarsteller {
    constructor(htmlElement, raumschiff, explosionVorlage) {

        super(htmlElement, raumschiff, 0, 10, explosionVorlage);
        this.raumschiff = raumschiff;
        this.imgWennGas = htmlElement.querySelector(".Raumschiff-on");
    }

    stelleDar() {
        super.stelleDar();

        this.imgWennGas.style.visibility = this.raumschiff.gibtGas ? "visible" : "hidden";
    }
}
