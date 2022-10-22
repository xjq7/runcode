const rem = function () {
  let doc = window.document;
  let docEl = doc.documentElement;
  let tid: any;

  function refreshRem() {
    let width = docEl.getBoundingClientRect().width;
    if (width > 1200) {
      // 最大宽度
      width = 1200;
    }

    if (width < 960) {
      width = 960;
    }

    // 默认在PC端 1rem = 16px
    let rem = 16;

    let u = navigator.userAgent;

    if (
      u.indexOf('Android') > -1 ||
      u.indexOf('Adr') > -1 ||
      u.indexOf('iPhone') > -1 ||
      u.indexOf('iPad') > -1 ||
      u.indexOf('iPod') > -1 ||
      u.indexOf('iOS') > -1 ||
      typeof window.orientation !== 'undefined' ||
      window.screen.width < 500
    ) {
      //移动端
      rem = width / 78;
    }

    docEl.style.fontSize = rem + 'px';
  }
  window.addEventListener(
    'resize',
    function () {
      clearTimeout(tid);
      tid = setTimeout(refreshRem, 10);
    },
    false
  );
  refreshRem();
};

export default rem;
