import 'src/styles/components/common/title.less'

type Props = {
  className?: string,
  style?: Object,
  title: string,
  color?: string
}

const Title = (props: Props) => {
  return (
    <div className={`title ${props.className || ''}`} style={props.style}>
      <div className='title__divide' style={{ backgroundColor: props.color }} />
      <span className='title__title' style={{ color: props.color }}>{props.title}</span>
    </div>
  )
}

export default Title