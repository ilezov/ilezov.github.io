import * as tern from "tern";
import ecma from "tern/defs/ecmascript.json";
import componentDef from "./defs/component.def.json";
import lodashDef from "./defs/lodash.def.json";
import mapDef from "./defs/map.def.json";

function ternQuery(code, position){
    // Strip the initial function wrapper to exclude it from Tern scope
    let processedCode = code;
    let adjustedPosition = position;
    
    // Check if code is wrapped in a function that has 'component' parameter
    // Pattern: function(..., component, ...) { ... } or (component, ...) => { ... }
    const functionWrapperMatch = code.match(/^(?:function\s*\([^)]*component[^)]*\)|(?:\([^)]*component[^)]*\)|\s*component\s*)\s*=>)\s*\{([\s\S]*)\}$/);
    if (functionWrapperMatch) {
        processedCode = functionWrapperMatch[1]; // Extract function body
        // Adjust position to account for removed function wrapper
        const wrapperStart = code.indexOf('{') + 1;
        adjustedPosition = Math.max(0, adjustedPosition - wrapperStart);
    }
    
    // Add hidden global variables to Tern.js context (not visible in editor)
    const hiddenGlobals = `
/** @type {Component} */
var componentObj;
var $canvas = componentObj.chart;
var $component = componentObj;
/** @type {Component} */
var component = componentObj;
var $app = {};
var $ENV = echarts;
`;
    
    // Prepend hidden globals to processed code for Tern.js analysis
    const hiddenGlobalsLength = hiddenGlobals.length;
    processedCode = hiddenGlobals + processedCode;
    adjustedPosition += hiddenGlobalsLength;
    
    
    
    const ternServer = new tern.Server({
        async: false,
        defs: [componentDef, lodashDef, mapDef, ecma],
        getFile(filename, callback) {
            return processedCode;
        }
    });
    var completionList = [];
    ternServer.request(
        {
            query : {
                type: "completions",
                file: "temp.js",
                end: adjustedPosition,
                lineCharPositions: true,
                types: true,
            },
            files: [
                {
                    type: "full",
                    name: "temp.js",
                    text: processedCode,
                    scope: "document",
                },
            ],
            doc: processedCode,
        },
        (error, res) => {
            if (error) {
                console.error("Tern.js error:", error);
                return;
            }
            return completionList.push(...res?.completions);
        }
    );
    return completionList;
}

export { ternQuery }
