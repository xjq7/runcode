import { CodeType } from '~utils/codeType';

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
  [CodeType.python3]: `# encoding: utf-8
if __name__ == "__main__":
  
    print("hello world")
  `,
  [CodeType.java]: `class Code {
    public static void main(String[] args) {
      System.out.println("hello world!");
    }
  }`,
  [CodeType.php]: `<?php

echo 'hello world!';`,
  [CodeType.rust]: `fn main(){
    println!("Hello, world!");
}
  `,
  [CodeType.scala]: `object Code {
    def main(args: Array[String]): Unit = {
        println("Hello, world!")
    }
}
  `,
};
