import Layout from '@/layout'
export function formatTree(data) {
  data.forEach(function(item) {
    delete item.children
  })
  const map = {}
  data.forEach(function(item) {
    map[item.id] = item
  })
  const val = []
  data.forEach(function(item) {
    const parent = map[item.pid]
    if (parent) {
      (parent.children || (parent.children = [])).push(item)
    } else {
      val.push(item)
    }
  })
  return val
}

export function setMenu(menu) {
  const newMenu = []

  menu.map((item, index) => {
    if (!item) {
      return
    }
    const obj = {
      name: item.name,
      path: item.url,
      id: item.id,
      pid: item.pid,
      hidden: item.hidden,
      redirect: item.redirect,
      meta: {
        title: item.name,
        icon: item.icon
      }
    }
    let component
    try {
      component = require(`../views${item.url}`).default
    } catch (error) {
      component = ''
    }

    if (item.pid === 0) {
      obj.component = Layout
    } else if (component) {
      obj.component = component
    }
    newMenu.push(obj)
  })
  return newMenu
}

