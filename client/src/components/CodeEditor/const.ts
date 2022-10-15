import { Text } from '@codemirror/state';
import { CodeType } from '../../../../common/type';

export const template: Record<CodeType, string | Text> = {
  [CodeType.cpp]: `#include<iostream>

int main(){
  std::cout << "hello world" << std::endl;
  return 0;
}
`,

  [CodeType.nodejs]: `console.log('hello world')`,
  [CodeType.go]: `
  #include<iostream>

  int main(){
    return 0;
  }
  `,
};
