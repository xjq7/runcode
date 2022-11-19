export interface Response<T> {
  code: number;
  data?: T;
  message?: string;
}

export interface ResponseList<T> {
  code: number;
  data?: {
    pager: Pager;
    list: T[];
  };
  message?: string;
}

export interface Pager {
  page: string | number;
  total?: string | number;
  pageSize: string | number;
}
