document.addEventListener("DOMContentLoaded", () => {
    loadPasswords();
    document.getElementById("add-btn").addEventListener("click", showAddForm);
    document.getElementById("cancel-btn").addEventListener("click", hideAddForm);
    document.getElementById("save-btn").addEventListener("click", addPassword);
});

function loadPasswords() {
    chrome.storage.sync.get("passwords", (data) => {
        const passwordList = document.getElementById("password-list");
        passwordList.innerHTML = "";  // Clear existing list
        const passwords = data.passwords || [];
        passwords.forEach((password, index) => {
            const li = document.createElement("li");
            li.className = "list-group-item";

            const siteLink = document.createElement("a");
            siteLink.href = password.url;
            siteLink.target = "_blank";
            siteLink.textContent = password.name;
            li.appendChild(siteLink);

            const idSpan = document.createElement("span");
            idSpan.textContent = `${password.id}`;
            li.appendChild(idSpan);

            // Add copy button if password exists
            if (password.password) {
                const copyBtn = document.createElement("button");
                copyBtn.className = "icon-btn";
                copyBtn.innerHTML = "📋";  // Copy icon
                copyBtn.onclick = () => copyToClipboard(password.password);
                li.appendChild(copyBtn);
            }

            // Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "icon-btn";
            deleteBtn.innerHTML = "🗑️";  // Delete icon
            deleteBtn.onclick = () => deletePassword(index);
            li.appendChild(deleteBtn);

            passwordList.appendChild(li);
        });
    });
}

function showAddForm() {
    document.getElementById("password-form").style.display = "block";
    document.getElementById("password-list-section").style.display = "none";
    // Automatically set current tab URL and title
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        document.getElementById("site-url").value = currentTab.url || '';
        document.getElementById("site-name").value = currentTab.title || '';
    });
}

function hideAddForm() {
    document.getElementById("password-form").style.display = "none";
    document.getElementById("password-list-section").style.display = "block";
}

function addPassword() {
    let name = document.getElementById("site-name").value.trim();
    let url = document.getElementById("site-url").value.trim();
    let id = document.getElementById("site-id").value.trim();
    let password = document.getElementById("site-password").value.trim();
    let notes = document.getElementById("site-notes").value.trim();

    if (!name || !url) {
        alert("Please fill in all fields.");
        return;
    }

    // Add https:// if not present
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    chrome.storage.sync.get("passwords", (data) => {
        const passwords = data.passwords || [];
        passwords.push({ name, url, id, password, notes });
        
        // Save and reload
        chrome.storage.sync.set({ passwords }, () => {
            loadPasswords();
            hideAddForm();  // Return to list view after adding
            clearForm();
        });
    });
}

function clearForm() {
    document.getElementById("site-name").value = "";
    document.getElementById("site-url").value = "";
    document.getElementById("site-id").value = "";
    document.getElementById("site-password").value = "";
    document.getElementById("site-notes").value = "";
}

function deletePassword(index) {
    chrome.storage.sync.get("passwords", (data) => {
        const passwords = data.passwords || [];
        passwords.splice(index, 1);  // Remove item
        chrome.storage.sync.set({ passwords }, loadPasswords);
    });
}

function copyToClipboard(text) {
    // Copy password to clipboard
    navigator.clipboard.writeText(text).then(() => {
        alert("Password copied to clipboard.");
    }).catch(err => {
        alert("Failed to copy: " + err);
    });
}
