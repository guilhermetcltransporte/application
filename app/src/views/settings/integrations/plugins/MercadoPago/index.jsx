'use client'

import React, { useEffect, useState } from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  CircularProgress
} from '@mui/material'
import { getStatement } from './index.controller'
import { format } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'

export const ID = 'A4B0DD1D-74E7-4B22-BFAA-0A911A419B88'

export const Statement = ({ data }) => {
  const [statements, setStatements] = useState([])
  const [selectedExtrato, setSelectedExtrato] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch()
  }, [])

  const fetch = async () => {
    setLoading(true)
    try {
      const statements = await getStatement()
      setStatements(statements)
    } catch (err) {
      console.error('Erro ao carregar extratos:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography fontWeight="bold">Selecione um extrato</Typography>
        <Button
            variant="outlined"
            size="small"
            onClick={fetch}
            disabled={loading}
            startIcon={
                <i
                className="ri-refresh-line"
                style={{
                    fontSize: '18px',
                    animation: loading ? 'spin 1s linear infinite' : 'none',
                }}
                />
            }
            >
            {loading ? 'Atualizando...' : 'Atualizar'}
            </Button>
      </Box>

      {loading ? (
        <Box mt={2} display="flex" justifyContent="center">
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
        <Paper variant="outlined" sx={{ maxHeight: 400, overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>ID</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Final</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statements.map((item) => {
                const isSelected = selectedExtrato?.id === item.id
                return (
                  <TableRow
                    key={item.id}
                    hover
                    onClick={() => setSelectedExtrato(item)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : undefined,
                      color: isSelected ? 'primary.main' : 'inherit',
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}
                  >
                    <TableCell width={30}>
                      {isSelected && (
                        <i className="ri-check-line" style={{ fontSize: '16px' }} />
                      )}
                    </TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      {format(
                        fromZonedTime(item.begin_date, Intl.DateTimeFormat().resolvedOptions().timeZone),
                        'dd/MM/yyyy HH:mm'
                      )}
                    </TableCell>
                    <TableCell>
                      {format(
                        fromZonedTime(item.end_date, Intl.DateTimeFormat().resolvedOptions().timeZone),
                        'dd/MM/yyyy HH:mm'
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>

        {selectedExtrato && (
            <Typography variant="body2" mt={2}>
                Selecionado:{' '}
                <strong>
                    {format(
                    fromZonedTime(selectedExtrato.begin_date, Intl.DateTimeFormat().resolvedOptions().timeZone),
                    'dd/MM/yyyy HH:mm'
                    )}
                </strong>{' '}
                até{' '}
                <strong>
                    {format(
                    fromZonedTime(selectedExtrato.end_date, Intl.DateTimeFormat().resolvedOptions().timeZone),
                    'dd/MM/yyyy HH:mm'
                    )}
                </strong>
            </Typography>
        )}
        </>
      )}

    </div>
  )
}

export const Settings = ({ data }) => {
  return <div>Options: {data}</div>
}
