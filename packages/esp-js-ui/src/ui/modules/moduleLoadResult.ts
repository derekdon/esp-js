import {LoadResult} from './prerequisites';

export enum ModuleChangeType {
    Change = 'Change',
    Error = 'Error'
}

export interface ModuleLoadResult {
    type: ModuleChangeType;
    moduleKey: string;
    moduleName: string;
    description?: string;
    prerequisiteResult?: LoadResult;
    errorMessage?: string;
    hasCompletedLoaded?: boolean;
}