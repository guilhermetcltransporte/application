"use client"

import {
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
  Tooltip,
  Card,
  Box,
  CardContent,
  CardActions,
} from "@mui/material"
import React, { useState, useEffect, useRef } from "react"
import { updateInstallment } from "./index.controller"

const InstallmentCard = ({ installment, loading }) => {
  const isLate = installment.status === "overdue"
  const backgroundColor = isLate ? "#fdecea" : "white"
  const opacity = loading ? 0.5 : 1

  return (
    <Card
      variant="outlined"
      sx={{ backgroundColor, opacity, position: "relative" }}
    >
      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.6)",
            zIndex: 10,
          }}
        >
          <i className="ri-loader-4-line animate-spin text-xl text-gray-500"></i>
        </Box>
      )}

      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, padding: 2, paddingBottom: '6px !important' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <i className="ri-file-list-2-line text-base" />
          <Typography variant="body2" noWrap>
            <strong>
              #{installment.financialMovement?.documentNumber} - {installment.installment}
            </strong>
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <i className="ri-user-line text-base" />
          <Tooltip title={installment.financialMovement?.partner?.surname || ""}>
            <Typography variant="body2" noWrap>
              <strong>{installment.financialMovement?.partner?.surname}</strong>
            </Typography>
          </Tooltip>
        </Box>

        <Box display="flex" alignItems="center">
          <i className="ri-file-text-line mr-1 text-base" style={{ flexShrink: 0 }} />
          <Tooltip title={installment.description || ''}>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {installment.description}
            </Typography>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }} gap={1}>

          <Box display="flex" alignItems="center" gap={1}>
            <i className="ri-money-dollar-circle-line text-base" />
            <Typography variant="body2">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(installment.amount || 0)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <i className="ri-calendar-line text-base" />
            <Typography variant="body2">
              {installment.dueDate
                ? new Date(installment.dueDate).toLocaleDateString("pt-BR")
                : "-"}
            </Typography>
          </Box>

        </Box>
      </CardContent>
    </Card>
  )
}

