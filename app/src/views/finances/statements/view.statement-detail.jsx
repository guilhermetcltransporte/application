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
  Paper,
  Grid,
} from '@mui/material'
import { format } from 'date-fns-tz'
import { Fragment, useEffect, useState } from 'react'
import { getStatement, saveStatementConciled } from './view.statement-detail.controller'
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
      [idx]: { type: '', description: '', amount: '', fee: '', discount: '' },
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

    if (!input?.amount) return

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

  const handleCancelConciled = (idx) => {
    setNewConciledInput((prev) => {
      const copy = { ...prev }
      delete copy[idx]
      return copy
    })
  }

  return (
    <>
      <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: '#fff', flexDirection: 'column' }}>
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ mt: 2, color: '#fff' }}>Carregando...</Typography>
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
              {(statement?.statementData || []).map((data, index) => (
                <Fragment key={index}>
                  <TableRow>
                    <TableCell>{data.sourceId}</TableCell>
                    <TableCell>{format(data.entryDate, 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{data.orderId ? `Ref. pedido #${data.orderId}` : ''}</TableCell>
                    <TableCell>{data.amount.toFixed(2)}</TableCell>
                    <TableCell>{data.fee.toFixed(2)}</TableCell>
                    <TableCell>{data.credit.toFixed(2)}</TableCell>
                    <TableCell>{data.debit.toFixed(2)}</TableCell>
                    <TableCell>{data.balance.toFixed(2)}</TableCell>
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
                    <ExpandedRow
                      index={index}
                      data={data}
                      input={newConciledInput[index]}
                      onAdd={handleAddConciled}
                      onChange={handleInputChange}
                      onConfirm={handleConfirmConciled}
                      onCancel={handleCancelConciled}
                    />
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="primary" sx={{ mt: 4 }} onClick={onClose}>Desconciliar</Button>
          <Button variant="contained" color="success" sx={{ mt: 4 }} onClick={onClose}>Conciliar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function ExpandedRow({ index, data, input, onAdd, onChange, onConfirm, onCancel }) {
  return (
    <TableRow>
      <TableCell colSpan={9} sx={{ p: 0 }}>
        <Collapse in={true}>
          <Table size="small" sx={{ mb: 1 }}>
            <TableBody>
              {(data.concileds || []).map((item, i) => (
                <TableRow key={i}>
                  <TableCell style={{ width: '120px' }}>{item.id}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}

              {input ? (
                <ConciliationForm index={index} input={input} onChange={onChange} onConfirm={onConfirm} onCancel={onCancel} />
              ) : (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<i className="ri-add-circle-line" />}
                      onClick={() => onAdd(index)}
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
  )
}

function ConciliationForm({ index, input, onChange, onConfirm, onCancel }) {

  const handleConfirm = async (index) => {

    console.log(input)

    await saveStatementConciled(input)

  }

  return (
    <TableRow>
      <TableCell colSpan={9} sx={{ p: 2 }}>
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={1.8}>
              <Select
                fullWidth
                size="small"
                value={input.type}
                onChange={(e) => onChange(index, 'type', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">[Selecione]</MenuItem>
                <MenuItem value="payment">Pagamento</MenuItem>
                <MenuItem value="receivement">Recebimento</MenuItem>
                <MenuItem value="transfer">Transferência</MenuItem>
              </Select>
            </Grid>

            {input.type !== '' && (
              <>
                <Grid item xs={12} sm={2.8}>
                  <AutoComplete size="small" variant="outlined" placeholder="Cliente" value={input.partner} text={(partner) => partner.userName} onChange={(partner) => onChange(index, 'partner', partner)} onSearch={getUser}>
                    {(item) => <span>{item.userName}</span>}
                  </AutoComplete>
                  <AutoComplete size="small" variant="outlined" placeholder="Categoria" value={input.partner} text={(partner) => partner.userName} onChange={(partner) => onChange(index, 'partner', partner)} onSearch={getUser}>
                    {(item) => <span>{item.userName}</span>}
                  </AutoComplete>
                </Grid>

                <Grid item xs={12} sm={1.31}>
                  <TextField fullWidth size="small" placeholder="Valor" value={input.amount} onChange={(e) => onChange(index, 'amount', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={1.31}>
                  <TextField fullWidth size="small" placeholder="Taxa" value={input.fee} onChange={(e) => onChange(index, 'fee', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={1.31}>
                  <TextField fullWidth size="small" type="number" placeholder="Desconto" value={input.discount} onChange={(e) => onChange(index, 'discount', e.target.value)} />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={1}>
              <IconButton color="success" size="small" onClick={() => handleConfirm(index)}>
                <i className="ri-check-line" />
              </IconButton>
              <IconButton color="error" size="small" onClick={() => onCancel(index)}>
                <i className="ri-close-line" />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      </TableCell>
    </TableRow>
  )
}