'use client'

import { Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Button, Collapse, Backdrop, CircularProgress, Typography, DialogActions } from '@mui/material'
import { format } from 'date-fns-tz'
import { Fragment, useEffect, useState } from 'react'
import { getStatement } from './view.statement-detail.controller'
import { toast } from 'react-toastify'

export function ViewStatementDetail({ statementId, onClose, onError}) {

    const [loading, setLoading] = useState(false)
    
    const [statement, setStatement] = useState(null)

    const [expandedRow, setExpandedRow] = useState(null)
    const [newConciledInput, setNewConciledInput] = useState({})

    useEffect(() => {
        const fetchStatement = async () => {
            try {

                //setErrorState(null)
                setLoading(true)
                //setShouldReset(true)

                if (statementId) {
                    const statement = await getStatement({ statementId })
                    setStatement(statement)
                    console.log(statement)
                    //setInitialUser(userData?.user || null)
                } else {
                    //setInitialUser(null)
                }

            } catch (error) {
                toast.error(error.message)
                onError()
            } finally {
                setLoading(false)
            }
        }

        fetchStatement()

    }, [statementId])
    
  const toggleExpand = (idx) => {
    setExpandedRow((prev) => (prev === idx ? null : idx))
  }

  const handleAddConciled = (idx) => {
    setNewConciledInput((prev) => ({
      ...prev,
      [idx]: { description: '', amount: '' },
    }))
  }

  const handleInputChange = (idx, field, value) => {
    setNewConciledInput((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], [field]: value },
    }))
  }

  const handleConfirmConciled = (idx) => {
    const tx = statement.statementData[idx]
    const input = newConciledInput[idx]
    if (!input?.description || !input?.amount) return

    const updated = [...statement.statementData]
    updated[idx].concileds.push({
      id: `c${tx.concileds.length + 1}`,
      description: input.description,
      amount: parseFloat(input.amount),
    })

    setStatement({ ...statement, statementData: updated })
    setNewConciledInput((prev) => {
      const copy = { ...prev }
      delete copy[idx]
      return copy
    })
  }

  return (
    <>
        <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: '#fff', flexDirection: 'column' }}>
            <CircularProgress color='inherit' />
            <Typography variant="h6" sx={{ mt: 2, color: '#fff' }}>
                Carregando...
            </Typography>
        </Backdrop>
        <Dialog
            open={statementId !== undefined && !loading}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            scroll="paper"
            PaperProps={{
                sx: {
                position: 'fixed',
                top: '32px',
                left: '50%',
                transform: 'translateX(-50%)',
                margin: 0,
                maxHeight: 'calc(100vh - 64px)', // <- isso ativa o scroll interno
                },
            }}
            >
            <DialogTitle>Extrato Detalhado</DialogTitle>
            <DialogContent>

                ADA
                <Table size="small">
                    <TableHead>
                        <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Data</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Taxa</TableCell>
                        <TableCell>Crédito</TableCell>
                        <TableCell>Débito</TableCell>
                        <TableCell>Saldo</TableCell>
                        <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(statement?.statementData || [])?.map((tx, index) => (
                        <Fragment key={index}>
                            <TableRow>
                                <TableCell>{tx.sourceId}</TableCell>
                                <TableCell>{format(tx.entryDate, 'dd/MM/yyyy HH:mm')}</TableCell>
                                <TableCell>{tx.order}</TableCell>
                                <TableCell>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tx.amount)}</TableCell>
                                <TableCell>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tx.fee)}</TableCell>
                                <TableCell>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tx.credit)}</TableCell>
                                <TableCell>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tx.debit)}</TableCell>
                                <TableCell>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tx.balance)}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => toggleExpand(index)}>
                                    {expandedRow === index ? (
                                        <i className="ri-arrow-up-circle-line" />
                                    ) : (
                                        <i className="ri-arrow-down-circle-line" />
                                    )}
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                            
                            {expandedRow === index && (
                                <TableRow>
                                    <TableCell colSpan={9} sx={{ p: 0 }}>                                                                               
                                        <Collapse in={expandedRow === index}>
                                            <Table size="small" sx={{ mb: 1 }}>
                                                <TableHead>
                                                <TableRow>
                                                    <TableCell>ID</TableCell>
                                                    <TableCell>Descrição</TableCell>
                                                    <TableCell>Valor</TableCell>
                                                    <TableCell />
                                                </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                {(tx.concileds || []).map((item, i) => (
                                                    <TableRow key={i}>
                                                    <TableCell>{item.id}</TableCell>
                                                    <TableCell>{item.description}</TableCell>
                                                    <TableCell>{item.amount}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {newConciledInput[index] ? (
                                                    <TableRow>
                                                    <TableCell>novo</TableCell>
                                                    <TableCell>
                                                        <input
                                                        className="border rounded px-2 py-1 text-sm w-full"
                                                        value={newConciledInput[index].description}
                                                        onChange={(e) =>
                                                            handleInputChange(index, 'description', e.target.value)
                                                        }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <input
                                                        type="number"
                                                        className="border rounded px-2 py-1 text-sm w-full"
                                                        value={newConciledInput[index].amount}
                                                        onChange={(e) =>
                                                            handleInputChange(index, 'amount', e.target.value)
                                                        }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button size="small" onClick={() => handleConfirmConciled(index)}>
                                                        Confirmar
                                                        </Button>
                                                    </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    <TableRow>
                                                    <TableCell colSpan={4}>
                                                        <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleAddConciled(index)}
                                                        >
                                                        Adicionar conciliação
                                                        </Button>
                                                    </TableCell>
                                                    </TableRow>
                                                )}
                                                </TableBody>
                                            </Table>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            )}
                            
                        </Fragment>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                Teste
            </DialogActions>
        </Dialog>
    </>
  )
}