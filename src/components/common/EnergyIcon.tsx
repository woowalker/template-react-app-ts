import { useMemo } from 'react'
import { PictureOutlined } from '@ant-design/icons'
import icons from 'src/styles/fonts/iconfont.json'

const { css_prefix_text, glyphs } = icons
const allIcons = glyphs.map((item: any) => `${css_prefix_text}${item.font_class}`)

type Props = {
  type: string,
  size?: number,
  defaultIcon?: string,
  allowBlank?: boolean,
  className?: string,
  style?: Object
}

const EnergyIcon = (props: Props) => {
  const matchIcon = useMemo(() => {
    const find = allIcons.find((icon: string) => icon === props.type)
    return find || props.defaultIcon
  }, [props.type, props.defaultIcon])

  const { size = 14, allowBlank = false, className, style } = props
  if (matchIcon) {
    return (
      <i
        className={`iconfont ${matchIcon} ${className}`}
        style={{
          fontSize: size,
          lineHeight: 1,
          ...style
        }}
      />
    )
  }
  if (!allowBlank) {
    return (
      <PictureOutlined
        className={className}
        style={{
          fontSize: size,
          ...style
        }}
      />
    )
  }
  return null
}

export default EnergyIcon