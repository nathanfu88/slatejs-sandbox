import { Editor } from 'slate-react'
import { State } from 'slate'

import React from 'react'
import isHotkey from 'is-hotkey'
import initialState from './state.json'

const isBoldHotkey = isHotkey('mod+b')
const isItalicHotkey = isHotkey('mod+i')
const isUnderlinedHotkey = isHotkey('mod+u')
const isCodeHotkey = isHotkey('mod+`')

const schema = {
  marks: {
    bold: {
      fontWeight: 'bold'
    },
    code: {
      fontFamily: 'monospace',
      backgroundColor: '#eee',
      padding: '3px',
      borderRadius: '4px'
    },
    italic: {
      fontStyle: 'italic'
    },
    underlined: {
      textDecoration: 'underline'
    }
  }
}

export default class SyncingEditor extends React.Component {
    state = {
        state: State.fromJSON(initialState),
    }
    
    applyOperations = (operations) => {
        const { state } = this.state
        const change = state.change().applyOperations(operations)
        this.onChange(change, { remote: true })
    }
    
    hasMark = (type) => {
        const { state } = this.state
        return state.activeMarks.some(mark => mark.type == type)
    }
    
    onChange = (change, options = {}) => {
        this.setState({ state: change.state })
    
        if (!options.remote) {
            this.props.onChange(change)
        }
    }
    
    onKeyDown = (e, data, change) => {
        let mark
    
        if (isBoldHotkey(e)) {
            mark = 'bold'
        } else if (isItalicHotkey(e)) {
            mark = 'italic'
        } else if (isUnderlinedHotkey(e)) {
            mark = 'underlined'
        } else if (isCodeHotkey(e)) {
            mark = 'code'
        } else {
            return
        }
    
        e.preventDefault()
        change.toggleMark(mark)
        return true
    }
    
    onClickMark = (e, type) => {
        e.preventDefault()
        const { state } = this.state
        const change = state.change().toggleMark(type)
        this.onChange(change)
    }
    
    render() {
        return (
            <div>
                {/* {this.renderToolbar()} */}
                {this.renderEditor()}
            </div>
        )
    }
    
    renderToolbar = () => {
        return (
            <div className="menu toolbar-menu">
                {this.renderButton('bold', 'format_bold')}
                {this.renderButton('italic', 'format_italic')}
                {this.renderButton('underlined', 'format_underlined')}
                {this.renderButton('code', 'code')}
            </div>
        )
    }
    
    renderButton = (type, icon) => {
        const isActive = this.hasMark(type)
        const onMouseDown = e => this.onClickMark(e, type)
    
        return (
            <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
                <span className="material-icons">{icon}</span>
            </span>
        )
    }
    
    renderEditor = () => {
        return (
        <div className="editor">
            <Editor
                state={this.state.state}
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
                schema={schema}
                placeholder={'Enter some rich text...'}
                spellCheck
            />
        </div>
        )
    }
    
}