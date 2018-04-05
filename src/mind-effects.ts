/**
 * Эффекты, воздействующие на мозг
 */

import helpers = require('../helpers/model-helper');
import consts = require('../helpers/constants');

/**
 * Универсальный эффект "изменение кубиков сознания " (change-mind-cube-effect)
 * Аналогичен changeMindCubeEvent
 */
function changeMindCubesEffect(api, modifier){

    api.debug("changeMindCubesEffect: start, change: " + JSON.stringify(modifier));
    let changeCommand = modifier.mindCubeChange;

    let timerValue = api.getTimer(consts.NARCO_TIME_PREFIX + modifier.mID);

    if (timerValue){
        api.debug("Timer: " + JSON.stringify(timerValue) );

        var scale = timerValue.miliseconds < modifier.pushbackDuration ? -110 : 100;

        if(changeCommand){
            helpers.modifyMindCubes(api, api.model.mind, changeCommand, scale);
        }
    }
}

module.exports = () => {
    return {
        changeMindCubesEffect
    };
};