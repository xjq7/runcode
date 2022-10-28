import { useEffect } from 'react';
import { Terminal } from 'xterm';

function Component() {
  useEffect(() => {
    var term = new Terminal({ rows: 10 });
    term.open(document.querySelector('#terminal') as HTMLElement);
    term.write(
      `\u001b[01m\u001b[Kcode.c:\u001b[m\u001b[K In function '\u001b[01m\u001b[Kint main()\u001b[m\u001b[K':\r\n\u001b[01m\u001b[Kcode.c:6:1:\u001b[m\u001b[K \u001b[01;31m\u001b[Kerror: \u001b[m\u001b[Kexpected '\u001b[01m\u001b[K;\u001b[m\u001b[K' before '\u001b[01m\u001b[K}\u001b[m\u001b[K' token\r\n }\r\n\u001b[01;32m\u001b[K ^\u001b[m\u001b[K\r\n` +
        `\u001b[01m\u001b[Kcode.c:\u001b[m\u001b[K In function '\u001b[01m\u001b[Kint main()\u001b[m\u001b[K':\r\n\u001b[01m\u001b[Kcode.c:6:1:\u001b[m\u001b[K \u001b[01;31m\u001b[Kerror: \u001b[m\u001b[Kexpected '\u001b[01m\u001b[K;\u001b[m\u001b[K' before '\u001b[01m\u001b[K}\u001b[m\u001b[K' token\r\n }\r\n\u001b[01;32m\u001b[K ^\u001b[m\u001b[K\r\n` +
        `\u001b[01m\u001b[Kcode.c:\u001b[m\u001b[K In function '\u001b[01m\u001b[Kint main()\u001b[m\u001b[K':\r\n\u001b[01m\u001b[Kcode.c:6:1:\u001b[m\u001b[K \u001b[01;31m\u001b[Kerror: \u001b[m\u001b[Kexpected '\u001b[01m\u001b[K;\u001b[m\u001b[K' before '\u001b[01m\u001b[K}\u001b[m\u001b[K' token\r\n }\r\n\u001b[01;32m\u001b[K ^\u001b[m\u001b[K\r\n` +
        `\u001b[01m\u001b[Kcode.c:\u001b[m\u001b[K In function '\u001b[01m\u001b[Kint main()\u001b[m\u001b[K':\r\n\u001b[01m\u001b[Kcode.c:6:1:\u001b[m\u001b[K \u001b[01;31m\u001b[Kerror: \u001b[m\u001b[Kexpected '\u001b[01m\u001b[K;\u001b[m\u001b[K' before '\u001b[01m\u001b[K}\u001b[m\u001b[K' token\r\n }\r\n\u001b[01;32m\u001b[K ^\u001b[m\u001b[K\r\n` +
        `\u001b[01m\u001b[Kcode.c:\u001b[m\u001b[K In function '\u001b[01m\u001b[Kint main()\u001b[m\u001b[K':\r\n\u001b[01m\u001b[Kcode.c:6:1:\u001b[m\u001b[K \u001b[01;31m\u001b[Kerror: \u001b[m\u001b[Kexpected '\u001b[01m\u001b[K;\u001b[m\u001b[K' before '\u001b[01m\u001b[K}\u001b[m\u001b[K' token\r\n }\r\n\u001b[01;32m\u001b[K ^\u001b[m\u001b[K\r\n` +
        `\u001b[01m\u001b[Kcode.c:\u001b[m\u001b[K In function '\u001b[01m\u001b[Kint main()\u001b[m\u001b[K':\r\n\u001b[01m\u001b[Kcode.c:6:1:\u001b[m\u001b[K \u001b[01;31m\u001b[Kerror: \u001b[m\u001b[Kexpected '\u001b[01m\u001b[K;\u001b[m\u001b[K' before '\u001b[01m\u001b[K}\u001b[m\u001b[K' token\r\n }\r\n\u001b[01;32m\u001b[K ^\u001b[m\u001b[K\r\n` +
        `\u001b[01m\u001b[Kcode.c:\u001b[m\u001b[K In function '\u001b[01m\u001b[Kint main()\u001b[m\u001b[K':\r\n\u001b[01m\u001b[Kcode.c:6:1:\u001b[m\u001b[K \u001b[01;31m\u001b[Kerror: \u001b[m\u001b[Kexpected '\u001b[01m\u001b[K;\u001b[m\u001b[K' before '\u001b[01m\u001b[K}\u001b[m\u001b[K' token\r\n }\r\n\u001b[01;32m\u001b[K ^\u001b[m\u001b[K\r\n`
    );
    return () => {
      term.dispose();
    };
  }, []);

  return <div id="terminal"></div>;
}

export default Component;
