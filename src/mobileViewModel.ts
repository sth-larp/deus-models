import { ViewModelApiInterface } from "deus-engine-manager-api";

interface PageViewModel {
  menuTitle: string;
  __type: string;
  viewId: string;
}


interface Row {
    text: string,
    value: string,
    percent?: number,
    valueColor?: string
};

function getCharacterName(model) {
    return model.firstName + " " + model.lastName;
}

function getRussianSex(sex) {
    switch (sex) {
        case "male": return "мужской";
        case "female": return "женский";
        case "agender": return "агендер";
        default: return "---";
    }
}

function getHandicaps(model) {
    if (model.hp == 0) {
        return "только лежать";
    } else {
        return "";
    }
}

function getStartPage(model) {
    let isHuman = model.profileType == "human";
    let isProgram = model.profileType == "program";
    let isExHumanProgram = model.profileType == "exhuman-program";
    let isRobot = model.profileType == "robot";
    let isExHumanRobot = model.profileType == "ex-human-robot";

    const items: Row[] = [
        {
            text: "Имя",
            value: getCharacterName(model),
        },
        {
            text: "ID",
            value: model._id,
        },
        {
            text: "e-mail",
            value: model.mail,
        },

    ];

    let pageInfo = {
        __type: "ListPageViewModel",
        viewId: "page:general",
        menuTitle: "Общая информация",
        body: {
            title: "Общая информация",
            items: items
        },
    };

    if (!isProgram && !isExHumanProgram) {
        pageInfo.body.items.push({ text: "Пол", value: getRussianSex(model.sex) });
    }

    if (!model.isAlive) {
        pageInfo.body.items.unshift({
            text: "Состояние персонажа", value: "Вы мертвы!", valueColor: "#ff565c"
        });
    }

    if (isRobot) {
        pageInfo.body.items.unshift({ text: "Тип системы:", value: `Андроид ${model.model}` });
    }

    if (isExHumanRobot) {
        pageInfo.body.items.unshift({ text: "Тип системы:", value: model.model });
    }

    if (isProgram || isExHumanProgram) {
        pageInfo.body.items.unshift({ text: "Тип системы:", value: "Программа" });
    }

    if (model.profileType == "robot" || isProgram) {
        pageInfo.body.items.push({ text: "Создатель", value: model.creator })
        pageInfo.body.items.push({ text: "Владелец", value: model.owner })
    }

    if (isHuman) {
        pageInfo.body.items.push({ text: "Поколение", value: model.generation })
    }

    if (!isProgram && !isExHumanProgram) {
        pageInfo.body.items.push({ text: "Проживание", value: model.sweethome })
    }

    let workRow = {
        text: "Работа",
        value: model.corporation,
    };

    let insuranceRow = {
        text: "Страховка",
        value: model.insuranceDiplayName
    };

    if (isHuman || isExHumanProgram || isExHumanRobot) {
        pageInfo.body.items.push(workRow);
        pageInfo.body.items.push(insuranceRow);
    }

    if (!isProgram && !isExHumanProgram) {

        let hpRow: Row = {
            text: "Hit Points",
            value: model.hp + " / " + model.maxHp,
            percent: 0,
        };

        if (model.maxHp) {
            hpRow.percent = 100 * model.hp / model.maxHp
        }

        if (model.hp == 0) {
            hpRow.valueColor = "#ff565c";
        }

        pageInfo.body.items.push(hpRow);
    }

    let illnesses = model.modifiers.filter(e => e.class == "illness" && e.currentStage > 2);

    if (illnesses && illnesses.length) {
        pageInfo.body.items.push({
            text: "Внимание!",
            value: "Больно и плохо, врача!",
            valueColor: "#ff565c",
            percent: 100
        });
    }
    else if (isHuman) {
        pageInfo.body.items.push({
            text: "Инфо:",
            value: "Проверяй ALICE часто",
        });

    }

    let handicaps = getHandicaps(model);
    if (handicaps) {
        pageInfo.body.items.push({
            text: "Ограничения движения",
            value: getHandicaps(model),
            valueColor: "#ff565c"
        })
    }

    return pageInfo;
}


