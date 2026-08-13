const {
    BooleanField,
    HTMLField,
    NumberField,
    SchemaField,
    StringField
} = foundry.data.fields;

const numberField = (initial, options = {}) => new NumberField({
    required: true,
    nullable: false,
    initial,
    ...options
});

const stringField = (initial = "", options = {}) => new StringField({
    required: true,
    nullable: false,
    initial,
    ...options
});

const booleanField = (initial = false, options = {}) => new BooleanField({
    required: true,
    nullable: false,
    initial,
    ...options
});

const resourceField = (value, max) => new SchemaField({
    value: numberField(value, { integer: true, min: 0 }),
    max: numberField(max, { integer: true, min: 0 })
});

/**
 * Common persisted data shared by all Tiny D6 Actor types.
 */
export class TinyD6ActorData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            wounds: resourceField(0, 12),
            description: new HTMLField({ required: true, nullable: false, initial: "" })
        };
    }

    static migrateData(source) {
        const data = foundry.utils.deepClone(source ?? {});
        data.wounds ??= {};
        data.wounds.value ??= 0;
        data.wounds.max ??= 12;
        return super.migrateData(data);
    }
}

/**
 * Data for the legacy Tiny D6 hero document type.
 */
export class TinyD6HeroData extends TinyD6ActorData {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.people = stringField();
        schema.homeland = stringField();
        schema.age = stringField();
        schema.eyes = stringField();
        schema.hair = stringField();
        schema.familyTrade = stringField();
        schema.belief = stringField();
        schema.xp = new SchemaField({
            max: numberField(0, { integer: true, min: 0 }),
            spent: numberField(0, { integer: true, min: 0 }),
            remaining: numberField(0, { integer: true, min: 0, persisted: false })
        });
        schema.advancement = resourceField(0, 3);
        schema.armorTotal = numberField(0, { integer: true, min: 0, persisted: false });
        schema.proficiencies = new SchemaField({
            lightMelee: booleanField(),
            heavyMelee: booleanField(),
            lightRanged: booleanField(),
            heavyRanged: booleanField(),
            masteredWeapons: stringField()
        });
        schema.corruptionThreshold = resourceField(0, 6);
        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.wounds.value = Math.min(this.wounds.value, this.wounds.max);
        this.corruptionThreshold.value = Math.min(this.corruptionThreshold.value, this.corruptionThreshold.max);
        this.advancement.value = Math.min(this.advancement.value, this.advancement.max);
        this.xp.remaining = Math.max(0, this.xp.max - this.xp.spent);
        this.armorTotal = this.parent.items
            .filter(item => item.type === "armor" && item.system.equipped)
            .reduce((total, item) => total + item.system.damageReduction, 0);
    }

    static migrateData(source) {
        const data = foundry.utils.deepClone(source ?? {});
        data.xp ??= {};
        data.xp.max ??= 0;
        data.xp.spent ??= 0;
        data.advancement ??= {};
        data.advancement.value ??= 0;
        data.advancement.max ??= 3;
        data.corruptionThreshold ??= {};
        data.corruptionThreshold.value ??= 0;
        data.corruptionThreshold.max ??= 6;
        data.proficiencies ??= {};
        return super.migrateData(data);
    }
}

/**
 * Data for the legacy Tiny D6 NPC document type.
 */
export class TinyD6NpcData extends TinyD6ActorData {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.corruptionTest = stringField("standard");
        return schema;
    }
}

/**
 * Common persisted data shared by all Tiny D6 Item types.
 */
export class TinyD6ItemData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new HTMLField({ required: true, nullable: false, initial: "" })
        };
    }

    static migrateData(source) {
        return super.migrateData(foundry.utils.deepClone(source ?? {}));
    }
}

class TinyD6SlottedItemData extends TinyD6ItemData {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.slots = new SchemaField({
            value: numberField(1, { integer: true, min: 0 })
        });
        return schema;
    }

    static migrateData(source) {
        const data = foundry.utils.deepClone(source ?? {});
        if (Number.isFinite(data.slots)) data.slots = { value: data.slots };
        data.slots ??= {};
        data.slots.value ??= 1;
        return super.migrateData(data);
    }
}

class TinyD6EquipmentData extends TinyD6SlottedItemData {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.equipped = booleanField();
        return schema;
    }
}

export class TinyD6WeaponData extends TinyD6EquipmentData {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.damage = numberField(1, { integer: true, min: 0 });
        schema.damageType = stringField();
        schema.group = stringField();
        return schema;
    }
}

export class TinyD6ArmorData extends TinyD6EquipmentData {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.depletion = new SchemaField({
            value: numberField(0, { integer: true, min: 0 })
        });
        schema.damageReduction = numberField(1, { integer: true, min: 0 });
        schema.group = stringField();
        return schema;
    }
}

export class TinyD6GearData extends TinyD6SlottedItemData {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.depletion = new SchemaField({
            value: numberField(0, { integer: true, min: 0 })
        });
        schema.quantity = new SchemaField({
            value: numberField(0, { integer: true, min: 0 })
        });
        return schema;
    }
}

export class TinyD6HeritageData extends TinyD6ItemData {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.trait = new HTMLField({ required: true, nullable: false, initial: "" });
        schema.startingHealth = numberField(6, { integer: true, min: 0 });
        schema.corruptionThreshold = numberField(6, { integer: true, min: 0 });
        return schema;
    }
}

export class TinyD6TraitData extends TinyD6ItemData {}

export const registerDataModels = () => {
    Object.assign(CONFIG.Actor.dataModels, {
        hero: TinyD6HeroData,
        npc: TinyD6NpcData
    });

    Object.assign(CONFIG.Item.dataModels, {
        weapon: TinyD6WeaponData,
        armor: TinyD6ArmorData,
        gear: TinyD6GearData,
        heritage: TinyD6HeritageData,
        trait: TinyD6TraitData
    });
};
