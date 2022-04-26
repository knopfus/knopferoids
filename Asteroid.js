

class Asteroid extends Objekt {

    constructor(ort, geschwindigkeit, masse, radius, winkel, winkelGeschwindigkeit) {
        super(ort, geschwindigkeit, masse, radius, winkel, winkelGeschwindigkeit, radius);
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


function neuerZufallsAsteroid(naheBeiX, naheBeiY) {
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
            zufallsZahl(0.002)
        );
};


class AsteroidDarsteller extends ObjektDarsteller {

    constructor(htmlElement, asteroid) {

        super(htmlElement, asteroid);

        this.imgElement = this.htmlElement.querySelector("img");
        this.spanElement = this.htmlElement.querySelector("span");
        this.imgWennZerstört = htmlElement.querySelector(".Asteroid-explode");
        this.asteroid = asteroid;
        this.explodiertUm = 0;
        this.verschwundenUm;

    }

    stelleDar() {
        if (this.verschwundenUm) { return; }

        if (this.explodiertUm) {
            if (Date.now() - this.explodiertUm > 2000) {
                this.verschwundenUm = Date.now();
                this.imgWennZerstört.style.display = "none";
                this.htmlElement.style.display = "none";
            }
            return;
        }

        this.imgElement.style.width = this.asteroid.radius * 2 + "px";
        this.spanElement.innerText = Math.floor(this.asteroid.geschwindigkeitNachRechts*10) + "," +
            Math.floor(this.asteroid.geschwindigkeitNachUnten*10);
        platziereElement(this.htmlElement, this.asteroid.ort.x, this.asteroid.ort.y, this.asteroid.winkel);

        if (this.asteroid.istZerstört()) {
            this.imgElement.style.display = "none";
            this.imgWennZerstört.style.visibility = "visible";
            this.imgWennZerstört.setAttribute("src", this.imgWennZerstört.getAttribute("src"));
            spieleTon("explosion");
            this.explodiertUm = Date.now();
        }
    }
}
