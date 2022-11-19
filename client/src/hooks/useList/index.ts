import { PageInfo, ResponseList } from '~utils/type';
import { useEffect, useState } from 'react';

interface Config<T> {
  page?: PageInfo['page'];
  pageSize?: PageInfo['pageSize'];
  initData?: T[];
  // 是否开启首次请求
  autoFetch?: boolean;
  // 默认数据分页展示,false 代码长列表,每次分页请求会合并前面的数据
  paging?: boolean;
}

interface UseListResponse<T> {
  dataSource: T[];
  hasMore: boolean;
  loading: boolean;
  pageInfo: PageInfo;
  reload: () => void;
  onPageChange: (
    page: PageInfo['page'],
    pageSize: PageInfo['pageSize']
  ) => Promise<void>;
  reset: () => void;
  refresh: () => void;
  mutate: (op: T[] | ((data: T[]) => T[])) => void;
}

export default function useList<T>(
  fetchData: (o: PageInfo) => Promise<ResponseList<T>>,
  config?: Config<T>
): UseListResponse<T> {
  const {
    page = '1',
    pageSize = '10',
    initData = [],
    autoFetch = true,
    paging = true,
  } = config || {};
  const [data, setData] = useState<T[]>(initData);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    page,
    pageSize,
    total: '0',
  });
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const _fetchData = async (
    page: PageInfo['page'] = pageInfo.page,
    pageSize: PageInfo['pageSize'] = pageInfo.pageSize
  ) => {
    setLoading(true);
    try {
      const retData = await fetchData({
        page: String(page),
        pageSize: String(pageSize),
      });

      const { list = [], pager = {} } = retData;
      const {
        page: resultPage = page,
        pageSize: resultPageSize,
        total,
      } = pager;
      setPageInfo({ page: resultPage, pageSize: resultPageSize, total });
      if (paging || String(page) === '1') {
        setData(list);
        setHasMore(list.length < Number(total));
      } else {
        setData(data.concat(list));
        setHasMore(list.length + data.length < Number(total));
      }
    } catch (error) {
      setData([]);
      setPageInfo({ page: 1, pageSize, total: '0' });
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const reload = () => {
    _fetchData(1, pageInfo.pageSize);
  };

  const refresh = () => {
    _fetchData(pageInfo.page, pageInfo.pageSize);
  };

  const onPageChange = async (
    page: PageInfo['page'],
    pageSize: PageInfo['pageSize']
  ) => {
    await _fetchData(page, pageSize);
  };

  const reset = () => {
    setData(initData);
    setPageInfo({ page: 1, pageSize, total: '0' });
    setHasMore(true);
  };

  const mutate = (op: T[] | ((data: T[]) => T[])) => {
    let newData = data;
    if (typeof op === 'function') {
      newData = op(data);
    } else if (Array.isArray(op)) {
      newData = op;
    }
    setData(newData);
  };

  useEffect(() => {
    if (!autoFetch) return;
    _fetchData(1, pageInfo.pageSize);
  }, [autoFetch]);

  return {
    dataSource: data,
    loading,
    pageInfo,
    refresh,
    reload,
    onPageChange,
    hasMore,
    reset,
    mutate,
  };
}
