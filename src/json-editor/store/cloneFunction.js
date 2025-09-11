import cloneWith from 'lodash-es/cloneWith';
import cloneDeepWith from 'lodash-es/cloneDeepWith';
import {rescopeFunction} from './rescopeFunction';

export function cloneFunction(source) {
  if (_.isFunction(source)) {
    
      try {
        if(!source._scope){
          return eval('(' + source.toString() + ')');
        }else{
          return rescopeFunction(source._original,source._scope,source._context);
        }
      } catch (err) {
        err.message = 'Failed to parse function. ' + err.message;
        throw err;
      }    
  }
}

export function cloneWithFunctions(source) {
  return cloneWith(source, function(val) {
    if (_.isFunction(val)) {
      return _.cloneFunction(val);
    }
  });
}

export function cloneDeepWithFunctions(source) {
  return cloneDeepWith(source, function(val) {
    if (_.isFunction(val)) {
      return _.cloneFunction(val);
    }
  });
}
