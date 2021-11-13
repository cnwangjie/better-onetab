import type { RxCollection } from 'rxdb'

export interface PaginateOpt {
  after?: string
  before?: string
  limit?: number
  sort?: Record<string, 1 | -1>
  query?: any
}

export interface PaginationResult<T> {
  result: T[]
  hasNext: boolean
  next?: string
}

export const paginate = <T = any>(col: RxCollection<T>) => async ({
  after,
  before,
  limit = 10,
  sort = {},
  query = {},
}: PaginateOpt = {}): Promise<PaginationResult<T>> => {
  const lastId = before || after
  const last: any =
    lastId && (await col.findOne({ selector: { id: lastId } }).exec())

  const pagingQuery = last
    ? Object.entries(sort).map(([field, direction]) => {
        /**
         *            | before  |  after
         * -----------|---------|--------
         *   ascent   |   lt    |   gt
         *   descent  |   gt    |   lt
         */
        const cond = direction > 0 === !before

        return {
          [field]: { [cond ? '$gt' : '$lt']: last[field] },
        }
      })[0] || {}
    : {}

  const mangoQuery: any = {
    selector: {
      ...query,
      ...pagingQuery,
    },
    limit: limit + 1,
  }

  const mangoSort = Object.entries(sort).map(([k, v]) => ({
    [k]: v > 0 ? 'asc' : 'desc',
  }))

  if (mangoSort.length) {
    mangoQuery.sort = mangoSort
  }

  const result = await col
    .find(mangoQuery)
    .exec()

  const actualResult = result.slice(0, limit)

  return {
    result: actualResult,
    hasNext: result.length > limit,
    next:
      actualResult.length > 0
        ? (actualResult[actualResult.length - 1] as any).id
        : undefined,
  }
}
