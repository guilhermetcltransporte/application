import {
  Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Button, Collapse, CircularProgress, Typography,
  DialogActions, Select, MenuItem, TextField, Paper, Grid, Backdrop,
} from '@mui/material'
import { format } from 'date-fns-tz'
import { Fragment, useEffect, useState } from 'react'
import { getStatement, saveStatementConciled } from './view.statement-detail.controller'
import { toast } from 'react-toastify'
import { AutoComplete } from '@/components/AutoComplete'
import { getFinancialCategory, getPartner } from '@/utils/search'

// Formatador de moeda sem símbolo R$
const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return ''
  return new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const typeDescription = (raw) => {
  switch (raw) {
    case 'transfer': return 'Transferência'
    case 'payment': return 'Pagamento'
    case 'receivement': return 'Recebimento'
    default: return raw
  }
}

export function ViewStatementDetail({ statementId, onClose, onError }) {
  const [loading, setLoading] = useState(false)
  const [statement, setStatement] = useState(null)
  const [originalData, setOriginalData] = useState(null)
  const [entryTypeFilters, setEntryTypeFilters] = useState([])
  const [showFilterDialog, setShowFilterDialog] = useState(false)
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
          setOriginalData(statement.statementData)
          setEntryTypeFilters(statement.entryTypes ?? [])
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
      [idx]: { type: '', partner: null, category: null, amount: '', fee: '', discount: '' },
    }))
  }

  const handleInputChange = (idx, field, value) => {
    if (editingConciled[idx]) {
      setEditingConciled((prev) => ({
        ...prev,
        [idx]: {
          ...prev[idx],
          values: { ...prev[idx].values, [field]: value },
        },
      }))
    } else {
      setNewConciledInput((prev) => ({
        ...prev,
        [idx]: { ...prev[idx], [field]: value },
      }))
    }
  }

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

  const applyEntryTypeFilter = () => {
    const filteredData = originalData.filter((data) =>
      entryTypeFilters.includes(data.entryType)
    )
    setStatement((prev) => ({
      ...prev,
      entryTypes: entryTypeFilters,
      statementData: filteredData,
    }))
    setShowFilterDialog(false)
  }

  return (
    <>
      {loading && (
        <Backdrop open sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: '#fff' }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2, color: '#fff' }}>&nbsp;Carregando...</Typography>
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
                    <TableCell style={{ width: '140px' }}>{data.sourceId}</TableCell>
                    <TableCell>{format(data.entryDate, 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{data.orderId ? `Ref. pedido #${data.orderId}` : ''}</TableCell>
                    <TableCell align="right">{formatCurrency(data.amount)}</TableCell>
                    <TableCell align="right">{formatCurrency(data.fee)}</TableCell>
                    <TableCell align="right">{formatCurrency(data.credit)}</TableCell>
                    <TableCell align="right">{formatCurrency(data.debit)}</TableCell>
                    <TableCell align="right">{formatCurrency(data.balance)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => toggleExpand(index)}>
                        {expandedRow === index
                          ? <i className="ri-arrow-up-circle-line" />
                          : <i className="ri-arrow-down-circle-line" />
                        }
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
                          editIndex !== null
                            ? handleCancelConciledEdit(index)
                            : handleCancelConciledAdd(index)
                        } catch (error) {
                          toast.error(error.message)
                        }
                      }}
                      onCancelAdd={handleCancelConciledAdd}
                      onCancelEdit={handleCancelConciledEdit}
                      onStartEdit={(editIndex, item) =>
                        setEditingConciled((prev) => ({
                          ...prev,
                          [index]: { editIndex, values: { ...item } },
                        }))
                      }
                    />
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => {
              setEntryTypeFilters(statement?.entryTypes ?? [])
              setShowFilterDialog(true)
            }}
          >
            Filtrar Tipos
          </Button>
          <div>
            <Button variant="text" onClick={onClose}>Desconciliar</Button>
            <Button variant="contained" color="success" onClick={onClose} sx={{ ml: 1 }}>Conciliar</Button>
          </div>
        </DialogActions>
      </Dialog>

      {/* Filtro de Tipos */}
      <Dialog open={showFilterDialog} onClose={() => setShowFilterDialog(false)}>
        <DialogTitle>Filtrar Tipos de Lançamento</DialogTitle>
        <DialogContent>
          {statement?.allEntryTypes?.map((type) => (
            <div key={type}>
              <label>
                <input
                  type="checkbox"
                  checked={statement?.entryTypes?.includes(type) ?? false}
                  onChange={(e) => {
                    setEntryTypeFilters((prev) =>
                      e.target.checked
                        ? [...prev, type]
                        : prev.filter((t) => t !== type)
                    )
                  }}
                />
                &nbsp;{typeDescription(type)}
              </label>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFilterDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={applyEntryTypeFilter}>Aplicar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function ExpandedRow({ index, data, input, editing, onAdd, onChange, onConfirm, onCancelAdd, onCancelEdit, onStartEdit }) {
  return (
    <TableRow>
      <TableCell colSpan={9} sx={{ p: 0 }}>
        <Collapse in>
          <Table size="small" sx={{ mb: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Taxa</TableCell>
                <TableCell>Desconto</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
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
                    <TableCell>{typeDescription(item.type)}</TableCell>
                    <TableCell>{item.partnerName || item.categoryName || '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.fee)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.discount)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => onStartEdit(i, item)}>
                        <i className="ri-pencil-line" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              )}

              {input ? (
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
                  <TableCell colSpan={6}>
                    <Button onClick={() => onAdd(index)}>Adicionar Conciliado</Button>
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

function ConciliationForm({ statementDataId, index, input, onChange, onConfirm, onCancel }) {
  return (
    <TableRow>
      <TableCell>
        <Select
          value={input.type || ''}
          onChange={(e) => onChange(index, 'type', e.target.value)}
          displayEmpty
          size="small"
          fullWidth
        >
          <MenuItem value="">Selecione tipo</MenuItem>
          <MenuItem value="transfer">Transferência</MenuItem>
          <MenuItem value="payment">Pagamento</MenuItem>
          <MenuItem value="receivement">Recebimento</MenuItem>
        </Select>
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          value={input.partner || ''}
          onChange={(e) => onChange(index, 'partner', e.target.value)}
          placeholder="Parceiro ou Categoria"
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          type="number"
          value={input.amount || ''}
          onChange={(e) => onChange(index, 'amount', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          type="number"
          value={input.fee || ''}
          onChange={(e) => onChange(index, 'fee', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          type="number"
          value={input.discount || ''}
          onChange={(e) => onChange(index, 'discount', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <Button size="small" onClick={onConfirm} variant="contained" color="primary">Salvar</Button>
        <Button size="small" onClick={onCancel} variant="text" color="secondary">Cancelar</Button>
      </TableCell>
    </TableRow>
  )
}
