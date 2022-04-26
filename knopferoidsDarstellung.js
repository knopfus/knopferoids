
var cssVonWinkel = function(winkel) {
    // Die Winkel in CSS sind wie die Uhr: Sie beginnen (mit 0) bei 12 Uhr und gehen
    // gehen sie dem Uhrzeiger nach.
    // Mathematische Winkel beginnen aber rechts (bei 3 Uhr) und gehen dann gegen
    // den Uhrzeigersinn.

    return (Math.PI / 2) - winkel;
};

var platziereElement = function(htmlElement, x, y, winkel, nachRechts, nachUnten) {
    if (!winkel) winkel = 0;
    if (!nachRechts) nachRechts = 0;
    if (!nachUnten) nachUnten = 0;

    htmlElement.style.transform = " "
            + "translateX(" + (x - htmlElement.clientWidth / 2) + "px) "
            + "translateY(" + (800 - y - htmlElement.clientHeight / 2) + "px) "
            + "rotate(" + cssVonWinkel(winkel) + "rad) "
            + "translateX(" + nachRechts + "px) "
            + "translateY(" + nachUnten + "px) ";
};

class ReferenzPunktDarsteller extends ObjektDarsteller { 

    constructor(htmlElement, objekt) {
        super(htmlElement, objekt);
    }

    stelleDar() {
        platziereElement(
            this.htmlElement, this.objekt.ort.x, this.objekt.ort.y);
    }
}

var StatusDarsteller = (function(htmlElement, spiel) {
    var _htmlElement = htmlElement,
        _displayDefault = htmlElement.style.display;

    function _stelleDar() {
        if (spiel.status == AM_LAUFEN) {
            _htmlElement.style.display = "none";
        } else {
            _htmlElement.style.display = _displayDefault;
            switch (spiel.status) {
                case PAUSE: _htmlElement.innerText = "Rette die Erde vor einschlagenden Asteroiden! Drücke P für Pause/Start"; break;
                case GAME_OVER: _htmlElement.innerHTML = "Aus und vorbei!<br/><a href='javascript:location.reload()'>r für Neustart</a>"; break;
                case GEWONNEN: _htmlElement.innerHTML = "Du hast die Erde gerettet!<br/>r für <a href='javascript:location.reload()'>Neustart</a>"; break;
            }
        }
    }

    return {
        stelleDar: _stelleDar
    };
});

var Spieldarsteller = (function(document, spiel) {

    var _darstellbareObjekte = [],
        kamera = new Vektor(0, 0),
        weltraumElement = document.getElementById("Weltraum"),
        asteroidElement,
        asteroidTemplateElement;

    _darstellbareObjekte.push(
        new RaumschiffDarsteller(document.getElementById("Raumschiff"), spiel.raumschiff)
    );

    for (var asteroid of spiel.asteroiden) {
        if (!asteroidElement) {
            // Für den ersten Asteroiden nehmen wir das originale HTML Element
            asteroidElement = document.getElementById("Asteroid0");
        } else {
            // Für die weiteren klonen wir das jeweils vorherige Element
            asteroidElement = asteroidElement.cloneNode(true);
            weltraumElement.appendChild(asteroidElement); // Fügt das HTML Element innerhalb des Weltraums hinzu
        }
        _darstellbareObjekte.push(
            new AsteroidDarsteller(asteroidElement, asteroid)
        );
    }

    var schussElementVorlage = document.getElementById("Schuss-Vorlage");

    for (var schuss of spiel.schüsse) {
        var schussElement = schussElementVorlage.cloneNode(true);
        schussElement.removeAttribute("id");
        schussElementVorlage.parentElement.appendChild(schussElement);
        _darstellbareObjekte.push(new SchussDarsteller(schussElement, schuss));
    }

    _darstellbareObjekte.push(
        new ReferenzPunktDarsteller(document.getElementById("ReferenzPunkt"), spiel.raumschiff)
    );

    _darstellbareObjekte.push(
        StatusDarsteller(document.getElementById("Status"), spiel)
    );

    function _stelleDar() {
        kamera = spiel.raumschiff.ort;

        weltraumElement.style.left = -kamera.x + window.innerWidth / 2;
        weltraumElement.style.top = kamera.y - window.innerHeight / 2 - 20;
        for (objekt of _darstellbareObjekte) {
            objekt.stelleDar();
        }
    };

    return {
        stelleDar: _stelleDar
    };
});


var spielDarsteller = Spieldarsteller(document, spiel);
