
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


var Spiel = (function() {

    var _ausfuehrbareObjekte = [],
        _bewegbareObjekte = [],
        _raumschiff,
        _asteroiden = [];


    _raumschiff = Raumschiff(500, 200, NORD);
    _ausfuehrbareObjekte.push(_raumschiff);
    _bewegbareObjekte.push(_raumschiff);

    var asteroid = Asteroid({ left: 100, top: 100, winkel: 0, geschwindigkeitNachRechts: 0.2, geschwindigkeitNachUnten: 0.1, geschwindigkeitWinkel: 0.001 });
    _asteroiden.push(asteroid);
    _bewegbareObjekte.push(asteroid);


    function _weiter() {
        for (objekt of _ausfuehrbareObjekte) {
            objekt.fuehreAus();
        }

        for (objekt of _bewegbareObjekte) {
            objekt.bewege();
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
