console.log('Hello World!');

const remainingTimeEl = document.getElementById('remaining-time');

let timeFlag = false;

document.getElementById('go-btn').addEventListener('click', () => {
    timeFlag = true;
})

function updateUI() {
  const date1 = Date.now();
  const date2 = new Date('2026-02-17T00:00:00');

  const timeDifference = date2 - date1; // 时间差（以毫秒为单位）

  if (timeDifference > 0 && !timeFlag) {
    // 转换为更易读的格式
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    remainingTimeEl.innerText = `${to2digit(days * 24 + hours)}:${to2digit(minutes)}:${to2digit(seconds)}`;
  }
  else {
    timeFlag = true;

    document.getElementById('title-line1').innerText = '祝大家';
    document.getElementById('title-line2').innerText = '新年快乐!';
    document.getElementById('title-line3').innerText = 'Happy New Year';
    remainingTimeEl.innerText = '00:00:00';
    setFireworkInterval(30);
  }

  document.getElementById('go-btn').hidden = timeFlag;
}

setInterval(updateUI, 100);
