import { createTheme, ThemeProvider, PaletteMode } from '@mui/material'
import React, { createContext, FC, useContext, useMemo, useState } from 'react'

const ColorModeContext = createContext<{
  mode: PaletteMode
  toggleColorMode: () => void
}>({ mode: 'light', toggleColorMode: () => {} })

export const useColorModeContext = () => useContext(ColorModeContext)

const ColorModeProvider: FC = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>('light')
  const value = useMemo(() => {
    return {
      mode,
      toggleColorMode: () => {
        setMode(mode === 'light' ? 'dark' : 'light')
        if (mode === 'light') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }
  }, [mode])

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode,
      },
    })
  }, [mode])

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default ColorModeProvider
