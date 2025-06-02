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
import { getStatement, getStatements } from './index.controller'
import { format, fromZonedTime } from 'date-fns-tz'

export const ID = 'A4B0DD1D-74E7-4B22-BFAA-0A911A419B88'

export const Statement = ({ data, onChange }) => {

  const [statements, setStatements] = useState([])
  const [selectedStatement, setSelectedStatement] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch({companyIntegrationId: data.companyIntegrationId})
  }, [])

  const fetch = async ({companyIntegrationId}) => {
    setLoading(true)
    try {
      const statements = await getStatements({companyIntegrationId})
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
            onClick={() => fetch({companyIntegrationId: data.companyIntegrationId})}
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
        <Paper variant="outlined" sx={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Início</TableCell>
                <TableCell>Final</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statements.map((item) => {
                const isSelected = selectedStatement?.sourceId === item.sourceId
                return (
                  <TableRow
                    key={item.sourceId}
                    hover
                    onClick={async () => {
                      const statementData = await getStatement({companyIntegrationId: data.companyIntegrationId, fileName: item.fileName})
                      item.statementData = statementData
                      setSelectedStatement(item)
                      onChange(item)
                    }}
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
                    <TableCell>
                      {format(
                        fromZonedTime(item.begin, Intl.DateTimeFormat().resolvedOptions().timeZone),
                        'dd/MM/yyyy HH:mm'
                      )}
                    </TableCell>
                    <TableCell>
                      {format(
                        fromZonedTime(item.end, Intl.DateTimeFormat().resolvedOptions().timeZone),
                        'dd/MM/yyyy HH:mm'
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>

        {/*selectedExtrato && (
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
        )*/}
        </>
      )}

    </div>
  )
}

export const Settings = ({ data }) => {
  return <div>Options: {data}</div>
}