const NewInstallment = ({ addInstallment }) => {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      addInstallment(input.trim())
      setInput("")
      setEditing(false)
    }
  }

  const handleCancel = () => {
    setInput("")
    setEditing(false)
  }

  if (!editing) {
    return (
      <Button
        variant="text"
        size="small"
        onClick={() => setEditing(true)}
        sx={{
          marginTop: 1,
          justifyContent: "flex-start",
          textTransform: "none",
          color: "text.secondary",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
        startIcon={<i className="ri-add-line"></i>}
      >
        Nova tarefa
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
      <TextField
        inputRef={inputRef}
        size="small"
        variant="outlined"
        placeholder="Nova tarefa"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onBlur={handleCancel}
        fullWidth
      />
    </form>
  )
}

const ColumnHeader = ({ bankAccount, onGenerateRemessa, onExportCsv }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget)
  const handleCloseMenu = () => setAnchorEl(null)

  const handleGenerateRemessaClick = () => {
    onGenerateRemessa(bankAccount.id)
    handleCloseMenu()
  }

  const handleExportCsvClick = () => {
    onExportCsv(bankAccount.id)
    handleCloseMenu()
  }

  return (
    <div className="column-header flex items-center justify-between p-2" style={{ gap: 8 }}>
      <div className="flex items-center gap-2">
        {bankAccount.bank?.icon && (
          <img src={bankAccount.bank?.icon} alt={`${bankAccount.bank?.name} icon`} style={{ width: 24, height: 24 }} />
        )}
        <div>
          <Typography fontWeight="bold">{bankAccount.bank?.name}</Typography>
          <Typography fontSize="0.85rem" color="#666">
            {bankAccount.id ? `${bankAccount.agency} / ${bankAccount.number}` : 'Títulos sem uma conta bancária vinculada'}
          </Typography>
        </div>
      </div>

      {bankAccount.id !== null && (
        <>
          <IconButton size="small" onClick={handleOpenMenu}>
            <i className="ri-more-2-line" style={{ fontSize: 20 }}></i>
          </IconButton>

          <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
            <MenuItem onClick={handleGenerateRemessaClick}>Gerar Remessa</MenuItem>
            <MenuItem onClick={handleExportCsvClick}>Exportar CSV</MenuItem>
          </Menu>
        </>
      )}
    </div>
  )
}

const KanbanList = ({
  bankAccount,
  installments,
  bankAccounts,
  setBankAccounts,
  setInstallments,
  loadingInstallmentIds,
  addLoadingInstallment,
  removeLoadingInstallment
}) => {
  const [installmentsList, setInstallmentsList] = useState([])
  const dragData = useRef({ draggedInstallment: null, originBankAccountId: null, dragGhost: null })

  useEffect(() => {
    const installmentIds = bankAccounts.find((col) => col.id === bankAccount.id)?.taskIds || []
    setInstallmentsList(installments.filter((installment) => installment && installmentIds.includes(installment.id)))
  }, [bankAccounts, installments, bankAccount.id])

  const createDragGhost = (target, clientX, clientY) => {
    const ghost = target.cloneNode(true)
    ghost.style.position = "fixed"
    ghost.style.pointerEvents = "none"
    ghost.style.opacity = "0.8"
    ghost.style.zIndex = "1000"
    ghost.style.width = `${target.offsetWidth}px`
    ghost.style.top = `${clientY}px`
    ghost.style.left = `${clientX}px`
    ghost.style.backgroundColor = "white"
    ghost.style.borderRadius = "4px"
    document.body.appendChild(ghost)
    return ghost
  }

  const handleMouseDown = (e, installment) => {
    e.preventDefault()
    dragData.current = {
      draggedInstallment: installment,
      originBankAccountId: bankAccount?.id,
      dragGhost: createDragGhost(e.currentTarget, e.clientX, e.clientY),
    }
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    document.body.style.userSelect = "none"
  }

  const handleMouseMove = (e) => {
    const ghost = dragData.current.dragGhost
    if (ghost) {
      ghost.style.top = `${e.clientY + 8}px`
      ghost.style.left = `${e.clientX + 8}px`
    }
  }

  const detectDropPosition = (e) => {
    const bankAccountElements = document.querySelectorAll("[data-bank-account-id]")
    for (const baEl of bankAccountElements) {
      const rect = baEl.getBoundingClientRect()
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        let bankAccountId = baEl.getAttribute("data-bank-account-id")
        bankAccountId = bankAccountId === "null" ? null : Number(bankAccountId)
        const children = Array.from(baEl.querySelectorAll(".task-wrapper"))
        for (let i = 0; i < children.length; i++) {
          const childRect = children[i].getBoundingClientRect()
          if (e.clientY < childRect.top + childRect.height / 2) {
            return { bankAccountId, index: i }
          }
        }
        return { bankAccountId, index: children.length }
      }
    }
    return null
  }

  const removeInstallmentFromBankAccount = (bankAccounts, bankAccountId, installmentId) => bankAccounts.map((ba) =>
    ba.id === bankAccountId
      ? { ...ba, taskIds: ba.taskIds.filter((id) => id !== installmentId) }
      : ba
  )

  const insertInstallmentInBankAccount = (bankAccounts, bankAccountId, installmentId, index) => bankAccounts.map((ba) =>
    ba.id === bankAccountId
      ? { ...ba, taskIds: [...ba.taskIds.slice(0, index), installmentId, ...ba.taskIds.slice(index)] }
      : ba
  )

  const handleMouseUp = async (e) => {
    const { draggedInstallment, originBankAccountId, dragGhost } = dragData.current
    if (dragGhost) document.body.removeChild(dragGhost)
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("mouseup", handleMouseUp)
    document.body.style.userSelect = ""

    if (!draggedInstallment) return

    const dropPos = detectDropPosition(e)
    if (!dropPos) return

    const { bankAccountId: destBankAccountId, index: destIndex } = dropPos

    const originBA = bankAccounts.find((c) => c.id === originBankAccountId)
    const fromIndex = originBA.taskIds.indexOf(draggedInstallment.id)

    if (destBankAccountId === originBankAccountId && (fromIndex === destIndex || fromIndex + 1 === destIndex)) {
      return
    }

    // Atualiza o estado visual para novo local
    let updatedBankAccounts = removeInstallmentFromBankAccount(bankAccounts, originBankAccountId, draggedInstallment.id)
    updatedBankAccounts = insertInstallmentInBankAccount(updatedBankAccounts, destBankAccountId, draggedInstallment.id, destIndex)
    setBankAccounts(updatedBankAccounts)

    addLoadingInstallment(draggedInstallment.id)

    try {
      await updateInstallment({id: draggedInstallment.id, bankAccountId: destBankAccountId})
    } catch (error) {
      setBankAccounts((prev) => {
        let reverted = removeInstallmentFromBankAccount(prev, destBankAccountId, draggedInstallment.id)
        reverted = insertInstallmentInBankAccount(reverted, originBankAccountId, draggedInstallment.id, fromIndex)
        return reverted
      })
      alert(`Erro ao mover tarefa #${draggedInstallment.id}, operação revertida.`)
    } finally {
      removeLoadingInstallment(draggedInstallment.id)
    }
  }

  const addNewInstallment = (title) => {
    const maxId = installments.length > 0 ? Math.max(...installments.map(t => t.id || 0)) : 0
    const newInstallment = { id: maxId + 1, title }
    setInstallments((prev) => [...prev, newInstallment])
    setBankAccounts((prev) =>
      prev.map((ba) =>
        ba.id === bankAccount.id
          ? { ...ba, taskIds: [...ba.taskIds, newInstallment.id] }
          : ba
      )
    )
  }

  return (
    <div
      data-bank-account-id={bankAccount.id === null ? "null" : bankAccount.id}
      style={{ width: "320px", padding: "0.5rem", backgroundColor: "#f4f5f7", borderRadius: 4, marginRight: 8, display: "flex", flexDirection: "column", height: "100%" }}
    >
      <ColumnHeader bankAccount={bankAccount} />
      <div style={{ flexGrow: 1, overflowY: "auto" }} className="scroll-smooth">
        {installmentsList.map((installment) => (
          <div
            key={installment.id}
            className="task-wrapper"
            onMouseDown={(e) => handleMouseDown(e, installment)}
            style={{ cursor: "grab", userSelect: "none", marginBottom: 8 }}
          >
            <InstallmentCard installment={installment} loading={loadingInstallmentIds.includes(installment.id)} />
          </div>
        ))}
        {/*<NewInstallment addInstallment={addNewInstallment} />*/}
      </div>
    </div>
  )
}

const KanbanBoard = ({ initialBankAccounts, initialInstallments }) => {
  
  const [installments, setInstallments] = useState(initialInstallments)
  const [bankAccounts, setBankAccounts] = useState(initialBankAccounts)
  const [loadingInstallmentIds, setLoadingInstallmentIds] = useState([])

  const addLoadingInstallment = (installmentId) =>
    setLoadingInstallmentIds((prev) => [...new Set([...prev, installmentId])])
  const removeLoadingInstallment = (installmentId) =>
    setLoadingInstallmentIds((prev) => prev.filter((id) => id !== installmentId))

  return (
    <div className="flex items-start" style={{ height: "100%" }}>
      <div className="flex" style={{ height: "100%" }}>
        {bankAccounts.map((ba) => (
          <KanbanList
            key={ba.id === null ? "null" : ba.id}
            bankAccount={ba}
            installments={installments}
            bankAccounts={bankAccounts}
            setBankAccounts={setBankAccounts}
            setInstallments={setInstallments}
            loadingInstallmentIds={loadingInstallmentIds}
            addLoadingInstallment={addLoadingInstallment}
            removeLoadingInstallment={removeLoadingInstallment}
          />
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard