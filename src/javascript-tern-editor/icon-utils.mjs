// Icon utility functions for autocomplete
import iconsConfig from './icons-mapping/icons-config.json' assert { type: 'json' };
import { 
    ICON_TYPES, 
    ICON_CONFIG_KEYS, 
    ICON_CSS_CLASSES, 
    DEFAULT_ICON_CSS, 
    FALLBACK_ICON_CSS, 
    WRAPPER_ICON_CSS,
    ICON_TITLE_TEMPLATES,
    ICON_STYLES
} from './constants.mjs';

export function getIconPathForType(type, iconType = ICON_TYPES.CONTROL) {
    const configKey = iconType === ICON_TYPES.VARIABLE ? ICON_CONFIG_KEYS.VARIABLES : ICON_CONFIG_KEYS.CONTROLS;
    const config = iconsConfig[configKey];
    
    if (config && config[type] && config[type].iconPath) {
        return config[type].iconPath;
    }
    
    return null;
}

export function createIconElement(type, basePath = './src/javascript-tern-editor/icons-mapping/', iconType = ICON_TYPES.CONTROL) {
    const iconPath = getIconPathForType(type, iconType);
        
    if (!iconPath) {
        return null;
    }

    const icon = document.createElement('img');
    icon.className = `${ICON_CSS_CLASSES.BASE} ${ICON_CSS_CLASSES[iconType.toUpperCase()]}`;
    icon.src = basePath + iconPath;
    icon.alt = type;
    icon.title = iconType === ICON_TYPES.VARIABLE 
        ? ICON_TITLE_TEMPLATES.VARIABLE(type)
        : ICON_TITLE_TEMPLATES.CONTROL(type);
    
    // Style the icon
    icon.style.cssText = DEFAULT_ICON_CSS;
    
    // Handle image load errors
    icon.onerror = function() {
        this.style.display = ICON_STYLES.DISPLAY.NONE;
    };

    return icon;
}

export function createFallbackIcon(type, iconType = ICON_TYPES.CONTROL) {
    const icon = document.createElement('span');
    icon.className = `${ICON_CSS_CLASSES.BASE} ${ICON_CSS_CLASSES.FALLBACK} ${ICON_CSS_CLASSES[iconType.toUpperCase()]}`;
    icon.textContent = getIconSymbolForType(type, iconType);
    
    // Style the fallback icon with dynamic background
    const dynamicCSS = FALLBACK_ICON_CSS + `background: ${getColorForType(type, iconType)};`;
    icon.style.cssText = dynamicCSS;
    
    return icon;
}

function getIconSymbolForType(type, iconType = ICON_TYPES.CONTROL) {
    const configKey = iconType === ICON_TYPES.VARIABLE ? ICON_CONFIG_KEYS.VARIABLES : ICON_CONFIG_KEYS.CONTROLS;
    const config = iconsConfig[configKey];
    
    if (config && config[type] && config[type].symbol) {
        return config[type].symbol;
    }
    
    return iconsConfig[ICON_CONFIG_KEYS.DEFAULTS].symbol;
}

function getColorForType(type, iconType = ICON_TYPES.CONTROL) {
    const configKey = iconType === ICON_TYPES.VARIABLE ? ICON_CONFIG_KEYS.VARIABLES : ICON_CONFIG_KEYS.CONTROLS;
    const config = iconsConfig[configKey];
    
    if (config && config[type] && config[type].color) {
        return config[type].color;
    }
    
    return iconsConfig[ICON_CONFIG_KEYS.DEFAULTS].color;
}

export function createIconWithFallback(type, basePath = './src/javascript-tern-editor/icons-mapping/', iconType = ICON_TYPES.CONTROL) {
    const imageIcon = createIconElement(type, basePath, iconType);
    if (imageIcon) {
        // Create a wrapper to handle fallback
        const wrapper = document.createElement('span');
        wrapper.className = ICON_CSS_CLASSES.WRAPPER;
        wrapper.style.cssText = WRAPPER_ICON_CSS;
        
        const fallbackIcon = createFallbackIcon(type, iconType);
        fallbackIcon.style.display = ICON_STYLES.DISPLAY.NONE;
        
        // Show fallback if image fails to load
        imageIcon.onerror = function() {
            imageIcon.style.display = ICON_STYLES.DISPLAY.NONE;
            fallbackIcon.style.display = ICON_STYLES.DISPLAY.INLINE_FLEX;
        };
        
        wrapper.appendChild(imageIcon);
        wrapper.appendChild(fallbackIcon);
        return wrapper;
    }
    
    // If no image mapping exists, use fallback directly
    return createFallbackIcon(type, iconType);
}
