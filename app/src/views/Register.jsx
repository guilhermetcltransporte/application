'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Alert, CircularProgress } from '@mui/material'

// Third-party Imports
import classnames from 'classnames'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { checkUserExists, getCompanyByCNPJ, onRegister } from './Register.controller'
import { toast } from 'react-toastify'
import { signIn } from 'next-auth/react'
import Swal from 'sweetalert2'

const Register = ({ mode }) => {
  const router = useRouter()
  const { settings } = useSettings()
  const { lang: locale } = useParams()

  const [errorState, setErrorState] = useState(null)
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [descriptionDisabled, setDescriptionDisabled] = useState(false)
  const [showRestForm, setShowRestForm] = useState(false)
  const [loadingCompany, setLoadingCompany] = useState(false)
  const [empresaEncontrada, setEmpresaEncontrada] = useState(null)

  const darkImg = '/images/pages/auth-v2-mask-2-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-2-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const userNameRef = useRef(null)
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const initialValues = {
    cnpj: '',
    description: '',
    userName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  }

  const validationSchema = Yup.object({
    cnpj: Yup.string().required('CNPJ é obrigatório'),
    userName: Yup.string().required('Usuário é obrigatório'),
    description: Yup.string().required('Nome empresa é obrigatório'),
    password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Senha é obrigatória'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Senhas não coincidem')
      .required('Confirme a senha'),
    acceptTerms: Yup.boolean().oneOf([true], 'É necessário aceitar os termos')
  })

  const handleRegister = async (values, { setFieldError }) => {
    try {
      setErrorState(null)
      const exists = await checkUserExists(values.userName)

      if (exists) {
        setFieldError('userName', 'Usuário já existe!')
        return
      }

      const response = await onRegister(values)

      const loginRes = await signIn('credentials', {
        email: values.userName,
        password: values.password,
        companyBusinessId: response.companyId,
        companyId: response.companyBusinessId,
        redirect: false
      })

      if (loginRes?.ok && !loginRes.error) {
        Swal.fire({
          icon: 'success',
          title: 'Cadastrado com sucesso!',
          text: 'Seja bem-vindo! Estamos felizes em ter você conosco.',
          confirmButtonText: 'Vamos lá 🚀',
          confirmButtonColor: '#4CAF50'
        })

        router.replace('/')
      } else {
        if (JSON.parse(loginRes.error).status == 214) {
          Swal.fire({
            icon: 'info',
            title: 'Quase lá',
            text: 'Agora aguarde seu cadastro ser aprovado pela empresa!',
            confirmButtonText: 'OK',
            confirmButtonColor: '#4CAF50'
          })

          router.replace(`login`)
          return
        }

        setErrorState(loginRes.message)
      }
    } catch (error) {
      setErrorState(error.message)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          { 'border-ie': settings.skin === 'bordered' }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[650px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>

      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale)}
          className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>

        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div>
            <Typography variant='h4'>A aventura começa aqui 🚀</Typography>
            <Typography className='mbs-1'>Gerenciamento da sua empresa fácil e divertido!</Typography>
          </div>

          {errorState && <Alert severity='warning'>{errorState}</Alert>}

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleRegister}>
            {({ errors, touched, values, setFieldValue, isSubmitting }) => {
              useEffect(() => {
                const cnpj = values.cnpj.replace(/\D/g, '')

                if (cnpj.length < 14) {
                  setShowRestForm(false)
                  setEmpresaEncontrada(null)
                  setFieldValue('description', '')
                  setDescriptionDisabled(false)
                  return
                }

                const fetchCompany = async () => {
                  setLoadingCompany(true)

                  try {
                    const result = await getCompanyByCNPJ(values.cnpj)

                    if (result.exists) {
                      setFieldValue('description', result.name)
                      setDescriptionDisabled(true)
                      setEmpresaEncontrada(true)
                      userNameRef.current?.focus()
                    } else {
                      setFieldValue('description', '')
                      setDescriptionDisabled(false)
                      setEmpresaEncontrada(false)
                    }

                    setShowRestForm(true)
                  } catch (e) {
                    setEmpresaEncontrada(null)
                    setShowRestForm(false)
                    toast.error('Erro ao buscar empresa.', { theme: 'colored' })
                  }

                  setLoadingCompany(false)
                }

                fetchCompany()
              }, [values.cnpj, setFieldValue])

              return (
                <Form className='flex flex-col gap-5' noValidate>
                  <Field name='cnpj'>
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant='filled'
                        label='CNPJ'
                        inputProps={{ maxLength: 14 }}
                        error={touched.cnpj && Boolean(errors.cnpj)}
                        helperText={touched.cnpj && errors.cnpj}
                        slotProps={{
                          inputLabel: { shrink: true }
                        }}
                        autoFocus
                        InputProps={{
                          endAdornment: loadingCompany && (
                            <InputAdornment position='end'>
                              <CircularProgress size={20} />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  </Field>

                  {showRestForm && (
                    <>
                      <Field name='description'>
                        {({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            variant='filled'
                            label='Nome empresa'
                            error={touched.description && Boolean(errors.description)}
                            helperText={touched.description && errors.description}
                            slotProps={{ inputLabel: { shrink: true } }}
                            disabled={descriptionDisabled}
                            onChange={e => {
                              const upperValue = e.target.value.toUpperCase()
                              setFieldValue('description', upperValue)
                            }}
                            InputProps={{
                              style: { textTransform: 'uppercase' }
                            }}
                          />
                        )}
                      </Field>

                      <Field name='userName'>
                        {({ field }) => (
                          <TextField
                            {...field}
                            inputRef={userNameRef}
                            fullWidth
                            variant='filled'
                            label='Usuário'
                            error={touched.userName && Boolean(errors.userName)}
                            helperText={touched.userName && errors.userName}
                            slotProps={{ inputLabel: { shrink: true } }}
                          />
                        )}
                      </Field>

                      <Field name='password'>
                        {({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            variant='filled'
                            label='Senha'
                            type={isPasswordShown ? 'text' : 'password'}
                            error={touched.password && Boolean(errors.password)}
                            helperText={touched.password && errors.password}
                            slotProps={{
                              inputLabel: { shrink: true },
                              input: {
                                endAdornment: (
                                  <InputAdornment position='end'>
                                    <IconButton
                                      edge='end'
                                      onClick={handleClickShowPassword}
                                      onMouseDown={e => e.preventDefault()}
                                      tabIndex={-1}
                                    >
                                      <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        )}
                      </Field>

                      <Field name='confirmPassword'>
                        {({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            variant='filled'
                            label='Confirmar senha'
                            type={isPasswordShown ? 'text' : 'password'}
                            error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                            helperText={touched.confirmPassword && errors.confirmPassword}
                            slotProps={{ inputLabel: { shrink: true } }}
                          />
                        )}
                      </Field>

                      <FormControlLabel
                        control={
                          <Field name='acceptTerms' type='checkbox'>
                            {({ field }) => (
                              <Checkbox
                                {...field}
                                checked={values.acceptTerms}
                                onChange={e => setFieldValue('acceptTerms', e.target.checked)}
                              />
                            )}
                          </Field>
                        }
                        label={
                          <>
                            <span>Concordo com a </span>
                            <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                              política de privacidade e os termos
                            </Link>
                          </>
                        }
                      />
                      {touched.acceptTerms && errors.acceptTerms && (
                        <Typography variant='caption' sx={{ color: 'red' }}>
                          {errors.acceptTerms}
                        </Typography>
                      )}

                      <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
                        {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                      </Button>
                    </>
                  )}

                  <div className='flex justify-center items-center flex-wrap gap-2'>
                    <Typography>Já tem uma conta?</Typography>
                    <Typography component={Link} href='/login' color='primary.main'>
                      Em vez disso, faça login
                    </Typography>
                  </div>
                </Form>
              )
            }}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default Register