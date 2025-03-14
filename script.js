document.addEventListener("DOMContentLoaded", () => {
    let moods = document.querySelectorAll(".mood-selector span");
    let journalInput = document.getElementById("journal-entry");
    let saveButton = document.getElementById("save-entry");
    let selectedMood = null;
    let streakCount = 0;
    let today = new Date().toISOString().split("T")[0];

    document.getElementById("current-date").innerText = today;

    let savedData = JSON.parse(localStorage.getItem(today));
    if (savedData) {
        selectedMood = savedData.mood;
        journalInput.value = savedData.entry;
        highlightMoods(selectedMood);
    }

    let streakData = JSON.parse(localStorage.getItem("streak")) || { count: 0, lastDate: null };
    updateStreak(streakData);

    moods.forEach(mood => {
        mood.addEventListener("click", () => {
            selectedMood = mood.dataset.rating;
            highlightMoods(selectedMood);
        });
    });

    saveButton.addEventListener("click", () => {
        if (!selectedMood) {
            alert("Please select a mood before saving.");
            return;
        }

        let journalData = {
            mood: selectedMood,
            entry: journalInput.value
        };

        localStorage.setItem(today, JSON.stringify(journalData));
        updateStreak(streakData);
        alert("Journal entry saved!");
    });

    function highlightMoods(rating) {
        moods.forEach(mood => {
            if (mood.dataset.rating <= rating) {
                mood.classList.add("selected");
            } else {
                mood.classList.remove("selected");
            }
        });
    }

    function updateStreak(data) {
        let lastDate = data.lastDate;
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        let yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastDate === yesterdayStr) {
            streakCount = data.count + 1;
        } else if (lastDate === today) {
            streakCount = data.count;
        } else {
            streakCount = 1;
        }

        localStorage.setItem("streak", JSON.stringify({ count: streakCount, lastDate: today }));
        document.getElementById("streak-count").innerText = streakCount;
    }

    let viewEntriesButton = document.getElementById("view-entries");
    let modal = document.getElementById("past-entries-modal");
    let closeModal = document.querySelector(".close");
    let pastEntriesList = document.getElementById("past-entries-list");

    viewEntriesButton.addEventListener("click", () => {
        pastEntriesList.innerHTML = "";
        Object.keys(localStorage).sort().reverse().forEach(date => {
            if (date !== "streak") {
                let entryData = JSON.parse(localStorage.getItem(date));
                let listItem = document.createElement("li");
                listItem.innerHTML = `<strong>${date}:</strong> Mood ${entryData.mood} - ${entryData.entry}`;
                pastEntriesList.appendChild(listItem);
            }
        });

        modal.style.display = "block";
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  const installBtn = document.createElement('button');
  installBtn.innerText = 'Install Journal App';
  document.body.appendChild(installBtn);

  installBtn.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
});