import { AutoComplete } from "@/components/AutoComplete";
import { getPaymentMethod } from "@/utils/search";
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { Formik, Form } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { getPayment, savePayment } from "./view.payment-installment.controller";

export const ViewPaymentInstallment = ({ installmentId, onClose, onSave }) => {

  const [errorState, setErrorState] = useState(null);

  const [loading, setLoading] = useState(false);
  const [installment, setInstallment] = useState(null);

  useEffect(() => {

    const fetchPayment = async () => {
      try {
        setErrorState(null);
        setLoading(true);

        if (installmentId) {
          const payment = await getPayment({ installmentId }); // Certifique-se de passar o ID correto
          setInstallment(payment || null);
        } else {
          setInstallment(null);
        }
      } catch (error) {
        setErrorState(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();

  }, [installmentId]);

  const initialValues = {
    amount: installment?.amount || 0,
    paymentMethod: installment?.paymentMethod || null,
    digitableLine: installment?.boleto?.digitableLine || "",
    dueDate: installment?.boleto?.dueDate || "",
    boletoNumber: installment?.boleto?.number || "",
  };

  const validationSchema = Yup.object({
    amount: Yup.number().min(0, "Valor inválido").required("Obrigatório"),
    paymentMethod: Yup.object().nullable().required("Forma de pagamento obrigatória")
  });

  const handleSubmit = async (values) => {

    values.codigo_movimento_detalhe = installmentId

    values.paymentMethodId = values.paymentMethod?.id || null

    const installment = await savePayment(values)

    onClose(installment)

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
        open={installmentId !== undefined && !loading}
        onClose={onClose}
        aria-labelledby="edit-amount-dialog-title"
        maxWidth="xs"
        fullWidth
      >

        <DialogTitle id="edit-amount-dialog-title">Editar</DialogTitle>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, setFieldValue }) => (
            <Form>
              <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Parcela:</strong> #{installment?.financialMovement?.documentNumber} - {installment?.installment}
                </Typography>

                <TextField
                  label="Valor"
                  type="number"
                  fullWidth
                  margin="dense"
                  size="small"
                  name="amount"
                  value={values.amount}
                  onChange={handleChange}
                  error={touched.amount && Boolean(errors.amount)}
                  helperText={touched.amount && errors.amount}
                />

                <AutoComplete
                  name="paymentMethod"
                  size="small"
                  label="Forma de pagamento"
                  value={values.paymentMethod}
                  text={(paymentMethod) => paymentMethod?.name}
                  onChange={(paymentMethod) => {
                    setFieldValue("paymentMethod", paymentMethod);
                  }}
                  onSearch={getPaymentMethod}
                  error={touched.paymentMethod && Boolean(errors.paymentMethod)}
                  helperText={touched.paymentMethod && errors.paymentMethod}
                >
                  {(item) => <span>{item.name}</span>}
                </AutoComplete>

                  {/*
                <TextField
                  label="Linha digitável"
                  fullWidth
                  margin="dense"
                  size="small"
                  name="digitableLine"
                  value={values.digitableLine}
                  onChange={handleChange}
                />

                <TextField
                  label="Data de vencimento"
                  type="date"
                  fullWidth
                  margin="dense"
                  size="small"
                  name="dueDate"
                  InputLabelProps={{ shrink: true }}
                  value={values.dueDate}
                  onChange={handleChange}
                />

                <TextField
                  label="Nosso número / Nº do boleto"
                  fullWidth
                  margin="dense"
                  size="small"
                  name="boletoNumber"
                  value={values.boletoNumber}
                  onChange={handleChange}
                />
                    */}

              </DialogContent>

              <DialogActions>
                {/*
                <Button onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  Salvar
                </Button>
                */}
              </DialogActions>
            </Form>
          )}
        </Formik>
    
      </Dialog>

    </>

  )

}