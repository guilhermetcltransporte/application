'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

import { useState, useRef } from 'react'
import { Typography, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'


import { ViewAddStatement } from './view.add-statement'
import { getStatements } from './index.controller'
import { format, fromZonedTime } from 'date-fns-tz'

function ExtratoScreen({initialStatements}) {
  
  const [open, setOpen] = useState(false)

  const [statements, setStatements] = useState([...initialStatements])

  const fetch = async () => {
    const statements = await getStatements()
    setStatements(statements)
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Extratos
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        startIcon={<i className="ri-add-circle-line" />}
        onClick={() => setOpen(true)}
      >
        Adicionar
      </Button>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Banco</TableCell>
              <TableCell>Inicio</TableCell>
              <TableCell>Fim</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {statements.map((statement, index) => (
              <TableRow key={index}>
                <TableCell>{statement.sourceId}</TableCell>
                <TableCell>
                  <div className="flex items-start space-x-2">
                    {statement.bankAccount.bank?.icon && (
                    <img
                        src={statement.bankAccount.bank.icon}
                        alt={statement.bankAccount.bank.description}
                        className="mt-1 w-[1.725rem] h-[1.725rem]"
                    />
                    )}
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">{statement.bankAccount.bank.description}</span>
                      <span>Agência: {statement.bankAccount.agency} / Conta: {statement.bankAccount.number}</span>
                    </div>
                </div>
                </TableCell>
                <TableCell>{format(statement.begin, 'dd/MM/yyyy HH:mm')}</TableCell>
                <TableCell>{format(statement.end, 'dd/MM/yyyy HH:mm')}</TableCell>
                <TableCell>
                  {statement.isActive ? 'Pendente' : 'Excluído'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <ViewAddStatement
        open={open}
        setOpen={setOpen}
        onSubmit={() => {
          fetch()
        }}
      />
    </>
  )
}

export const ViewFinancesStatements = ({ initialStatements }) => {
  console.log(initialStatements)
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ExtratoScreen initialStatements={initialStatements} />
      </Grid>
    </Grid>
  )
}