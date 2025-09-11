import controls from './controls';
import _ from 'lodash-es';
import * as fflate from 'fflate';
import * as funJSON from 'funjson/es/funJSON';

const cache = {};
const override = {};
const types = [
  'string',
  'boolean',
  'number',
  'color',
  'icon',
  'date',
  'array',
  'object',
  'function',
];
const typeIcons = {
  'string': 'string.png',
  'boolean': 'boolean.png',
  'number': 'number.png',
  'object': 'object.png',
  'function': 'formula.png',
};
const typeGlyphs = {
  'string': 'f031',
  'boolean': 'f205',
  'number': 'f1ec',
  'color': 'f1fb',
  'date': 'f073',
  'array': 'f03a',
  'object': 'f247',
  'function': 'f12b',
};
const deepAttr = {
  inactive: true,
  readOnly: true,
  hidden: true
};


const processors = {
  appendNUpLayoutContainerOptions: function(metaPath, meta, options) {
    if (
      options &&
      options.chartSize &&
      options.chartSize !== '1x1' &&
      !metaPath.match(/^controls\[.+?\].conrtrols/)
    ) {
      var s = options.chartSize.split('x');
      //meta = _.cloneDeep(meta);
      for (var y = 1; y <= s[1]; y++) {
        for (var x = 1; x <= s[0]; x++) {
          meta['enum'].push(x + ',' + y);
        }
      }
    }

    return meta;
  },
  appendCustomDataElementFields: function(metaPath, meta, options) {
    
  },
  listSeriesNames: function(metaPath, meta, options) {
    //meta = _.cloneDeep(meta);
    //console.log('listSeriesNames: ', meta);
    meta['enum'] = options.series.map((s) => s.name);
    meta['default'] = meta['enum'][0] || '';
    return meta;
  },
  showChosenSeriesTypes: function(metaPath, meta, options) {
    //meta = _.cloneDeep(meta);
    _.each(meta.items, (item, type) => {
      if (options.series.some((s) => s.type == type)) {
        item.hidden = false;
      }
    });
    // meta.items.
    // meta.type = _.uniq(options.series.map((s) => s.type));
    return meta;
  }
};

