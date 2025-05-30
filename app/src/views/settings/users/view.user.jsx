'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Backdrop from '@mui/material/Backdrop'

// Third-party Imports
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

// Components
import { AutoComplete } from '@/components/AutoComplete'
import { getUser } from '@/utils/search'
import { getCompanyUser, setCompanyUser } from './view.user.controller'

export const ViewUser = ({ companyUserId, onClose, onSubmit }) => {
  const [initialUser, setInitialUser] = useState(null)
  const [shouldReset, setShouldReset] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {

        setLoading(true)
        setShouldReset(true)

        if (companyUserId) {
          const userData = await getCompanyUser({ id: companyUserId })
          setInitialUser(userData?.user || null)
        }

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [companyUserId])

  const handleSubmit = async (values, { resetForm }) => {
    const user = await setCompanyUser({ companyUserId, ...values })
    onClose(onSubmit(user))
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
        <CircularProgress color='inherit' />
        <Typography variant="h6" sx={{ mt: 2, color: '#fff' }}>
          Carregando...
        </Typography>
      </Backdrop>

      <Drawer
        open={companyUserId !== undefined && !loading}
        anchor='right'
        variant='temporary'
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <div className='flex items-center justify-between pli-5 plb-4'>
          <Typography variant='h5'>Adicionar usuário</Typography>
          <IconButton size='small' onClick={onClose}>
            <i className='ri-close-line text-2xl' />
          </IconButton>
        </div>

        <Divider />

        <div className='p-5'>
          <Formik
            enableReinitialize
            initialValues={{ user: initialUser }}
            validationSchema={Yup.object({})}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue, setTouched, resetForm }) => {
              useEffect(() => {
                if (shouldReset) {
                  resetForm()
                  setShouldReset(false)
                }
              }, [shouldReset])

              return (
                <Form className='flex flex-col gap-5'>
                  <AutoComplete
                    label='Usuário'
                    value={values.user}
                    text={(item) => item?.userName}
                    onChange={(val) => {
                      setFieldValue('user', val)
                      setTouched({ ...touched, user: true })
                    }}
                    onBlur={() => setTouched({ ...touched, user: true })}
                    onSearch={getUser}
                    error={touched.user && Boolean(errors.user)}
                    helperText={touched.user && errors.user}
                  >
                    {(item) => <span>{item.userName}</span>}
                  </AutoComplete>

                  <Divider />

                  <div className='flex items-center gap-4'>
                    <Button variant='contained' type='submit' color='success'>
                      Confirmar
                    </Button>
                  </div>
                </Form>
              )
            }}
          </Formik>
        </div>
      </Drawer>
    </>
  )
}