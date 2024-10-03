chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['checkmeet.js']
    });
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.meet) {
            url = request.url;
            if (request.noOfParticipants < 0) {
                document.querySelector('.meet').classList.add('hide');
                document.querySelector('.lonemeet').classList.remove('hide');
            } else if (request.noOfParticipants == null) {
                document.querySelector('.meet').classList.add('hide');
                document.querySelector('.nomeet').classList.remove('hide');
            }
            if (request.running) {
                document.querySelector('.meet').classList.add('hide');
                document.querySelector('.running').classList.remove('hide');
            } else {
                document.getElementById('noOfParticipant').innerHTML = request.noOfParticipants;
                document.getElementById('requiredParticipantToExit').value = Math.round(request.noOfParticipants / 2);
                document.getElementById('confirm').addEventListener('click', () => {
                    const requiredParticipantToExit = document.getElementById('requiredParticipantToExit').value;
                    document.querySelector('.meet').classList.add('hide');
                    document.querySelector('.running').classList.remove('hide');
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => localStorage.setItem("running", true)
                    });
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (requiredParticipantToExit) => localStorage.setItem("requiredParticipantToExit", requiredParticipantToExit),
                        args: [requiredParticipantToExit]
                    });
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ["exitMeet.js"]
                    });
                });
            }
        } else {
            document.querySelector('.meet').classList.add('hide');
            document.querySelector('.wrongmeet').classList.remove('hide');
        }
    });
    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    }
    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference === 'enabled') {
        enableDarkMode();
    }
    document.getElementById('toggle-dark-mode').addEventListener('click', () => {
        const darkModeEnabled = document.body.classList.contains('dark-mode');
        if (darkModeEnabled) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });
    document.querySelector('.cancelButton').addEventListener('click', () => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => localStorage.removeItem("running")
        });
        window.close();
    });
});
