'use client'

import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import React, { useState } from 'react'

export const ID = 'A4B0DD1D-74E7-4B22-BFAA-0A911A419B88'

// Lista fake para integração bancária (para seleção)
const extratosIntegracao = [
    { id: 101, banco: 'Banco A', descricao: 'Extrato Jan 2025', data: '2025-01-31' },
    { id: 102, banco: 'Banco A', descricao: 'Extrato Fev 2025', data: '2025-02-28' },
    { id: 103, banco: 'Banco B', descricao: 'Extrato Mar 2025', data: '2025-03-31' },
]

export const Statement = ({data}) => {

    const [selectedExtrato, setSelectedExtrato] = useState(null)

    return <div>
        Options: {data.mensagem}

        <Typography fontWeight="bold">Selecione um extrato:</Typography>

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
        <Typography variant="body2">
            Selecionado: <strong>{selectedExtrato.descricao}</strong> do banco{' '}
            <strong>{selectedExtrato.banco}</strong>
        </Typography>
        )}
    </div>
}

export const Settings = ({data}) => {
    return <div>Options: {data}</div>
}