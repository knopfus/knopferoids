
const NORD = Math.PI / 2;

var Raumschiff = (function(left, top, winkel) {

    var _daten = {
        left: left, top: top, winkel: winkel,
        geschwindigkeitNachRechts: 0, geschwindigkeitNachUnten: 0,
        drehtNachLinks: false, drehtNachRechts: false, gibtGas: false
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
        var radius = 0.1,
            nachRechts = Math.cos(_daten.winkel) * radius,
            nachOben = Math.sin(_daten.winkel) * radius,
            nachUnten = -nachOben;

        _daten.geschwindigkeitNachRechts += nachRechts;
        _daten.geschwindigkeitNachUnten += nachUnten;
    }

    function _bewege() {
        _daten.left += _daten.geschwindigkeitNachRechts;
        _daten.top += _daten.geschwindigkeitNachUnten;
    }

    function _fuehreAus() {
        if (_daten.drehtNachLinks) { _daten.winkel += 0.1; }
        if (_daten.drehtNachRechts) { _daten.winkel -= 0.1; }
        if (_daten.gibtGas) { _beschleunige(); }
    }

    return {
        daten: _daten,
        bewege: _bewege,
        fuehreAus: _fuehreAus,
        startLinksDrehung: _startLinksDrehung, stopLinksDrehung: _stopLinksDrehung,
        startRechtsDrehung: _startRechtsDrehung, stopRechtsDrehung: _stopRechtsDrehung,
        startGas: _startGas, stopGas: _stopGas
    };
});


var Asteroid = (function(startDaten) {

    var _daten = JSON.parse(JSON.stringify(startDaten));

    function _bewege() {
        _daten.left += _daten.geschwindigkeitNachRechts;
        _daten.top += _daten.geschwindigkeitNachUnten;
        _daten.winkel += _daten.geschwindigkeitWinkel;
    }

    return {
        daten: _daten,
        bewege: _bewege
    };
});

var ZufallsAsteroid = function(naheBeiLeft, naheBeiTop) {
    function zufallsZahl(maximalerAbstand) {
        return (Math.random() * 2 - 1) * maximalerAbstand;
    }

    var radius = zufallsZahl(50) + 50

    return Asteroid({
            left: naheBeiLeft + zufallsZahl(4000),
            top: naheBeiTop + zufallsZahl(4000),
            winkel: zufallsZahl(180),
            radius: radius,
            masse: radius * radius * radius / 1000,
            geschwindigkeitNachRechts: zufallsZahl(1),
            geschwindigkeitNachUnten: zufallsZahl(1),
            geschwindigkeitWinkel:  zufallsZahl(0.002)
        });
};

var zieheAn = function(subjekt, objekt) {
    var masse = subjekt.daten.masse,
        maxAbstand = masse * 10,
        sx = subjekt.daten.left, sy = subjekt.daten.top,
        ox = objekt.daten.left, oy = objekt.daten.top,
        dx = sx - ox, dy = sy - oy, abstand,
        dx2, dy2, abstand2,
        G = 1, g, gx, gy;

    // Wenn Abstand in x oder y Achse schon überschritten ist, ist er es sowieso
    if (dx > maxAbstand || dx < -maxAbstand ||
        dy > maxAbstand || dy < -maxAbstand) { return; }

    dx2 = dx * dx; dy2 = dy * dy; abstand2 = dx2 + dy2;
    abstand = Math.sqrt(abstand2);
    if (abstand > maxAbstand) { return; }

    // Gravitation is umgekehrt quadratisch zum Abstand
    // Die x- und y-Vektoren werden mit dem x- und y-Abstand multipliziert damit
    // die Richtung stimmt. Damit wäre es aber wieder nur noch umgekehrt proportional
    // also muss nochmals durch den Abstand geteilt werden.
    g = G * masse / abstand2 / abstand;
    gx = g * dx; gy = g * dy;
    objekt.daten.geschwindigkeitNachRechts += gx;
    objekt.daten.geschwindigkeitNachLinks += gy;
};

var Spiel = (function() {

    var _ausfuehrbareObjekte = [],
        _bewegbareObjekte = [],
        _raumschiff,
        _asteroiden = [],
        asteroid,
        maximalerAbstandVomRaumschiff = 2000;


    _raumschiff = Raumschiff(500, 200, NORD);
    _ausfuehrbareObjekte.push(_raumschiff);
    _bewegbareObjekte.push(_raumschiff);

    for (var i = 0; i < 50; i++) {
        var asteroid = ZufallsAsteroid(500, 200);
        _asteroiden.push(asteroid);
        _bewegbareObjekte.push(asteroid);
    }

    function _weiter() {
        for (objekt of _ausfuehrbareObjekte) {
            objekt.fuehreAus();
        }

        for (asteroid of _asteroiden) {
            zieheAn(asteroid, _raumschiff);
        }

        // Wenn Objekt sehr weit rechts vom Raumschiff weg ist, lassen wir es einfach
        // vom gegenüberliegenden "Rand" wieder hineinfliegen.
        for (objekt of _bewegbareObjekte) {
            objekt.bewege();
            if (objekt.daten.left - _raumschiff.daten.left > maximalerAbstandVomRaumschiff) {
                objekt.daten.left -= 2 * maximalerAbstandVomRaumschiff;
            }
            if (objekt.daten.left - _raumschiff.daten.left < -maximalerAbstandVomRaumschiff) {
                objekt.daten.left += 2 * maximalerAbstandVomRaumschiff;
            }
            if (objekt.daten.top - _raumschiff.daten.top > maximalerAbstandVomRaumschiff) {
                objekt.daten.top -= 2 * maximalerAbstandVomRaumschiff;
            }
            if (objekt.daten.top - _raumschiff.daten.top < -maximalerAbstandVomRaumschiff) {
                objekt.daten.top += 2 * maximalerAbstandVomRaumschiff;
            }
        }
    };

    return {
        amLaufen: true,
        raumschiff: _raumschiff,
        asteroiden: _asteroiden,
        weiter: _weiter
    };
});

var spiel = Spiel();
