"use client"

import { Typography, IconButton, Menu, MenuItem, Button, TextField } from "@mui/material"
import React, { useState, useEffect, useRef } from "react"


const TaskCard = ({ task }) => {
  const isLate = task.status === "atrasada"
  const backgroundColor = isLate ? "#fdecea" : "white"

  return (
    <div
      style={{
        padding: "8px",
        backgroundColor,
        borderRadius: 4,
      }}
    >
      <Typography variant="subtitle2" gutterBottom style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <i className="ri-file-text-line" style={{ fontSize: "1rem" }}></i>
        {task.title}
      </Typography>
      <Typography
        variant="body2"
        style={{ color: "#666", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}
      >
        <i className="ri-align-left" style={{ fontSize: "0.875rem" }}></i>
        {task.description}
      </Typography>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#444",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <i
            className="ri-money-dollar-circle-line"
            style={{ fontSize: "0.875rem", lineHeight: 1 }}
          ></i>
          <Typography variant='body2' color='text.secondary'>R$ {task.amount?.toFixed(2)}</Typography>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <i
            className="ri-calendar-line"
            style={{ fontSize: "0.875rem", lineHeight: 1 }}
          ></i>
          <Typography variant='body2' color='text.secondary'>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : '-'}</Typography>
        </div>
      </div>
    </div>
  )
}

