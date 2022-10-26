(function (e, t, n) {
  function i(n, s) {
    if (!t[n]) {
      if (!e[n]) {
        var o = typeof require == 'function' && require;
        if (!s && o) return o(n, !0);
        if (r) return r(n, !0);
        throw new Error("Cannot find module '" + n + "'");
      }
      var u = (t[n] = { exports: {} });
      e[n][0](
        function (t) {
          var r = e[n][1][t];
          return i(r ? r : t);
        },
        u,
        u.exports
      );
    }
    return t[n].exports;
  }
  var r = typeof require == 'function' && require;
  for (var s = 0; s < n.length; s++) i(n[s]);
  return i;
})(
  {
    1: [
      function (require, module, exports) {
        /*jshint browser:true */

        // starting out with just 10 rows, however if more are needed, they are added on demand
        var termcode = require('../index');
        window.terminal = termcode;
      },
      { '../index': 2 },
    ],
    2: [
      function (require, module, exports) {
        var Terminal = require('./term'),
          through = require('through');
        function style(parentElem) {
          var currentStyle = parentElem.getAttribute('style') || '';
          // TODO: make white-space work
          // white-space: pre has the following problem:
          // If applied before the terminal is visible, things break horribly
          // to the point that the output is either shifted to the left or not visible at all.
          // (at least for hyperwatch, to repro: -- npm install hyperwatch; npm explore hyperwatch; npm run demo; )
          //  - most likely due to the fact that hyperwatch is positioned absolute
          //
          // However when this style is set after the parent element became visible, it works fine.
          parentElem.setAttribute(
            'style',
            currentStyle + 'overflow-y: auto; /* white-space: pre; */'
          );
        }

        function scroll(elem) {
          if (!elem) return;
          elem.scrollTop = elem.scrollHeight;
        }

        module.exports = function (opts) {
          var term = new Terminal(opts);
          term.open();

          var hypernal = through(term.write.bind(term));
          hypernal.appendTo = function (parent) {
            if (typeof parent === 'string')
              parent = document.querySelector(parent);

            parent.appendChild(term.element);
            style(parent);
            hypernal.container = parent;
            term.element.style.position = 'relative';
          };

          hypernal.writeln = function (line) {
            term.writeln(line);
            if (hypernal.tail) scroll(hypernal.container);
          };

          hypernal.write = function (data) {
            term.write(data);
            if (hypernal.tail) scroll(hypernal.container);
          };

          // convenience shortcuts
          hypernal.reset = term.reset.bind(term);
          hypernal.element = term.element;

          // the underlying term for all other needs
          hypernal.term = term;

          return hypernal;
        };
      },
      { './term': 3, through: 4 },
    ],
    3: [
      function (require, module, exports) {
        var states = require('./lib/states');

        module.exports = Terminal;

        function Terminal(opts) {
          opts = opts || {};
          if (!(this instanceof Terminal)) return new Terminal(opts);

          this.cols = opts.cols || 500;
          this.rows = opts.rows || 100;

          this.ybase = 0;
          this.ydisp = 0;
          this.x = 0;
          this.y = 0;
          this.cursorState = 0;
          this.cursorHidden = false;
          this.convertEol = false;
          this.state = states.normal;
          this.queue = '';
          this.scrollTop = 0;
          this.scrollBottom = this.rows - 1;

          // modes
          this.applicationKeypad = false;
          this.originMode = false;
          this.insertMode = false;
          this.wraparoundMode = false;
          this.normal = null;

          // charset
          this.charset = null;
          this.gcharset = null;
          this.glevel = 0;
          this.charsets = [null];

          // misc
          this.element;
          this.children;
          this.refreshStart;
          this.refreshEnd;
          this.savedX;
          this.savedY;
          this.savedCols;

          // stream
          this.readable = true;
          this.writable = true;

          this.defAttr = (257 << 9) | 256;
          this.curAttr = this.defAttr;

          this.params = [];
          this.currentParam = 0;
          this.prefix = '';
          this.postfix = '';

          this.lines = [];
          var i = this.rows;
          while (i--) {
            this.lines.push(this.blankLine());
          }

          this.tabs;
          this.setupStops();
        }

        require('./lib/colors')(Terminal);
        require('./lib/options')(Terminal);

        require('./lib/open')(Terminal);
        require('./lib/destroy')(Terminal);
        require('./lib/refresh')(Terminal);

        require('./lib/write')(Terminal);

        require('./lib/setgLevel');
        require('./lib/setgCharset');

        require('./lib/debug')(Terminal);

        require('./lib/stops')(Terminal);

        require('./lib/erase')(Terminal);
        require('./lib/blankLine')(Terminal);
        require('./lib/range')(Terminal);
        require('./lib/util')(Terminal);

        require('./lib/esc/index.js')(Terminal);
        require('./lib/esc/reset.js')(Terminal);
        require('./lib/esc/tabSet.js')(Terminal);

        require('./lib/csi/charAttributes')(Terminal);
        require('./lib/csi/insert-delete')(Terminal);
        require('./lib/csi/position')(Terminal);
        require('./lib/csi/cursor')(Terminal);
        require('./lib/csi/repeatPrecedingCharacter')(Terminal);
        require('./lib/csi/tabClear')(Terminal);
        require('./lib/csi/softReset')(Terminal);

        require('./lib/charsets.js')(Terminal);
      },
      {
        './lib/esc/index.js': 5,
        './lib/esc/reset.js': 6,
        './lib/esc/tabSet.js': 7,
        './lib/charsets.js': 8,
        './lib/states': 9,
        './lib/options': 10,
        './lib/destroy': 11,
        './lib/open': 12,
        './lib/write': 13,
        './lib/refresh': 14,
        './lib/setgLevel': 15,
        './lib/colors': 16,
        './lib/setgCharset': 17,
        './lib/stops': 18,
        './lib/debug': 19,
        './lib/erase': 20,
        './lib/blankLine': 21,
        './lib/range': 22,
        './lib/util': 23,
        './lib/csi/charAttributes': 24,
        './lib/csi/insert-delete': 25,
        './lib/csi/cursor': 26,
        './lib/csi/position': 27,
        './lib/csi/repeatPrecedingCharacter': 28,
        './lib/csi/softReset': 29,
        './lib/csi/tabClear': 30,
      },
    ],
    31: [
      function (require, module, exports) {
        // shim for using process in browser

        var process = (module.exports = {});

        process.nextTick = (function () {
          var canSetImmediate =
            typeof window !== 'undefined' && window.setImmediate;
          var canPost =
            typeof window !== 'undefined' &&
            window.postMessage &&
            window.addEventListener;
          if (canSetImmediate) {
            return function (f) {
              return window.setImmediate(f);
            };
          }

          if (canPost) {
            var queue = [];
            window.addEventListener(
              'message',
              function (ev) {
                var source = ev.source;
                if (
                  (source === window || source === null) &&
                  ev.data === 'process-tick'
                ) {
                  ev.stopPropagation();
                  if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                  }
                }
              },
              true
            );

            return function nextTick(fn) {
              queue.push(fn);
              window.postMessage('process-tick', '*');
            };
          }

          return function nextTick(fn) {
            setTimeout(fn, 0);
          };
        })();

        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];

        process.binding = function (name) {
          throw new Error('process.binding is not supported');
        };

        // TODO(shtylman)
        process.cwd = function () {
          return '/';
        };
        process.chdir = function (dir) {
          throw new Error('process.chdir is not supported');
        };
      },
      {},
    ],
    4: [
      function (require, module, exports) {
        (function (process) {
          var Stream = require('stream');

          // through
          //
          // a stream that does nothing but re-emit the input.
          // useful for aggregating a series of changing but not ending streams into one stream)

          exports = module.exports = through;
          through.through = through;

          //create a readable writable stream.

          function through(write, end, opts) {
            write =
              write ||
              function (data) {
                this.queue(data);
              };
            end =
              end ||
              function () {
                this.queue(null);
              };

            var ended = false,
              destroyed = false,
              buffer = [],
              _ended = false;
            var stream = new Stream();
            stream.readable = stream.writable = true;
            stream.paused = false;

            //  stream.autoPause   = !(opts && opts.autoPause   === false)
            stream.autoDestroy = !(opts && opts.autoDestroy === false);

            stream.write = function (data) {
              write.call(this, data);
              return !stream.paused;
            };

            function drain() {
              while (buffer.length && !stream.paused) {
                var data = buffer.shift();
                if (null === data) return stream.emit('end');
                else stream.emit('data', data);
              }
            }

            stream.queue = stream.push = function (data) {
              //    console.error(ended)
              if (_ended) return stream;
              if (data === null) _ended = true;
              buffer.push(data);
              drain();
              return stream;
            };

            //this will be registered as the first 'end' listener
            //must call destroy next tick, to make sure we're after any
            //stream piped from here.
            //this is only a problem if end is not emitted synchronously.
            //a nicer way to do this is to make sure this is the last listener for 'end'

            stream.on('end', function () {
              stream.readable = false;
              if (!stream.writable && stream.autoDestroy)
                process.nextTick(function () {
                  stream.destroy();
                });
            });

            function _end() {
              stream.writable = false;
              end.call(stream);
              if (!stream.readable && stream.autoDestroy) stream.destroy();
            }

            stream.end = function (data) {
              if (ended) return;
              ended = true;
              if (arguments.length) stream.write(data);
              _end(); // will emit or queue
              return stream;
            };

            stream.destroy = function () {
              if (destroyed) return;
              destroyed = true;
              ended = true;
              buffer.length = 0;
              stream.writable = stream.readable = false;
              stream.emit('close');
              return stream;
            };

            stream.pause = function () {
              if (stream.paused) return;
              stream.paused = true;
              return stream;
            };

            stream.resume = function () {
              if (stream.paused) {
                stream.paused = false;
                stream.emit('resume');
              }
              drain();
              //may have become paused again,
              //as drain emits 'data'.
              if (!stream.paused) stream.emit('drain');
              return stream;
            };
            return stream;
          }
        })(require('__browserify_process'));
      },
      { stream: 32, __browserify_process: 31 },
    ],
    6: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          // ESC c Full Reset (RIS).
          Terminal.prototype.reset = function () {
            Terminal.call(this, this.cols, this.rows);
            this.refresh(0, this.rows - 1);
          };
        };
      },
      {},
    ],
    8: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          Terminal.charsets = {};

          // DEC Special Character and Line Drawing Set.
          // http://vt100.net/docs/vt102-ug/table5-13.html
          // A lot of curses apps use this if they see TERM=xterm.
          // testing: echo -e '\e(0a\e(B'
          // The xterm output sometimes seems to conflict with the
          // reference above. xterm seems in line with the reference
          // when running vttest however.
          // The table below now uses xterm's output from vttest.
          Terminal.charsets.SCLD = {
            // (0
            '`': '\u25c6', // '◆'
            a: '\u2592', // '▒'
            b: '\u0009', // '\t'
            c: '\u000c', // '\f'
            d: '\u000d', // '\r'
            e: '\u000a', // '\n'
            f: '\u00b0', // '°'
            g: '\u00b1', // '±'
            h: '\u2424', // '\u2424' (NL)
            i: '\u000b', // '\v'
            j: '\u2518', // '┘'
            k: '\u2510', // '┐'
            l: '\u250c', // '┌'
            m: '\u2514', // '└'
            n: '\u253c', // '┼'
            o: '\u23ba', // '⎺'
            p: '\u23bb', // '⎻'
            q: '\u2500', // '─'
            r: '\u23bc', // '⎼'
            s: '\u23bd', // '⎽'
            t: '\u251c', // '├'
            u: '\u2524', // '┤'
            v: '\u2534', // '┴'
            w: '\u252c', // '┬'
            x: '\u2502', // '│'
            y: '\u2264', // '≤'
            z: '\u2265', // '≥'
            '{': '\u03c0', // 'π'
            '|': '\u2260', // '≠'
            '}': '\u00a3', // '£'
            '~': '\u00b7', // '·'
          };

          Terminal.charsets.UK = null; // (A
          Terminal.charsets.US = null; // (B (USASCII)
          Terminal.charsets.Dutch = null; // (4
          Terminal.charsets.Finnish = null; // (C or (5
          Terminal.charsets.French = null; // (R
          Terminal.charsets.FrenchCanadian = null; // (Q
          Terminal.charsets.German = null; // (K
          Terminal.charsets.Italian = null; // (Y
          Terminal.charsets.NorwegianDanish = null; // (E or (6
          Terminal.charsets.Spanish = null; // (Z
          Terminal.charsets.Swedish = null; // (H or (7
          Terminal.charsets.Swiss = null; // (=
          Terminal.charsets.ISOLatin = null; // /A
        };
      },
      {},
    ],
    9: [
      function (require, module, exports) {
        module.exports = {
          normal: 0,
          escaped: 1,
          csi: 2,
          osc: 3,
          charset: 4,
          dcs: 5,
          ignore: 6,
        };
      },
      {},
    ],
    14: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          /**
           * Rendering Engine
           */

          // In the screen buffer, each character
          // is stored as a an array with a character
          // and a 32-bit integer.
          // First value: a utf-16 character.
          // Second value:
          // Next 9 bits: background color (0-511).
          // Next 9 bits: foreground color (0-511).
          // Next 14 bits: a mask for misc. flags:
          // 1=bold, 2=underline, 4=inverse

          Terminal.prototype.refresh = function (start, end) {
            var x,
              y,
              i,
              line,
              out,
              ch,
              width,
              data,
              attr,
              fgColor,
              bgColor,
              flags,
              row,
              parent;

            width = this.cols;
            y = start;

            for (; y <= end; y++) {
              row = y + this.ydisp;

              line = this.lines[row];
              if (!line) {
                // simple solution in case we have more lines than rows
                // could be improved to instead remove first line (and related html element)
                return this.reset();
              }

              out = '';

              if (
                y === this.y &&
                this.cursorState &&
                this.ydisp === this.ybase &&
                !this.cursorHidden
              ) {
                x = this.x;
              } else {
                x = -1;
              }

              attr = this.defAttr;
              i = 0;

              for (; i < width; i++) {
                data = line[i][0];
                ch = line[i][1];

                if (i === x) data = -1;

                if (data !== attr) {
                  if (attr !== this.defAttr) {
                    out += '</span>';
                  }
                  if (data !== this.defAttr) {
                    if (data === -1) {
                      out += '<span class="reverse-video">';
                    } else {
                      out += '<span style="';

                      bgColor = data & 0x1ff;
                      fgColor = (data >> 9) & 0x1ff;
                      flags = data >> 18;

                      if (flags & 1) {
                        if (!Terminal.brokenBold) {
                          out += 'font-weight:bold;';
                        }
                        // see: XTerm*boldColors
                        if (fgColor < 8) fgColor += 8;
                      }

                      if (flags & 2) {
                        out += 'text-decoration:underline;';
                      }

                      if (bgColor !== 256) {
                        out +=
                          'background-color:' + Terminal.colors[bgColor] + ';';
                      }

                      if (fgColor !== 257) {
                        out += 'color:' + Terminal.colors[fgColor] + ';';
                      }

                      out += '">';
                    }
                  }
                }

                switch (ch) {
                  case '&':
                    out += '&';
                    break;
                  case '<':
                    out += '<';
                    break;
                  case '>':
                    out += '>';
                    break;
                  default:
                    if (ch <= ' ') {
                      out += ' ';
                    } else {
                      out += ch;
                    }
                    break;
                }

                attr = data;
              }

              if (attr !== this.defAttr) {
                out += '</span>';
              }

              this.children[y].innerHTML = out;
            }

            if (parent) parent.appendChild(this.element);
          };
        };
      },
      {},
    ],
    11: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          Terminal.prototype.destroy = function () {
            this.readable = false;
            this.writable = false;
            this._events = {};
            this.handler = function () {};
            this.write = function () {};
          };
        };
      },
      {},
    ],
    16: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          // Colors 0-15
          Terminal.colors = [
            // dark:
            '#2e3436',
            '#cc0000',
            '#4e9a06',
            '#c4a000',
            '#3465a4',
            '#75507b',
            '#06989a',
            '#d3d7cf',
            // bright:
            '#555753',
            '#ef2929',
            '#8ae234',
            '#fce94f',
            '#729fcf',
            '#ad7fa8',
            '#34e2e2',
            '#eeeeec',
          ];

          // Colors 16-255
          // Much thanks to TooTallNate for writing this.
          Terminal.colors = (function () {
            var colors = Terminal.colors,
              r = [0x00, 0x5f, 0x87, 0xaf, 0xd7, 0xff],
              i;

            // 16-231
            i = 0;
            for (; i < 216; i++) {
              out(r[(i / 36) % 6 | 0], r[(i / 6) % 6 | 0], r[i % 6]);
            }

            // 232-255 (grey)
            i = 0;
            for (; i < 24; i++) {
              r = 8 + i * 10;
              out(r, r, r);
            }

            function out(r, g, b) {
              colors.push('#' + hex(r) + hex(g) + hex(b));
            }

            function hex(c) {
              c = c.toString(16);
              return c.length < 2 ? '0' + c : c;
            }

            return colors;
          })();

          // Default BG/FG
          Terminal.defaultColors = {
            bg: '#000000',
            fg: '#f0f0f0',
          };

          Terminal.colors[256] = Terminal.defaultColors.bg;
          Terminal.colors[257] = Terminal.defaultColors.fg;
        };
      },
      {},
    ],
    15: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          Terminal.prototype.setgLevel = function (g) {
            this.glevel = g;
            this.charset = this.charsets[g];
          };
        };
      },
      {},
    ],
    12: [
      function (require, module, exports) {
        // if bold is broken, we can't
        // use it in the terminal.
        function isBoldBroken() {
          var el = document.createElement('span');
          el.innerHTML = 'hello world';
          document.body.appendChild(el);
          var w1 = el.scrollWidth;
          el.style.fontWeight = 'bold';
          var w2 = el.scrollWidth;
          document.body.removeChild(el);
          return w1 !== w2;
        }

        module.exports = function (Terminal) {
          /**
           * Open Terminal
           */

          Terminal.prototype.open = function () {
            var self = this,
              i = 0,
              div;

            this.element = document.createElement('div');
            this.element.className = 'terminal';
            this.children = [];

            for (; i < this.rows; i++) {
              div = document.createElement('div');
              this.element.appendChild(div);
              this.children.push(div);
            }

            this.refresh(0, this.rows - 1);

            // XXX - hack, move this somewhere else.
            if (Terminal.brokenBold === null) {
              Terminal.brokenBold = isBoldBroken();
            }

            // sync default bg/fg colors
            this.element.style.backgroundColor = Terminal.defaultColors.bg;
            this.element.style.color = Terminal.defaultColors.fg;
          };
        };
      },
      {},
    ],
    18: [
      function (require, module, exports) {
        // ignore warnings regarging == and != (coersion makes things work here appearently)

        module.exports = function (Terminal) {
          Terminal.prototype.setupStops = function (i) {
            if (i != null) {
              if (!this.tabs[i]) {
                i = this.prevStop(i);
              }
            } else {
              this.tabs = {};
              i = 0;
            }

            for (; i < this.cols; i += 8) {
              this.tabs[i] = true;
            }
          };

          Terminal.prototype.prevStop = function (x) {
            if (x == null) x = this.x;
            while (!this.tabs[--x] && x > 0);
            return x >= this.cols ? this.cols - 1 : x < 0 ? 0 : x;
          };

          Terminal.prototype.nextStop = function (x) {
            if (x == null) x = this.x;
            while (!this.tabs[++x] && x < this.cols);
            return x >= this.cols ? this.cols - 1 : x < 0 ? 0 : x;
          };
        };
      },
      {},
    ],
    19: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          Terminal.prototype.log = function () {
            if (!Terminal.debug) return;
            if (!window.console || !window.console.log) return;
            var args = Array.prototype.slice.call(arguments);
            window.console.log.apply(window.console, args);
          };

          Terminal.prototype.error = function () {
            if (!Terminal.debug) return;
            if (!window.console || !window.console.error) return;
            var args = Array.prototype.slice.call(arguments);
            window.console.error.apply(window.console, args);
          };
        };
      },
      {},
    ],
    17: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          Terminal.prototype.setgCharset = function (g, charset) {
            this.charsets[g] = charset;
            if (this.glevel === g) {
              this.charset = charset;
            }
          };
        };
      },
      {},
    ],
    20: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          Terminal.prototype.eraseRight = function (x, y) {
            var line = this.lines[this.ybase + y],
              ch = [this.curAttr, ' ']; // xterm

            for (; x < this.cols; x++) {
              line[x] = ch;
            }

            this.updateRange(y);
          };

          Terminal.prototype.eraseLeft = function (x, y) {
            var line = this.lines[this.ybase + y],
              ch = [this.curAttr, ' ']; // xterm

            x++;
            while (x--) line[x] = ch;

            this.updateRange(y);
          };

          Terminal.prototype.eraseLine = function (y) {
            this.eraseRight(0, y);
          };

          // CSI Ps J Erase in Display (ED).
          // Ps = 0 -> Erase Below (default).
          // Ps = 1 -> Erase Above.
          // Ps = 2 -> Erase All.
          // Ps = 3 -> Erase Saved Lines (xterm).
          // CSI ? Ps J
          // Erase in Display (DECSED).
          // Ps = 0 -> Selective Erase Below (default).
          // Ps = 1 -> Selective Erase Above.
          // Ps = 2 -> Selective Erase All.
          Terminal.prototype.eraseInDisplay = function (params) {
            var j;
            switch (params[0]) {
              case 0:
                this.eraseRight(this.x, this.y);
                j = this.y + 1;
                for (; j < this.rows; j++) {
                  this.eraseLine(j);
                }
                break;
              case 1:
                this.eraseLeft(this.x, this.y);
                j = this.y;
                while (j--) {
                  this.eraseLine(j);
                }
                break;
              case 2:
                j = this.rows;
                while (j--) this.eraseLine(j);
                break;
              case 3: // no saved lines
                break;
            }
          };

          // CSI Ps K Erase in Line (EL).
          // Ps = 0 -> Erase to Right (default).
          // Ps = 1 -> Erase to Left.
          // Ps = 2 -> Erase All.
          // CSI ? Ps K
          // Erase in Line (DECSEL).
          // Ps = 0 -> Selective Erase to Right (default).
          // Ps = 1 -> Selective Erase to Left.
          // Ps = 2 -> Selective Erase All.
          Terminal.prototype.eraseInLine = function (params) {
            switch (params[0]) {
              case 0:
                this.eraseRight(this.x, this.y);
                break;
              case 1:
                this.eraseLeft(this.x, this.y);
                break;
              case 2:
                this.eraseLine(this.y);
                break;
            }
          };
        };
      },
      {},
    ],
    21: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          Terminal.prototype.blankLine = function (cur) {
            var attr = cur ? this.curAttr : this.defAttr;

            var ch = [attr, ' '],
              line = [],
              i = 0;

            for (; i < this.cols; i++) {
              line[i] = ch;
            }

            return line;
          };
        };
      },
      {},
    ],
    10: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          Terminal.termName = 'xterm';
          Terminal.geometry = [80, 24];
          Terminal.cursorBlink = true;
          Terminal.visualBell = false;
          Terminal.popOnBell = false;
          Terminal.scrollback = 1000;
          Terminal.screenKeys = false;
          Terminal.programFeatures = false;
          Terminal.debug = false;
        };
      },
      {},
    ],
    22: [
      function (require, module, exports) {
        function addRowsOnDemand() {
          while (this.y >= this.rows) {
            this.lines.push(this.blankLine());
            var div = document.createElement('div');
            this.element.appendChild(div);
            this.children.push(div);

            this.rows++;
          }
        }

        module.exports = function (Terminal) {
          Terminal.prototype.updateRange = function (y) {
            if (y < this.refreshStart) this.refreshStart = y;
            if (y > this.refreshEnd) this.refreshEnd = y;
            addRowsOnDemand.bind(this)();
          };

          Terminal.prototype.maxRange = function () {
            this.refreshStart = 0;
            this.refreshEnd = this.rows - 1;
          };
        };
      },
      {},
    ],
    23: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          Terminal.prototype.ch = function (cur) {
            return cur ? [this.curAttr, ' '] : [this.defAttr, ' '];
          };

          Terminal.prototype.is = function (term) {
            var name = this.termName || Terminal.termName;
            return (name + '').indexOf(term) === 0;
          };
        };
      },
      {},
    ],
    25: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          // CSI Ps @
          // Insert Ps (Blank) Character(s) (default = 1) (ICH).
          Terminal.prototype.insertChars = function (params) {
            var param, row, j, ch;

            param = params[0];
            if (param < 1) param = 1;

            row = this.y + this.ybase;
            j = this.x;
            ch = [this.curAttr, ' ']; // xterm

            while (param-- && j < this.cols) {
              this.lines[row].splice(j++, 0, ch);
              this.lines[row].pop();
            }
          };

          // CSI Ps L
          // Insert Ps Line(s) (default = 1) (IL).
          Terminal.prototype.insertLines = function (params) {
            var param, row, j;

            param = params[0];
            if (param < 1) param = 1;
            row = this.y + this.ybase;

            j = this.rows - 1 - this.scrollBottom;
            j = this.rows - 1 + this.ybase - j + 1;

            while (param--) {
              // test: echo -e '\e[44m\e[1L\e[0m'
              // blankLine(true) - xterm/linux behavior
              this.lines.splice(row, 0, this.blankLine(true));
              this.lines.splice(j, 1);
            }

            // this.maxRange();
            this.updateRange(this.y);
            this.updateRange(this.scrollBottom);
          };

          // CSI Ps M
          // Delete Ps Line(s) (default = 1) (DL).
          Terminal.prototype.deleteLines = function (params) {
            var param, row, j;

            param = params[0];
            if (param < 1) param = 1;
            row = this.y + this.ybase;

            j = this.rows - 1 - this.scrollBottom;
            j = this.rows - 1 + this.ybase - j;

            while (param--) {
              // test: echo -e '\e[44m\e[1M\e[0m'
              // blankLine(true) - xterm/linux behavior
              this.lines.splice(j + 1, 0, this.blankLine(true));
              this.lines.splice(row, 1);
            }

            // this.maxRange();
            this.updateRange(this.y);
            this.updateRange(this.scrollBottom);
          };

          // CSI Ps P
          // Delete Ps Character(s) (default = 1) (DCH).
          Terminal.prototype.deleteChars = function (params) {
            var param, row, ch;

            param = params[0];
            if (param < 1) param = 1;

            row = this.y + this.ybase;
            ch = [this.curAttr, ' ']; // xterm

            while (param--) {
              this.lines[row].splice(this.x, 1);
              this.lines[row].push(ch);
            }
          };

          // CSI Ps X
          // Erase Ps Character(s) (default = 1) (ECH).
          Terminal.prototype.eraseChars = function (params) {
            var param, row, j, ch;

            param = params[0];
            if (param < 1) param = 1;

            row = this.y + this.ybase;
            j = this.x;
            ch = [this.curAttr, ' ']; // xterm

            while (param-- && j < this.cols) {
              this.lines[row][j++] = ch;
            }
          };
        };
      },
      {},
    ],
    28: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          // CSI Ps b Repeat the preceding graphic character Ps times (REP).
          Terminal.prototype.repeatPrecedingCharacter = function (params) {
            var param = params[0] || 1,
              line = this.lines[this.ybase + this.y],
              ch = line[this.x - 1] || [this.defAttr, ' '];

            while (param--) line[this.x++] = ch;
          };
        };
      },
      {},
    ],
    26: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          // CSI s
          // Save cursor (ANSI.SYS).
          Terminal.prototype.saveCursor = function (params) {
            this.savedX = this.x;
            this.savedY = this.y;
          };

          // CSI u
          // Restore cursor (ANSI.SYS).
          Terminal.prototype.restoreCursor = function (params) {
            this.x = this.savedX || 0;
            this.y = this.savedY || 0;
          };

          // CSI Ps A
          // Cursor Up Ps Times (default = 1) (CUU).
          Terminal.prototype.cursorUp = function (params) {
            var param = params[0];
            if (param < 1) param = 1;
            this.y -= param;
            if (this.y < 0) this.y = 0;
          };

          // CSI Ps B
          // Cursor Down Ps Times (default = 1) (CUD).
          Terminal.prototype.cursorDown = function (params) {
            var param = params[0];
            if (param < 1) param = 1;
            this.y += param;
            if (this.y >= this.rows) {
              this.y = this.rows - 1;
            }
          };

          // CSI Ps C
          // Cursor Forward Ps Times (default = 1) (CUF).
          Terminal.prototype.cursorForward = function (params) {
            var param = params[0];
            if (param < 1) param = 1;
            this.x += param;
            if (this.x >= this.cols) {
              this.x = this.cols - 1;
            }
          };

          // CSI Ps D
          // Cursor Backward Ps Times (default = 1) (CUB).
          Terminal.prototype.cursorBackward = function (params) {
            var param = params[0];
            if (param < 1) param = 1;
            this.x -= param;
            if (this.x < 0) this.x = 0;
          };

          // CSI Ps ; Ps H
          // Cursor Position [row;column] (default = [1,1]) (CUP).
          Terminal.prototype.cursorPos = function (params) {
            var row, col;

            row = params[0] - 1;

            if (params.length >= 2) {
              col = params[1] - 1;
            } else {
              col = 0;
            }

            if (row < 0) {
              row = 0;
            } else if (row >= this.rows) {
              row = this.rows - 1;
            }

            if (col < 0) {
              col = 0;
            } else if (col >= this.cols) {
              col = this.cols - 1;
            }

            this.x = col;
            this.y = row;
          };

          // CSI Ps E
          // Cursor Next Line Ps Times (default = 1) (CNL).
          // same as CSI Ps B ?
          Terminal.prototype.cursorNextLine = function (params) {
            var param = params[0];
            if (param < 1) param = 1;
            this.y += param;
            if (this.y >= this.rows) {
              this.y = this.rows - 1;
            }
            this.x = 0;
          };

          // CSI Ps F
          // Cursor Preceding Line Ps Times (default = 1) (CNL).
          // reuse CSI Ps A ?
          Terminal.prototype.cursorPrecedingLine = function (params) {
            var param = params[0];
            if (param < 1) param = 1;
            this.y -= param;
            if (this.y < 0) this.y = 0;
            this.x = 0;
          };

          // CSI Ps G
          // Cursor Character Absolute [column] (default = [row,1]) (CHA).
          Terminal.prototype.cursorCharAbsolute = function (params) {
            var param = params[0];
            if (param < 1) param = 1;
            this.x = param - 1;
          };

          // CSI Ps I
          // Cursor Forward Tabulation Ps tab stops (default = 1) (CHT).
          Terminal.prototype.cursorForwardTab = function (params) {
            var param = params[0] || 1;
            while (param--) {
              this.x = this.nextStop();
            }
          };

          // CSI Ps Z Cursor Backward Tabulation Ps tab stops (default = 1) (CBT).
          Terminal.prototype.cursorBackwardTab = function (params) {
            var param = params[0] || 1;
            while (param--) {
              this.x = this.prevStop();
            }
          };
        };
      },
      {},
    ],
    27: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          // CSI Pm ` Character Position Absolute
          // [column] (default = [row,1]) (HPA).
          Terminal.prototype.charPosAbsolute = function (params) {
            var param = params[0];
            if (param < 1) param = 1;
            this.x = param - 1;
            if (this.x >= this.cols) {
              this.x = this.cols - 1;
            }
          };

          // 141 61 a * HPR -
          // Horizontal Position Relative
          // reuse CSI Ps C ?
          Terminal.prototype.HPositionRelative = function (params) {
            var param = params[0];
            if (param < 1) param = 1;
            this.x += param;
            if (this.x >= this.cols) {
              this.x = this.cols - 1;
            }
          };

          // CSI Pm d
          // Line Position Absolute [row] (default = [1,column]) (VPA).
          Terminal.prototype.linePosAbsolute = function (params) {
            var param = params[0];
            if (param < 1) param = 1;
            this.y = param - 1;
            if (this.y >= this.rows) {
              this.y = this.rows - 1;
            }
          };

          // 145 65 e * VPR - Vertical Position Relative
          // reuse CSI Ps B ?
          Terminal.prototype.VPositionRelative = function (params) {
            var param = params[0];
            if (param < 1) param = 1;
            this.y += param;
            if (this.y >= this.rows) {
              this.y = this.rows - 1;
            }
          };

          // CSI Ps ; Ps f
          // Horizontal and Vertical Position [row;column] (default =
          // [1,1]) (HVP).
          Terminal.prototype.HVPosition = function (params) {
            if (params[0] < 1) params[0] = 1;
            if (params[1] < 1) params[1] = 1;

            this.y = params[0] - 1;
            if (this.y >= this.rows) {
              this.y = this.rows - 1;
            }

            this.x = params[1] - 1;
            if (this.x >= this.cols) {
              this.x = this.cols - 1;
            }
          };
        };
      },
      {},
    ],
    24: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          // CSI Pm m Character Attributes (SGR).
          // Ps = 0 -> Normal (default).
          // Ps = 1 -> Bold.
          // Ps = 4 -> Underlined.
          // Ps = 5 -> Blink (appears as Bold).
          // Ps = 7 -> Inverse.
          // Ps = 8 -> Invisible, i.e., hidden (VT300).
          // Ps = 2 2 -> Normal (neither bold nor faint).
          // Ps = 2 4 -> Not underlined.
          // Ps = 2 5 -> Steady (not blinking).
          // Ps = 2 7 -> Positive (not inverse).
          // Ps = 2 8 -> Visible, i.e., not hidden (VT300).
          // Ps = 3 0 -> Set foreground color to Black.
          // Ps = 3 1 -> Set foreground color to Red.
          // Ps = 3 2 -> Set foreground color to Green.
          // Ps = 3 3 -> Set foreground color to Yellow.
          // Ps = 3 4 -> Set foreground color to Blue.
          // Ps = 3 5 -> Set foreground color to Magenta.
          // Ps = 3 6 -> Set foreground color to Cyan.
          // Ps = 3 7 -> Set foreground color to White.
          // Ps = 3 9 -> Set foreground color to default (original).
          // Ps = 4 0 -> Set background color to Black.
          // Ps = 4 1 -> Set background color to Red.
          // Ps = 4 2 -> Set background color to Green.
          // Ps = 4 3 -> Set background color to Yellow.
          // Ps = 4 4 -> Set background color to Blue.
          // Ps = 4 5 -> Set background color to Magenta.
          // Ps = 4 6 -> Set background color to Cyan.
          // Ps = 4 7 -> Set background color to White.
          // Ps = 4 9 -> Set background color to default (original).

          // If 16-color support is compiled, the following apply. Assume
          // that xterm's resources are set so that the ISO color codes are
          // the first 8 of a set of 16. Then the aixterm colors are the
          // bright versions of the ISO colors:
          // Ps = 9 0 -> Set foreground color to Black.
          // Ps = 9 1 -> Set foreground color to Red.
          // Ps = 9 2 -> Set foreground color to Green.
          // Ps = 9 3 -> Set foreground color to Yellow.
          // Ps = 9 4 -> Set foreground color to Blue.
          // Ps = 9 5 -> Set foreground color to Magenta.
          // Ps = 9 6 -> Set foreground color to Cyan.
          // Ps = 9 7 -> Set foreground color to White.
          // Ps = 1 0 0 -> Set background color to Black.
          // Ps = 1 0 1 -> Set background color to Red.
          // Ps = 1 0 2 -> Set background color to Green.
          // Ps = 1 0 3 -> Set background color to Yellow.
          // Ps = 1 0 4 -> Set background color to Blue.
          // Ps = 1 0 5 -> Set background color to Magenta.
          // Ps = 1 0 6 -> Set background color to Cyan.
          // Ps = 1 0 7 -> Set background color to White.

          // If xterm is compiled with the 16-color support disabled, it
          // supports the following, from rxvt:
          // Ps = 1 0 0 -> Set foreground and background color to
          // default.

          // If 88- or 256-color support is compiled, the following apply.
          // Ps = 3 8 ; 5 ; Ps -> Set foreground color to the second
          // Ps.
          // Ps = 4 8 ; 5 ; Ps -> Set background color to the second
          // Ps.
          Terminal.prototype.charAttributes = function (params) {
            var l = params.length,
              i = 0,
              bg,
              fg,
              p;

            for (; i < l; i++) {
              p = params[i];
              if (p >= 30 && p <= 37) {
                // fg color 8
                this.curAttr = (this.curAttr & ~(0x1ff << 9)) | ((p - 30) << 9);
              } else if (p >= 40 && p <= 47) {
                // bg color 8
                this.curAttr = (this.curAttr & ~0x1ff) | (p - 40);
              } else if (p >= 90 && p <= 97) {
                // fg color 16
                p += 8;
                this.curAttr = (this.curAttr & ~(0x1ff << 9)) | ((p - 90) << 9);
              } else if (p >= 100 && p <= 107) {
                // bg color 16
                p += 8;
                this.curAttr = (this.curAttr & ~0x1ff) | (p - 100);
              } else if (p === 0) {
                // default
                this.curAttr = this.defAttr;
              } else if (p === 1) {
                // bold text
                this.curAttr = this.curAttr | (1 << 18);
              } else if (p === 4) {
                // underlined text
                this.curAttr = this.curAttr | (2 << 18);
              } else if (p === 7 || p === 27) {
                // inverse and positive
                // test with: echo -e '\e[31m\e[42mhello\e[7mworld\e[27mhi\e[m'
                if (p === 7) {
                  if ((this.curAttr >> 18) & 4) continue;
                  this.curAttr = this.curAttr | (4 << 18);
                } else if (p === 27) {
                  if (~(this.curAttr >> 18) & 4) continue;
                  this.curAttr = this.curAttr & ~(4 << 18);
                }

                bg = this.curAttr & 0x1ff;
                fg = (this.curAttr >> 9) & 0x1ff;

                this.curAttr = (this.curAttr & ~0x3ffff) | ((bg << 9) | fg);
              } else if (p === 22) {
                // not bold
                this.curAttr = this.curAttr & ~(1 << 18);
              } else if (p === 24) {
                // not underlined
                this.curAttr = this.curAttr & ~(2 << 18);
              } else if (p === 39) {
                // reset fg
                this.curAttr = this.curAttr & ~(0x1ff << 9);
                this.curAttr =
                  this.curAttr | (((this.defAttr >> 9) & 0x1ff) << 9);
              } else if (p === 49) {
                // reset bg
                this.curAttr = this.curAttr & ~0x1ff;
                this.curAttr = this.curAttr | (this.defAttr & 0x1ff);
              } else if (p === 38) {
                // fg color 256
                if (params[i + 1] !== 5) continue;
                i += 2;
                p = params[i] & 0xff;
                // convert 88 colors to 256
                // if (this.is('rxvt-unicode') && p < 88) p = p * 2.9090 | 0;
                this.curAttr = (this.curAttr & ~(0x1ff << 9)) | (p << 9);
              } else if (p === 48) {
                // bg color 256
                if (params[i + 1] !== 5) continue;
                i += 2;
                p = params[i] & 0xff;
                // convert 88 colors to 256
                // if (this.is('rxvt-unicode') && p < 88) p = p * 2.9090 | 0;
                this.curAttr = (this.curAttr & ~0x1ff) | p;
              }
            }
          };
        };
      },
      {},
    ],
    29: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          // CSI ! p Soft terminal reset (DECSTR).
          // http://vt100.net/docs/vt220-rm/table4-10.html
          Terminal.prototype.softReset = function (params) {
            this.cursorHidden = false;
            this.insertMode = false;
            this.originMode = false;
            this.wraparoundMode = false; // autowrap
            this.applicationKeypad = false; // ?
            this.scrollTop = 0;
            this.scrollBottom = this.rows - 1;
            this.curAttr = this.defAttr;
            this.x = this.y = 0; // ?
            this.charset = null;
            this.glevel = 0; // ??
            this.charsets = [null]; // ??
          };
        };
      },
      {},
    ],
    30: [
      function (require, module, exports) {
        module.exports = function (Terminal) {
          // CSI Ps g Tab Clear (TBC).
          // Ps = 0 -> Clear Current Column (default).
          // Ps = 3 -> Clear All.
          // Potentially:
          // Ps = 2 -> Clear Stops on Line.
          // http://vt100.net/annarbor/aaa-ug/section6.html
          Terminal.prototype.tabClear = function (params) {
            var param = params[0];
            if (param <= 0) {
              delete this.tabs[this.x];
            } else if (param === 3) {
              this.tabs = {};
            }
          };
        };
      },
      {},
    ],
    32: [
      function (require, module, exports) {
        var events = require('events');
        var util = require('util');

        function Stream() {
          events.EventEmitter.call(this);
        }
        util.inherits(Stream, events.EventEmitter);
        module.exports = Stream;
        // Backwards-compat with node 0.4.x
        Stream.Stream = Stream;

        Stream.prototype.pipe = function (dest, options) {
          var source = this;

          function ondata(chunk) {
            if (dest.writable) {
              if (false === dest.write(chunk) && source.pause) {
                source.pause();
              }
            }
          }

          source.on('data', ondata);

          function ondrain() {
            if (source.readable && source.resume) {
              source.resume();
            }
          }

          dest.on('drain', ondrain);

          // If the 'end' option is not supplied, dest.end() will be called when
          // source gets the 'end' or 'close' events.  Only dest.end() once, and
          // only when all sources have ended.
          if (!dest._isStdio && (!options || options.end !== false)) {
            dest._pipeCount = dest._pipeCount || 0;
            dest._pipeCount++;

            source.on('end', onend);
            source.on('close', onclose);
          }

          var didOnEnd = false;
          function onend() {
            if (didOnEnd) return;
            didOnEnd = true;

            dest._pipeCount--;

            // remove the listeners
            cleanup();

            if (dest._pipeCount > 0) {
              // waiting for other incoming streams to end.
              return;
            }

            dest.end();
          }

          function onclose() {
            if (didOnEnd) return;
            didOnEnd = true;

            dest._pipeCount--;

            // remove the listeners
            cleanup();

            if (dest._pipeCount > 0) {
              // waiting for other incoming streams to end.
              return;
            }

            dest.destroy();
          }

          // don't leave dangling pipes when there are errors.
          function onerror(er) {
            cleanup();
            if (this.listeners('error').length === 0) {
              throw er; // Unhandled stream error in pipe.
            }
          }

          source.on('error', onerror);
          dest.on('error', onerror);

          // remove all the event listeners that were added.
          function cleanup() {
            source.removeListener('data', ondata);
            dest.removeListener('drain', ondrain);

            source.removeListener('end', onend);
            source.removeListener('close', onclose);

            source.removeListener('error', onerror);
            dest.removeListener('error', onerror);

            source.removeListener('end', cleanup);
            source.removeListener('close', cleanup);

            dest.removeListener('end', cleanup);
            dest.removeListener('close', cleanup);
          }

          source.on('end', cleanup);
          source.on('close', cleanup);

          dest.on('end', cleanup);
          dest.on('close', cleanup);

          dest.emit('pipe', source);

          // Allow for unix-like usage: A.pipe(B).pipe(C)
          return dest;
        };
      },
      { events: 33, util: 34 },
    ],
    33: [
      function (require, module, exports) {
        (function (process) {
          if (!process.EventEmitter) process.EventEmitter = function () {};

          var EventEmitter = (exports.EventEmitter = process.EventEmitter);
          var isArray =
            typeof Array.isArray === 'function'
              ? Array.isArray
              : function (xs) {
                  return (
                    Object.prototype.toString.call(xs) === '[object Array]'
                  );
                };
          function indexOf(xs, x) {
            if (xs.indexOf) return xs.indexOf(x);
            for (var i = 0; i < xs.length; i++) {
              if (x === xs[i]) return i;
            }
            return -1;
          }

          // By default EventEmitters will print a warning if more than
          // 10 listeners are added to it. This is a useful default which
          // helps finding memory leaks.
          //
          // Obviously not all Emitters should be limited to 10. This function allows
          // that to be increased. Set to zero for unlimited.
          var defaultMaxListeners = 10;
          EventEmitter.prototype.setMaxListeners = function (n) {
            if (!this._events) this._events = {};
            this._events.maxListeners = n;
          };

          EventEmitter.prototype.emit = function (type) {
            // If there is no 'error' event listener then throw.
            if (type === 'error') {
              if (
                !this._events ||
                !this._events.error ||
                (isArray(this._events.error) && !this._events.error.length)
              ) {
                if (arguments[1] instanceof Error) {
                  throw arguments[1]; // Unhandled 'error' event
                } else {
                  throw new Error("Uncaught, unspecified 'error' event.");
                }
                return false;
              }
            }

            if (!this._events) return false;
            var handler = this._events[type];
            if (!handler) return false;

            if (typeof handler == 'function') {
              switch (arguments.length) {
                // fast cases
                case 1:
                  handler.call(this);
                  break;
                case 2:
                  handler.call(this, arguments[1]);
                  break;
                case 3:
                  handler.call(this, arguments[1], arguments[2]);
                  break;
                // slower
                default:
                  var args = Array.prototype.slice.call(arguments, 1);
                  handler.apply(this, args);
              }
              return true;
            } else if (isArray(handler)) {
              var args = Array.prototype.slice.call(arguments, 1);

              var listeners = handler.slice();
              for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i].apply(this, args);
              }
              return true;
            } else {
              return false;
            }
          };

          // EventEmitter is defined in src/node_events.cc
          // EventEmitter.prototype.emit() is also defined there.
          EventEmitter.prototype.addListener = function (type, listener) {
            if ('function' !== typeof listener) {
              throw new Error('addListener only takes instances of Function');
            }

            if (!this._events) this._events = {};

            // To avoid recursion in the case that type == "newListeners"! Before
            // adding it to the listeners, first emit "newListeners".
            this.emit('newListener', type, listener);

            if (!this._events[type]) {
              // Optimize the case of one listener. Don't need the extra array object.
              this._events[type] = listener;
            } else if (isArray(this._events[type])) {
              // Check for listener leak
              if (!this._events[type].warned) {
                var m;
                if (this._events.maxListeners !== undefined) {
                  m = this._events.maxListeners;
                } else {
                  m = defaultMaxListeners;
                }

                if (m && m > 0 && this._events[type].length > m) {
                  this._events[type].warned = true;
                  console.error(
                    '(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length
                  );
                  console.trace();
                }
              }

              // If we've already got an array, just append.
              this._events[type].push(listener);
            } else {
              // Adding the second element, need to change to array.
              this._events[type] = [this._events[type], listener];
            }

            return this;
          };

          EventEmitter.prototype.on = EventEmitter.prototype.addListener;

          EventEmitter.prototype.once = function (type, listener) {
            var self = this;
            self.on(type, function g() {
              self.removeListener(type, g);
              listener.apply(this, arguments);
            });

            return this;
          };

          EventEmitter.prototype.removeListener = function (type, listener) {
            if ('function' !== typeof listener) {
              throw new Error(
                'removeListener only takes instances of Function'
              );
            }

            // does not use listeners(), so no side effect of creating _events[type]
            if (!this._events || !this._events[type]) return this;

            var list = this._events[type];

            if (isArray(list)) {
              var i = indexOf(list, listener);
              if (i < 0) return this;
              list.splice(i, 1);
              if (list.length == 0) delete this._events[type];
            } else if (this._events[type] === listener) {
              delete this._events[type];
            }

            return this;
          };

          EventEmitter.prototype.removeAllListeners = function (type) {
            if (arguments.length === 0) {
              this._events = {};
              return this;
            }

            // does not use listeners(), so no side effect of creating _events[type]
            if (type && this._events && this._events[type])
              this._events[type] = null;
            return this;
          };

          EventEmitter.prototype.listeners = function (type) {
            if (!this._events) this._events = {};
            if (!this._events[type]) this._events[type] = [];
            if (!isArray(this._events[type])) {
              this._events[type] = [this._events[type]];
            }
            return this._events[type];
          };
        })(require('__browserify_process'));
      },
      { __browserify_process: 31 },
    ],
    34: [
      function (require, module, exports) {
        var events = require('events');

        exports.isArray = isArray;
        exports.isDate = function (obj) {
          return Object.prototype.toString.call(obj) === '[object Date]';
        };
        exports.isRegExp = function (obj) {
          return Object.prototype.toString.call(obj) === '[object RegExp]';
        };

        exports.print = function () {};
        exports.puts = function () {};
        exports.debug = function () {};

        exports.inspect = function (obj, showHidden, depth, colors) {
          var seen = [];

          var stylize = function (str, styleType) {
            // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
            var styles = {
              bold: [1, 22],
              italic: [3, 23],
              underline: [4, 24],
              inverse: [7, 27],
              white: [37, 39],
              grey: [90, 39],
              black: [30, 39],
              blue: [34, 39],
              cyan: [36, 39],
              green: [32, 39],
              magenta: [35, 39],
              red: [31, 39],
              yellow: [33, 39],
            };

            var style = {
              special: 'cyan',
              number: 'blue',
              boolean: 'yellow',
              undefined: 'grey',
              null: 'bold',
              string: 'green',
              date: 'magenta',
              // "name": intentionally not styling
              regexp: 'red',
            }[styleType];

            if (style) {
              return (
                '\033[' +
                styles[style][0] +
                'm' +
                str +
                '\033[' +
                styles[style][1] +
                'm'
              );
            } else {
              return str;
            }
          };
          if (!colors) {
            stylize = function (str, styleType) {
              return str;
            };
          }

          function format(value, recurseTimes) {
            // Provide a hook for user-specified inspect functions.
            // Check that value is an object with an inspect function on it
            if (
              value &&
              typeof value.inspect === 'function' &&
              // Filter out the util module, it's inspect function is special
              value !== exports &&
              // Also filter out any prototype objects using the circular check.
              !(value.constructor && value.constructor.prototype === value)
            ) {
              return value.inspect(recurseTimes);
            }

            // Primitive types cannot have properties
            switch (typeof value) {
              case 'undefined':
                return stylize('undefined', 'undefined');

              case 'string':
                var simple =
                  "'" +
                  JSON.stringify(value)
                    .replace(/^"|"$/g, '')
                    .replace(/'/g, "\\'")
                    .replace(/\\"/g, '"') +
                  "'";
                return stylize(simple, 'string');

              case 'number':
                return stylize('' + value, 'number');

              case 'boolean':
                return stylize('' + value, 'boolean');
            }
            // For some reason typeof null is "object", so special case here.
            if (value === null) {
              return stylize('null', 'null');
            }

            // Look up the keys of the object.
            var visible_keys = Object_keys(value);
            var keys = showHidden
              ? Object_getOwnPropertyNames(value)
              : visible_keys;

            // Functions without properties can be shortcutted.
            if (typeof value === 'function' && keys.length === 0) {
              if (isRegExp(value)) {
                return stylize('' + value, 'regexp');
              } else {
                var name = value.name ? ': ' + value.name : '';
                return stylize('[Function' + name + ']', 'special');
              }
            }

            // Dates without properties can be shortcutted
            if (isDate(value) && keys.length === 0) {
              return stylize(value.toUTCString(), 'date');
            }

            var base, type, braces;
            // Determine the object type
            if (isArray(value)) {
              type = 'Array';
              braces = ['[', ']'];
            } else {
              type = 'Object';
              braces = ['{', '}'];
            }

            // Make functions say that they are functions
            if (typeof value === 'function') {
              var n = value.name ? ': ' + value.name : '';
              base = isRegExp(value) ? ' ' + value : ' [Function' + n + ']';
            } else {
              base = '';
            }

            // Make dates with properties first say the date
            if (isDate(value)) {
              base = ' ' + value.toUTCString();
            }

            if (keys.length === 0) {
              return braces[0] + base + braces[1];
            }

            if (recurseTimes < 0) {
              if (isRegExp(value)) {
                return stylize('' + value, 'regexp');
              } else {
                return stylize('[Object]', 'special');
              }
            }

            seen.push(value);

            var output = keys.map(function (key) {
              var name, str;
              if (value.__lookupGetter__) {
                if (value.__lookupGetter__(key)) {
                  if (value.__lookupSetter__(key)) {
                    str = stylize('[Getter/Setter]', 'special');
                  } else {
                    str = stylize('[Getter]', 'special');
                  }
                } else {
                  if (value.__lookupSetter__(key)) {
                    str = stylize('[Setter]', 'special');
                  }
                }
              }
              if (visible_keys.indexOf(key) < 0) {
                name = '[' + key + ']';
              }
              if (!str) {
                if (seen.indexOf(value[key]) < 0) {
                  if (recurseTimes === null) {
                    str = format(value[key]);
                  } else {
                    str = format(value[key], recurseTimes - 1);
                  }
                  if (str.indexOf('\n') > -1) {
                    if (isArray(value)) {
                      str = str
                        .split('\n')
                        .map(function (line) {
                          return '  ' + line;
                        })
                        .join('\n')
                        .substr(2);
                    } else {
                      str =
                        '\n' +
                        str
                          .split('\n')
                          .map(function (line) {
                            return '   ' + line;
                          })
                          .join('\n');
                    }
                  }
                } else {
                  str = stylize('[Circular]', 'special');
                }
              }
              if (typeof name === 'undefined') {
                if (type === 'Array' && key.match(/^\d+$/)) {
                  return str;
                }
                name = JSON.stringify('' + key);
                if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                  name = name.substr(1, name.length - 2);
                  name = stylize(name, 'name');
                } else {
                  name = name
                    .replace(/'/g, "\\'")
                    .replace(/\\"/g, '"')
                    .replace(/(^"|"$)/g, "'");
                  name = stylize(name, 'string');
                }
              }

              return name + ': ' + str;
            });

            seen.pop();

            var numLinesEst = 0;
            var length = output.reduce(function (prev, cur) {
              numLinesEst++;
              if (cur.indexOf('\n') >= 0) numLinesEst++;
              return prev + cur.length + 1;
            }, 0);

            if (length > 50) {
              output =
                braces[0] +
                (base === '' ? '' : base + '\n ') +
                ' ' +
                output.join(',\n  ') +
                ' ' +
                braces[1];
            } else {
              output =
                braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
            }

            return output;
          }
          return format(obj, typeof depth === 'undefined' ? 2 : depth);
        };

        function isArray(ar) {
          return (
            ar instanceof Array ||
            Array.isArray(ar) ||
            (ar && ar !== Object.prototype && isArray(ar.__proto__))
          );
        }

        function isRegExp(re) {
          return (
            re instanceof RegExp ||
            (typeof re === 'object' &&
              Object.prototype.toString.call(re) === '[object RegExp]')
          );
        }

        function isDate(d) {
          if (d instanceof Date) return true;
          if (typeof d !== 'object') return false;
          var properties =
            Date.prototype && Object_getOwnPropertyNames(Date.prototype);
          var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
          return JSON.stringify(proto) === JSON.stringify(properties);
        }

        function pad(n) {
          return n < 10 ? '0' + n.toString(10) : n.toString(10);
        }

        var months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];

        // 26 Feb 16:19:34
        function timestamp() {
          var d = new Date();
          var time = [
            pad(d.getHours()),
            pad(d.getMinutes()),
            pad(d.getSeconds()),
          ].join(':');
          return [d.getDate(), months[d.getMonth()], time].join(' ');
        }

        exports.log = function (msg) {};

        exports.pump = null;

        var Object_keys =
          Object.keys ||
          function (obj) {
            var res = [];
            for (var key in obj) res.push(key);
            return res;
          };

        var Object_getOwnPropertyNames =
          Object.getOwnPropertyNames ||
          function (obj) {
            var res = [];
            for (var key in obj) {
              if (Object.hasOwnProperty.call(obj, key)) res.push(key);
            }
            return res;
          };

        var Object_create =
          Object.create ||
          function (prototype, properties) {
            // from es5-shim
            var object;
            if (prototype === null) {
              object = { __proto__: null };
            } else {
              if (typeof prototype !== 'object') {
                throw new TypeError(
                  'typeof prototype[' + typeof prototype + "] != 'object'"
                );
              }
              var Type = function () {};
              Type.prototype = prototype;
              object = new Type();
              object.__proto__ = prototype;
            }
            if (typeof properties !== 'undefined' && Object.defineProperties) {
              Object.defineProperties(object, properties);
            }
            return object;
          };

        exports.inherits = function (ctor, superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object_create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true,
            },
          });
        };

        var formatRegExp = /%[sdj%]/g;
        exports.format = function (f) {
          if (typeof f !== 'string') {
            var objects = [];
            for (var i = 0; i < arguments.length; i++) {
              objects.push(exports.inspect(arguments[i]));
            }
            return objects.join(' ');
          }

          var i = 1;
          var args = arguments;
          var len = args.length;
          var str = String(f).replace(formatRegExp, function (x) {
            if (x === '%%') return '%';
            if (i >= len) return x;
            switch (x) {
              case '%s':
                return String(args[i++]);
              case '%d':
                return Number(args[i++]);
              case '%j':
                return JSON.stringify(args[i++]);
              default:
                return x;
            }
          });
          for (var x = args[i]; i < len; x = args[++i]) {
            if (x === null || typeof x !== 'object') {
              str += ' ' + x;
            } else {
              str += ' ' + exports.inspect(x);
            }
          }
          return str;
        };
      },
      { events: 33 },
    ],
    7: [
      function (require, module, exports) {
        var states = require('../states');

        module.exports = function (Terminal) {
          // ESC H Tab Set (HTS is 0x88).
          Terminal.prototype.tabSet = function () {
            this.tabs[this.x] = true;
            this.state = states.normal;
          };
        };
      },
      { '../states': 9 },
    ],
    5: [
      function (require, module, exports) {
        var states = require('../states');

        module.exports = function (Terminal) {
          // ESC D Index (IND is 0x84).
          Terminal.prototype.index = function () {
            this.y++;
            if (this.y > this.scrollBottom) {
              this.y--;
              this.scroll();
            }
            this.state = states.normal;
          };

          // ESC M Reverse Index (RI is 0x8d).
          Terminal.prototype.reverseIndex = function () {
            var j;
            this.y--;
            if (this.y < this.scrollTop) {
              this.y++;
              // possibly move the code below to term.reverseScroll();
              // test: echo -ne '\e[1;1H\e[44m\eM\e[0m'
              // blankLine(true) is xterm/linux behavior
              this.lines.splice(this.y + this.ybase, 0, this.blankLine(true));
              j = this.rows - 1 - this.scrollBottom;
              this.lines.splice(this.rows - 1 + this.ybase - j + 1, 1);
              // this.maxRange();
              this.updateRange(this.scrollTop);
              this.updateRange(this.scrollBottom);
            }
            this.state = states.normal;
          };
        };
      },
      { '../states': 9 },
    ],
    13: [
      function (require, module, exports) {
        var states = require('./states');

        function fixLinefeed(data) {
          return data.replace(/([^\r])\n/g, '$1\r\n');
        }

        function fixIndent(data) {
          if (!/(^|\n) /.test(data)) return data;

          // not very efficient, but works and would only become a problem
          // once we render huge amounts of data
          return data
            .split('\n')
            .map(function (line) {
              var count = 0;
              while (line.charAt(0) === ' ') {
                line = line.slice(1);
                count++;
              }
              while (count--) {
                line = '&nbsp;' + line;
              }
              return line;
            })
            .join('\r\n');
        }

        module.exports = function (Terminal) {
          Terminal.prototype.bell = function () {
            var snd = new Audio('bell.wav'); // buffers automatically when created
            snd.play();

            if (!Terminal.visualBell) return;
            var self = this;
            this.element.style.borderColor = 'white';
            setTimeout(function () {
              self.element.style.borderColor = '';
            }, 10);
            if (Terminal.popOnBell) this.focus();
          };

          Terminal.prototype.write = function (data) {
            data = fixLinefeed(data);
            data = fixIndent(data);

            var l = data.length,
              i = 0,
              cs,
              ch;

            this.refreshStart = this.y;
            this.refreshEnd = this.y;

            if (this.ybase !== this.ydisp) {
              this.ydisp = this.ybase;
              this.maxRange();
            }

            // this.log(JSON.stringify(data.replace(/\x1b/g, '^[')));

            for (; i < l; i++) {
              ch = data[i];
              switch (this.state) {
                case states.normal:
                  switch (ch) {
                    // '\0'
                    // case '\0':
                    // break;

                    // '\a'
                    case '\x07':
                      this.bell();
                      break;

                    // '\n', '\v', '\f'
                    case '\n':
                    case '\x0b':
                    case '\x0c':
                      if (this.convertEol) {
                        this.x = 0;
                      }
                      this.y++;
                      break;

                    // '\r'
                    case '\r':
                      this.x = 0;
                      break;

                    // '\b'
                    case '\x08':
                      if (this.x > 0) {
                        this.x--;
                      }
                      break;

                    // '\t'
                    case '\t':
                      this.x = this.nextStop();
                      break;

                    // shift out
                    case '\x0e':
                      this.setgLevel(1);
                      break;

                    // shift in
                    case '\x0f':
                      this.setgLevel(0);
                      break;

                    // '\e'
                    case '\x1b':
                      this.state = states.escaped;
                      break;

                    default:
                      // ' '
                      if (ch >= ' ') {
                        if (this.charset && this.charset[ch]) {
                          ch = this.charset[ch];
                        }
                        if (this.x >= this.cols) {
                          this.x = 0;
                          this.y++;
                        }

                        // FIXME: this prevents errors from being thrown, but needs a proper fix
                        if (this.lines[this.y + this.ybase])
                          this.lines[this.y + this.ybase][this.x] = [
                            this.curAttr,
                            ch,
                          ];

                        this.x++;
                        this.updateRange(this.y);
                      }
                      break;
                  }
                  break;
                case states.escaped:
                  switch (ch) {
                    // ESC [ Control Sequence Introducer ( CSI is 0x9b).
                    case '[':
                      this.params = [];
                      this.currentParam = 0;
                      this.state = states.csi;
                      break;

                    // ESC ] Operating System Command ( OSC is 0x9d).
                    case ']':
                      this.params = [];
                      this.currentParam = 0;
                      this.state = states.osc;
                      break;

                    // ESC P Device Control String ( DCS is 0x90).
                    case 'P':
                      this.params = [];
                      this.currentParam = 0;
                      this.state = states.dcs;
                      break;

                    // ESC _ Application Program Command ( APC is 0x9f).
                    case '_':
                      this.stateType = 'apc';
                      this.state = states.ignore;
                      break;

                    // ESC ^ Privacy Message ( PM is 0x9e).
                    case '^':
                      this.stateType = 'pm';
                      this.state = states.ignore;
                      break;

                    // ESC c Full Reset (RIS).
                    case 'c':
                      this.reset();
                      break;

                    // ESC E Next Line ( NEL is 0x85).
                    // ESC D Index ( IND is 0x84).
                    case 'E':
                      this.x = 0;
                      break;
                    case 'D':
                      this.index();
                      break;

                    // ESC M Reverse Index ( RI is 0x8d).
                    case 'M':
                      this.reverseIndex();
                      break;

                    // ESC % Select default/utf-8 character set.
                    // @ = default, G = utf-8
                    case '%':
                      //this.charset = null;
                      this.setgLevel(0);
                      this.setgCharset(0, Terminal.charsets.US);
                      this.state = states.normal;
                      i++;
                      break;

                    // ESC (,),*,+,-,. Designate G0-G2 Character Set.
                    case '(':
                    // <-- this seems to get all the attention
                    case ')':
                    case '*':
                    case '+':
                    case '-':
                    case '.':
                      switch (ch) {
                        case '(':
                          this.gcharset = 0;
                          break;
                        case ')':
                          this.gcharset = 1;
                          break;
                        case '*':
                          this.gcharset = 2;
                          break;
                        case '+':
                          this.gcharset = 3;
                          break;
                        case '-':
                          this.gcharset = 1;
                          break;
                        case '.':
                          this.gcharset = 2;
                          break;
                      }
                      this.state = states.charset;
                      break;

                    // Designate G3 Character Set (VT300).
                    // A = ISO Latin-1 Supplemental.
                    // Not implemented.
                    case '/':
                      this.gcharset = 3;
                      this.state = states.charset;
                      i--;
                      break;

                    // ESC N
                    // Single Shift Select of G2 Character Set
                    // ( SS2 is 0x8e). This affects next character only.
                    case 'N':
                      break;
                    // ESC O
                    // Single Shift Select of G3 Character Set
                    // ( SS3 is 0x8f). This affects next character only.
                    case 'O':
                      break;
                    // ESC n
                    // Invoke the G2 Character Set as GL (LS2).
                    case 'n':
                      this.setgLevel(2);
                      break;
                    // ESC o
                    // Invoke the G3 Character Set as GL (LS3).
                    case 'o':
                      this.setgLevel(3);
                      break;
                    // ESC |
                    // Invoke the G3 Character Set as GR (LS3R).
                    case '|':
                      this.setgLevel(3);
                      break;
                    // ESC }
                    // Invoke the G2 Character Set as GR (LS2R).
                    case '}':
                      this.setgLevel(2);
                      break;
                    // ESC ~
                    // Invoke the G1 Character Set as GR (LS1R).
                    case '~':
                      this.setgLevel(1);
                      break;

                    // ESC 7 Save Cursor (DECSC).
                    case '7':
                      this.saveCursor();
                      this.state = states.normal;
                      break;

                    // ESC 8 Restore Cursor (DECRC).
                    case '8':
                      this.restoreCursor();
                      this.state = states.normal;
                      break;

                    // ESC # 3 DEC line height/width
                    case '#':
                      this.state = states.normal;
                      i++;
                      break;

                    // ESC H Tab Set (HTS is 0x88).
                    case 'H':
                      this.tabSet();
                      break;

                    // ESC = Application Keypad (DECPAM).
                    case '=':
                      this.log('Serial port requested application keypad.');
                      this.applicationKeypad = true;
                      this.state = states.normal;
                      break;

                    // ESC > Normal Keypad (DECPNM).
                    case '>':
                      this.log('Switching back to normal keypad.');
                      this.applicationKeypad = false;
                      this.state = states.normal;
                      break;

                    default:
                      this.state = states.normal;
                      this.error('Unknown ESC control: %s.', ch);
                      break;
                  }
                  break;

                case states.charset:
                  switch (ch) {
                    case '0':
                      // DEC Special Character and Line Drawing Set.
                      cs = Terminal.charsets.SCLD;
                      break;
                    case 'A':
                      // UK
                      cs = Terminal.charsets.UK;
                      break;
                    case 'B':
                      // United States (USASCII).
                      cs = Terminal.charsets.US;
                      break;
                    case '4':
                      // Dutch
                      cs = Terminal.charsets.Dutch;
                      break;
                    case 'C':
                    // Finnish
                    case '5':
                      cs = Terminal.charsets.Finnish;
                      break;
                    case 'R':
                      // French
                      cs = Terminal.charsets.French;
                      break;
                    case 'Q':
                      // FrenchCanadian
                      cs = Terminal.charsets.FrenchCanadian;
                      break;
                    case 'K':
                      // German
                      cs = Terminal.charsets.German;
                      break;
                    case 'Y':
                      // Italian
                      cs = Terminal.charsets.Italian;
                      break;
                    case 'E':
                    // NorwegianDanish
                    case '6':
                      cs = Terminal.charsets.NorwegianDanish;
                      break;
                    case 'Z':
                      // Spanish
                      cs = Terminal.charsets.Spanish;
                      break;
                    case 'H':
                    // Swedish
                    case '7':
                      cs = Terminal.charsets.Swedish;
                      break;
                    case '=':
                      // Swiss
                      cs = Terminal.charsets.Swiss;
                      break;
                    case '/':
                      // ISOLatin (actually /A)
                      cs = Terminal.charsets.ISOLatin;
                      i++;
                      break;
                    default:
                      // Default
                      cs = Terminal.charsets.US;
                      break;
                  }
                  this.setgCharset(this.gcharset, cs);
                  this.gcharset = null;
                  this.state = states.normal;
                  break;

                case states.osc:
                  // OSC Ps ; Pt ST
                  // OSC Ps ; Pt BEL
                  // Set Text Parameters.
                  if (ch === '\x1b' || ch === '\x07') {
                    if (ch === '\x1b') i++;

                    this.params.push(this.currentParam);

                    switch (this.params[0]) {
                      case 0:
                      case 1:
                      case 2:
                        if (this.params[1]) {
                          this.title = this.params[1];

                          //handlers could not be installed
                          if (this.handleTitle) {
                            this.handleTitle(this.title);
                          }
                        }
                        break;
                      case 3:
                        // set X property
                        break;
                      case 4:
                      case 5:
                        // change dynamic colors
                        break;
                      case 10:
                      case 11:
                      case 12:
                      case 13:
                      case 14:
                      case 15:
                      case 16:
                      case 17:
                      case 18:
                      case 19:
                        // change dynamic ui colors
                        break;
                      case 46:
                        // change log file
                        break;
                      case 50:
                        // dynamic font
                        break;
                      case 51:
                        // emacs shell
                        break;
                      case 52:
                        // manipulate selection data
                        break;
                      case 104:
                      case 105:
                      case 110:
                      case 111:
                      case 112:
                      case 113:
                      case 114:
                      case 115:
                      case 116:
                      case 117:
                      case 118:
                        // reset colors
                        break;
                    }

                    this.params = [];
                    this.currentParam = 0;
                    this.state = states.normal;
                  } else {
                    if (!this.params.length) {
                      if (ch >= '0' && ch <= '9') {
                        this.currentParam =
                          this.currentParam * 10 + ch.charCodeAt(0) - 48;
                      } else if (ch === ';') {
                        this.params.push(this.currentParam);
                        this.currentParam = '';
                      }
                    } else {
                      this.currentParam += ch;
                    }
                  }
                  break;

                case states.csi:
                  // '?', '>', '!'
                  if (ch === '?' || ch === '>' || ch === '!') {
                    this.prefix = ch;
                    break;
                  }

                  // 0 - 9
                  if (ch >= '0' && ch <= '9') {
                    this.currentParam =
                      this.currentParam * 10 + ch.charCodeAt(0) - 48;
                    break;
                  }

                  // '$', '"', ' ', '\''
                  if (ch === '$' || ch === '"' || ch === ' ' || ch === "'") {
                    this.postfix = ch;
                    break;
                  }

                  this.params.push(this.currentParam);
                  this.currentParam = 0;

                  // ';'
                  if (ch === ';') break;

                  this.state = states.normal;

                  switch (ch) {
                    // CSI Ps A
                    // Cursor Up Ps Times (default = 1) (CUU).
                    case 'A':
                      this.cursorUp(this.params);
                      break;

                    // CSI Ps B
                    // Cursor Down Ps Times (default = 1) (CUD).
                    case 'B':
                      this.cursorDown(this.params);
                      break;

                    // CSI Ps C
                    // Cursor Forward Ps Times (default = 1) (CUF).
                    case 'C':
                      this.cursorForward(this.params);
                      break;

                    // CSI Ps D
                    // Cursor Backward Ps Times (default = 1) (CUB).
                    case 'D':
                      this.cursorBackward(this.params);
                      break;

                    // CSI Ps ; Ps H
                    // Cursor Position [row;column] (default = [1,1]) (CUP).
                    case 'H':
                      this.cursorPos(this.params);
                      break;

                    // CSI Ps J Erase in Display (ED).
                    case 'J':
                      this.eraseInDisplay(this.params);
                      break;

                    // CSI Ps K Erase in Line (EL).
                    case 'K':
                      this.eraseInLine(this.params);
                      break;

                    // CSI Pm m Character Attributes (SGR).
                    case 'm':
                      this.charAttributes(this.params);
                      break;

                    // CSI Ps n Device Status Report (DSR).
                    case 'n':
                      this.deviceStatus(this.params);
                      break;

                    /**
                     * Additions
                     */

                    // CSI Ps @
                    // Insert Ps (Blank) Character(s) (default = 1) (ICH).
                    case '@':
                      this.insertChars(this.params);
                      break;

                    // CSI Ps E
                    // Cursor Next Line Ps Times (default = 1) (CNL).
                    case 'E':
                      this.cursorNextLine(this.params);
                      break;

                    // CSI Ps F
                    // Cursor Preceding Line Ps Times (default = 1) (CNL).
                    case 'F':
                      this.cursorPrecedingLine(this.params);
                      break;

                    // CSI Ps G
                    // Cursor Character Absolute [column] (default = [row,1]) (CHA).
                    case 'G':
                      this.cursorCharAbsolute(this.params);
                      break;

                    // CSI Ps L
                    // Insert Ps Line(s) (default = 1) (IL).
                    case 'L':
                      this.insertLines(this.params);
                      break;

                    // CSI Ps M
                    // Delete Ps Line(s) (default = 1) (DL).
                    case 'M':
                      this.deleteLines(this.params);
                      break;

                    // CSI Ps P
                    // Delete Ps Character(s) (default = 1) (DCH).
                    case 'P':
                      this.deleteChars(this.params);
                      break;

                    // CSI Ps X
                    // Erase Ps Character(s) (default = 1) (ECH).
                    case 'X':
                      this.eraseChars(this.params);
                      break;

                    // CSI Pm ` Character Position Absolute
                    // [column] (default = [row,1]) (HPA).
                    case '`':
                      this.charPosAbsolute(this.params);
                      break;

                    // 141 61 a * HPR -
                    // Horizontal Position Relative
                    case 'a':
                      this.HPositionRelative(this.params);
                      break;

                    // CSI P s c
                    // Send Device Attributes (Primary DA).
                    // CSI > P s c
                    // Send Device Attributes (Secondary DA)
                    case 'c':
                      //- this.sendDeviceAttributes(this.params);
                      break;

                    // CSI Pm d
                    // Line Position Absolute [row] (default = [1,column]) (VPA).
                    case 'd':
                      this.linePosAbsolute(this.params);
                      break;

                    // 145 65 e * VPR - Vertical Position Relative
                    case 'e':
                      this.VPositionRelative(this.params);
                      break;

                    // CSI Ps ; Ps f
                    // Horizontal and Vertical Position [row;column] (default =
                    // [1,1]) (HVP).
                    case 'f':
                      this.HVPosition(this.params);
                      break;

                    // CSI Pm h Set Mode (SM).
                    // CSI ? Pm h - mouse escape codes, cursor escape codes
                    case 'h':
                      //- this.setMode(this.params);
                      break;

                    // CSI Pm l Reset Mode (RM).
                    // CSI ? Pm l
                    case 'l':
                      //- this.resetMode(this.params);
                      break;

                    // CSI Ps ; Ps r
                    // Set Scrolling Region [top;bottom] (default = full size of win-
                    // dow) (DECSTBM).
                    // CSI ? Pm r
                    case 'r':
                      //- this.setScrollRegion(this.params);
                      break;

                    // CSI s
                    // Save cursor (ANSI.SYS).
                    case 's':
                      this.saveCursor(this.params);
                      break;

                    // CSI u
                    // Restore cursor (ANSI.SYS).
                    case 'u':
                      this.restoreCursor(this.params);
                      break;

                    /**
                     * Lesser Used
                     */

                    // CSI Ps I
                    // Cursor Forward Tabulation Ps tab stops (default = 1) (CHT).
                    case 'I':
                      this.cursorForwardTab(this.params);
                      break;

                    // CSI Ps S Scroll up Ps lines (default = 1) (SU).
                    case 'S':
                      //- this.scrollUp(this.params);
                      break;

                    // CSI Ps T Scroll down Ps lines (default = 1) (SD).
                    // CSI Ps ; Ps ; Ps ; Ps ; Ps T
                    // CSI > Ps; Ps T
                    case 'T':
                      if (this.params.length < 2 && !this.prefix) {
                        //- this.scrollDown(this.params);
                      }
                      break;

                    // CSI Ps Z
                    // Cursor Backward Tabulation Ps tab stops (default = 1) (CBT).
                    case 'Z':
                      this.cursorBackwardTab(this.params);
                      break;

                    // CSI Ps b Repeat the preceding graphic character Ps times (REP).
                    case 'b':
                      this.repeatPrecedingCharacter(this.params);
                      break;

                    // CSI Ps g Tab Clear (TBC).
                    case 'g':
                      this.tabClear(this.params);
                      break;
                    case 'p':
                      switch (this.prefix) {
                        case '!':
                          this.softReset(this.params);
                          break;
                      }
                      break;

                    default:
                      this.error('Unknown CSI code: %s.', ch);
                      break;
                  }

                  this.prefix = '';
                  this.postfix = '';
                  break;

                case states.dcs:
                  if (ch === '\x1b' || ch === '\x07') {
                    if (ch === '\x1b') i++;

                    switch (this.prefix) {
                      // User-Defined Keys (DECUDK).
                      case '':
                        break;

                      // Request Status String (DECRQSS).
                      // test: echo -e '\eP$q"p\e\\'
                      case '$q':
                        var pt = this.currentParam,
                          valid = false;

                        switch (pt) {
                          // DECSCA
                          case '"q':
                            pt = '0"q';
                            break;

                          // DECSCL
                          case '"p':
                            pt = '61"p';
                            break;

                          // DECSTBM
                          case 'r':
                            pt =
                              '' +
                              (this.scrollTop + 1) +
                              ';' +
                              (this.scrollBottom + 1) +
                              'r';
                            break;

                          // SGR
                          case 'm':
                            pt = '0m';
                            break;

                          default:
                            this.error('Unknown DCS Pt: %s.', pt);
                            pt = '';
                            break;
                        }

                        //- this.send('\x1bP' + valid + '$r' + pt + '\x1b\\');
                        break;

                      // Set Termcap/Terminfo Data (xterm, experimental).
                      case '+p':
                        break;

                      default:
                        this.error('Unknown DCS prefix: %s.', this.prefix);
                        break;
                    }

                    this.currentParam = 0;
                    this.prefix = '';
                    this.state = states.normal;
                  } else if (!this.currentParam) {
                    if (!this.prefix && ch !== '$' && ch !== '+') {
                      this.currentParam = ch;
                    } else if (this.prefix.length === 2) {
                      this.currentParam = ch;
                    } else {
                      this.prefix += ch;
                    }
                  } else {
                    this.currentParam += ch;
                  }
                  break;

                case states.ignore:
                  // For PM and APC.
                  if (ch === '\x1b' || ch === '\x07') {
                    if (ch === '\x1b') i++;
                    this.stateData = '';
                    this.state = states.normal;
                  } else {
                    if (!this.stateData) this.stateData = '';
                    this.stateData += ch;
                  }
                  break;
              }
            }

            this.updateRange(this.y);
            this.refresh(this.refreshStart, this.refreshEnd);
          };

          Terminal.prototype.writeln = function (data) {
            // at times spaces appear in between escape chars and fixIndent fails us, so we fix it here
            data = data.replace(/ /g, '&nbsp;');
            // adding empty char before line break ensures that empty lines render properly
            this.write(data + ' \r\n');
          };
        };
      },
      { './states': 9 },
    ],
  },
  {},
  [1]
);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV4YW1wbGVcXG1haW4uanMiLCJpbmRleC5qcyIsInRlcm0uanMiLCJub2RlX21vZHVsZXNcXHByb2Nlc3NcXGJyb3dzZXIuanMiLCJub2RlX21vZHVsZXNcXHRocm91Z2hcXGluZGV4LmpzIiwibGliXFxlc2NcXHJlc2V0LmpzIiwibGliXFxjaGFyc2V0cy5qcyIsImxpYlxcc3RhdGVzLmpzIiwibGliXFxyZWZyZXNoLmpzIiwibGliXFxkZXN0cm95LmpzIiwibGliXFxjb2xvcnMuanMiLCJsaWJcXHNldGdMZXZlbC5qcyIsImxpYlxcb3Blbi5qcyIsImxpYlxcc3RvcHMuanMiLCJsaWJcXGRlYnVnLmpzIiwibGliXFxzZXRnQ2hhcnNldC5qcyIsImxpYlxcZXJhc2UuanMiLCJsaWJcXGJsYW5rTGluZS5qcyIsImxpYlxcb3B0aW9ucy5qcyIsImxpYlxccmFuZ2UuanMiLCJsaWJcXHV0aWwuanMiLCJsaWJcXGNzaVxcaW5zZXJ0LWRlbGV0ZS5qcyIsImxpYlxcY3NpXFxyZXBlYXRQcmVjZWRpbmdDaGFyYWN0ZXIuanMiLCJsaWJcXGNzaVxcY3Vyc29yLmpzIiwibGliXFxjc2lcXHBvc2l0aW9uLmpzIiwibGliXFxjc2lcXGNoYXJBdHRyaWJ1dGVzLmpzIiwibGliXFxjc2lcXHNvZnRSZXNldC5qcyIsImxpYlxcY3NpXFx0YWJDbGVhci5qcyIsIm5vZGVfbW9kdWxlc1xcYnJvd3Nlci1yZXNvbHZlXFxidWlsdGluXFxzdHJlYW0uanMiLCJub2RlX21vZHVsZXNcXGJyb3dzZXItcmVzb2x2ZVxcYnVpbHRpblxcZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzXFxicm93c2VyLXJlc29sdmVcXGJ1aWx0aW5cXHV0aWwuanMiLCJsaWJcXGVzY1xcdGFiU2V0LmpzIiwibGliXFxlc2NcXGluZGV4LmpzIiwibGliXFx3cml0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKmpzaGludCBicm93c2VyOnRydWUgKi9cblxuLy8gc3RhcnRpbmcgb3V0IHdpdGgganVzdCAxMCByb3dzLCBob3dldmVyIGlmIG1vcmUgYXJlIG5lZWRlZCwgdGhleSBhcmUgYWRkZWQgb24gZGVtYW5kXG52YXIgdGVybWNvZGUgPSByZXF1aXJlKCcuLi9pbmRleCcpKCB7IHJvd3M6IDEwIH0pO1xudGVybWNvZGUuYXBwZW5kVG8oJyN0ZXJtaW5hbC1jb2RlJyk7XG5cblsgJ1xcdTAwMWJbOTJtXFwndXNlIHN0cmljdFxcJ1xcdTAwMWJbMzltXFx1MDAxYls5MG07XFx1MDAxYlszOW0nLFxuICAnXFx1MDAxYls5MG0vKmpzaGludCBicm93c2VyOnRydWUgKi9cXHUwMDFiWzM5bScsXG4gICcnLFxuICAnXFx1MDAxYlszMm12YXJcXHUwMDFiWzM5bSBcXHUwMDFiWzM3bVRlcm1pbmFsXFx1MDAxYlszOW0gXFx1MDAxYls5M209XFx1MDAxYlszOW0gXFx1MDAxYlszN21yZXF1aXJlXFx1MDAxYlszOW1cXHUwMDFiWzkwbShcXHUwMDFiWzM5bVxcdTAwMWJbOTJtXFwnLi90ZXJtXFwnXFx1MDAxYlszOW1cXHUwMDFiWzkwbSlcXHUwMDFiWzM5bScsXG4gICcgIFxcdTAwMWJbMzJtLFxcdTAwMWJbMzltIFxcdTAwMWJbMzdtdGhyb3VnaFxcdTAwMWJbMzltIFxcdTAwMWJbOTNtPVxcdTAwMWJbMzltIFxcdTAwMWJbMzdtcmVxdWlyZVxcdTAwMWJbMzltXFx1MDAxYls5MG0oXFx1MDAxYlszOW1cXHUwMDFiWzkybVxcJ3Rocm91Z2hcXCdcXHUwMDFiWzM5bVxcdTAwMWJbOTBtKVxcdTAwMWJbMzltJyxcbiAgJyAgXFx1MDAxYls5MG07XFx1MDAxYlszOW0nLFxuICAnJyxcbiAgJ1xcdTAwMWJbMzdtbW9kdWxlXFx1MDAxYlszOW1cXHUwMDFiWzMybS5cXHUwMDFiWzM5bVxcdTAwMWJbMzdtZXhwb3J0c1xcdTAwMWJbMzltIFxcdTAwMWJbOTNtPVxcdTAwMWJbMzltIFxcdTAwMWJbOTRtZnVuY3Rpb25cXHUwMDFiWzM5bSBcXHUwMDFiWzkwbShcXHUwMDFiWzM5bVxcdTAwMWJbMzdtY29sc1xcdTAwMWJbMzltXFx1MDAxYlszMm0sXFx1MDAxYlszOW0gXFx1MDAxYlszN21yb3dzXFx1MDAxYlszOW1cXHUwMDFiWzMybSxcXHUwMDFiWzM5bSBcXHUwMDFiWzM3bWhhbmRsZXJcXHUwMDFiWzM5bVxcdTAwMWJbOTBtKVxcdTAwMWJbMzltIFxcdTAwMWJbMzNte1xcdTAwMWJbMzltJyxcbiAgJyAgXFx1MDAxYlszMm12YXJcXHUwMDFiWzM5bSBcXHUwMDFiWzM3bXRlcm1cXHUwMDFiWzM5bSBcXHUwMDFiWzkzbT1cXHUwMDFiWzM5bSBcXHUwMDFiWzMxbW5ld1xcdTAwMWJbMzltIFxcdTAwMWJbMzdtVGVybWluYWxcXHUwMDFiWzM5bVxcdTAwMWJbOTBtKFxcdTAwMWJbMzltXFx1MDAxYlszN21jb2xzXFx1MDAxYlszOW1cXHUwMDFiWzMybSxcXHUwMDFiWzM5bSBcXHUwMDFiWzM3bXJvd3NcXHUwMDFiWzM5bVxcdTAwMWJbMzJtLFxcdTAwMWJbMzltIFxcdTAwMWJbMzdtaGFuZGxlclxcdTAwMWJbMzltXFx1MDAxYls5MG0pXFx1MDAxYlszOW1cXHUwMDFiWzkwbTtcXHUwMDFiWzM5bScsXG4gICcgIFxcdTAwMWJbMzdtdGVybVxcdTAwMWJbMzltXFx1MDAxYlszMm0uXFx1MDAxYlszOW1cXHUwMDFiWzM3bW9wZW5cXHUwMDFiWzM5bVxcdTAwMWJbOTBtKFxcdTAwMWJbMzltXFx1MDAxYls5MG0pXFx1MDAxYlszOW1cXHUwMDFiWzkwbTtcXHUwMDFiWzM5bScsXG4gICcgICcsXG4gICcgIFxcdTAwMWJbMzJtdmFyXFx1MDAxYlszOW0gXFx1MDAxYlszN21oeXBlcm5hbFxcdTAwMWJbMzltIFxcdTAwMWJbOTNtPVxcdTAwMWJbMzltIFxcdTAwMWJbMzdtdGhyb3VnaFxcdTAwMWJbMzltXFx1MDAxYls5MG0oXFx1MDAxYlszOW1cXHUwMDFiWzM3bXRlcm1cXHUwMDFiWzM5bVxcdTAwMWJbMzJtLlxcdTAwMWJbMzltXFx1MDAxYlszN213cml0ZVxcdTAwMWJbMzltXFx1MDAxYlszMm0uXFx1MDAxYlszOW1cXHUwMDFiWzM3bWJpbmRcXHUwMDFiWzM5bVxcdTAwMWJbOTBtKFxcdTAwMWJbMzltXFx1MDAxYlszN210ZXJtXFx1MDAxYlszOW1cXHUwMDFiWzkwbSlcXHUwMDFiWzM5bVxcdTAwMWJbOTBtKVxcdTAwMWJbMzltXFx1MDAxYls5MG07XFx1MDAxYlszOW0nLFxuICAnICBcXHUwMDFiWzM3bWh5cGVybmFsXFx1MDAxYlszOW1cXHUwMDFiWzMybS5cXHUwMDFiWzM5bVxcdTAwMWJbMzdtYXBwZW5kVG9cXHUwMDFiWzM5bSBcXHUwMDFiWzkzbT1cXHUwMDFiWzM5bSBcXHUwMDFiWzk0bWZ1bmN0aW9uXFx1MDAxYlszOW0gXFx1MDAxYls5MG0oXFx1MDAxYlszOW1cXHUwMDFiWzM3bWVsZW1cXHUwMDFiWzM5bVxcdTAwMWJbOTBtKVxcdTAwMWJbMzltIFxcdTAwMWJbMzNte1xcdTAwMWJbMzltJyxcbiAgJyAgICBcXHUwMDFiWzk0bWlmXFx1MDAxYlszOW0gXFx1MDAxYls5MG0oXFx1MDAxYlszOW1cXHUwMDFiWzk0bXR5cGVvZlxcdTAwMWJbMzltIFxcdTAwMWJbMzdtZWxlbVxcdTAwMWJbMzltIFxcdTAwMWJbOTNtPT09XFx1MDAxYlszOW0gXFx1MDAxYls5Mm1cXCdzdHJpbmdcXCdcXHUwMDFiWzM5bVxcdTAwMWJbOTBtKVxcdTAwMWJbMzltIFxcdTAwMWJbMzdtZWxlbVxcdTAwMWJbMzltIFxcdTAwMWJbOTNtPVxcdTAwMWJbMzltIFxcdTAwMWJbMzdtZG9jdW1lbnRcXHUwMDFiWzM5bVxcdTAwMWJbMzJtLlxcdTAwMWJbMzltXFx1MDAxYlszN21xdWVyeVNlbGVjdG9yXFx1MDAxYlszOW1cXHUwMDFiWzkwbShcXHUwMDFiWzM5bVxcdTAwMWJbMzdtZWxlbVxcdTAwMWJbMzltXFx1MDAxYls5MG0pXFx1MDAxYlszOW1cXHUwMDFiWzkwbTtcXHUwMDFiWzM5bScsXG4gICcnLFxuICAnICAgIFxcdTAwMWJbMzdtZWxlbVxcdTAwMWJbMzltXFx1MDAxYlszMm0uXFx1MDAxYlszOW1cXHUwMDFiWzM3bWFwcGVuZENoaWxkXFx1MDAxYlszOW1cXHUwMDFiWzkwbShcXHUwMDFiWzM5bVxcdTAwMWJbMzdtdGVybVxcdTAwMWJbMzltXFx1MDAxYlszMm0uXFx1MDAxYlszOW1cXHUwMDFiWzM3bWVsZW1lbnRcXHUwMDFiWzM5bVxcdTAwMWJbOTBtKVxcdTAwMWJbMzltXFx1MDAxYls5MG07XFx1MDAxYlszOW0nLFxuICAnICAgIFxcdTAwMWJbMzdtdGVybVxcdTAwMWJbMzltXFx1MDAxYlszMm0uXFx1MDAxYlszOW1cXHUwMDFiWzM3bWVsZW1lbnRcXHUwMDFiWzM5bVxcdTAwMWJbMzJtLlxcdTAwMWJbMzltXFx1MDAxYlszN21zdHlsZVxcdTAwMWJbMzltXFx1MDAxYlszMm0uXFx1MDAxYlszOW1cXHUwMDFiWzM3bXBvc2l0aW9uXFx1MDAxYlszOW0gXFx1MDAxYls5M209XFx1MDAxYlszOW0gXFx1MDAxYls5Mm1cXCdyZWxhdGl2ZVxcJ1xcdTAwMWJbMzltXFx1MDAxYls5MG07XFx1MDAxYlszOW0nLFxuICAnICBcXHUwMDFiWzMzbX1cXHUwMDFiWzM5bVxcdTAwMWJbOTBtO1xcdTAwMWJbMzltJyxcbiAgJycsXG4gICcgIFxcdTAwMWJbMzdtaHlwZXJuYWxcXHUwMDFiWzM5bVxcdTAwMWJbMzJtLlxcdTAwMWJbMzltXFx1MDAxYlszN213cml0ZWxuXFx1MDAxYlszOW0gXFx1MDAxYls5M209XFx1MDAxYlszOW0gXFx1MDAxYls5NG1mdW5jdGlvblxcdTAwMWJbMzltIFxcdTAwMWJbOTBtKFxcdTAwMWJbMzltXFx1MDAxYlszN21saW5lXFx1MDAxYlszOW1cXHUwMDFiWzkwbSlcXHUwMDFiWzM5bSBcXHUwMDFiWzMzbXtcXHUwMDFiWzM5bScsXG4gICcgICAgXFx1MDAxYlszN210ZXJtXFx1MDAxYlszOW1cXHUwMDFiWzMybS5cXHUwMDFiWzM5bVxcdTAwMWJbMzdtd3JpdGVsblxcdTAwMWJbMzltXFx1MDAxYls5MG0oXFx1MDAxYlszOW1cXHUwMDFiWzM3bWxpbmVcXHUwMDFiWzM5bVxcdTAwMWJbOTBtKVxcdTAwMWJbMzltXFx1MDAxYls5MG07XFx1MDAxYlszOW0nLFxuICAnICBcXHUwMDFiWzMzbX1cXHUwMDFiWzM5bVxcdTAwMWJbOTBtO1xcdTAwMWJbMzltJyxcbiAgJycsXG4gICcgIFxcdTAwMWJbMzdtaHlwZXJuYWxcXHUwMDFiWzM5bVxcdTAwMWJbMzJtLlxcdTAwMWJbMzltXFx1MDAxYlszN213cml0ZVxcdTAwMWJbMzltIFxcdTAwMWJbOTNtPVxcdTAwMWJbMzltIFxcdTAwMWJbMzdtdGVybVxcdTAwMWJbMzltXFx1MDAxYlszMm0uXFx1MDAxYlszOW1cXHUwMDFiWzM3bXdyaXRlXFx1MDAxYlszOW1cXHUwMDFiWzMybS5cXHUwMDFiWzM5bVxcdTAwMWJbMzdtYmluZFxcdTAwMWJbMzltXFx1MDAxYls5MG0oXFx1MDAxYlszOW1cXHUwMDFiWzM3bXRlcm1cXHUwMDFiWzM5bVxcdTAwMWJbOTBtKVxcdTAwMWJbMzltXFx1MDAxYls5MG07XFx1MDAxYlszOW0nLFxuICAnJyxcbiAgJyAgXFx1MDAxYlszMW1yZXR1cm5cXHUwMDFiWzM5bSBcXHUwMDFiWzM3bWh5cGVybmFsXFx1MDAxYlszOW1cXHUwMDFiWzkwbTtcXHUwMDFiWzM5bScsXG4gICdcXHUwMDFiWzMzbX1cXHUwMDFiWzM5bVxcdTAwMWJbOTBtO1xcdTAwMWJbMzltJyxcbiAgJydcbl0uZm9yRWFjaChmdW5jdGlvbiAobGluZSkgeyB0ZXJtY29kZS53cml0ZWxuKGxpbmUpOyB9KTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGVybWluYWwgPSByZXF1aXJlKCcuL3Rlcm0nKSxcbiAgdGhyb3VnaCA9IHJlcXVpcmUoJ3Rocm91Z2gnKTtcbmZ1bmN0aW9uIHN0eWxlKHBhcmVudEVsZW0pIHtcbiAgdmFyIGN1cnJlbnRTdHlsZSA9IHBhcmVudEVsZW0uZ2V0QXR0cmlidXRlKCdzdHlsZScpIHx8ICcnO1xuICAvLyBUT0RPOiBtYWtlIHdoaXRlLXNwYWNlIHdvcmtcbiAgLy8gd2hpdGUtc3BhY2U6IHByZSBoYXMgdGhlIGZvbGxvd2luZyBwcm9ibGVtOlxuICAvLyBJZiBhcHBsaWVkIGJlZm9yZSB0aGUgdGVybWluYWwgaXMgdmlzaWJsZSwgdGhpbmdzIGJyZWFrIGhvcnJpYmx5XG4gIC8vIHRvIHRoZSBwb2ludCB0aGF0IHRoZSBvdXRwdXQgaXMgZWl0aGVyIHNoaWZ0ZWQgdG8gdGhlIGxlZnQgb3Igbm90IHZpc2libGUgYXQgYWxsLlxuICAvLyAoYXQgbGVhc3QgZm9yIGh5cGVyd2F0Y2gsIHRvIHJlcHJvOiAtLSBucG0gaW5zdGFsbCBoeXBlcndhdGNoOyBucG0gZXhwbG9yZSBoeXBlcndhdGNoOyBucG0gcnVuIGRlbW87IClcbiAgLy8gIC0gbW9zdCBsaWtlbHkgZHVlIHRvIHRoZSBmYWN0IHRoYXQgaHlwZXJ3YXRjaCBpcyBwb3NpdGlvbmVkIGFic29sdXRlXG4gIC8vXG4gIC8vIEhvd2V2ZXIgd2hlbiB0aGlzIHN0eWxlIGlzIHNldCBhZnRlciB0aGUgcGFyZW50IGVsZW1lbnQgYmVjYW1lIHZpc2libGUsIGl0IHdvcmtzIGZpbmUuXG4gIHBhcmVudEVsZW0uc2V0QXR0cmlidXRlKFxuICAgICdzdHlsZScsXG4gICAgY3VycmVudFN0eWxlICsgJ292ZXJmbG93LXk6IGF1dG87IC8qIHdoaXRlLXNwYWNlOiBwcmU7ICovJ1xuICApO1xufVxuXG5mdW5jdGlvbiBzY3JvbGwoZWxlbSkge1xuICBpZiAoIWVsZW0pIHJldHVybjtcbiAgZWxlbS5zY3JvbGxUb3AgPSBlbGVtLnNjcm9sbEhlaWdodDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0cykge1xuICB2YXIgdGVybSA9IG5ldyBUZXJtaW5hbChvcHRzKTtcbiAgdGVybS5vcGVuKCk7XG5cbiAgdmFyIGh5cGVybmFsID0gdGhyb3VnaCh0ZXJtLndyaXRlLmJpbmQodGVybSkpO1xuICBoeXBlcm5hbC5hcHBlbmRUbyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICBpZiAodHlwZW9mIHBhcmVudCA9PT0gJ3N0cmluZycpIHBhcmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFyZW50KTtcblxuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0ZXJtLmVsZW1lbnQpO1xuICAgIHN0eWxlKHBhcmVudCk7XG4gICAgaHlwZXJuYWwuY29udGFpbmVyID0gcGFyZW50O1xuICAgIHRlcm0uZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gIH07XG5cbiAgaHlwZXJuYWwud3JpdGVsbiA9IGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgdGVybS53cml0ZWxuKGxpbmUpO1xuICAgIGlmIChoeXBlcm5hbC50YWlsKSBzY3JvbGwoaHlwZXJuYWwuY29udGFpbmVyKTtcbiAgfTtcblxuICBoeXBlcm5hbC53cml0ZSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdGVybS53cml0ZShkYXRhKTtcbiAgICBpZiAoaHlwZXJuYWwudGFpbCkgc2Nyb2xsKGh5cGVybmFsLmNvbnRhaW5lcik7XG4gIH07XG5cbiAgLy8gY29udmVuaWVuY2Ugc2hvcnRjdXRzXG4gIGh5cGVybmFsLnJlc2V0ID0gdGVybS5yZXNldC5iaW5kKHRlcm0pO1xuICBoeXBlcm5hbC5lbGVtZW50ID0gdGVybS5lbGVtZW50O1xuXG4gIC8vIHRoZSB1bmRlcmx5aW5nIHRlcm0gZm9yIGFsbCBvdGhlciBuZWVkc1xuICBoeXBlcm5hbC50ZXJtID0gdGVybTtcblxuICByZXR1cm4gaHlwZXJuYWw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RhdGVzID0gcmVxdWlyZSgnLi9saWIvc3RhdGVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGVybWluYWw7XG5cbmZ1bmN0aW9uIFRlcm1pbmFsKG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBUZXJtaW5hbCkpIHJldHVybiBuZXcgVGVybWluYWwob3B0cyk7XG5cbiAgdGhpcy5jb2xzID0gb3B0cy5jb2xzIHx8IDUwMDtcbiAgdGhpcy5yb3dzID0gb3B0cy5yb3dzIHx8IDEwMDtcblxuICB0aGlzLnliYXNlID0gMDtcbiAgdGhpcy55ZGlzcCA9IDA7XG4gIHRoaXMueCA9IDA7XG4gIHRoaXMueSA9IDA7XG4gIHRoaXMuY3Vyc29yU3RhdGUgPSAwO1xuICB0aGlzLmN1cnNvckhpZGRlbiA9IGZhbHNlO1xuICB0aGlzLmNvbnZlcnRFb2wgPSBmYWxzZTtcbiAgdGhpcy5zdGF0ZSA9IHN0YXRlcy5ub3JtYWw7XG4gIHRoaXMucXVldWUgPSAnJztcbiAgdGhpcy5zY3JvbGxUb3AgPSAwO1xuICB0aGlzLnNjcm9sbEJvdHRvbSA9IHRoaXMucm93cyAtIDE7XG5cbiAgLy8gbW9kZXNcbiAgdGhpcy5hcHBsaWNhdGlvbktleXBhZCA9IGZhbHNlO1xuICB0aGlzLm9yaWdpbk1vZGUgPSBmYWxzZTtcbiAgdGhpcy5pbnNlcnRNb2RlID0gZmFsc2U7XG4gIHRoaXMud3JhcGFyb3VuZE1vZGUgPSBmYWxzZTtcbiAgdGhpcy5ub3JtYWwgPSBudWxsO1xuXG4gIC8vIGNoYXJzZXRcbiAgdGhpcy5jaGFyc2V0ID0gbnVsbDtcbiAgdGhpcy5nY2hhcnNldCA9IG51bGw7XG4gIHRoaXMuZ2xldmVsID0gMDtcbiAgdGhpcy5jaGFyc2V0cyA9IFtudWxsXTtcblxuICAvLyBtaXNjXG4gIHRoaXMuZWxlbWVudDtcbiAgdGhpcy5jaGlsZHJlbjtcbiAgdGhpcy5yZWZyZXNoU3RhcnQ7XG4gIHRoaXMucmVmcmVzaEVuZDtcbiAgdGhpcy5zYXZlZFg7XG4gIHRoaXMuc2F2ZWRZO1xuICB0aGlzLnNhdmVkQ29scztcblxuICAvLyBzdHJlYW1cbiAgdGhpcy5yZWFkYWJsZSA9IHRydWU7XG4gIHRoaXMud3JpdGFibGUgPSB0cnVlO1xuXG4gIHRoaXMuZGVmQXR0ciA9ICgyNTcgPDwgOSkgfCAyNTY7XG4gIHRoaXMuY3VyQXR0ciA9IHRoaXMuZGVmQXR0cjtcblxuICB0aGlzLnBhcmFtcyA9IFtdO1xuICB0aGlzLmN1cnJlbnRQYXJhbSA9IDA7XG4gIHRoaXMucHJlZml4ID0gJyc7XG4gIHRoaXMucG9zdGZpeCA9ICcnO1xuXG4gIHRoaXMubGluZXMgPSBbXTtcbiAgdmFyIGkgPSB0aGlzLnJvd3M7XG4gIHdoaWxlIChpLS0pIHtcbiAgICAgIHRoaXMubGluZXMucHVzaCh0aGlzLmJsYW5rTGluZSgpKTtcbiAgfVxuXG4gIHRoaXMudGFicztcbiAgdGhpcy5zZXR1cFN0b3BzKCk7XG59XG5cbnJlcXVpcmUoJy4vbGliL2NvbG9ycycpKFRlcm1pbmFsKTtcbnJlcXVpcmUoJy4vbGliL29wdGlvbnMnKShUZXJtaW5hbCk7XG5cbnJlcXVpcmUoJy4vbGliL29wZW4nKShUZXJtaW5hbCk7XG5yZXF1aXJlKCcuL2xpYi9kZXN0cm95JykoVGVybWluYWwpO1xucmVxdWlyZSgnLi9saWIvcmVmcmVzaCcpKFRlcm1pbmFsKTtcblxucmVxdWlyZSgnLi9saWIvd3JpdGUnKShUZXJtaW5hbCk7XG5cbnJlcXVpcmUoJy4vbGliL3NldGdMZXZlbCcpO1xucmVxdWlyZSgnLi9saWIvc2V0Z0NoYXJzZXQnKTtcblxucmVxdWlyZSgnLi9saWIvZGVidWcnKShUZXJtaW5hbCk7XG5cbnJlcXVpcmUoJy4vbGliL3N0b3BzJykoVGVybWluYWwpO1xuXG5yZXF1aXJlKCcuL2xpYi9lcmFzZScpKFRlcm1pbmFsKTtcbnJlcXVpcmUoJy4vbGliL2JsYW5rTGluZScpKFRlcm1pbmFsKTtcbnJlcXVpcmUoJy4vbGliL3JhbmdlJykoVGVybWluYWwpO1xucmVxdWlyZSgnLi9saWIvdXRpbCcpKFRlcm1pbmFsKTtcblxucmVxdWlyZSgnLi9saWIvZXNjL2luZGV4LmpzJykoVGVybWluYWwpO1xucmVxdWlyZSgnLi9saWIvZXNjL3Jlc2V0LmpzJykoVGVybWluYWwpO1xucmVxdWlyZSgnLi9saWIvZXNjL3RhYlNldC5qcycpKFRlcm1pbmFsKTtcblxucmVxdWlyZSgnLi9saWIvY3NpL2NoYXJBdHRyaWJ1dGVzJykoVGVybWluYWwpO1xucmVxdWlyZSgnLi9saWIvY3NpL2luc2VydC1kZWxldGUnKShUZXJtaW5hbCk7XG5yZXF1aXJlKCcuL2xpYi9jc2kvcG9zaXRpb24nKShUZXJtaW5hbCk7XG5yZXF1aXJlKCcuL2xpYi9jc2kvY3Vyc29yJykoVGVybWluYWwpO1xucmVxdWlyZSgnLi9saWIvY3NpL3JlcGVhdFByZWNlZGluZ0NoYXJhY3RlcicpKFRlcm1pbmFsKTtcbnJlcXVpcmUoJy4vbGliL2NzaS90YWJDbGVhcicpKFRlcm1pbmFsKTtcbnJlcXVpcmUoJy4vbGliL2NzaS9zb2Z0UmVzZXQnKShUZXJtaW5hbCk7XG5cbnJlcXVpcmUoJy4vbGliL2NoYXJzZXRzLmpzJykoVGVybWluYWwpO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiKGZ1bmN0aW9uKHByb2Nlc3Mpe3ZhciBTdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKVxuXG4vLyB0aHJvdWdoXG4vL1xuLy8gYSBzdHJlYW0gdGhhdCBkb2VzIG5vdGhpbmcgYnV0IHJlLWVtaXQgdGhlIGlucHV0LlxuLy8gdXNlZnVsIGZvciBhZ2dyZWdhdGluZyBhIHNlcmllcyBvZiBjaGFuZ2luZyBidXQgbm90IGVuZGluZyBzdHJlYW1zIGludG8gb25lIHN0cmVhbSlcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdGhyb3VnaFxudGhyb3VnaC50aHJvdWdoID0gdGhyb3VnaFxuXG4vL2NyZWF0ZSBhIHJlYWRhYmxlIHdyaXRhYmxlIHN0cmVhbS5cblxuZnVuY3Rpb24gdGhyb3VnaCAod3JpdGUsIGVuZCwgb3B0cykge1xuICB3cml0ZSA9IHdyaXRlIHx8IGZ1bmN0aW9uIChkYXRhKSB7IHRoaXMucXVldWUoZGF0YSkgfVxuICBlbmQgPSBlbmQgfHwgZnVuY3Rpb24gKCkgeyB0aGlzLnF1ZXVlKG51bGwpIH1cblxuICB2YXIgZW5kZWQgPSBmYWxzZSwgZGVzdHJveWVkID0gZmFsc2UsIGJ1ZmZlciA9IFtdLCBfZW5kZWQgPSBmYWxzZVxuICB2YXIgc3RyZWFtID0gbmV3IFN0cmVhbSgpXG4gIHN0cmVhbS5yZWFkYWJsZSA9IHN0cmVhbS53cml0YWJsZSA9IHRydWVcbiAgc3RyZWFtLnBhdXNlZCA9IGZhbHNlXG5cbi8vICBzdHJlYW0uYXV0b1BhdXNlICAgPSAhKG9wdHMgJiYgb3B0cy5hdXRvUGF1c2UgICA9PT0gZmFsc2UpXG4gIHN0cmVhbS5hdXRvRGVzdHJveSA9ICEob3B0cyAmJiBvcHRzLmF1dG9EZXN0cm95ID09PSBmYWxzZSlcblxuICBzdHJlYW0ud3JpdGUgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHdyaXRlLmNhbGwodGhpcywgZGF0YSlcbiAgICByZXR1cm4gIXN0cmVhbS5wYXVzZWRcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYWluKCkge1xuICAgIHdoaWxlKGJ1ZmZlci5sZW5ndGggJiYgIXN0cmVhbS5wYXVzZWQpIHtcbiAgICAgIHZhciBkYXRhID0gYnVmZmVyLnNoaWZ0KClcbiAgICAgIGlmKG51bGwgPT09IGRhdGEpXG4gICAgICAgIHJldHVybiBzdHJlYW0uZW1pdCgnZW5kJylcbiAgICAgIGVsc2VcbiAgICAgICAgc3RyZWFtLmVtaXQoJ2RhdGEnLCBkYXRhKVxuICAgIH1cbiAgfVxuXG4gIHN0cmVhbS5xdWV1ZSA9IHN0cmVhbS5wdXNoID0gZnVuY3Rpb24gKGRhdGEpIHtcbi8vICAgIGNvbnNvbGUuZXJyb3IoZW5kZWQpXG4gICAgaWYoX2VuZGVkKSByZXR1cm4gc3RyZWFtXG4gICAgaWYoZGF0YSA9PT0gbnVsbCkgX2VuZGVkID0gdHJ1ZVxuICAgIGJ1ZmZlci5wdXNoKGRhdGEpXG4gICAgZHJhaW4oKVxuICAgIHJldHVybiBzdHJlYW1cbiAgfVxuXG4gIC8vdGhpcyB3aWxsIGJlIHJlZ2lzdGVyZWQgYXMgdGhlIGZpcnN0ICdlbmQnIGxpc3RlbmVyXG4gIC8vbXVzdCBjYWxsIGRlc3Ryb3kgbmV4dCB0aWNrLCB0byBtYWtlIHN1cmUgd2UncmUgYWZ0ZXIgYW55XG4gIC8vc3RyZWFtIHBpcGVkIGZyb20gaGVyZS5cbiAgLy90aGlzIGlzIG9ubHkgYSBwcm9ibGVtIGlmIGVuZCBpcyBub3QgZW1pdHRlZCBzeW5jaHJvbm91c2x5LlxuICAvL2EgbmljZXIgd2F5IHRvIGRvIHRoaXMgaXMgdG8gbWFrZSBzdXJlIHRoaXMgaXMgdGhlIGxhc3QgbGlzdGVuZXIgZm9yICdlbmQnXG5cbiAgc3RyZWFtLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgc3RyZWFtLnJlYWRhYmxlID0gZmFsc2VcbiAgICBpZighc3RyZWFtLndyaXRhYmxlICYmIHN0cmVhbS5hdXRvRGVzdHJveSlcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzdHJlYW0uZGVzdHJveSgpXG4gICAgICB9KVxuICB9KVxuXG4gIGZ1bmN0aW9uIF9lbmQgKCkge1xuICAgIHN0cmVhbS53cml0YWJsZSA9IGZhbHNlXG4gICAgZW5kLmNhbGwoc3RyZWFtKVxuICAgIGlmKCFzdHJlYW0ucmVhZGFibGUgJiYgc3RyZWFtLmF1dG9EZXN0cm95KVxuICAgICAgc3RyZWFtLmRlc3Ryb3koKVxuICB9XG5cbiAgc3RyZWFtLmVuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYoZW5kZWQpIHJldHVyblxuICAgIGVuZGVkID0gdHJ1ZVxuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGgpIHN0cmVhbS53cml0ZShkYXRhKVxuICAgIF9lbmQoKSAvLyB3aWxsIGVtaXQgb3IgcXVldWVcbiAgICByZXR1cm4gc3RyZWFtXG4gIH1cblxuICBzdHJlYW0uZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihkZXN0cm95ZWQpIHJldHVyblxuICAgIGRlc3Ryb3llZCA9IHRydWVcbiAgICBlbmRlZCA9IHRydWVcbiAgICBidWZmZXIubGVuZ3RoID0gMFxuICAgIHN0cmVhbS53cml0YWJsZSA9IHN0cmVhbS5yZWFkYWJsZSA9IGZhbHNlXG4gICAgc3RyZWFtLmVtaXQoJ2Nsb3NlJylcbiAgICByZXR1cm4gc3RyZWFtXG4gIH1cblxuICBzdHJlYW0ucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYoc3RyZWFtLnBhdXNlZCkgcmV0dXJuXG4gICAgc3RyZWFtLnBhdXNlZCA9IHRydWVcbiAgICByZXR1cm4gc3RyZWFtXG4gIH1cblxuICBzdHJlYW0ucmVzdW1lID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKHN0cmVhbS5wYXVzZWQpIHtcbiAgICAgIHN0cmVhbS5wYXVzZWQgPSBmYWxzZVxuICAgICAgc3RyZWFtLmVtaXQoJ3Jlc3VtZScpXG4gICAgfVxuICAgIGRyYWluKClcbiAgICAvL21heSBoYXZlIGJlY29tZSBwYXVzZWQgYWdhaW4sXG4gICAgLy9hcyBkcmFpbiBlbWl0cyAnZGF0YScuXG4gICAgaWYoIXN0cmVhbS5wYXVzZWQpXG4gICAgICBzdHJlYW0uZW1pdCgnZHJhaW4nKVxuICAgIHJldHVybiBzdHJlYW1cbiAgfVxuICByZXR1cm4gc3RyZWFtXG59XG5cblxufSkocmVxdWlyZShcIl9fYnJvd3NlcmlmeV9wcm9jZXNzXCIpKSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVGVybWluYWwpIHtcblxuICAvLyBFU0MgYyBGdWxsIFJlc2V0IChSSVMpLlxuICBUZXJtaW5hbC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICBUZXJtaW5hbC5jYWxsKHRoaXMsIHRoaXMuY29scywgdGhpcy5yb3dzKTtcbiAgICB0aGlzLnJlZnJlc2goMCwgdGhpcy5yb3dzIC0gMSk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChUZXJtaW5hbCkge1xuXG5UZXJtaW5hbC5jaGFyc2V0cyA9IHt9O1xuXG4gIC8vIERFQyBTcGVjaWFsIENoYXJhY3RlciBhbmQgTGluZSBEcmF3aW5nIFNldC5cbiAgLy8gaHR0cDovL3Z0MTAwLm5ldC9kb2NzL3Z0MTAyLXVnL3RhYmxlNS0xMy5odG1sXG4gIC8vIEEgbG90IG9mIGN1cnNlcyBhcHBzIHVzZSB0aGlzIGlmIHRoZXkgc2VlIFRFUk09eHRlcm0uXG4gIC8vIHRlc3Rpbmc6IGVjaG8gLWUgJ1xcZSgwYVxcZShCJ1xuICAvLyBUaGUgeHRlcm0gb3V0cHV0IHNvbWV0aW1lcyBzZWVtcyB0byBjb25mbGljdCB3aXRoIHRoZVxuICAvLyByZWZlcmVuY2UgYWJvdmUuIHh0ZXJtIHNlZW1zIGluIGxpbmUgd2l0aCB0aGUgcmVmZXJlbmNlXG4gIC8vIHdoZW4gcnVubmluZyB2dHRlc3QgaG93ZXZlci5cbiAgLy8gVGhlIHRhYmxlIGJlbG93IG5vdyB1c2VzIHh0ZXJtJ3Mgb3V0cHV0IGZyb20gdnR0ZXN0LlxuICBUZXJtaW5hbC5jaGFyc2V0cy5TQ0xEID0geyAvLyAoMFxuICAgICdgJzogJ1xcdTI1YzYnLCAvLyAn4peGJ1xuICAgICdhJzogJ1xcdTI1OTInLCAvLyAn4paSJ1xuICAgICdiJzogJ1xcdTAwMDknLCAvLyAnXFx0J1xuICAgICdjJzogJ1xcdTAwMGMnLCAvLyAnXFxmJ1xuICAgICdkJzogJ1xcdTAwMGQnLCAvLyAnXFxyJ1xuICAgICdlJzogJ1xcdTAwMGEnLCAvLyAnXFxuJ1xuICAgICdmJzogJ1xcdTAwYjAnLCAvLyAnwrAnXG4gICAgJ2cnOiAnXFx1MDBiMScsIC8vICfCsSdcbiAgICAnaCc6ICdcXHUyNDI0JywgLy8gJ1xcdTI0MjQnIChOTClcbiAgICAnaSc6ICdcXHUwMDBiJywgLy8gJ1xcdidcbiAgICAnaic6ICdcXHUyNTE4JywgLy8gJ+KUmCdcbiAgICAnayc6ICdcXHUyNTEwJywgLy8gJ+KUkCdcbiAgICAnbCc6ICdcXHUyNTBjJywgLy8gJ+KUjCdcbiAgICAnbSc6ICdcXHUyNTE0JywgLy8gJ+KUlCdcbiAgICAnbic6ICdcXHUyNTNjJywgLy8gJ+KUvCdcbiAgICAnbyc6ICdcXHUyM2JhJywgLy8gJ+KOuidcbiAgICAncCc6ICdcXHUyM2JiJywgLy8gJ+KOuydcbiAgICAncSc6ICdcXHUyNTAwJywgLy8gJ+KUgCdcbiAgICAncic6ICdcXHUyM2JjJywgLy8gJ+KOvCdcbiAgICAncyc6ICdcXHUyM2JkJywgLy8gJ+KOvSdcbiAgICAndCc6ICdcXHUyNTFjJywgLy8gJ+KUnCdcbiAgICAndSc6ICdcXHUyNTI0JywgLy8gJ+KUpCdcbiAgICAndic6ICdcXHUyNTM0JywgLy8gJ+KUtCdcbiAgICAndyc6ICdcXHUyNTJjJywgLy8gJ+KUrCdcbiAgICAneCc6ICdcXHUyNTAyJywgLy8gJ+KUgidcbiAgICAneSc6ICdcXHUyMjY0JywgLy8gJ+KJpCdcbiAgICAneic6ICdcXHUyMjY1JywgLy8gJ+KJpSdcbiAgICAneyc6ICdcXHUwM2MwJywgLy8gJ8+AJ1xuICAgICd8JzogJ1xcdTIyNjAnLCAvLyAn4omgJ1xuICAgICd9JzogJ1xcdTAwYTMnLCAvLyAnwqMnXG4gICAgJ34nOiAnXFx1MDBiNycgLy8gJ8K3J1xuICB9O1xuXG4gIFRlcm1pbmFsLmNoYXJzZXRzLlVLID0gbnVsbDsgLy8gKEFcbiAgVGVybWluYWwuY2hhcnNldHMuVVMgPSBudWxsOyAvLyAoQiAoVVNBU0NJSSlcbiAgVGVybWluYWwuY2hhcnNldHMuRHV0Y2ggPSBudWxsOyAvLyAoNFxuICBUZXJtaW5hbC5jaGFyc2V0cy5GaW5uaXNoID0gbnVsbDsgLy8gKEMgb3IgKDVcbiAgVGVybWluYWwuY2hhcnNldHMuRnJlbmNoID0gbnVsbDsgLy8gKFJcbiAgVGVybWluYWwuY2hhcnNldHMuRnJlbmNoQ2FuYWRpYW4gPSBudWxsOyAvLyAoUVxuICBUZXJtaW5hbC5jaGFyc2V0cy5HZXJtYW4gPSBudWxsOyAvLyAoS1xuICBUZXJtaW5hbC5jaGFyc2V0cy5JdGFsaWFuID0gbnVsbDsgLy8gKFlcbiAgVGVybWluYWwuY2hhcnNldHMuTm9yd2VnaWFuRGFuaXNoID0gbnVsbDsgLy8gKEUgb3IgKDZcbiAgVGVybWluYWwuY2hhcnNldHMuU3BhbmlzaCA9IG51bGw7IC8vIChaXG4gIFRlcm1pbmFsLmNoYXJzZXRzLlN3ZWRpc2ggPSBudWxsOyAvLyAoSCBvciAoN1xuICBUZXJtaW5hbC5jaGFyc2V0cy5Td2lzcyA9IG51bGw7IC8vICg9XG4gIFRlcm1pbmFsLmNoYXJzZXRzLklTT0xhdGluID0gbnVsbDsgLy8gL0FcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbm9ybWFsICA6ICAwXG4gICwgZXNjYXBlZCA6ICAxXG4gICwgY3NpICAgICA6ICAyXG4gICwgb3NjICAgICA6ICAzXG4gICwgY2hhcnNldCA6ICA0XG4gICwgZGNzICAgICA6ICA1XG4gICwgaWdub3JlICA6ICA2XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChUZXJtaW5hbCkge1xuXG4gIC8qKlxuICAqIFJlbmRlcmluZyBFbmdpbmVcbiAgKi9cblxuICAvLyBJbiB0aGUgc2NyZWVuIGJ1ZmZlciwgZWFjaCBjaGFyYWN0ZXJcbiAgLy8gaXMgc3RvcmVkIGFzIGEgYW4gYXJyYXkgd2l0aCBhIGNoYXJhY3RlclxuICAvLyBhbmQgYSAzMi1iaXQgaW50ZWdlci5cbiAgLy8gRmlyc3QgdmFsdWU6IGEgdXRmLTE2IGNoYXJhY3Rlci5cbiAgLy8gU2Vjb25kIHZhbHVlOlxuICAvLyBOZXh0IDkgYml0czogYmFja2dyb3VuZCBjb2xvciAoMC01MTEpLlxuICAvLyBOZXh0IDkgYml0czogZm9yZWdyb3VuZCBjb2xvciAoMC01MTEpLlxuICAvLyBOZXh0IDE0IGJpdHM6IGEgbWFzayBmb3IgbWlzYy4gZmxhZ3M6XG4gIC8vIDE9Ym9sZCwgMj11bmRlcmxpbmUsIDQ9aW52ZXJzZVxuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuICAgIHZhciB4LCB5LCBpLCBsaW5lLCBvdXQsIGNoLCB3aWR0aCwgZGF0YSwgYXR0ciwgZmdDb2xvciwgYmdDb2xvciwgZmxhZ3MsIHJvdywgcGFyZW50O1xuXG4gICAgXG4gICAgd2lkdGggPSB0aGlzLmNvbHM7XG4gICAgeSA9IHN0YXJ0O1xuXG4gICAgZm9yICg7IHkgPD0gZW5kOyB5KyspIHtcbiAgICAgIHJvdyA9IHkgKyB0aGlzLnlkaXNwO1xuXG4gICAgICBsaW5lID0gdGhpcy5saW5lc1tyb3ddO1xuICAgICAgaWYgKCFsaW5lKSB7XG4gICAgICAgIC8vIHNpbXBsZSBzb2x1dGlvbiBpbiBjYXNlIHdlIGhhdmUgbW9yZSBsaW5lcyB0aGFuIHJvd3NcbiAgICAgICAgLy8gY291bGQgYmUgaW1wcm92ZWQgdG8gaW5zdGVhZCByZW1vdmUgZmlyc3QgbGluZSAoYW5kIHJlbGF0ZWQgaHRtbCBlbGVtZW50KVxuICAgICAgICByZXR1cm4gdGhpcy5yZXNldCgpO1xuICAgICAgfVxuXG4gICAgICBvdXQgPSAnJztcblxuICAgICAgaWYgKHkgPT09IHRoaXMueSAmJiB0aGlzLmN1cnNvclN0YXRlICYmIHRoaXMueWRpc3AgPT09IHRoaXMueWJhc2UgJiYgIXRoaXMuY3Vyc29ySGlkZGVuKSB7XG4gICAgICAgIHggPSB0aGlzLng7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB4ID0gLTE7XG4gICAgICB9XG5cbiAgICAgIGF0dHIgPSB0aGlzLmRlZkF0dHI7XG4gICAgICBpID0gMDtcblxuICAgICAgZm9yICg7IGkgPCB3aWR0aDsgaSsrKSB7XG4gICAgICAgIGRhdGEgPSBsaW5lW2ldWzBdO1xuICAgICAgICBjaCA9IGxpbmVbaV1bMV07XG5cbiAgICAgICAgaWYgKGkgPT09IHgpIGRhdGEgPSAtMTtcblxuICAgICAgICBpZiAoZGF0YSAhPT0gYXR0cikge1xuICAgICAgICAgIGlmIChhdHRyICE9PSB0aGlzLmRlZkF0dHIpIHtcbiAgICAgICAgICAgIG91dCArPSAnPC9zcGFuPic7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChkYXRhICE9PSB0aGlzLmRlZkF0dHIpIHtcbiAgICAgICAgICAgIGlmIChkYXRhID09PSAtMSkge1xuICAgICAgICAgICAgICBvdXQgKz0gJzxzcGFuIGNsYXNzPVwicmV2ZXJzZS12aWRlb1wiPic7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBvdXQgKz0gJzxzcGFuIHN0eWxlPVwiJztcblxuICAgICAgICAgICAgICBiZ0NvbG9yID0gZGF0YSAmIDB4MWZmO1xuICAgICAgICAgICAgICBmZ0NvbG9yID0gKGRhdGEgPj4gOSkgJiAweDFmZjtcbiAgICAgICAgICAgICAgZmxhZ3MgPSBkYXRhID4+IDE4O1xuXG4gICAgICAgICAgICAgIGlmIChmbGFncyAmIDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIVRlcm1pbmFsLmJyb2tlbkJvbGQpIHtcbiAgICAgICAgICAgICAgICAgIG91dCArPSAnZm9udC13ZWlnaHQ6Ym9sZDsnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBzZWU6IFhUZXJtKmJvbGRDb2xvcnNcbiAgICAgICAgICAgICAgICBpZiAoZmdDb2xvciA8IDgpIGZnQ29sb3IgKz0gODtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChmbGFncyAmIDIpIHtcbiAgICAgICAgICAgICAgICBvdXQgKz0gJ3RleHQtZGVjb3JhdGlvbjp1bmRlcmxpbmU7JztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChiZ0NvbG9yICE9PSAyNTYpIHtcbiAgICAgICAgICAgICAgICBvdXQgKz0gJ2JhY2tncm91bmQtY29sb3I6JyArIFRlcm1pbmFsLmNvbG9yc1tiZ0NvbG9yXSArICc7JztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChmZ0NvbG9yICE9PSAyNTcpIHtcbiAgICAgICAgICAgICAgICBvdXQgKz0gJ2NvbG9yOicgKyBUZXJtaW5hbC5jb2xvcnNbZmdDb2xvcl0gKyAnOyc7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBvdXQgKz0gJ1wiPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChjaCkge1xuICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICBvdXQgKz0gJyYnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICBvdXQgKz0gJzwnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICBvdXQgKz0gJz4nO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmIChjaCA8PSAnICcpIHtcbiAgICAgICAgICAgIG91dCArPSAnICc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dCArPSBjaDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBhdHRyID0gZGF0YTtcbiAgICAgIH1cblxuICAgICAgaWYgKGF0dHIgIT09IHRoaXMuZGVmQXR0cikge1xuICAgICAgICBvdXQgKz0gJzwvc3Bhbj4nO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNoaWxkcmVuW3ldLmlubmVySFRNTCA9IG91dDtcbiAgICB9XG5cbiAgICBpZiAocGFyZW50KSBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFRlcm1pbmFsKSB7IFxuICBUZXJtaW5hbC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVhZGFibGUgPSBmYWxzZTtcbiAgICB0aGlzLndyaXRhYmxlID0gZmFsc2U7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgdGhpcy5oYW5kbGVyID0gZnVuY3Rpb24oKSB7fTtcbiAgICB0aGlzLndyaXRlID0gZnVuY3Rpb24oKSB7fTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFRlcm1pbmFsKSB7XG5cbiAgLy8gQ29sb3JzIDAtMTVcbiAgVGVybWluYWwuY29sb3JzID0gW1xuICAvLyBkYXJrOlxuICAnIzJlMzQzNicsICcjY2MwMDAwJywgJyM0ZTlhMDYnLCAnI2M0YTAwMCcsICcjMzQ2NWE0JywgJyM3NTUwN2InLCAnIzA2OTg5YScsICcjZDNkN2NmJyxcbiAgLy8gYnJpZ2h0OlxuICAnIzU1NTc1MycsICcjZWYyOTI5JywgJyM4YWUyMzQnLCAnI2ZjZTk0ZicsICcjNzI5ZmNmJywgJyNhZDdmYTgnLCAnIzM0ZTJlMicsICcjZWVlZWVjJ107XG5cbiAgLy8gQ29sb3JzIDE2LTI1NVxuICAvLyBNdWNoIHRoYW5rcyB0byBUb29UYWxsTmF0ZSBmb3Igd3JpdGluZyB0aGlzLlxuICBUZXJtaW5hbC5jb2xvcnMgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvbG9ycyA9IFRlcm1pbmFsLmNvbG9ycyxcbiAgICAgIHIgPSBbMHgwMCwgMHg1ZiwgMHg4NywgMHhhZiwgMHhkNywgMHhmZl0sXG4gICAgICBpO1xuXG4gICAgLy8gMTYtMjMxXG4gICAgaSA9IDA7XG4gICAgZm9yICg7IGkgPCAyMTY7IGkrKykge1xuICAgICAgb3V0KHJbKGkgLyAzNikgJSA2IHwgMF0sIHJbKGkgLyA2KSAlIDYgfCAwXSwgcltpICUgNl0pO1xuICAgIH1cblxuICAgIC8vIDIzMi0yNTUgKGdyZXkpXG4gICAgaSA9IDA7XG4gICAgZm9yICg7IGkgPCAyNDsgaSsrKSB7XG4gICAgICByID0gOCArIGkgKiAxMDtcbiAgICAgIG91dChyLCByLCByKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvdXQociwgZywgYikge1xuICAgICAgY29sb3JzLnB1c2goJyMnICsgaGV4KHIpICsgaGV4KGcpICsgaGV4KGIpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoZXgoYykge1xuICAgICAgYyA9IGMudG9TdHJpbmcoMTYpO1xuICAgICAgcmV0dXJuIGMubGVuZ3RoIDwgMiA/ICcwJyArIGMgOiBjO1xuICAgIH1cblxuICAgIHJldHVybiBjb2xvcnM7XG4gIH0pKCk7XG5cbiAgLy8gRGVmYXVsdCBCRy9GR1xuICBUZXJtaW5hbC5kZWZhdWx0Q29sb3JzID0ge1xuICAgIGJnOiAnIzAwMDAwMCcsXG4gICAgZmc6ICcjZjBmMGYwJ1xuICB9O1xuXG4gIFRlcm1pbmFsLmNvbG9yc1syNTZdID0gVGVybWluYWwuZGVmYXVsdENvbG9ycy5iZztcbiAgVGVybWluYWwuY29sb3JzWzI1N10gPSBUZXJtaW5hbC5kZWZhdWx0Q29sb3JzLmZnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVGVybWluYWwpIHtcbiAgVGVybWluYWwucHJvdG90eXBlLnNldGdMZXZlbCA9IGZ1bmN0aW9uKGcpIHtcbiAgICB0aGlzLmdsZXZlbCA9IGc7XG4gICAgdGhpcy5jaGFyc2V0ID0gdGhpcy5jaGFyc2V0c1tnXTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGlmIGJvbGQgaXMgYnJva2VuLCB3ZSBjYW4ndFxuLy8gdXNlIGl0IGluIHRoZSB0ZXJtaW5hbC5cbmZ1bmN0aW9uIGlzQm9sZEJyb2tlbigpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgZWwuaW5uZXJIVE1MID0gJ2hlbGxvIHdvcmxkJztcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsKTtcbiAgICB2YXIgdzEgPSBlbC5zY3JvbGxXaWR0aDtcbiAgICBlbC5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xuICAgIHZhciB3MiA9IGVsLnNjcm9sbFdpZHRoO1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZWwpO1xuICAgIHJldHVybiB3MSAhPT0gdzI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFRlcm1pbmFsKSB7XG4gIC8qKlxuICAqIE9wZW4gVGVybWluYWxcbiAgKi9cblxuICBUZXJtaW5hbC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGkgPSAwLFxuICAgICAgZGl2O1xuXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTmFtZSA9ICd0ZXJtaW5hbCc7XG4gICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuXG4gICAgZm9yICg7IGkgPCB0aGlzLnJvd3M7IGkrKykge1xuICAgICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChkaXYpO1xuICAgIH1cblxuICAgIHRoaXMucmVmcmVzaCgwLCB0aGlzLnJvd3MgLSAxKTtcblxuICAgIC8vIFhYWCAtIGhhY2ssIG1vdmUgdGhpcyBzb21ld2hlcmUgZWxzZS5cbiAgICBpZiAoVGVybWluYWwuYnJva2VuQm9sZCA9PT0gbnVsbCkge1xuICAgICAgVGVybWluYWwuYnJva2VuQm9sZCA9IGlzQm9sZEJyb2tlbigpO1xuICAgIH1cblxuICAgIC8vIHN5bmMgZGVmYXVsdCBiZy9mZyBjb2xvcnNcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gVGVybWluYWwuZGVmYXVsdENvbG9ycy5iZztcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuY29sb3IgPSBUZXJtaW5hbC5kZWZhdWx0Q29sb3JzLmZnO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIGlnbm9yZSB3YXJuaW5ncyByZWdhcmdpbmcgPT0gYW5kICE9IChjb2Vyc2lvbiBtYWtlcyB0aGluZ3Mgd29yayBoZXJlIGFwcGVhcmVudGx5KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChUZXJtaW5hbCkge1xuICBcbiAgVGVybWluYWwucHJvdG90eXBlLnNldHVwU3RvcHMgPSBmdW5jdGlvbihpKSB7XG4gICAgICBpZiAoaSAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLnRhYnNbaV0pIHtcbiAgICAgICAgICAgICAgaSA9IHRoaXMucHJldlN0b3AoaSk7XG4gICAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnRhYnMgPSB7fTtcbiAgICAgICAgICBpID0gMDtcbiAgICAgIH1cblxuICAgICAgZm9yICg7IGkgPCB0aGlzLmNvbHM7IGkgKz0gOCkge1xuICAgICAgICAgIHRoaXMudGFic1tpXSA9IHRydWU7XG4gICAgICB9XG4gIH07XG5cbiAgVGVybWluYWwucHJvdG90eXBlLnByZXZTdG9wID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKHggPT0gbnVsbCkgeCA9IHRoaXMueDtcbiAgICAgIHdoaWxlICghdGhpcy50YWJzWy0teF0gJiYgeCA+IDApO1xuICAgICAgcmV0dXJuIHggPj0gdGhpcy5jb2xzID8gdGhpcy5jb2xzIC0gMSA6IHggPCAwID8gMCA6IHg7XG4gIH07XG5cbiAgVGVybWluYWwucHJvdG90eXBlLm5leHRTdG9wID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKHggPT0gbnVsbCkgeCA9IHRoaXMueDtcbiAgICAgIHdoaWxlICghdGhpcy50YWJzWysreF0gJiYgeCA8IHRoaXMuY29scyk7XG4gICAgICByZXR1cm4geCA+PSB0aGlzLmNvbHMgPyB0aGlzLmNvbHMgLSAxIDogeCA8IDAgPyAwIDogeDtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFRlcm1pbmFsKSB7XG4gIFRlcm1pbmFsLnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIVRlcm1pbmFsLmRlYnVnKSByZXR1cm47XG4gICAgaWYgKCF3aW5kb3cuY29uc29sZSB8fCAhd2luZG93LmNvbnNvbGUubG9nKSByZXR1cm47XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIHdpbmRvdy5jb25zb2xlLmxvZy5hcHBseSh3aW5kb3cuY29uc29sZSwgYXJncyk7XG4gIH07XG5cbiAgVGVybWluYWwucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFUZXJtaW5hbC5kZWJ1ZykgcmV0dXJuO1xuICAgIGlmICghd2luZG93LmNvbnNvbGUgfHwgIXdpbmRvdy5jb25zb2xlLmVycm9yKSByZXR1cm47XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIHdpbmRvdy5jb25zb2xlLmVycm9yLmFwcGx5KHdpbmRvdy5jb25zb2xlLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFRlcm1pbmFsKSB7XG4gIFRlcm1pbmFsLnByb3RvdHlwZS5zZXRnQ2hhcnNldCA9IGZ1bmN0aW9uKGcsIGNoYXJzZXQpIHtcbiAgICB0aGlzLmNoYXJzZXRzW2ddID0gY2hhcnNldDtcbiAgICBpZiAodGhpcy5nbGV2ZWwgPT09IGcpIHtcbiAgICAgIHRoaXMuY2hhcnNldCA9IGNoYXJzZXQ7XG4gICAgfVxuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVGVybWluYWwpIHtcbiAgVGVybWluYWwucHJvdG90eXBlLmVyYXNlUmlnaHQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIGxpbmUgPSB0aGlzLmxpbmVzW3RoaXMueWJhc2UgKyB5XSxcbiAgICAgIGNoID0gW3RoaXMuY3VyQXR0ciwgJyAnXTsgLy8geHRlcm1cblxuICAgIGZvciAoOyB4IDwgdGhpcy5jb2xzOyB4KyspIHtcbiAgICAgIGxpbmVbeF0gPSBjaDtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZVJhbmdlKHkpO1xuICB9O1xuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5lcmFzZUxlZnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIGxpbmUgPSB0aGlzLmxpbmVzW3RoaXMueWJhc2UgKyB5XSxcbiAgICAgIGNoID0gW3RoaXMuY3VyQXR0ciwgJyAnXTsgLy8geHRlcm1cblxuICAgIHgrKztcbiAgICB3aGlsZSAoeC0tKSBsaW5lW3hdID0gY2g7XG5cbiAgICB0aGlzLnVwZGF0ZVJhbmdlKHkpO1xuICB9O1xuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5lcmFzZUxpbmUgPSBmdW5jdGlvbih5KSB7XG4gICAgdGhpcy5lcmFzZVJpZ2h0KDAsIHkpO1xuICB9O1xuICBcbiAgLy8gQ1NJIFBzIEogRXJhc2UgaW4gRGlzcGxheSAoRUQpLlxuICAvLyBQcyA9IDAgLT4gRXJhc2UgQmVsb3cgKGRlZmF1bHQpLlxuICAvLyBQcyA9IDEgLT4gRXJhc2UgQWJvdmUuXG4gIC8vIFBzID0gMiAtPiBFcmFzZSBBbGwuXG4gIC8vIFBzID0gMyAtPiBFcmFzZSBTYXZlZCBMaW5lcyAoeHRlcm0pLlxuICAvLyBDU0kgPyBQcyBKXG4gIC8vIEVyYXNlIGluIERpc3BsYXkgKERFQ1NFRCkuXG4gIC8vIFBzID0gMCAtPiBTZWxlY3RpdmUgRXJhc2UgQmVsb3cgKGRlZmF1bHQpLlxuICAvLyBQcyA9IDEgLT4gU2VsZWN0aXZlIEVyYXNlIEFib3ZlLlxuICAvLyBQcyA9IDIgLT4gU2VsZWN0aXZlIEVyYXNlIEFsbC5cbiAgVGVybWluYWwucHJvdG90eXBlLmVyYXNlSW5EaXNwbGF5ID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICB2YXIgajtcbiAgICAgIHN3aXRjaCAocGFyYW1zWzBdKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgICAgdGhpcy5lcmFzZVJpZ2h0KHRoaXMueCwgdGhpcy55KTtcbiAgICAgICAgICBqID0gdGhpcy55ICsgMTtcbiAgICAgICAgICBmb3IgKDsgaiA8IHRoaXMucm93czsgaisrKSB7XG4gICAgICAgICAgICAgIHRoaXMuZXJhc2VMaW5lKGopO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgICB0aGlzLmVyYXNlTGVmdCh0aGlzLngsIHRoaXMueSk7XG4gICAgICAgICAgaiA9IHRoaXMueTtcbiAgICAgICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgICAgICAgIHRoaXMuZXJhc2VMaW5lKGopO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgICBqID0gdGhpcy5yb3dzO1xuICAgICAgICAgIHdoaWxlIChqLS0pIHRoaXMuZXJhc2VMaW5lKGopO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICAgIDsgLy8gbm8gc2F2ZWQgbGluZXNcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgfTtcblxuICAvLyBDU0kgUHMgSyBFcmFzZSBpbiBMaW5lIChFTCkuXG4gIC8vIFBzID0gMCAtPiBFcmFzZSB0byBSaWdodCAoZGVmYXVsdCkuXG4gIC8vIFBzID0gMSAtPiBFcmFzZSB0byBMZWZ0LlxuICAvLyBQcyA9IDIgLT4gRXJhc2UgQWxsLlxuICAvLyBDU0kgPyBQcyBLXG4gIC8vIEVyYXNlIGluIExpbmUgKERFQ1NFTCkuXG4gIC8vIFBzID0gMCAtPiBTZWxlY3RpdmUgRXJhc2UgdG8gUmlnaHQgKGRlZmF1bHQpLlxuICAvLyBQcyA9IDEgLT4gU2VsZWN0aXZlIEVyYXNlIHRvIExlZnQuXG4gIC8vIFBzID0gMiAtPiBTZWxlY3RpdmUgRXJhc2UgQWxsLlxuICBUZXJtaW5hbC5wcm90b3R5cGUuZXJhc2VJbkxpbmUgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgIHN3aXRjaCAocGFyYW1zWzBdKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgICAgdGhpcy5lcmFzZVJpZ2h0KHRoaXMueCwgdGhpcy55KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgICB0aGlzLmVyYXNlTGVmdCh0aGlzLngsIHRoaXMueSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgICAgdGhpcy5lcmFzZUxpbmUodGhpcy55KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFRlcm1pbmFsKSB7XG4gIFRlcm1pbmFsLnByb3RvdHlwZS5ibGFua0xpbmUgPSBmdW5jdGlvbihjdXIpIHtcbiAgICB2YXIgYXR0ciA9IGN1ciA/IHRoaXMuY3VyQXR0ciA6IHRoaXMuZGVmQXR0cjtcblxuICAgIHZhciBjaCA9IFthdHRyLCAnICddLFxuICAgICAgbGluZSA9IFtdLFxuICAgICAgaSA9IDA7XG5cbiAgICBmb3IgKDsgaSA8IHRoaXMuY29sczsgaSsrKSB7XG4gICAgICBsaW5lW2ldID0gY2g7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmU7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChUZXJtaW5hbCkge1xuICBUZXJtaW5hbC50ZXJtTmFtZSAgICAgICAgPSAgJ3h0ZXJtJztcbiAgVGVybWluYWwuZ2VvbWV0cnkgICAgICAgID0gIFs4MCwgMjRdO1xuICBUZXJtaW5hbC5jdXJzb3JCbGluayAgICAgPSAgdHJ1ZTtcbiAgVGVybWluYWwudmlzdWFsQmVsbCAgICAgID0gIGZhbHNlO1xuICBUZXJtaW5hbC5wb3BPbkJlbGwgICAgICAgPSAgZmFsc2U7XG4gIFRlcm1pbmFsLnNjcm9sbGJhY2sgICAgICA9ICAxMDAwO1xuICBUZXJtaW5hbC5zY3JlZW5LZXlzICAgICAgPSAgZmFsc2U7XG4gIFRlcm1pbmFsLnByb2dyYW1GZWF0dXJlcyA9ICBmYWxzZTtcbiAgVGVybWluYWwuZGVidWcgICAgICAgICAgID0gIGZhbHNlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gYWRkUm93c09uRGVtYW5kICgpIHtcbiAgd2hpbGUgKHRoaXMueSA+PSB0aGlzLnJvd3MpIHtcbiAgICB0aGlzLmxpbmVzLnB1c2godGhpcy5ibGFua0xpbmUoKSk7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChkaXYpO1xuICAgIHRoaXMuY2hpbGRyZW4ucHVzaChkaXYpO1xuXG4gICAgdGhpcy5yb3dzKys7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVGVybWluYWwpIHtcbiAgVGVybWluYWwucHJvdG90eXBlLnVwZGF0ZVJhbmdlID0gZnVuY3Rpb24oeSkge1xuICAgIGlmICh5IDwgdGhpcy5yZWZyZXNoU3RhcnQpIHRoaXMucmVmcmVzaFN0YXJ0ID0geTtcbiAgICBpZiAoeSA+IHRoaXMucmVmcmVzaEVuZCkgdGhpcy5yZWZyZXNoRW5kID0geTtcbiAgICBhZGRSb3dzT25EZW1hbmQuYmluZCh0aGlzKSgpO1xuICB9O1xuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5tYXhSYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVmcmVzaFN0YXJ0ID0gMDtcbiAgICB0aGlzLnJlZnJlc2hFbmQgPSB0aGlzLnJvd3MgLSAxO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVGVybWluYWwpIHtcbiAgVGVybWluYWwucHJvdG90eXBlLmNoID0gZnVuY3Rpb24oY3VyKSB7XG4gICAgcmV0dXJuIGN1ciA/IFt0aGlzLmN1ckF0dHIsICcgJ10gOiBbdGhpcy5kZWZBdHRyLCAnICddO1xuICB9O1xuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5pcyA9IGZ1bmN0aW9uKHRlcm0pIHtcbiAgICB2YXIgbmFtZSA9IHRoaXMudGVybU5hbWUgfHwgVGVybWluYWwudGVybU5hbWU7XG4gICAgcmV0dXJuIChuYW1lICsgJycpXG4gICAgICAuaW5kZXhPZih0ZXJtKSA9PT0gMDtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFRlcm1pbmFsKSB7XG5cbiAgLy8gQ1NJIFBzIEBcbiAgLy8gSW5zZXJ0IFBzIChCbGFuaykgQ2hhcmFjdGVyKHMpIChkZWZhdWx0ID0gMSkgKElDSCkuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5pbnNlcnRDaGFycyA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgIHZhciBwYXJhbSwgcm93LCBqLCBjaDtcblxuICAgIHBhcmFtID0gcGFyYW1zWzBdO1xuICAgIGlmIChwYXJhbSA8IDEpIHBhcmFtID0gMTtcblxuICAgIHJvdyA9IHRoaXMueSArIHRoaXMueWJhc2U7XG4gICAgaiA9IHRoaXMueDtcbiAgICBjaCA9IFt0aGlzLmN1ckF0dHIsICcgJ107IC8vIHh0ZXJtXG5cbiAgICB3aGlsZSAocGFyYW0tLSAmJiBqIDwgdGhpcy5jb2xzKSB7XG4gICAgICB0aGlzLmxpbmVzW3Jvd10uc3BsaWNlKGorKywgMCwgY2gpO1xuICAgICAgdGhpcy5saW5lc1tyb3ddLnBvcCgpO1xuICAgIH1cbiAgfTtcblxuXG4gIC8vIENTSSBQcyBMXG4gIC8vIEluc2VydCBQcyBMaW5lKHMpIChkZWZhdWx0ID0gMSkgKElMKS5cbiAgVGVybWluYWwucHJvdG90eXBlLmluc2VydExpbmVzID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgdmFyIHBhcmFtLCByb3csIGo7XG5cbiAgICBwYXJhbSA9IHBhcmFtc1swXTtcbiAgICBpZiAocGFyYW0gPCAxKSBwYXJhbSA9IDE7XG4gICAgcm93ID0gdGhpcy55ICsgdGhpcy55YmFzZTtcblxuICAgIGogPSB0aGlzLnJvd3MgLSAxIC0gdGhpcy5zY3JvbGxCb3R0b207XG4gICAgaiA9IHRoaXMucm93cyAtIDEgKyB0aGlzLnliYXNlIC0gaiArIDE7XG5cbiAgICB3aGlsZSAocGFyYW0tLSkge1xuICAgICAgLy8gdGVzdDogZWNobyAtZSAnXFxlWzQ0bVxcZVsxTFxcZVswbSdcbiAgICAgIC8vIGJsYW5rTGluZSh0cnVlKSAtIHh0ZXJtL2xpbnV4IGJlaGF2aW9yXG4gICAgICB0aGlzLmxpbmVzLnNwbGljZShyb3csIDAsIHRoaXMuYmxhbmtMaW5lKHRydWUpKTtcbiAgICAgIHRoaXMubGluZXMuc3BsaWNlKGosIDEpO1xuICAgIH1cblxuICAgIC8vIHRoaXMubWF4UmFuZ2UoKTtcbiAgICB0aGlzLnVwZGF0ZVJhbmdlKHRoaXMueSk7XG4gICAgdGhpcy51cGRhdGVSYW5nZSh0aGlzLnNjcm9sbEJvdHRvbSk7XG4gIH07XG5cbiAgLy8gQ1NJIFBzIE1cbiAgLy8gRGVsZXRlIFBzIExpbmUocykgKGRlZmF1bHQgPSAxKSAoREwpLlxuICBUZXJtaW5hbC5wcm90b3R5cGUuZGVsZXRlTGluZXMgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICB2YXIgcGFyYW0sIHJvdywgajtcblxuICAgIHBhcmFtID0gcGFyYW1zWzBdO1xuICAgIGlmIChwYXJhbSA8IDEpIHBhcmFtID0gMTtcbiAgICByb3cgPSB0aGlzLnkgKyB0aGlzLnliYXNlO1xuXG4gICAgaiA9IHRoaXMucm93cyAtIDEgLSB0aGlzLnNjcm9sbEJvdHRvbTtcbiAgICBqID0gdGhpcy5yb3dzIC0gMSArIHRoaXMueWJhc2UgLSBqO1xuXG4gICAgd2hpbGUgKHBhcmFtLS0pIHtcbiAgICAgIC8vIHRlc3Q6IGVjaG8gLWUgJ1xcZVs0NG1cXGVbMU1cXGVbMG0nXG4gICAgICAvLyBibGFua0xpbmUodHJ1ZSkgLSB4dGVybS9saW51eCBiZWhhdmlvclxuICAgICAgdGhpcy5saW5lcy5zcGxpY2UoaiArIDEsIDAsIHRoaXMuYmxhbmtMaW5lKHRydWUpKTtcbiAgICAgIHRoaXMubGluZXMuc3BsaWNlKHJvdywgMSk7XG4gICAgfVxuXG4gICAgLy8gdGhpcy5tYXhSYW5nZSgpO1xuICAgIHRoaXMudXBkYXRlUmFuZ2UodGhpcy55KTtcbiAgICB0aGlzLnVwZGF0ZVJhbmdlKHRoaXMuc2Nyb2xsQm90dG9tKTtcbiAgfTtcblxuICAvLyBDU0kgUHMgUFxuICAvLyBEZWxldGUgUHMgQ2hhcmFjdGVyKHMpIChkZWZhdWx0ID0gMSkgKERDSCkuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5kZWxldGVDaGFycyA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgIHZhciBwYXJhbSwgcm93LCBjaDtcblxuICAgIHBhcmFtID0gcGFyYW1zWzBdO1xuICAgIGlmIChwYXJhbSA8IDEpIHBhcmFtID0gMTtcblxuICAgIHJvdyA9IHRoaXMueSArIHRoaXMueWJhc2U7XG4gICAgY2ggPSBbdGhpcy5jdXJBdHRyLCAnICddOyAvLyB4dGVybVxuXG4gICAgd2hpbGUgKHBhcmFtLS0pIHtcbiAgICAgIHRoaXMubGluZXNbcm93XS5zcGxpY2UodGhpcy54LCAxKTtcbiAgICAgIHRoaXMubGluZXNbcm93XS5wdXNoKGNoKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gQ1NJIFBzIFhcbiAgLy8gRXJhc2UgUHMgQ2hhcmFjdGVyKHMpIChkZWZhdWx0ID0gMSkgKEVDSCkuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5lcmFzZUNoYXJzID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgdmFyIHBhcmFtLCByb3csIGosIGNoO1xuXG4gICAgcGFyYW0gPSBwYXJhbXNbMF07XG4gICAgaWYgKHBhcmFtIDwgMSkgcGFyYW0gPSAxO1xuXG4gICAgcm93ID0gdGhpcy55ICsgdGhpcy55YmFzZTtcbiAgICBqID0gdGhpcy54O1xuICAgIGNoID0gW3RoaXMuY3VyQXR0ciwgJyAnXTsgLy8geHRlcm1cblxuICAgIHdoaWxlIChwYXJhbS0tICYmIGogPCB0aGlzLmNvbHMpIHtcbiAgICAgIHRoaXMubGluZXNbcm93XVtqKytdID0gY2g7XG4gICAgfVxuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVGVybWluYWwpIHtcbiAgLy8gQ1NJIFBzIGIgUmVwZWF0IHRoZSBwcmVjZWRpbmcgZ3JhcGhpYyBjaGFyYWN0ZXIgUHMgdGltZXMgKFJFUCkuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5yZXBlYXRQcmVjZWRpbmdDaGFyYWN0ZXIgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICB2YXIgcGFyYW0gPSBwYXJhbXNbMF0gfHwgMSxcbiAgICAgIGxpbmUgPSB0aGlzLmxpbmVzW3RoaXMueWJhc2UgKyB0aGlzLnldLFxuICAgICAgY2ggPSBsaW5lW3RoaXMueCAtIDFdIHx8IFt0aGlzLmRlZkF0dHIsICcgJ107XG5cbiAgICB3aGlsZSAocGFyYW0tLSkgbGluZVt0aGlzLngrK10gPSBjaDtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFRlcm1pbmFsKSB7XG4gIC8vIENTSSBzXG4gIC8vIFNhdmUgY3Vyc29yIChBTlNJLlNZUykuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5zYXZlQ3Vyc29yID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgdGhpcy5zYXZlZFggPSB0aGlzLng7XG4gICAgdGhpcy5zYXZlZFkgPSB0aGlzLnk7XG4gIH07XG5cbiAgLy8gQ1NJIHVcbiAgLy8gUmVzdG9yZSBjdXJzb3IgKEFOU0kuU1lTKS5cbiAgVGVybWluYWwucHJvdG90eXBlLnJlc3RvcmVDdXJzb3IgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICB0aGlzLnggPSB0aGlzLnNhdmVkWCB8fCAwO1xuICAgIHRoaXMueSA9IHRoaXMuc2F2ZWRZIHx8IDA7XG4gIH07XG5cbiAgLy8gQ1NJIFBzIEFcbiAgLy8gQ3Vyc29yIFVwIFBzIFRpbWVzIChkZWZhdWx0ID0gMSkgKENVVSkuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5jdXJzb3JVcCA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgdmFyIHBhcmFtID0gcGFyYW1zWzBdO1xuICAgICAgaWYgKHBhcmFtIDwgMSkgcGFyYW0gPSAxO1xuICAgICAgdGhpcy55IC09IHBhcmFtO1xuICAgICAgaWYgKHRoaXMueSA8IDApIHRoaXMueSA9IDA7XG4gIH07XG5cbiAgLy8gQ1NJIFBzIEJcbiAgLy8gQ3Vyc29yIERvd24gUHMgVGltZXMgKGRlZmF1bHQgPSAxKSAoQ1VEKS5cbiAgVGVybWluYWwucHJvdG90eXBlLmN1cnNvckRvd24gPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgIHZhciBwYXJhbSA9IHBhcmFtc1swXTtcbiAgICAgIGlmIChwYXJhbSA8IDEpIHBhcmFtID0gMTtcbiAgICAgIHRoaXMueSArPSBwYXJhbTtcbiAgICAgIGlmICh0aGlzLnkgPj0gdGhpcy5yb3dzKSB7XG4gICAgICAgICAgdGhpcy55ID0gdGhpcy5yb3dzIC0gMTtcbiAgICAgIH1cbiAgfTtcblxuICAvLyBDU0kgUHMgQ1xuICAvLyBDdXJzb3IgRm9yd2FyZCBQcyBUaW1lcyAoZGVmYXVsdCA9IDEpIChDVUYpLlxuICBUZXJtaW5hbC5wcm90b3R5cGUuY3Vyc29yRm9yd2FyZCA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgdmFyIHBhcmFtID0gcGFyYW1zWzBdO1xuICAgICAgaWYgKHBhcmFtIDwgMSkgcGFyYW0gPSAxO1xuICAgICAgdGhpcy54ICs9IHBhcmFtO1xuICAgICAgaWYgKHRoaXMueCA+PSB0aGlzLmNvbHMpIHtcbiAgICAgICAgICB0aGlzLnggPSB0aGlzLmNvbHMgLSAxO1xuICAgICAgfVxuICB9O1xuXG4gIC8vIENTSSBQcyBEXG4gIC8vIEN1cnNvciBCYWNrd2FyZCBQcyBUaW1lcyAoZGVmYXVsdCA9IDEpIChDVUIpLlxuICBUZXJtaW5hbC5wcm90b3R5cGUuY3Vyc29yQmFja3dhcmQgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgIHZhciBwYXJhbSA9IHBhcmFtc1swXTtcbiAgICAgIGlmIChwYXJhbSA8IDEpIHBhcmFtID0gMTtcbiAgICAgIHRoaXMueCAtPSBwYXJhbTtcbiAgICAgIGlmICh0aGlzLnggPCAwKSB0aGlzLnggPSAwO1xuICB9O1xuXG4gIC8vIENTSSBQcyA7IFBzIEhcbiAgLy8gQ3Vyc29yIFBvc2l0aW9uIFtyb3c7Y29sdW1uXSAoZGVmYXVsdCA9IFsxLDFdKSAoQ1VQKS5cbiAgVGVybWluYWwucHJvdG90eXBlLmN1cnNvclBvcyA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgdmFyIHJvdywgY29sO1xuXG4gICAgICByb3cgPSBwYXJhbXNbMF0gLSAxO1xuXG4gICAgICBpZiAocGFyYW1zLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgY29sID0gcGFyYW1zWzFdIC0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29sID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHJvdyA8IDApIHtcbiAgICAgICAgICByb3cgPSAwO1xuICAgICAgfSBlbHNlIGlmIChyb3cgPj0gdGhpcy5yb3dzKSB7XG4gICAgICAgICAgcm93ID0gdGhpcy5yb3dzIC0gMTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbCA8IDApIHtcbiAgICAgICAgICBjb2wgPSAwO1xuICAgICAgfSBlbHNlIGlmIChjb2wgPj0gdGhpcy5jb2xzKSB7XG4gICAgICAgICAgY29sID0gdGhpcy5jb2xzIC0gMTtcbiAgICAgIH1cblxuICAgICAgdGhpcy54ID0gY29sO1xuICAgICAgdGhpcy55ID0gcm93O1xuICB9O1xuICBcbiAgLy8gQ1NJIFBzIEVcbiAgLy8gQ3Vyc29yIE5leHQgTGluZSBQcyBUaW1lcyAoZGVmYXVsdCA9IDEpIChDTkwpLlxuICAvLyBzYW1lIGFzIENTSSBQcyBCID9cbiAgVGVybWluYWwucHJvdG90eXBlLmN1cnNvck5leHRMaW5lID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICB2YXIgcGFyYW0gPSBwYXJhbXNbMF07XG4gICAgICBpZiAocGFyYW0gPCAxKSBwYXJhbSA9IDE7XG4gICAgICB0aGlzLnkgKz0gcGFyYW07XG4gICAgICBpZiAodGhpcy55ID49IHRoaXMucm93cykge1xuICAgICAgICAgIHRoaXMueSA9IHRoaXMucm93cyAtIDE7XG4gICAgICB9XG4gICAgICB0aGlzLnggPSAwO1xuICB9O1xuXG4gIC8vIENTSSBQcyBGXG4gIC8vIEN1cnNvciBQcmVjZWRpbmcgTGluZSBQcyBUaW1lcyAoZGVmYXVsdCA9IDEpIChDTkwpLlxuICAvLyByZXVzZSBDU0kgUHMgQSA/XG4gIFRlcm1pbmFsLnByb3RvdHlwZS5jdXJzb3JQcmVjZWRpbmdMaW5lID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICB2YXIgcGFyYW0gPSBwYXJhbXNbMF07XG4gICAgICBpZiAocGFyYW0gPCAxKSBwYXJhbSA9IDE7XG4gICAgICB0aGlzLnkgLT0gcGFyYW07XG4gICAgICBpZiAodGhpcy55IDwgMCkgdGhpcy55ID0gMDtcbiAgICAgIHRoaXMueCA9IDA7XG4gIH07XG5cbiAgLy8gQ1NJIFBzIEdcbiAgLy8gQ3Vyc29yIENoYXJhY3RlciBBYnNvbHV0ZSBbY29sdW1uXSAoZGVmYXVsdCA9IFtyb3csMV0pIChDSEEpLlxuICBUZXJtaW5hbC5wcm90b3R5cGUuY3Vyc29yQ2hhckFic29sdXRlID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICB2YXIgcGFyYW0gPSBwYXJhbXNbMF07XG4gICAgICBpZiAocGFyYW0gPCAxKSBwYXJhbSA9IDE7XG4gICAgICB0aGlzLnggPSBwYXJhbSAtIDE7XG4gIH07XG5cbiAgLy8gQ1NJIFBzIElcbiAgLy8gQ3Vyc29yIEZvcndhcmQgVGFidWxhdGlvbiBQcyB0YWIgc3RvcHMgKGRlZmF1bHQgPSAxKSAoQ0hUKS5cbiAgVGVybWluYWwucHJvdG90eXBlLmN1cnNvckZvcndhcmRUYWIgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgIHZhciBwYXJhbSA9IHBhcmFtc1swXSB8fCAxO1xuICAgICAgd2hpbGUgKHBhcmFtLS0pIHtcbiAgICAgICAgICB0aGlzLnggPSB0aGlzLm5leHRTdG9wKCk7XG4gICAgICB9XG4gIH07XG5cbiAgLy8gQ1NJIFBzIFogQ3Vyc29yIEJhY2t3YXJkIFRhYnVsYXRpb24gUHMgdGFiIHN0b3BzIChkZWZhdWx0ID0gMSkgKENCVCkuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5jdXJzb3JCYWNrd2FyZFRhYiA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgdmFyIHBhcmFtID0gcGFyYW1zWzBdIHx8IDE7XG4gICAgICB3aGlsZSAocGFyYW0tLSkge1xuICAgICAgICAgIHRoaXMueCA9IHRoaXMucHJldlN0b3AoKTtcbiAgICAgIH1cbiAgfTtcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVGVybWluYWwpIHtcbiAgLy8gQ1NJIFBtIGAgQ2hhcmFjdGVyIFBvc2l0aW9uIEFic29sdXRlXG4gIC8vIFtjb2x1bW5dIChkZWZhdWx0ID0gW3JvdywxXSkgKEhQQSkuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5jaGFyUG9zQWJzb2x1dGUgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICB2YXIgcGFyYW0gPSBwYXJhbXNbMF07XG4gICAgaWYgKHBhcmFtIDwgMSkgcGFyYW0gPSAxO1xuICAgIHRoaXMueCA9IHBhcmFtIC0gMTtcbiAgICBpZiAodGhpcy54ID49IHRoaXMuY29scykge1xuICAgICAgdGhpcy54ID0gdGhpcy5jb2xzIC0gMTtcbiAgICB9XG4gIH07XG5cbiAgLy8gMTQxIDYxIGEgKiBIUFIgLVxuICAvLyBIb3Jpem9udGFsIFBvc2l0aW9uIFJlbGF0aXZlXG4gIC8vIHJldXNlIENTSSBQcyBDID9cbiAgVGVybWluYWwucHJvdG90eXBlLkhQb3NpdGlvblJlbGF0aXZlID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgdmFyIHBhcmFtID0gcGFyYW1zWzBdO1xuICAgIGlmIChwYXJhbSA8IDEpIHBhcmFtID0gMTtcbiAgICB0aGlzLnggKz0gcGFyYW07XG4gICAgaWYgKHRoaXMueCA+PSB0aGlzLmNvbHMpIHtcbiAgICAgIHRoaXMueCA9IHRoaXMuY29scyAtIDE7XG4gICAgfVxuICB9O1xuICBcbiAgLy8gQ1NJIFBtIGRcbiAgLy8gTGluZSBQb3NpdGlvbiBBYnNvbHV0ZSBbcm93XSAoZGVmYXVsdCA9IFsxLGNvbHVtbl0pIChWUEEpLlxuICBUZXJtaW5hbC5wcm90b3R5cGUubGluZVBvc0Fic29sdXRlID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICB2YXIgcGFyYW0gPSBwYXJhbXNbMF07XG4gICAgICBpZiAocGFyYW0gPCAxKSBwYXJhbSA9IDE7XG4gICAgICB0aGlzLnkgPSBwYXJhbSAtIDE7XG4gICAgICBpZiAodGhpcy55ID49IHRoaXMucm93cykge1xuICAgICAgICAgIHRoaXMueSA9IHRoaXMucm93cyAtIDE7XG4gICAgICB9XG4gIH07XG5cbiAgLy8gMTQ1IDY1IGUgKiBWUFIgLSBWZXJ0aWNhbCBQb3NpdGlvbiBSZWxhdGl2ZVxuICAvLyByZXVzZSBDU0kgUHMgQiA/XG4gIFRlcm1pbmFsLnByb3RvdHlwZS5WUG9zaXRpb25SZWxhdGl2ZSA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgdmFyIHBhcmFtID0gcGFyYW1zWzBdO1xuICAgICAgaWYgKHBhcmFtIDwgMSkgcGFyYW0gPSAxO1xuICAgICAgdGhpcy55ICs9IHBhcmFtO1xuICAgICAgaWYgKHRoaXMueSA+PSB0aGlzLnJvd3MpIHtcbiAgICAgICAgICB0aGlzLnkgPSB0aGlzLnJvd3MgLSAxO1xuICAgICAgfVxuICB9O1xuXG4gIC8vIENTSSBQcyA7IFBzIGZcbiAgLy8gSG9yaXpvbnRhbCBhbmQgVmVydGljYWwgUG9zaXRpb24gW3Jvdztjb2x1bW5dIChkZWZhdWx0ID1cbiAgLy8gWzEsMV0pIChIVlApLlxuICBUZXJtaW5hbC5wcm90b3R5cGUuSFZQb3NpdGlvbiA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgaWYgKHBhcmFtc1swXSA8IDEpIHBhcmFtc1swXSA9IDE7XG4gICAgICBpZiAocGFyYW1zWzFdIDwgMSkgcGFyYW1zWzFdID0gMTtcblxuICAgICAgdGhpcy55ID0gcGFyYW1zWzBdIC0gMTtcbiAgICAgIGlmICh0aGlzLnkgPj0gdGhpcy5yb3dzKSB7XG4gICAgICAgICAgdGhpcy55ID0gdGhpcy5yb3dzIC0gMTtcbiAgICAgIH1cblxuICAgICAgdGhpcy54ID0gcGFyYW1zWzFdIC0gMTtcbiAgICAgIGlmICh0aGlzLnggPj0gdGhpcy5jb2xzKSB7XG4gICAgICAgICAgdGhpcy54ID0gdGhpcy5jb2xzIC0gMTtcbiAgICAgIH1cbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFRlcm1pbmFsKSB7XG5cbiAgLy8gQ1NJIFBtIG0gQ2hhcmFjdGVyIEF0dHJpYnV0ZXMgKFNHUikuXG4gIC8vIFBzID0gMCAtPiBOb3JtYWwgKGRlZmF1bHQpLlxuICAvLyBQcyA9IDEgLT4gQm9sZC5cbiAgLy8gUHMgPSA0IC0+IFVuZGVybGluZWQuXG4gIC8vIFBzID0gNSAtPiBCbGluayAoYXBwZWFycyBhcyBCb2xkKS5cbiAgLy8gUHMgPSA3IC0+IEludmVyc2UuXG4gIC8vIFBzID0gOCAtPiBJbnZpc2libGUsIGkuZS4sIGhpZGRlbiAoVlQzMDApLlxuICAvLyBQcyA9IDIgMiAtPiBOb3JtYWwgKG5laXRoZXIgYm9sZCBub3IgZmFpbnQpLlxuICAvLyBQcyA9IDIgNCAtPiBOb3QgdW5kZXJsaW5lZC5cbiAgLy8gUHMgPSAyIDUgLT4gU3RlYWR5IChub3QgYmxpbmtpbmcpLlxuICAvLyBQcyA9IDIgNyAtPiBQb3NpdGl2ZSAobm90IGludmVyc2UpLlxuICAvLyBQcyA9IDIgOCAtPiBWaXNpYmxlLCBpLmUuLCBub3QgaGlkZGVuIChWVDMwMCkuXG4gIC8vIFBzID0gMyAwIC0+IFNldCBmb3JlZ3JvdW5kIGNvbG9yIHRvIEJsYWNrLlxuICAvLyBQcyA9IDMgMSAtPiBTZXQgZm9yZWdyb3VuZCBjb2xvciB0byBSZWQuXG4gIC8vIFBzID0gMyAyIC0+IFNldCBmb3JlZ3JvdW5kIGNvbG9yIHRvIEdyZWVuLlxuICAvLyBQcyA9IDMgMyAtPiBTZXQgZm9yZWdyb3VuZCBjb2xvciB0byBZZWxsb3cuXG4gIC8vIFBzID0gMyA0IC0+IFNldCBmb3JlZ3JvdW5kIGNvbG9yIHRvIEJsdWUuXG4gIC8vIFBzID0gMyA1IC0+IFNldCBmb3JlZ3JvdW5kIGNvbG9yIHRvIE1hZ2VudGEuXG4gIC8vIFBzID0gMyA2IC0+IFNldCBmb3JlZ3JvdW5kIGNvbG9yIHRvIEN5YW4uXG4gIC8vIFBzID0gMyA3IC0+IFNldCBmb3JlZ3JvdW5kIGNvbG9yIHRvIFdoaXRlLlxuICAvLyBQcyA9IDMgOSAtPiBTZXQgZm9yZWdyb3VuZCBjb2xvciB0byBkZWZhdWx0IChvcmlnaW5hbCkuXG4gIC8vIFBzID0gNCAwIC0+IFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIEJsYWNrLlxuICAvLyBQcyA9IDQgMSAtPiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBSZWQuXG4gIC8vIFBzID0gNCAyIC0+IFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIEdyZWVuLlxuICAvLyBQcyA9IDQgMyAtPiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBZZWxsb3cuXG4gIC8vIFBzID0gNCA0IC0+IFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIEJsdWUuXG4gIC8vIFBzID0gNCA1IC0+IFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIE1hZ2VudGEuXG4gIC8vIFBzID0gNCA2IC0+IFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIEN5YW4uXG4gIC8vIFBzID0gNCA3IC0+IFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIFdoaXRlLlxuICAvLyBQcyA9IDQgOSAtPiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBkZWZhdWx0IChvcmlnaW5hbCkuXG5cbiAgLy8gSWYgMTYtY29sb3Igc3VwcG9ydCBpcyBjb21waWxlZCwgdGhlIGZvbGxvd2luZyBhcHBseS4gQXNzdW1lXG4gIC8vIHRoYXQgeHRlcm0ncyByZXNvdXJjZXMgYXJlIHNldCBzbyB0aGF0IHRoZSBJU08gY29sb3IgY29kZXMgYXJlXG4gIC8vIHRoZSBmaXJzdCA4IG9mIGEgc2V0IG9mIDE2LiBUaGVuIHRoZSBhaXh0ZXJtIGNvbG9ycyBhcmUgdGhlXG4gIC8vIGJyaWdodCB2ZXJzaW9ucyBvZiB0aGUgSVNPIGNvbG9yczpcbiAgLy8gUHMgPSA5IDAgLT4gU2V0IGZvcmVncm91bmQgY29sb3IgdG8gQmxhY2suXG4gIC8vIFBzID0gOSAxIC0+IFNldCBmb3JlZ3JvdW5kIGNvbG9yIHRvIFJlZC5cbiAgLy8gUHMgPSA5IDIgLT4gU2V0IGZvcmVncm91bmQgY29sb3IgdG8gR3JlZW4uXG4gIC8vIFBzID0gOSAzIC0+IFNldCBmb3JlZ3JvdW5kIGNvbG9yIHRvIFllbGxvdy5cbiAgLy8gUHMgPSA5IDQgLT4gU2V0IGZvcmVncm91bmQgY29sb3IgdG8gQmx1ZS5cbiAgLy8gUHMgPSA5IDUgLT4gU2V0IGZvcmVncm91bmQgY29sb3IgdG8gTWFnZW50YS5cbiAgLy8gUHMgPSA5IDYgLT4gU2V0IGZvcmVncm91bmQgY29sb3IgdG8gQ3lhbi5cbiAgLy8gUHMgPSA5IDcgLT4gU2V0IGZvcmVncm91bmQgY29sb3IgdG8gV2hpdGUuXG4gIC8vIFBzID0gMSAwIDAgLT4gU2V0IGJhY2tncm91bmQgY29sb3IgdG8gQmxhY2suXG4gIC8vIFBzID0gMSAwIDEgLT4gU2V0IGJhY2tncm91bmQgY29sb3IgdG8gUmVkLlxuICAvLyBQcyA9IDEgMCAyIC0+IFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIEdyZWVuLlxuICAvLyBQcyA9IDEgMCAzIC0+IFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIFllbGxvdy5cbiAgLy8gUHMgPSAxIDAgNCAtPiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBCbHVlLlxuICAvLyBQcyA9IDEgMCA1IC0+IFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIE1hZ2VudGEuXG4gIC8vIFBzID0gMSAwIDYgLT4gU2V0IGJhY2tncm91bmQgY29sb3IgdG8gQ3lhbi5cbiAgLy8gUHMgPSAxIDAgNyAtPiBTZXQgYmFja2dyb3VuZCBjb2xvciB0byBXaGl0ZS5cblxuICAvLyBJZiB4dGVybSBpcyBjb21waWxlZCB3aXRoIHRoZSAxNi1jb2xvciBzdXBwb3J0IGRpc2FibGVkLCBpdFxuICAvLyBzdXBwb3J0cyB0aGUgZm9sbG93aW5nLCBmcm9tIHJ4dnQ6XG4gIC8vIFBzID0gMSAwIDAgLT4gU2V0IGZvcmVncm91bmQgYW5kIGJhY2tncm91bmQgY29sb3IgdG9cbiAgLy8gZGVmYXVsdC5cblxuICAvLyBJZiA4OC0gb3IgMjU2LWNvbG9yIHN1cHBvcnQgaXMgY29tcGlsZWQsIHRoZSBmb2xsb3dpbmcgYXBwbHkuXG4gIC8vIFBzID0gMyA4IDsgNSA7IFBzIC0+IFNldCBmb3JlZ3JvdW5kIGNvbG9yIHRvIHRoZSBzZWNvbmRcbiAgLy8gUHMuXG4gIC8vIFBzID0gNCA4IDsgNSA7IFBzIC0+IFNldCBiYWNrZ3JvdW5kIGNvbG9yIHRvIHRoZSBzZWNvbmRcbiAgLy8gUHMuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5jaGFyQXR0cmlidXRlcyA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgIHZhciBsID0gcGFyYW1zLmxlbmd0aCxcbiAgICAgIGkgPSAwLFxuICAgICAgYmcsIGZnLCBwO1xuXG4gICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHAgPSBwYXJhbXNbaV07XG4gICAgICBpZiAocCA+PSAzMCAmJiBwIDw9IDM3KSB7XG4gICAgICAgIC8vIGZnIGNvbG9yIDhcbiAgICAgICAgdGhpcy5jdXJBdHRyID0gKHRoaXMuY3VyQXR0ciAmIH4gKDB4MWZmIDw8IDkpKSB8ICgocCAtIDMwKSA8PCA5KTtcbiAgICAgIH0gZWxzZSBpZiAocCA+PSA0MCAmJiBwIDw9IDQ3KSB7XG4gICAgICAgIC8vIGJnIGNvbG9yIDhcbiAgICAgICAgdGhpcy5jdXJBdHRyID0gKHRoaXMuY3VyQXR0ciAmIH4weDFmZikgfCAocCAtIDQwKTtcbiAgICAgIH0gZWxzZSBpZiAocCA+PSA5MCAmJiBwIDw9IDk3KSB7XG4gICAgICAgIC8vIGZnIGNvbG9yIDE2XG4gICAgICAgIHAgKz0gODtcbiAgICAgICAgdGhpcy5jdXJBdHRyID0gKHRoaXMuY3VyQXR0ciAmIH4gKDB4MWZmIDw8IDkpKSB8ICgocCAtIDkwKSA8PCA5KTtcbiAgICAgIH0gZWxzZSBpZiAocCA+PSAxMDAgJiYgcCA8PSAxMDcpIHtcbiAgICAgICAgLy8gYmcgY29sb3IgMTZcbiAgICAgICAgcCArPSA4O1xuICAgICAgICB0aGlzLmN1ckF0dHIgPSAodGhpcy5jdXJBdHRyICYgfjB4MWZmKSB8IChwIC0gMTAwKTtcbiAgICAgIH0gZWxzZSBpZiAocCA9PT0gMCkge1xuICAgICAgICAvLyBkZWZhdWx0XG4gICAgICAgIHRoaXMuY3VyQXR0ciA9IHRoaXMuZGVmQXR0cjtcbiAgICAgIH0gZWxzZSBpZiAocCA9PT0gMSkge1xuICAgICAgICAvLyBib2xkIHRleHRcbiAgICAgICAgdGhpcy5jdXJBdHRyID0gdGhpcy5jdXJBdHRyIHwgKDEgPDwgMTgpO1xuICAgICAgfSBlbHNlIGlmIChwID09PSA0KSB7XG4gICAgICAgIC8vIHVuZGVybGluZWQgdGV4dFxuICAgICAgICB0aGlzLmN1ckF0dHIgPSB0aGlzLmN1ckF0dHIgfCAoMiA8PCAxOCk7XG4gICAgICB9IGVsc2UgaWYgKHAgPT09IDcgfHwgcCA9PT0gMjcpIHtcbiAgICAgICAgLy8gaW52ZXJzZSBhbmQgcG9zaXRpdmVcbiAgICAgICAgLy8gdGVzdCB3aXRoOiBlY2hvIC1lICdcXGVbMzFtXFxlWzQybWhlbGxvXFxlWzdtd29ybGRcXGVbMjdtaGlcXGVbbSdcbiAgICAgICAgaWYgKHAgPT09IDcpIHtcbiAgICAgICAgICBpZiAoKHRoaXMuY3VyQXR0ciA+PiAxOCkgJiA0KSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLmN1ckF0dHIgPSB0aGlzLmN1ckF0dHIgfCAoNCA8PCAxOCk7XG4gICAgICAgIH0gZWxzZSBpZiAocCA9PT0gMjcpIHtcbiAgICAgICAgICBpZiAofiAodGhpcy5jdXJBdHRyID4+IDE4KSAmIDQpIGNvbnRpbnVlO1xuICAgICAgICAgIHRoaXMuY3VyQXR0ciA9IHRoaXMuY3VyQXR0ciAmIH4gKDQgPDwgMTgpO1xuICAgICAgICB9XG5cbiAgICAgICAgYmcgPSB0aGlzLmN1ckF0dHIgJiAweDFmZjtcbiAgICAgICAgZmcgPSAodGhpcy5jdXJBdHRyID4+IDkpICYgMHgxZmY7XG5cbiAgICAgICAgdGhpcy5jdXJBdHRyID0gKHRoaXMuY3VyQXR0ciAmIH4weDNmZmZmKSB8ICgoYmcgPDwgOSkgfCBmZyk7XG4gICAgICB9IGVsc2UgaWYgKHAgPT09IDIyKSB7XG4gICAgICAgIC8vIG5vdCBib2xkXG4gICAgICAgIHRoaXMuY3VyQXR0ciA9IHRoaXMuY3VyQXR0ciAmIH4gKDEgPDwgMTgpO1xuICAgICAgfSBlbHNlIGlmIChwID09PSAyNCkge1xuICAgICAgICAvLyBub3QgdW5kZXJsaW5lZFxuICAgICAgICB0aGlzLmN1ckF0dHIgPSB0aGlzLmN1ckF0dHIgJiB+ICgyIDw8IDE4KTtcbiAgICAgIH0gZWxzZSBpZiAocCA9PT0gMzkpIHtcbiAgICAgICAgLy8gcmVzZXQgZmdcbiAgICAgICAgdGhpcy5jdXJBdHRyID0gdGhpcy5jdXJBdHRyICYgfiAoMHgxZmYgPDwgOSk7XG4gICAgICAgIHRoaXMuY3VyQXR0ciA9IHRoaXMuY3VyQXR0ciB8ICgoKHRoaXMuZGVmQXR0ciA+PiA5KSAmIDB4MWZmKSA8PCA5KTtcbiAgICAgIH0gZWxzZSBpZiAocCA9PT0gNDkpIHtcbiAgICAgICAgLy8gcmVzZXQgYmdcbiAgICAgICAgdGhpcy5jdXJBdHRyID0gdGhpcy5jdXJBdHRyICYgfjB4MWZmO1xuICAgICAgICB0aGlzLmN1ckF0dHIgPSB0aGlzLmN1ckF0dHIgfCAodGhpcy5kZWZBdHRyICYgMHgxZmYpO1xuICAgICAgfSBlbHNlIGlmIChwID09PSAzOCkge1xuICAgICAgICAvLyBmZyBjb2xvciAyNTZcbiAgICAgICAgaWYgKHBhcmFtc1tpICsgMV0gIT09IDUpIGNvbnRpbnVlO1xuICAgICAgICBpICs9IDI7XG4gICAgICAgIHAgPSBwYXJhbXNbaV0gJiAweGZmO1xuICAgICAgICAvLyBjb252ZXJ0IDg4IGNvbG9ycyB0byAyNTZcbiAgICAgICAgLy8gaWYgKHRoaXMuaXMoJ3J4dnQtdW5pY29kZScpICYmIHAgPCA4OCkgcCA9IHAgKiAyLjkwOTAgfCAwO1xuICAgICAgICB0aGlzLmN1ckF0dHIgPSAodGhpcy5jdXJBdHRyICYgfiAoMHgxZmYgPDwgOSkpIHwgKHAgPDwgOSk7XG4gICAgICB9IGVsc2UgaWYgKHAgPT09IDQ4KSB7XG4gICAgICAgIC8vIGJnIGNvbG9yIDI1NlxuICAgICAgICBpZiAocGFyYW1zW2kgKyAxXSAhPT0gNSkgY29udGludWU7XG4gICAgICAgIGkgKz0gMjtcbiAgICAgICAgcCA9IHBhcmFtc1tpXSAmIDB4ZmY7XG4gICAgICAgIC8vIGNvbnZlcnQgODggY29sb3JzIHRvIDI1NlxuICAgICAgICAvLyBpZiAodGhpcy5pcygncnh2dC11bmljb2RlJykgJiYgcCA8IDg4KSBwID0gcCAqIDIuOTA5MCB8IDA7XG4gICAgICAgIHRoaXMuY3VyQXR0ciA9ICh0aGlzLmN1ckF0dHIgJiB+MHgxZmYpIHwgcDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChUZXJtaW5hbCkge1xuICAvLyBDU0kgISBwIFNvZnQgdGVybWluYWwgcmVzZXQgKERFQ1NUUikuXG4gIC8vIGh0dHA6Ly92dDEwMC5uZXQvZG9jcy92dDIyMC1ybS90YWJsZTQtMTAuaHRtbFxuICBUZXJtaW5hbC5wcm90b3R5cGUuc29mdFJlc2V0ID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgdGhpcy5jdXJzb3JIaWRkZW4gPSBmYWxzZTtcbiAgICB0aGlzLmluc2VydE1vZGUgPSBmYWxzZTtcbiAgICB0aGlzLm9yaWdpbk1vZGUgPSBmYWxzZTtcbiAgICB0aGlzLndyYXBhcm91bmRNb2RlID0gZmFsc2U7IC8vIGF1dG93cmFwXG4gICAgdGhpcy5hcHBsaWNhdGlvbktleXBhZCA9IGZhbHNlOyAvLyA/XG4gICAgdGhpcy5zY3JvbGxUb3AgPSAwO1xuICAgIHRoaXMuc2Nyb2xsQm90dG9tID0gdGhpcy5yb3dzIC0gMTtcbiAgICB0aGlzLmN1ckF0dHIgPSB0aGlzLmRlZkF0dHI7XG4gICAgdGhpcy54ID0gdGhpcy55ID0gMDsgLy8gP1xuICAgIHRoaXMuY2hhcnNldCA9IG51bGw7XG4gICAgdGhpcy5nbGV2ZWwgPSAwOyAvLyA/P1xuICAgIHRoaXMuY2hhcnNldHMgPSBbbnVsbF07IC8vID8/XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChUZXJtaW5hbCkge1xuICAvLyBDU0kgUHMgZyBUYWIgQ2xlYXIgKFRCQykuXG4gIC8vIFBzID0gMCAtPiBDbGVhciBDdXJyZW50IENvbHVtbiAoZGVmYXVsdCkuXG4gIC8vIFBzID0gMyAtPiBDbGVhciBBbGwuXG4gIC8vIFBvdGVudGlhbGx5OlxuICAvLyBQcyA9IDIgLT4gQ2xlYXIgU3RvcHMgb24gTGluZS5cbiAgLy8gaHR0cDovL3Z0MTAwLm5ldC9hbm5hcmJvci9hYWEtdWcvc2VjdGlvbjYuaHRtbFxuICBUZXJtaW5hbC5wcm90b3R5cGUudGFiQ2xlYXIgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICB2YXIgcGFyYW0gPSBwYXJhbXNbMF07XG4gICAgaWYgKHBhcmFtIDw9IDApIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnRhYnNbdGhpcy54XTtcbiAgICB9IGVsc2UgaWYgKHBhcmFtID09PSAzKSB7XG4gICAgICB0aGlzLnRhYnMgPSB7fTtcbiAgICB9XG4gIH07XG59O1xuIiwidmFyIGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50cycpO1xudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbmZ1bmN0aW9uIFN0cmVhbSgpIHtcbiAgZXZlbnRzLkV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xufVxudXRpbC5pbmhlcml0cyhTdHJlYW0sIGV2ZW50cy5FdmVudEVtaXR0ZXIpO1xubW9kdWxlLmV4cG9ydHMgPSBTdHJlYW07XG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjQueFxuU3RyZWFtLlN0cmVhbSA9IFN0cmVhbTtcblxuU3RyZWFtLnByb3RvdHlwZS5waXBlID0gZnVuY3Rpb24oZGVzdCwgb3B0aW9ucykge1xuICB2YXIgc291cmNlID0gdGhpcztcblxuICBmdW5jdGlvbiBvbmRhdGEoY2h1bmspIHtcbiAgICBpZiAoZGVzdC53cml0YWJsZSkge1xuICAgICAgaWYgKGZhbHNlID09PSBkZXN0LndyaXRlKGNodW5rKSAmJiBzb3VyY2UucGF1c2UpIHtcbiAgICAgICAgc291cmNlLnBhdXNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc291cmNlLm9uKCdkYXRhJywgb25kYXRhKTtcblxuICBmdW5jdGlvbiBvbmRyYWluKCkge1xuICAgIGlmIChzb3VyY2UucmVhZGFibGUgJiYgc291cmNlLnJlc3VtZSkge1xuICAgICAgc291cmNlLnJlc3VtZSgpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Qub24oJ2RyYWluJywgb25kcmFpbik7XG5cbiAgLy8gSWYgdGhlICdlbmQnIG9wdGlvbiBpcyBub3Qgc3VwcGxpZWQsIGRlc3QuZW5kKCkgd2lsbCBiZSBjYWxsZWQgd2hlblxuICAvLyBzb3VyY2UgZ2V0cyB0aGUgJ2VuZCcgb3IgJ2Nsb3NlJyBldmVudHMuICBPbmx5IGRlc3QuZW5kKCkgb25jZSwgYW5kXG4gIC8vIG9ubHkgd2hlbiBhbGwgc291cmNlcyBoYXZlIGVuZGVkLlxuICBpZiAoIWRlc3QuX2lzU3RkaW8gJiYgKCFvcHRpb25zIHx8IG9wdGlvbnMuZW5kICE9PSBmYWxzZSkpIHtcbiAgICBkZXN0Ll9waXBlQ291bnQgPSBkZXN0Ll9waXBlQ291bnQgfHwgMDtcbiAgICBkZXN0Ll9waXBlQ291bnQrKztcblxuICAgIHNvdXJjZS5vbignZW5kJywgb25lbmQpO1xuICAgIHNvdXJjZS5vbignY2xvc2UnLCBvbmNsb3NlKTtcbiAgfVxuXG4gIHZhciBkaWRPbkVuZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBvbmVuZCgpIHtcbiAgICBpZiAoZGlkT25FbmQpIHJldHVybjtcbiAgICBkaWRPbkVuZCA9IHRydWU7XG5cbiAgICBkZXN0Ll9waXBlQ291bnQtLTtcblxuICAgIC8vIHJlbW92ZSB0aGUgbGlzdGVuZXJzXG4gICAgY2xlYW51cCgpO1xuXG4gICAgaWYgKGRlc3QuX3BpcGVDb3VudCA+IDApIHtcbiAgICAgIC8vIHdhaXRpbmcgZm9yIG90aGVyIGluY29taW5nIHN0cmVhbXMgdG8gZW5kLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRlc3QuZW5kKCk7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIG9uY2xvc2UoKSB7XG4gICAgaWYgKGRpZE9uRW5kKSByZXR1cm47XG4gICAgZGlkT25FbmQgPSB0cnVlO1xuXG4gICAgZGVzdC5fcGlwZUNvdW50LS07XG5cbiAgICAvLyByZW1vdmUgdGhlIGxpc3RlbmVyc1xuICAgIGNsZWFudXAoKTtcblxuICAgIGlmIChkZXN0Ll9waXBlQ291bnQgPiAwKSB7XG4gICAgICAvLyB3YWl0aW5nIGZvciBvdGhlciBpbmNvbWluZyBzdHJlYW1zIHRvIGVuZC5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkZXN0LmRlc3Ryb3koKTtcbiAgfVxuXG4gIC8vIGRvbid0IGxlYXZlIGRhbmdsaW5nIHBpcGVzIHdoZW4gdGhlcmUgYXJlIGVycm9ycy5cbiAgZnVuY3Rpb24gb25lcnJvcihlcikge1xuICAgIGNsZWFudXAoKTtcbiAgICBpZiAodGhpcy5saXN0ZW5lcnMoJ2Vycm9yJykubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkIHN0cmVhbSBlcnJvciBpbiBwaXBlLlxuICAgIH1cbiAgfVxuXG4gIHNvdXJjZS5vbignZXJyb3InLCBvbmVycm9yKTtcbiAgZGVzdC5vbignZXJyb3InLCBvbmVycm9yKTtcblxuICAvLyByZW1vdmUgYWxsIHRoZSBldmVudCBsaXN0ZW5lcnMgdGhhdCB3ZXJlIGFkZGVkLlxuICBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignZGF0YScsIG9uZGF0YSk7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignZHJhaW4nLCBvbmRyYWluKTtcblxuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignZW5kJywgb25lbmQpO1xuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBvbmNsb3NlKTtcblxuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbmVycm9yKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIG9uZXJyb3IpO1xuXG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdlbmQnLCBjbGVhbnVwKTtcbiAgICBzb3VyY2UucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xlYW51cCk7XG5cbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdlbmQnLCBjbGVhbnVwKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIGNsZWFudXApO1xuICB9XG5cbiAgc291cmNlLm9uKCdlbmQnLCBjbGVhbnVwKTtcbiAgc291cmNlLm9uKCdjbG9zZScsIGNsZWFudXApO1xuXG4gIGRlc3Qub24oJ2VuZCcsIGNsZWFudXApO1xuICBkZXN0Lm9uKCdjbG9zZScsIGNsZWFudXApO1xuXG4gIGRlc3QuZW1pdCgncGlwZScsIHNvdXJjZSk7XG5cbiAgLy8gQWxsb3cgZm9yIHVuaXgtbGlrZSB1c2FnZTogQS5waXBlKEIpLnBpcGUoQylcbiAgcmV0dXJuIGRlc3Q7XG59O1xuIiwiKGZ1bmN0aW9uKHByb2Nlc3Mpe2lmICghcHJvY2Vzcy5FdmVudEVtaXR0ZXIpIHByb2Nlc3MuRXZlbnRFbWl0dGVyID0gZnVuY3Rpb24gKCkge307XG5cbnZhciBFdmVudEVtaXR0ZXIgPSBleHBvcnRzLkV2ZW50RW1pdHRlciA9IHByb2Nlc3MuRXZlbnRFbWl0dGVyO1xudmFyIGlzQXJyYXkgPSB0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gQXJyYXkuaXNBcnJheVxuICAgIDogZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgfVxuO1xuZnVuY3Rpb24gaW5kZXhPZiAoeHMsIHgpIHtcbiAgICBpZiAoeHMuaW5kZXhPZikgcmV0dXJuIHhzLmluZGV4T2YoeCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoeCA9PT0geHNbaV0pIHJldHVybiBpO1xuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW5cbi8vIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaFxuLy8gaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG4vL1xuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuICB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID0gbjtcbn07XG5cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNBcnJheSh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSlcbiAgICB7XG4gICAgICBpZiAoYXJndW1lbnRzWzFdIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgYXJndW1lbnRzWzFdOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5jYXVnaHQsIHVuc3BlY2lmaWVkICdlcnJvcicgZXZlbnQuXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gZmFsc2U7XG4gIHZhciBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBpZiAoIWhhbmRsZXIpIHJldHVybiBmYWxzZTtcblxuICBpZiAodHlwZW9mIGhhbmRsZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAoaXNBcnJheShoYW5kbGVyKSkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIHZhciBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG4vLyBFdmVudEVtaXR0ZXIgaXMgZGVmaW5lZCBpbiBzcmMvbm9kZV9ldmVudHMuY2Ncbi8vIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCgpIGlzIGFsc28gZGVmaW5lZCB0aGVyZS5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIGxpc3RlbmVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhZGRMaXN0ZW5lciBvbmx5IHRha2VzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xuICB9XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT0gXCJuZXdMaXN0ZW5lcnNcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJzXCIuXG4gIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHtcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgfSBlbHNlIGlmIChpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgICB2YXIgbTtcbiAgICAgIGlmICh0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbSA9IHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtID0gZGVmYXVsdE1heExpc3RlbmVycztcbiAgICAgIH1cblxuICAgICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYub24odHlwZSwgZnVuY3Rpb24gZygpIHtcbiAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgbGlzdGVuZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlbW92ZUxpc3RlbmVyIG9ubHkgdGFrZXMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XG4gIH1cblxuICAvLyBkb2VzIG5vdCB1c2UgbGlzdGVuZXJzKCksIHNvIG5vIHNpZGUgZWZmZWN0IG9mIGNyZWF0aW5nIF9ldmVudHNbdHlwZV1cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzQXJyYXkobGlzdCkpIHtcbiAgICB2YXIgaSA9IGluZGV4T2YobGlzdCwgbGlzdGVuZXIpO1xuICAgIGlmIChpIDwgMCkgcmV0dXJuIHRoaXM7XG4gICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgaWYgKGxpc3QubGVuZ3RoID09IDApXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICB9IGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSA9PT0gbGlzdGVuZXIpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGRvZXMgbm90IHVzZSBsaXN0ZW5lcnMoKSwgc28gbm8gc2lkZSBlZmZlY3Qgb2YgY3JlYXRpbmcgX2V2ZW50c1t0eXBlXVxuICBpZiAodHlwZSAmJiB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW3R5cGVdKSB0aGlzLl9ldmVudHNbdHlwZV0gPSBudWxsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSB0aGlzLl9ldmVudHNbdHlwZV0gPSBbXTtcbiAgaWYgKCFpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgfVxuICByZXR1cm4gdGhpcy5fZXZlbnRzW3R5cGVdO1xufTtcblxufSkocmVxdWlyZShcIl9fYnJvd3NlcmlmeV9wcm9jZXNzXCIpKSIsInZhciBldmVudHMgPSByZXF1aXJlKCdldmVudHMnKTtcblxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcbmV4cG9ydHMuaXNEYXRlID0gZnVuY3Rpb24ob2JqKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IERhdGVdJ307XG5leHBvcnRzLmlzUmVnRXhwID0gZnVuY3Rpb24ob2JqKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IFJlZ0V4cF0nfTtcblxuXG5leHBvcnRzLnByaW50ID0gZnVuY3Rpb24gKCkge307XG5leHBvcnRzLnB1dHMgPSBmdW5jdGlvbiAoKSB7fTtcbmV4cG9ydHMuZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuXG5leHBvcnRzLmluc3BlY3QgPSBmdW5jdGlvbihvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMpIHtcbiAgdmFyIHNlZW4gPSBbXTtcblxuICB2YXIgc3R5bGl6ZSA9IGZ1bmN0aW9uKHN0ciwgc3R5bGVUeXBlKSB7XG4gICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG4gICAgdmFyIHN0eWxlcyA9XG4gICAgICAgIHsgJ2JvbGQnIDogWzEsIDIyXSxcbiAgICAgICAgICAnaXRhbGljJyA6IFszLCAyM10sXG4gICAgICAgICAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAgICAgICAgICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICAgICAgICAgJ3doaXRlJyA6IFszNywgMzldLFxuICAgICAgICAgICdncmV5JyA6IFs5MCwgMzldLFxuICAgICAgICAgICdibGFjaycgOiBbMzAsIDM5XSxcbiAgICAgICAgICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgICAgICAgICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgICAgICAgICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICAgICAgICAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICAgICAgICAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgICAgICAgICAneWVsbG93JyA6IFszMywgMzldIH07XG5cbiAgICB2YXIgc3R5bGUgPVxuICAgICAgICB7ICdzcGVjaWFsJzogJ2N5YW4nLFxuICAgICAgICAgICdudW1iZXInOiAnYmx1ZScsXG4gICAgICAgICAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgICAgICAgICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAgICAgICAgICdudWxsJzogJ2JvbGQnLFxuICAgICAgICAgICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAgICAgICAgICdkYXRlJzogJ21hZ2VudGEnLFxuICAgICAgICAgIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICAgICAgICAgJ3JlZ2V4cCc6ICdyZWQnIH1bc3R5bGVUeXBlXTtcblxuICAgIGlmIChzdHlsZSkge1xuICAgICAgcmV0dXJuICdcXDAzM1snICsgc3R5bGVzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICAgJ1xcMDMzWycgKyBzdHlsZXNbc3R5bGVdWzFdICsgJ20nO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgfTtcbiAgaWYgKCEgY29sb3JzKSB7XG4gICAgc3R5bGl6ZSA9IGZ1bmN0aW9uKHN0ciwgc3R5bGVUeXBlKSB7IHJldHVybiBzdHI7IH07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXQodmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAgIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLmluc3BlY3QgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICAgIHZhbHVlICE9PSBleHBvcnRzICYmXG4gICAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMpO1xuICAgIH1cblxuICAgIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgICAgIHJldHVybiBzdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG5cbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgICAgIHJldHVybiBzdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuXG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG5cbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAgIH1cbiAgICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG4gICAgfVxuXG4gICAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICAgIHZhciB2aXNpYmxlX2tleXMgPSBPYmplY3Rfa2V5cyh2YWx1ZSk7XG4gICAgdmFyIGtleXMgPSBzaG93SGlkZGVuID8gT2JqZWN0X2dldE93blByb3BlcnR5TmFtZXModmFsdWUpIDogdmlzaWJsZV9rZXlzO1xuXG4gICAgLy8gRnVuY3Rpb25zIHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAncmVnZXhwJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGF0ZXMgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZFxuICAgIGlmIChpc0RhdGUodmFsdWUpICYmIGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gc3R5bGl6ZSh2YWx1ZS50b1VUQ1N0cmluZygpLCAnZGF0ZScpO1xuICAgIH1cblxuICAgIHZhciBiYXNlLCB0eXBlLCBicmFjZXM7XG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBvYmplY3QgdHlwZVxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgdHlwZSA9ICdBcnJheSc7XG4gICAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICAgIH0gZWxzZSB7XG4gICAgICB0eXBlID0gJ09iamVjdCc7XG4gICAgICBicmFjZXMgPSBbJ3snLCAnfSddO1xuICAgIH1cblxuICAgIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICBiYXNlID0gKGlzUmVnRXhwKHZhbHVlKSkgPyAnICcgKyB2YWx1ZSA6ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2UgPSAnJztcbiAgICB9XG5cbiAgICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgYmFzZSA9ICcgJyArIHZhbHVlLnRvVVRDU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgICB9XG5cbiAgICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAncmVnZXhwJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgICB2YXIgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgbmFtZSwgc3RyO1xuICAgICAgaWYgKHZhbHVlLl9fbG9va3VwR2V0dGVyX18pIHtcbiAgICAgICAgaWYgKHZhbHVlLl9fbG9va3VwR2V0dGVyX18oa2V5KSkge1xuICAgICAgICAgIGlmICh2YWx1ZS5fX2xvb2t1cFNldHRlcl9fKGtleSkpIHtcbiAgICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHZhbHVlLl9fbG9va3VwU2V0dGVyX18oa2V5KSkge1xuICAgICAgICAgICAgc3RyID0gc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHZpc2libGVfa2V5cy5pbmRleE9mKGtleSkgPCAwKSB7XG4gICAgICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gICAgICB9XG4gICAgICBpZiAoIXN0cikge1xuICAgICAgICBpZiAoc2Vlbi5pbmRleE9mKHZhbHVlW2tleV0pIDwgMCkge1xuICAgICAgICAgIGlmIChyZWN1cnNlVGltZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh2YWx1ZVtrZXldKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyID0gZm9ybWF0KHZhbHVlW2tleV0sIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdBcnJheScgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cbiAgICAgICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICAgICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICAgICAgbmFtZSA9IHN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgICAgIG5hbWUgPSBzdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG4gICAgfSk7XG5cbiAgICBzZWVuLnBvcCgpO1xuXG4gICAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICAgIG51bUxpbmVzRXN0Kys7XG4gICAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgICByZXR1cm4gcHJldiArIGN1ci5sZW5ndGggKyAxO1xuICAgIH0sIDApO1xuXG4gICAgaWYgKGxlbmd0aCA+IDUwKSB7XG4gICAgICBvdXRwdXQgPSBicmFjZXNbMF0gK1xuICAgICAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICAgICAnICcgK1xuICAgICAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgICAgICcgJyArXG4gICAgICAgICAgICAgICBicmFjZXNbMV07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0ID0gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cbiAgcmV0dXJuIGZvcm1hdChvYmosICh0eXBlb2YgZGVwdGggPT09ICd1bmRlZmluZWQnID8gMiA6IGRlcHRoKSk7XG59O1xuXG5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIGFyIGluc3RhbmNlb2YgQXJyYXkgfHxcbiAgICAgICAgIEFycmF5LmlzQXJyYXkoYXIpIHx8XG4gICAgICAgICAoYXIgJiYgYXIgIT09IE9iamVjdC5wcm90b3R5cGUgJiYgaXNBcnJheShhci5fX3Byb3RvX18pKTtcbn1cblxuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gcmUgaW5zdGFuY2VvZiBSZWdFeHAgfHxcbiAgICAodHlwZW9mIHJlID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocmUpID09PSAnW29iamVjdCBSZWdFeHBdJyk7XG59XG5cblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgaWYgKGQgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKHR5cGVvZiBkICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICB2YXIgcHJvcGVydGllcyA9IERhdGUucHJvdG90eXBlICYmIE9iamVjdF9nZXRPd25Qcm9wZXJ0eU5hbWVzKERhdGUucHJvdG90eXBlKTtcbiAgdmFyIHByb3RvID0gZC5fX3Byb3RvX18gJiYgT2JqZWN0X2dldE93blByb3BlcnR5TmFtZXMoZC5fX3Byb3RvX18pO1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJvdG8pID09PSBKU09OLnN0cmluZ2lmeShwcm9wZXJ0aWVzKTtcbn1cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cbmV4cG9ydHMubG9nID0gZnVuY3Rpb24gKG1zZykge307XG5cbmV4cG9ydHMucHVtcCA9IG51bGw7XG5cbnZhciBPYmplY3Rfa2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgcmVzLnB1c2goa2V5KTtcbiAgICByZXR1cm4gcmVzO1xufTtcblxudmFyIE9iamVjdF9nZXRPd25Qcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHJlcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59O1xuXG52YXIgT2JqZWN0X2NyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvdHlwZSwgcHJvcGVydGllcykge1xuICAgIC8vIGZyb20gZXM1LXNoaW1cbiAgICB2YXIgb2JqZWN0O1xuICAgIGlmIChwcm90b3R5cGUgPT09IG51bGwpIHtcbiAgICAgICAgb2JqZWN0ID0geyAnX19wcm90b19fJyA6IG51bGwgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvdG90eXBlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgICAndHlwZW9mIHByb3RvdHlwZVsnICsgKHR5cGVvZiBwcm90b3R5cGUpICsgJ10gIT0gXFwnb2JqZWN0XFwnJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgVHlwZSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICBUeXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICAgICAgb2JqZWN0ID0gbmV3IFR5cGUoKTtcbiAgICAgICAgb2JqZWN0Ll9fcHJvdG9fXyA9IHByb3RvdHlwZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QuZGVmaW5lUHJvcGVydGllcykge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhvYmplY3QsIHByb3BlcnRpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xufTtcblxuZXhwb3J0cy5pbmhlcml0cyA9IGZ1bmN0aW9uKGN0b3IsIHN1cGVyQ3Rvcikge1xuICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvcjtcbiAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3RfY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbn07XG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICh0eXBlb2YgZiAhPT0gJ3N0cmluZycpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goZXhwb3J0cy5pbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzogcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKXtcbiAgICBpZiAoeCA9PT0gbnVsbCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgZXhwb3J0cy5pbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBzdGF0ZXMgPSByZXF1aXJlKCcuLi9zdGF0ZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVGVybWluYWwpIHtcblxuICAvLyBFU0MgSCBUYWIgU2V0IChIVFMgaXMgMHg4OCkuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS50YWJTZXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRhYnNbdGhpcy54XSA9IHRydWU7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlcy5ub3JtYWw7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHN0YXRlcyA9IHJlcXVpcmUoJy4uL3N0YXRlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChUZXJtaW5hbCkge1xuICAvLyBFU0MgRCBJbmRleCAoSU5EIGlzIDB4ODQpLlxuICBUZXJtaW5hbC5wcm90b3R5cGUuaW5kZXggPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnkrKztcbiAgICBpZiAodGhpcy55ID4gdGhpcy5zY3JvbGxCb3R0b20pIHtcbiAgICAgIHRoaXMueS0tO1xuICAgICAgdGhpcy5zY3JvbGwoKTtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlcy5ub3JtYWw7XG4gIH07XG5cbiAgLy8gRVNDIE0gUmV2ZXJzZSBJbmRleCAoUkkgaXMgMHg4ZCkuXG4gIFRlcm1pbmFsLnByb3RvdHlwZS5yZXZlcnNlSW5kZXggPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgajtcbiAgICB0aGlzLnktLTtcbiAgICBpZiAodGhpcy55IDwgdGhpcy5zY3JvbGxUb3ApIHtcbiAgICAgIHRoaXMueSsrO1xuICAgICAgLy8gcG9zc2libHkgbW92ZSB0aGUgY29kZSBiZWxvdyB0byB0ZXJtLnJldmVyc2VTY3JvbGwoKTtcbiAgICAgIC8vIHRlc3Q6IGVjaG8gLW5lICdcXGVbMTsxSFxcZVs0NG1cXGVNXFxlWzBtJ1xuICAgICAgLy8gYmxhbmtMaW5lKHRydWUpIGlzIHh0ZXJtL2xpbnV4IGJlaGF2aW9yXG4gICAgICB0aGlzLmxpbmVzLnNwbGljZSh0aGlzLnkgKyB0aGlzLnliYXNlLCAwLCB0aGlzLmJsYW5rTGluZSh0cnVlKSk7XG4gICAgICBqID0gdGhpcy5yb3dzIC0gMSAtIHRoaXMuc2Nyb2xsQm90dG9tO1xuICAgICAgdGhpcy5saW5lcy5zcGxpY2UodGhpcy5yb3dzIC0gMSArIHRoaXMueWJhc2UgLSBqICsgMSwgMSk7XG4gICAgICAvLyB0aGlzLm1heFJhbmdlKCk7XG4gICAgICB0aGlzLnVwZGF0ZVJhbmdlKHRoaXMuc2Nyb2xsVG9wKTtcbiAgICAgIHRoaXMudXBkYXRlUmFuZ2UodGhpcy5zY3JvbGxCb3R0b20pO1xuICAgIH1cbiAgICB0aGlzLnN0YXRlID0gc3RhdGVzLm5vcm1hbDtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdGF0ZXMgPSByZXF1aXJlKCcuL3N0YXRlcycpO1xuXG5mdW5jdGlvbiBmaXhMaW5lZmVlZChkYXRhKSB7XG4gIHJldHVybiBkYXRhLnJlcGxhY2UoLyhbXlxccl0pXFxuL2csICckMVxcclxcbicpO1xufVxuXG5mdW5jdGlvbiBmaXhJbmRlbnQoZGF0YSkge1xuICBpZiAoIS8oXnxcXG4pIC8udGVzdChkYXRhKSkgcmV0dXJuIGRhdGE7XG5cbiAgLy8gbm90IHZlcnkgZWZmaWNpZW50LCBidXQgd29ya3MgYW5kIHdvdWxkIG9ubHkgYmVjb21lIGEgcHJvYmxlbVxuICAvLyBvbmNlIHdlIHJlbmRlciBodWdlIGFtb3VudHMgb2YgZGF0YVxuICByZXR1cm4gZGF0YVxuICAgIC5zcGxpdCgnXFxuJylcbiAgICAubWFwKGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgd2hpbGUobGluZS5jaGFyQXQoMCkgPT09ICcgJyl7XG4gICAgICAgIGxpbmUgPSBsaW5lLnNsaWNlKDEpO1xuICAgICAgICBjb3VudCsrO1xuICAgICAgfVxuICAgICAgd2hpbGUoY291bnQtLSkge1xuICAgICAgICBsaW5lID0gJyZuYnNwOycgKyBsaW5lO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxpbmU7XG4gICAgfSlcbiAgICAuam9pbignXFxyXFxuJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVGVybWluYWwpIHtcblxuICBUZXJtaW5hbC5wcm90b3R5cGUuYmVsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzbmQgPSBuZXcgQXVkaW8oXCJiZWxsLndhdlwiKTsgLy8gYnVmZmVycyBhdXRvbWF0aWNhbGx5IHdoZW4gY3JlYXRlZFxuICAgIHNuZC5wbGF5KCk7XG5cbiAgICBpZiAoIVRlcm1pbmFsLnZpc3VhbEJlbGwpIHJldHVybjtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmJvcmRlckNvbG9yID0gJ3doaXRlJztcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5lbGVtZW50LnN0eWxlLmJvcmRlckNvbG9yID0gJyc7XG4gICAgfSwgMTApO1xuICAgIGlmIChUZXJtaW5hbC5wb3BPbkJlbGwpIHRoaXMuZm9jdXMoKTtcbiAgfTtcblxuICBUZXJtaW5hbC5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBkYXRhID0gZml4TGluZWZlZWQoZGF0YSk7XG4gICAgZGF0YSA9IGZpeEluZGVudChkYXRhKTtcblxuICAgIHZhciBsID0gZGF0YS5sZW5ndGgsXG4gICAgICBpID0gMCxcbiAgICAgIGNzLCBjaDtcblxuICAgIHRoaXMucmVmcmVzaFN0YXJ0ID0gdGhpcy55O1xuICAgIHRoaXMucmVmcmVzaEVuZCA9IHRoaXMueTtcblxuICAgIGlmICh0aGlzLnliYXNlICE9PSB0aGlzLnlkaXNwKSB7XG4gICAgICB0aGlzLnlkaXNwID0gdGhpcy55YmFzZTtcbiAgICAgIHRoaXMubWF4UmFuZ2UoKTtcbiAgICB9XG5cbiAgICAvLyB0aGlzLmxvZyhKU09OLnN0cmluZ2lmeShkYXRhLnJlcGxhY2UoL1xceDFiL2csICdeWycpKSk7XG5cbiAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgY2ggPSBkYXRhW2ldO1xuICAgICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XG4gICAgICBjYXNlIHN0YXRlcy5ub3JtYWw6XG4gICAgICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgICAvLyAnXFwwJ1xuICAgICAgICAgIC8vIGNhc2UgJ1xcMCc6XG4gICAgICAgICAgLy8gYnJlYWs7XG5cbiAgICAgICAgICAvLyAnXFxhJ1xuICAgICAgICBjYXNlICdcXHgwNyc6XG4gICAgICAgICAgdGhpcy5iZWxsKCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyAnXFxuJywgJ1xcdicsICdcXGYnXG4gICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgIGNhc2UgJ1xceDBiJzpcbiAgICAgICAgY2FzZSAnXFx4MGMnOlxuICAgICAgICAgIGlmICh0aGlzLmNvbnZlcnRFb2wpIHtcbiAgICAgICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMueSsrO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gJ1xccidcbiAgICAgICAgY2FzZSAnXFxyJzpcbiAgICAgICAgICB0aGlzLnggPSAwO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gJ1xcYidcbiAgICAgICAgY2FzZSAnXFx4MDgnOlxuICAgICAgICAgIGlmICh0aGlzLnggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLngtLTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyAnXFx0J1xuICAgICAgICBjYXNlICdcXHQnOlxuICAgICAgICAgIHRoaXMueCA9IHRoaXMubmV4dFN0b3AoKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8vIHNoaWZ0IG91dFxuICAgICAgICBjYXNlICdcXHgwZSc6XG4gICAgICAgICAgdGhpcy5zZXRnTGV2ZWwoMSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBzaGlmdCBpblxuICAgICAgICBjYXNlICdcXHgwZic6XG4gICAgICAgICAgdGhpcy5zZXRnTGV2ZWwoMCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyAnXFxlJ1xuICAgICAgICBjYXNlICdcXHgxYic6XG4gICAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlcy5lc2NhcGVkO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy8gJyAnXG4gICAgICAgICAgaWYgKGNoID49ICcgJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2hhcnNldCAmJiB0aGlzLmNoYXJzZXRbY2hdKSB7XG4gICAgICAgICAgICAgIGNoID0gdGhpcy5jaGFyc2V0W2NoXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnggPj0gdGhpcy5jb2xzKSB7XG4gICAgICAgICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgICAgICAgIHRoaXMueSsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGSVhNRTogdGhpcyBwcmV2ZW50cyBlcnJvcnMgZnJvbSBiZWluZyB0aHJvd24sIGJ1dCBuZWVkcyBhIHByb3BlciBmaXhcbiAgICAgICAgICAgIGlmICh0aGlzLmxpbmVzW3RoaXMueSArIHRoaXMueWJhc2VdKVxuICAgICAgICAgICAgICB0aGlzLmxpbmVzW3RoaXMueSArIHRoaXMueWJhc2VdW3RoaXMueF0gPSBbdGhpcy5jdXJBdHRyLCBjaF07XG5cbiAgICAgICAgICAgIHRoaXMueCsrO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVSYW5nZSh0aGlzLnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugc3RhdGVzLmVzY2FwZWQ6XG4gICAgICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgICAvLyBFU0MgWyBDb250cm9sIFNlcXVlbmNlIEludHJvZHVjZXIgKCBDU0kgaXMgMHg5YikuXG4gICAgICAgIGNhc2UgJ1snOlxuICAgICAgICAgIHRoaXMucGFyYW1zID0gW107XG4gICAgICAgICAgdGhpcy5jdXJyZW50UGFyYW0gPSAwO1xuICAgICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZXMuY3NpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gRVNDIF0gT3BlcmF0aW5nIFN5c3RlbSBDb21tYW5kICggT1NDIGlzIDB4OWQpLlxuICAgICAgICBjYXNlICddJzpcbiAgICAgICAgICB0aGlzLnBhcmFtcyA9IFtdO1xuICAgICAgICAgIHRoaXMuY3VycmVudFBhcmFtID0gMDtcbiAgICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGVzLm9zYztcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8vIEVTQyBQIERldmljZSBDb250cm9sIFN0cmluZyAoIERDUyBpcyAweDkwKS5cbiAgICAgICAgY2FzZSAnUCc6XG4gICAgICAgICAgdGhpcy5wYXJhbXMgPSBbXTtcbiAgICAgICAgICB0aGlzLmN1cnJlbnRQYXJhbSA9IDA7XG4gICAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlcy5kY3M7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBFU0MgXyBBcHBsaWNhdGlvbiBQcm9ncmFtIENvbW1hbmQgKCBBUEMgaXMgMHg5ZikuXG4gICAgICAgIGNhc2UgJ18nOlxuICAgICAgICAgIHRoaXMuc3RhdGVUeXBlID0gJ2FwYyc7XG4gICAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlcy5pZ25vcmU7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBFU0MgXiBQcml2YWN5IE1lc3NhZ2UgKCBQTSBpcyAweDllKS5cbiAgICAgICAgY2FzZSAnXic6XG4gICAgICAgICAgdGhpcy5zdGF0ZVR5cGUgPSAncG0nO1xuICAgICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZXMuaWdub3JlO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gRVNDIGMgRnVsbCBSZXNldCAoUklTKS5cbiAgICAgICAgY2FzZSAnYyc6XG4gICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gRVNDIEUgTmV4dCBMaW5lICggTkVMIGlzIDB4ODUpLlxuICAgICAgICAgIC8vIEVTQyBEIEluZGV4ICggSU5EIGlzIDB4ODQpLlxuICAgICAgICBjYXNlICdFJzpcbiAgICAgICAgICB0aGlzLnggPSAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdEJzpcbiAgICAgICAgICB0aGlzLmluZGV4KCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBFU0MgTSBSZXZlcnNlIEluZGV4ICggUkkgaXMgMHg4ZCkuXG4gICAgICAgIGNhc2UgJ00nOlxuICAgICAgICAgIHRoaXMucmV2ZXJzZUluZGV4KCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBFU0MgJSBTZWxlY3QgZGVmYXVsdC91dGYtOCBjaGFyYWN0ZXIgc2V0LlxuICAgICAgICAgIC8vIEAgPSBkZWZhdWx0LCBHID0gdXRmLThcbiAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgLy90aGlzLmNoYXJzZXQgPSBudWxsO1xuICAgICAgICAgIHRoaXMuc2V0Z0xldmVsKDApO1xuICAgICAgICAgIHRoaXMuc2V0Z0NoYXJzZXQoMCwgVGVybWluYWwuY2hhcnNldHMuVVMpO1xuICAgICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZXMubm9ybWFsO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8vIEVTQyAoLCksKiwrLC0sLiBEZXNpZ25hdGUgRzAtRzIgQ2hhcmFjdGVyIFNldC5cbiAgICAgICAgY2FzZSAnKCc6XG4gICAgICAgICAgLy8gPC0tIHRoaXMgc2VlbXMgdG8gZ2V0IGFsbCB0aGUgYXR0ZW50aW9uXG4gICAgICAgIGNhc2UgJyknOlxuICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgIGNhc2UgJy0nOlxuICAgICAgICBjYXNlICcuJzpcbiAgICAgICAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgICAgY2FzZSAnKCc6XG4gICAgICAgICAgICB0aGlzLmdjaGFyc2V0ID0gMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJyknOlxuICAgICAgICAgICAgdGhpcy5nY2hhcnNldCA9IDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgIHRoaXMuZ2NoYXJzZXQgPSAyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICB0aGlzLmdjaGFyc2V0ID0gMztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgdGhpcy5nY2hhcnNldCA9IDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICcuJzpcbiAgICAgICAgICAgIHRoaXMuZ2NoYXJzZXQgPSAyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZXMuY2hhcnNldDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8vIERlc2lnbmF0ZSBHMyBDaGFyYWN0ZXIgU2V0IChWVDMwMCkuXG4gICAgICAgICAgLy8gQSA9IElTTyBMYXRpbi0xIFN1cHBsZW1lbnRhbC5cbiAgICAgICAgICAvLyBOb3QgaW1wbGVtZW50ZWQuXG4gICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgIHRoaXMuZ2NoYXJzZXQgPSAzO1xuICAgICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZXMuY2hhcnNldDtcbiAgICAgICAgICBpLS07XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBFU0MgTlxuICAgICAgICAgIC8vIFNpbmdsZSBTaGlmdCBTZWxlY3Qgb2YgRzIgQ2hhcmFjdGVyIFNldFxuICAgICAgICAgIC8vICggU1MyIGlzIDB4OGUpLiBUaGlzIGFmZmVjdHMgbmV4dCBjaGFyYWN0ZXIgb25seS5cbiAgICAgICAgY2FzZSAnTic6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgLy8gRVNDIE9cbiAgICAgICAgICAvLyBTaW5nbGUgU2hpZnQgU2VsZWN0IG9mIEczIENoYXJhY3RlciBTZXRcbiAgICAgICAgICAvLyAoIFNTMyBpcyAweDhmKS4gVGhpcyBhZmZlY3RzIG5leHQgY2hhcmFjdGVyIG9ubHkuXG4gICAgICAgIGNhc2UgJ08nOlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIC8vIEVTQyBuXG4gICAgICAgICAgLy8gSW52b2tlIHRoZSBHMiBDaGFyYWN0ZXIgU2V0IGFzIEdMIChMUzIpLlxuICAgICAgICBjYXNlICduJzpcbiAgICAgICAgICB0aGlzLnNldGdMZXZlbCgyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICAvLyBFU0Mgb1xuICAgICAgICAgIC8vIEludm9rZSB0aGUgRzMgQ2hhcmFjdGVyIFNldCBhcyBHTCAoTFMzKS5cbiAgICAgICAgY2FzZSAnbyc6XG4gICAgICAgICAgdGhpcy5zZXRnTGV2ZWwoMyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgLy8gRVNDIHxcbiAgICAgICAgICAvLyBJbnZva2UgdGhlIEczIENoYXJhY3RlciBTZXQgYXMgR1IgKExTM1IpLlxuICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgICB0aGlzLnNldGdMZXZlbCgzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICAvLyBFU0MgfVxuICAgICAgICAgIC8vIEludm9rZSB0aGUgRzIgQ2hhcmFjdGVyIFNldCBhcyBHUiAoTFMyUikuXG4gICAgICAgIGNhc2UgJ30nOlxuICAgICAgICAgIHRoaXMuc2V0Z0xldmVsKDIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIC8vIEVTQyB+XG4gICAgICAgICAgLy8gSW52b2tlIHRoZSBHMSBDaGFyYWN0ZXIgU2V0IGFzIEdSIChMUzFSKS5cbiAgICAgICAgY2FzZSAnfic6XG4gICAgICAgICAgdGhpcy5zZXRnTGV2ZWwoMSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBFU0MgNyBTYXZlIEN1cnNvciAoREVDU0MpLlxuICAgICAgICBjYXNlICc3JzpcbiAgICAgICAgICB0aGlzLnNhdmVDdXJzb3IoKTtcbiAgICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGVzLm5vcm1hbDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8vIEVTQyA4IFJlc3RvcmUgQ3Vyc29yIChERUNSQykuXG4gICAgICAgIGNhc2UgJzgnOlxuICAgICAgICAgIHRoaXMucmVzdG9yZUN1cnNvcigpO1xuICAgICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZXMubm9ybWFsO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gRVNDICMgMyBERUMgbGluZSBoZWlnaHQvd2lkdGhcbiAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlcy5ub3JtYWw7XG4gICAgICAgICAgaSsrO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gRVNDIEggVGFiIFNldCAoSFRTIGlzIDB4ODgpLlxuICAgICAgICBjYXNlICdIJzpcbiAgICAgICAgICB0aGlzLnRhYlNldCgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gRVNDID0gQXBwbGljYXRpb24gS2V5cGFkIChERUNQQU0pLlxuICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICB0aGlzLmxvZygnU2VyaWFsIHBvcnQgcmVxdWVzdGVkIGFwcGxpY2F0aW9uIGtleXBhZC4nKTtcbiAgICAgICAgICB0aGlzLmFwcGxpY2F0aW9uS2V5cGFkID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGVzLm5vcm1hbDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8vIEVTQyA+IE5vcm1hbCBLZXlwYWQgKERFQ1BOTSkuXG4gICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgIHRoaXMubG9nKCdTd2l0Y2hpbmcgYmFjayB0byBub3JtYWwga2V5cGFkLicpO1xuICAgICAgICAgIHRoaXMuYXBwbGljYXRpb25LZXlwYWQgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGVzLm5vcm1hbDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZXMubm9ybWFsO1xuICAgICAgICAgIHRoaXMuZXJyb3IoJ1Vua25vd24gRVNDIGNvbnRyb2w6ICVzLicsIGNoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBzdGF0ZXMuY2hhcnNldDpcbiAgICAgICAgc3dpdGNoIChjaCkge1xuICAgICAgICBjYXNlICcwJzpcbiAgICAgICAgICAvLyBERUMgU3BlY2lhbCBDaGFyYWN0ZXIgYW5kIExpbmUgRHJhd2luZyBTZXQuXG4gICAgICAgICAgY3MgPSBUZXJtaW5hbC5jaGFyc2V0cy5TQ0xEO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdBJzpcbiAgICAgICAgICAvLyBVS1xuICAgICAgICAgIGNzID0gVGVybWluYWwuY2hhcnNldHMuVUs7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0InOlxuICAgICAgICAgIC8vIFVuaXRlZCBTdGF0ZXMgKFVTQVNDSUkpLlxuICAgICAgICAgIGNzID0gVGVybWluYWwuY2hhcnNldHMuVVM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJzQnOlxuICAgICAgICAgIC8vIER1dGNoXG4gICAgICAgICAgY3MgPSBUZXJtaW5hbC5jaGFyc2V0cy5EdXRjaDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnQyc6XG4gICAgICAgICAgLy8gRmlubmlzaFxuICAgICAgICBjYXNlICc1JzpcbiAgICAgICAgICBjcyA9IFRlcm1pbmFsLmNoYXJzZXRzLkZpbm5pc2g7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1InOlxuICAgICAgICAgIC8vIEZyZW5jaFxuICAgICAgICAgIGNzID0gVGVybWluYWwuY2hhcnNldHMuRnJlbmNoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdRJzpcbiAgICAgICAgICAvLyBGcmVuY2hDYW5hZGlhblxuICAgICAgICAgIGNzID0gVGVybWluYWwuY2hhcnNldHMuRnJlbmNoQ2FuYWRpYW47XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0snOlxuICAgICAgICAgIC8vIEdlcm1hblxuICAgICAgICAgIGNzID0gVGVybWluYWwuY2hhcnNldHMuR2VybWFuO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdZJzpcbiAgICAgICAgICAvLyBJdGFsaWFuXG4gICAgICAgICAgY3MgPSBUZXJtaW5hbC5jaGFyc2V0cy5JdGFsaWFuO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdFJzpcbiAgICAgICAgICAvLyBOb3J3ZWdpYW5EYW5pc2hcbiAgICAgICAgY2FzZSAnNic6XG4gICAgICAgICAgY3MgPSBUZXJtaW5hbC5jaGFyc2V0cy5Ob3J3ZWdpYW5EYW5pc2g7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1onOlxuICAgICAgICAgIC8vIFNwYW5pc2hcbiAgICAgICAgICBjcyA9IFRlcm1pbmFsLmNoYXJzZXRzLlNwYW5pc2g7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0gnOlxuICAgICAgICAgIC8vIFN3ZWRpc2hcbiAgICAgICAgY2FzZSAnNyc6XG4gICAgICAgICAgY3MgPSBUZXJtaW5hbC5jaGFyc2V0cy5Td2VkaXNoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAvLyBTd2lzc1xuICAgICAgICAgIGNzID0gVGVybWluYWwuY2hhcnNldHMuU3dpc3M7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgIC8vIElTT0xhdGluIChhY3R1YWxseSAvQSlcbiAgICAgICAgICBjcyA9IFRlcm1pbmFsLmNoYXJzZXRzLklTT0xhdGluO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvLyBEZWZhdWx0XG4gICAgICAgICAgY3MgPSBUZXJtaW5hbC5jaGFyc2V0cy5VUztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldGdDaGFyc2V0KHRoaXMuZ2NoYXJzZXQsIGNzKTtcbiAgICAgICAgdGhpcy5nY2hhcnNldCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZXMubm9ybWFsO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBzdGF0ZXMub3NjOlxuICAgICAgICAvLyBPU0MgUHMgOyBQdCBTVFxuICAgICAgICAvLyBPU0MgUHMgOyBQdCBCRUxcbiAgICAgICAgLy8gU2V0IFRleHQgUGFyYW1ldGVycy5cbiAgICAgICAgaWYgKGNoID09PSAnXFx4MWInIHx8IGNoID09PSAnXFx4MDcnKSB7XG4gICAgICAgICAgaWYgKGNoID09PSAnXFx4MWInKSBpKys7XG5cbiAgICAgICAgICB0aGlzLnBhcmFtcy5wdXNoKHRoaXMuY3VycmVudFBhcmFtKTtcblxuICAgICAgICAgIHN3aXRjaCAodGhpcy5wYXJhbXNbMF0pIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtc1sxXSkge1xuICAgICAgICAgICAgICB0aGlzLnRpdGxlID0gdGhpcy5wYXJhbXNbMV07XG5cbiAgICAgICAgICAgICAgLy9oYW5kbGVycyBjb3VsZCBub3QgYmUgaW5zdGFsbGVkXG4gICAgICAgICAgICAgIGlmICh0aGlzLmhhbmRsZVRpdGxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVUaXRsZSh0aGlzLnRpdGxlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAvLyBzZXQgWCBwcm9wZXJ0eVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIC8vIGNoYW5nZSBkeW5hbWljIGNvbG9yc1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICAgIC8vIGNoYW5nZSBkeW5hbWljIHVpIGNvbG9yc1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NjpcbiAgICAgICAgICAgIC8vIGNoYW5nZSBsb2cgZmlsZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MDpcbiAgICAgICAgICAgIC8vIGR5bmFtaWMgZm9udFxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MTpcbiAgICAgICAgICAgIC8vIGVtYWNzIHNoZWxsXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUyOlxuICAgICAgICAgICAgLy8gbWFuaXB1bGF0ZSBzZWxlY3Rpb24gZGF0YVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDQ6XG4gICAgICAgICAgY2FzZSAxMDU6XG4gICAgICAgICAgY2FzZSAxMTA6XG4gICAgICAgICAgY2FzZSAxMTE6XG4gICAgICAgICAgY2FzZSAxMTI6XG4gICAgICAgICAgY2FzZSAxMTM6XG4gICAgICAgICAgY2FzZSAxMTQ6XG4gICAgICAgICAgY2FzZSAxMTU6XG4gICAgICAgICAgY2FzZSAxMTY6XG4gICAgICAgICAgY2FzZSAxMTc6XG4gICAgICAgICAgY2FzZSAxMTg6XG4gICAgICAgICAgICAvLyByZXNldCBjb2xvcnNcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMucGFyYW1zID0gW107XG4gICAgICAgICAgdGhpcy5jdXJyZW50UGFyYW0gPSAwO1xuICAgICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZXMubm9ybWFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghdGhpcy5wYXJhbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoY2ggPj0gJzAnICYmIGNoIDw9ICc5Jykge1xuICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYXJhbSA9IHRoaXMuY3VycmVudFBhcmFtICogMTAgKyBjaC5jaGFyQ29kZUF0KDApIC0gNDg7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNoID09PSAnOycpIHtcbiAgICAgICAgICAgICAgdGhpcy5wYXJhbXMucHVzaCh0aGlzLmN1cnJlbnRQYXJhbSk7XG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhcmFtID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhcmFtICs9IGNoO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBzdGF0ZXMuY3NpOlxuICAgICAgICAvLyAnPycsICc+JywgJyEnXG4gICAgICAgIGlmIChjaCA9PT0gJz8nIHx8IGNoID09PSAnPicgfHwgY2ggPT09ICchJykge1xuICAgICAgICAgIHRoaXMucHJlZml4ID0gY2g7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAwIC0gOVxuICAgICAgICBpZiAoY2ggPj0gJzAnICYmIGNoIDw9ICc5Jykge1xuICAgICAgICAgIHRoaXMuY3VycmVudFBhcmFtID0gdGhpcy5jdXJyZW50UGFyYW0gKiAxMCArIGNoLmNoYXJDb2RlQXQoMCkgLSA0ODtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vICckJywgJ1wiJywgJyAnLCAnXFwnJ1xuICAgICAgICBpZiAoY2ggPT09ICckJyB8fCBjaCA9PT0gJ1wiJyB8fCBjaCA9PT0gJyAnIHx8IGNoID09PSAnXFwnJykge1xuICAgICAgICAgIHRoaXMucG9zdGZpeCA9IGNoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wYXJhbXMucHVzaCh0aGlzLmN1cnJlbnRQYXJhbSk7XG4gICAgICAgIHRoaXMuY3VycmVudFBhcmFtID0gMDtcblxuICAgICAgICAvLyAnOydcbiAgICAgICAgaWYgKGNoID09PSAnOycpIGJyZWFrO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZXMubm9ybWFsO1xuXG4gICAgICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgICAvLyBDU0kgUHMgQVxuICAgICAgICAgIC8vIEN1cnNvciBVcCBQcyBUaW1lcyAoZGVmYXVsdCA9IDEpIChDVVUpLlxuICAgICAgICBjYXNlICdBJzpcbiAgICAgICAgICB0aGlzLmN1cnNvclVwKHRoaXMucGFyYW1zKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8vIENTSSBQcyBCXG4gICAgICAgICAgLy8gQ3Vyc29yIERvd24gUHMgVGltZXMgKGRlZmF1bHQgPSAxKSAoQ1VEKS5cbiAgICAgICAgY2FzZSAnQic6XG4gICAgICAgICAgdGhpcy5jdXJzb3JEb3duKHRoaXMucGFyYW1zKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8vIENTSSBQcyBDXG4gICAgICAgICAgLy8gQ3Vyc29yIEZvcndhcmQgUHMgVGltZXMgKGRlZmF1bHQgPSAxKSAoQ1VGKS5cbiAgICAgICAgY2FzZSAnQyc6XG4gICAgICAgICAgdGhpcy5jdXJzb3JGb3J3YXJkKHRoaXMucGFyYW1zKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8vIENTSSBQcyBEXG4gICAgICAgICAgLy8gQ3Vyc29yIEJhY2t3YXJkIFBzIFRpbWVzIChkZWZhdWx0ID0gMSkgKENVQikuXG4gICAgICAgIGNhc2UgJ0QnOlxuICAgICAgICAgIHRoaXMuY3Vyc29yQmFja3dhcmQodGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gQ1NJIFBzIDsgUHMgSFxuICAgICAgICAgIC8vIEN1cnNvciBQb3NpdGlvbiBbcm93O2NvbHVtbl0gKGRlZmF1bHQgPSBbMSwxXSkgKENVUCkuXG4gICAgICAgIGNhc2UgJ0gnOlxuICAgICAgICAgIHRoaXMuY3Vyc29yUG9zKHRoaXMucGFyYW1zKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8vIENTSSBQcyBKIEVyYXNlIGluIERpc3BsYXkgKEVEKS5cbiAgICAgICAgY2FzZSAnSic6XG4gICAgICAgICAgdGhpcy5lcmFzZUluRGlzcGxheSh0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBDU0kgUHMgSyBFcmFzZSBpbiBMaW5lIChFTCkuXG4gICAgICAgIGNhc2UgJ0snOlxuICAgICAgICAgIHRoaXMuZXJhc2VJbkxpbmUodGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gQ1NJIFBtIG0gQ2hhcmFjdGVyIEF0dHJpYnV0ZXMgKFNHUikuXG4gICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgIHRoaXMuY2hhckF0dHJpYnV0ZXModGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gQ1NJIFBzIG4gRGV2aWNlIFN0YXR1cyBSZXBvcnQgKERTUikuXG4gICAgICAgIGNhc2UgJ24nOlxuICAgICAgICAgIHRoaXMuZGV2aWNlU3RhdHVzKHRoaXMucGFyYW1zKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICogQWRkaXRpb25zXG4gICAgICAgICAgKi9cblxuICAgICAgICAgIC8vIENTSSBQcyBAXG4gICAgICAgICAgLy8gSW5zZXJ0IFBzIChCbGFuaykgQ2hhcmFjdGVyKHMpIChkZWZhdWx0ID0gMSkgKElDSCkuXG4gICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICAgIHRoaXMuaW5zZXJ0Q2hhcnModGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gQ1NJIFBzIEVcbiAgICAgICAgICAvLyBDdXJzb3IgTmV4dCBMaW5lIFBzIFRpbWVzIChkZWZhdWx0ID0gMSkgKENOTCkuXG4gICAgICAgIGNhc2UgJ0UnOlxuICAgICAgICAgIHRoaXMuY3Vyc29yTmV4dExpbmUodGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gQ1NJIFBzIEZcbiAgICAgICAgICAvLyBDdXJzb3IgUHJlY2VkaW5nIExpbmUgUHMgVGltZXMgKGRlZmF1bHQgPSAxKSAoQ05MKS5cbiAgICAgICAgY2FzZSAnRic6XG4gICAgICAgICAgdGhpcy5jdXJzb3JQcmVjZWRpbmdMaW5lKHRoaXMucGFyYW1zKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8vIENTSSBQcyBHXG4gICAgICAgICAgLy8gQ3Vyc29yIENoYXJhY3RlciBBYnNvbHV0ZSBbY29sdW1uXSAoZGVmYXVsdCA9IFtyb3csMV0pIChDSEEpLlxuICAgICAgICBjYXNlICdHJzpcbiAgICAgICAgICB0aGlzLmN1cnNvckNoYXJBYnNvbHV0ZSh0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBDU0kgUHMgTFxuICAgICAgICAgIC8vIEluc2VydCBQcyBMaW5lKHMpIChkZWZhdWx0ID0gMSkgKElMKS5cbiAgICAgICAgY2FzZSAnTCc6XG4gICAgICAgICAgdGhpcy5pbnNlcnRMaW5lcyh0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBDU0kgUHMgTVxuICAgICAgICAgIC8vIERlbGV0ZSBQcyBMaW5lKHMpIChkZWZhdWx0ID0gMSkgKERMKS5cbiAgICAgICAgY2FzZSAnTSc6XG4gICAgICAgICAgdGhpcy5kZWxldGVMaW5lcyh0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBDU0kgUHMgUFxuICAgICAgICAgIC8vIERlbGV0ZSBQcyBDaGFyYWN0ZXIocykgKGRlZmF1bHQgPSAxKSAoRENIKS5cbiAgICAgICAgY2FzZSAnUCc6XG4gICAgICAgICAgdGhpcy5kZWxldGVDaGFycyh0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBDU0kgUHMgWFxuICAgICAgICAgIC8vIEVyYXNlIFBzIENoYXJhY3RlcihzKSAoZGVmYXVsdCA9IDEpIChFQ0gpLlxuICAgICAgICBjYXNlICdYJzpcbiAgICAgICAgICB0aGlzLmVyYXNlQ2hhcnModGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gQ1NJIFBtIGAgQ2hhcmFjdGVyIFBvc2l0aW9uIEFic29sdXRlXG4gICAgICAgICAgLy8gW2NvbHVtbl0gKGRlZmF1bHQgPSBbcm93LDFdKSAoSFBBKS5cbiAgICAgICAgY2FzZSAnYCc6XG4gICAgICAgICAgdGhpcy5jaGFyUG9zQWJzb2x1dGUodGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gMTQxIDYxIGEgKiBIUFIgLVxuICAgICAgICAgIC8vIEhvcml6b250YWwgUG9zaXRpb24gUmVsYXRpdmVcbiAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgdGhpcy5IUG9zaXRpb25SZWxhdGl2ZSh0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBDU0kgUCBzIGNcbiAgICAgICAgICAvLyBTZW5kIERldmljZSBBdHRyaWJ1dGVzIChQcmltYXJ5IERBKS5cbiAgICAgICAgICAvLyBDU0kgPiBQIHMgY1xuICAgICAgICAgIC8vIFNlbmQgRGV2aWNlIEF0dHJpYnV0ZXMgKFNlY29uZGFyeSBEQSlcbiAgICAgICAgY2FzZSAnYyc6XG4gICAgICAgICAgLy8tIHRoaXMuc2VuZERldmljZUF0dHJpYnV0ZXModGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gQ1NJIFBtIGRcbiAgICAgICAgICAvLyBMaW5lIFBvc2l0aW9uIEFic29sdXRlIFtyb3ddIChkZWZhdWx0ID0gWzEsY29sdW1uXSkgKFZQQSkuXG4gICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgIHRoaXMubGluZVBvc0Fic29sdXRlKHRoaXMucGFyYW1zKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIC8vIDE0NSA2NSBlICogVlBSIC0gVmVydGljYWwgUG9zaXRpb24gUmVsYXRpdmVcbiAgICAgICAgY2FzZSAnZSc6XG4gICAgICAgICAgdGhpcy5WUG9zaXRpb25SZWxhdGl2ZSh0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBDU0kgUHMgOyBQcyBmXG4gICAgICAgICAgLy8gSG9yaXpvbnRhbCBhbmQgVmVydGljYWwgUG9zaXRpb24gW3Jvdztjb2x1bW5dIChkZWZhdWx0ID1cbiAgICAgICAgICAvLyBbMSwxXSkgKEhWUCkuXG4gICAgICAgIGNhc2UgJ2YnOlxuICAgICAgICAgIHRoaXMuSFZQb3NpdGlvbih0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBDU0kgUG0gaCBTZXQgTW9kZSAoU00pLlxuICAgICAgICAgIC8vIENTSSA/IFBtIGggLSBtb3VzZSBlc2NhcGUgY29kZXMsIGN1cnNvciBlc2NhcGUgY29kZXNcbiAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgLy8tIHRoaXMuc2V0TW9kZSh0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBDU0kgUG0gbCBSZXNldCBNb2RlIChSTSkuXG4gICAgICAgICAgLy8gQ1NJID8gUG0gbFxuICAgICAgICBjYXNlICdsJzpcbiAgICAgICAgICAvLy0gdGhpcy5yZXNldE1vZGUodGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gQ1NJIFBzIDsgUHMgclxuICAgICAgICAgIC8vIFNldCBTY3JvbGxpbmcgUmVnaW9uIFt0b3A7Ym90dG9tXSAoZGVmYXVsdCA9IGZ1bGwgc2l6ZSBvZiB3aW4tXG4gICAgICAgICAgLy8gZG93KSAoREVDU1RCTSkuXG4gICAgICAgICAgLy8gQ1NJID8gUG0gclxuICAgICAgICBjYXNlICdyJzpcbiAgICAgICAgICAvLy0gdGhpcy5zZXRTY3JvbGxSZWdpb24odGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gQ1NJIHNcbiAgICAgICAgICAvLyBTYXZlIGN1cnNvciAoQU5TSS5TWVMpLlxuICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICB0aGlzLnNhdmVDdXJzb3IodGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gQ1NJIHVcbiAgICAgICAgICAvLyBSZXN0b3JlIGN1cnNvciAoQU5TSS5TWVMpLlxuICAgICAgICBjYXNlICd1JzpcbiAgICAgICAgICB0aGlzLnJlc3RvcmVDdXJzb3IodGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgKiBMZXNzZXIgVXNlZFxuICAgICAgICAgICovXG5cbiAgICAgICAgICAvLyBDU0kgUHMgSVxuICAgICAgICAgIC8vIEN1cnNvciBGb3J3YXJkIFRhYnVsYXRpb24gUHMgdGFiIHN0b3BzIChkZWZhdWx0ID0gMSkgKENIVCkuXG4gICAgICAgIGNhc2UgJ0knOlxuICAgICAgICAgIHRoaXMuY3Vyc29yRm9yd2FyZFRhYih0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBDU0kgUHMgUyBTY3JvbGwgdXAgUHMgbGluZXMgKGRlZmF1bHQgPSAxKSAoU1UpLlxuICAgICAgICBjYXNlICdTJzpcbiAgICAgICAgICAvLy0gdGhpcy5zY3JvbGxVcCh0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBDU0kgUHMgVCBTY3JvbGwgZG93biBQcyBsaW5lcyAoZGVmYXVsdCA9IDEpIChTRCkuXG4gICAgICAgICAgLy8gQ1NJIFBzIDsgUHMgOyBQcyA7IFBzIDsgUHMgVFxuICAgICAgICAgIC8vIENTSSA+IFBzOyBQcyBUXG4gICAgICAgIGNhc2UgJ1QnOlxuICAgICAgICAgIGlmICh0aGlzLnBhcmFtcy5sZW5ndGggPCAyICYmICF0aGlzLnByZWZpeCkge1xuICAgICAgICAgICAgLy8tIHRoaXMuc2Nyb2xsRG93bih0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gQ1NJIFBzIFpcbiAgICAgICAgICAvLyBDdXJzb3IgQmFja3dhcmQgVGFidWxhdGlvbiBQcyB0YWIgc3RvcHMgKGRlZmF1bHQgPSAxKSAoQ0JUKS5cbiAgICAgICAgY2FzZSAnWic6XG4gICAgICAgICAgdGhpcy5jdXJzb3JCYWNrd2FyZFRhYih0aGlzLnBhcmFtcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAvLyBDU0kgUHMgYiBSZXBlYXQgdGhlIHByZWNlZGluZyBncmFwaGljIGNoYXJhY3RlciBQcyB0aW1lcyAoUkVQKS5cbiAgICAgICAgY2FzZSAnYic6XG4gICAgICAgICAgdGhpcy5yZXBlYXRQcmVjZWRpbmdDaGFyYWN0ZXIodGhpcy5wYXJhbXMpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgLy8gQ1NJIFBzIGcgVGFiIENsZWFyIChUQkMpLlxuICAgICAgICBjYXNlICdnJzpcbiAgICAgICAgICB0aGlzLnRhYkNsZWFyKHRoaXMucGFyYW1zKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncCc6XG4gICAgICAgICAgc3dpdGNoICh0aGlzLnByZWZpeCkge1xuICAgICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgICAgdGhpcy5zb2Z0UmVzZXQodGhpcy5wYXJhbXMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5lcnJvcignVW5rbm93biBDU0kgY29kZTogJXMuJywgY2gpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcmVmaXggPSAnJztcbiAgICAgICAgdGhpcy5wb3N0Zml4ID0gJyc7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIHN0YXRlcy5kY3M6XG4gICAgICAgIGlmIChjaCA9PT0gJ1xceDFiJyB8fCBjaCA9PT0gJ1xceDA3Jykge1xuICAgICAgICAgIGlmIChjaCA9PT0gJ1xceDFiJykgaSsrO1xuXG4gICAgICAgICAgc3dpdGNoICh0aGlzLnByZWZpeCkge1xuICAgICAgICAgICAgLy8gVXNlci1EZWZpbmVkIEtleXMgKERFQ1VESykuXG4gICAgICAgICAgY2FzZSAnJzpcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAvLyBSZXF1ZXN0IFN0YXR1cyBTdHJpbmcgKERFQ1JRU1MpLlxuICAgICAgICAgICAgLy8gdGVzdDogZWNobyAtZSAnXFxlUCRxXCJwXFxlXFxcXCdcbiAgICAgICAgICBjYXNlICckcSc6XG4gICAgICAgICAgICB2YXIgcHQgPSB0aGlzLmN1cnJlbnRQYXJhbSxcbiAgICAgICAgICAgICAgdmFsaWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgc3dpdGNoIChwdCkge1xuICAgICAgICAgICAgICAvLyBERUNTQ0FcbiAgICAgICAgICAgIGNhc2UgJ1wicSc6XG4gICAgICAgICAgICAgIHB0ID0gJzBcInEnO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAvLyBERUNTQ0xcbiAgICAgICAgICAgIGNhc2UgJ1wicCc6XG4gICAgICAgICAgICAgIHB0ID0gJzYxXCJwJztcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgLy8gREVDU1RCTVxuICAgICAgICAgICAgY2FzZSAncic6XG4gICAgICAgICAgICAgIHB0ID0gJycgKyAodGhpcy5zY3JvbGxUb3AgKyAxKSArICc7JyArICh0aGlzLnNjcm9sbEJvdHRvbSArIDEpICsgJ3InO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAvLyBTR1JcbiAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICBwdCA9ICcwbSc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aGlzLmVycm9yKCdVbmtub3duIERDUyBQdDogJXMuJywgcHQpO1xuICAgICAgICAgICAgICBwdCA9ICcnO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8tIHRoaXMuc2VuZCgnXFx4MWJQJyArIHZhbGlkICsgJyRyJyArIHB0ICsgJ1xceDFiXFxcXCcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIC8vIFNldCBUZXJtY2FwL1Rlcm1pbmZvIERhdGEgKHh0ZXJtLCBleHBlcmltZW50YWwpLlxuICAgICAgICAgIGNhc2UgJytwJzpcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMuZXJyb3IoJ1Vua25vd24gRENTIHByZWZpeDogJXMuJywgdGhpcy5wcmVmaXgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5jdXJyZW50UGFyYW0gPSAwO1xuICAgICAgICAgIHRoaXMucHJlZml4ID0gJyc7XG4gICAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlcy5ub3JtYWw7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuY3VycmVudFBhcmFtKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLnByZWZpeCAmJiBjaCAhPT0gJyQnICYmIGNoICE9PSAnKycpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhcmFtID0gY2g7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZWZpeC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhcmFtID0gY2g7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJlZml4ICs9IGNoO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmN1cnJlbnRQYXJhbSArPSBjaDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBzdGF0ZXMuaWdub3JlOlxuICAgICAgICAvLyBGb3IgUE0gYW5kIEFQQy5cbiAgICAgICAgaWYgKGNoID09PSAnXFx4MWInIHx8IGNoID09PSAnXFx4MDcnKSB7XG4gICAgICAgICAgaWYgKGNoID09PSAnXFx4MWInKSBpKys7XG4gICAgICAgICAgdGhpcy5zdGF0ZURhdGEgPSAnJztcbiAgICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGVzLm5vcm1hbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIXRoaXMuc3RhdGVEYXRhKSB0aGlzLnN0YXRlRGF0YSA9ICcnO1xuICAgICAgICAgIHRoaXMuc3RhdGVEYXRhICs9IGNoO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlUmFuZ2UodGhpcy55KTtcbiAgICB0aGlzLnJlZnJlc2godGhpcy5yZWZyZXNoU3RhcnQsIHRoaXMucmVmcmVzaEVuZCk7XG4gIH07XG5cbiAgVGVybWluYWwucHJvdG90eXBlLndyaXRlbG4gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gYXQgdGltZXMgc3BhY2VzIGFwcGVhciBpbiBiZXR3ZWVuIGVzY2FwZSBjaGFycyBhbmQgZml4SW5kZW50IGZhaWxzIHVzLCBzbyB3ZSBmaXggaXQgaGVyZVxuICAgIGRhdGEgPSBkYXRhLnJlcGxhY2UoLyAvZywgJyZuYnNwOycpO1xuICAgIC8vIGFkZGluZyBlbXB0eSBjaGFyIGJlZm9yZSBsaW5lIGJyZWFrIGVuc3VyZXMgdGhhdCBlbXB0eSBsaW5lcyByZW5kZXIgcHJvcGVybHlcbiAgICB0aGlzLndyaXRlKGRhdGEgKyAnIFxcclxcbicpO1xuICB9O1xufTtcbiJdfQ==
