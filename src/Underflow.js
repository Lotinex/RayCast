class _ {
    static loop(number, action){
        let R;
        for(let i=0; i<number; i++){
            R = action(i);
            if(R === false) break;
        }
        return R;
    }
    static go(...funcs){
        return (init) => {
            return funcs.reduce((res, func) => {
                return func(res);
            }, init)
        };
    }
    static arrayLoop(array, action){
        return _.loop(array.length, i => action(array[i], i));
    }
    static checkObjectValues(obj, value){
        let R = true;
        for(const key in obj){
            if(obj[key] !== value){
                R = false;
                break;
            }
        }
        return R;
    }
    static removeString(targetStr, value){
        return targetStr.replace(value, '');
    }
    static setValueInCases(target, caseMap){ 
        let R = null;
        for(const [k, v] of caseMap){
            if(k === target){
                if(v instanceof Function){
                    R = v(k);
                } else R = v;
                break;
            }
        }
        if(R === null && caseMap.has('<default>')){
            R = caseMap.get('<default>');
        }
        return R;
    }
    static transformString(string, transformActions){
        let R = [];
        for(const action of transformActions){
            R.push(action(string))
        }
        return R;
    }
    static switch(value, cases){
        return (funcs) => {
            _.arrayLoop(cases, (caseValue, i) => {
                if(caseValue === value) return void funcs[i]();
            })
        }
    }
    static setDefaultValueInCases(target, cases, defaultValue){
        let R;
        _.arrayLoop(cases, (v, i) => {
            if(v === target){
                R = defaultValue;
                return false;
            }
        })
        return R;
    }
    static validateUniqueValue(obj, expression){
        const counts = _.initValueWithProps(expression, 0);
        for(const key in expression){
            if(obj[key]){
                if(Object.is(obj[key], expression[key])){
                    counts[key]++;
                }
            } else {
                return false;
            }
        }
        let R = true;
        for(const key in counts){
            if(counts[key] > 1){
                R = false;
                break;
            }
        }
        return R;
    }
    static validate(obj, expression){
        const success = _.initValueWithProps(expression, false);
        for(const key in expression){
            if(obj[key]){
                if(Object.is(obj[key], expression[key])){
                    success[key] = true;
                }
            } else {
                return false;
            }
        }
        let R = true;
        for(const key in success){
            if(!success[key]){
                R = false;
                break;
            }
        }
        return R;
    }
    static initValueWithProps(source, value){
        const R = {};
        for(const key in source) R[key] = value;
        return R;
    }
    static getPxNumber(pxText){
        return Number(pxText.replace('px', ''));
    }
    static inverseKeyDefine(obj, keys){
        let R = obj;
        if(keys === undefined){
            for(const key in R){
                R[R[key]] = key;
            }
        } else {
            for(const key of keys){
                if(R.hasOwnProperty(key)){
                    R[R[key]] = key;
                }
            }
        }
        return R;
    }
    static createFrameLoop(action){
        const func = () => {
            action()
            requestAnimationFrame(func)
        }
        requestAnimationFrame(func)
        return func;
    }
}