function get(usedSeries) {
  var options;
  var getOptions = function() {
    return options;
  };

  if (usedSeries && usedSeries.indexOf('scatter') !== -1) {
    usedSeries.push('effectScatter');
  }

  var usedSeriesKey = (usedSeries || []).join('+');

  function overrideBySeries(metaPath, meta) {
    // console.log('overrideBySeries', metaPath, override);
    if (!override[usedSeriesKey]) {
      var ovr = [];
      _.each(usedSeries, function(us) {
        if (us == 'base') {
          return;
        }

        // console.log('override?', us, usedSeries, cache[us].options);
        if (cache[us] && cache[us].options.properties.series.items[us].override) {
          ovr = _.uniqWith(
            ovr.concat(
              cache[us].options.properties.series.items[us].override.map(function(o) {
                return _.isObject(o) ? o : { path: o, hidden: true };
              })
            ),
            _.isEqual
          );
        }
      });
      ovr = ovr.reduce(function(res, o) {
        res[o.path] = _.merge(res[o.path] || {}, o);
        return res;
      }, {});
      override[usedSeriesKey] = ovr;
      // console.log({ usedSeries, override: override });
    }

    if (override[usedSeriesKey][metaPath] && !override[usedSeriesKey][metaPath].assigned) {
      override[usedSeriesKey][metaPath].assigned = true;
      override[usedSeriesKey][metaPath] = _.assign({}, meta, override[usedSeriesKey][metaPath]);
      // console.log(override[usedSeriesKey][metaPath]);

      if (meta && meta.originalMetaPath && override[usedSeriesKey][meta.originalMetaPath] && !override[usedSeriesKey][meta.originalMetaPath].assigned) {
        override[usedSeriesKey][meta.originalMetaPath].assigned = true;
        override[usedSeriesKey][meta.originalMetaPath] = _.assign({}, meta, override[usedSeriesKey][meta.originalMetaPath]);
        _.assign(override[usedSeriesKey][metaPath],override[usedSeriesKey][meta.originalMetaPath]);
        // console.log(override[usedSeriesKey][meta.originalMetaPath]);
      }
    }


    return overrideByProcessors(metaPath, override[usedSeriesKey][metaPath] || meta);
    // return meta;
  }

  function overrideByProcessors(metaPath, meta) {
    if (meta && meta.processors) {
      meta.processors.forEach(function(p) {
        if (!processors[p]) {
          console.error('processor "' + p + '" not found for meta at ' + metaPath);
        } else {
          meta = processors[p](metaPath, meta, getOptions());
        }
      });
    }

    return meta;
  }

  var instance = {
    setOptions: function(o) {
      if (o) {
        options = o;
      }
    },
    types: types,
    typeIcons: typeIcons,
    typeGlyphs: typeGlyphs,
    controls: controls,
    detectType: function(val) {
      if (val === undefined) {
        return '';
      } else if (val === null) {
        //console.log('void value treated as string',val);
        return 'string';
      } else if (_.isBoolean(val)) {
        return 'boolean';
      } else if (_.isNumber(val)) {
        return 'number';
      } else if (_.isString(val)) {
        if (
          val.match(
            /^#(?:[a-f\d]{3}){1,2}\b|#[a-f\d]{8}|rgb\((?:(?:\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,){2}\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)|\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%(?:\s*,\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%){2})\s*\)|hsl\(\s*0*(?:360|3[0-5]\d|[12]?\d?\d)\s*(?:,\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%\s*){2}\)|(?:rgba\((?:(?:\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,){3}|(?:\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%\s*,){3})|hsla\(\s*0*(?:360|3[0-5]\d|[12]?\d?\d)\s*(?:,\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%\s*){2},)\s*0*(?:1|0(?:\.\d+)?)\s*\)$/gi
          )
        ) {
          // console.log('string matches color format',val);
          return 'color';
        } else {
          // console.log('string is string', val);
          return 'string';
        }
      } else if (_.isArray(val)) {
        return 'array';
      } else if (_.isFunction(val)) {
        return 'function';
      } else if (_.isObject(val)) {
        return 'object';
      }

      //console.log('no idea what\'s this, let it be string', val);
      return 'string';
    },
    validateJSTypeMapping: function(fromType, toType) {
      toType = toType.toLowerCase();
      fromType = fromType.toLowerCase();
      // console.log(fromType + ' --> ' + toType);
      switch (toType) {
        case 'string':
        case 'icon':
        case 'boolean':
          return fromType !== 'array';
        case 'color':
          return (
            fromType == 'object' ||
            fromType == 'string' ||
            fromType == 'color' ||
            fromType == 'icon'
          );
        case 'number':
          return fromType == 'object' || fromType == 'number' || fromType == 'string';
        case 'date':
          return fromType == 'date';
        case 'array':
          return fromType == 'array';
      }

      return false;
    },
    mapTypeToJS: function(type) {
      switch (type.toLowerCase()) {
        case 'array':
          return 'array';
        case 'boolean':
          return 'boolean';
        case 'color':
          return 'string';
        case 'date':
        case 'sqldate':
        case 'sqltime':
        case 'sqltimestamp':
          return 'string';
        case 'function':
          return 'function';
        case 'number':
        case 'integer':
        case 'int':
        case 'byte':
        case 'short':
        case 'tinyint':
        case 'smallint':
        case 'long':
        case 'float':
        case 'double':
        case 'decimal':
        case 'bigint':
          return 'number';
        case 'object':
          return 'object';
        case 'string':
          return 'string';
        default:
          return 'object';
      }
    },
    getTypedEmptyValue: function(type) {
      switch (type) {
        case 'array':
          return [];
        case 'boolean':
          return false;
        case 'color':
          return '#000000';
        case 'date':
          return 'not implemented yet';
        case 'function':
          /* eslint-disable */
            return(
function() {
  console.log('Hello world!');
});
          /* eslint-enable */
        case 'number':
          return 0;
        case 'object':
          return {};
        case 'string':
          return '';
        default:
          return { type: type };
      }
    },
    getTypeGlyph: function(type) {
      if (this.typeIcons[type]) {
        return {
          icon: 'themes/css/img/' + this.typeIcons[type],
          iconCls: 'menu-image-icon',
        };
      }

      if (this.typeGlyphs[type]) {
        return { glyph: 'x' + this.typeGlyphs[type] + '@FontAwesome' };
      }

      return {
        icon: 'themes/css/img/' + this.typeIcons.object,
        iconCls: 'menu-image-icon',
      };
    },
    getOriginalSerieType: function(type) {
      return (
        (cache[type] &&
          cache[type].options &&
          cache[type].options.properties.series.items[type].original) ||
        type
      );
    },
    get: function(section, metaPath) {
      var resultMeta;
      // console.log(section + '/' + metaPath + ' not cached, do');
      var type = 'base';
      // if (section == 'controls' || section == 'vars') {
      //   section = 'options';
      // }

      if (metaPath == 'series') {
        type = 'series';
      } else {
        var serie = metaPath.match(/series\["(.+?)"\]/);
        if (serie) {
          type = serie[1]; //.toLowerCase();
        }
      }

      if (cache[type] && cache[type].loading) {
        // console.log('metadata for ' + type + ' is still loading');
        return undefined;
      }

      if (cache[type] && cache[type][section] && !cache[type][section].index[metaPath]) {
        var uncolor = metaPath.replace('"color"', '"string"');
        if (cache[type][section].index[uncolor]) {
          metaPath = uncolor;
        }
      }

      if (!cache[type] || !cache[type][section] || !cache[type][section].index[metaPath]) {
        // console.log("cache not found",type,section,metaPath,cache);
        var res;
        _.each(cache['rx'], function(meta) {
          if (res) {
            return false;
          }

          _.each(meta.regex, function(rx) {
            if (rx.test(metaPath)) {
              res = {...meta.index[metaPath.replace(rx, '')],originalMetaPath:metaPath};
              // console.log(
              //   'rx meta matches',
              //   metaPath,
              //   metaPath.replace(rx, ''),
              //   meta
              // );
              return res === undefined;
            } else {
              // console.log("rx meta doesn't match",metaPath,rx);
            }
          });
        });
        resultMeta = this.pathMod(res, section, metaPath);
      } else {
        // console.log('get',type,section,metaPath,cache[type][section],cache[type][section].index[metaPath]);
        resultMeta = this.pathMod(cache[type][section].index[metaPath], section, metaPath);
      }

      return resultMeta;
    },
    pathMod: function(meta, section, metaPath) {
      if (meta && meta.pathMod) {
        const modMetaPath = metaPath.replace(new RegExp(meta.pathMod.replace), meta.pathMod.to);
        if(modMetaPath===metaPath) {return meta;}

        var ref = this.get(section, modMetaPath);
        if (!ref) {
          return undefined;
        }

        // console.log(
        //   _.merge({}, res, _.omit(meta, ['pathMod', 'parent', 'metaPath']))
        // );
        //console.log('pathMod: ', meta, ref);
        var res = {};

        Object.keys(ref).reduce(function(res, k) {
          res[k] = ref[k];
          return res;
        }, res);

        var skipFields = {
          pathMod: true,
          properties: true,
          items: true,
          //parent: true,
          key: true,
          metaPath: true,
          type: true,
        };

        Object.keys(meta).reduce(function(res, k) {
          if (!skipFields[k]) {
            res[k] = meta[k];
          }

          return res;
        }, res);

        return overrideBySeries(metaPath, res);
        // return _.merge(
        //   {},
        //   this.get(section, metaPath),
        //   _.omit(meta, 'pathMod')
        // );
      }

      return overrideBySeries(metaPath, meta);
      //         if (!overrideBySeries(metaPath, meta)) {
      //           return undefined;
      //         }
      //
      //         return meta;
    },
    getProperties: function(section, metaPath) {
      var res = this.get(section, metaPath);
      if (!res) {
        // console.log("cannot find option to get props",section,metaPath,cache);
      }

      // console.log("getProperties",section,metaPath,res);
      if (res === undefined) {
        return undefined;
      }

      if (!res.properties) {
        // console.log("option has no props",section,metaPath,res,cache);
        return {};
      }

      // console.log('get props', res);

      return _.reduce(res.properties, (res,p,k)=>{
        if(p){
          res[k] = this.get(section,p.metaPath);          
        }

        return res;
      },{});
      // return _.pickBy(_.cloneWithFunctions(res.properties), function(p, k) {
      //   return !overrideBySeries(((res.metaPath && res.metaPath + '.') || '') + k, p).hidden;
      // });
    },
    hasProperties: function(section, metaPath) {
      var res = this.getProperties(section, metaPath);
      if (res === undefined) {
        return undefined;
      }

      return _.size(res) > 0;
    },
    getPropertiesStore: function(section, metaPath, without) {
      var props = this.getProperties(section, metaPath);
      if (!props) {
        return [];
      }

      if (without) {
        _.each(without, function(del) {
          if (props[del] !== undefined) {
            delete props[del];
          }
        });
      }

      return _.map(props, function(field, name) {
        return { name: name, title: name, scheme: field };
      });
    },
    getItems: function(section, metaPath) {
      var res = this.get(section, metaPath);
      if (res === undefined) {
        return undefined;
      }

      if (!res.items) {
        return {};
      }

      //res = _.cloneWithFunctions(res.items);
      res = _.pickBy(_.cloneWithFunctions(res.items), function(p, k) {
        return !overrideBySeries(res.metaPath + '["' + k + '"]', p).hidden;
      });
      var todel = null;
      _.forOwn(res, function(item, name) {
        if (item.defaultAlias) {
          todel = name;
          return false;
        }
      });
      if (todel) {
        delete res[todel];
      }

      // console.log('get items', res);
      return res;
    },
    hasItems: function(section, metaPath) {
      var res = this.getItems(section, metaPath);
      if (res === undefined) {
        return undefined;
      }

      return _.size(res) > 0;
    },
    getItemsStore: function(section, metaPath, without) {
      var items = this.getItems(section, metaPath);
      if (!items) {
        return [];
      }

      if (without) {
        _.each(without, function(del) {
          if (items[del] !== undefined) {
            delete items[del];
          }
        });
      }

      return _.map(items, function(field, type) {
        return { name: type, title: type, scheme: field };
      });
    },
    getDescription: function(section, metaPath) {
      var res = this.get(section, metaPath);
      if (res === undefined) {
        return '<i style="color:rgba(255,255,255,0.5);">User defined element. No description available.</i>';
      }

      if (!res.description) {
        return res.properties || res.items
          ? 'See child options for description.'
          : 'No description found.';
      }

      // console.log('props found',cache[type][section].index[metaPath].properties);
      return res.description;
    },
    getMinLength: function(section, metaPath) {
      var res = this.get(section, metaPath);
      // console.log("minLength",section,metaPath,res);
      return res && res.minLength;
    },
    getMaxLength: function(section, metaPath) {
      var res = this.get(section, metaPath);
      // console.log("minLength",section,metaPath,res);
      return res && res.maxLength;
    },
    getTitle: function(section, metaPath) {
      var res = this.get(section, metaPath);
      // console.log("title",section,metaPath,res);
      return res && res.title;
    },
    getDisplayValue: function(section, metaPath) {
      var res = this.get(section, metaPath);
      // if(res&&res.displayValue!=undefined){
      //   console.log("displayValue",res.displayValue);
      // }
      // console.log("displayValue",section,metaPath,res);
      return res && res.displayValue;
    },
    getPrefix: function(section, metaPath) {
      var res = this.get(section, metaPath);
      // console.log("title",section,metaPath,res);
      return res && res.prefix;
    },
    isRequired: function(section, metaPath) {
      var res = this.get(section, metaPath);
      // console.log("isRequired",res);
      return res && res.required;
    },
    getInactive: function(section, metaPath) {
      var res = this.get(section, metaPath);

      var inactive = res && res.inactive;
      if (inactive===undefined && res) {
        inactive = checkDeepattr(res, 'inactive');
      }

      return inactive;
    },
    isUnique: function(section, metaPath) {
      var res = this.get(section, metaPath);
      // console.log("isRequired",res);
      return res && res.unique;
    },
    isCustom: function(section, metaPath) {
      var res = this.get(section, metaPath);
      // console.log("isRequired",res);
      return res === undefined;
    },
    isHidden: function(section, metaPath) {
      // if(metaPath.match(/^.*\["binding"\]$/g))
      // {
      //   // console.log('Binding is always hidden',type,section,metaPath);
      //   return true;
      // }
      var res = this.get(section, metaPath);
      
      let hidden = res && res.hidden;
      if (hidden===undefined && res) {
        hidden = checkDeepattr(res, 'hidden');
      }

      return hidden;      
    },
    isCode: function(section, metaPath) {
      var res = this.get(section, metaPath);
      return res && res.code;
    },
    isMultiline: function(section, metaPath) {
      var res = this.get(section, metaPath);
      return res && res.multiline;
    },
    isReadOnly: function(section, metaPath) {
      var res = this.get(section, metaPath);
      var readOnly = res && res.readOnly;
      if (readOnly===undefined && res) {
        readOnly = checkDeepattr(res, 'readOnly');
      }

      return !!readOnly;
    },
    isDisplayCSV: function(section, metaPath) {
      var res = this.get(section, metaPath);
      // console.log("isReadOnly",res,type,section,metaPath);
      return res !== undefined && res.displayCSV == true;
    },
    getMirrorTo: function(section, metaPath) {
      var res = this.get(section, metaPath);
      // console.log("isReadOnly",res,type,section,metaPath);
      return res && res.mirrorTo;
    },
    getEnum: function(section, metaPath) {
      var res = this.get(section, metaPath);
      // console.log("isReadOnly",res,type,section,metaPath);
      return res && res['enum'];
    },
    isGlobal: function(section, metaPath) {
      var res = this.get(section, metaPath);
      //console.log("isGlobal",res!==undefined&&res.global==true,section,metaPath,res);
      return res !== undefined && res.global === true;
    },
    isSyncModel: function(section, metaPath) {
      var res = this.get(section, metaPath);
      //console.log("isGlobal",res!==undefined&&res.global==true,section,metaPath,res);
      return res !== undefined && res.syncModel === true;
    },
    getSibling: function(section, metaPath, siblingName) {
      var res = this.get(section, metaPath);
      if (res === undefined) {
        return undefined;
      }

      return res.parent.properties[siblingName];
    },
    getPrimitiveType: function(section, metaPath) {
      if (this.isCustom(section, metaPath)) {
        return this.types;
      }

      var types = this.getTypes(section, metaPath, true);
      return _.intersection(types, this.types);
    },
    getTypes: function(section, metaPath, definedOnly) {
      var item = this.get(section, metaPath);
      // console.log("getTypes",item);
      if (item === undefined) {
        return definedOnly ? [] : this.types;
      }

      var res = item.type;
      if (!res || !res.length) {
        return definedOnly ? [] : this.types;
      }

      if (res[0] == '*') {
        return this.types;
      }

      // if(_.indexOf(res,'string'))
      // {
      //   console.log("types have string",item);
      // }
      if (
        _.indexOf(res, 'string') &&
        item.parent &&
        item.parent.items &&
        item.parent.items.string &&
        item.parent.items.string['default'] &&
        item.parent.items.string['default'].type &&
        item.parent.items.string['default'].type[0] !== 'string'
      ) {
        res = _.without(res, 'string');
      }

      return res;
    },
    validateMetaDeep: function(section, path, value, cutPrefs, addPref) {
      var me = this;
      return !_.someDeep(
        value,
        function(v, k, p, x) {
          return !me.validateMeta(
            section,
            x.path ? _.pathToString(x.path, path) : path,
            v,
            cutPrefs,
            addPref
          );
        },
        { pathFormat: 'array' }
      );
    },
    validateMeta: function(section, path, value, cutPrefs, addPref) {
      return !!this.get(section, this.getMetaPath(path, _.set({}, path, value), cutPrefs, addPref));
    },
    getMetaPath: function(path, props, cutPrefs, addPref) {
      var me = this;
      var prePath = '';
      var res = '';
      // var val = _.get(props, path);
      // console.log('metaPath:', path, props);
      var parts = path.split(/(\[\d+\])/g);
      _.each(parts, function(part) {
        prePath += part;
        if (part.match(/^\[\d+\]$/)) {
          var prop = _.get(props, prePath);
          // console.log('metaPath:', prePath, prop);
          if (prop && prop.binding && prop.binding.type == 'binding') {
            prop = prop.staticValue;
          }

          var propType = me.detectType(prop);
          // console.log('getMetaPath part',prePath,propType,prop);
          if (propType != 'object') {
            res += '["' + propType + '"]';
          } else if (!prop.type || prop.type == 'model') {
            res += '["object"]';
          } else {
            res += '["' + prop.type + '"]';
          }
        } else {
          res += part;
        }
      });
      if (cutPrefs && cutPrefs.length) {
        _.each(cutPrefs, function(pref) {
          if (res.match(pref)) {
            res = _.replace(res, pref, '');
            return false;
          }
        });
      }

      if (addPref) {
        res = addPref + res;
      }

      // console.log('meta:[' + path + ']->[' + res + ']', cutPrefs, addPref);
      return res;
    },
    getDefault: function(section, metaPath, name, valueType, options, asModel) {
      // console.log(metaPath, name);
      var me = this;
      if (!_.isString(name)) {
        name = '';
      }

      name = name || valueType || '';

      var meta = me.get(section, ((metaPath && metaPath + '.') || '') + name);
      if (!meta) {
        meta = me.get(section, metaPath + '["' + name + '"]');
      }

      var parent = me.get(section, metaPath);
      if (!meta) {
        if (parent) {
          if (parent.properties && parent.properties[name]) {
            meta = parent.properties[name];
          } else if (parent.items && parent.items[valueType]) {
            meta = parent.items[valueType];
          } else if (parent.items && valueType == 'color' && parent.items['string']) {
            valueType = 'string';
            meta = parent.items[valueType];
          }
        }
      }

      // console.log('getDefault', { section, metaPath, name, valueType, meta });
      var grandParent = parent && parent.parent;
      var possibleTypes = (meta && meta.type) || me.types;
      if (valueType) {
        possibleTypes = [valueType];
      } else if (!possibleTypes || !possibleTypes.length) {
        possibleTypes = ['string'];
      }

      var res = null;
      if (meta === undefined) {
        res = valueType ? me.getTypedEmptyValue(valueType) : '';
        //console.log('no meta, use empty',res);
      } else if (meta.defaults) {
        // console.log('defaults', meta.defaults, possibleTypes);
        res = _.cloneDeepWithFunctions(meta.defaults[possibleTypes[0]]);
      } else if (meta['default']) {
        res = _.cloneDeepWithFunctions(meta['default']);
      } else {
        res = me.getTypedEmptyValue(possibleTypes[0]);
        //console.log('Typed Empty',meta);
      }

      if (
        valueType &&
        me.detectType(res) !== valueType &&
        (res && res.type) !== valueType &&
        (!meta || meta.type.indexOf(valueType)==-1)
      ) {
        // console.log('Retyped Empty', res, valueType);
        res = me.getTypedEmptyValue(valueType);
      }

      if (_.isString(res)) {
        res = _.trim(res, '"\'');
        if (name == 'name' || (meta && meta.unique)) {
          if (!res) {
            if (name && !_.isNumber(name) && name !== 'name') {
              res = 'new' + _.upperFirst(name);
            } else if (name == 'name') {
              // console.log({ grandParent });
              if (parent.type) {
                res = 'new' + _.upperFirst(parent.type);
              } else if (grandParent && grandParent.type[0] === 'array') {
                res = 'newElement';
              } else {
                res = 'newOption';
              }
            }
          }

          if (meta && meta.unique) {
            var pc = null;
            var c = 1;
            while (pc !== c) {
              pc = c;
              _.eachDeep(options, function(v, k) {
                if (pc !== c) {
                  return false;
                }

                if (k == name && v == res + (c ? c : '')) {
                  c++;
                  return false;
                }
              });
            }

            res = res + (c ? c : '');
          }
        }

        return res;
      }

      // var defType = me.detectType(res);
      if (_.isObject(res) && !_.isArray(res) && meta && meta.properties) {
        //console.log("Collectiong required fields",meta.properties);
        _.each(meta.properties, function(subField, subName) {
          if (subField &&
            res[subName] == undefined &&
            !subField.noModel            
          ) {
            const subDefault = me.getDefault(
              section,
              meta.metaPath,
              subName,
              undefined,
              options,
              asModel,
              
            );
            // if(asModel || subField.required || subField.recommended || (_.isObject(subDefault) && !_.isEmpty(subDefault))){
            if(asModel || subField.required || subField.recommended){
              res[subName] = subDefault;
            }
          }
        });
      }

      if (_.isArray(res) && !res.length && meta && meta.items) {
        //console.log("Collectiong required fields",meta.properties);
        _.each(meta.items, function(subField, subName) {
          if (!subField.noModel) {
            const subDefault = me.getDefault(section, meta.metaPath, subName, undefined, options, asModel);
            // if(asModel || subField.required || subField.recommended || (_.isObject(subDefault) && !_.isEmpty(subDefault)))
            if(asModel || subField.required || subField.recommended)
            {
              res.push(subDefault);
            }
          }
        });
      }

      if (res.name !== undefined) {
        if (!res.name) {
          if (res.type) {
            res.name = 'new' + res.type;
          } else if (name && !_.isNumber(name)) {
            res.name = 'New ' + name;
          } else if (_.isArray(parent)) {
            res.name = 'New Element';
          } else {
            res.name = 'New Option';
          }
        }

        if (_.isArray(parent)) {
          res.name += ' ' + (parent.length + 1);
        }
      }

      //console.log("Default 4 "+metaPath,res);
      return res;
    },
  };
  return instance;
}

