export interface PageInfo {
  pageSize?: string | number;
  page?: string | number;
  total?: string | number;
}

export interface ResponseList<T> {
  list?: T[];
  pager?: PageInfo;
}
