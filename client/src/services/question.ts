/*
 * @Todo: 请补充模块描述
 *
 * @Author: 夏洁琼
 * @Date: 2023-03-14 16:53:08
 *
 * Copyright © 2014-2023 Rabbitpre.com. All Rights Reserved.
 */

import request from '~utils/request';
import { PageInfo, ResponseList } from '~utils/type';

export interface GetQuestionsRequest extends PageInfo {
  keyword?: string;
}

export interface IQuestion {
  id?: number;
  name?: string;
  type?: string;
  template?: string;
  introduce?: string;
  answermd?: string;
  desc: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function getQuestions() {
  return request.get<IQuestion, ResponseList<IQuestion>>('/question/list');
}

export interface GetQuestionRequest {
  name?: string;
}

export function getQuestion(params: GetQuestionRequest) {
  return request.get<IQuestion, IQuestion>('/question', {
    params,
  });
}

export interface IExec {
  code: string;
  name: string;
}

export interface ExecResponse {
  output: string;
}

export function exec(data: IExec) {
  return request.post<ExecResponse, ExecResponse>('/question/exec', data);
}
