// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 // notice_end

import Observable from '../Observable';
import { Guard } from '../../system';

// TODO beta, needs test
Observable.prototype.takeUntil = function(predicate, inclusive) {
    Guard.isFunction(predicate, "provided predicate isn't a function");
    let source = this;
    let done = false;
    let subscribe =  observer => {
        return source.subscribe(
            (arg1, arg2, arg3) => {
                if(done) return;
                let shouldTake = predicate(arg1, arg2, arg3);
                if(shouldTake || inclusive) {
                    done = true;
                    observer.onNext(arg1, arg2, arg3);
                    observer.onCompleted();
                }
            },
            () => observer.onCompleted()
        );
    };
    return new Observable(subscribe);
};
