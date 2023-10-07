import { observer } from 'mobx-react-lite';
import { ChangeEvent, useState } from 'react';
import RangeSlider from '~components/RangeSlider';
import EditorConfig from '~store/config/editor';
import Text from '~components/Text';

export function Component() {
  const [editorConfig] = useState(() => EditorConfig);

  const { autoSaveDelay, setAutoSaveDelay, setFontSize, fontSize } =
    editorConfig;

  const handleDelayChange = (e: ChangeEvent<any>) => {
    setAutoSaveDelay(e.target.value);
  };

  return (
    <>
      <div className="navbar bg-base-100">
        <span className="text-xl font-bold">设置</span>
      </div>
      <span className="font-semibold m-2 text-l">自动保存:</span>
      <RangeSlider
        min={1}
        max={10}
        value={autoSaveDelay}
        onChange={handleDelayChange}
      />
      <li className="p-2">代码变更 {autoSaveDelay}s 后自动保存</li>
      <span className="font-semibold m-2 text-l">字体大小:</span>
      <Text
        value={fontSize}
        onChange={(e) => {
          const fontSize = Number(e.target.value);
          if (!Number.isNaN(fontSize)) setFontSize(fontSize);
        }}
      />
    </>
  );
}

export default observer(Component);
