
window.onkeydown = function(event) {
    switch (event.key) {
        case "ArrowLeft":  spiel.raumschiff.startLinksDrehung(); break;
        case "ArrowRight": spiel.raumschiff.startRechtsDrehung(); break;
        case "ArrowUp":    spiel.raumschiff.startGas(); break;
        case " ":          spiel.raumschiff.schiesse(); break;
        case "p":          spiel.pausierenOderWeitermachen();
                           spielDarsteller.stelleDar();
                           break;
        case "r":          if (spiel.status != AM_LAUFEN) { location.reload(); } break;
        case "@":          spiel.schnellModusAn(); break;
    }
};

window.onkeyup = function(event) {
    switch (event.key) {
        case "ArrowLeft":  spiel.raumschiff.stopLinksDrehung(); break;
        case "ArrowRight": spiel.raumschiff.stopRechtsDrehung(); break;
        case "ArrowUp":    spiel.raumschiff.stopGas(); break;
    }
};


spiel.weiter();
spielDarsteller.stelleDar();

(function wiederhole() { window.setTimeout(function() {
    if (spiel.status == AM_LAUFEN) {
        spiel.weiter();
        spielDarsteller.stelleDar();
    }

    wiederhole();
}, 10);})();
