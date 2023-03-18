import { baseLink } from "./constants";

export function createCustomElement(type, attributes, content=null) {
  const element = document.createElement(type);

  for (let [attribute, content] of Object.entries(attributes)) {
    element.setAttribute(attribute, content);
  }
  element.innerHTML = content;
  return element;
}

export function generateApiUrl(value, extra=null) {
  let apiUrl;
  let searchSplitted = extra.searchedValue?.toLowerCase().split(" ");
  switch (value) {
    case "expand":
      apiUrl = baseLink + `${extra.dataKey}.json`;
      break;
    case "title":
      apiUrl = baseLink + `/search.json?title=$${encodeURIComponent(searchSplitted.join("+"))}`;
      break;
    default:
      apiUrl = baseLink + `/subjects/${encodeURIComponent(searchSplitted[0])}.json?limit=100`;
  }
  return apiUrl;
}

export function createBookElement(book) {
  let bookContainer = createCustomElement("div", {"class": "book-container", "data-key": `${book.key}`});

  let bookElement = createCustomElement("div", {"class": "book-element"});
  if (book.cover_id) bookElement.style.backgroundImage = `url(https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg)`;
  else bookElement.append(createCustomElement("div", {"class": `book-author`}, `Author: ${book.first_author}`)); 

  bookContainer.append(bookElement);
  bookContainer.append(createCustomElement("div", {"class": `book-title`}, `${book.title}`));

  return bookContainer;
}
