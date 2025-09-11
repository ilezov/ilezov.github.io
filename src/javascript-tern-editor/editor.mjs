import { EditorState, StateField, Transaction } from '@codemirror/state';
import { EditorView, Decoration, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { autocompletion, startCompletion, snippetCompletion, ifNotIn } from "@codemirror/autocomplete";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { ternQuery } from "./tern.query.mjs";
import { createIconWithFallback } from "./icon-utils.mjs";
import { 
    CONTROL_TYPES, 
    VARIABLE_TYPES, 
    ECHARTS_ACTION_TYPES, 
    ECHARTS_ACTION_DESCRIPTIONS,
    ECHARTS_EVENT_TYPES,
    ECHARTS_EVENT_DESCRIPTIONS,
    ICON_BASE_PATH,
    REGEX_PATTERNS,
    BLOCK_CHARACTERS,
    COMPLETION_TYPES,
    COMPLETION_SORT_ORDER,
    COMPLETION_BOOST,
    FUNCTION_TYPE_PATTERN
} from "./constants.mjs";

// JavaScript operators and language constructs completion
const javascriptOperatorsAndStatements = (context) => {
    const completions = [
        // Arithmetic Operators
        { label: "+=", apply: "+= ", detail: "operator", info: "Addition assignment", type: "operator", boost: 90 },
        { label: "-=", apply: "-= ", detail: "operator", info: "Subtraction assignment", type: "operator", boost: 90 },
        { label: "*=", apply: "*= ", detail: "operator", info: "Multiplication assignment", type: "operator", boost: 90 },
        { label: "/=", apply: "/= ", detail: "operator", info: "Division assignment", type: "operator", boost: 90 },
        { label: "%=", apply: "%= ", detail: "operator", info: "Modulus assignment", type: "operator", boost: 90 },
        { label: "**=", apply: "**= ", detail: "operator", info: "Exponentiation assignment", type: "operator", boost: 90 },
        
        // Comparison Operators
        { label: "===", apply: "=== ", detail: "operator", info: "Strict equality", type: "operator", boost: 95 },
        { label: "!==", apply: "!== ", detail: "operator", info: "Strict inequality", type: "operator", boost: 95 },
        { label: "==", apply: "== ", detail: "operator", info: "Loose equality", type: "operator", boost: 85 },
        { label: "!=", apply: "!= ", detail: "operator", info: "Loose inequality", type: "operator", boost: 85 },
        { label: "<=", apply: "<= ", detail: "operator", info: "Less than or equal", type: "operator", boost: 90 },
        { label: ">=", apply: ">= ", detail: "operator", info: "Greater than or equal", type: "operator", boost: 90 },
        
        // Logical Operators
        { label: "&&", apply: "&& ", detail: "operator", info: "Logical AND", type: "operator", boost: 95 },
        { label: "||", apply: "|| ", detail: "operator", info: "Logical OR", type: "operator", boost: 95 },
        { label: "??", apply: "?? ", detail: "operator", info: "Nullish coalescing", type: "operator", boost: 90 },
        { label: "?.", apply: "?.", detail: "operator", info: "Optional chaining", type: "operator", boost: 95 },
        
        // Bitwise Operators
        { label: "&=", apply: "&= ", detail: "operator", info: "Bitwise AND assignment", type: "operator", boost: 80 },
        { label: "|=", apply: "|= ", detail: "operator", info: "Bitwise OR assignment", type: "operator", boost: 80 },
        { label: "^=", apply: "^= ", detail: "operator", info: "Bitwise XOR assignment", type: "operator", boost: 80 },
        { label: "<<=", apply: "<<= ", detail: "operator", info: "Left shift assignment", type: "operator", boost: 80 },
        { label: ">>=", apply: ">>= ", detail: "operator", info: "Right shift assignment", type: "operator", boost: 80 },
        { label: ">>>=", apply: ">>>= ", detail: "operator", info: "Unsigned right shift assignment", type: "operator", boost: 80 },
        
        // Spread/Rest
        { label: "...", apply: "...${}", detail: "operator", info: "Spread/Rest operator", type: "operator", boost: 90 },
        
        // Template Literals
        { label: "`${}`", apply: "`\${${}}\\`", detail: "template", info: "Template literal with expression", type: "template", boost: 85 },
        
        // Destructuring
        { label: "{ }", apply: "{ ${} }", detail: "syntax", info: "Object destructuring", type: "syntax", boost: 85 },
        { label: "[ ]", apply: "[ ${} ]", detail: "syntax", info: "Array destructuring", type: "syntax", boost: 85 },
        
        // JavaScript Statements with Snippets
        snippetCompletion("if (${condition}) {\n\t${}\n}", {
            label: "if",
            detail: "statement",
            info: "if statement - conditional execution",
            type: "keyword",
            boost: 95
        }),
        
        snippetCompletion("if (${condition}) {\n\t${}\n} else {\n\t${}\n}", {
            label: "if...else",
            detail: "statement",
            info: "if...else statement - conditional execution with alternative",
            type: "keyword",
            boost: 95
        }),
        
        snippetCompletion("for (let ${i} = 0; ${i} < ${length}; ${i}++) {\n\t${}\n}", {
            label: "for",
            detail: "statement",
            info: "for loop - counter-based iteration",
            type: "keyword",
            boost: 95
        }),
        
        snippetCompletion("for (const ${item} of ${iterable}) {\n\t${}\n}", {
            label: "for...of",
            detail: "statement",
            info: "for...of loop - iterate over iterable values",
            type: "keyword",
            boost: 95
        }),
        
        snippetCompletion("for (const ${key} in ${object}) {\n\t${}\n}", {
            label: "for...in",
            detail: "statement",
            info: "for...in loop - iterate over object keys",
            type: "keyword",
            boost: 95
        }),
        
        snippetCompletion("while (${condition}) {\n\t${}\n}", {
            label: "while",
            detail: "statement",
            info: "while loop - condition-based iteration",
            type: "keyword",
            boost: 95
        }),
        
        snippetCompletion("function ${name}(${parameters}) {\n\t${}\n}", {
            label: "function",
            detail: "statement",
            info: "function declaration",
            type: "keyword",
            boost: 95
        }),
        
        snippetCompletion("const ${name} = (${parameters}) => {\n\t${}\n};", {
            label: "arrow function",
            detail: "statement",
            info: "arrow function expression",
            type: "keyword",
            boost: 95
        }),
        
        snippetCompletion("try {\n\t${}\n} catch (${error}) {\n\t${}\n}", {
            label: "try...catch",
            detail: "statement",
            info: "try...catch statement - error handling",
            type: "keyword",
            boost: 90
        }),
        
        snippetCompletion("class ${ClassName} {\n\tconstructor(${parameters}) {\n\t\t${}\n\t}\n\n\t${methodName}() {\n\t\t${}\n\t}\n}", {
            label: "class",
            detail: "statement",
            info: "class declaration",
            type: "keyword",
            boost: 90
        }),
        
        snippetCompletion("const ${name} = ${value};", {
            label: "const",
            detail: "statement",
            info: "const declaration - immutable binding",
            type: "keyword",
            boost: 95
        }),
        
        snippetCompletion("let ${name} = ${value};", {
            label: "let",
            detail: "statement",
            info: "let declaration - block-scoped variable",
            type: "keyword",
            boost: 95
        }),
        
        snippetCompletion("var ${name} = ${value};", {
            label: "var",
            detail: "statement",
            info: "var declaration - function-scoped variable",
            type: "keyword",
            boost: 90
        }),
        
        // Common JavaScript Keywords
        { label: "true", apply: "true", detail: "boolean", info: "Boolean true value", type: "literal", boost: 90 },
        { label: "false", apply: "false", detail: "boolean", info: "Boolean false value", type: "literal", boost: 90 },
        { label: "null", apply: "null", detail: "null", info: "Null value", type: "literal", boost: 90 },
        { label: "undefined", apply: "undefined", detail: "undefined", info: "Undefined value", type: "literal", boost: 90 },
        { label: "typeof", apply: "typeof ", detail: "operator", info: "Type of operator", type: "operator", boost: 90 },
        { label: "instanceof", apply: "instanceof ", detail: "operator", info: "Instance of operator", type: "operator", boost: 90 },
        { label: "in", apply: "in ", detail: "operator", info: "In operator", type: "operator", boost: 90 },
        { label: "new", apply: "new ", detail: "operator", info: "New operator", type: "operator", boost: 90 },
        { label: "delete", apply: "delete ", detail: "operator", info: "Delete operator", type: "operator", boost: 85 },
        { label: "void", apply: "void ", detail: "operator", info: "Void operator", type: "operator", boost: 80 },
        
        // Control Flow Keywords
        { label: "else", apply: "else {\n\t${}\n}", detail: "keyword", info: "Else statement - alternative execution", type: "keyword", boost: 95 },
        { label: "return", apply: "return ${};", detail: "keyword", info: "Return statement", type: "keyword", boost: 95 },
        { label: "break", apply: "break;", detail: "keyword", info: "Break statement", type: "keyword", boost: 90 },
        { label: "continue", apply: "continue;", detail: "keyword", info: "Continue statement", type: "keyword", boost: 90 },
        { label: "throw", apply: "throw new Error(${});", detail: "keyword", info: "Throw statement", type: "keyword", boost: 85 },
        
        // Async/Await
        { label: "await", apply: "await ", detail: "keyword", info: "Await keyword", type: "keyword", boost: 95 },
        { label: "async", apply: "async ", detail: "keyword", info: "Async keyword", type: "keyword", boost: 95 },
        
        // Import/Export
        snippetCompletion("import { ${imports} } from '${module}';", {
            label: "import",
            detail: "statement",
            info: "import statement - named imports",
            type: "keyword",
            boost: 90
        }),
        
        snippetCompletion("import ${name} from '${module}';", {
            label: "import default",
            detail: "statement",
            info: "import statement - default import",
            type: "keyword",
            boost: 90
        }),
        
        snippetCompletion("export { ${exports} };", {
            label: "export",
            detail: "statement",
            info: "export statement - named exports",
            type: "keyword",
            boost: 90
        }),
        
        snippetCompletion("export default ${value};", {
            label: "export default",
            detail: "statement",
            info: "export statement - default export",
            type: "keyword",
            boost: 90
        })
    ];
    
    // Add iconType for rendering
    return completions.map(completion => ({
        ...completion,
        iconType: completion.type || 'keyword'
    }));
};

const getTernCompletionList = (context) => {
    const position = context.pos;
    const code = context.state.doc.toString();
    let ternCompletionList = ternQuery(code, position);
    //convert tern result to cm autocomplete result
    console.log('ternCompletionList', ternCompletionList);
    
    const completions = ternCompletionList?.map((item) => {
        // Check if type looks like a function (contains "fn(")
        let detail = COMPLETION_TYPES.PROPERTY; // default to property
        
        if (item.type && item.type.includes(FUNCTION_TYPE_PATTERN)) {
            detail = COMPLETION_TYPES.FUNCTION;
        }
        
        return {
            label: item.name,
            apply: item.name,
            iconType: detail,
            detail: item.type,
            boost: COMPLETION_BOOST[detail] || 0, // CodeMirror 6 uses this for sorting
            sortOrder: COMPLETION_SORT_ORDER[detail] || 999 // Keep for debugging
        };
    });
    
    console.log('completions with boost', completions);
    return completions;
}

// Line highlighting extension for first and last rows
const lineHighlightTheme = EditorView.baseTheme({
    "&dark .cm-line-highlight-first": { backgroundColor: "#555555" },
    "&light .cm-line-highlight-first": { backgroundColor: "#e5e5e5", cursor: 'not-allowed' },
    "&dark .cm-line-highlight-last": { backgroundColor: "#555555" },
    "&light .cm-line-highlight-last": { backgroundColor: "#e5e5e5", cursor: 'not-allowed' },
    
    // Autocomplete styling for icons
    ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
        display: "flex",
        alignItems: "center",
        padding: "4px 8px"
    },
    ".cm-completionIcon": {
        marginRight: "8px",
        flexShrink: "0"
    },
    ".cm-completionLabel": {
        flexGrow: "1"
    },
    ".cm-completionDetail": {
        fontSize: "0.85em",
        color: "#666",
        fontStyle: "italic",
        marginLeft: "auto",
        paddingLeft: "12px"
    }
});

