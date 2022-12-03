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

export function getQuestions(params: GetQuestionsRequest) {
  return request.get<IQuestion, ResponseList<IQuestion>>('/question/list', {
    params,
  });
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
