const _ = require('lodash');
const medicHelpers = require('../helpers/medic-helper.js')();

const PILL_TIMEOUT = 2 * 60 * 60 * 1000;


function useCure(api, pill) {
    // нет болезней - нет лечения
}

function useStamm(api, pill) {
    if (api.model.profileType !== 'human') return;

    if (api.model.genome) {
        _.set(api.model, ['genome', pill.affectedGenomePos], pill.affectedGenomeVal);
    }
}

function useAid(api, pill, event) {
    if (api.model.profileType !== 'human') return;

    medicHelpers.restoreDamage(api, 1, event);
    if (api.model.genome && _.get(api.model, ['usedPills', pill.id])) {
        _.set(api.model, ['genome', pill.affectedGenomePos], pill.affectedGenomeVal);
    }
}

function useNarco(api, pill) {
    if (api.model.profileType !== 'human') return;
    api.sendEvent(null, 'take-narco', { id: pill.id, narco: pill });
}

function usePill(api, data, event) {
    if (!api.model.isAlive) return;

    let code = api.aquired('pills', data.id);
    if (!code) {
        api.error(`usePill: can't aquire code ${data.id}`);
        return;
    } 

    let pill = api.getCatalogObject('pills', code.pillId);
    if (!pill) {
        api.error(`usePill: can't load pill ${code.pillId}`);
        return;
    } 

    api.info(`usePill: started code: ${code}, pill: ${JSON.stringify(pill)}`);

    const previousUsage = _.get(api.model, ['usedPills', pill.id]);

    if (!previousUsage || event.timestamp - previousUsage > PILL_TIMEOUT) {
        switch (pill.pillType) {
        case 'cure':
            useCure(api, pill, event);
            break;
        case 'stamm':
            useStamm(api, pill, event);
            break;
        case 'aid':
            useAid(api, pill, event);
            break;
        case 'narco':
            useNarco(api, pill, event);
            break;

        default:
            return;
        }
    }

    _.set(api.model, ['usedPills', pill.id], event.timestamp);
    code.usedAt = event.timestamp;
    code.usedBy = api.model._id;
}

function aquirePills(api, events) {
    if (!api.model.isAlive) return;

    events
        .filter((event) => event.eventType == 'usePill')
        .forEach((event) => api.aquire('pills', event.data.id));
}

module.exports = {
    _preprocess: aquirePills,
    usePill
};
