
class Schuss extends Objekt {
    constructor(spiel) {
        super(0, 0, 1, 1, 0, 0, 0, spiel);
    }

    starte(ort, geschwindigkeit) {
        this.ort = ort;
        this.geschwindigkeit = geschwindigkeit;
        this.lebensPunkteSetzenAuf(500);
    }

    weiter() {
        super.weiter();

        this.lebensPunkteAbziehen(1);
    }

    stoss(subjekt, winkel) {
        this.zerstören();
        spieleTon("Schuss");
        subjekt.schussSchlägtEin();
    }
}

class SchussDarsteller extends ObjektDarsteller {

    constructor(htmlElement, schuss) {
        super(htmlElement, schuss);
    }

}
