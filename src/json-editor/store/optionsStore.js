import * as funJSON from 'funjson/es/funJSON';
import _ from 'lodash-es';
import deepdash from 'deepdash-es';
deepdash(_);
import { cloneFunction, cloneDeepWithFunctions } from './cloneFunction';
import scheme from './optionScheme';
const sections = [
  'model',
  'view',
  'controller',
  'controls',
  'iocontrols',
  'events',
  'vars',
  'icons',
  'bindings',
  'triggers',
];
const stores = {};

export default function createStore(id, name) {
  if (stores[id]) {
    // console.log('destroy store ' + name, stores[id]);
    stores[id].destroy();
  }

  stores[id] = {
    name,
    listeners: _.zipObject(
      sections,
      sections.map(() => [])
    ),
    options: {
      instance: _.zipObject(
        sections,
        sections.map(() => null)
      ),
      json: _.zipObject(
        sections,
        sections.map(() => '{}')
      ),
      script: _.zipObject(
        sections,
        sections.map(() => '')
      ),
    },
    setInstance: (options, sections) => setInstance(stores[id], options, sections),
    getInstance: (sections) => getInstance(stores[id], sections),
    setSection: (section, data) => setInstance(stores[id], { [section]: data }, section),
    getSection: (section) => getInstance(stores[id], section)[section],
    setJSON: (options, sections) => setJSON(stores[id], options, sections),
    setScript: (options, sections) => setScript(stores[id], options, sections),
    checkSum: (sections) => checkSum(stores[id], sections),
    on: (sections, listener) => on(stores[id], sections, listener),
    off: (listener) => off(stores[id], listener),
    fire: (sections) => fire(stores[id], sections),
    mergeOptions: (options) => mergeOptions(options || stores[id].options.instance),
    destroy: () => {
      delete stores[id];
    },
    id,
  };
  // console.log('create store ' + name, stores[id]);
  return stores[id];
}

function on(store, sections, listener) {
  sections = checkSections(sections);
  // console.log(store.name + '.on', sections);
  sections.forEach((section) => {
    store.listeners[section].push(listener);
    store.listeners[section] = _.uniq(store.listeners[section]);
  });
  return store;
}

function off(store, listener) {
  sections.forEach((section) => {
    _.pull(store.listeners[section], listener);
  });
  return store;
}

function fire(store, sections) {
  sections = checkSections(sections);
  // console.log(store.name + '.fire', sections);
  _.uniq(
    sections.reduce((res, section) => res.concat(store.listeners[section]), [])
  ).forEach((listener) => listener(store));
}

function checkSections(sections2Check) {
  if (!sections2Check) {
    return sections;
  } else if (!_.isArray(sections2Check)) {
    sections2Check = [sections2Check];
  } else {
    sections2Check = _.uniq(sections2Check);
  }

  return sections2Check;
}

function setJSON(store, json, sections) {
  // console.log(store.name + '.setJSON', sections);
  var instance = json;
  if (_.isString(instance)) {
    try {
      instance = funJSON.parse(instance);
    } catch (err) {
      err.message = 'Chart options JSON parse error.\n' + err.message;
      throw err;
    }
  }

  if (instance.options) {
    instance = instance.options;
  }

  if (_.isString(instance)) {
    try {
      instance = funJSON.parse(instance);
    } catch (err) {
      err.message = 'Chart options JSON parse error.\n' + err.message;
      throw err;
    }
  }

  // console.log('controls setJSON', instance);
  return setInstance(store, splitOptions(instance), sections);
}

function setScript(store, script, sections) {
  sections = checkSections(sections);
  // console.log(store.name + '.setScript', sections);
  var instance = {};
  sections.forEach((section) => {
    try {
      let f = new Function('return ' + script[section]);
      instance[section] = f();
    } catch (err) {
      err.message = `JavaScript evaluation failed in ${store.name}::${section} script. Error:
${err.message}`;
      throw err;
    }
  });
  return setInstance(store, instance, sections);
}

