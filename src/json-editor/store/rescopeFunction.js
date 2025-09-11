export function rescopeFunction(fun, scope={}, context=null) {
  if(fun._scope){
    if(fun._context!==context || Object.keys(scope).some(k=>fun._scope[k]!==scope[k])){
      return rescopeFunction(fun._original,Object.assign(fun._scope,scope),context);
    }else{
      return fun;
    }
  }

  const keys = Object.keys(scope).join(',');
  const $keys = Object.keys(scope).map(key=>`const $${key} = ${key};`).join('\n');
  if(!keys) {throw new Error('Scope is empty');}
  
  const res = Function(`
  const {${keys}} = this.scope;
  ${$keys}
  const $_cb = ${fun};
  return $_cb.apply(this.context,[...arguments,${keys}]);`)
  .bind({scope,context});

  res._scope = scope;
  res._context = context;
  res._original = fun;  
  return res;
}

