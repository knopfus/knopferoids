
const AM_LAUFEN = 0;
const PAUSE = 10;
const GAME_OVER = 20;
const GEWONNEN = 30;

const ANZAHL_ASTEROIDEN = 20;
const START_X = 500, START_Y = 200;
const MAX_ABSTAND_RAUMSCHIFF = 2000;
const MAX_GRÖSSE = 120;
const MIN_GRÖSSE = 10;


function wechselWirken(subjekt, objekt) {

    var m = subjekt.masse,
        maxAbstand = m * 10,
        d = objekt.ort.minus(subjekt.ort),
        G = 1;

    // Wenn maxAbstand in x oder y Achse schon überschritten ist, ist er es sowieso
    if (d.x > maxAbstand || d.x < -maxAbstand ||
        d.y > maxAbstand || d.y < -maxAbstand) { return; }

    if (d.r > maxAbstand) { return; }

    // Auf Oberfläche aufgetroffen?
    if (d.r - subjekt.radius < 10) {
        objekt.stoss(subjekt, d.w);

        return;
    }

    // Gravitation is umgekehrt quadratisch zum Abstand
    // Die x- und y-Vektoren werden mit dem x- und y-Abstand multipliziert damit
    // die Richtung stimmt. Damit wäre es aber wieder nur noch umgekehrt proportional
    // also muss nochmals durch den Abstand geteilt werden.
    var g = d.skaliertUm(-G * m / Math.pow(d.r, 2) / d.r);
    objekt.beschleunige(g);
};

function spieleTon(welcherTon) {
    new Audio(welcherTon + ".wav").play();
}

class Spiel {

    constructor() {
        this.objekte = [];
        this.asteroiden = [];
        this.schüsse = [];
        this.raumschiffe = [];
        this.status = PAUSE;
        this._schnellModus = false;

        this.raumschiff = new Raumschiff(START_X, START_Y, NORD, this);
        this.objekte.push(this.raumschiff);
        for (var i = 0; i < 3; i++) {
            var offensivesRaumschiff = neuesZufallsOffensivesRaumschiff(START_X, START_Y, this, this.raumschiff);
            this.raumschiffe.push(offensivesRaumschiff);
            this.objekte.push(offensivesRaumschiff);
        }

        for (var i = 0; i < ANZAHL_ASTEROIDEN; i++) {
            var asteroid = neuerZufallsAsteroid(START_X, START_Y, this);
            this.asteroiden.push(asteroid);
            this.objekte.push(asteroid);
        }

        for (var i = 0; i < 10; i++) {
            var schuss = new Schuss(this);
            this.schüsse.push(schuss);
            this.objekte.push(schuss);
        }
    }

    weiter() {
        var mindestensEinAsteroidLebt = false;

        for (var asteroid of this.asteroiden) {
            if (asteroid.lebt()) {
                mindestensEinAsteroidLebt = true;
                wechselWirken(asteroid, this.raumschiff);
                for (var raumschiff of this.raumschiffe) {
                    wechselWirken(asteroid, raumschiff);
                }

                for (schuss of this.schüsse) {
                    if (schuss.lebt()) {
                        wechselWirken(asteroid, schuss);
                    }
                }
            }

            if (this.raumschiff.istZerstört()) {
                this.status = GAME_OVER;
            }
        }

        if (!mindestensEinAsteroidLebt) {
            this.status = GEWONNEN;
        }

        for (var schuss of this.schüsse) {
            if (schuss.lebt()) {
                wechselWirken(this.raumschiff, schuss);
                for (var raumschiff of this.raumschiffe) {
                    wechselWirken(raumschiff, schuss);
                }
            }
        }

        for (var objekt of this.objekte) {
            objekt.weiter();
        }

        // Wenn ein Asteroid sehr weit rechts vom Raumschiff weg ist, lassen wir ihn einfach
        // vom gegenüberliegenden "Rand" wieder hineinfliegen.
        for (var objekt of this.asteroiden) {
            if (objekt.ort.x - this.raumschiff.ort.x > MAX_ABSTAND_RAUMSCHIFF) {
                objekt.ort = objekt.ort.minus(new Vektor(2 * MAX_ABSTAND_RAUMSCHIFF, 0));
            }
            if (objekt.ort.x - this.raumschiff.ort.x < -MAX_ABSTAND_RAUMSCHIFF) {
                objekt.ort = objekt.ort.plus(new Vektor(2 * MAX_ABSTAND_RAUMSCHIFF, 0));
            }
            if (objekt.ort.y - this.raumschiff.ort.y > MAX_ABSTAND_RAUMSCHIFF) {
                objekt.ort = objekt.ort.minus(new Vektor(0, 2 * MAX_ABSTAND_RAUMSCHIFF));
            }
            if (objekt.ort.y - this.raumschiff.ort.y < -MAX_ABSTAND_RAUMSCHIFF) {
                objekt.ort = objekt.ort.plus(new Vektor(0, 2 * MAX_ABSTAND_RAUMSCHIFF));
            }
        }
    };

    pausierenOderWeitermachen() {
        switch (this.status) {
            case AM_LAUFEN: this.status = PAUSE; break;
            case PAUSE: this.status = AM_LAUFEN; break;
            case GAME_OVER: break;
        }
    }

    schiesse(ort, geschwindigkeit) {
        for (var schuss of this.schüsse) {
            if (!schuss.lebt()) {
                schuss.starte(ort, geschwindigkeit);
                spieleTon("schiessen");
                return;
            }
        }
    }

    schnellModusAn() { this._schnellModus = true; }
    schnellModus() { return this._schnellModus; }
}

var spiel = new Spiel();
