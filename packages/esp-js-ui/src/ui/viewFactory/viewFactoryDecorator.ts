import {Guard} from 'esp-js';

export function getViewFactoryMetadata(target): ViewFactoryMetadata {
    let constructorFunction = target.constructor;
    if (constructorFunction.__viewFactoryMetadata) {
        return constructorFunction.__viewFactoryMetadata;
    }
    throw new Error(`No view factory metadata found on '${target && target.name}'`);
}

export function viewFactory(viewKey: string, shortName: string, customMetadata?: any) {
    Guard.isDefined(viewKey, 'viewKey must be defined');
    return (target) => {
        target.__viewFactoryMetadata = new ViewFactoryMetadata(viewKey, shortName, customMetadata);
    };
}

export class ViewFactoryMetadata {
    constructor(public readonly viewKey: string, public readonly shortName: string, public readonly customMetadata?: any) {
        Guard.isString(viewKey, 'viewKey must be defined and be a string');
        Guard.isString(shortName, 'shortName must be defined and be a string');
    }
}