const loader = {};

function load(chartType) {
  // chartType = chartType.toLowerCase();

  // console.log('load ' + chartType + '>>>>>', me);
  if (!loader[chartType]) {
    var p = [];
    if (!cache.base) {
      cache.base = {};
      // console.time('fetch base meta');
      p.push(
        Promise.all([
          fetch('src/json-editor/schemas/options.json.gzip').then(
            function(res) {
              return res.arrayBuffer();
            }
          ),
          fetch('src/json-editor/schemas/series.json.gzip').then(
            function(res) {
              return res.arrayBuffer();
            }
          ),
          fetch('src/json-editor/schemas/rx.json').then(function(res) {
            return res.text();
          }),
          fetch('src/json-editor/schemas/controls.json.gzip').then(
            function(res) {
              return res.arrayBuffer();
            }
          ),

          fetch('src/json-editor/schemas/vars.json.gzip').then(function(
            res
          ) {
            return res.arrayBuffer();
          }),
          fetch('src/json-editor/schemas/icons.json.gzip').then(function(
            res
          ) {
            return res.arrayBuffer();
          }),
          fetch('src/json-editor/schemas/triggers.json.gzip').then(
            function(res) {
              return res.arrayBuffer();
            }
          ),
        ]).then(function(scheme) {
          // console.timeEnd('fetch base meta');
          // console.time('decompress base meta');
          scheme = _.map(scheme, function(s, i) {
            if (i !== 2) {
              var compressed = new Uint8Array(s);
              s = fflate.strFromU8(fflate.decompressSync(compressed));
            }

            return funJSON.parse(s);
          });
          // console.timeEnd('decompress base meta');
          var series = buildIndex(scheme[1], 'series');
          cache.base = {
            options: buildIndex(scheme[0], 'options'),
            controls: buildIndex(scheme[3], 'controls'),
            // iocontrols: buildIndex(scheme[3]),
            vars: buildIndex(scheme[4], 'vars'),
            icons: buildIndex(scheme[5], 'icons'),
            triggers: buildIndex(scheme[6], 'triggers'),
          };
          cache.base.iocontrols = cache.base.controls;
          cache.series = {
            options: series,
            data: series,
          };
          cache.rx = _.map(scheme[2], function(rx) {
            rx = buildIndex(rx, 'rx');
            rx.regex = _.map(rx.regex, function(regex) {
              return new RegExp(regex);
            });
            return rx;
          });
          // console.log('load ' + chartType + ' - indexes built', cache.base.controls);
          return 'base';
        })
      );
    }

    if (chartType != 'base' && !cache[chartType]) {
      cache[chartType] = { loading: chartType };
      // console.log('loading ' + chartType);
      // console.time('fetch ' + chartType + ' meta');
      p.push(
        Promise.all([
          fetch(
            'src/json-editor/schemas/series/' +
              chartType +
              '.options.json.gzip'
          ).then(function(res) {
            return res.arrayBuffer();
          }),
          fetch(
            'src/json-editor/schemas/series/' +
              chartType +
              '.data.json.gzip'
          ).then(function(res) {
            return res.arrayBuffer();
          }),
        ]).then(function(scheme) {
          // console.log('loaded ' + chartType);
          // console.timeEnd('fetch ' + chartType + ' meta');
          // console.time('decompress ' + chartType + ' meta');
          var compressed = new Uint8Array(scheme[0]);
          scheme[0] = fflate.strFromU8(fflate.decompressSync(compressed));
          scheme[0] = funJSON.parse(scheme[0]);

          compressed = new Uint8Array(scheme[1]);
          scheme[1] = fflate.strFromU8(fflate.decompressSync(compressed));
          scheme[1] = funJSON.parse(scheme[1]);
          // console.timeEnd('decompress ' + chartType + ' meta');
          cache[chartType] = {
            options: buildIndex(scheme[0], chartType + ' options'),
            data: buildIndex(scheme[1], chartType + ' data'),
          };
          // console.log('load ' + chartType + ' - indexes built');
          // cache[chartType].data.index.series = cache[chartType].data.index[""];
          //console.log(chartType+" meta cache loaded",cache[chartType]);
          return chartType;
        })
      );
    }

    loader[chartType] = p.length ? Promise.all(p) : Promise.resolve(['none']);
  }

  return loader[chartType];
}

