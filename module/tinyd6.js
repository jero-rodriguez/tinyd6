import { registerGameSettings } from "./settings.js";
import { tinyd6 } from "./config.js";
import {
    TinyD6ArmorSheet,
    TinyD6GearSheet,
    TinyD6HeritageSheet,
    TinyD6TraitSheet,
    TinyD6WeaponSheet
} from "./sheets/TinyD6ItemSheet.js";
import TinyD6HeroSheet from "./sheets/TinyD6HeroSheet.js";
import TinyD6NpcSheet from "./sheets/TinyD6NpcSheet.js";
import DieRoller from "./applications/DieRoller.js";
import * as Dice from "./helpers/dice.js";
import { registerDataModels } from "./data/models.js";

export class TinyD6System {
    static SYSTEM = "tinyd6";
    static SOCKET = "system.tinyd6";

    static init() {
        console.log("tinyd6 | Initializing Tiny D6 system");

        CONFIG.tinyd6 = tinyd6;
        registerDataModels();
        // CONFIG.debug.hooks = true;
    
        const { DocumentSheetConfig } = foundry.applications.apps;
        DocumentSheetConfig.registerSheet(foundry.documents.Actor, TinyD6System.SYSTEM, TinyD6HeroSheet, {
            makeDefault: true,
            types: ["hero"]
        });
        DocumentSheetConfig.registerSheet(foundry.documents.Actor, TinyD6System.SYSTEM, TinyD6NpcSheet, {
            makeDefault: true,
            types: ["npc"]
        });

        DocumentSheetConfig.registerSheet(foundry.documents.Item, TinyD6System.SYSTEM, TinyD6WeaponSheet, {
            makeDefault: true,
            types: ["weapon"]
        });
        DocumentSheetConfig.registerSheet(foundry.documents.Item, TinyD6System.SYSTEM, TinyD6ArmorSheet, {
            makeDefault: true,
            types: ["armor"]
        });
        DocumentSheetConfig.registerSheet(foundry.documents.Item, TinyD6System.SYSTEM, TinyD6GearSheet, {
            makeDefault: true,
            types: ["gear"]
        });
        DocumentSheetConfig.registerSheet(foundry.documents.Item, TinyD6System.SYSTEM, TinyD6HeritageSheet, {
            makeDefault: true,
            types: ["heritage"]
        });
        DocumentSheetConfig.registerSheet(foundry.documents.Item, TinyD6System.SYSTEM, TinyD6TraitSheet, {
            makeDefault: true,
            types: ["trait"]
        });
    
        registerGameSettings();
        this._preloadHandlebarsTemplates();
    
        Handlebars.registerHelper("times", function(n, content) {
            let result = "";
            for (let i = 0; i < n; ++i) {
                result += content.fn(i);
            }
    
            return result;
        });
    
        Handlebars.registerHelper("face", Dice.diceToFaces);
    }

    static ready() {
        console.log("tinyd6 | ready");
        //game.socket.on(TinyD6System.SOCKET, TinyD6System.onMessage);
        TinyD6System.displayFloatingDieRollerApplication();
    }

    static async displayFloatingDieRollerApplication() {
        new DieRoller({ excludeTextLabels: true }).render({ force: true });
    }
    
    static async _preloadHandlebarsTemplates() {
        const templatePaths = [
            "systems/tinyd6/templates/partials/trait-block.hbs",
            "systems/tinyd6/templates/partials/roll-bar.hbs",
            "systems/tinyd6/templates/partials/item-header.hbs",
            "systems/tinyd6/templates/partials/inventory-card.hbs",
            "systems/tinyd6/templates/partials/equipped-loadout.hbs"
        ];
    
        return loadTemplates(templatePaths);
    }

    static emit(action, args = {}) {
        console.log(action, TinyD6System.SOCKET);
        args.action = action;
        args.senderId = game.user.id;
        game.socket.emit(TinyD6System.SOCKET, args, (resp) => { console.log(resp); });
    }

    static onMessage(data) {
        switch (data.action) {
            case 'dieRoll': {
                Dice.RollTest(data);
            } 
            break;
        }
    }
}

Hooks.once("init", () => {
    TinyD6System.init();
});

Hooks.on("ready", TinyD6System.ready);

Hooks.on("createItem", (item) => {
    if (item.actor && item.type === "heritage") {
        item.actor.update({
            "system.wounds.value": 0,
            "system.wounds.max": item.system.startingHealth,
            "system.corruptionThreshold.value": 0,
            "system.corruptionThreshold.max": item.system.corruptionThreshold
        });
    }
});
