
class StatusDarsteller {

    constructor(htmlElement, spiel) {
        this.htmlElement = htmlElement;
    }

    stelleDar() {
        if (spiel.status == AM_LAUFEN) {
            this.htmlElement.style.display = "none";
        } else {
            this.htmlElement.style.display = "";
            switch (spiel.status) {
                case PAUSE: this.htmlElement.innerText = "Rette die Erde vor einschlagenden Asteroiden! Drücke P für Pause/Start"; break;
                case GAME_OVER: this.htmlElement.innerHTML = "Aus und vorbei!<br/><a href='javascript:location.reload()'>r für Neustart</a>"; break;
                case GEWONNEN: this.htmlElement.innerHTML = "Du hast die Erde gerettet!<br/>r für <a href='javascript:location.reload()'>Neustart</a>"; break;
            }
        }
    }
}

function elementKopieren(vorlage) {
    var kopie = vorlage.cloneNode(true);
    kopie.removeAttribute("id");
    vorlage.parentElement.appendChild(kopie);
    return kopie;
}

class Spieldarsteller {

    constructor(document, spiel) {

        this.darstellbareObjekte = [];
        this.weltraumElement = document.getElementById("Weltraum");

        var explosionVorlage = document.querySelector("#Explosion-Vorlage");

        this.darstellbareObjekte.push(new RaumschiffDarsteller(document.getElementById("Raumschiff"), spiel.raumschiff, explosionVorlage));

        var asteroidVorlage = document.querySelector("#Asteroid-Vorlage");
        var asteroidDarstellers = spiel.asteroiden.map(asteroid => (new AsteroidDarsteller(elementKopieren(asteroidVorlage), asteroid, explosionVorlage)));

        var schussVorlage = document.getElementById("Schuss-Vorlage");
        var schussDarstellers = spiel.schüsse.map(schuss => (new SchussDarsteller(elementKopieren(schussVorlage), schuss)));

        this.darstellbareObjekte = this.darstellbareObjekte.concat(asteroidDarstellers).concat(schussDarstellers);

        this.darstellbareObjekte.push(new StatusDarsteller(document.getElementById("Status"), spiel));
    }

    stelleDar() {
        var kamera = spiel.raumschiff.ort;

        this.weltraumElement.style.left = -kamera.x + window.innerWidth / 2;
        this.weltraumElement.style.top = kamera.y - window.innerHeight / 2 - 20;
        for (var objekt of this.darstellbareObjekte) {
            objekt.stelleDar();
        }
    };
}


var spielDarsteller = new Spieldarsteller(document, spiel);
