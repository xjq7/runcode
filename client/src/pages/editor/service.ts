import request from '~utils/request';
import { CodeType } from '~utils/codeType';

export interface IRunCodeRequest {
  type: CodeType;
  stdin?: string;
  code: string;
}

export interface IRunCodeResponse {
  code?: number;
  output?: string;
  message?: string;
  time?: number;
}

export function runCode(params: IRunCodeRequest): Promise<IRunCodeResponse> {
  return request.post('/code/run', params);
}
