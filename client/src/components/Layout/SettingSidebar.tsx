import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import EditorConfig from '~store/config/editor';
import { Drawer, Input, Slider } from 'antd';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Component(props: Props) {
  const { open, onClose } = props;
  const [editorConfig] = useState(() => EditorConfig);

  const { autoSaveDelay, setAutoSaveDelay, setFontSize, fontSize } =
    editorConfig;

  const handleDelayChange = (value: number) => {
    setAutoSaveDelay(value);
  };

  return (
    <Drawer title="设置面板" onClose={onClose} open={open}>
      <div className="font-semibold m-2 text-xl">自动保存:</div>
      <Slider
        min={1}
        max={10}
        value={autoSaveDelay}
        onChange={handleDelayChange}
      />
      <li className="p-2">代码变更 {autoSaveDelay}s 后自动保存</li>
      <div className="font-semibold m-2 text-xl">字体大小:</div>
      <Input
        size="large"
        value={fontSize}
        onChange={(e) => {
          const fontSize = Number(e.target.value);
          if (!Number.isNaN(fontSize)) setFontSize(fontSize);
        }}
      />
    </Drawer>
  );
}

export default observer(Component);
