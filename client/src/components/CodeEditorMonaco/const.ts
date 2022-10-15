import { CodeType } from '~utils/type';

export const template: Record<CodeType, string> = {
  [CodeType.cpp]: `#include<iostream>

int main(){
  std::cout << "hello world" << std::endl;
  return 0;
}
`,

  [CodeType.nodejs]: `console.log('hello world')`,
  [CodeType.go]: `package main

import "fmt"
  
func main () {
  fmt.Println("hello world")
}
  `,
  [CodeType.bash]: `echo hello world`,
  [CodeType.shell]: `echo hello world`,
};
