const en = {
    CANCEL: "Cancel",
    GETTING_POSITION: "Getting your position...",
    LOADING_MAP: "Loading map...",
    START_GUIDING_CTA: "Start guiding",
    DEFINING_GUIDING_LINE_START: "Defining guiding reference line, go to starting point and confirm",
    CONFIRM: "Confirm",
    DEFINING_GUIDING_LINE_START_CONFIRMED: "Starting point of reference line defined, go to end point and confirm",
    SPECIFY_EQUIPMENT_WIDTH: "Specify equipment width (meters)",
    START_RECORDING_CTA: "Start recording",
    SAVE_CTA: "Save",
    POOR_ACCURACY: "Poor positioning accuracy",
    MEDIUM_ACCURACY: "Medium positioning accuracy",
    GOOD_ACCURACY: "Good positioning accuracy",
    TAB_NAVIGATION: "Navigation",
    TAB_GPSSTATUS: "GPS Status",
    TAB_HISTORY: "History",
    TAB_ABOUT: "About",
    FETCHING_GALILEO_STATUS: "Fetching Galileo status...",
    POOR_GALILEO_DUAL_FREQ: "Your phone supports Galileo and can receive dual frequency signals, you should be able to get a much better accuracy... Try to move in an open sky environment",
    POOR_GALILEO_NO_DUAL_FREQ: "Your phone supports Galileo but can't receive dual frequency signals, you should be able to get medium accuracy ... Try to move in an open sky environment",
    POOR_NO_GALILEO_NO_DUAL_FREQ: "Your phone does not support Galileo and can't receive dual frequency signals, your positioning accuracy will be limited.",
    MEDIUM_GALILEO_DUAL_FREQ: "Your phone supports Galileo and can receive dual frequency signals, you should be able to get a better accuracy. Try to move in an open sky environment",
    MEDIUM_GALILEO_NO_DUAL_FREQ: "Your phone supports Galileo but can't receive dual frequency signals, you won't be able to get a better accuracy than this.",
    GOOD_GALILEO_DUAL_FREQ: "Your phone supports Galileo and can receive dual frequency signals, you have the best accuracy possible thanks to Galileo.",
    GALILEO_GALILEO_DUALFREQ: "Your phone supports Galileo and can receive dual frequency signals, you are able to get the best accuracy possible thanks to Galileo.",
    GALILEO_GALILEO_NO_DUALFREQ: "Your phone supports Galileo but can't receive dual frequency signals.",
    GALILEO_NO_GALILEO_NO_DUALFREQ: "Your phone does not support Galileo, your positioning accuracy will be limited.",
    HISTORY_NO_RECORDING: "No recording yet."
}

const fr = {
    CANCEL: "Annuler",
    GETTING_POSITION: "En attente de votre position...",
    LOADING_MAP: "Chargement carte...",
    START_GUIDING_CTA: "Démarrer guidage",
    DEFINING_GUIDING_LINE_START: "Définition de la ligne de référence, allez au point de départ et confirmez",
    CONFIRM: "Confirmer",
    EFINING_GUIDING_LINE_START_CONFIRMED: "Point de départ de la ligne de référence confirmé, aller à la fin de votre première ligne et confirmez",
    SPECIFY_EQUIPMENT_WIDTH: "Taille de l'outil (en mètres)",
    START_RECORDING_CTA: "Démarrer enregistrement",
    SAVE_CTA: "Sauvegarder",
    POOR_ACCURACY: "Mauvais positionnement GPS",
    MEDIUM_ACCURACY: "Positionnement GPS moyen",
    GOOD_ACCURACY: "Bon positionnement GPS",
    TAB_NAVIGATION: "Navigation",
    TAB_GPSSTATUS: "GPS Status",
    TAB_HISTORY: "Historique",
    TAB_ABOUT: "A propos",
    FETCHING_GALILEO_STATUS: "Chargement du status Galileo...",
    POOR_GALILEO_DUAL_FREQ: "Votre téléphone supporte Galileo et peut recevoir les signaux double fréquence, vous devriez pouvoir avoir une meilleure précision... Essayez d’aller dans un endroit dégagé.",
    POOR_GALILEO_NO_DUAL_FREQ: "Votre téléphone supporte Galileo mais ne peut pas recevoir les signaux double fréquence, cependant vous devriez pouvoir avoir une meilleure précision... Essayez d’aller dans un endroit dégagé.",
    POOR_NO_GALILEO_NO_DUAL_FREQ: "Votre téléphone ne supporte pas Galileo, votre précision sera limitée.",
    MEDIUM_GALILEO_DUAL_FREQ: "Votre téléphone supporte Galileo et peut recevoir les signaux double fréquence, vous devriez pouvoir avoir une meilleure précision... Essayez d’aller dans un endroit dégagé.",
    MEDIUM_GALILEO_NO_DUAL_FREQ: "Votre téléphone supporte Galileo mais ne peut pas recevoir les signaux double fréquence, vous n’aurez pas de bien meilleure précision",
    GOOD_GALILEO_DUAL_FREQ: "Votre téléphone supporte Galileo et peut recevoir les signaux double fréquence, vous avez la meilleure précision possible grâce à Galileo.",
    GALILEO_GALILEO_DUALFREQ: "Votre téléphone supporte Galileo et peut recevoir les signaux double fréquence, vous avez la meilleure précision possible grâce à Galileo.",
    GALILEO_GALILEO_NO_DUALFREQ: "Votre téléphone supporte galileo mais ne peut pas recevoir les signaux double fréquence",
    GALILEO_NO_GALILEO_NO_DUALFREQ: "Votre téléphone ne supporte pas galileo, votre précision sera limitée.",
    HISTORY_NO_RECORDING: "Pas d'enregistrement pour l'instant"
}

export function getString(id, lang) {
    if(lang.indexOf('fr') > -1) {
        return fr[id] || '';
    } else {
        return en[id] || '';
    }
}