document.getElementById('startButton').addEventListener('click', function () {
  const timeInput = document.getElementById('timeInput').value;
  const timeInSeconds = parseInt(timeInput, 10);

  if (isNaN(timeInSeconds) || timeInSeconds <= 0) {
    document.getElementById('status').textContent = '請輸入有效的秒數！';
    return;
  }

  // 傳送開始計時的訊息到 background.js
  chrome.runtime.sendMessage({ action: 'startTimer', time: timeInSeconds });

  // 更新狀態
  document.getElementById('status').textContent = `計時中：${timeInSeconds} 秒`;
});

// 接收 background.js 傳來的倒計時更新
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateTimer') {
    document.getElementById('status').textContent = `剩餘時間：${message.time} 秒`;
  } else if (message.action === 'timerFinished') {
    document.getElementById('status').textContent = '計時完成！';
  }
});

