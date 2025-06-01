'use client'

import { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

const AddUserDrawer = ({ open, handleClose, userData, setData }) => {
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    role: 'subscriber',
    status: 'active',
    currentPlan: 'basic',
    avatar: ''
  })

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    const newUser = {
      id: userData.length + 1,
      ...form
    }

    setData([...userData, newUser])
    handleClose()
    setForm({
      fullName: '',
      username: '',
      email: '',
      role: 'subscriber',
      status: 'active',
      currentPlan: 'basic',
      avatar: ''
    })
  }

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <Box sx={{ width: 350, p: 4 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Typography variant='h6'>Adicionar usuário</Typography>
          <IconButton onClick={handleClose}>
            <i className='ri-close-line text-xl' />
          </IconButton>
        </Box>

        <Box display='flex' flexDirection='column' gap={2}>
          <TextField
            label='Nome completo'
            name='fullName'
            value={form.fullName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label='Username'
            name='username'
            value={form.username}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label='Email'
            name='email'
            value={form.email}
            onChange={handleChange}
            fullWidth
          />

          <Button variant='contained' onClick={handleSubmit}>
            Salvar
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default AddUserDrawer