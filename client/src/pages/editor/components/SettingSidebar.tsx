import { observer } from 'mobx-react-lite';
import { ChangeEvent, useState } from 'react';
import RangeSlider from '~components/RangeSlider';
import EditorConfig from '~store/config/editor';

export function Component() {
  const [editorConfig] = useState(() => EditorConfig);

  const { autoSaveDelay, setAutoSaveDelay } = editorConfig;

  const handleDelayChange = (e: ChangeEvent<any>) => {
    setAutoSaveDelay(e.target.value);
  };

  return (
    <>
      <div className="navbar bg-base-100">
        <a className="btn btn-ghost normal-case text-xl">设置</a>
      </div>
      <RangeSlider
        min={1}
        max={10}
        value={autoSaveDelay}
        onChange={handleDelayChange}
      />
      <li className="p-2">代码变更 {autoSaveDelay}s 后自动保存</li>
    </>
  );
}

export default observer(Component);
