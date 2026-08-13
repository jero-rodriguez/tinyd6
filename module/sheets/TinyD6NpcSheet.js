import TinyD6ActorSheet from "./TinyD6ActorSheet.js";

export default class TinyD6NpcSheet extends TinyD6ActorSheet {
    static DEFAULT_OPTIONS = {
        classes: ["npc"]
    };

    static PARTS = {
        form: {
            template: "systems/tinyd6/templates/sheets/npc-sheet.hbs",
            scrollable: [".actor-sheet"]
        }
    };
}
