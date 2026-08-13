import * as Dice from "../helpers/dice.js";
import { TinyD6System } from "../tinyd6.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * A compact client-side roll control that remains available above the hotbar.
 */
export default class DieRoller extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "die-roller",
        classes: ["tinyd6", "die-roller"],
        position: {
            width: 180,
            height: "auto"
        },
        window: {
            frame: false,
            title: "Tiny D6"
        },
        actions: {
            rollDice: this.#onDieRoll,
            toggleFocus: this.#onFocusToggle,
            toggleMarksman: this.#onMarksmanToggle
        }
    };

    static PARTS = {
        content: {
            template: "systems/tinyd6/templates/applications/die-roll.hbs"
        }
    };

    async _prepareContext(options) {
        return {
            ...(await super._prepareContext(options)),
            config: CONFIG.tinyd6,
            excludeTextLabels: this.options.excludeTextLabels ?? false
        };
    }

    async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);
        this.#restorePosition();
        this.#activateDragging();
    }

    #restorePosition() {
        const savedPosition = game.settings.get(TinyD6System.SYSTEM, "dieRollerPosition");
        if (savedPosition?.left !== undefined && savedPosition?.top !== undefined) {
            this.setPosition(savedPosition);
            return;
        }

        const hotbar = document.querySelector("#hotbar");
        if (!hotbar) return;

        const bounds = hotbar.getBoundingClientRect();
        this.setPosition({
            left: Math.round(bounds.right + 4),
            top: Math.round(bounds.top)
        });
    }

    #activateDragging() {
        const handle = this.element.querySelector("#die-roller-move-handle");
        if (!handle) return;

        handle.addEventListener("pointerdown", event => {
            event.preventDefault();
            const startX = event.clientX;
            const startY = event.clientY;
            const startPosition = {
                left: this.position.left ?? this.element.getBoundingClientRect().left,
                top: this.position.top ?? this.element.getBoundingClientRect().top
            };

            const onMove = moveEvent => {
                this.setPosition({
                    left: Math.round(startPosition.left + moveEvent.clientX - startX),
                    top: Math.round(startPosition.top + moveEvent.clientY - startY)
                });
            };

            const onEnd = async () => {
                document.removeEventListener("pointermove", onMove);
                document.removeEventListener("pointerup", onEnd);
                await game.settings.set(TinyD6System.SYSTEM, "dieRollerPosition", {
                    left: this.position.left,
                    top: this.position.top
                });
            };

            document.addEventListener("pointermove", onMove);
            document.addEventListener("pointerup", onEnd, { once: true });
        });
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

    static #onFocusToggle(event, target) {
        Dice.setFocusOption(this.element.closest("form") ?? this.element, target);
    }

    static #onMarksmanToggle(event, target) {
        Dice.setMarksmanOption(this.element.closest("form") ?? this.element, target);
    }
}
