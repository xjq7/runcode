import classnames from 'classnames';

interface Props
  extends React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  border?: boolean;
}

function Component(props: Props) {
  const { placeholder, border, className, ...restProps } = props;

  let cls = 'textarea ';

  if (border) {
    cls += 'textarea-bordered ';
  }

  return (
    <textarea
      className={classnames(cls, className)}
      placeholder={placeholder}
      {...restProps}
    ></textarea>
  );
}

export default Component;
