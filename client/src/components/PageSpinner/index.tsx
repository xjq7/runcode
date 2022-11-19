import { GridLoader } from 'react-spinners';

const PageSpinner = () => {
  return (
    <div className="w-full mt-80 flex items-center justify-center">
      <GridLoader color="#570df8" size={25} />
    </div>
  );
};

export default PageSpinner;
