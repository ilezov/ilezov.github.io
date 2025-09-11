import controls from './controls';
import _ from 'lodash-es';
import * as fflate from 'fflate';
import * as funJSON from 'funjson/es/funJSON';

const cache = {};
const loader = {};

//base data
//  view options
//  vars
//  resources
//  triggers
//chart data
//  data options
//  control options


function load(chartType) {
  if (!loader[chartType]) {
    var p = [];
    if (!cache.base) {
      cache.base = {};
      p.push(
        Promise.all([
          fetch('src/json-editor/schemas/options.json.gzip').then(
            function(res) {
              return res.arrayBuffer();
            }
          ),
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
          scheme = _.map(scheme, function(s, i) {
            
            var compressed = new Uint8Array(s);
            s = fflate.strFromU8(fflate.decompressSync(compressed));
            //console.log(s);
            return funJSON.parse(s);
          });
          // console.timeEnd('decompress base meta');
         
          cache.base = {
            viewOptions: scheme[0],
            controlOptions: scheme[1],
            vars: scheme[2],
            icons: scheme[3],
            triggers: scheme[4],
          };
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
            controlOptions: scheme[0],
            data: scheme[1]
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

export default {
  load,
  cache
};
