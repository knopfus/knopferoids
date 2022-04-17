
const NORD = Math.PI / 2;
const AM_LAUFEN = 0;
const PAUSE = 10;
const GAME_OVER = 20;
const WIE_NEU = 100;
const ZERSTÖRT = 0;

var Raumschiff = (function(x, y, winkel) {

    var _daten = {
        ort: new Vektor(x, y),
        winkel: winkel,
        geschwindigkeit: new Vektor(0, 0),
        drehtNachLinks: false,
        drehtNachRechts: false,
        gibtGas: false,
        zustand: WIE_NEU,
        masse: 1,
        radius: 10
    };

    function _startLinksDrehung() {
        _daten.drehtNachLinks = true;
    }

    function _stopLinksDrehung() {
        _daten.drehtNachLinks = false;
    }

    function _startRechtsDrehung() {
        _daten.drehtNachRechts = true;
    }

    function _stopRechtsDrehung() {
        _daten.drehtNachRechts = false;
    }

    function _startGas() {
        _daten.gibtGas = true;
    }

    function _stopGas() {
        _daten.gibtGas = false;
    }

    function _beschleunige() {
        var beschleunigung = Vektor.vonWinkelUndRadius(_daten.winkel, 0.1);
        _daten.geschwindigkeit = _daten.geschwindigkeit.plus(beschleunigung);
    }

    function _bewege() {
        _daten.ort = _daten.ort.plus(_daten.geschwindigkeit);
    }

    function _fuehreAus() {
        if (_daten.drehtNachLinks) { _daten.winkel += 0.1; }
        if (_daten.drehtNachRechts) { _daten.winkel -= 0.1; }
        if (_daten.gibtGas) { _beschleunige(); }
    }

    function _schiesse() {
        // "spiel" sollte jetzt bekannt sein. Etwas unschöne Programmierung...
        var schussGeschwindigkeit = Vektor.vonWinkelUndRadius(_daten.winkel, 1),
            abstand = Vektor.vonWinkelUndRadius(_daten.winkel, _daten.radius * 3);

        spiel.schiesse(
            _daten.ort.plus(abstand),
            _daten.geschwindigkeit.plus(schussGeschwindigkeit)
        );

        _daten.geschwindigkeit = _daten.geschwindigkeit.minus(schussGeschwindigkeit.skaliertUm(0.3));
    }

    function _zerstört() {
        _daten.zustand = ZERSTÖRT;
    }

    function _stoss(subjekt, winkel) {
        var v = _daten.geschwindigkeit.minus(subjekt.daten.geschwindigkeit),
            v_ = v.rotiertUm(-winkel);

        if (v_.x < 0 && v.r > 1.5) {
            _zerstört();
        }

        var v_neu = new Vektor(Math.max(v_.x, 0), 0),
            vneu = v_neu.rotiertUm(winkel),
            ovneu = vneu.plus(subjekt.daten.geschwindigkeit);

        _daten.geschwindigkeit = ovneu;        
    }

    function _schussSchlägtEin() {
        _zerstört();
    }

    return {
        daten: _daten,
        bewege: _bewege,
        fuehreAus: _fuehreAus,
        schiesse: _schiesse,
        startLinksDrehung: _startLinksDrehung,
        stopLinksDrehung: _stopLinksDrehung,
        startRechtsDrehung: _startRechtsDrehung,
        stopRechtsDrehung: _stopRechtsDrehung,
        startGas: _startGas,
        stopGas: _stopGas,
        stoss: _stoss,
        schussSchlägtEin: _schussSchlägtEin
    };
});


var Asteroid = (function(daten) {

    var _daten = daten;

    function _bewege() {
        _daten.ort = _daten.ort.plus(_daten.geschwindigkeit);
        _daten.winkel += _daten.geschwindigkeitWinkel;
    }

    function _schussSchlägtEin() {
        if (_daten.radius > 1) {
            _daten.radius -= 2;
            _daten.masse = Math.pow(_daten.radius / 10, 3)
        }
    }

    return {
        daten: _daten,
        bewege: _bewege,
        schussSchlägtEin: _schussSchlägtEin
    };
});

var ZufallsAsteroid = function(naheBeiX, naheBeiY) {
    function zufallsZahl(max) {
        return (Math.random() * 2 - 1) * max;
    }

    var radius = zufallsZahl(50) + 50;

    return Asteroid({
            ort: new Vektor(naheBeiX + zufallsZahl(4000), naheBeiY + zufallsZahl(4000)),
            winkel: zufallsZahl(180),
            radius: radius,
            masse: Math.pow(radius / 10, 3),
            geschwindigkeit: new Vektor(zufallsZahl(1), zufallsZahl(1)),
            geschwindigkeitWinkel: zufallsZahl(0.002)
        });
};

