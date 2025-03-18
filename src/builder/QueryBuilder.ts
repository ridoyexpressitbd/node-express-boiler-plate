import { FilterQuery, Query } from 'mongoose'

class QueryBuilder<T> {
  constructor(
    public modelQuery: Query<T[], T>,
    public query: Record<string, unknown>
  ) {
    this.modelQuery = modelQuery
    this.query = query
  }

  search(searchAbleFileds: string[]) {
    const search = this?.query?.search
    if (search) {
      this.modelQuery = this.modelQuery.find({
        $or: searchAbleFileds.map(
          filed =>
            ({
              [filed]: { $regex: search, $options: 'i' }
            }) as FilterQuery<T>
        )
      })
    }
    return this
  }

  filter() {
    const queryObj = { ...this.query }
    const exludeFileds = ['search', 'sort', 'page', 'limit', 'fileds']

    exludeFileds.forEach(el => delete queryObj[el])
    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>)

    return this
  }

  sort() {
    // const sort = this?.query?.sort || '-createdAt'
    const sort =
      (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt'
    this.modelQuery = this.modelQuery.sort(sort as string)

    return this
  }

  paginate() {
    const page = Number(this?.query?.page) || 1
    const limit = Number(this?.query?.limit) || 10
    const skip = (page - 1) * limit

    this.modelQuery = this.modelQuery.skip(skip).limit(limit)
    return this
  }
  fields() {
    const fields =
      (this?.query?.fileds as string)?.split(',')?.join(' ') || '-__v'
    this.modelQuery = this.modelQuery.select(fields)
    return this
  }
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter()
    const totalData = await this.modelQuery.model.countDocuments(totalQueries)
    const page = Number(this?.query?.page) || 1
    const limit = Number(this?.query?.limit) || 10
    const totalPage = Math.ceil(totalData / limit)

    return {
      page,
      limit,
      totalData,
      totalPage
    }
  }
}

export default QueryBuilder
