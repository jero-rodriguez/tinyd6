import * as Dice from "../helpers/dice.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Shared v14 Actor sheet behavior. Concrete sheets provide their own PARTS.
 */
export default class TinyD6ActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    static DEFAULT_OPTIONS = {
        classes: ["tinyd6", "sheet", "actor"],
        position: {
            width: 760,
            height: 800
        },
        window: {
            resizable: true
        },
        form: {
            submitOnChange: false
        },
        actions: {
            createItem: this.#onItemCreate,
            showItem: this.#onItemShow,
            deleteItem: this.#onItemDelete,
            equipItem: this.#onItemEquip,
            rollDice: this.#onDieRoll,
            toggleWound: this.#onWoundToggle
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const actor = this.document;
        const items = actor.items.contents;
        const traits = await Promise.all(items
            .filter(item => item.type === "trait")
            .map(async item => ({
                item,
                descriptionHTML: await TextEditor.enrichHTML(item.system.description ?? "", {
                    secrets: actor.isOwner,
                    rollData: actor.getRollData()
                })
            })));
        const weapons = items.filter(item => item.type === "weapon" && item.system.equipped);
        const armor = items.filter(item => item.type === "armor" && item.system.equipped);
        const gear = items.filter(item => item.type !== "trait" && item.type !== "heritage");
        const theme = game.settings.get("tinyd6", "theme");

        return {
            ...context,
            actor,
            cssClass: [...this.options.classes, theme].join(" "),
            config: {
                ...CONFIG.tinyd6,
                heritageHeaderPath: `tinyd6.actor.${theme}.heritage.header`,
                characterHeaderPath: `tinyd6.actor.${theme}.character`,
                heritageTraitPath: `tinyd6.actor.${theme}.heritage.traits`,
                heritageDeleteTooltipPath: `tinyd6.actor.${theme}.heritage.delete`,
                enableCorruption: game.settings.get("tinyd6", "enableCorruption"),
                enableDamageReduction: game.settings.get("tinyd6", "enableDamageReduction"),
                advancementMethod: game.settings.get("tinyd6", "enableAdvancement")
            },
            data: {
                system: actor.system,
                items
            },
            descriptionHTML: await TextEditor.enrichHTML(actor.system.description, {
                secrets: actor.isOwner,
                rollData: actor.getRollData()
            }),
            inventory: {
                traits,
                weapons,
                armor,
                gear,
                armorTotal: actor.system.armorTotal ?? 0
            },
            owner: actor.isOwner,
            rollData: actor.getRollData()
        };
    }

    async _onRender(context, options) {
        await super._onRender(context, options);
        const content = this.window.content;

        content.querySelectorAll("input, select, textarea").forEach(input => {
            input.addEventListener("change", event => this.#onFieldChange(event));
        });
        content.querySelectorAll("prose-mirror").forEach(editor => {
            editor.addEventListener("save", () => this.submit());
        });
    }

    async #onFieldChange(event) {
        const input = event.currentTarget;
        const meter = input.dataset.meter;

        if (meter) {
            const path = meter === "wounds"
                ? "system.wounds.value"
                : meter === "corruption"
                    ? "system.corruptionThreshold.value"
                    : "system.advancement.value";
            const current = this.document.system[path.split(".")[1]].value;
            const maximum = this.document.system[path.split(".")[1]].max;
            const value = input.checked ? current + 1 : current - 1;

            await this.document.update({ [path]: Math.min(Math.max(value, 0), maximum) }, { render: false });
            return;
        }

        const field = input.name;

        if (!field) return;

        const value = input.type === "checkbox"
            ? input.checked
            : input.type === "number"
                ? Number(input.value || 0)
                : input.value;
        const meterMaximum = field === "system.wounds.max" || field === "system.corruptionThreshold.max";

        await this.document.update({ [field]: value }, { render: false });

        if (meterMaximum) await this.render();
    }

    static async #onDieRoll(event, target) {
        event.preventDefault();
        await Dice.RollTest({
            numberOfDice: target.dataset.diceX,
            defaultThreshold: target.dataset.threshold,
            focusAction: target.dataset.enableFocus,
            marksmanTrait: target.dataset.enableMarksman
        });
    }

    static async #onItemCreate(event, target) {
        event.preventDefault();
        await this.document.createEmbeddedDocuments("Item", [{
            name: game.i18n.localize("tinyd6.sheet.newItem"),
            img: CONFIG.tinyd6.defaultItemImage,
            type: target.dataset.type
        }]);
    }

    #getItem(target) {
        const itemId = target.closest("[data-item-id]")?.dataset.itemId;
        return itemId ? this.document.items.get(itemId) : null;
    }

    static #onItemShow(event, target) {
        event.preventDefault();
        this.#getItem(target)?.sheet.render({ force: true });
    }

    static async #onItemDelete(event, target) {
        event.preventDefault();
        await this.#getItem(target)?.delete();
    }

    static async #onItemEquip(event, target) {
        event.preventDefault();
        const item = this.#getItem(target);

        if (!item) return;

        const equipped = !item.system.equipped;
        await item.update({ "system.equipped": equipped }, { render: false });
        this.updateEquipControl(target, equipped);
        await this.refreshEquippedLoadout();
    }

    updateEquipControl(target, equipped) {
        target.classList.toggle("equipped", equipped);
        target.setAttribute("aria-pressed", String(equipped));
        target.querySelector(".equip-label").textContent = game.i18n.localize(
            equipped ? "tinyd6.actor.equipped" : "tinyd6.actor.equip"
        );
    }

    async refreshEquippedLoadout() {
        const loadout = this.window.content.querySelector(".equipped-loadout");

        if (!loadout) return;

        const items = this.document.items.contents;
        const inventory = {
            weapons: items.filter(item => item.type === "weapon" && item.system.equipped),
            armor: items.filter(item => item.type === "armor" && item.system.equipped),
            armorTotal: this.document.system.armorTotal ?? 0
        };
        const html = await renderTemplate(
            "systems/tinyd6/templates/partials/equipped-loadout.hbs",
            { inventory }
        );

        loadout.replaceWith(document.createRange().createContextualFragment(html));
    }

    static async #onWoundToggle(event, target) {
        const wounds = this.document.system.wounds;
        const value = target.checked ? wounds.value + 1 : Math.max(0, wounds.value - 1);
        await this.document.update({ "system.wounds.value": Math.min(value, wounds.max) });
    }
}