function splitOptions(options) {
  // console.log('splitOptions b4', options);
  options = cloneDeepWithFunctions(options);
  var instance = {
    model: { series: [] },
    view: {},
    controller: { series: [] },
    controls: { controls: [] },
    iocontrols: { controls: [] },
    vars: {},
    bindings: {
      data: {},
      vars: {},
      icons: {},
      parameters: {},
      persistent: {},
      domainvars: {}
    },
    icons: [],
    triggers: {

      audioTriggers: {},
      componentTriggers: {},
      canvasTriggers: {},
      applicationTriggers: {},
      timerTriggers: {},
    },
  };
  _.each(options.series, function(serie) {
    var model = { type: serie.type, name: serie.name };
    var controller = { type: serie.type, name: serie.name };
    _.each(['nodes', 'links', 'edges'], function(dataField) {
      if (serie[dataField]) {
        model[dataField] = serie[dataField];
        delete serie[dataField];
      }
    });
    // console.log('split serie', serie, controller, model);
    _.eachDeep(
      serie,
      function(value, key, parent, ctx) {
        var path = ctx.path || '';
        var parentPath = (ctx.parent && ctx.parent.path) || '';
        if (key == 'data') {
          if (parent.type) {
            _.set(model, _.trim(parentPath + '.type', '.'), parent.type);
          }

          if (parent.name) {
            _.set(model, _.trim(parentPath + '.name', '.'), parent.name);
          }

          _.set(model, path, value);
          return false;
        } else {
          if (!_.isObject(value)) {
            _.set(controller, path, value);
          } else {
            if (_.isArray(value)) {
              _.set(controller, path, []);
            } else if (_.isFunction(value)) {
              _.set(controller, path, cloneFunction(value));
            } else {
              _.set(controller, path, {});
            }
          }
        }
      },
      { includeRoot: false }
    );
    instance.model.series.push(model);
    instance.controller.series.push(controller);
  });
  delete options.series;
  instance.view = options;
  if (!instance.view.controls) {
    instance.view.controls = [];
  }

  instance.iocontrols = {
    controls: [instance.view.controls[0] || { type: 'toolbar', controls: [] }],
  };
  if (instance.view.controls.length > 1) {
    instance.controls = {
      controls: [{ type: 'toolbarPlaceholder' }, ...instance.view.controls.splice(1)],
    };
  } else {
    instance.controls = { controls: [{ type: 'toolbarPlaceholder' }] };
  }

  delete instance.view.controls;

  instance.vars = { vars: instance.view.vars || {} };
  if (instance.view.vars) {
    delete instance.view.vars;
  }

  instance.triggers = {
    triggers: {
      audioTriggers:{},
      componentTriggers: {},
      canvasTriggers: {},
      applicationTriggers: {},
      timerTriggers: {},
      ...(instance.view.triggers||{})
    },
  };
  if (instance.view.triggers) {
    delete instance.view.triggers;
  }

  instance.bindings = _.defaults(instance.view.bindings, {
    data: {},
    vars: {},
    icons: {},
    parameters: {},
    persistent: {},
    domainvars: {}
  });
  if (instance.view.bindings) {
    delete instance.view.bindings;
  }

  instance.icons = { icons: instance.view.icons || [] };
  if (instance.view.icons) {
    delete instance.view.icons;
  }

  // console.log('splitOptions af', instance);
  return instance;
}

function getInstance(store, sections) {
  // console.log('getInstance', sections, store.options.instance);
  return _.pick(store.options.instance, sections);
}

function setInstance(store, options, sections) {
  sections = checkSections(sections);

  const changed = [];
  sections.forEach((section) => {
    if (section == 'controls') {
      // console.log(store.name + '.setInstance.controls:', options[section]);

      var overlays = _.filter(options.controls.controls, ['type', 'overlay']);
      var others = _.filter(options.controls.controls, (c) => c.type !== 'overlay');
      // console.log({ overlays, others });
      options.controls.controls = [...others, ...overlays];
    }

    store.options.instance[section] = options[section];
    let json = funJSON.stringify(options[section], null, 2);
    if (store.options.json[section] != json) {
      store.options.json[section] = json;
      store.options.script[section] = funJSON.stringifyToScript(options[section], null, 2);
      changed.push(section);
    }
  });
  store.fire(changed);
  // console.log(
  //   store.name + '.setInstance after',
  //   changed,
  //   store.options.instance
  // );
  return store;
}

function checkSum(store, sections) {
  sections = checkSections(sections);
  // console.log(store.name + '.checkSum', sections);
  return md5(sections.reduce((r, s) => r + store.options.script[s], ''));
}

function mergeOptions(instance) {
  // console.log('mergeOptions b4', instance);
  instance = cloneDeepWithFunctions(instance);
  var options = instance.view || {};
  options.series = [];
  for (
    var i = 0;
    instance.model && instance.model.series && i < instance.model.series.length;
    i++
  ) {
    var serie = _.merge(
      (instance.controller && instance.controller.series && instance.controller.series[i]) || {},
      instance.model.series[i]
    );
    options.series.push(serie);
  }

  if (!instance.iocontrols) {
    instance.iocontrols = { controls: [{ type: 'toolbar', controls: [] }] };
  }

  if (!instance.controls) {
    instance.controls = { controls: [{ type: 'toolbarPlaceholder' }] };
  }

  const controls = [...instance.iocontrols.controls, ...instance.controls.controls.splice(1)];
  options.controls = cloneDeepWithFunctions(controls);

  if (instance.vars) {
    _.merge(options, instance.vars);
  }

  if (instance.triggers) {
    _.merge(options, instance.triggers);
  }

  // console.log('merge bindings', instance.bindings);

  if (instance.bindings) {
    _.merge(options, { bindings: instance.bindings });
  }

  if (instance.icons) {
    _.merge(options, instance.icons);
  }

  if (instance.events) {
    _.merge(options, instance.events);
  }

  // console.log('mergeOptions af', options);
  return options;
}

createStore.scheme = scheme;
console.log('loading meta...');
