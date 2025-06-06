'use client'

import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import _ from 'lodash'
import { IconButton, InputAdornment, TextField } from '@mui/material'

const AutocompleteContainer = styled.div`
    position: relative;  /* importante para posicionar o SuggestionsBox com absolute */
    display: inline-block;
    width: 100%;
`

const SuggestionsBox = styled.div`
    max-height: 300px;
    overflow-y: auto;
    position: absolute;  /* alterado para absolute */
    top: 100%;           /* logo abaixo do input */
    left: 0;
    right: 0;
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

export const AutoComplete = (props) => {

    const [inputError, setInputError] = useState(false)
    const [inputHelperText, setInputHelperText] = useState('')

    const inputRef = useRef()
    const suggestionsBoxRef = useRef()
    const selectedItemRef = useRef()

    const [state, setState] = useState({
        loading: false,
        nothing: false,
        data: [],
        query: '',
        selectedIndex: -1,
    })

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleSearch = async () => {
        await handleInputChange()
        inputRef.current.focus()
    }

    const handleInputChange = async (e) => {
        try {
            setInputError(false)
            setInputHelperText('')

            const query = e?.target?.value || ''
            setState(prev => ({ ...prev, query, selectedIndex: 0, loading: true, nothing: false }))
            const data = await props.onSearch(query)
            setState(prev => ({ ...prev, data, nothing: _.size(data) === 0 }))

        } catch (error) {
            setInputError(true)
            setInputHelperText(error.message || 'Erro desconhecido')
        } finally {
            setState(prev => ({ ...prev, loading: false }))
        }
    }

    const handleKeyDown = (e) => {
        const { selectedIndex, data } = state

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setState(prev => ({ ...prev, selectedIndex: Math.min(prev.selectedIndex + 1, data.length - 1) }))
            scrollToSelectedItem()
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setState(prev => ({ ...prev, selectedIndex: Math.max(prev.selectedIndex - 1, 0) }))
            scrollToSelectedItem()
        } else if (e.key === 'Enter' && selectedIndex !== -1) {
            e.preventDefault()
            handleSuggestionClick(data[selectedIndex])
            setState(prev => ({ ...prev, data: [] }))
        }  else if (e.key === 'Escape') {
            e.preventDefault()
            setState(prev => ({ ...prev, data: [] }))
        }
    }

    const scrollToSelectedItem = () => {
        if (selectedItemRef.current && suggestionsBoxRef.current) {
            selectedItemRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }
    }

    const handleBlur = () => {
        setTimeout(() => setState(prev => ({ ...prev, query: '', data: [], nothing: false })), 200)
    }

    const handleClickOutside = (event) => {
        if (
            suggestionsBoxRef.current &&
            !suggestionsBoxRef.current.contains(event.target) &&
            inputRef.current &&
            !inputRef.current.contains(event.target)
        ) {
            setState(prev => ({ ...prev, query: '', data: [], nothing: false }))
        }
    }

    const handleSuggestionClick = (item) => {
        props.onChange(item)
        setState(prev => ({ ...prev, query: '', data: [], nothing: false }))
    }

    const handleClear = () => {
        setState(prev => ({ ...prev, query: '' }))
        props.onChange(null)
        inputRef.current?.focus()
    }

    const { label, text, value, children, autoFocus } = props
    const { query, data, selectedIndex, loading, nothing } = state

    return (
        <AutocompleteContainer>
            <TextField
                size={props.size ?? 'medium'}
                inputRef={inputRef}
                name="password"
                label={label}
                variant={props.variant ?? 'filled'}
                slotProps={{ inputLabel: { shrink: true } }}
                placeholder={!value ? props.placeholder : text(value)}
                value={query}
                type={'text'}
                fullWidth
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                autoFocus={autoFocus}
                sx={{
                    ...(value && props.placeholder && {
                    '& input::placeholder': {
                        color: 'black',
                        opacity: 1,
                    },
                    }),
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {loading ? (
                                <IconButton size="small" edge="end" disabled>
                                    <i className="ri-loader-4-line spin" style={{ fontSize: 20 }} />
                                </IconButton>
                            ) : value ? (
                                <IconButton size="small" edge="end" onClick={handleClear} aria-label="clear input" disabled={props.disabled}>
                                    <i className="ri-close-line" style={{ fontSize: 20 }} />
                                </IconButton>
                            ) : (
                                <IconButton size="small" edge="end" aria-label="search icon" onClick={handleSearch}>
                                    <i className="ri-search-line" style={{ fontSize: 20 }} />
                                </IconButton>
                            )}
                        </InputAdornment>
                    )
                }}
                error={inputError || props.error}
                helperText={inputHelperText || props.helperText}
                disabled={props.disabled}
            />

            <SuggestionsBox
                ref={suggestionsBoxRef}
                style={{
                    display: _.size(data) || nothing ? 'block' : 'none',
                }}
                tabIndex={-1}
            >
                {_.map(data, (item, index) => (
                    <Suggestion
                        key={index}
                        ref={index === selectedIndex ? selectedItemRef : null}
                        className={index === selectedIndex ? 'selected' : ''}
                        onClick={() => handleSuggestionClick(item)}
                    >
                        {typeof children === 'function' ? children(item) : null}
                    </Suggestion>
                ))}

                {nothing && (
                    <Nothing onClick={handleBlur}>
                        Nenhum resultado encontrado!
                    </Nothing>
                )}
            </SuggestionsBox>
        </AutocompleteContainer>
    )
}
