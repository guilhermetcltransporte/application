'use client'

import { useState, useRef } from 'react'

import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@mui/material'
import { AutoComplete } from '@/components/AutoComplete'
import { getBankAccounts } from '@/utils/search'

export default function ExtratoScreen() {
  const [open, setOpen] = useState(false)
  const [uploadType, setUploadType] = useState(null)
  const [droppedFile, setDroppedFile] = useState(null)
  const [isHovering, setIsHovering] = useState(false)
  const [bancoInput, setBancoInput] = useState('')
  const [selectedExtrato, setSelectedExtrato] = useState(null)

  const inputFileRef = useRef(null)

  // Lista fake de extratos já existentes (tabela principal)
  const [extratos, setExtratos] = useState([
    { id: 1, banco: 'Banco A', tipo: 'Integração Bancária', data: '2025-05-30' },
    { id: 2, banco: 'Banco B', tipo: 'Arquivo OFX', data: '2025-05-29' },
  ])

  // Lista fake para integração bancária (para seleção)
  const extratosIntegracao = [
    { id: 101, banco: 'Banco A', descricao: 'Extrato Jan 2025', data: '2025-01-31' },
    { id: 102, banco: 'Banco A', descricao: 'Extrato Fev 2025', data: '2025-02-28' },
    { id: 103, banco: 'Banco B', descricao: 'Extrato Mar 2025', data: '2025-03-31' },
  ]

  const handleClickUploadArea = () => {
    inputFileRef.current?.click()
  }

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.ofx')) {
      setDroppedFile(file)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file && file.name.endsWith('.ofx')) {
      setDroppedFile(file)
    }
    setIsHovering(false)
  }

  const handleEnviar = () => {
    if (!bancoInput) {
      alert('Informe o banco antes de enviar.')
      return
    }

    if (uploadType === 'integracao' && !selectedExtrato) {
      alert('Selecione um extrato para continuar.')
      return
    }

    if (uploadType === 'ofx' && !droppedFile) {
      alert('Selecione ou arraste um arquivo OFX.')
      return
    }

    // Simular inclusão do extrato na tabela principal
    const newExtrato = {
      id: extratos.length + 1,
      banco: bancoInput,
      tipo: uploadType === 'integracao' ? 'Integração Bancária' : 'Arquivo OFX',
      data: new Date().toISOString().split('T')[0],
    }
    setExtratos((old) => [...old, newExtrato])

    // Resetar estados e fechar drawer
    setDroppedFile(null)
    setBancoInput('')
    setUploadType('integracao')
    setSelectedExtrato(null)
    setOpen(false)
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Extratos Bancários
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Novo Extrato
      </Button>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Banco</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {extratos.map((ext) => (
              <TableRow key={ext.id}>
                <TableCell>{ext.id}</TableCell>
                <TableCell>{ext.banco}</TableCell>
                <TableCell>{ext.tipo}</TableCell>
                <TableCell>{ext.data}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        anchor="right"
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: 300, sm: 450 },
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          },
        }}
      >
        {/* Cabeçalho */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
            pl: 1,
            pr: 1,
          }}
        >
          <Typography variant="h5">Novo Extrato</Typography>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <i className="ri-close-line text-2xl" />
          </IconButton>
        </Box>

        <Divider />

        {/* Conteúdo */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pt: 2 }}>
          <AutoComplete
            label='Conta bancária'
            //value={values.user}
            text={(item) => item?.agency}
            //onChange={(val) => {
            //  setFieldValue('user', val)
            //  setTouched({ ...touched, user: true })
            //}}
            //onBlur={() => setTouched({ ...touched, user: true })}
            onSearch={getBankAccounts}
            //error={touched.user && Boolean(errors.user)}
            //helperText={touched.user && errors.user}
            //disabled={companyUserId}
          >
            {(item) => <span>{item.agency}</span>}
          </AutoComplete>

          <FormControl>
            <FormLabel>Tipo de importação</FormLabel>
            <RadioGroup
              row
              value={uploadType}
              onChange={(e) => {
                setUploadType(e.target.value)
                setDroppedFile(null)
                setSelectedExtrato(null)
              }}
            >
              <FormControlLabel
                value="integracao"
                control={<Radio />}
                label="Integração Bancária"
              />
              <FormControlLabel value="ofx" control={<Radio />} label="Arquivo OFX" />
            </RadioGroup>
          </FormControl>

          {/* Aba integração bancária */}
          {uploadType === 'integracao' && (
            <>
              <Typography sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Selecione um extrato para continuar:
              </Typography>

              <Paper variant="outlined" sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Banco</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Data</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {extratosIntegracao.map((item) => (
                      <TableRow
                        key={item.id}
                        hover
                        selected={selectedExtrato?.id === item.id}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setSelectedExtrato(item)}
                      >
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.banco}</TableCell>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell>{item.data}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              {selectedExtrato && (
                <Typography sx={{ mt: 2, fontWeight: 'medium' }}>
                  Selecionado: <strong>{selectedExtrato.descricao}</strong> do banco{' '}
                  <strong>{selectedExtrato.banco}</strong>
                </Typography>
              )}
            </>
          )}

          {/* Aba OFX */}
          {uploadType === 'ofx' && (
            <>
              <input
                type="file"
                accept=".ofx"
                ref={inputFileRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />

              <Box
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsHovering(true)
                }}
                onDragLeave={() => setIsHovering(false)}
                onClick={handleClickUploadArea}
                sx={{
                  mt: 3,
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  padding: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  backgroundColor: isHovering ? '#f5f5f5' : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {droppedFile ? (
                  <>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Arquivo pronto para envio!
                    </Typography>
                    <Typography>
                      <strong>Nome:</strong> {droppedFile.name}
                    </Typography>
                    <Typography>
                      <strong>Tamanho:</strong> {(droppedFile.size / 1024).toFixed(2)} KB
                    </Typography>
                    <Typography>
                      <strong>Tipo:</strong> {droppedFile.type || 'Desconhecido'}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setDroppedFile(null)
                      }}
                    >
                      Remover arquivo
                    </Button>
                  </>
                ) : isHovering ? (
                  <Typography>Arraste e solte um arquivo .OFX aqui</Typography>
                ) : (
                  <Typography>Clique para selecionar um arquivo .OFX</Typography>
                )}
              </Box>
            </>
          )}
        </Box>

        {/* Rodapé */}
        <Box
          sx={{
            pt: 2,
            borderTop: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="contained"
            disabled={
              (uploadType === 'ofx' && !droppedFile) ||
              (uploadType === 'integracao' && !selectedExtrato)
            }
            onClick={handleEnviar}
          >
            Enviar
          </Button>
        </Box>
      </Drawer>
    </>
  )
}
