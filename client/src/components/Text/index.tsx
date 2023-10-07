interface Props
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  border?: boolean;
}

function Text(props: Props) {
  const { placeholder, ...restProps } = props;
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="input input-bordered w-full max-w-xs input-primary"
      {...restProps}
    />
  );
}

export default Text;
