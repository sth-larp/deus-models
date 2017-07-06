function getCharacterName(model) {
    return model.firstName + " " + model.lastName;
}

function getRussianSex(sex) {
    switch (sex) {
        case "male":    return "мужской";
        case "female":  return "женский";
        default:        return sex;
    }
}

function getHandicaps(model) {
    if (model.hp == 0) {
        return "только лежать";
    } else {
        return "нет";
    }
}

function getStartPage(model) {
    return {
        pageType: "list",
        menuTitle: "Общая информация",
        body: {
            title: "Общая информация",
            items: [
                {
                    text: "Имя",
                    value: getCharacterName(model),
                },
                {
                    text: "ID",
                    value: model._id,
                },
                {
                    text: "Пол",
                    value: getRussianSex(model.sex),
                },
                {
                    text: "Возраст",
                    value: model.age,
                },
                {
                    text: "Сумма на счёте",
                    value: 0,
                },
                {
                    text: "Корпорация",
                    value: model.corporation,
                },
                {
                    text: "Hit Points",
                    value: model.hp + " / " + model.maxHp,
                    percent: 100 * model.hp / model.maxHp,
                },
                {
                    text: "Ограничения движения",
                    value: getHandicaps(model),
                },
            ],
        },
    };
}

function getRussianConditionTag(tag) {
    switch (tag) {
        case "physiology":  return "Физиология";
        case "mind":        return "Психология";
        default:            return "";
    }
}

function getConditionsPageItem(cond) {
    return {
        text: cond.text,
        tag: getRussianConditionTag(cond.class),
        icon: cond.class,
        details: {
            header: cond.text,
            text: cond.details || "",
        },
    };
}

function getConditionsPage(model) {
    return {
        pageType: "list",
        menuTitle: "Состояния",
        body: {
            title: "Ваши состояния",
            items: model.conditions.map(getConditionsPageItem),
            filters: ["Физиология", "Психология"],
        },
    };
}

function getTechnicalInfoPage() {
    return {
        pageType: "technical_info",
        menuTitle: "Техническая инфа"
    };
}

function getEconomyPage() {
    return {
        pageType: "economy",
        menuTitle: "Экономика"
    };
}


function getEnabledText(enabled) {
    return enabled ? "ON" : "OFF";
}

function getEnabledColor(enabled) {
    // TODO: Use magic color provided by the app
    return enabled ? "" : "#FF373F";
}

function getEnableActionText(enabled) {
    return enabled ? "Выключить" : "Включить";
}

function isImplant(modifier) {
    return modifier.class == "mechanical" ||
           modifier.class == "biological";
}

function getImplantDetails(modifier) {
    return modifier.details || ("Имплант " + modifier.displayName);
}

function getImplantsPageItem(modifier) {
    return {
        text: modifier.displayName,
        value: getEnabledText(modifier.enabled),
        valueColor: getEnabledColor(modifier.enabled),
        details: {
            header: modifier.displayName,
            text: getImplantDetails(modifier),
            actions: [
                {
                    text: getEnableActionText(modifier.enabled),
                    eventType: modifier.enabled ? "disableImplant" : "enableImplant",
                    data: {
                        mID: modifier.mID,
                    },
                },
            ],
        },
    };
}

function getImplantsPage(model) {
    return {
        pageType: "list",
        menuTitle: "Импланты",
        body: {
            title: "Импланты",
            items: model.modifiers.filter(isImplant).map(getImplantsPageItem),
        },
    };
}

function getMemoryPageItem(mem) {
    let textPieces = [];
    if (mem.text) textPieces.push(mem.text);
    if (mem.url) textPieces.push(mem.url);
    return {
        text: mem.title,
        details: {
            header: mem.title,
            text: textPieces.join("\n"),
        },
    };
}

function getMemoryPage(model) {
    return {
        pageType: "list",
        menuTitle: "Воспоминания",
        body: {
            title: "Воспоминания",
            items: model.memory.map(getMemoryPageItem),
        },
    };
}

// TODO: Can new systems be added dynamically?
function getBodyPage(model) {
    let systems = model.systems;
    return {
        pageType: "list",
        menuTitle: "Тело",
        body: {
            title: "Физиологические системы",
            items: [
                {
                    text: "Нервная система",
                    value: systems.NervousSystem,
                },
                {
                    text: "Сердечно-сосудистая система",
                    value: systems.CardioSystem,
                },
                {
                    text: "Руки",
                    value: systems.Hands,
                },
                {
                    text: "Ноги",
                    value: systems.Legs,
                },
            ],
        },
    };
}

function getPages(model) {
    return [
        getStartPage(model),
        // TODO: Add insurance
        getMemoryPage(model),
        getConditionsPage(model),
        getImplantsPage(model),
        //getBodyPage(model),
        getEconomyPage(),
        getTechnicalInfoPage()
    ];
}

// General characteristics not tied to any page or UI element.
function getGeneral(model) {
    return {
        maxSecondsInVr: 20 * 60,  // TODO: Get from model
    };
}

function getMenu(model) {
    return {
        characterName: getCharacterName(model),
    };
}

function getToolbar(model) {
    return {
        hitPoints: model.hp,
        maxHitPoints: model.maxHp,
    };
}

function getPassportScreen(model) {
    return {
        id: model._id,
        fullName: model.firstName + " " + model.lastName,
        corporation: model.corporation,
        email: model.mail
    };
}

function getViewModel(model) {
    return {
        _id: model._id,
        timestamp: model.timestamp,
        general: getGeneral(model),
        menu: getMenu(model),
        toolbar: getToolbar(model),
        passportScreen: getPassportScreen(model),
        pages: getPages(model),
    };
}


function setModifierEnabled(modifiers, id, enabled) {
    index = modifiers.findIndex((m) => m.mID == id);
    if (index < 0) {
        return modifiers;
    }
    modifiers[index].enabled = enabled;
    return modifiers;
}


module.exports = () => {
    return {
        _view(api, model) {
            return JSON.parse(JSON.stringify(getViewModel(model)));
        }
    };
};