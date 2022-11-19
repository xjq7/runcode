import classNames from 'classnames';

interface Props {
  total?: number | string;
  page?: number | string;
  pageSize?: number | string;
  onPageChange: (page: number, pageSize: number) => {};
}

function Pagination(props: Props) {
  const { total = 0, page = 1, pageSize = 10, onPageChange } = props;

  const calPages = () => {
    const pages = [];
    let page = 1;
    let _total = Number(total);
    while (_total > 0) {
      pages.push(page);
      page++;
      _total -= Number(pageSize);
    }
    return pages;
  };

  const pages = calPages();

  return (
    <div className="btn-group mt-2">
      {pages.map((_page) => (
        <button
          key={_page}
          className={classNames('btn', {
            'btn-active': _page === page,
          })}
          onClick={() => {
            onPageChange(_page, Number(pageSize));
          }}
        >
          {_page}
        </button>
      ))}
    </div>
  );
}

export default Pagination;
