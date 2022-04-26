
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
    lebensPunkte
    
    constructor(lebensPunkte) {
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
}


class Raumschiff extends Objekt {

    constructor(x, y, winkel) {
        super(100);
        this.daten = {
            ort: new Vektor(x, y),
            winkel: winkel,
            geschwindigkeit: new Vektor(0, 0),
            drehtNachLinks: false,
            drehtNachRechts: false,
            gibtGas: false,
            masse: 1,
            radius: 10
        };
    }

    startLinksDrehung() {
        this.daten.drehtNachLinks = true;
    }

    stopLinksDrehung() {
        this.daten.drehtNachLinks = false;
    }

    startRechtsDrehung() {
        this.daten.drehtNachRechts = true;
    }

    stopRechtsDrehung() {
        this.daten.drehtNachRechts = false;
    }

    startGas() {
        this.daten.gibtGas = true;
    }

    stopGas() {
        this.daten.gibtGas = false;
    }

    beschleunige() {
        var beschleunigung = Vektor.vonWinkelUndRadius(this.daten.winkel, 0.1);
        this.daten.geschwindigkeit = this.daten.geschwindigkeit.plus(beschleunigung);
    }

    bewege() {
        this.daten.ort = this.daten.ort.plus(this.daten.geschwindigkeit);
    }

    fuehreAus() {
        if (this.daten.drehtNachLinks) { this.daten.winkel += 0.1; }
        if (this.daten.drehtNachRechts) { this.daten.winkel -= 0.1; }
        if (this.daten.gibtGas) { this.beschleunige(); }
    }

    schiesse() {
        // "spiel" sollte jetzt bekannt sein. Etwas unschöne Programmierung...
        var schussGeschwindigkeit = Vektor.vonWinkelUndRadius(this.daten.winkel, 1),
            abstand = Vektor.vonWinkelUndRadius(this.daten.winkel, this.daten.radius * 3);

        spiel.schiesse(
            this.daten.ort.plus(abstand),
            this.daten.geschwindigkeit.plus(schussGeschwindigkeit)
        );

        this.daten.geschwindigkeit = this.daten.geschwindigkeit.minus(schussGeschwindigkeit.skaliertUm(0.3));
    }

    stoss(subjekt, winkel) {
        var v = this.daten.geschwindigkeit.minus(subjekt.daten.geschwindigkeit),
            v_ = v.rotiertUm(-winkel);

        if (v_.x < 0 && v.r > 1.5) {
            this.zerstören();
        }

        var v_neu = new Vektor(Math.max(v_.x, 0), 0),
            vneu = v_neu.rotiertUm(winkel),
            ovneu = vneu.plus(subjekt.daten.geschwindigkeit);

        this.daten.geschwindigkeit = ovneu;        
    }

    schussSchlägtEin() {
        this.zerstören();
    }
}


class Asteroid extends Objekt {

    constructor(daten) {
        super(daten.radius);
        this.daten = daten;
    }

    bewege() {
        this.daten.ort = this.daten.ort.plus(this.daten.geschwindigkeit);
        this.daten.winkel += this.daten.geschwindigkeitWinkel;
    }

    schussSchlägtEin() {
        if (this.daten.radius >= MIN_GRÖSSE) {
            this.lebensPunkteAbziehen(spiel.schnellModus() ? 10 : 2);

            this.daten.radius = this.lebensPunkte;
            this.daten.masse = Math.pow(this.daten.radius / 10, 3);
        }

        if (this.daten.radius < MIN_GRÖSSE) {
            this.zerstören();
        }
    }
}

var neuerZufallsAsteroid = function(naheBeiX, naheBeiY) {
    function zufallsZahl(max) {
        return (Math.random() * 2 - 1) * max;
    }

    var radius = zufallsZahl((MAX_GRÖSSE - MIN_GRÖSSE) / 2) + (MAX_GRÖSSE - MIN_GRÖSSE) / 2 + MIN_GRÖSSE;

    return new Asteroid({
            ort: new Vektor(naheBeiX + zufallsZahl(MAX_ABSTAND_RAUMSCHIFF * 2), naheBeiY + zufallsZahl(MAX_ABSTAND_RAUMSCHIFF * 2)),
            winkel: zufallsZahl(180),
            radius: radius,
            masse: Math.pow(radius / 10, 3),
            geschwindigkeit: new Vektor(zufallsZahl(1), zufallsZahl(1)),
            geschwindigkeitWinkel: zufallsZahl(0.002)
        });
};

