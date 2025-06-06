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
  Backdrop,
  CircularProgress,
  Typography,
  DialogActions,
  Select,
  MenuItem,
  TextField,
} from '@mui/material'
import { format } from 'date-fns-tz'
import { Fragment, useEffect, useState } from 'react'
import { getStatement } from './view.statement-detail.controller'
import { toast } from 'react-toastify'
import { AutoComplete } from '@/components/AutoComplete'
import { getUser } from '@/utils/search'

export function ViewStatementDetail({ statementId, onClose, onError }) {
  const [loading, setLoading] = useState(false)
  const [statement, setStatement] = useState(null)
  const [expandedRow, setExpandedRow] = useState(null)
  const [newConciledInput, setNewConciledInput] = useState({})

  useEffect(() => {
    const fetchStatement = async () => {
      try {
        setLoading(true)
        if (statementId) {
          const statement = await getStatement({ statementId })
          setStatement(statement)
          console.log(statement)
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
      [idx]: { type: '', description: '', amount: 0, fee: 0, discount: 0 },
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

    console.log(input)

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
      <Backdrop
        open={loading}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          color: '#fff',
          flexDirection: 'column',
        }}
      >
        <CircularProgress color="inherit" />
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
            maxHeight: 'calc(100vh - 64px)',
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
              {(statement?.statementData || []).map((statementData, index) => (
                <Fragment key={index}>
                  <TableRow>
                    <TableCell>{statementData.sourceId}</TableCell>
                    <TableCell>
                      {format(statementData.entryDate, 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {statementData.orderId
                        ? `Ref. pedido #${statementData.orderId}`
                        : ''}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(statementData.amount)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(statementData.fee)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(statementData.credit)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(statementData.debit)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(statementData.balance)}
                    </TableCell>
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
                            <TableBody>
                              {(statementData.concileds || []).map(
                                (item, i) => (
                                  <TableRow key={i}>
                                    <TableCell style={{ width: '120px' }}>
                                      {item.id}
                                    </TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>
                                      {new Intl.NumberFormat('pt-BR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }).format(item.amount)}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}

                              {newConciledInput[index] ? (
                                <TableRow>
                                  {/* Tipo de Conciliação */}
                                  <TableCell style={{ width: '130px', padding: 5 }}>
                                    <Select
                                      size='small'
                                      variant='filled'
                                      sx={{ width: '100%', mb: 1 }}
                                      value={newConciledInput[index].type}
                                      onChange={(event) => handleInputChange(
                                          index,
                                          'type',
                                          event.target.value
                                        )}
                                    >
                                      <MenuItem value=''>[Selecione]</MenuItem>
                                      <MenuItem value={'payment'}>Pagamento</MenuItem>
                                      <MenuItem value={'receivement'}>Recebimento</MenuItem>
                                      <MenuItem value={'transfer'}>Transferência</MenuItem>
                                    </Select>
                                  </TableCell>

                                  {/* Categoria + Subcategoria */}
                                  <TableCell style={{ width: '200px', padding: 5 }}>
                                    <div style={{display: newConciledInput[index].type == '' ? 'none': 'block'}}>
                                      <AutoComplete
                                        //label='Usuário'
                                        //value={values.user}
                                        //text={(item) => item?.userName}
                                        onChange={(user) => {
                                          console.log(user)
                                          //setFieldValue('user', val)
                                          //setTouched({ ...touched, user: true })
                                        }}
                                        //onBlur={() => setTouched({ ...touched, user: true })}
                                        onSearch={getUser}
                                        //error={touched.user && Boolean(errors.user)}
                                        //helperText={touched.user && errors.user}
                                        //disabled={companyUserId}
                                      >
                                        {(item) => <span>{item.userName}</span>}
                                      </AutoComplete>
                                      <Select size='small' variant='filled' sx={{width: '100%'}}>
                                        <MenuItem value={''}>Subcategoria</MenuItem>
                                      </Select>
                                    </div>
                                  </TableCell>

                                  {/* Valor */}
                                  <TableCell style={{ width: '100px', padding: 5 }}>
                                    <div style={{display: newConciledInput[index].type == '' ? 'none': 'block'}}>
                                      <TextField
                                        size="small"
                                        variant="filled"
                                        slotProps={{ inputLabel: { shrink: true } }}
                                        fullWidth
                                        placeholder="Valor"
                                        value={newConciledInput[index].amount}
                                        onChange={(e) =>
                                          handleInputChange(
                                            index,
                                            'amount',
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </TableCell>

                                  {/* Taxa */}
                                  <TableCell style={{ width: '100px', padding: 5 }}>
                                    <div style={{display: newConciledInput[index].type == '' ? 'none': 'block'}}>
                                      <TextField
                                        size="small"
                                        variant="filled"
                                        slotProps={{ inputLabel: { shrink: true } }}
                                        fullWidth
                                        placeholder="Taxa"
                                        value={newConciledInput[index].fee}
                                        onChange={(e) =>
                                          handleInputChange(
                                            index,
                                            'fee',
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </TableCell>

                                  {/* Desconto */}
                                  <TableCell style={{ width: '100px', padding: 5 }}>
                                    <div style={{display: newConciledInput[index].type == '' ? 'none': 'block'}}>
                                      <TextField
                                        size="small"
                                        variant="filled"
                                        slotProps={{ inputLabel: { shrink: true } }}
                                        type="number"
                                        fullWidth
                                        placeholder="Desconto"
                                        value={newConciledInput[index].discount}
                                        onChange={(e) =>
                                          handleInputChange(
                                            index,
                                            'discount',
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </TableCell>

                                  {/* Ações */}
                                  <TableCell style={{ width: '80px', padding: 5 }}>
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => handleConfirmConciled(index)}
                                    >
                                      <i className="ri-check-line" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => setNewConciledInput({})}
                                    >
                                      <i className="ri-close-line" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={5}>
                                    <Button
                                      size="small"
                                      variant="text"
                                      startIcon={
                                        <i className="ri-add-circle-line" />
                                      }
                                      onClick={() => handleAddConciled(index)}
                                    >
                                      Adicionar
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
          <Button variant='text' color='primary' sx={{ mt: 4 }} onClick={onClose}>Desconciliar</Button>
          <Button variant='contained' color='success' sx={{ mt: 4 }} onClick={onClose}>Conciliar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
