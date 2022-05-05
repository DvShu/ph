import type { ComponentResolver } from 'unplugin-vue-components/types'

function kebabCase(key: string) {
  const result = key.replace(/([A-Z])/g, ' $1').trim()
  return result.split(' ').join('-').toLowerCase()
}

function PhuiResolver(): ComponentResolver {
  return {
    type: 'component',
    resolve: (name: string) => {
      if (name.startsWith('Ph')) {
        const partialName = name.slice(2)
        let kebabCaseName = kebabCase(partialName)
        if (partialName.endsWith('Icon')) {
          kebabCaseName = 'icon'
        }
        let sideEffects: string | undefined = `phui-v/style/${kebabCaseName}.js`
        if (partialName === 'Form') {
          sideEffects = undefined
        }
        return {
          name: partialName,
          from: 'phui-v',
          sideEffects,
        }
      }
      return
    },
  }
}

export default PhuiResolver
