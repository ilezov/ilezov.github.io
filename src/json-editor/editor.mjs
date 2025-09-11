import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { jsonSchema } from "codemirror-json-schema";
import { basicSetup } from 'codemirror';
import { json } from "@codemirror/lang-json";


function createEditorState(initialContents, schema, onchange = null) {
    let extensions = [
        basicSetup,
        json(),
        jsonSchema(schema)
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