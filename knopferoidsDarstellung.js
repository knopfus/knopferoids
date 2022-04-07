
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

    var _htmlElement = htmlElement,
        _imgElement = _htmlElement.querySelector("img"),
        _spanElement = _htmlElement.querySelector("span"),
        _asteroid = asteroid;

    function _stelleDar() {
        _imgElement.style.width = asteroid.daten.radius * 2 + "px";
        _spanElement.innerText = Math.floor(_asteroid.daten.geschwindigkeitNachRechts*10) + "," +
            Math.floor(_asteroid.daten.geschwindigkeitNachUnten*10);
        platziereElement(_htmlElement, _asteroid.daten.left, _asteroid.daten.top, _asteroid.daten.winkel);
    }

    return {
        stelleDar: _stelleDar
    };
});

var Spieldarsteller = (function(document, spiel) {

    var _darstellbareObjekte = [], kameraLeft = 0, kameraTop = 0,
        weltraumElement = document.getElementById("Weltraum"), asteroidElement, asteroidTemplateElement, i;

    _darstellbareObjekte.push(
        RaumschiffDarsteller(document.getElementById("Raumschiff"), spiel.raumschiff)
    );

    for (asteroid of spiel.asteroiden) {
        if (!asteroidElement) {
            // Für den ersten Asteroiden nehmen wir das originale HTML Element
            asteroidElement = document.getElementById("Asteroid0");
        } else {
            // Für die weiteren klonen wir das jeweils vorherige Element
            asteroidElement = asteroidElement.cloneNode(true);
            weltraumElement.appendChild(asteroidElement); // Fügt das HTML Element innerhalb des Weltraums hinzu
        }
        _darstellbareObjekte.push(
            AsteroidDarsteller(asteroidElement, asteroid)
        );
    }

    _darstellbareObjekte.push(
        ReferenzPunktDarsteller(document.getElementById("ReferenzPunkt"), spiel.raumschiff)
    );

    function _stelleDar() {
        kameraLeft = spiel.raumschiff.daten.left - 500;
        kameraTop = spiel.raumschiff.daten.top - 200;

        weltraumElement.style.left = -kameraLeft;
        weltraumElement.style.top = -kameraTop;
        for (objekt of _darstellbareObjekte) {
            objekt.stelleDar();
        }
    };

    return {
        stelleDar: _stelleDar
    };
});



var spielDarsteller = Spieldarsteller(document, spiel);