const NewTask = ({ addTask }) => {
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
      addTask(input.trim())
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


const ColumnHeader = ({ column, onGenerateRemessa, onExportCsv }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleGenerateRemessaClick = () => {
    onGenerateRemessa(column.id)
    handleCloseMenu()
  }

  const handleExportCsvClick = () => {
    onExportCsv(column.id)
    handleCloseMenu()
  }

  return (
    <div 
      className="column-header flex items-center justify-between p-2"
      style={{ gap: 8 }}
    >
      <div className="flex items-center gap-2">
        {column.bankIcon && (
          <img
            src={column.bankIcon}
            alt={`${column.title} icon`}
            style={{ width: 24, height: 24 }}
          />
        )}
        <div>
          <Typography fontWeight="bold">{column.title}</Typography>
          <Typography fontSize="0.85rem" color="#666">
            {column.id ? (
              <>{column.agency} / {column.account}</>
            ) : <>Sem bancos</>}
          </Typography>
        </div>
      </div>

      {column.id !== null && (
        <>
          <IconButton
            size="small"
            aria-controls={open ? 'column-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleOpenMenu}
          >
            <i className="ri-more-2-line" style={{ fontSize: 20 }}></i>
          </IconButton>

          <Menu
            id="column-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleGenerateRemessaClick}>Gerar Remessa</MenuItem>
            <MenuItem onClick={handleExportCsvClick}>Exportar CSV</MenuItem>
          </Menu>
        </>
      )}
    </div>
  )
}

const KanbanList = ({ column, tasks, columns, setColumns, setTasks }) => {
  const [tasksList, setTasksList] = useState([])

  const dragData = useRef({
    draggedTask: null,
    originColumnId: null,
    dragGhost: null,
  })

  useEffect(() => {
    const taskIds = columns.find((col) => col.id === column.id)?.taskIds || []
    const filteredTasks = tasks.filter((task) => task && taskIds.includes(task.id))
    setTasksList(filteredTasks)
  }, [columns, tasks, column.id])

  const createDragGhost = (target, clientX, clientY) => {
    const ghost = target.cloneNode(true)
    ghost.style.position = "fixed"
    ghost.style.pointerEvents = "none"
    ghost.style.opacity = "0.8"
    ghost.style.zIndex = "1000"
    ghost.style.width = `${target.offsetWidth}px`
    ghost.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)"
    ghost.style.borderRadius = "4px"
    ghost.style.backgroundColor = "white"
    ghost.style.top = `${clientY}px`
    ghost.style.left = `${clientX}px`
    document.body.appendChild(ghost)
    return ghost
  }

  const handleMouseDown = (e, task) => {
    e.preventDefault()
    dragData.current.draggedTask = task
    dragData.current.originColumnId = column.id
    dragData.current.dragGhost = createDragGhost(e.currentTarget, e.clientX, e.clientY)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    document.body.style.userSelect = "none"
  }

  const handleMouseMove = (e) => {
    const { dragGhost } = dragData.current
    if (!dragGhost) return

    dragGhost.style.top = `${e.clientY + 8}px`
    dragGhost.style.left = `${e.clientX + 8}px`
  }

  const removeTaskFromColumn = (cols, columnId, taskId) => {
    return cols.map((col) => {
      if (col.id === columnId) {
        return { ...col, taskIds: col.taskIds.filter((id) => id !== taskId) }
      }
      return col
    })
  }

  const insertTaskInColumn = (cols, columnId, taskId, index) => {
    return cols.map((col) => {
      if (col.id === columnId) {
        const newTaskIds = [...col.taskIds]
        newTaskIds.splice(index, 0, taskId)
        return { ...col, taskIds: newTaskIds }
      }
      return col
    })
  }

  const detectDropPosition = (e) => {
    const columnsElements = document.querySelectorAll("[data-column-id]")
    for (const colEl of columnsElements) {
      const rect = colEl.getBoundingClientRect()
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        let columnId = colEl.getAttribute("data-column-id")
        if (columnId === "null") {
          columnId = null
        } else {
          columnId = Number(columnId)
        }

        const children = Array.from(colEl.querySelectorAll(".task-wrapper"))
        for (let i = 0; i < children.length; i++) {
          const childRect = children[i].getBoundingClientRect()
          if (e.clientY < childRect.top + childRect.height / 2) {
            return { columnId, index: i }
          }
        }
        return { columnId, index: children.length }
      }
    }
    return null
  }

  const handleMouseUp = async (e) => {
    const { draggedTask, originColumnId, dragGhost } = dragData.current
    if (dragGhost) {
      document.body.removeChild(dragGhost)
      dragData.current.dragGhost = null
    }
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("mouseup", handleMouseUp)

    document.body.style.userSelect = ""

    if (!draggedTask) return

    const dropPos = detectDropPosition(e)
    if (!dropPos) {
      dragData.current.draggedTask = null
      dragData.current.originColumnId = null
      return
    }

    const { columnId: destColumnId, index: destIndex } = dropPos

    // Se mesmo lugar, não faz nada
    if (destColumnId === originColumnId) {
      const col = columns.find((c) => c.id === originColumnId)
      const fromIndex = col.taskIds.indexOf(draggedTask.id)
      if (fromIndex === destIndex || fromIndex + 1 === destIndex) {
        dragData.current.draggedTask = null
        dragData.current.originColumnId = null
        return
      }
    }

    // Salva estado anterior para rollback se necessário
    const previousColumns = [...columns]

    // Atualiza colunas removendo da origem e inserindo no destino
    let updatedColumns = removeTaskFromColumn(columns, originColumnId, draggedTask.id)
    updatedColumns = insertTaskInColumn(updatedColumns, destColumnId, draggedTask.id, destIndex)
    setColumns(updatedColumns)

    const move = {
          taskId: draggedTask.id,
          toColumnId: destColumnId,
        }

        console.log(move)

    // Agora chama a API com os dados do card e coluna destino
    try {
      // Substitua essa URL pelo endpoint real da sua API
      const response = await fetch("https://google213111.com/api/moveTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(move),
      })

      if (!response.ok) {
        throw new Error("Falha ao mover tarefa")
      }

      // Se quiser, pode tratar resposta da API aqui
    } catch (error) {
      // Se a API falhar, volta para o estado anterior
      setColumns(previousColumns)
      alert("Erro ao mover tarefa, operação revertida.")
    }

    dragData.current.draggedTask = null
    dragData.current.originColumnId = null
  }


  const addNewTask = (title) => {
    const maxId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id || 0)) : 0
    const newTask = { id: maxId + 1, title }
    setTasks((prev) => [...prev, newTask])
    setColumns((prev) =>
      prev.map((col) =>
        col.id === column.id ? { ...col, taskIds: [...col.taskIds, newTask.id] } : col
      )
    )
  }

  return (
    <div
      data-column-id={column.id === null ? "null" : column.id}
      style={{
        width: "300px",
        padding: "0.5rem",
        backgroundColor: "#f4f5f7",
        borderRadius: 4,
        marginRight: 8,
        display: "flex",
        flexDirection: "column",
      }}
    >
        <ColumnHeader column={column} />
        <div style={{ flexGrow: 1 }}>
            {tasksList.map((task) => (
                <div
                key={task.id}
                className="task-wrapper"
                onMouseDown={(e) => handleMouseDown(e, task)}
                style={{
                    cursor: "grab",
                    userSelect: "none",
                    marginBottom: 8,
                }}
                >
                <TaskCard task={task} />
                </div>
            ))}

            {/* Adiciona o form logo após as tasks */}
            <NewTask addTask={addNewTask} />
        </div>
    </div>
  )
}

const KanbanBoard = ({initialBankAccounts, initialInstallments}) => {

  console.log(initialInstallments)

  const [tasks, setTasks] = useState(initialInstallments)

  const [columns, setColumns] = useState(initialBankAccounts)

    return (
        <div className="flex items-start gap-6" style={{ height: "100%" }}>
            <div className="flex gap-6" style={{ height: "100%" }}>
                {columns.map((col) => (
                <KanbanList
                    key={col.id === null ? "null" : col.id}
                    column={col}
                    tasks={tasks}
                    columns={columns}
                    setColumns={setColumns}
                    setTasks={setTasks}
                />
                ))}
            </div>
        </div>
    )
}

export default KanbanBoard