
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

var RaumschiffDarsteller = (function(htmlElement, raumschiff) {

    var _htmlElement = htmlElement,
        _raumschiff = raumschiff,
        _imgWennGas = htmlElement.querySelector("#Raumschiff-on"),
        _imgWennZerstört = htmlElement.querySelector("#Raumschiff-explode"),
        _linksVerschiebung = 0,
        _hochVerschiebung = 0;

    function _stelleDar() {
        platziereElement(
            _htmlElement,
            _raumschiff.daten.ort.x,
            _raumschiff.daten.ort.y,
            _raumschiff.daten.winkel,
            0,
            10);

        _imgWennGas.style.visibility = _raumschiff.daten.gibtGas ? "visible" : "hidden";
        if (_raumschiff.istZerstört()) {
            _imgWennZerstört.style.visibility = "visible";
            _imgWennZerstört.setAttribute("src", _imgWennZerstört.getAttribute("src"));
            spieleTon("explosion");
        } else {
            _imgWennZerstört.style.visibility = "hidden";
        }

    }

    return {
        stelleDar: _stelleDar
    };
});

var ReferenzPunktDarsteller = (function(htmlElement, objekt) {

    var _htmlElement = htmlElement, _objekt = objekt;

    function _stelleDar() {
        platziereElement(
            _htmlElement, _objekt.daten.ort.x, _objekt.daten.ort.y);
    }

    return {
        stelleDar: _stelleDar
    };
});

var AsteroidDarsteller = (function(htmlElement, asteroid) {

    var _htmlElement = htmlElement,
        _imgElement = _htmlElement.querySelector("img"),
        _spanElement = _htmlElement.querySelector("span"),
        _imgWennZerstört = htmlElement.querySelector(".Asteroid-explode"),
        _asteroid = asteroid,
        _explodiertUm = 0,
        _verschwundenUm;

    function _stelleDar() {
        if (_verschwundenUm) { return; }

        if (_explodiertUm) {
            if (Date.now() - _explodiertUm > 2000) {
                _verschwundenUm = Date.now();
                _imgWennZerstört.style.display = "none";
                _htmlElement.style.display = "none";
            }
            return;
        }

        _imgElement.style.width = asteroid.daten.radius * 2 + "px";
        _spanElement.innerText = Math.floor(_asteroid.daten.geschwindigkeitNachRechts*10) + "," +
            Math.floor(_asteroid.daten.geschwindigkeitNachUnten*10);
        platziereElement(_htmlElement, _asteroid.daten.ort.x, _asteroid.daten.ort.y, _asteroid.daten.winkel);

        if (_asteroid.istZerstört()) {
            _imgElement.style.display = "none";
            _imgWennZerstört.style.visibility = "visible";
            _imgWennZerstört.setAttribute("src", _imgWennZerstört.getAttribute("src"));
            spieleTon("explosion");
            _explodiertUm = Date.now();
        }
    }

    return {
        stelleDar: _stelleDar
    };
});

var SchussDarsteller = (function(htmlElement, schuss) {
    var _htmlElement = htmlElement,
        _schuss = schuss;

    function _stelleDar() {
        if (_schuss.lebt()) {
            platziereElement(_htmlElement, _schuss.daten.ort.x, _schuss.daten.ort.y);
            _htmlElement.style.visibility = "visible";
        } else {
            _htmlElement.style.visibility = "hidden";
        }
    }

    return {
        stelleDar: _stelleDar
    };
});

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
        RaumschiffDarsteller(document.getElementById("Raumschiff"), spiel.raumschiff)
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
            AsteroidDarsteller(asteroidElement, asteroid)
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
        ReferenzPunktDarsteller(document.getElementById("ReferenzPunkt"), spiel.raumschiff)
    );

    _darstellbareObjekte.push(
        StatusDarsteller(document.getElementById("Status"), spiel)
    );

    function _stelleDar() {
        kamera = spiel.raumschiff.daten.ort;

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
