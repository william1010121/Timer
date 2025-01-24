let timerInterval = null; // 用來存放 setInterval 的 ID
let remainingTime = 0; // 剩餘時間（秒）
// https://stackoverflow.com/questions/67437180/play-audio-from-background-script-in-chrome-extention-manifest-v3
/**
 * Plays audio files from extension service workers
 * @param {string} source - path of the audio file
 * @param {number} volume - volume of the playback
 */
async function playSound(source = 'default.wav', volume = 1) {
    await createOffscreen();
    await chrome.runtime.sendMessage({ play: { source, volume } });
}

// Create the offscreen document if it doesn't already exist
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'testing' // details for using the API
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startTimer') {
        // 停止之前的計時器（如果有的話）
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        remainingTime = message.time;

        // 每秒更新倒數
        timerInterval = setInterval(() => {
            remainingTime--;

            // 發送剩餘時間到 popup.js
            chrome.runtime.sendMessage({ action: 'updateTimer', time: remainingTime });

            if (remainingTime <= 0) {
                clearInterval(timerInterval); // 停止計時器
                playSound('chime.mp3', 1);
                chrome.runtime.sendMessage({ action: 'timerFinished' }); // 通知完成
                // 創建通知
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon.png',
                    title: '計時完成',
                    message: '您的計時器已完成！'
                }, function(notificationId) {
                    console.log('通知已顯示，ID:', notificationId);
                });
            }
        }, 1000);

        sendResponse({ success: true });
    }
});

