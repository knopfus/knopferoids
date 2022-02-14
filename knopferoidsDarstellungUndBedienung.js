
var cssVonWinkel = function(winkel) {
    // Die Winkel in CSS sind wie die Uhr: Sie beginnen (mit 0) bei 12 Uhr und gehen
    // gehen sie dem Uhrzeiger nach.
    // Mathematische Winkel beginnen aber rechts (bei 3 Uhr) und gehen dann gegen
    // den Uhrzeigersinn.

    return (Math.PI / 2) - winkel;
};

var platziereElement = function(htmlElement, left, top, winkel, nachRechts, nachUnten) {
    if (!winkel) winkel = 0;
    if (!nachRechts) nachRechts = 0;
    if (!nachUnten) nachUnten = 0;

    htmlElement.style.transform = " "
            + "translateX(" + (left - htmlElement.clientWidth / 2) + "px) "
            + "translateY(" + (top - htmlElement.clientHeight / 2) + "px) "
            + "rotate(" + cssVonWinkel(winkel) + "rad) "
            + "translateX(" + nachRechts + "px) "
            + "translateY(" + nachUnten + "px) ";
};

var RaumschiffDarsteller = (function(htmlElement, raumschiff) {

    var _htmlElement = htmlElement,
        _raumschiff = raumschiff,
        _imgWennGas = htmlElement.querySelector("#Raumschiff-on"),
        _linksVerschiebung = 0,
        _hochVerschiebung = 0;

    function _stelleDar() {
        platziereElement(
            _htmlElement, _raumschiff.daten.left, _raumschiff.daten.top, _raumschiff.daten.winkel, 0, 10);

        _imgWennGas.style.visibility = _raumschiff.daten.gibtGas ? "visible" : "hidden";
    }

    return {
        stelleDar: _stelleDar
    };
});

var ReferenzPunktDarsteller = (function(htmlElement, objekt) {

    var _htmlElement = htmlElement, _objekt = objekt;

    function _stelleDar() {
        platziereElement(
            _htmlElement, _objekt.daten.left, _objekt.daten.top);
    }

    return {
        stelleDar: _stelleDar
    };
});

var AsteroidDarsteller = (function(htmlElement, asteroid) {

    var _htmlElement = htmlElement, _asteroid = asteroid;

    function _stelleDar() {
        platziereElement(_htmlElement, _asteroid.daten.left, _asteroid.daten.top, _asteroid.daten.winkel);
    }

    return {
        stelleDar: _stelleDar
    };
});

var Spieldarsteller = (function(document, spiel) {

    var _darstellbareObjekte = [];

    _darstellbareObjekte.push(
        RaumschiffDarsteller(document.getElementById("Raumschiff"), spiel.raumschiff)
    );

    for (asteroid of spiel.asteroiden) {
        _darstellbareObjekte.push(
            AsteroidDarsteller(document.getElementById("Asteroid0"), asteroid)
        );
    }

    _darstellbareObjekte.push(
        ReferenzPunktDarsteller(document.getElementById("ReferenzPunkt"), spiel.raumschiff)
    );

    function _stelleDar() {
        for (objekt of _darstellbareObjekte) {
            objekt.stelleDar();
        }
    };

    return {
        stelleDar: _stelleDar
    };
});



var spielDarsteller = Spieldarsteller(document, spiel);

var spielBedienung = {
    //                 Wenn Taste gedrükt wird:             Wenn Taste losgelassen wird:
    //                 -------------------------------------------------------------------------
    pfeilNachLinks:  [ spiel.raumschiff.startLinksDrehung,  spiel.raumschiff.stopLinksDrehung ],
    pfeilNachRechts: [ spiel.raumschiff.startRechtsDrehung, spiel.raumschiff.stopRechtsDrehung ],
    pfeilNachOben:   [ spiel.raumschiff.startGas,           spiel.raumschiff.stopGas ]
};



window.onkeydown = function(event) {
    switch (event.key) {
        case "ArrowLeft":  spielBedienung.pfeilNachLinks[0](); break;
        case "ArrowRight": spielBedienung.pfeilNachRechts[0](); break;
        case "ArrowUp":    spielBedienung.pfeilNachOben[0](); break;
    }
};

window.onkeyup = function(event) {
    switch (event.key) {
        case "ArrowLeft":  spielBedienung.pfeilNachLinks[1](); break;
        case "ArrowRight": spielBedienung.pfeilNachRechts[1](); break;
        case "ArrowUp":    spielBedienung.pfeilNachOben[1](); break;
    }
};

(function wiederhole() { window.setTimeout(function() {

    spiel.weiter();

    spielDarsteller.stelleDar();

    if (spiel.amLaufen) {
        wiederhole();
    }
}, 10);})();