const timers = {};

chrome.runtime.onMessage.addListener(async (message) => {

    const { tabId, seconds, index_of_item } = message;

    if (message.action === "start") {

        const result = await chrome.storage.session.get("arr");
        const prev_arr_of_reloads = result.arr || [];

        const existing = prev_arr_of_reloads?.find(
            item => item.tabId === tabId
        );

        if (existing) {
            existing.isRunning = true;
            existing.seconds = seconds;
            existing.remaining_seconds = seconds;
        } else {
            prev_arr_of_reloads.push({
                isRunning: true,
                seconds,
                remaining_seconds: seconds,
                tabId
            });
        }

        chrome.storage.session.set({
            arr: prev_arr_of_reloads
        });




        timers[tabId] = [setInterval(() => {
            chrome.tabs.reload(tabId);
        }, seconds * 1000)]

        let remaining_seconds = seconds;
        timers[tabId][1] = setInterval(() => {
            chrome.storage.session.set({
                arr: prev_arr_of_reloads.map((item) => {
                    if (item.tabId == tabId) {
                        item.remaining_seconds = item.remaining_seconds <= 0 ? remaining_seconds = seconds : remaining_seconds--;
                    }
                    return item;
                })
            });
        }, 1000)
    }

    if (message.action === "stop") {

        clearInterval(timers[tabId][0]);
        clearInterval(timers[tabId][1]);
        delete timers[tabId];

        const arr = (await chrome.storage.session.get("arr")).arr || [];


        chrome.storage.session.set({
            arr: arr.map((item) => {
                if (item.tabId == tabId) {
                    item.isRunning = false;
                }
                return item;
            })
        });
    }
});