export async function RollTest({
    numberOfDice = 2,
    numberOfSides = 6,
    defaultThreshold = 5,
    focusAction = false,
    marksmanTrait = false } = {}) {

    let threshold = defaultThreshold;
    if (focusAction && (focusAction === 'true')) {
        threshold = threshold - 1;
    }

    if (marksmanTrait && (marksmanTrait === 'true')) {
        threshold = threshold - 1;
    }
    
    const rollFormula = `${numberOfDice}d${numberOfSides}cs>=${threshold}`;

    // Execute the roll
    const result = await new Roll(rollFormula, {}).evaluate();
    let renderedRoll = await renderTemplate("systems/tinyd6/templates/partials/test-result.hbs", { rollResult: result });
    // let renderedRoll = await result.render({ result: result, template: "systems/tinyd6/templates/partials/test-result.hbs" });

    const chatData = {
        speaker: ChatMessage.getSpeaker(),
        content: renderedRoll
    };

    result.toMessage(chatData);
}

export function setFocusOption(form, element) {
    if (!form) return;

    form.querySelectorAll(".die-roller > .roll-dice").forEach(tag => {
        tag.dataset.enableFocus = element.checked;
    });

    if (element.checked) {
        form.querySelector(".action-modifiers .toggle-marksman")?.removeAttribute("disabled");
    } else {
        const marksmanElement = form.querySelector(".action-modifiers .toggle-marksman");
        if (marksmanElement) {
            marksmanElement.checked = false;
            marksmanElement.setAttribute("disabled", "");
        }
    }
}

export function setMarksmanOption(form, element) {
    if (!form) return;

    form.querySelectorAll(".die-roller > .roll-dice").forEach(tag => {
        tag.dataset.enableMarksman = element.checked;
    });
}

export function diceToFaces(value, content) {
    switch (value) {
        case 1:
            return "fa-dice-one";
        case 2:
            return "fa-dice-two";
        case 3:
            return "fa-dice-three";
        case 4:
            return "fa-dice-four";
        case 5:
            return "fa-dice-five";
        case 6:
            return "fa-dice-six";
    }

    return "fa-dice-d6";
}