const lineHighlightExtension = ViewPlugin.fromClass(class {
    constructor(view) {
        this.decorations = this.buildDecorations(view);
    }

    update(update) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    buildDecorations(view) {
        const doc = view.state.doc;
        const decorations = [];
        
        // Only highlight if there are lines
        if (doc.lines > 0) {
            // First line decoration
            const firstLine = doc.line(1);
            decorations.push(
                Decoration.line({ class: "cm-line-highlight-first" }).range(firstLine.from)
            );
            
            // Last line decoration (only if different from first line)
            if (doc.lines > 1) {
                const lastLine = doc.line(doc.lines);
                decorations.push(
                    Decoration.line({ class: "cm-line-highlight-last" }).range(lastLine.from)
                );
            }
        }
        
        return Decoration.set(decorations);
    }
}, {
    decorations: v => v.decorations
});

// Custom icon renderer for all control and variable types
const customIconRenderer = {
    render(completion, state, view) {
        // Add custom icons for all control and variable types
        if (completion.iconType && typeof completion.iconType === 'string') {
            if (CONTROL_TYPES.includes(completion.iconType)) {
                return createIconWithFallback(completion.iconType, ICON_BASE_PATH, 'control');
            } else if (VARIABLE_TYPES.includes(completion.iconType)) {
                return createIconWithFallback(completion.iconType, ICON_BASE_PATH, 'variable');
            } else if (['operator', 'template', 'syntax', 'literal', 'keyword'].includes(completion.iconType)) {
                return createIconWithFallback(completion.iconType, ICON_BASE_PATH, 'variable');
            }
        }
        return null;
    },
    position: 20
};

