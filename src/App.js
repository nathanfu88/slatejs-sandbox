import React from 'react'
import { Editor } from 'slate-react'
import { State } from 'slate'

import './App.css'
import MESSAGES from './constants'

import socketIOClient from 'socket.io-client';
const socket = socketIOClient('http://localhost:8000');

// const DEL_OP = '{"type":"remove_text","path":[0,0],"offset":0,"text":"A","marks":[]}'
// const ADD_OP = '{"type":"insert_text","path":[0,0],"offset":0,"text":"a","marks":[]}'

// TODO: Allow changes offline

const Automerge = require('automerge')

const initialState = State.fromJSON({
    document: {
        nodes: [
        {
            kind: 'block',
            type: 'paragraph',
            nodes: [
            {
                kind: 'text',
                ranges: [
                {
                    text: 'A line of text in a paragraph.'
                }
                ]
            }
            ]
        }
        ]
    }
})

// TODO: absorb into state?
let automergeDoc = Automerge.init()
automergeDoc = Automerge.change(automergeDoc, 'Initialize revisions', doc => {
    doc.revisions = []
})

class App extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            state: initialState
        }

        socket.emit('connection')

        // Trigger update from offline status
        // DOES NOT WORK AS PLANNED YET
        socket.emit(MESSAGES.REQUEST_CHANGES_REPLY, automergeDoc.revisions)
        socket.emit(MESSAGES.REQUEST_CHANGES)

        socket.on(MESSAGES.INCOMING_CHANGES, changeOps => {
            // Should not receive operations array - receive Automerge document instead
            console.log('Client incomingChange ', changeOps)
            // Ugly hack
            if (changeOps.length > 1) {
                // Creating a new Automerge document is NOT the way this should be done
                let changeDoc = Automerge.init()
                changeDoc = Automerge.merge(changeDoc, automergeDoc)
                changeDoc = Automerge.change(changeDoc, 'Incoming change', doc => {
                    for (let op of changeOps) {
                        doc.revisions.push(op)
                    }
                })
                this.applyIncomingChanges(changeDoc)
            }
            else if (changeOps.length > 0) {
                let changeDoc = Automerge.init()
                changeDoc = Automerge.merge(changeDoc, automergeDoc)
                changeDoc = Automerge.change(changeDoc, 'Incoming change', doc => {
                    doc.revisions.push(changeOps)
                })
                this.applyIncomingChanges(changeDoc)
            }
        })

        // Reply with change operation history
        socket.on(MESSAGES.REQUEST_CHANGES, () => {
            console.log('Received request for changes')
            socket.emit(MESSAGES.REQUEST_CHANGES_REPLY, automergeDoc.revisions)
        })
    }

    onChangeEditor1 = ({ operations, state }) => {
        // Only add non-selection changes to the Automerge changes document
        const automergeOps = operations.filter(o => o.type !== 'set_selection' && o.type !== 'set_state').map(op => {
            return JSON.stringify(op)
        })

        automergeDoc = Automerge.change(automergeDoc, 'Local change', doc => {
            doc.revisions.push(automergeOps)
        })

        socket.emit(MESSAGES.EDITOR_CHANGES, automergeOps)
        // socket.emit(MESSAGES.EDITOR_CHANGES, automergeDoc)

        // Apply changes locally
        this.setState({state: state})
    }

    applyIncomingChanges = (document) => {
        // Incoming document is a new Automerge document, so previous history does
        // not merge properly
        // Should not be creating a new document in socket.on(MESSAGES.INCOMING_CHANGES)
        const mergedDoc = Automerge.merge(automergeDoc, document)

        let changeState = this.state.state.change()
        for (let diff of Automerge.diff(automergeDoc, mergedDoc)) {
            try {
                const parsedOp = JSON.parse(diff.value)
                if (parsedOp.type !== 'set_selection') {
                    changeState.applyOperation(parsedOp)
                }
            }
            catch (e) {
                if (e instanceof SyntaxError) {
                    console.log('Skipping diff with value ', diff.value)
                }
                else {
                    throw(e)
                }
            }
        }

        // Incorporate incoming changes into current document
        automergeDoc = mergedDoc

        this.setState({state: changeState.state})
    }

    render() {
        return (
            <Editor
                state={this.state.state}
                onChange={this.onChangeEditor1}
            />
        )
    }

}

export default App;
