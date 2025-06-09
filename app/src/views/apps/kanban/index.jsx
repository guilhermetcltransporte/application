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

// Componente InstallmentCard (inalterado em sua estrutura visual)
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

// Componente NewInstallment (inalterado)
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

// Componente ColumnHeader (inalterado)
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

// Componente KanbanList (com drag and drop nativo)
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
  // Novo estado para feedback visual quando arrastando sobre a coluna
  const [isDraggingOver, setIsDraggingOver] = useState(false) 

  useEffect(() => {
    const installmentIds = bankAccounts.find((col) => col.id === bankAccount.id)?.taskIds || []
    setInstallmentsList(installments.filter((installment) => installment && installmentIds.includes(installment.id)))
  }, [bankAccounts, installments, bankAccount.id])

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

  // Evento onDragStart para o item arrastável
  const handleDragStart = (e, installment) => {
    // Armazena os dados da parcela e a coluna de origem
    e.dataTransfer.setData("text/plain", JSON.stringify({
      installmentId: installment.id,
      originBankAccountId: bankAccount.id,
      fromIndex: installmentsList.findIndex(item => item.id === installment.id) // Posição inicial na lista
    }));
    e.dataTransfer.effectAllowed = "move"; // Indica que é uma operação de mover
    e.currentTarget.classList.add("dragging"); // Adiciona uma classe para styling enquanto arrasta
  };

  // Evento onDragEnd para o item arrastável
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging"); // Remove a classe de styling
  };

  // Evento onDragOver para a lista (coluna) - impede o comportamento padrão e permite o drop
  const handleDragOver = (e) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move"; // Define o efeito visual do cursor
  };

  // Evento onDragEnter para a lista (coluna) - para feedback visual
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDraggingOver(true); // Define o estado para mostrar feedback visual
  };

  // Evento onDragLeave para a lista (coluna) - remove feedback visual
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false); // Reseta o estado
  };

  // Evento onDrop para a lista (coluna) - processa a soltura
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDraggingOver(false); // Reseta o estado de feedback visual

    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const { installmentId, originBankAccountId, fromIndex } = data;

    const draggedInstallment = installments.find(inst => inst.id === installmentId);
    if (!draggedInstallment) return;

    // Determinar a posição de soltura dentro da lista, para permitir reordenação
    let destIndex = installmentsList.length; // Por padrão, adiciona no final
    const children = Array.from(e.currentTarget.querySelectorAll(".task-wrapper"));

    for (let i = 0; i < children.length; i++) {
      const childRect = children[i].getBoundingClientRect();
      // Se o mouse estiver acima da metade de um item, insere antes dele
      if (e.clientY < childRect.top + childRect.height / 2) {
        destIndex = i;
        break;
      }
    }

    const destBankAccountId = bankAccount.id;

    // Evita arrastar para a mesma posição na mesma coluna
    if (destBankAccountId === originBankAccountId && (fromIndex === destIndex || fromIndex + 1 === destIndex)) {
      return;
    }

    // Atualiza o estado visualmente (otimista)
    let updatedBankAccounts = removeInstallmentFromBankAccount(bankAccounts, originBankAccountId, draggedInstallment.id);
    updatedBankAccounts = insertInstallmentInBankAccount(updatedBankAccounts, destBankAccountId, draggedInstallment.id, destIndex);
    setBankAccounts(updatedBankAccounts);

    addLoadingInstallment(draggedInstallment.id); // Adiciona a parcela à lista de carregamento

    try {
      // Chama a API para atualizar o banco de dados
      await updateInstallment({ id: draggedInstallment.id, bankAccountId: destBankAccountId });
    } catch (error) {
      // Em caso de erro, reverte o estado visual
      setBankAccounts((prev) => {
        let reverted = removeInstallmentFromBankAccount(prev, destBankAccountId, draggedInstallment.id);
        reverted = insertInstallmentInBankAccount(reverted, originBankAccountId, draggedInstallment.id, fromIndex);
        return reverted;
      });
      alert(`Erro ao mover tarefa #${draggedInstallment.id}, operação revertida.`);
    } finally {
      removeLoadingInstallment(draggedInstallment.id); // Remove a parcela da lista de carregamento
    }
  };


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
      // Eventos de drop para a coluna
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      style={{
        width: "320px",
        padding: "0.5rem",
        backgroundColor: "#f4f5f7", // Cor de fundo original
        borderRadius: 4,
        marginRight: 8,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        // Adiciona feedback visual para quando um item está sobre a coluna
        border: isDraggingOver ? "2px dashed #007bff" : "2px solid transparent"
      }}
    >
      <ColumnHeader bankAccount={bankAccount} />
      <div style={{ flexGrow: 1, overflowY: "auto" }} className="scroll-smooth">
        {installmentsList.map((installment) => (
          <div
            key={installment.id}
            className="task-wrapper"
            draggable="true" // Torna o item arrastável
            onDragStart={(e) => handleDragStart(e, installment)}
            onDragEnd={handleDragEnd}
            style={{ cursor: "grab", userSelect: "none", marginBottom: 8 }}
          >
            {/* O InstallmentCard é renderizado aqui, sem alterações */}
            <InstallmentCard installment={installment} loading={loadingInstallmentIds.includes(installment.id)} />
          </div>
        ))}
        {/*<NewInstallment addInstallment={addNewInstallment} />*/}
      </div>
    </div>
  )
}

// Componente KanbanBoard (inalterado)
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