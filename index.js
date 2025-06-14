// =====================
// Global Variables
// =====================
const uploadedPDFs = {};
let rightClickedItem = null;
let savedMainHTML = null;

// =====================
// DOM Elements (will be assigned in initializeApp)
// =====================
let newFolder,
  folderList,
  uploadBtn,
  fileInput,
  contextMenu,
  deleteBtn,
  displayPdf,
  mainDisplay;

// =====================
// Initialize app
// =====================
function initializeApp() {
  newFolder = document.getElementById("new-folder");
  folderList = document.getElementById("folder-list");
  uploadBtn = document.getElementById("upload");
  fileInput = document.getElementById("file-input");
  contextMenu = document.getElementById("context-menu");
  deleteBtn = document.getElementById("delete-folder-btn");
  displayPdf = document.getElementById("display-pdf");
  mainDisplay = document.querySelector(".main-display");

  displayPdf.innerHTML = "";
  loadSavedFiles();

  displayPdf.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (e.target.tagName === "LI") showContextMenu(e);
  });

  document.addEventListener("click", (e) => {
    if (!contextMenu.contains(e.target)) {
      contextMenu.classList.add("hidden");
    }
  });

  window.addEventListener("contextmenu", (e) => {
    if (e.target.closest("#display-pdf")) {
      e.preventDefault();
    }
  });

  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (event) => {
    const files = event.target.files;
    const savedFiles = JSON.parse(localStorage.getItem("uploadedFiles")) || [];

    for (let file of files) {
      if (file.type !== "application/pdf") continue;

      const reader = new FileReader();

      reader.onload = function (e) {
        const arrayBuffer = e.target.result;
        uploadedPDFs[file.name] = arrayBuffer;

        const newLi = document.createElement("li");
        newLi.innerHTML = `
          📄 ${file.name} 
          <button class="scissor"><i class="fa-solid fa-scissors scissor-icon"></i></button>
          <button class="copy"><i class="fa-regular fa-copy copy-icon"></i></button>
          <button class="bookmark"><i class="fa-regular fa-bookmark bookmark-icon"></i></button>
        `;
        newLi.classList.add(
          "file-item",
          "cursor-pointer",
          "hover:text-green-500"
        );
        newLi.title = file.name;
        newLi.setAttribute("data-filename", file.name);
        displayPdf.appendChild(newLi);

        newLi.addEventListener("click", () => renderPDF(file.name));

        const bookmarkBtn = newLi.querySelector(".bookmark");
        bookmarkBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          bookmarkFile(file.name);
        });

        if (!savedFiles.includes(file.name)) {
          savedFiles.push(file.name);
          localStorage.setItem("uploadedFiles", JSON.stringify(savedFiles));
        }
      };

      reader.readAsArrayBuffer(file);
    }

    fileInput.value = "";
  });

  deleteBtn.addEventListener("click", () => {
    if (!rightClickedItem) return;
    const text = rightClickedItem.textContent.slice(2).trim();

    if (rightClickedItem.textContent.startsWith("📁")) {
      let folders = JSON.parse(localStorage.getItem("folders")) || [];
      folders = folders.filter((folder) => folder !== text);
      localStorage.setItem("folders", JSON.stringify(folders));
    } else if (rightClickedItem.textContent.startsWith("📄")) {
      let files = JSON.parse(localStorage.getItem("uploadedFiles")) || [];
      files = files.filter((file) => file !== text);
      localStorage.setItem("uploadedFiles", JSON.stringify(files));
      delete uploadedPDFs[text];
    }

    rightClickedItem.remove();
    rightClickedItem = null;
    contextMenu.classList.add("hidden");
  });
}