var Schuss = function() {
    var _daten = {
        ort: undefined,
        geschwindigkeit: undefined,
        lebensdauer: 0,
        masse: 1,
        radius: 1
    };

    function _starte(ort, geschwindigkeit) {
        _daten.ort = ort;
        _daten.geschwindigkeit = geschwindigkeit;
        _daten.lebensdauer = 500;
    }

    function _lebt() {
        return _daten.lebensdauer > 0;
    }

    function _bewege() {
        if (_lebt()) {
            _daten.lebensdauer -= 1;
            _daten.ort = _daten.ort.plus(_daten.geschwindigkeit);
        }
    }

    function _stoss(subjekt, winkel) {
        _daten.lebensdauer = 0;
        spieleTon("Schuss");
        subjekt.schussSchlägtEin();
    }

    return {
        daten: _daten,
        starte: _starte,
        lebt: _lebt,
        bewege: _bewege,
        stoss: _stoss
    }
};

var wechselWirken = function(subjekt, objekt) {

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

var Spiel = (function() {

    var _ausfuehrbareObjekte = [],
        _bewegbareObjekte = [],
        _raumschiff,
        _asteroiden = [],
        _schüsse = [],
        _status = PAUSE,
        maximalerAbstandVomRaumschiff = 2000;


    _raumschiff = Raumschiff(500, 200, NORD);
    _ausfuehrbareObjekte.push(_raumschiff);
    _bewegbareObjekte.push(_raumschiff);

    for (var i = 0; i < 50; i++) {
        var asteroid = ZufallsAsteroid(500, 200);
        _asteroiden.push(asteroid);
        _bewegbareObjekte.push(asteroid);
    }

    for (var i = 0; i < 10; i++) {
        var schuss = Schuss();
        _schüsse.push(schuss);
        _bewegbareObjekte.push(schuss);
    }

    function _weiter() {
        for (objekt of _ausfuehrbareObjekte) {
            objekt.fuehreAus();
        }

        for (asteroid of _asteroiden) {
            wechselWirken(asteroid, _raumschiff);

            for (schuss of _schüsse) {
                if (schuss.lebt()) {
                    wechselWirken(asteroid, schuss);
                }
            }

            if (_raumschiff.daten.zustand == ZERSTÖRT) {
                _status = GAME_OVER;
            }
        }

        for (schuss of _schüsse) {
            if (schuss.lebt()) {
                wechselWirken(_raumschiff, schuss);
            }
        }

        for (objekt of _bewegbareObjekte) {
            if (typeof objekt.lebt === 'undefined' || objekt.lebt()) {
                objekt.bewege();
            }
        }

        // Wenn ein Asteroid sehr weit rechts vom Raumschiff weg ist, lassen wir ihn einfach
        // vom gegenüberliegenden "Rand" wieder hineinfliegen.
        for (objekt of _asteroiden) {
            if (objekt.daten.ort.x - _raumschiff.daten.ort.x > maximalerAbstandVomRaumschiff) {
                objekt.daten.ort = objekt.daten.ort.minus(new Vektor(2 * maximalerAbstandVomRaumschiff, 0));
            }
            if (objekt.daten.ort.x - _raumschiff.daten.ort.x < -maximalerAbstandVomRaumschiff) {
                objekt.daten.ort = objekt.daten.ort.plus(new Vektor(2 * maximalerAbstandVomRaumschiff, 0));
            }
            if (objekt.daten.ort.y - _raumschiff.daten.ort.y > maximalerAbstandVomRaumschiff) {
                objekt.daten.ort = objekt.daten.ort.minus(new Vektor(0, 2 * maximalerAbstandVomRaumschiff));
            }
            if (objekt.daten.ort.y - _raumschiff.daten.ort.y < -maximalerAbstandVomRaumschiff) {
                objekt.daten.ort = objekt.daten.ort.plus(new Vektor(0, 2 * maximalerAbstandVomRaumschiff));
            }
        }
    };

    function _pausierenOderWeitermachen() {
        switch (_status) {
            case AM_LAUFEN: _status = PAUSE; break;
            case PAUSE: _status = AM_LAUFEN; break;
            case GAME_OVER: break;
        }
    }

    function _schiesse(ort, geschwindigkeit) {
        for (var schuss of _schüsse) {
            if (!schuss.lebt()) {
                schuss.starte(ort, geschwindigkeit);
                spieleTon("schiessen");
                return;
            }
        }
    }

    return {
        status: function() { return _status; },
        raumschiff: _raumschiff,
        asteroiden: _asteroiden,
        schüsse: _schüsse,
        pausierenOderWeitermachen: _pausierenOderWeitermachen,
        weiter: _weiter,
        schiesse: _schiesse
    };
});

var spiel = Spiel();
