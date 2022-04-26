
class Raumschiff extends Objekt {

    constructor(x, y, winkel) {
        super(new Vektor(x, y), new Vektor(0, 0), 1, 10, winkel, 0, 100);

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
        // "spiel" sollte jetzt bekannt sein. Etwas unschöne Programmierung...
        var schussGeschwindigkeit = Vektor.vonWinkelUndRadius(this.winkel, 1),
            abstand = Vektor.vonWinkelUndRadius(this.winkel, this.radius * 3);

        spiel.schiesse(
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

