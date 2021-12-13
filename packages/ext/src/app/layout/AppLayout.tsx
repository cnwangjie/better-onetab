import { Icon } from '@iconify/react'
import {
  AppBar,
  AppBarProps,
  Container,
  CSSObject,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemButtonProps,
  ListItemIcon,
  ListItemText,
  styled,
  Theme,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material'
import React, { FC, Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { useColorModeContext } from '../component/ColorMode'

const drawerWidth = 240

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  border: 0,
  overflowX: 'hidden',
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  border: 0,
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
})

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}))

interface StyledAppBarProps extends AppBarProps {
  open?: boolean
}

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: prop => prop !== 'open',
})<StyledAppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: prop => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}))

interface StyleListItemButtonProps extends ListItemButtonProps {
  open?: boolean
}

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: prop => prop !== 'open',
})<StyleListItemButtonProps>(({ open }) => ({
  transition: 'all 0.2s ease-in-out',
  ...(open
    ? {
        paddingLeft: 24,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
      }
    : {
        marginLeft: 8,
        borderRadius: 24,
      }),
}))

export interface TabConfig {
  key: string
  icon: string
  label: string
  to: string
}

interface AppLayoutProps {
  tabs: TabConfig[][]
  activeTab: string
}

const AppLayout: FC<AppLayoutProps> = ({ tabs, activeTab, children }) => {
  const [open, setOpen] = useState(false)
  const { mode, toggleColorMode } = useColorModeContext()
  const theme = useTheme()

  // TODO: hide shadow scroll Y is 0
  return (
    <div className="flex">
      <StyledAppBar position="fixed" color="inherit">
        <Toolbar>
          <IconButton
            color="inherit"
            sx={{
              marginRight: '36px',
            }}
            onClick={() => setOpen(open => !open)}
          >
            <Icon icon="mdi:menu" />
          </IconButton>
          <Typography variant="h6">Better OneTab</Typography>
          <div className="flex-1" />
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? (
              <Icon icon="mdi:brightness-7" />
            ) : (
              <Icon icon="mdi:brightness-4" />
            )}
          </IconButton>
        </Toolbar>
      </StyledAppBar>

      <StyledDrawer variant="permanent" open={open}>
        <DrawerHeader />

        {tabs.map((tab, index) => {
          return (
            <Fragment key={index}>
              {index === 0 || (
                <Divider key={`divider-${index}`} />
              )}
              <List>
                {tab.map(tab => {
                  return (
                    <Link to={tab.to} key={tab.key}>
                      <StyledListItemButton
                        open={open}
                        selected={tab.key === activeTab}
                      >
                        <ListItemIcon>
                          <Icon icon={tab.icon} fontSize={24} />
                        </ListItemIcon>
                        <ListItemText primary={tab.label} />
                      </StyledListItemButton>
                    </Link>
                  )
                })}
              </List>
            </Fragment>
          )
        })}
      </StyledDrawer>

      <div
        className="flex-1 mt-[64px] p-8"
        style={{
          background: theme.palette.background.default,
        }}
      >
        <Container>{children}</Container>
      </div>
    </div>
  )
}

export default AppLayout
