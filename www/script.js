const fromText = document.querySelector(".from-text");
const toText = document.querySelector(".to-text");
const selectTag = document.querySelectorAll("select");
const translateBtn = document.querySelector("#translate-btn");
const copyBtn = document.querySelector("#copy-btn");
const themeToggle = document.getElementById('theme-toggle');
const charDisplay = document.querySelector("#char-count");
const detectedSpan = document.querySelector("#detected-text");

// 1. Populate Dropdowns
selectTag.forEach((tag, id) => {
    for (const country_code in countries) {
        let selected = id == 0 ? (country_code == "autodetect" ? "selected" : "") : (country_code == "en" ? "selected" : "");
        let option = `<option value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
        if(selected) tag.value = country_code;
    }
});

// 2. Translation Logic
translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim();
    let translateFrom = selectTag[0].value;
    let translateTo = selectTag[1].value;
    
    if (!text) return;
    
    toText.value = "";
    toText.placeholder = "Translating...";
    
    let apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${translateFrom}|${translateTo}`;
    
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            toText.value = data.responseData.translatedText;
            
            if(translateFrom === "autodetect") {
                let code = data.responseData.detectedSourceLanguage;
                let name = countries[code];
                if (!name) {
                    let fullKey = Object.keys(countries).find(k => k.startsWith(code));
                    name = countries[fullKey];
                }

                if (detectedSpan) {
                    detectedSpan.innerText = `Detected: ${name || code.toUpperCase()}`;
                }
            }
        })
        .catch(() => {
            toText.placeholder = "Translation error";
        });
});

// 3. Theme Toggle & Persistence
if (localStorage.getItem('theme') === "dark") {
    document.body.classList.add('dark-mode');
    themeToggle.innerText = "☀️";
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.innerText = isDark ? "☀️" : "🌙";
});

// 4. Character Counter (Merged Fix with Class Support)
fromText.addEventListener("input", () => {
    let count = fromText.value.length;
    
    if (charDisplay) {
        charDisplay.innerText = `${count} / 500`;
        
        // Use the CSS class for red color to avoid theme conflicts
        if (count > 500) {
            charDisplay.classList.add("limit");
        } else {
            charDisplay.classList.remove("limit");
        }
    }
    
    // Clear detection label when user types
    if (detectedSpan) detectedSpan.innerText = "";
});

// 5. Copy Logic
copyBtn.addEventListener("click", () => {
    const textToCopy = toText.value;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
        copyBtn.classList.add("success");
        const icon = copyBtn.querySelector('i');
        if(icon) icon.classList.replace('bx-copy', 'bx-check');
        
        setTimeout(() => {
            copyBtn.classList.remove("success");
            if(icon) icon.classList.replace('bx-check', 'bx-copy');
        }, 1500);
    });
});
