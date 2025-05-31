'use client'

import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import { useSession } from 'next-auth/react'

const CompanySwitcherDropdown = () => {

    const session = useSession()

  // Dados das empresas e filiais
  const companies = [
    {
      id: '1',
      name: 'Empresa Exemplo Ltda',
      branches: [
        { id: '10', name: 'Filial São Paulo' },
        { id: '11', name: 'Filial Rio' }
      ]
    },
    {
      id: '2',
      name: 'Outra Empresa S.A.',
      branches: [
        { id: '20', name: 'Filial Belo Horizonte' }
      ]
    }
  ]

  // Estado inicial baseado na primeira empresa e sua primeira filial
  const [company, setCompany] = useState(companies[0])
  const [branch, setBranch] = useState(companies[0].branches[0])

  // Controle do dropdown
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleOpen = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  // Troca de empresa
  const handleChangeCompany = (newCompanyId) => {
    const selectedCompany = companies.find(c => c.id === newCompanyId)
    if (selectedCompany) {
      setCompany(selectedCompany)
      // Seleciona a primeira filial da empresa automaticamente
      setBranch(selectedCompany.branches[0])
    }
    handleClose()
  }

  // Troca de filial
  const handleChangeBranch = (newBranchId) => {
    const selectedBranch = company.branches.find(b => b.id === newBranchId)
    if (selectedBranch) {
      setBranch(selectedBranch)
    }
    handleClose()
  }

  return (
    <>
      <Box
        className='flex items-center gap-2 cursor-pointer select-none'
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='body1' fontWeight={600}>
            {session.data.company.companyBusiness.description}
          </Typography>
          <Typography variant='body1' sx={{ mx: 1 }}>
            /
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {session.data.company.surname}
          </Typography>
        </Box>

        <Tooltip title="Mudar empresa/filial">
          <IconButton size="small" onClick={handleOpen}>
            <i className="ri-arrow-down-s-line" style={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            minWidth: 300,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography variant='subtitle1' sx={{ px: 2, pt: 1 }}>
          Empresa
        </Typography>
        {companies.map((c) => (
          <MenuItem
            key={c.id}
            selected={c.id === company.id}
            onClick={() => handleChangeCompany(c.id)}
          >
            {c.name}
          </MenuItem>
        ))}

        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1 }} />

        <Typography variant='subtitle1' sx={{ px: 2, pt: 1 }}>
          Filial
        </Typography>
        {(company.branches || []).map((b) => (
          <MenuItem
            key={b.id}
            selected={b.id === branch.id}
            onClick={() => handleChangeBranch(b.id)}
          >
            {b.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default CompanySwitcherDropdown