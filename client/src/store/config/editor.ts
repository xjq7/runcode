import { action, makeObservable, observable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { CodeType } from '~utils/codeType';
import { OutputType } from '~utils/helper';

export const enum ThemeType {
  'Visual Studio' = 'vs',
  'Visual Studio Dark' = 'vs-dark',
  'High Contrast' = 'hc-light',
  'High Contrast Dark' = 'hc-black',
}

export const enum Lang {
  ZHCN = 'zh-CN',
  EN = 'en',
}

export class EditorConfig {
  autoSaveDelay = 1;
  fontSize = 16;
  editorThemeType = ThemeType['Visual Studio'];
  codeType = CodeType.cpp;
  outputType = OutputType.plain;
  lang = Lang.EN;

  constructor() {
    makeObservable(this, {
      autoSaveDelay: observable,
      fontSize: observable,
      codeType: observable,
      editorThemeType: observable,
      outputType: observable,
      lang: observable,
      setAutoSaveDelay: action.bound,
      setEditorThemeType: action.bound,
      setCodeType: action.bound,
      setOutputType: action.bound,
      setFontSize: action.bound,
      setLang: action.bound,
    });
    makePersistable(this, {
      name: 'EditorConfig',
      properties: [
        'autoSaveDelay',
        'fontSize',
        'editorThemeType',
        'codeType',
        'outputType',
        'lang',
      ],
      storage: window.localStorage,
    });
  }

  setCodeType(type: CodeType) {
    this.codeType = type;
  }

  setOutputType(type: OutputType) {
    this.outputType = type;
  }

  setEditorThemeType(type: ThemeType) {
    this.editorThemeType = type;
  }

  setAutoSaveDelay(delay: number) {
    this.autoSaveDelay = delay;
  }

  setFontSize(fontSize: number) {
    this.fontSize = fontSize;
  }

  setLang(lang: Lang) {
    this.lang = lang;
  }
}

export default new EditorConfig();
