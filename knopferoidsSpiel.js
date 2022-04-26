
const NORD = Math.PI / 2;
const AM_LAUFEN = 0;
const PAUSE = 10;
const GAME_OVER = 20;
const GEWONNEN = 30;

const ANZAHL_ASTEROIDEN = 20;
const START_X = 500, START_Y = 200;
const MAX_ABSTAND_RAUMSCHIFF = 2000;
const MAX_GRÖSSE = 120;
const MIN_GRÖSSE = 10;


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


class Asteroid extends Objekt {

    constructor(ort, geschwindigkeit, masse, radius, winkel, winkelGeschwindigkeit) {
        super(ort, geschwindigkeit, masse, radius, winkel, winkelGeschwindigkeit, radius);
    }

    schussSchlägtEin() {
        if (this.radius >= MIN_GRÖSSE) {
            this.lebensPunkteAbziehen(spiel.schnellModus() ? 10 : 2);

            this.radius = this.lebensPunkte;
            this.masse = Math.pow(this.radius / 10, 3);
        }

        if (this.radius < MIN_GRÖSSE) {
            this.zerstören();
        }
    }
}

var neuerZufallsAsteroid = function(naheBeiX, naheBeiY) {
    function zufallsZahl(max) {
        return (Math.random() * 2 - 1) * max;
    }

    var radius = zufallsZahl((MAX_GRÖSSE - MIN_GRÖSSE) / 2) + (MAX_GRÖSSE - MIN_GRÖSSE) / 2 + MIN_GRÖSSE;

    return new Asteroid(
            new Vektor(naheBeiX + zufallsZahl(MAX_ABSTAND_RAUMSCHIFF * 2), naheBeiY + zufallsZahl(MAX_ABSTAND_RAUMSCHIFF * 2)),
            new Vektor(zufallsZahl(1), zufallsZahl(1)),
            Math.pow(radius / 10, 3),
            radius,
            zufallsZahl(180),
            zufallsZahl(0.002)
        );
};

class Schuss extends Objekt {
    constructor() {
        super(0, 0, 1, 1, 0, 0, 0);
    }

    starte(ort, geschwindigkeit) {
        this.ort = ort;
        this.geschwindigkeit = geschwindigkeit;
        this.lebensPunkteSetzenAuf(500);
    }

    weiter() {
        super.weiter();

        this.lebensPunkteAbziehen(1);
    }

    stoss(subjekt, winkel) {
        this.zerstören();
        spieleTon("Schuss");
        subjekt.schussSchlägtEin();
    }
}

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
        this.status = PAUSE;
        this._schnellModus = false;


        this.raumschiff = new Raumschiff(START_X, START_Y, NORD);
        this.objekte.push(this.raumschiff);

        for (var i = 0; i < ANZAHL_ASTEROIDEN; i++) {
            var asteroid = neuerZufallsAsteroid(START_X, START_Y);
            this.asteroiden.push(asteroid);
            this.objekte.push(asteroid);
        }

        for (var i = 0; i < 10; i++) {
            var schuss = new Schuss();
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
