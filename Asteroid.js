

class Asteroid extends Objekt {

    constructor(ort, geschwindigkeit, masse, radius, winkel, winkelGeschwindigkeit, spiel) {
        super(ort, geschwindigkeit, masse, radius, winkel, winkelGeschwindigkeit, radius, spiel);
    }

    schussSchlägtEin() {
        if (this.radius >= MIN_GRÖSSE) {
            this.lebensPunkteAbziehen(spiel.schnellModus() ? 10 : 2);

            this.radius = this.lebensPunkte;
            this.masse = Math.pow(this.radius / 10, 3);
        }

        if (this.radius < MIN_GRÖSSE) {
            this.zerstören();
        }
    }
}


function neuerZufallsAsteroid(naheBeiX, naheBeiY, spiel) {
    function zufallsZahl(max) {
        return (Math.random() * 2 - 1) * max;
    }

    var radius = zufallsZahl((MAX_GRÖSSE - MIN_GRÖSSE) / 2) + (MAX_GRÖSSE - MIN_GRÖSSE) / 2 + MIN_GRÖSSE;

    return new Asteroid(
            new Vektor(naheBeiX + zufallsZahl(MAX_ABSTAND_RAUMSCHIFF * 2), naheBeiY + zufallsZahl(MAX_ABSTAND_RAUMSCHIFF * 2)),
            new Vektor(zufallsZahl(1), zufallsZahl(1)),
            Math.pow(radius / 10, 3),
            radius,
            zufallsZahl(180),
            zufallsZahl(0.002),
            spiel
        );
};


class AsteroidDarsteller extends ObjektDarsteller {

    constructor(htmlElement, asteroid, explosionVorlage) {

        super(htmlElement, asteroid, 0, 0, explosionVorlage);
        this.imgElement = this.htmlElement.querySelector("img");

    }

    stelleDar() {
        super.stelleDar();

        if (this.objekt.lebt()) {
            this.imgElement.style.width = this.objekt.radius * 2 + "px";
        }
    }
}
