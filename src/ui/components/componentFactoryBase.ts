import {Container} from 'microdi-js';
import * as _ from 'lodash';
import { getComponentFactoryMetadata } from './componentDecorator';
import {DisposableBase} from 'esp-js';
import ModelBase from '../modelBase';
import {ComponentFactoryMetadata} from './componentDecorator';

abstract class ComponentFactoryBase extends DisposableBase {
    private _currentComponents: Array<ModelBase>;
    private _metadata: ComponentFactoryMetadata;

    constructor(private _container : Container) {
        super();
        this._currentComponents = [];
        this._metadata = getComponentFactoryMetadata(this);
    }

    public get componentKey(): string {
        return this._metadata.componentKey;
    }

    public get shortName(): string {
        return this._metadata.shortName;
    }

    public get showInAddComponentMenu() : boolean {
        return this._metadata.showInAddComponentMenu;
    }

    protected abstract _createComponent(childContainer: Container, state? : any);

    public createComponent(state = null): void {
        let childContainer = this._container.createChildContainer();
        let component : ModelBase = this._createComponent(childContainer, state);
        component.addDisposable(childContainer);
        component.addDisposable(() => {
            let index = this._currentComponents.indexOf(component);
            if (index > -1) {
                this._currentComponents.splice(index, 1);
            } else {
                throw new Error('Could not find a component in our set');
            }
        });
        this._currentComponents.push(component);
    }

    public getAllComponentsState(): {componentFactoryKey:string, componentsState: any[]} {
        if(this._currentComponents.length === 0) {
            return null;
        }
        let componentsState = _(this._currentComponents)
            .map(c => c.getState())
            .compact() // removes nulls
            .value();
        return {
            componentFactoryKey: this.componentKey,
            componentsState: componentsState
        };
    }

    public shutdownAllComponents(): void {
        // copy the array as we have some disposal code that remove items on disposed
        let components = this._currentComponents.slice();
        _.forEach(components, component => {
            component.dispose();
        });
        this._currentComponents.length = 0;
    }
}
export default ComponentFactoryBase;
