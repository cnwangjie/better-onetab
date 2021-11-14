import styled from '@emotion/styled'
import { Tooltip } from '@mui/material'

// TODO: Decrease the distance between element and tooltip. Not working here.
// unsolved ref: https://github.com/mui-org/material-ui/issues/19848
const IconTooltip = styled(Tooltip)(() => ({
  [`& .MuiTooltip-tooltipPlacementBottom`]: {
    marginTop: 0,
  },
}))


export default IconTooltip
