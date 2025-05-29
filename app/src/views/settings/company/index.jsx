'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import { onSubmit } from './AccountDetails.Controller'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import Swal from 'sweetalert2'

// React Imports
import { useState } from 'react'

import CardHeader from '@mui/material/CardHeader'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'

const AccountDetails = ({company}) => {

  const handleSubmit = async (values) => {
    try {

      await onSubmit(values)

      await Swal.fire({
        icon: 'success',
        text: 'Salvo com sucesso!'
      })

    } catch (error) {
      alert(error.message)
    }
  }

  const validationSchema = Yup.object({
    cnpj: Yup.string().required('Campo obrigatório'),
    name: Yup.string().required('Campo obrigatório'),
    surname: Yup.string().required('Campo obrigatório'),
  })

  return (
    <>
      <Card>
        <CardContent className='mbe-5'>
          <div className='flex max-sm:flex-col items-center gap-6'>
            <img height={100} width={100} className='rounded' src={'/images/avatars/1.png'} alt='Profile' />
            <div className='flex flex-grow flex-col gap-4'>
              <div className='flex flex-col sm:flex-row gap-4'>
                <Button component='label' variant='text' htmlFor='account-settings-upload-image'>
                  Alterar logo
                  <input
                    hidden
                    type='file'
                    accept='image/png, image/jpeg'
                    id='account-settings-upload-image'
                  />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardContent>
          <Formik
            initialValues={{
              cnpj: company?.cnpj || '',
              name: company?.name || '',
              surname: company?.surname || '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Field name="cnpj">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="CNPJ"
                          variant="filled"
                          error={!!errors.cnpj && touched.cnpj}
                          helperText={touched.cnpj && errors.cnpj}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Field name="name">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Razão social"
                          variant="filled"
                          error={!!errors.name && touched.name}
                          helperText={touched.name && errors.name}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Field name="surname">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Nome fantasia"
                          variant="filled"
                          error={!!errors.surname && touched.surname}
                          helperText={touched.surname && errors.surname}
                        />
                      )}
                    </Field>
                  </Grid>

                  <div className="divider"></div>

                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </Grid>
                  
                </Grid>

              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </>

  )
}

const AccountDelete = () => {
  // States
  const [open, setOpen] = useState(false)

  // Hooks
  const {
    control,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { checkbox: false } })

  // Vars
  const checkboxValue = watch('checkbox')

  const onSubmit = () => {
    setOpen(true)
  }

  return (
    <Card>
      <CardHeader title='Excluir empresa' className='pbe-6' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl error={Boolean(errors.checkbox)} className='is-full mbe-6'>
            <Controller
              name='checkbox'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControlLabel control={<Checkbox {...field} />} label='Confirmo a desativação da minha conta' />
              )}
            />
            {errors.checkbox && <FormHelperText error>Por favor, confirme que você deseja excluir a empresa</FormHelperText>}
          </FormControl>
          <Button variant='contained' color='error' type='submit' disabled={!checkboxValue}>
            Desativar empresa
          </Button>
          <ConfirmationDialog open={open} setOpen={setOpen} type='delete-account' />
        </form>
      </CardContent>
    </Card>
  )
}

const Company = ({company}) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AccountDetails company={company} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AccountDelete />
      </Grid>
    </Grid>
  )
}

export default Company
