import { Icon } from '@iconify/react'
import {
  AppBar,
  AppBarProps,
  CSSObject,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  Theme,
  Toolbar,
  Typography
} from '@mui/material'
import React, { FC, useState } from 'react'

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface StyledAppBarProps extends AppBarProps {
  open?: boolean;
}

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
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
}));

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
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
  }),
);

const AppLayout: FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex">
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            sx={{
              marginRight: '36px'
            }}
            onClick={() => setOpen(open => !open)}
          >
            <Icon icon="mdi:menu" />
          </IconButton>
          <Typography variant="h6">Better OneTab</Typography>
        </Toolbar>
      </StyledAppBar>

      <StyledDrawer variant="permanent" open={open} className="border-0">
        <DrawerHeader />

        <List>
          <ListItem button>
            <ListItemIcon>
              <Icon icon="mdi:view-list" fontSize={24} />
            </ListItemIcon>
            <ListItemText primary="Tab lists" />
          </ListItem>

          <ListItem button>
            <ListItemIcon>
              <Icon icon="mdi:pin-outline" fontSize={24} />
            </ListItemIcon>
            <ListItemText primary="Pinned" />
          </ListItem>
        </List>
        <Divider />
      </StyledDrawer>
    </div>
  )
}

export default AppLayout
