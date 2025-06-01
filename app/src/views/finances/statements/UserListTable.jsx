'use client'

import { useState, useRef } from 'react'
import { Formik, Form } from 'formik'
import * as yup from 'yup'

import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  Divider,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Radio,
} from '@mui/material'

import { AutoComplete } from '@/components/AutoComplete'
import { getBankAccounts } from '@/utils/search'
import { PluginRenderer } from '@/views/settings/integrations/plugins'

export default function ExtratoScreen() {
  const [integrationId, setIntegrationId] = useState(null)
  const [open, setOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const inputFileRef = useRef(null)

  const [extratos, setExtratos] = useState([
    { id: 1, banco: 'Banco A', tipo: 'Integração Bancária', data: '2025-05-30' },
    { id: 2, banco: 'Banco B', tipo: 'Arquivo OFX', data: '2025-05-29' },
  ])

  const validationSchema = yup.object({
    uploadType: yup.string().required('Selecione o tipo de importação'),
    bankAccount: yup.object().nullable().required('Informe a conta bancária'),
  })

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Extratos Bancários
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => {
          setOpen(true)
          setIntegrationId(null)
        }}
      >
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
            width: { xs: '100%', sm: 600 },
            p: 6,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="h5">Novo Extrato</Typography>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <i className="ri-close-line text-2xl" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Formik
          initialValues={{
            uploadType: '',
            bankAccount: null,
            droppedFile: null,
            selectedExtrato: null,
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => {
            if (values.uploadType === 'integration' && !values.selectedExtrato) {
              alert('Selecione um extrato para continuar.')
              return
            }

            if (values.uploadType === 'ofx' && !values.droppedFile) {
              alert('Selecione ou arraste um arquivo OFX.')
              return
            }

            const newExtrato = {
              id: extratos.length + 1,
              banco: values.bankAccount?.agency || 'Desconhecido',
              tipo: values.uploadType === 'integration' ? 'Integração Bancária' : 'Arquivo OFX',
              data: new Date().toISOString().split('T')[0],
            }

            setExtratos((old) => [...old, newExtrato])
            resetForm()
            setIntegrationId(null)
            setOpen(false)
          }}
        >
          {({ values, errors, touched, handleChange, setFieldValue, handleSubmit, isSubmitting }) => (
            <Form
              onSubmit={handleSubmit}
              style={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                overflowY: 'auto',
                marginTop: 16,
              }}
            >
              <FormControl error={Boolean(touched.uploadType && errors.uploadType)}>
                <FormLabel>Tipo de importação</FormLabel>
                <RadioGroup
                  row
                  name="uploadType"
                  value={values.uploadType}
                  onChange={(e) => {
                    handleChange(e)
                    setFieldValue('droppedFile', null)
                    setFieldValue('selectedExtrato', null)
                  }}
                >
                  <FormControlLabel value="integration" control={<Radio />} label="Integração Bancária" />
                  <FormControlLabel value="ofx" control={<Radio />} label="Arquivo OFX" />
                </RadioGroup>
                {touched.uploadType && errors.uploadType && (
                  <Typography color="error" variant="caption">
                    {errors.uploadType}
                  </Typography>
                )}
              </FormControl>

              <Box>
                <AutoComplete
                  label="Conta bancária"
                  value={values.bankAccount}
                  text={(item) => item?.agency}
                  onSearch={getBankAccounts}
                  onChange={(bankAccount) => {
                    setIntegrationId(bankAccount?.companyIntegration?.integrationId)
                    setFieldValue('selectedExtrato', null)
                    setFieldValue('bankAccount', bankAccount)
                  }}
                >
                  {(item) => <span>{item.agency}</span>}
                </AutoComplete>
                {touched.bankAccount && errors.bankAccount && (
                  <Typography color="error" variant="caption">
                    {errors.bankAccount}
                  </Typography>
                )}
              </Box>

              {values.uploadType === 'integration' && integrationId && (
                <PluginRenderer
                  pluginId={integrationId}
                  componentName="Statement"
                  data={{ companyIntegrationId: values.bankAccount.companyIntegration.id }}
                  onChange={(item) => {
                    setFieldValue('selectedExtrato', item)
                  }}
                />
              )}

              {values.uploadType === 'ofx' && (
                <>
                  <input
                    type="file"
                    accept=".ofx"
                    ref={inputFileRef}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file?.name.endsWith('.ofx')) {
                        setFieldValue('droppedFile', file)
                      }
                    }}
                  />

                  <Box
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files?.[0]
                      if (file?.name.endsWith('.ofx')) {
                        setFieldValue('droppedFile', file)
                      }
                      setIsHovering(false)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsHovering(true)
                    }}
                    onDragLeave={() => setIsHovering(false)}
                    onClick={() => inputFileRef.current?.click()}
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      padding: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isHovering ? '#f5f5f5' : 'transparent',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {values.droppedFile ? (
                      <>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          Arquivo pronto para envio!
                        </Typography>
                        <Typography>
                          <strong>Nome:</strong> {values.droppedFile.name}
                        </Typography>
                        <Typography>
                          <strong>Tamanho:</strong> {(values.droppedFile.size / 1024).toFixed(2)} KB
                        </Typography>
                        <Typography>
                          <strong>Tipo:</strong> {values.droppedFile.type || 'Desconhecido'}
                        </Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setFieldValue('droppedFile', null)
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

              <Box
                sx={{
                  pt: 3,
                  borderTop: '1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 3,
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    isSubmitting ||
                    !values.uploadType ||
                    !values.bankAccount ||
                    (values.uploadType === 'ofx' && !values.droppedFile) ||
                    (values.uploadType === 'integration' && !values.selectedExtrato)
                  }
                >
                  Confirmar
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Drawer>
    </>
  )
}
