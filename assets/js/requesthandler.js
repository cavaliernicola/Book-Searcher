import { loader, insertedValue } from "./constants";

export class RequestHandler {
  constructor() {
    this.processing = false;
    this.bookArray;
    this.currentIndex = 0;
  }

  async getResults(searched) {
    if (this.processing) return; // Avoid spam of requests
    this.processing = true;
    let response = await fetch(searched);
    if (!response.ok) {
      throw new Error("Failed to fetch");
    }
    let result = await response.json();
    return result;
  }

  getBooks(result) {
    if (!result.work_count && !result.num_found) {
      throw new Error('No books found');
    }

    // The result has a lot of elements, we take only what we need.
    this.bookArray = (result.works || result.docs).map(book => {
      return book = {
        cover_id: book.cover_i || book.cover_id,
        first_author: (book.authors?.[0]?.name || book.author_name?.[0]) ?? "Unknown",
        all_authors: (book.authors?.map(x => x.name).join(", ") || book.author_name?.join(", ")) ?? "Unknown",
        title: book.title,
        key: book.key
      }
    });
    return this.bookArray;
  }

  showLoader() {
    insertedValue.blur();
    loader.style.display = "block";
  }

  hideLoader() {
    this.stopProcess();
    loader.style.display = "none";
  }

  stopProcess() {
    this.processing = false; 
  }
}