// Constants for the JavaScript Tern Editor

// Control Types
export const CONTROL_TYPES = [
    'button', 
    'checkbox', 
    'radiobutton', 
    'switch', 
    'textInput', 
    'combobox', 
    'choices', 
    'range', 
    'progress', 
    'colorPicker',
    'label', 
    'icon', 
    'frame', 
    'grid', 
    'layoutContainer', 
    'splitPane', 
    'panel', 
    'dropBox', 
    'audio', 
    'video', 
    'transcriber', 
    'reloadButton', 
    'toolbar'
];

// Variable Types
export const VARIABLE_TYPES = [
    'string', 
    'number', 
    'boolean', 
    'object', 
    'function', 
    'property', 
    'action', 
    'event',
    'operator',
    'template', 
    'syntax',
    'literal',
    'keyword'
];

// ECharts Action Types
export const ECHARTS_ACTION_TYPES = [
    // Highlight actions
    'highlight',
    'downplay',
    
    // Tooltip actions
    'showTip',
    'hideTip',
    
    // Legend actions
    'legendSelect',
    'legendUnSelect',
    'legendToggleSelect',
    'legendScroll',
    
    // Data zoom actions
    'dataZoom',
    
    // Brush actions
    'brush',
    'brushSelect',
    'brushEnd',
    
    // Selection actions
    'select',
    'unselect',
    'toggleSelected',
    
    // Geo/Map actions
    'geoSelect',
    'geoUnSelect',
    'geoToggleSelect',
    
    // Timeline actions
    'timelineChange',
    'timelinePlayChange',
    
    // Global cursor actions
    'takeGlobalCursor',
    
    // Restore action
    'restore'
];

// ECharts Action Descriptions
export const ECHARTS_ACTION_DESCRIPTIONS = {
    'highlight': 'Highlight specified data item(s)',
    'downplay': 'Downplay/cancel highlight of specified data item(s)',
    'showTip': 'Show tooltip at specified position',
    'hideTip': 'Hide tooltip',
    'legendSelect': 'Select legend item',
    'legendUnSelect': 'Unselect legend item',
    'legendToggleSelect': 'Toggle legend item selection',
    'legendScroll': 'Scroll legend',
    'dataZoom': 'Data zoom operation',
    'brush': 'Brush selection operation',
    'brushSelect': 'Select brushed area',
    'brushEnd': 'End brush selection',
    'select': 'Select data item(s)',
    'unselect': 'Unselect data item(s)',
    'toggleSelected': 'Toggle data item selection',
    'geoSelect': 'Select geographic region',
    'geoUnSelect': 'Unselect geographic region',
    'geoToggleSelect': 'Toggle geographic region selection',
    'timelineChange': 'Change timeline position',
    'timelinePlayChange': 'Change timeline play state',
    'takeGlobalCursor': 'Set global cursor state for brush/selection',
    'restore': 'Restore chart to original state'
};

// ECharts Event Types
export const ECHARTS_EVENT_TYPES = [
    // Mouse events
    'click',
    'dblclick',
    'mousedown',
    'mousemove',
    'mouseup',
    'mouseover',
    'mouseout',
    'globalout',
    'contextmenu',
    
    // Highlight events
    'highlight',
    'downplay',
    
    // Selection events
    'selectchanged',
    
    // Legend events
    'legendselectchanged',
    'legendselected',
    'legendunselected',
    'legendselectall',
    'legendinverseselect',
    'legendscroll',
    
    // Axis events
    'axisbreakchanged',
    'axisareaselected',
    
    // Data zoom events
    'datazoom',
    'datarangeselected',
    
    // Roaming events
    'graphroam',
    'georoam',
    'treeroam',
    
    // Timeline events
    'timelinechanged',
    'timelineplaychanged',
    
    // Toolbox events
    'magictypechanged',
    'dataviewchanged',
    'restore',
    'saveAsImage',
    
    // Geographic events
    'geoselectchanged',
    'geoselected',
    'geounselected',
    
    // Map events
    'mapselectchanged',
    'mapselected',
    'mapunselected',
    
    // Pie events
    'pieselectchanged',
    'pieselected',
    'pieunselected',
    
    // Graph events
    'focusNodeAdjacency',
    'unfocusNodeAdjacency',
    
    // Axis pointer events
    'updateAxisPointer',
    
    // Finished events
    'finished',
    'rendered'
];

