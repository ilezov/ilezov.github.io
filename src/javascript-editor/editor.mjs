import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { indentWithTab, history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { foldGutter, indentOnInput, indentUnit, bracketMatching, foldKeymap, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';

import { javascript } from "@codemirror/lang-javascript";

function createEditorState(initialContents, onchange = null) {
    let extensions = [
        basicSetup,
        javascript()
    ];

    if(onchange){
        extensions.push(
            EditorView.updateListener.of(function(e) {
                if (e.docChanged) {
                    onchange(e);
                } 
            })
        )
    }

    return EditorState.create({
        doc: initialContents,
        extensions
    });
}

function createEditorView(state, parent) {
    return new EditorView({ state, parent });
}

export { createEditorState, createEditorView };