function attachClick(folderElement, folderName) {
  folderElement.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link navigation if any

    const menu = document.getElementById("context-menu");
    menu.style.top = `${e.clientY}px`;
    menu.style.left = `${e.clientX}px`;
    menu.classList.remove("hidden");

    // Save data for deletion
    menu.dataset.folderName = folderName;
    window.targetFolder = folderElement;

    // Stop propagation so outer click listener doesn't immediately hide menu
    e.stopPropagation();
  });
  folderElement.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    window.location.href = `editor.html?folder=${encodeURIComponent(
      folderName
    )}`;
  });
}

const container = document.getElementById("folder-container");
const createBtn = document.getElementById("create-folder");

const popup = document.getElementById("folder-popup");
const input = document.getElementById("folder-name-input");
const createFolderBtn = document.getElementById("create-folder-btn");
const cancelBtn = document.getElementById("cancel-folder-btn");

createBtn.addEventListener("click", () => {
  popup.classList.remove("hidden");
  input.value = "";
  input.focus();
});

cancelBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
});

createFolderBtn.addEventListener("click", () => {
  const folderName = input.value.trim();
  if (folderName !== "") {
    const newFolder = document.createElement("a");
    newFolder.href = `editor.html?folder=${encodeURIComponent(folderName)}`;
    newFolder.className = "item";
    newFolder.innerHTML = `
      <div class="icon-bar active">
        <i class="ph ph-folder folder-icon"></i>
        <p class="folder-name">${folderName}</p>
      </div>
    `;
    container.appendChild(newFolder);
    attachClick(newFolder, folderName);
    popup.classList.add("hidden");

    // Store in localStorage
    const storedFolders = JSON.parse(localStorage.getItem("folders")) || [];
    storedFolders.push(folderName);
    localStorage.setItem("folders", JSON.stringify(storedFolders));
  }
});

// Load from localStorage on page load
window.addEventListener("DOMContentLoaded", () => {
  const storedFolders = JSON.parse(localStorage.getItem("folders")) || [];

  storedFolders.forEach((folderName) => {
    const newFolder = document.createElement("a");
    newFolder.href = `editor.html?folder=${encodeURIComponent(folderName)}`;
    newFolder.className = "item";
    newFolder.innerHTML = `
      <div class="icon-bar active">
        <i class="ph ph-folder folder-icon"></i>
        <p class="folder-name">${folderName}</p>
      </div>
    `;
    container.appendChild(newFolder);

    attachClick(newFolder, folderName);
  });

  // Hide context menu on click outside
  document.addEventListener("click", (e) => {
    const menu = document.getElementById("context-menu");
    if (!menu.contains(e.target)) {
      menu.classList.add("hidden");
    }
  });
});

// Handle delete option
document.getElementById("delete-folder-btn").addEventListener("click", () => {
  const menu = document.getElementById("context-menu");
  const folderName = menu.dataset.folderName;
  const storedFolders = JSON.parse(localStorage.getItem("folders")) || [];

  if (window.targetFolder) {
    window.targetFolder.remove();
  }

  const updatedFolders = storedFolders.filter((name) => name !== folderName);
  localStorage.setItem("folders", JSON.stringify(updatedFolders));

  menu.classList.add("hidden");
});
