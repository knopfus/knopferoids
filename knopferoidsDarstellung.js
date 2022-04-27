
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

    var _explosionVorlage = document.querySelector("#Explosion-Vorlage");

    var _darstellbareObjekte = [],
        kamera = new Vektor(0, 0),
        weltraumElement = document.getElementById("Weltraum"),
        asteroidElement,
        asteroidTemplateElement;

    _darstellbareObjekte.push(
        new RaumschiffDarsteller(document.getElementById("Raumschiff"), spiel.raumschiff, _explosionVorlage)
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
            new AsteroidDarsteller(asteroidElement, asteroid, _explosionVorlage)
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
