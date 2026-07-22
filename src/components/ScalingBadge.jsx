import { statColor } from '../utils/statIcons.js'

export default function ScalingBadge({ scaling }) {
  const color = statColor(scaling.stat)
  return (
    <span className="scaling-badge" style={{ color }} title={scaling.raw}>
      <span className="dot" />
      {scaling.raw}
    </span>
  )
}
