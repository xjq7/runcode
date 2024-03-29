import { CodeType } from '~utils/codeType';

export const template: Record<CodeType, string> = {
  [CodeType.cpp]: `#include <iostream>

int main() {
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
  [CodeType.python3]: `# encoding: utf-8
if __name__ == "__main__":
    print("hello world")
  `,
  [CodeType.python2]: `# encoding: utf-8
if __name__ == "__main__":
    print "hello world"
  `,
  [CodeType.java]: `class Code {
public
  static void main(String[] args) { 
    System.out.println("hello world!");
  }
}`,
  [CodeType.php]: `<?php

echo 'hello world!';`,
  [CodeType.rust]: `fn main(){
    println!("Hello, world!");
}
  `,
  [CodeType.c]: `#include <stdio.h>

int main() {
  printf("Hello, World");
  return (0);
}`,
  [CodeType.dotnet]: `using System;
namespace CodeApplication
{
    class Code
    {
      static void Main(string[] args)
      {
          // 这行代码解决中文打印乱码问题
          Console.OutputEncoding = System.Text.Encoding.UTF8;
          Console.WriteLine("Hello World!");
      }
    }
}`,
  [CodeType.ts]: `console.log('hello world')`,
};