// ECharts Event Descriptions
export const ECHARTS_EVENT_DESCRIPTIONS = {
    // Mouse events
    'click': 'Mouse click event on chart elements',
    'dblclick': 'Mouse double click event on chart elements',
    'mousedown': 'Mouse button pressed down on chart elements',
    'mousemove': 'Mouse move event over chart elements',
    'mouseup': 'Mouse button released on chart elements',
    'mouseover': 'Mouse enters chart elements',
    'mouseout': 'Mouse leaves chart elements',
    'globalout': 'Mouse leaves the entire chart area',
    'contextmenu': 'Right-click context menu on chart elements',
    
    // Highlight events
    'highlight': 'Highlight chart elements',
    'downplay': 'Downplay/remove highlight from chart elements',
    
    // Selection events
    'selectchanged': 'Selection state changed',
    
    // Legend events
    'legendselectchanged': 'Legend selection state changed',
    'legendselected': 'Legend item selected',
    'legendunselected': 'Legend item unselected',
    'legendselectall': 'All legend items selected',
    'legendinverseselect': 'Legend selection inverted',
    'legendscroll': 'Legend scrolled',
    
    // Axis events
    'axisbreakchanged': 'Axis break changed',
    'axisareaselected': 'Axis area selected',
    
    // Data zoom events
    'datazoom': 'Data zoom component changed',
    'datarangeselected': 'Data range selected',
    
    // Roaming events
    'graphroam': 'Graph chart roamed (pan/zoom)',
    'georoam': 'Geographic chart roamed (pan/zoom)',
    'treeroam': 'Tree chart roamed (pan/zoom)',
    
    // Timeline events
    'timelinechanged': 'Timeline position changed',
    'timelineplaychanged': 'Timeline play state changed',
    
    // Toolbox events
    'magictypechanged': 'Magic type changed',
    'dataviewchanged': 'Data view changed',
    'restore': 'Chart restored',
    'saveAsImage': 'Chart saved as image',
    
    // Geographic events
    'geoselectchanged': 'Geographic selection changed',
    'geoselected': 'Geographic area selected',
    'geounselected': 'Geographic area unselected',
    
    // Map events
    'mapselectchanged': 'Map selection changed',
    'mapselected': 'Map area selected',
    'mapunselected': 'Map area unselected',
    
    // Pie events
    'pieselectchanged': 'Pie selection changed',
    'pieselected': 'Pie sector selected',
    'pieunselected': 'Pie sector unselected',
    
    // Graph events
    'focusNodeAdjacency': 'Graph node focused',
    'unfocusNodeAdjacency': 'Graph node unfocused',
    
    // Axis pointer events
    'updateAxisPointer': 'Axis pointer updated',
    
    // Finished events
    'finished': 'Chart animation finished',
    'rendered': 'Chart rendering completed'
};

// Hidden Global Variables
export const HIDDEN_GLOBAL_VARS = {
    "$canvas": { type: "object", description: "Chart canvas object" },
    "$component": { type: "object", description: "Component object" }, 
    "$app": { type: "object", description: "Application object" },
    "$ENV": { type: "object", description: "Environment object" }
};

// Common Paths
export const ICON_BASE_PATH = './src/javascript-tern-editor/icons-mapping/';

// Regex Patterns (as strings to avoid issues with imports)
export const REGEX_PATTERNS = {
    GET_VARIABLE: 'getVariable\\s*\\(',
    SET_VARIABLE: 'setVariable\\s*\\(',
    GET_CONTROL: 'getControl\\s*\\(',
    DISPATCH_ACTION: '\\bdispatchAction\\s*\\(\\s*\\{\\s*type\\s*:\\s*[\'\"]*',
    CHART_ON: '\\b(?:chart|myChart)\\s*\\.\\s*on\\s*\\(\\s*[\'\"]*',
    CHART_OFF: '\\b(?:chart|myChart)\\s*\\.\\s*off\\s*\\(\\s*[\'\"]*',
    CANVAS_ON: '\\$canvas\\s*\\.\\s*on\\s*\\(\\s*[\'\"]*',
    CANVAS_OFF: '\\$canvas\\s*\\.\\s*off\\s*\\(\\s*[\'\"]*',
    GLOBAL_VAR: '\\$\\w*',
    WORD: '\\w+',
    WORD_DOT: '\\w+(?:\\.\\w*)?',
    FUNCTION_CALL: '\\w+\\(.*?\\).?'
};

