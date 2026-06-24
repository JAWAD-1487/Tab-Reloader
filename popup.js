let isRunning = false;

let data = [];
let index_of_item = null;
let tab_local;
let interval;

document.addEventListener("DOMContentLoaded", async () => {

    const result = await chrome.storage.session.get([
        "arr"
    ]);
    data = result?.arr || [];

    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    tab_local = tab;

    let i = 0;
    for (const item of data) {
        if (item.tabId == tab.id) {
            isRunning = item.isRunning
            index_of_item = i;
            break;
        }
        i++;
    }

    if (isRunning) {
        document.getElementById("start").innerText = "Stop";
        document.getElementById("start").style.backgroundColor = "red";
        document.getElementById("seconds").value = data[index_of_item].seconds;
        document.getElementById("seconds").style.display = "none";
        document.getElementById("timer").style.display = "block";
        document.getElementById("count_down").style.display = "block";

        interval = setInterval(async () => {
            const result = await chrome.storage.session.get("arr");
            const arr = result.arr || [];

            const item = arr.find(
                item => item.tabId === tab_local.id
            );

            document.getElementById("timer_span").innerText = item?.seconds || "";

            document.getElementById("count_down_span").innerText =
                item?.remaining_seconds || 0;
        }, 1000);
    }
});

document.getElementById("start").addEventListener("click", async () => {

    if (!isRunning) {


        const seconds = document.getElementById("seconds").value;

        if (!seconds || seconds <= 0) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: './icons/icon48.png',
                title: 'Auto Reload Error',
                message: 'Please enter a valid number of seconds.'
            });
            return;
        }


        document.getElementById("start").style.backgroundColor = "red";
        document.getElementById("start").innerText = "Stop";
        document.getElementById("seconds").style.display = "none";
        document.getElementById("timer").style.display = "block";
        document.getElementById("count_down").style.display = "block";
        isRunning = true;

        document.getElementById("timer_span").innerText = data[index_of_item]?.seconds || "";

        interval = setInterval(async () => {
            const result = await chrome.storage.session.get("arr");
            const arr = result.arr || [];

            const item = arr.find(
                item => item.tabId === tab_local.id
            );

            document.getElementById("timer_span").innerText = item?.seconds || "";

            document.getElementById("count_down_span").innerText =
                item?.remaining_seconds || 0;
        }, 1000);


        chrome.runtime.sendMessage({
            action: "start",
            tabId: tab_local.id,
            seconds: Number(seconds),
            index_of_item
        })

    } else {
        document.getElementById("start").style.backgroundColor = "#8BC34A";
        document.getElementById("seconds").style.display = "block";
        document.getElementById("timer").style.display = "none";
        document.getElementById("count_down").style.display = "none";
        document.getElementById("start").innerText = "Start Reload";
        document.getElementById("seconds").value = "";
        isRunning = false;

        clearInterval(interval);

        chrome.runtime.sendMessage({
            action: "stop",
            tabId: tab_local.id,
            index_of_item
        });
    }

});