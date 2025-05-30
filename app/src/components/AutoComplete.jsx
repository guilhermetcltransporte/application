'use client'

import React, { Component, createRef } from 'react'
import styled from 'styled-components'
import _ from 'lodash'
import './AutoComplete.css'
import { Message, toaster } from 'rsuite'
import { CircularProgress, IconButton, InputAdornment, TextField } from '@mui/material'


const AutocompleteContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const SuggestionsBox = styled.div`
  max-height: 300px;
  overflow-y: auto;
  position: fixed;
  background-color: white;
  z-index: 9999;
  border: 1px solid #ccc;
  border-top: none;
`

const Suggestion = styled.div`
  padding: 6px;
  cursor: pointer;
  &:hover,
  &.selected {
    color: white;
    background-color: dodgerblue;
  }
`

const Nothing = styled.div`
  padding: 6px;
`

class ControlAutoComplete extends Component {
  
  inputRef = createRef()
  suggestionsBoxRef = createRef()
  selectedItemRef = createRef()

  constructor(props) {

    super(props)

    this.state = {
      loading: false,
      nothing: false,
      data: [],
      query: '',
      selectedIndex: -1,
      boxStyle: { width: 0 }
    }

  }

  componentDidMount() {
    window.addEventListener('resize', this.updatePosition)
    window.addEventListener('scroll', this.updatePosition)
    document.addEventListener('mousedown', this.handleClickOutside)
    this.updatePosition()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updatePosition)
    window.removeEventListener('scroll', this.updatePosition)
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  updatePosition = () => {
    if (this.inputRef.current) {
      const rect = this.inputRef.current.getBoundingClientRect()
      this.setState({ boxStyle: { width: rect.width } })
    }
  }

  handleSearch = async () => {
    await this.handleInputChange()
    this.inputRef.current.focus()
  }

  handleInputChange = async (e) => {
    try {

        const query = e?.target?.value || ''

        this.setState({ query, selectedIndex: 0, loading: true, nothing: false })
        
        const data = await this.props.onSearch(query)

        this.setState({ data, nothing: _.size(data) == 0 })

    } catch (error) {
      const errors = JSON.parse(error.message).erros
      toaster.push(<Message type='error'><b>Mensagem</b><ul style={{marginTop: '10px'}}>{_.map(errors || [], (message, key) => <li key={key}>{message}</li>)}</ul></Message>,{ placement: 'topEnd', duration: 5000 })
    } finally {
        this.setState({ loading: false })
    }
  }

  handleKeyDown = (e) => {
    const { selectedIndex, data } = this.state
    if (e.key === 'ArrowDown') {
      this.setState(
        (prevState) => ({ selectedIndex: Math.min(prevState.selectedIndex + 1, data.length - 1) }),
        this.scrollToSelectedItem
      )
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      this.setState(
        (prevState) => ({ selectedIndex: Math.max(prevState.selectedIndex - 1, 0) }),
        this.scrollToSelectedItem
      )
      e.preventDefault()
    } else if (e.key === 'Enter' && selectedIndex !== -1) {
      this.handleSuggestionClick(data[selectedIndex])
      this.setState({ data: [] })
    }
  }

  scrollToSelectedItem = () => {
    if (this.selectedItemRef.current && this.suggestionsBoxRef.current) {
      this.selectedItemRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }

  handleBlur = () => {
    setTimeout(() => this.setState({ query: '', data: [], nothing: false }), 200)
  }

  handleClickOutside = (event) => {
    if (
      this.suggestionsBoxRef.current &&
      !this.suggestionsBoxRef.current.contains(event.target) &&
      this.inputRef.current &&
      !this.inputRef.current.contains(event.target)
    ) {
        this.setState({ query: '', data: [], nothing: false })
    }
  }

  handleSuggestionClick = (item) => {
    this.props.onChange(item)
    this.setState({ query: '', data: [], nothing: false })
  }

  handleClear = () => {
    this.setState({ query: '' })
    this.props.onChange(undefined)
    this.inputRef.current?.focus()
  }

  render() {
    const { label, text, value, children, autoFocus } = this.props
    const { query, data, selectedIndex, boxStyle, loading, nothing } = this.state

    return (
      <AutocompleteContainer>
        <div>
            {/*
            <span className="right">
                {loading ? (
                <span className='spinner'>⏳</span> // Ícone de carregamento
                ) : value ? (
                <div style={{ cursor: 'pointer' }} onClick={this.handleClear}>&#x2715;</div>
                ) : (
                <div style={{ cursor: 'pointer' }} onClick={this.handleSearch}>🔍</div>
                )}
            </span>
            
            <input
                ref={this.inputRef}
                //className='input-search'
                placeholder={!value ? '' : text(value)}
                value={query}
                onChange={this.handleInputChange}
                onKeyDown={this.handleKeyDown}
                onBlur={this.handleBlur}
                autoFocus={autoFocus}
            />
            */}
            <TextField
                name="password"
                label={label}
                variant="filled"
                slotProps={{ inputLabel: { shrink: true }}}
                placeholder={!value ? '' : text(value)}
                value={query}
                type={'text'}
                fullWidth
                onChange={this.handleInputChange}
                onKeyDown={this.handleKeyDown}
                onBlur={this.handleBlur}
                sx={{
                    '& input::placeholder': {
                    color: 'black',
                    opacity: 1, // para garantir que fique visível (por padrão é 0.42 no MUI)
                    }
                }}
                InputProps={{
                    endAdornment: (
                    <InputAdornment position="end">
                        {loading ? (
                            <IconButton size="small" edge="end" disabled>
                            <i className="ri-loader-4-line spin" style={{ fontSize: 20 }} />
                            </IconButton>
                        ) : value ? (
                            <IconButton size="small" edge="end" onClick={this.handleClear} aria-label="clear input">
                            <i className="ri-close-line" style={{ fontSize: 20 }} />
                            </IconButton>
                        ) : (
                            <IconButton size="small" edge="end" aria-label="search icon" onClick={this.handleSearch}>
                            <i className="ri-search-line" style={{ fontSize: 20 }} />
                            </IconButton>
                        )}
                    </InputAdornment>
                    )
                }}
                //helperText={<ErrorMessage name="password" />}
                //error={!!errorState || (touched.password && Boolean(errors.password))}
                //disabled={isSubmitting}
            />
        </div>

        <SuggestionsBox
          ref={this.suggestionsBoxRef}
  style={{
    display: _.size(data) || nothing ? 'block' : 'none',
    width: boxStyle.width ? `${boxStyle.width}px` : '100%' // fallback
  }}
          tabIndex={-1}
        >
          {_.map(data, (item, index) => (
            <Suggestion
              key={index}
              ref={index === selectedIndex ? this.selectedItemRef : null}
              className={index === selectedIndex ? 'selected' : ''}
              onClick={() => this.handleSuggestionClick(item)}
            >
              {typeof children === 'function' ? children(item) : null}
            </Suggestion>
          ))}

          {nothing && (
            <Nothing onClick={this.handleBlur}>
              Nenhum resultado encontrado!
            </Nothing>
          )}
        </SuggestionsBox>
      </AutocompleteContainer>
    )
  }
}

export const AutoComplete = ControlAutoComplete
