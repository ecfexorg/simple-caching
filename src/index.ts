export interface IValue<T> {
  value: T
  createdAt: number
}

export interface IItem<T> {
  ttl: number
  previousValue?: IValue<T>
  currentValue?: IValue<T>
}

export type Store = {
  [key: string]: IItem<any>
}

export type Getter = (key: string) => any

export type OnChange = (store: Store) => void

export default class Cache {
  store: Store = {}

  onChange: OnChange

  getter: Getter

  constructor (store: any, getter: Getter, onChange?: OnChange) {
    if (typeof store === 'object') {
      for (let key in store) {
        if (store[key]) {
          const {ttl = 0, previousValue, currentValue} = store[key]
          this.store[key] = {
            ttl,
            previousValue: {
              value: previousValue.value,
              createdAt: previousValue.createdAt || Date.now()
            },
            currentValue: {
              value: currentValue.value,
              createdAt: currentValue.createdAt || Date.now()
            }
          }
        }
      }
    }
  }
  
  create (key: string, ttl: number = 0) {
    this.store[key] = {ttl}
  }

  get<T = any> (key: string) {
    const item = this.store[key]
  
    if (!item) {
      return undefined
    }

    if (!item.currentValue || item.currentValue.createdAt + item.ttl < Date.now()) {
      item.previousValue = item.currentValue
      item.currentValue = {
        value: this.getter(key),
        createdAt: Date.now()
      }
    }

    return item.currentValue.value as T
  }

  getPrevious<T = any> (key: string) {
    const item = this.store[key]

    return (!item || item.previousValue === undefined)
      ? undefined
      : item.previousValue.value as T
  }
}
