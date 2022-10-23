import { action, makeObservable, observable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { ThemeType } from '~components/CodeEditorMonaco';
import { CodeType } from '~utils/codeType';

export class EditorConfig {
  autoSaveDelay = 1;
  editorThemeType = ThemeType['Visual Studio'];
  codeType = CodeType.cpp;
  constructor() {
    makeObservable(this, {
      autoSaveDelay: observable,
      codeType: observable,
      editorThemeType: observable,
      setAutoSaveDelay: action.bound,
      setEditorThemeType: action.bound,
      setCodeType: action.bound,
    });
    makePersistable(this, {
      name: 'EditorConfig',
      properties: ['autoSaveDelay', 'editorThemeType', 'codeType'],
      storage: window.localStorage,
    });
  }

  setCodeType(type: CodeType) {
    this.codeType = type;
  }

  setEditorThemeType(type: ThemeType) {
    this.editorThemeType = type;
  }

  setAutoSaveDelay(delay: number) {
    this.autoSaveDelay = delay;
  }
}

export default new EditorConfig();
