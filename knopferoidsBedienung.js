
var spielBedienung = {
    //                 Wenn Taste gedrükt wird:             Wenn Taste losgelassen wird:
    //                 -------------------------------------------------------------------------
    pfeilNachLinks:  [ spiel.raumschiff.startLinksDrehung,  spiel.raumschiff.stopLinksDrehung ],
    pfeilNachRechts: [ spiel.raumschiff.startRechtsDrehung, spiel.raumschiff.stopRechtsDrehung ],
    pfeilNachOben:   [ spiel.raumschiff.startGas,           spiel.raumschiff.stopGas ],
    leertaste:       [ spiel.raumschiff.schiesse ],
    p:               [ function() {
                           spiel.pausierenOderWeitermachen();
                           spielDarsteller.stelleDar();
                        } ]
};



window.onkeydown = function(event) {
    switch (event.key) {
        case "ArrowLeft":  spielBedienung.pfeilNachLinks[0](); break;
        case "ArrowRight": spielBedienung.pfeilNachRechts[0](); break;
        case "ArrowUp":    spielBedienung.pfeilNachOben[0](); break;
        case " ":          spielBedienung.leertaste[0](); break;
        case "p":          spielBedienung.p[0](); break;
        case "@":          spiel.schnellModusAn(); break;
    }
};

window.onkeyup = function(event) {
    switch (event.key) {
        case "ArrowLeft":  spielBedienung.pfeilNachLinks[1](); break;
        case "ArrowRight": spielBedienung.pfeilNachRechts[1](); break;
        case "ArrowUp":    spielBedienung.pfeilNachOben[1](); break;
    }
};


spiel.weiter();
spielDarsteller.stelleDar();

(function wiederhole() { window.setTimeout(function() {
    if (spiel.status() == AM_LAUFEN) {
        spiel.weiter();
        spielDarsteller.stelleDar();
    }

    wiederhole();
}, 10);})();