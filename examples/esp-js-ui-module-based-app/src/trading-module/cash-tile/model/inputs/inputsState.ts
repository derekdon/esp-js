import {PolimerHandlerMap} from 'esp-js-polimer';
import {
    Logger
} from 'esp-js-ui';
import {InputEvents} from '../../events';
import {CashTileModel} from '../cashTileModel';

const _log = Logger.create('CashTile-InputsState');

export interface InputsState {
    ccyPair: string;
    notional: number;
}

export const defaultInputsStateFactory = (ccyPair?: string): InputsState => {
    return {
        ccyPair: ccyPair || 'EURUSD',
        notional: 1000000
    };
};

export const inputStateHandlerMap: PolimerHandlerMap<InputsState, CashTileModel> = {
    [InputEvents.changeCurrencyPair]: (draft: InputsState, event: InputEvents.CurrencyPairChangedEvent) => {
        _log.info(`Changing currency pair to ${event.newPair}`, event);
        draft.ccyPair = event.newPair;
    },
    [InputEvents.notionalChanged]: (draft: InputsState, event: InputEvents.NotionalChanged) => {
        _log.info(`Changing notional to ${event.notional}`, event);
        draft.notional = event.notional;
    }
};
