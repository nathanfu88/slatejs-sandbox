import React from 'react';

import './App.css';
import SyncingEditor from './SyncingEditor'

const Automerge = require('automerge')

let doc1 = Automerge.init()
doc1 = Automerge.change(doc1, 'Initialize changes', doc => {
    doc.changes = []
})

let doc2 = Automerge.init()
doc2 = Automerge.merge(doc2, doc1)

class App extends React.Component {

    oneRef = (one) => {
        this.one = one
    }

    twoRef = (two) => {
        this.two = two
    }

    onOneChange = (change) => {
        const ops = change.operations.filter(o => o.type != 'set_selection' && o.type != 'set_state')
        this.two.applyOperations(ops)
    }

    onTwoChange = (change) => {
        const ops = change.operations.filter(o => o.type != 'set_selection' && o.type != 'set_state')
        this.one.applyOperations(ops)
    }

    render() {
        return (
        <div>
            <SyncingEditor
            ref={this.oneRef}
            onChange={this.onOneChange}
            />
            <div
            style={{
                height: '20px',
                backgroundColor: '#ddd',
                margin: '20px -20px',
            }}
            />
            <SyncingEditor
            ref={this.twoRef}
            onChange={this.onTwoChange}
            />
        </div>
        )
    }


}

export default App;
