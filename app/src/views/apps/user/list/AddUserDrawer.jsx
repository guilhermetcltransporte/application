'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

// Components
import { AutoComplete } from '@/components/AutoComplete'
import { getUser } from '@/utils/search'

const AddUserDrawer = ({ open, handleClose, userData, setData }) => {
  const [selectedUser, setSelectedUser] = useState(null)

  const initialValues = {
    fullName: '',
    username: '',
    email: '',
    role: '',
    plan: '',
    status: ''
  }

  const validationSchema = Yup.object({
    fullName: Yup.string().required('Nome é obrigatório')
    // Adicione outras validações se quiser
  })

  const onSubmit = (values, { resetForm }) => {
    const newUser = {
      id: (userData?.length && userData?.length + 1) || 1,
      avatar: `/images/avatars/${Math.floor(Math.random() * 8) + 1}.png`,
      fullName: values.fullName,
      username: values.username,
      email: values.email,
      role: values.role,
      currentPlan: values.plan,
      status: values.status,
      user: selectedUser // usuário retornado do AutoComplete
    }

    setData([...(userData ?? []), newUser])
    handleClose()
    setSelectedUser(null)
    resetForm()
  }

  const handleReset = () => {
    handleClose()
    setSelectedUser(null)
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>Adicionar usuário</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <Formik
          initialValues={{
            fullName: '',
            username: '',
            email: '',
            role: '',
            plan: '',
            status: '',
            user: null // agora é parte do form
          }}
          validationSchema={Yup.object({
            fullName: Yup.string().required('Nome é obrigatório'),
            user: Yup.object()
              .nullable()
              .required('Usuário é obrigatório')
          })}
          onSubmit={(values, { resetForm }) => {
            const newUser = {
              id: (userData?.length && userData?.length + 1) || 1,
              avatar: `/images/avatars/${Math.floor(Math.random() * 8) + 1}.png`,
              fullName: values.fullName,
              username: values.username,
              email: values.email,
              role: values.role,
              currentPlan: values.plan,
              status: values.status,
              user: values.user // totalmente vindo do formik
            }

            setData([...(userData ?? []), newUser])
            handleClose()
            resetForm()
          }}
        >
          {({ values, errors, touched, handleChange, setFieldValue, setTouched }) => (
            <Form className='flex flex-col gap-5'>

              {/* AutoComplete controlado pelo Formik */}
              <AutoComplete
                label='Usuário'
                value={values.user}
                text={(item) => item?.userName}
                onChange={(val) => {
                  setFieldValue('user', val)
                  setTouched({ ...touched, user: true }) // marca como tocado
                }}
                onSearch={getUser}
              >
                {(item) => <span>{item.userName}</span>}
              </AutoComplete>

              {/* Erro do AutoComplete */}
              {touched.user && errors.user && (
                <Typography variant='caption' color='error' sx={{ mt: -2 }}>
                  {errors.user}
                </Typography>
              )}

              <TextField
                name='fullName'
                label='Nome completo'
                variant='filled'
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={values.fullName}
                onChange={handleChange}
                error={touched.fullName && Boolean(errors.fullName)}
                helperText={touched.fullName && errors.fullName}
              />

              <div className='flex items-center gap-4'>
                <Button variant='contained' type='submit' color='success'>
                  Confirmar
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Drawer>
  )
}

export default AddUserDrawer
