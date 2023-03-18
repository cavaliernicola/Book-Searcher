import {createCustomElement, generateApiUrl, createBookElement}  from "./utils.js";
import { searchButton, insertedValue, mainElement, modal, modalOverlay, selectedCategory } from "./constants.js";
import { RequestHandler } from "./requesthandler.js";

const showdown  = require('showdown');
const converter = new showdown.Converter({openLinksInNewWindow: true});
const requestHandler = new RequestHandler();

// Show Page Elements Functions
function showBooks() {
  let bookRange = requestHandler.bookArray.slice(requestHandler.currentIndex, requestHandler.currentIndex+20);
  mainElement.innerHTML = ""

  let container = createCustomElement("div", {"class": "searched-book-container"})

  bookRange.forEach(book => {
    let bookElement = createBookElement(book);
    bookElement.addEventListener("click", () => handleOpenDescription(book.key))
    container.append(bookElement);
  })

  mainElement.append(container);
  requestHandler.hideLoader();

  if (requestHandler.bookArray.length > 20) {
    let navigateButtons = createCustomElement("div", {"class": "navigate-buttons"})
    for (let el of ["previous", "next"]) {
      let button = createCustomElement("button", {"class": `navigate-${el}`});
      button.addEventListener("click", () => handlePageNavigation(el));
      navigateButtons.append(button);
    }
    mainElement.append(navigateButtons);
  }
}

function showModal(){
  document.body.style.overflow = "hidden";
  modal.style.display = "block";
  modalOverlay.style.display = "block";
  modal.innerHTML = "";

  let closeButton = createCustomElement("button", {"class": "close-button"});
  closeButton.addEventListener("click", handleCloseDescription);
  modal.append(closeButton);
}

function showDescription(myBook){
  let modalGuts = createCustomElement("div", {"class": "modal-guts"});

  let subElements = [
    { element: createCustomElement("div", {"class": "book-title"}, myBook.title) },
    { 
      element: createCustomElement("div", {"class": "photo-container"}),
      children: [
        { element: createCustomElement("div", {"class": "book-photo", "style": "background-image:" + (myBook.cover_id ? `url(https://covers.openlibrary.org/b/id/${myBook.cover_id}-M.jpg);` : "url(assets/img/photos/cover_not_found.jpg);")}) },
        { element: createCustomElement("div", {"class": "book-author"}, `Author: ${myBook.all_authors}`)}
      ]
    },
    { element: createCustomElement("div", {"class": "book-description"}, myBook.description) }
  ];

  subElements.forEach(item => {
    modalGuts.append(item.element);
    if (item.children) {
      for (let ch of item.children){
        item.element.append(ch.element);
      }
    }
  })

  modal.append(modalGuts);
}

// Event Handlers Callback
function handleCloseDescription() {
  document.body.style.overflow = "auto";
  modal.style.display = "none";
  modalOverlay.style.display = "none";
  modal.innerHTML = "";
}

async function handleOpenDescription(key) {
  let myBook = requestHandler.bookArray.filter(book => book.key == key)?.[0];
  if (!myBook) return;
  
  showModal();
  if (!myBook.description) {
    let apiUrl = generateApiUrl("expand", {dataKey: key});
    let result = await requestHandler.getResults(apiUrl).catch(() => {}); //Not important we manage it as unknown description.
    let description = converter.makeHtml((typeof result?.description === "object" ? result?.description?.value : result?.description) ?? "Description not available."); // The result can be both a string and an object, and it's formatted in markdown.
    requestHandler.bookArray.map(book => {
      if (book.key === key) {
        book.description = description;
      }
    }); // Globally change it in the array, so we don't have to request it again to the API
    requestHandler.stopProcess(); // Make sure to allow other process to run again
    myBook.description = description;
  }
  showDescription(myBook)
}

async function handleEnterClick() {
  if (!insertedValue.value.length) {
    insertedValue.reportValidity();
    return;
  }

  try {
    requestHandler.showLoader();
    let apiUrl = generateApiUrl(selectedCategory.value, {searchedValue: insertedValue.value});
    let result = await requestHandler.getResults(apiUrl);
    if (!requestHandler.bookArray) requestHandler.getBooks(result);
    showBooks();
  } 
  catch (e) {
    requestHandler.hideLoader();
    insertedValue.setCustomValidity(e.message);
    insertedValue.reportValidity();
    setTimeout(() => insertedValue.setCustomValidity(''), 1000)
  }
}

function handlePageNavigation(value) {
  switch (value) {
    case "next":
      if (requestHandler.currentIndex >= requestHandler.bookArray.length-20) requestHandler.currentIndex = 0;
      else requestHandler.currentIndex += 20;
      break;
    default:
      if (requestHandler.currentIndex <= 0) requestHandler.currentIndex = requestHandler.bookArray.length-20;
      else requestHandler.currentIndex -= 20;
  }
  showBooks();
}

// Event Listeners
insertedValue.addEventListener("keyup", (event) => {
  if (event.key === "Enter"){
    handleEnterClick();
  }
})

searchButton.addEventListener("click", handleEnterClick)
modalOverlay.addEventListener("click", handleCloseDescription)