// =====================
// Load saved files from localStorage and render list
// =====================
function loadSavedFiles() {
  const savedFiles = JSON.parse(localStorage.getItem("uploadedFiles")) || [];

  savedFiles.forEach((fileName) => {
    const newLi = document.createElement("li");
    newLi.innerHTML = `
      📄 ${fileName} 
      <button class="scissor"><i class="fa-solid fa-scissors scissor-icon"></i></button>
      <button class="copy"><i class="fa-regular fa-copy copy-icon"></i></button>
      <button class="bookmark"><i class="fa-regular fa-bookmark bookmark-icon"></i></button>
    `;
    newLi.classList.add("file-item", "cursor-pointer", "hover:text-green-500");
    newLi.dataset.name = fileName;
    newLi.title = fileName;
    displayPdf.appendChild(newLi);

    newLi.addEventListener("click", () => renderPDF(fileName));

    const bookmarkBtn = newLi.querySelector(".bookmark");
    bookmarkBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const icon = bookmarkBtn.querySelector(".bookmark-icon");
      if (icon.classList.contains("fa-regular")) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
      }
      bookmarkFile(fileName);
    });
  });
}

// =====================
// Bookmark Function
// =====================
function bookmarkFile(fileName) {
  const bookmarkList = document.getElementById("bookmark-pdf");
  const saved = localStorage.getItem("bookmarkedFiles");
  const bookmarks = saved ? JSON.parse(saved) : [];

  const alreadyBookmarked =
    bookmarks.includes(fileName) ||
    Array.from(bookmarkList.children).some(
      (item) => item.dataset.name === fileName
    );
  if (alreadyBookmarked) return;

  bookmarks.push(fileName);
  localStorage.setItem("bookmarkedFiles", JSON.stringify(bookmarks));

  const li = document.createElement("li");
  li.innerHTML = `
    📄 ${fileName} 
    <button class="scissor"><i class="fa-solid fa-scissors scissor-icon"></i></button>
    <button class="copy"><i class="fa-regular fa-copy copy-icon"></i></button>
    <button class="bookmark remove-bookmark"><i class="fa-solid fa-bookmark bookmark-icon"></i></button>
  `;
  li.classList.add("file-item", "cursor-pointer", "hover:text-yellow-500");
  li.dataset.name = fileName;
  li.title = fileName;

  li.addEventListener("click", () => renderPDF(fileName));

  const removeBtn = li.querySelector(".remove-bookmark");
  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeBookmark(fileName, li);
  });

  bookmarkList.appendChild(li);
}

function loadBookmarkedFiles() {
  const bookmarkList = document.getElementById("bookmark-pdf");
  const saved = localStorage.getItem("bookmarkedFiles");
  const bookmarks = saved ? JSON.parse(saved) : [];

  bookmarks.forEach((fileName) => {
    const li = document.createElement("li");
    li.innerHTML = `
      📄 ${fileName} 
      <button class="scissor"><i class="fa-solid fa-scissors scissor-icon"></i></button>
      <button class="copy"><i class="fa-regular fa-copy copy-icon"></i></button>
      <button class="bookmark remove-bookmark"><i class="fa-solid fa-bookmark bookmark-icon"></i></button>
    `;
    li.classList.add("file-item", "cursor-pointer", "hover:text-yellow-500");
    li.dataset.name = fileName;
    li.title = fileName;

    li.addEventListener("click", () => renderPDF(fileName));

    const removeBtn = li.querySelector(".remove-bookmark");
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeBookmark(fileName, li);
    });

    bookmarkList.appendChild(li);
  });
}

function removeBookmark(fileName, listItem) {
  listItem.remove();
  const saved = localStorage.getItem("bookmarkedFiles");
  let bookmarks = saved ? JSON.parse(saved) : [];
  bookmarks = bookmarks.filter((name) => name !== fileName);
  localStorage.setItem("bookmarkedFiles", JSON.stringify(bookmarks));
}

let plannerNotes = JSON.parse(localStorage.getItem("plannerNotes") || "{}");
let activeNoteKey = null;

const barBtn = document.getElementById("bar");
const noteBar = document.getElementById("note-bar");
const noteArea = document.getElementById("note-area");
const noteTitleInput = document.getElementById("noteTitle");

function savePlannerNotes() {
  localStorage.setItem("plannerNotes", JSON.stringify(plannerNotes));
}

