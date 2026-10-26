const STORAGE_KEY = "shreyansh-reading-list-v1";
const STATUSES = ["Want to Read", "Reading", "Finished"];

const form = document.getElementById("book-form");
const titleInput = document.getElementById("book-title");
const statusInput = document.getElementById("book-status");
const statusFilter = document.getElementById("status-filter");
const bookList = document.getElementById("book-list");
const emptyState = document.getElementById("empty-state");
const bookCount = document.getElementById("book-count");

let books = loadBooks();

function loadBooks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter(book =>
      book && typeof book.id === "string" &&
      typeof book.title === "string" &&
      STATUSES.includes(book.status)
    );
  } catch (error) {
    console.warn("Could not read saved books:", error);
    return [];
  }
}

function saveBooks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (error) {
    alert("Your browser could not save this list. Check your browser storage settings.");
    console.error("Could not save books:", error);
  }
}

function statusClass(status) {
  if (status === "Reading") return "status-reading";
  if (status === "Finished") return "status-finished";
  return "status-want";
}

function makeStatusSelect(book) {
  const select = document.createElement("select");
  select.className = "status-select";
  select.setAttribute("aria-label", `Change status for ${book.title}`);

  STATUSES.forEach(status => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    option.selected = status === book.status;
    select.appendChild(option);
  });

  select.addEventListener("change", () => {
    books = books.map(item => item.id === book.id ? { ...item, status: select.value } : item);
    saveBooks();
    renderBooks();
  });
  return select;
}

function createBookCard(book) {
  const card = document.createElement("article");
  card.className = "book-card";

  const top = document.createElement("div");
  top.className = "card-top";

  const symbol = document.createElement("div");
  symbol.className = "book-symbol";
  symbol.setAttribute("aria-hidden", "true");
  symbol.textContent = "▤";

  const removeButton = document.createElement("button");
  removeButton.className = "delete-button";
  removeButton.type = "button";
  removeButton.textContent = "×";
  removeButton.setAttribute("aria-label", `Remove ${book.title}`);
  removeButton.title = "Remove book";
  removeButton.addEventListener("click", () => {
    books = books.filter(item => item.id !== book.id);
    saveBooks();
    renderBooks();
  });

  top.append(symbol, removeButton);

  const title = document.createElement("h3");
  title.textContent = book.title;

  const bottom = document.createElement("div");
  bottom.className = "card-bottom";

  const badge = document.createElement("span");
  badge.className = `status-badge ${statusClass(book.status)}`;
  badge.textContent = book.status;

  bottom.append(badge, makeStatusSelect(book));
  card.append(top, title, bottom);
  return card;
}

function renderBooks() {
  const filter = statusFilter.value;
  const visibleBooks = filter === "All" ? books : books.filter(book => book.status === filter);

  bookList.replaceChildren();
  visibleBooks.forEach(book => bookList.appendChild(createBookCard(book)));

  bookCount.textContent = String(books.length);
  emptyState.hidden = visibleBooks.length > 0;

  if (books.length > 0 && visibleBooks.length === 0) {
    emptyState.hidden = false;
    emptyState.querySelector("strong").textContent = `No books with status “${filter}”.`;
    emptyState.querySelector("span:last-child").textContent = "Try another filter or change a book’s status.";
  } else if (books.length === 0) {
    emptyState.querySelector("strong").textContent = "Your reading list is empty. Add your first book.";
    emptyState.querySelector("span:last-child").textContent = "Your books will appear here once you add them.";
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const status = statusInput.value;

  if (!title) {
    titleInput.focus();
    return;
  }

  books.unshift({
    id: (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    status
  });

  saveBooks();
  titleInput.value = "";
  statusInput.value = "Want to Read";
  statusFilter.value = "All";
  renderBooks();
  titleInput.focus();
});

statusFilter.addEventListener("change", renderBooks);

renderBooks();
