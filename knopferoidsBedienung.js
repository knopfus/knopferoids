
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