function renderPlannerNotes() {
  noteBar.innerHTML = "";
  Object.keys(plannerNotes).forEach((key) => {
    const li = document.createElement("li");
    li.textContent = key;
    li.onclick = () => {
      activeNoteKey = key;
      noteArea.value = plannerNotes[key];
      noteTitleInput.value = key;
    };
    noteBar.appendChild(li);
  });
}

barBtn.addEventListener("click", () => {
  const title = prompt("Enter folder name:");
  if (!title || plannerNotes[title]) return;
  plannerNotes[title] = "";
  activeNoteKey = title;
  savePlannerNotes();
  renderPlannerNotes();
  noteArea.value = "";
  noteTitleInput.value = title;
});

noteArea.addEventListener("input", () => {
  if (activeNoteKey) {
    plannerNotes[activeNoteKey] = noteArea.value;
    savePlannerNotes();
  }
});

function deleteNote() {
  if (!activeNoteKey) return;
  // const confirmed = confirm(`Delete note "${activeNoteKey}"?`);
  // if (!confirmed) return;

  delete plannerNotes[activeNoteKey];
  savePlannerNotes();
  activeNoteKey = null;
  noteArea.value = "";
  noteTitleInput.value = "";
  renderPlannerNotes();
}
renderPlannerNotes();

// =====================
// Context Menu
// =====================
function showContextMenu(e) {
  rightClickedItem = e.target;
  contextMenu.style.top = `${e.pageY}px`;
  contextMenu.style.left = `${e.pageX}px`;
  contextMenu.classList.remove("hidden");
}

// =====================
// Render PDF in fullscreen view
// =====================
function renderPDF(fileName) {
  const pdfData = uploadedPDFs[fileName];
  if (!pdfData) {
    alert("This PDF is not loaded. Please re-upload the file.");
    return;
  }

  savedMainHTML = document.body.innerHTML;
  document.body.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.id = "pdf-wrapper";
  document.body.appendChild(wrapper);
  wrapper.innerHTML = `
    <div id="toolbar">
      <button id="back-btn">Close</button>
    </div>
    <div id="pdf-container"></div>
  `;

  document.getElementById("back-btn").addEventListener("click", goBack);

  const container = document.getElementById("pdf-container");
  const displayWidth = 650;

  pdfjsLib.getDocument({ data: pdfData }).promise.then((pdf) => {
    const numPages = pdf.numPages;

    (async function renderAllPages() {
      for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = displayWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });
        const ratio = window.devicePixelRatio || 1;

        const canvas = document.createElement("canvas");
        canvas.classList.add("pdf-page");
        canvas.width = viewport.width * ratio;
        canvas.height = viewport.height * ratio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const context = canvas.getContext("2d");
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        container.appendChild(canvas);
        await page.render({ canvasContext: context, viewport }).promise;
      }
    })();
  });
}

// =====================
// Go Back to main UI
// =====================
function goBack() {
  if (savedMainHTML) {
    document.body.innerHTML = savedMainHTML;
    savedMainHTML = null;
    initializeApp();
    setupTabClicks();
    loadBookmarkedFiles();
  }
}

// =====================
// On page load
// =====================
window.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  setupTabClicks();
  loadBookmarkedFiles();
});

// =====================
// Switch View Tabs
// =====================
function switchView(viewIdToShow) {
  const views = document.querySelectorAll(".view-section");
  views.forEach((view) => (view.style.display = "none"));

  const viewToShow = document.getElementById(viewIdToShow);
  if (viewToShow) viewToShow.style.display = "block";

  const nexText = document.getElementById("nex-text");
  const draftText = document.getElementById("draft-text");
  const isPlanner = viewIdToShow === "planner-view";

  nexText.style.display = isPlanner ? "none" : "block";
  draftText.style.display = isPlanner ? "none" : "block";
}

// =====================
// Tab Switching Setup
// =====================
function setupTabClicks() {
  document.getElementById("bookmark-tab").addEventListener("click", () => {
    switchView("bookmark-view");
  });

  document.getElementById("planner-tab").addEventListener("click", () => {
    switchView("planner-view");
  });

  document.getElementById("recent-tab").addEventListener("click", () => {
    switchView("main-view");
  });
}
