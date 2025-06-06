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
  CircularProgress,
  Typography,
  DialogActions,
  Select,
  MenuItem,
  TextField,
  Paper,
  Grid,
  Backdrop,
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
  const [editingConciled, setEditingConciled] = useState({})

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
    if (editingConciled[idx]) {
      // Atualiza os valores do registro que está sendo editado
      setEditingConciled((prev) => ({
        ...prev,
        [idx]: {
          ...prev[idx],
          values: { ...prev[idx].values, [field]: value },
        },
      }))
    } else {
      // Atualiza o novo registro que está sendo adicionado
      setNewConciledInput((prev) => ({
        ...prev,
        [idx]: { ...prev[idx], [field]: value },
      }))
    }
  }

  // Atualiza o statement no estado após salvar um registro novo ou editado
  const updateStatementAfterSave = (idx, updatedConciled, editIndex = null) => {
    const updated = [...statement.statementData]
    if (editIndex !== null) {
      updated[idx].concileds[editIndex] = updatedConciled
    } else {
      updated[idx].concileds.push(updatedConciled)
    }
    setStatement({ ...statement, statementData: updated })
  }

  const handleCancelConciledEdit = (idx) => {
    setEditingConciled((prev) => {
      const copy = { ...prev }
      delete copy[idx]
      return copy
    })
  }

  const handleCancelConciledAdd = (idx) => {
    setNewConciledInput((prev) => {
      const copy = { ...prev }
      delete copy[idx]
      return copy
    })
  }

  return (
    <>
      {loading && (
        <Backdrop open={true} sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: '#fff' }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2, color: '#fff' }}>
            Carregando...
          </Typography>
        </Backdrop>
      )}

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
                    <TableCell>{data.amount?.toFixed(2)}</TableCell>
                    <TableCell>{data.fee?.toFixed(2)}</TableCell>
                    <TableCell>{data.credit?.toFixed(2)}</TableCell>
                    <TableCell>{data.debit?.toFixed(2)}</TableCell>
                    <TableCell>{data.balance?.toFixed(2)}</TableCell>
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
                      editing={editingConciled[index]}
                      onAdd={handleAddConciled}
                      onChange={handleInputChange}
                      onConfirm={async (input, editIndex = null) => {
                        try {
                          const saved = await saveStatementConciled(data.id, input)
                          updateStatementAfterSave(index, saved, editIndex)
                          if (editIndex !== null) {
                            handleCancelConciledEdit(index)
                          } else {
                            handleCancelConciledAdd(index)
                          }
                        } catch (error) {
                          toast.error(error.message)
                        }
                      }}
                      onCancelAdd={handleCancelConciledAdd}
                      onCancelEdit={handleCancelConciledEdit}
                      onStartEdit={(editIndex, item) =>
                        setEditingConciled((prev) => ({
                          ...prev,
                          [index]: {
                            editIndex,
                            values: { ...item },
                          },
                        }))
                      }
                    />
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="primary" sx={{ mt: 4 }} onClick={onClose}>
            Desconciliar
          </Button>
          <Button variant="contained" color="success" sx={{ mt: 4 }} onClick={onClose}>
            Conciliar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function ExpandedRow({
  index,
  data,
  input,
  editing,
  onAdd,
  onChange,
  onConfirm,
  onCancelAdd,
  onCancelEdit,
  onStartEdit,
}) {
  return (
    <TableRow>
      <TableCell colSpan={9} sx={{ p: 0 }}>
        <Collapse in={true}>
          <Table size="small" sx={{ mb: 1 }}>
            <TableBody>
              {(data.concileds || []).map((item, i) =>
                editing?.editIndex === i ? (
                  <ConciliationForm
                    key={`edit-${i}`}
                    statementDataId={data.id}
                    index={index}
                    input={editing.values}
                    onChange={onChange}
                    onConfirm={() => onConfirm(editing.values, i)}
                    onCancel={() => onCancelEdit(index)}
                  />
                ) : (
                  <TableRow key={i}>
                    <TableCell style={{ width: '120px' }}>{item.id}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.amount?.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => onStartEdit(i, item)}>
                        <i className="ri-pencil-line" />
                      </IconButton>
                      <IconButton size="small" onClick={() => alert('Implementar exclusão')}>
                        <i className="ri-delete-bin-line" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              )}

              {/* MOSTRA O FORMULÁRIO DE ADICIONAR APENAS SE NÃO ESTIVER EDITANDO */}
              {!editing && (
                input ? (
                  <ConciliationForm
                    statementDataId={data.id}
                    index={index}
                    input={input}
                    onChange={onChange}
                    onConfirm={() => onConfirm(input)}
                    onCancel={() => onCancelAdd(index)}
                  />
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
                )
              )}
            </TableBody>
          </Table>
        </Collapse>
      </TableCell>
    </TableRow>
  )
}

function ConciliationForm({ statementDataId, index, input, onChange, onConfirm, onCancel }) {
  const [localInput, setLocalInput] = useState(input || {})
  const [localLoading, setLocalLoading] = useState(false)

  useEffect(() => {
    setLocalInput(input || {})
  }, [input])

  const handleChange = (field, value) => {
    const updated = { ...localInput, [field]: value }
    setLocalInput(updated)
    onChange(index, field, value)
  }

  const handleConfirm = async () => {
    setLocalLoading(true)
    try {
      await onConfirm()
    } finally {
      setLocalLoading(false)
    }
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
                value={localInput.type || ''}
                onChange={(e) => handleChange('type', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">[Selecione]</MenuItem>
                <MenuItem value="payment">Pagamento</MenuItem>
                <MenuItem value="receivement">Recebimento</MenuItem>
                <MenuItem value="transfer">Transferência</MenuItem>
              </Select>
            </Grid>

            {localInput.type !== '' && (
              <>
                <Grid item xs={12} sm={2.8}>
                  <AutoComplete
                    size="small"
                    variant="outlined"
                    placeholder="Cliente"
                    value={localInput.partner}
                    text={(partner) => partner.userName}
                    onChange={(partner) => handleChange('partner', partner)}
                    onSearch={getUser}
                  >
                    {(item) => <span>{item.userName}</span>}
                  </AutoComplete>

                  <AutoComplete
                    size="small"
                    variant="outlined"
                    placeholder="Categoria"
                    value={localInput.category}
                    text={(cat) => cat.name}
                    onChange={(cat) => handleChange('category', cat)}
                    onSearch={getUser}
                  >
                    {(item) => <span>{item.name}</span>}
                  </AutoComplete>
                </Grid>

                <Grid item xs={12} sm={1.31}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Valor"
                    value={localInput.amount || ''}
                    onChange={(e) => handleChange('amount', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={1.31}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Taxa"
                    value={localInput.fee || ''}
                    onChange={(e) => handleChange('fee', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={1.31}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Desconto"
                    value={localInput.discount || ''}
                    onChange={(e) => handleChange('discount', e.target.value)}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={1}>
              <IconButton color="success" size="small" onClick={handleConfirm} disabled={localLoading}>
                {localLoading ? <CircularProgress size={18} /> : <i className="ri-check-line" />}
              </IconButton>
              <IconButton color="error" size="small" onClick={onCancel} disabled={localLoading}>
                <i className="ri-close-line" />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      </TableCell>
    </TableRow>
  )
}