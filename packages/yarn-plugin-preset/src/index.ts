import type { Hooks, Plugin, Project } from '@yarnpkg/core'
import { execute } from '@yarnpkg/shell'

const some = async <TValue, TReturn>(
  array: TValue[],
  predicate: (value: TValue) => Promise<TReturn>
) => {
  for (const value of array) {
    if (await predicate(value)) return true
  }

  return false
}

const executeScript = (name: string, { topLevelWorkspace }: Project) => {
  if (!topLevelWorkspace.manifest.scripts.has(name)) return Promise.resolve(0)

  return execute(`yarn ${name}`)
}

const plugin: Plugin<Hooks> = {
  hooks: {
    afterAllInstalled: project => {
      executeScript('prepare', project)
    },
    wrapScriptExecution: async (executor, project, _, scriptName) => {
      if (/^p(re|ost)(?!pare).+/.test(scriptName)) {
        return executor
      }

      return async () => {
        const prefixes = ['pre', undefined, 'post']
        const errors = await some(prefixes, async prefix => {
          if (prefix) {
            return await executeScript(`${prefix}${scriptName}`, project)
          }

          return await executor()
        })

        return errors ? 1 : 0
      }
    }
  }
}

export default plugin
