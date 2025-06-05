'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Collapse,
} from '@mui/material'
import { format } from 'date-fns'
import { Fragment, useState } from 'react'

export function ViewStatementDetail({
  open,
  onClose,
  statement,
  setStatement,
}) {
  const [expandedRow, setExpandedRow] = useState(null)
  const [newConciledInput, setNewConciledInput] = useState({})

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
    const tx = statement.transactions[idx]
    const input = newConciledInput[idx]
    if (!input?.description || !input?.amount) return

    const updated = [...statement.transactions]
    updated[idx].concileds.push({
      id: `c${tx.concileds.length + 1}`,
      description: input.description,
      amount: parseFloat(input.amount),
    })

    setStatement({ ...statement, transactions: updated })
    setNewConciledInput((prev) => {
      const copy = { ...prev }
      delete copy[idx]
      return copy
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      scroll="body"
      PaperProps={{
        sx: {
          position: 'fixed',
          top: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: 0,
        },
      }}
    >
      <DialogTitle>Extrato Detalhado</DialogTitle>
      <DialogContent>
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
            {statement?.transactions?.map((tx, index) => (
              <Fragment key={index}>
                <TableRow>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{format(tx.date, 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{tx.order}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.fee}</TableCell>
                  <TableCell>{tx.type === 'credit' ? tx.amount : '-'}</TableCell>
                  <TableCell>{tx.type === 'debit' ? tx.amount : '-'}</TableCell>
                  <TableCell>{tx.balance}</TableCell>
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
                          {tx.concileds.map((item, i) => (
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
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}