function getRussianConditionTag(tag) {
    switch (tag) {
        case "physiology": return "Физиология";
        case "mind": return "Психология";
        default: return "Физиология";
    }
}

function getConditionsPageItem(cond) {
    let header = cond.text;
    let details = cond.details ? cond.details : header;
    let condClass = cond.class ? cond.class : "physiology";

    if (details == header || details == (header + ".")) {
        header = "Состояние";
    }

    return {
        viewId: "id:" + cond.id,
        text: cond.text,
        tag: getRussianConditionTag(condClass),
        icon: condClass,
        details: {
            header,
            text: details
        },
    };
}

function getConditionsPage(model) {
    return {
        __type: "ListPageViewModel",
        viewId: "page:conditions",
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
        __type: "TechnicalInfoPageViewModel",
        viewId: "page:technicalInfo",
        menuTitle: "Техническая инфа"
    };
}

function getEconomyPage() {
    return {
        __type: "EconomyPageViewModel",
        viewId: "page:economy",
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


const implantsClasses = ["cyber-implant", "bio-implant", "illegal-cyber-implant", "illegal-bio-implant", "virtual", "firmware"];

function isImplant(modifier) {
    return implantsClasses.find(c => modifier.class == c)
}

const systemNames = {
    "musculoskeletal": "опорно-двигательная",
    "cardiovascular": "сердечно-сосудистая",
    "respiratory": "дыхательная",
    "endocrine": "эндокринная",
    "lymphatic": "лимфатическая",
    "nervous": "нервная",
}

function getImplantDetails(modifier) {
    let details = modifier.details || "подробного описания нет";

    if (modifier.system) {
        return `<p><b>Система организма:</b> ${systemNames[modifier.system]}</p><p><b>Описание:</b></p><p>${details}</p>`;
    } else {
        return `<p><b>Описание:</b></p><p>${details}</p>`;
    }
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
                // {
                //     text: getEnableActionText(modifier.enabled),
                //     eventType: modifier.enabled ? "disable-implant" : "enable-implant",
                //     dangerous: modifier.enabled ? true : false,
                //     needsQr: false,
                //     data: {
                //         mID: modifier.mID,
                //     },
                // }
                // {
                //     text: "Отдать гопнику (не работает)",
                //     eventType: "giveAway",
                //     needsQr: 100,
                //     destructive: true,
                //     data: {
                //         mID: modifier.mID,
                //     },
                // },
            ],
        },
    };
}

function getImplantsPage(model) {
    let pageTitle = model.profileType == "human" ? "Импланты" : "Прошивки";

    return {
        __type: "ListPageViewModel",
        viewId: "page:implants",
        menuTitle: pageTitle,
        body: {
            title: pageTitle,
            items: model.modifiers.filter(isImplant).map(getImplantsPageItem),
        },
    };
}

function getMemoryPageItem(mem) {
    let header = mem.title;

    if (mem.text == mem.title || mem.text == (mem.title + ".")) {
        header = "Воспоминание";
    }

    let details = "";
    if (mem.text) details += `<p>${mem.text.replace(/\s/g, ' ')}</p>`;
    if (mem.url) details += `<p><a href="${mem.url}">${mem.url}</a></p>`

    return {
        text: mem.title,
        details: {
            header: header,
            text: details
        },
    };
}

