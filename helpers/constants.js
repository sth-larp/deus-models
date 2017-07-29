const DAMAGE_MODIFIER_MID = "_internal_damage";

//Задержка для списания хитов при ранении
const HP_LEAK_DELAY = 600000;
const HP_LEAK_TIMER = "_hp-leak-timer";

//Задержка между HP == 0 и смертью
const DEATH_DELAY = 1200*1000;
const DEATH_TIMER = "_dead-timer";

const MAX_CHANGES_LINES = 30;

const medicSystems = [
    { name: "musculoskeletal", label: "опорно-двигательная", slots: 2},
    { name: "cardiovascular", label: "сердечно-сосудистая", slots: 1},
    { name: "respiratory", label: "дыхательная", slots: 1}, 
    { name: "endocrine", label: "эндокринная", slots: 1}, 
    { name: "lymphatic", label: "лимфатическая", slots: 1},
    { name: "nervous", label: "нервная", slots: 2},
];



module.exports = () => {
    return {
        DAMAGE_MODIFIER_MID,
        medicSystems,
        MAX_CHANGES_LINES,
        HP_LEAK_TIMER,
        HP_LEAK_DELAY,
        DEATH_DELAY,
        DEATH_TIMER
    };
};
