// @ts-ignore
import loadingIcon from '../../../assets/loading.gif';
const Loading = ({
  width = 48,
  height = 48,
}: {
  width?: number;
  height?: number;
}) => {
  return (
    <img
      src={loadingIcon}
      alt={'loading'}
      style={{ width: width + 'px', height: height + 'px' }}
    />
  );
};

export default Loading;