function buildIndex(scheme, name) {
  // console.time('build ' + name + ' meta');
  var index = {};
  // debugger;
  _.eachDeep(
    scheme,
    function(value, key, parent, ctx) {
      let metaPath = ctx.path || '';
      let parentKey = (ctx.parent && ctx.parent.key) || '';
      if (key == 'metaPath' || key == 'parent' || key == 'key') {
        return false;
      }

      if ((parentKey == 'properties' || parentKey == 'items') && value!==null) {
        metaPath = _.replace(metaPath, /properties\./g, '');
        metaPath = _.replace(metaPath, /\.?items\.([^.]*)/g, '["$1"]');
        metaPath = _.replace(metaPath, /\.?items(\[".+?"\])/g, '$1');
        value.metaPath = metaPath;
        value.key = key;
        index[metaPath] = value;
        if (value.properties) {
          _.forOwn(value.properties, function(prop, name) {
            if(prop){
              prop.parent = value;
              if (value.readOnly) {
                prop.readOnly = true;
              }              
            }
          });
        }

        if (value.items) {
          _.forOwn(value.items, function(prop, name) {
            if(prop){
              prop.parent = value;
              if (value.readOnly) {
                prop.readOnly = true;
              }              
            }
          });
        }
      }
    },
    { includeRoot: false }
  );
  index[''] = scheme;
  scheme.metaPath = '';
  _.forOwn(scheme.properties, function(prop, name) {
    if(prop){
      prop.parent = scheme;      
    }
  });
  scheme.index = index;
  // console.log('indexed', scheme);
  // console.timeEnd('build ' + name + ' meta');
  return scheme;
}

function checkDeepattr(meta, name) {
  var res;
  if (meta && deepAttr[name]) {
    var dname = name + 'Deep';
    if (meta[dname] !== undefined) {
      return meta[dname];
    }

    // _.eachDeep(
    //   meta,
    //   function(v, k, p, x) {
    //     if (k === dname) {
    //       res = v;
    //       x['break']();
    //     }

    //     if (v && v[dname] !== undefined) {
    //       res = v[dname];
    //       x['break']();
    //     }
    //   },
    //   { childrenPath: 'parent', includeRoot: true }
    // );
    // if (res !== undefined) {
    //   // console.log('inactiveDeep!');
    //   meta[dname] = res;
    // }
  }

  return res;
}

export default {
  get,
  load,
  controls,
  cache
};
