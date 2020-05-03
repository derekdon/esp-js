import * as uuid from 'uuid';
import {Container, EspDiConsts} from 'esp-js-di';
import {
    ModuleBase,
    StateService,
    SystemContainerConst,
    ViewFactoryBase,
    PrerequisiteRegister,
    Logger,
    espModule
} from 'esp-js-ui';
import {TradingModuleContainerConst} from './tradingModuleContainerConst';
import {CashTileViewFactory} from './cash-tile/cashTileViewFactory';
import {BlotterViewFactory} from './blotter/blotterViewFactory';
import {BlotterModel} from './blotter/models/blotterModel';
import {TradingModuleDefaultStateProvider} from './tradingModuleDefaultStateProvider';
import {concat, Observable, throwError, timer} from 'rxjs';
import {take} from 'rxjs/operators';

let _log = Logger.create('TradingModule');

@espModule('trading-module', 'Trading Module')
export class TradingModule extends ModuleBase {
    _viewFactoryGroupId: string;
    _tradingModuleDefaultStateProvider = new TradingModuleDefaultStateProvider();

    constructor(container: Container, stateService: StateService) {
        super(container, stateService);
        this._viewFactoryGroupId = uuid.v4();
    }

    protected getDefaultStateProvider() {
        return this._tradingModuleDefaultStateProvider;
    }

    configureContainer() {
        _log.group('Configuring container');
        _log.debug(`Registering ${TradingModuleContainerConst.cashTileViewFactory}`);
        this.container
            .register(TradingModuleContainerConst.cashTileViewFactory, CashTileViewFactory)
            .inject(EspDiConsts.owningContainer, SystemContainerConst.router)
            .singleton()
            .inGroup(this._viewFactoryGroupId);
        _log.debug(`Registering ${TradingModuleContainerConst.blotterViewFactory}`);
        this.container
            .register(TradingModuleContainerConst.blotterViewFactory, BlotterViewFactory)
            .inject(EspDiConsts.owningContainer, SystemContainerConst.router)
            .singleton()
            .inGroup(this._viewFactoryGroupId);
        _log.debug(`Registering ${TradingModuleContainerConst.blotterModel}`);
        this.container
            .register(TradingModuleContainerConst.blotterModel, BlotterModel)
            .inject(SystemContainerConst.router, SystemContainerConst.region_manager)
            .singletonPerContainer();
        _log.groupEnd();
    }

    getViewFactories(): Array<ViewFactoryBase<any>> {
        return this.container.resolveGroup(this._viewFactoryGroupId);
    }

    registerPrerequisites(register: PrerequisiteRegister): void {
        _log.groupCollapsed('Registering  Prerequisites');
        _log.debug(`Registering 1`);
        register.registerStream(
            concat(
                timer(2000).pipe(take(1)),
                throwError(new Error('Load error'))
            ),
            'Loading Module That Fails'
        );
        _log.debug(`Registering 2`);
        register.registerStream(timer(2000).pipe(take(1)), 'Loading Referential Data');
        _log.groupEnd();
    }
}