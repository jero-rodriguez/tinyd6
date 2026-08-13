import TinyD6ActorSheet from "./TinyD6ActorSheet.js";
import * as Dice from "../helpers/dice.js";

export default class TinyD6HeroSheet extends TinyD6ActorSheet {
    static DEFAULT_OPTIONS = {
        classes: ["hero"],
        actions: {
            toggleFocus: this.#onFocusToggle,
            toggleMarksman: this.#onMarksmanToggle,
            toggleCorruption: this.#onCorruptionToggle,
            toggleAdvancement: this.#onAdvancementToggle
        }
    };

    static PARTS = {
        form: {
            template: "systems/tinyd6/templates/sheets/hero-sheet.hbs",
            scrollable: [".actor-sheet"]
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const heritage = this.document.items.find(item => item.type === "heritage") ?? null;

        return {
            ...context,
            heritage,
            archetypeTraitHTML: heritage
                ? await TextEditor.enrichHTML(heritage.system.trait ?? "", {
                    secrets: this.document.isOwner,
                    rollData: this.document.getRollData()
                })
                : ""
        };
    }

    #getForm(target) {
        return target.closest("form");
    }

    static #onFocusToggle(event, target) {
        Dice.setFocusOption(this.#getForm(target), target);
    }

    static #onMarksmanToggle(event, target) {
        Dice.setMarksmanOption(this.#getForm(target), target);
    }

    static async #onCorruptionToggle(event, target) {
        const threshold = this.document.system.corruptionThreshold;
        const value = target.checked ? threshold.value + 1 : Math.max(0, threshold.value - 1);
        await this.document.update({
            "system.corruptionThreshold.value": Math.min(value, threshold.max)
        });
    }

    static async #onAdvancementToggle(event, target) {
        const advancement = this.document.system.advancement;
        const value = target.checked ? advancement.value + 1 : Math.max(0, advancement.value - 1);
        await this.document.update({
            "system.advancement.value": Math.min(value, advancement.max)
        });
    }
}