// Block Characters - characters that should prevent autocompletion when they're immediately before cursor
export const BLOCK_CHARACTERS = ['(', '[', ';'];

// Icon Utils Constants

// Icon Types
export const ICON_TYPES = {
    CONTROL: 'control',
    VARIABLE: 'variable'
};

// Config Keys for Icon Types
export const ICON_CONFIG_KEYS = {
    CONTROLS: 'controls',
    VARIABLES: 'variables',
    DEFAULTS: 'defaults'
};

// CSS Classes
export const ICON_CSS_CLASSES = {
    BASE: 'cm-completion-icon',
    CONTROL: 'cm-completion-icon-control',
    VARIABLE: 'cm-completion-icon-variable', 
    FALLBACK: 'cm-completion-icon-fallback',
    WRAPPER: 'cm-completion-icon-wrapper'
};

// Icon Dimensions and Styling
export const ICON_STYLES = {
    SIZE: {
        WIDTH: '16px',
        HEIGHT: '16px'
    },
    SPACING: {
        MARGIN_RIGHT: '6px'
    },
    BORDERS: {
        RADIUS: '2px',
        FALLBACK_RADIUS: '3px'
    },
    FONTS: {
        SIZE: '10px',
        WEIGHT: 'bold',
        FAMILY: 'monospace'
    },
    DISPLAY: {
        NONE: 'none',
        INLINE_FLEX: 'inline-flex'
    },
    POSITIONING: {
        VERTICAL_ALIGN: 'middle',
        TEXT_ALIGN: 'center',
        OBJECT_FIT: 'contain',
        FLEX_SHRINK: '0'
    },
    COLORS: {
        TEXT: 'white'
    }
};

// Default Icon Styles (CSS Text)
export const DEFAULT_ICON_CSS = `
    width: ${ICON_STYLES.SIZE.WIDTH};
    height: ${ICON_STYLES.SIZE.HEIGHT};
    margin-right: ${ICON_STYLES.SPACING.MARGIN_RIGHT};
    vertical-align: ${ICON_STYLES.POSITIONING.VERTICAL_ALIGN};
    border-radius: ${ICON_STYLES.BORDERS.RADIUS};
    object-fit: ${ICON_STYLES.POSITIONING.OBJECT_FIT};
    flex-shrink: ${ICON_STYLES.POSITIONING.FLEX_SHRINK};
`;

export const FALLBACK_ICON_CSS = `
    display: ${ICON_STYLES.DISPLAY.INLINE_FLEX};
    align-items: center;
    justify-content: center;
    width: ${ICON_STYLES.SIZE.WIDTH};
    height: ${ICON_STYLES.SIZE.HEIGHT};
    margin-right: ${ICON_STYLES.SPACING.MARGIN_RIGHT};
    color: ${ICON_STYLES.COLORS.TEXT};
    border-radius: ${ICON_STYLES.BORDERS.FALLBACK_RADIUS};
    font-size: ${ICON_STYLES.FONTS.SIZE};
    font-weight: ${ICON_STYLES.FONTS.WEIGHT};
    font-family: ${ICON_STYLES.FONTS.FAMILY};
    text-align: ${ICON_STYLES.POSITIONING.TEXT_ALIGN};
    flex-shrink: ${ICON_STYLES.POSITIONING.FLEX_SHRINK};
`;

export const WRAPPER_ICON_CSS = 'display: inline-flex; align-items: center;';

// Title Templates
export const ICON_TITLE_TEMPLATES = {
    VARIABLE: (type) => `${type} variable`,
    CONTROL: (type) => `${type} control`
};

// Completion Sorting Constants
export const COMPLETION_TYPES = {
    PROPERTY: 'property',
    FUNCTION: 'function'
};

// Sort order for completion types (lower number = higher priority)
export const COMPLETION_SORT_ORDER = {
    [COMPLETION_TYPES.PROPERTY]: 1,
    [COMPLETION_TYPES.FUNCTION]: 2
};

// CodeMirror 6 boost values for completion sorting (higher = better priority)
export const COMPLETION_BOOST = {
    [COMPLETION_TYPES.PROPERTY]: 100,
    [COMPLETION_TYPES.FUNCTION]: 50
};

// Function detection pattern
export const FUNCTION_TYPE_PATTERN = 'fn(';
