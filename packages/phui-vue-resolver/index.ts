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
        return {
          name: partialName,
          from: 'phui-v',
          sideEffects: `phui-v/style/${kebabCaseName}.js`,
        }
      }
      return
    },
  }
}

export default PhuiResolver