function getMemoryPage(model) {
    return {
        __type: "ListPageViewModel",
        viewId: "page:memory",
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
        __type: "ListPageViewModel",
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

// TODO: Get data from model
function getAdminsPage(model) {
    return {
        __type: "ListPageViewModel",
        menuTitle: "Администраторы",
        viewId: "page:admins",
        body: {
            title: "Администраторы",
            items: [
                {
                    text: "Правая рука",
                    subtext: "007, 12, 13",
                    sublist: {
                        title: "Админы: Правая рука",
                        eventType: "setAdmins",
                        eventTag: "rightHand",
                        items: [
                            {
                                text: "007",
                                deletable: false,
                            },
                            {
                                text: "12",
                                deletable: true,
                            },
                            {
                                text: "13",
                                deletable: true,
                            },
                        ],
                        addAction: {
                            buttonText: "Добавить",
                            inputDialogTitle: "ID администратора",
                            inputDialogMessage: "Укажите ID нового администратора для системы <b>Правая рука</b>",
                            inputType: "number",
                        },
                    },
                },
            ],
        },
    };
}

function getChangesPageItem(change) {
    return {
        viewId: "mid:" + change.mID,
        text: change.text,
        unixSecondsValue: Math.round(change.timestamp / 1000),
        details: {
            header: "Изменение",
            text: change.text
        }
    };
}

function getChangesPage(model) {
    return {
        __type: "ListPageViewModel",
        viewId: "page:changes",
        menuTitle: "Изменения",
        body: {
            title: "Изменения",
            items: model.changes.reverse().map(getChangesPageItem),
        },
    };
}

function getMessagesPageItem(message) {
    return {
        viewId: "mid:" + message.mID,
        text: message.title,
        details: {
            header: message.title,
            text: message.text,
        },
    };
}

function getMessagesPage(model) {
    return {
        __type: "ListPageViewModel",
        viewId: "page:messages",
        menuTitle: "Сообщения",
        body: {
            title: "Сообщения",
            items: model.messages.reverse().map(getMessagesPageItem),
        },
    };
}


function getPages(model) {
    let pages: PageViewModel[] = [];

    let isHuman = model.profileType == "human";
    let isProgram = model.profileType == "program";
    let isExHumanProgram = model.profileType == "exhuman-program";
    let isExHumanRobot = model.profileType == "ex-human-robot";

    pages.push(getStartPage(model));
    pages.push(getMemoryPage(model));

    if (!isProgram) {
        pages.push(getConditionsPage(model));
    }

    if (!isProgram && !isExHumanRobot && !isExHumanProgram) {
        pages.push(getImplantsPage(model));
    }

    if (isHuman || isExHumanProgram || isExHumanRobot) {
        pages.push(getEconomyPage());
    }
    pages.push(getChangesPage(model));
    pages.push(getMessagesPage(model));

    if (model.adminTestUser) {
        pages.push(getAdminsPage(model));
    }


    if (model.hasOwnProperty("showTechnicalInfo") && model.showTechnicalInfo) {
        pages.push(getTechnicalInfoPage());
    }

    return pages;
}

// General characteristics not tied to any page or UI element.
function getGeneral(model) {
    return {
        maxSecondsInVr: model.maxSecondsInVr
    };
}

function getMenu(model) {
    return {
        characterName: getCharacterName(model),
    };
}

function getToolbar(model) {
    let ret = {
        hitPoints: model.hp,
        maxHitPoints: model.maxHp,
    };

    if (model.maxHp == 0) {
        ret.maxHitPoints = 1;
    }

    return ret;
}

function getPassportScreen(model) {
    return {
        id: model._id,
        fullName: model.firstName + " " + model.lastName,
        corporation: model.corporation ? model.corporation : "",
        email: model.mail ? model.mail : "",
        insurance: model.insuranceDiplayName
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
    const index = modifiers.findIndex((m) => m.mID == id);
    if (index < 0) {
        return modifiers;
    }
    modifiers[index].enabled = enabled;
    return modifiers;
}


module.exports = () => {
    return {
        _view(api: ViewModelApiInterface, model) {
            try {
                return getViewModel(model);
            }
            catch (err) {
                // The app would display error message when ViewModel is incorrect
                return {};
            }
        }
    };
};