// Transaction filter to prevent editing first and last lines
const readOnlyLinesFilter = EditorState.transactionFilter.of((tr) => {
    if (!tr.docChanged) return tr;
    
    const doc = tr.startState.doc;
    
    // If there are no lines or only one line, allow all changes
    if (doc.lines <= 1) return tr;
    
    const firstLine = doc.line(1);
    const lastLine = doc.line(doc.lines);
    
    let hasBlockedEdit = false;
    
    // Check if any changes affect the first or last line
    tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
        // Check if the change affects the first line
        if (fromA <= firstLine.to && toA >= firstLine.from) {
            hasBlockedEdit = true;
        }
        // Check if the change affects the last line
        if (fromA <= lastLine.to && toA >= lastLine.from) {
            hasBlockedEdit = true;
        }
    });
    
    // If the edit would affect first or last line, block it
    if (hasBlockedEdit) {
        return [];
    }
    
    return tr;
});

function createEditor(initialContents, environmentContextValue, parent) {

    const environmentContext = StateField.define({
        create() {
            return environmentContextValue; // init
        },
        update(stateVal, tr) {
            let v = stateVal
            return v
        }
    })

    //TODO make it filterable
    const getControlCompletionList = (context) => {
        const envContext =  context.state.field(environmentContext);
        let controlsCompletionList = []
        for (const cntl of envContext.controls) {
            
            controlsCompletionList.push({
                label: '"'+ cntl.path +'"', 
                type: cntl.type,
                detail: cntl.type,
                iconType: cntl.type,
                info: `Control type: ${cntl.type}`
            })
        }
        return controlsCompletionList;
    }

    //TODO make it filterable
    const getVarCompletionList = (context) => {
        const envContext =  context.state.field(environmentContext);
        let varsCompletionList = [];
        for (const [key, value] of Object.entries(envContext.vars)) {
            varsCompletionList.push({ 
                label: '"'+key+'"',
                detail: typeof value,
                iconType: typeof value,
                info: `Value: ${JSON.stringify(value)}`
            })
        }
        return varsCompletionList;
    }

    //TODO make it filterable
    const getActionCompletionList = (context) => {
        let actionsCompletionList = [];
        for (const actionType of ECHARTS_ACTION_TYPES) {
            actionsCompletionList.push({
                label: '"' + actionType + '"',
                detail: "action",
                iconType: "action",
                info: ECHARTS_ACTION_DESCRIPTIONS[actionType] || `ECharts action: ${actionType}`
            });
        }
        return actionsCompletionList;
    }

    //TODO make it filterable
    const getEventCompletionList = (context) => {
        
        let eventsCompletionList = [];
        for (const eventType of ECHARTS_EVENT_TYPES) {
            eventsCompletionList.push({
                label: '"' + eventType + '"',
                detail: "event",
                iconType: "event",
                info: ECHARTS_EVENT_DESCRIPTIONS[eventType] || `ECharts event: ${eventType}`
            });
        }
        return eventsCompletionList;
    }

    const CompletionProvider = (context) => {

        let before = context.matchBefore(new RegExp(REGEX_PATTERNS.WORD));
        let match = context.matchBefore(new RegExp(REGEX_PATTERNS.WORD_DOT));
        let matchFn = context.matchBefore(new RegExp(REGEX_PATTERNS.FUNCTION_CALL));
        let matchGetVarFn = context.matchBefore(new RegExp(REGEX_PATTERNS.GET_VARIABLE));
        let matchSetVarFn = context.matchBefore(new RegExp(REGEX_PATTERNS.SET_VARIABLE));
        let matchGetCntlFn = context.matchBefore(new RegExp(REGEX_PATTERNS.GET_CONTROL));
        let matchDispatchActionFn = context.matchBefore(new RegExp(REGEX_PATTERNS.DISPATCH_ACTION));
        let matchChartOnFn = context.matchBefore(new RegExp(REGEX_PATTERNS.CHART_ON));
        let matchChartOffFn = context.matchBefore(new RegExp(REGEX_PATTERNS.CHART_OFF));
        let matchCanvasOnFn = context.matchBefore(new RegExp(REGEX_PATTERNS.CANVAS_ON));
        let matchCanvasOffFn = context.matchBefore(new RegExp(REGEX_PATTERNS.CANVAS_OFF));
        let matchGlobalVar = context.matchBefore(new RegExp(REGEX_PATTERNS.GLOBAL_VAR));

        // Get characters around cursor for context detection
        const charAfter = context.state.doc.sliceString(context.pos, context.pos + 1);
        const charBefore = context.state.doc.sliceString(context.pos - 1, context.pos);

        // Check if we're doing object property access
        const isPropertyAccess = charBefore === '.' || (before && context.state.doc.sliceString(before.from - 1, before.from) === '.');

        //console.log('EnvironmentContext', context.state.field(environmentContext));
        console.log({ 
            before, match, matchFn, 
            matchGetVarFn, matchSetVarFn, matchGetCntlFn,
            matchDispatchActionFn, matchChartOnFn, matchChartOffFn,
            matchCanvasOnFn, matchCanvasOffFn, matchGlobalVar, 
            explicit: context.explicit, charBefore, charAfter, isPropertyAccess,
            pos: context.pos,
            contextText: context.state.doc.sliceString(Math.max(0, context.pos - 20), context.pos + 10)
        });

        // Check specific function patterns first (don't require match || matchFn)
        if(matchGetVarFn || matchSetVarFn){
            return {
                from: before ? before.from : context.pos,
                options: getVarCompletionList(context)
            };
        }
        if(matchGetCntlFn){
            return {
                from: before ? before.from : context.pos,
                options: getControlCompletionList(context)
            };
        }
        if(matchDispatchActionFn){
            return {
                from: before ? before.from : context.pos,
                options: getActionCompletionList(context)
            };
        }
        if(matchChartOnFn || matchChartOffFn || matchCanvasOnFn || matchCanvasOffFn){
            return {
                from: before ? before.from : context.pos,
                options: getEventCompletionList(context)
            };
        }
        
        // Handle global variable completions (when typing $...) using Tern.js
        if(matchGlobalVar){
            return {
                from: matchGlobalVar.from,
                options: getTernCompletionList(context)
            };
        }
        
        // Don't autocomplete if cursor is at the end of certain bracket types
        // Allow { for block contexts but block other problematic characters
        if (charBefore && BLOCK_CHARACTERS.includes(charBefore)) 
        {
            return null;
        }
        
        // Special handling for { - allow in block contexts but be more careful in others
        if (charBefore === '{') {
            // Look at more context to determine if this is a block or object literal
            const beforeCursor = context.state.doc.sliceString(Math.max(0, context.pos - 10), context.pos);
            // If it looks like a control structure, allow completion
            if (!/\b(if|for|while|function|class|try|catch|else)\s*\([^)]*\)\s*\{$/.test(beforeCursor) && 
                !/\b(else|try|catch|finally)\s*\{$/.test(beforeCursor)) {
                // Might be an object literal - still allow but be less aggressive
                if (!context.explicit) {
                    return null;
                }
            }
        }

        // Allow completions in more contexts: explicit requests, matches, property access, or when we have word matches
        // Also allow if we're in a common coding context (after whitespace, newlines, etc.)
        const isInCodingContext = /[\s\n\r\t]/.test(charBefore) || charBefore === '{' || charBefore === '';
        
        if (!context.explicit && !match && !matchFn && !isPropertyAccess && !before && !isInCodingContext) {
            console.log('Blocking completion - no valid context found');
            return null;
        }

        // Get Tern completions
        const ternOptions = getTernCompletionList(context) || [];
        
        // Get JavaScript operators and statements only if not in property access context
        let jsOperators = [];
        if (!isPropertyAccess) {
            jsOperators = javascriptOperatorsAndStatements(context) || [];
        }

        return {
            from: before ? before.from : context.pos,
            options: [...ternOptions, ...jsOperators]
        };
    };

    let extensions = [
        basicSetup,
        javascript(),
        autocompletion({ 
            override: [CompletionProvider],
            activateOnTyping: true,
            addToOptions: [customIconRenderer]
        }),
        environmentContext,
        lineHighlightExtension,
        lineHighlightTheme,
        readOnlyLinesFilter
    ];

    let state = EditorState.create({
        doc: initialContents,
        extensions
    });

    let view = new EditorView({ state, parent });

    return {view, state};
}

export { createEditor };