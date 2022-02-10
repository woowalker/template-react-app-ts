const constMapToObj = (arr: any, obj: any = {}) => {
  arr.forEach((item: any) => {
    obj[item.name] = item.value
  })
  return obj
}

export default constMapToObj