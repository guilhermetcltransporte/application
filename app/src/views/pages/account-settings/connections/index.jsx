'use client'

import { useState } from 'react'

// MUI
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'

const Integrations = ({integrations}) => {

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState(null)
  const [hoveredIntegration, setHoveredIntegration] = useState(null)

  /*
  const disconnectIntegration = (name) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.name === name ? { ...int, connected: false, enabled: false } : int
      )
    )
  }

  const toggleEnabled = (name) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.name === name ? { ...int, enabled: !int.enabled } : int
      )
    )
  }
  */

  const handleConfigureClick = (integration) => {
    setSelectedIntegration(integration)
    setDrawerOpen(true)
  }

  const handleConnectClick = (integration) => {
    setSelectedIntegration(integration)
    setDrawerOpen(true)
  }

  const handleSave = () => {
    if (selectedIntegration && !selectedIntegration.connected) {
      /*setIntegrations((prev) =>
        prev.map((int) =>
          int.name === selectedIntegration.name
            ? { ...int, connected: true, enabled: true }
            : int
        )
      )*/
    }
    setDrawerOpen(false)
    setSelectedIntegration(null)
  }

  const handleClose = () => {
    setDrawerOpen(false)
    setSelectedIntegration(null)
  }

  const connectedIntegrations = integrations.filter((i) => i.connected)

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Minhas integrações
      </Typography>
      <Grid container spacing={4} mb={6}>
        {connectedIntegrations.length > 0 ? (
          connectedIntegrations.map((integration) => (
            <Grid item xs={12} sm={6} md={4} key={`connected-${integration.name}`}>
              <Card variant="outlined" sx={{ height: 150, display: 'flex' }}>
                <Box
                  component="img"
                  src={integration.icon}
                  alt={integration.name}
                  sx={{
                    width: 150,
                    height: '100%',
                    objectFit: 'contain',
                    flexShrink: 0,
                    borderRadius: '4px 0 0 4px',
                    backgroundColor: '#f5f5f5'
                  }}
                />
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="h6">{integration.name}</Typography>
                    <IconButton
                      size="small"
                      color="primary"
                      title="Configurar integração"
                      onClick={() => handleConfigureClick(integration)}
                    >
                      <i className="ri-settings-3-line" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    {integration.description}
                  </Typography>
                  <Box
                    mt={2}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    onMouseEnter={() => setHoveredIntegration(integration.name)}
                    onMouseLeave={() => setHoveredIntegration(null)}
                  >
                    {integration.enabled ? (
                      <>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => disconnectIntegration(integration.name)}
                        >
                          Desconectar
                        </Button>
                        <Switch
                          checked={integration.enabled}
                          onChange={() => toggleEnabled(integration.name)}
                        />
                      </>
                    ) : (
                      <>
                        {hoveredIntegration === integration.name ? (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => disconnectIntegration(integration.name)}
                          >
                            Desconectar
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Inativada
                          </Typography>
                        )}
                        <Switch
                          checked={integration.enabled}
                          onChange={() => toggleEnabled(integration.name)}
                        />
                      </>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body2">Nenhuma integração conectada ainda.</Typography>
          </Grid>
        )}
      </Grid>

      <Typography variant="h6" mb={2}>
        Integrações disponíveis
      </Typography>
      <Grid container spacing={4}>
        {integrations.length > 0 ? (
          integrations.map((integration) => (
            <Grid item xs={12} sm={6} md={4} key={`available-${integration.name}`}>
              <Card variant="outlined" sx={{ height: 150, display: 'flex' }}>
                <Box
                  component="img"
                  src={integration.icon}
                  alt={integration.name}
                  sx={{
                    width: 150,
                    height: '100%',
                    objectFit: 'contain',
                    flexShrink: 0,
                    borderRadius: '4px 0 0 4px',
                    backgroundColor: '#f5f5f5'
                  }}
                />
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                  <Typography variant="h6" mb={1}>
                    {integration.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    {integration.description}
                  </Typography>
                  <Box mt={2} display="flex" justifyContent="flex-end" alignItems="center">
                    <Button variant="outlined" onClick={() => handleConnectClick(integration)}>
                      Conectar
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body2">Nenhuma integração disponível para conectar.</Typography>
          </Grid>
        )}
      </Grid>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleClose}
        PaperProps={{ sx: { width: 350, p: 3 } }}
      >
        {selectedIntegration && (
          <>
            <Typography variant="h5" mb={2}>
              Configurar {selectedIntegration.name}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              component="img"
              src={selectedIntegration.icon}
              alt={selectedIntegration.name}
              sx={{ width: 80, height: 80, objectFit: 'contain', mb: 2 }}
            />
            <Typography variant="body1" mb={4}>
              {selectedIntegration.description}
            </Typography>

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Salvar
              </Button>
            </Box>
          </>
        )}
      </Drawer>
    </Box>
  )
}

export default Integrations