class Schuss extends Objekt {
    constructor() {
        super(0);
        this.daten = {
            ort: undefined,
            geschwindigkeit: undefined,
            masse: 1,
            radius: 1
        };
    }

    starte(ort, geschwindigkeit) {
        this.daten.ort = ort;
        this.daten.geschwindigkeit = geschwindigkeit;
        this.lebensPunkteSetzenAuf(500);
    }

    bewege() {
        if (this.lebt()) {
            this.lebensPunkteAbziehen(1);
            this.daten.ort = this.daten.ort.plus(this.daten.geschwindigkeit);
        }
    }

    stoss(subjekt, winkel) {
        this.zerstören();
        spieleTon("Schuss");
        subjekt.schussSchlägtEin();
    }
}

function wechselWirken(subjekt, objekt) {

    var m = subjekt.daten.masse,
        maxAbstand = m * 10,
        d = objekt.daten.ort.minus(subjekt.daten.ort),
        G = 1;

    // Wenn maxAbstand in x oder y Achse schon überschritten ist, ist er es sowieso
    if (d.x > maxAbstand || d.x < -maxAbstand ||
        d.y > maxAbstand || d.y < -maxAbstand) { return; }

    if (d.r > maxAbstand) { return; }

    // Auf Oberfläche aufgetroffen?
    if (d.r - subjekt.daten.radius < 10) {
        objekt.stoss(subjekt, d.w);

        return;
    }

    // Gravitation is umgekehrt quadratisch zum Abstand
    // Die x- und y-Vektoren werden mit dem x- und y-Abstand multipliziert damit
    // die Richtung stimmt. Damit wäre es aber wieder nur noch umgekehrt proportional
    // also muss nochmals durch den Abstand geteilt werden.
    var g = d.skaliertUm(G * m / Math.pow(d.r, 2) / d.r);
    objekt.daten.geschwindigkeit = objekt.daten.geschwindigkeit.minus(g);
};

function spieleTon(welcherTon) {
    new Audio(welcherTon + ".wav").play();
}

class Spiel {

    constructor() {
        this.ausfuehrbareObjekte = [];
        this.bewegbareObjekte = [];
        this.asteroiden = [];
        this.schüsse = [];
        this.status = PAUSE;
        this._schnellModus = false;


        this.raumschiff = new Raumschiff(START_X, START_Y, NORD);
        this.ausfuehrbareObjekte.push(this.raumschiff);
        this.bewegbareObjekte.push(this.raumschiff);

        for (var i = 0; i < ANZAHL_ASTEROIDEN; i++) {
            var asteroid = neuerZufallsAsteroid(START_X, START_Y);
            this.asteroiden.push(asteroid);
            this.bewegbareObjekte.push(asteroid);
        }

        for (var i = 0; i < 10; i++) {
            var schuss = new Schuss();
            this.schüsse.push(schuss);
            this.bewegbareObjekte.push(schuss);
        }
    }

    weiter() {
        for (var objekt of this.ausfuehrbareObjekte) {
            objekt.fuehreAus();
        }

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

        for (var objekt of this.bewegbareObjekte) {
            if (typeof objekt.lebt === 'undefined' || objekt.lebt()) {
                objekt.bewege();
            }
        }

        // Wenn ein Asteroid sehr weit rechts vom Raumschiff weg ist, lassen wir ihn einfach
        // vom gegenüberliegenden "Rand" wieder hineinfliegen.
        for (var objekt of this.asteroiden) {
            if (objekt.daten.ort.x - this.raumschiff.daten.ort.x > MAX_ABSTAND_RAUMSCHIFF) {
                objekt.daten.ort = objekt.daten.ort.minus(new Vektor(2 * MAX_ABSTAND_RAUMSCHIFF, 0));
            }
            if (objekt.daten.ort.x - this.raumschiff.daten.ort.x < -MAX_ABSTAND_RAUMSCHIFF) {
                objekt.daten.ort = objekt.daten.ort.plus(new Vektor(2 * MAX_ABSTAND_RAUMSCHIFF, 0));
            }
            if (objekt.daten.ort.y - this.raumschiff.daten.ort.y > MAX_ABSTAND_RAUMSCHIFF) {
                objekt.daten.ort = objekt.daten.ort.minus(new Vektor(0, 2 * MAX_ABSTAND_RAUMSCHIFF));
            }
            if (objekt.daten.ort.y - this.raumschiff.daten.ort.y < -MAX_ABSTAND_RAUMSCHIFF) {
                objekt.daten.ort = objekt.daten.ort.plus(new Vektor(0, 2 * MAX_ABSTAND_RAUMSCHIFF));
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
