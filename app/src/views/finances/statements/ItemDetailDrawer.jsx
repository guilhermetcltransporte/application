// ItemDetailDrawer.jsx
import { Drawer, Box, Typography, IconButton } from '@mui/material'
import { Fragment } from 'react'

export function ItemDetailDrawer({ open, onClose, itemId }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} style={{zIndex: 1300}}>
      <Box
        sx={{ width: 400, p: 3 }}
        role="presentation"
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Detalhes do Item</Typography>
          <IconButton onClick={onClose}>
            <i className="ri-close-line" />
          </IconButton>
        </Box>
        {itemId ? (
          <Typography>
            **ID do Item:** {itemId}
            {/* You can add more detailed content here based on the itemId */}
            <br />
            {/* Example: Fetching more data based on itemId if needed */}
          </Typography>
        ) : (
          <Typography>Nenhum item selecionado.</Typography>
        )}
      </Box>
    </Drawer>
  )
}