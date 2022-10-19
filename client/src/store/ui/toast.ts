import { makeObservable, observable, action } from 'mobx';
import * as React from 'react';

export type position =
  | 'toast-start'
  | 'toast-center'
  | 'toast-end'
  | 'toast-top'
  | 'toast-middle'
  | 'toast-bottom';

export interface IToast {
  id?: string;
  positions?: position[];
  type?: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timeout?: number;
  containerStyle?: React.CSSProperties;
}

const randomString = () => Math.random().toString();

export class Toast {
  value: IToast[] = [];
  constructor() {
    makeObservable(this, {
      value: observable,
      add: action.bound,
    });
  }

  remove(id: string) {
    this.value = this.value.filter((o) => o.id !== id);
  }

  add(params: IToast) {
    const id = randomString();
    const { timeout = 2000 } = params;
    this.value.push({ id, ...params });
    setTimeout(() => {
      this.remove(id);
    }, timeout);
  }
}

export default new Toast();
