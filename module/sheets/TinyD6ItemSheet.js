const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/**
 * Shared v14 Item sheet behavior. Concrete sheets provide their own template.
 */
export default class TinyD6ItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
    static DEFAULT_OPTIONS = {
        classes: ["tinyd6", "sheet", "item"],
        position: {
            width: 520,
            height: 600
        },
        window: {
            resizable: true
        },
        form: {
            submitOnChange: false
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const item = this.document;
        const theme = game.settings.get("tinyd6", "theme");

        return {
            ...context,
            item,
            cssClass: [...this.options.classes, theme].join(" "),
            config: CONFIG.tinyd6,
            data: {
                system: item.system
            },
            descriptionHTML: await TextEditor.enrichHTML(item.system.description, {
                secrets: item.isOwner,
                rollData: item.getRollData()
            }),
            traitHTML: item.system.trait
                ? await TextEditor.enrichHTML(item.system.trait, {
                    secrets: item.isOwner,
                    rollData: item.getRollData()
                })
                : "",
            owner: item.isOwner,
            rollData: item.getRollData()
        };
    }

    async _onRender(context, options) {
        await super._onRender(context, options);

        this.window.content.querySelectorAll("input, select, textarea").forEach(input => {
            input.addEventListener("change", async event => {
                const field = event.currentTarget.name;

                if (!field) return;

                const value = event.currentTarget.type === "checkbox"
                    ? event.currentTarget.checked
                    : event.currentTarget.type === "number"
                        ? Number(event.currentTarget.value || 0)
                        : event.currentTarget.value;
                await this.document.update({ [field]: value }, { render: false });
            });
        });
        this.window.content.querySelectorAll("prose-mirror").forEach(editor => {
            editor.addEventListener("save", () => this.submit());
        });
    }
}

export class TinyD6WeaponSheet extends TinyD6ItemSheet {
    static PARTS = {
        form: {
            template: "systems/tinyd6/templates/sheets/weapon-sheet.hbs",
            scrollable: [".item-sheet"]
        }
    };
}

export class TinyD6ArmorSheet extends TinyD6ItemSheet {
    static PARTS = {
        form: {
            template: "systems/tinyd6/templates/sheets/armor-sheet.hbs",
            scrollable: [".item-sheet"]
        }
    };
}

export class TinyD6GearSheet extends TinyD6ItemSheet {
    static PARTS = {
        form: {
            template: "systems/tinyd6/templates/sheets/gear-sheet.hbs",
            scrollable: [".item-sheet"]
        }
    };
}

export class TinyD6HeritageSheet extends TinyD6ItemSheet {
    static PARTS = {
        form: {
            template: "systems/tinyd6/templates/sheets/heritage-sheet.hbs",
            scrollable: [".item-sheet"]
        }
    };
}

export class TinyD6TraitSheet extends TinyD6ItemSheet {
    static PARTS = {
        form: {
            template: "systems/tinyd6/templates/sheets/trait-sheet.hbs",
            scrollable: [".item-sheet"]
        }
    };
}
