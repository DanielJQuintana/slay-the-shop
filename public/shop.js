/**
 * NAME: Daniel Quintana
 * DATE: 6/8/23
 * 
 * This file provides interactivty and API access for my CS 132 Final Project, the Slay the Shop! 
 * E-commerce store. It allows the user to switch between various website views, and implements the 
 * fetch calls necessary to pull product information from the Slay the Shop API to display to the 
 * user, as well as allowing for message submission.
 */

(function() {
  "use strict";

  const BASE_URL = "/";
  const IMG_EP = "imgs/";

  /**
   * This function initalizes the website, filling the different parts of the site with relevant
   * information from the back-end. It also initializes the event listeners for all of the site's 
   * buttons.
   */
  async function init() {
    displayCards();
    displayPromotion();
    fillPromotions();
    id("home-btn").addEventListener("click", homeView);
    id("contact-btn").addEventListener("click", contactView);
    id("filter-btn").addEventListener("click", () => {
      clearError(); 
      displayCards();
    });
    id("return-btn").addEventListener("click", () => {
      clearProductView(); 
      homeView();
    });
    id("promotion-btn").addEventListener("click", promotionView);
    id("cart").addEventListener("click", cartView);
    id("letter-form").addEventListener("submit", (evt) => {
      evt.preventDefault(); 
      sendLetter();
    });
  }

  /**
   * This function switches to the home view.
   */
  function homeView() {
    displayPromotion();
    clearError();
    id("shop-view").classList.remove("hidden");
    id("promotion-view").classList.add("hidden");
    id("product-view").classList.add("hidden");
    id("contact-view").classList.add("hidden");
    id("cart-view").classList.add("hidden");
  }

  /**
   * This function switches to the "contact us" view.
   */
  function contactView() {
    clearError();
    id("contact-view").classList.remove("hidden");
    id("shop-view").classList.add("hidden");
    id("promotion-view").classList.add("hidden");
    id("product-view").classList.add("hidden");
    id("cart-view").classList.add("hidden");
  }

  /**
   * This function switches to the single-product view.
   */
  function productView() {
    clearError();
    id("product-view").classList.remove("hidden");
    id("shop-view").classList.add("hidden");
    id("promotion-view").classList.add("hidden");
    id("contact-view").classList.add("hidden");
    id("cart-view").classList.add("hidden");
  }

  /**
   * This function switches to the cart view.
   */
  function cartView() {
    clearError();
    id("cart-view").classList.remove("hidden");
    id("promotion-view").classList.add("hidden");
    id("product-view").classList.add("hidden");
    id("shop-view").classList.add("hidden");
    id("contact-view").classList.add("hidden");
  }

  /**
   * This function switches to the promotion view.
   */
  function promotionView() {
    clearError();
    id("promotion-view").classList.remove("hidden");
    id("shop-view").classList.add("hidden");
    id("product-view").classList.add("hidden");
    id("contact-view").classList.add("hidden");
    id("cart-view").classList.add("hidden");
  }

  /**
   * Uses the '/products' endpoint.
   * This function fetches the image paths of the products that satisfy the filter.
   * @returns {String} String of image paths fetched from the back-end.
   */
  async function fetchCards() {
    const filterString = getFilterString();
    try {
      let resp = await fetch(BASE_URL + "products?" + filterString);
      resp = checkStatus(resp);
      const data = await resp.text();
      return data;
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function reads the values of the inputs in the product filter element and constructs a 
   * string to be used in the fetch URL.
   */
  function getFilterString() {
    const inputs = ["name", "type", "color", "rarity", "cost"];
    let filterStrings = [];

    for (const input of inputs) {
      const value = id("filter-" + input).value;
      if (value !== "") {
        filterStrings.push(input + "=" + value);
      }
    }

    return filterStrings.join("&");
  }

  /**
   * This function displays the products to the user.
   */
  async function displayCards() {
    const NO_RESULT = "No cards match this filter!"

    const imgPaths = await fetchCards();
    const productArea = id("products");
    productArea.innerHTML = "";
    let paths = [];

    if (imgPaths.length === 0) {
      paths = [];
      handleError(NO_RESULT);
    } else {
      paths = imgPaths.split(",");
    }

    for (const path of paths) {
      const product = gen("img");
      product.src = IMG_EP + path;
      product.addEventListener("click", () => showProduct(product, path));
      productArea.appendChild(product);
    }
  }

  /**
   * Uses the '/promotions' endpoint.
   * This function fetches a given number of promotions from the back-end.
   * @param {Number} count - the number of promotions to fetch
   * @returns {JSON[]} Collection of JSON objects containing information about the store's promotions.
   */
  async function fetchPromotion(count) {
    try {
      let url = BASE_URL + "promotions";

      if (count > 0) {
        url += "?count=" + count;
      }

      let resp = await fetch(url);
      resp = checkStatus(resp);
      const data = await resp.json();
      return data;
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function displays a random promotion on the home page.
   */
  async function displayPromotion() {
    let promotionData = await fetchPromotion(1);
    promotionData = promotionData[0];

    const img = gen("img");
    img.src = IMG_EP + promotionData.image;

    const promotion = gen("p");
    promotion.textContent = promotionData.promotion;

    const promotionArea = id("promotion");
    promotionArea.innerHTML = "";

    promotionArea.appendChild(img);
    promotionArea.appendChild(promotion);
    promotionArea.appendChild(img.cloneNode());
  }

  /**
   * This function fills the promotions view with all available store promotions.
   */
  async function fillPromotions() {
    let promotions = await fetchPromotion(0);
    const promotionView = id("promotion-view");

    for (const promotionData of promotions) {
      const promotionItem = gen("article");

      const img = gen("img");
      img.src = IMG_EP + promotionData.image;

      const promotion = gen("p");
      promotion.textContent = promotionData.promotion;

      promotionItem.appendChild(img);
      promotionItem.appendChild(promotion);
      promotionItem.appendChild(img.cloneNode());

      promotionView.appendChild(promotionItem);
    }
  }

  /**
   * Uses the '/product' endpoint.
   * This function fetches information about a single product.
   * @param {String} name - the name of the item to fetch
   * @returns {JSON} A JSON object containg information about the fetched item
   */
  async function fetchItem(name) {
    try {
      let resp = await fetch(BASE_URL + "product?name=" + name);
      resp = checkStatus(resp);
      const data = await resp.json();
      return data;
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function clears the product view of any existing products and associated information.
   */
  function clearProductView() {
    const productArea = id("product-view");
    for (const child of qsa("#product-view img")) {
      productArea.removeChild(child);
    }

    for (const child of qsa("#product-view ul")) {
      productArea.removeChild(child);
    }
  }

  /**
   * This function displays a product in single-product view, along with additional information.
   * @param {HTMLImageElement} product - image element to be displayed in single-product view
   * @param {String} path - path to the image
   */
  async function showProduct(product, path) {
    id("product-view").insertBefore(product.cloneNode(), qs("#product-view p"));

    let details = await fetchItem(pathToName(path));
    generateDetails(details);

    productView();
  }

  /**
   * This function converts a product's image path to its name
   * @param {String} path - the path to the product's image
   * @returns {String} The name of the product
   */
  function pathToName(path) {
    const extLength = 4;
    path = path.slice(0, path.length - extLength);
    return (path.replace("-", " "));
  }

  /**
   * This function generates and displays a list of details about a product in product view.
   * @param {JSON} details - a JSON object containing product details
   */
  function generateDetails(details) {
    const detailList = gen("ul");

    for (const detail in details) {
      if (detail === "image") {
        continue;
      }

      const listItem = gen("li");
      listItem.textContent = capitalize(detail) + ": " + capitalize(details[detail]);

      if (detail == "cost") {
        listItem.textContent = "Energy " + listItem.textContent;
      }

      if (detail === "price") {
        listItem.textContent += " gold"
      }

      detailList.appendChild(listItem);
    }

    id("product-view").appendChild(detailList);
  }

  /**
   * This function capitalizes the first letter in a string.
   * @param {String} word - a string to capitalize
   * @returns {String} The capitalized string
   */
  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  /**
   * Uses '/service' endpoint.
   * This function submits the given form data to the back-end via the POST endpoint. 
   * @param {FormData} letterContents - FormData object containing values for POST body
   * @returns {String} Reply string indicating success 
   */
  async function postLetter(letterContents) {
    try {
      let resp = await fetch(BASE_URL + "service", { method : "POST", body : letterContents });
      resp = checkStatus(resp);
      const data = await resp.text();
      return data;
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function collects the form data, posts it, and displays the result.
   */
  async function sendLetter() {
    let data = new FormData(id("letter-form"));
    const result = await postLetter(data);
    id("letter-result").textContent = result;
  }

  /**
   * This function clears the error message area.
   */
  function clearError() {
    id("err-display").classList.add("hidden");
  }

  /**
   * This function displays an error message on the page. If errMsg is passed as a string, the 
   * string is displayed as the error message. Otherwise, a generic message is displayed. 
   * @param {String} errMsg - optional error message
   */
  function handleError(errMsg) {
    if (typeof errMsg === "string") {
      id("err-display").textContent = errMsg;
    } else {
      id("err-display").textContent = "An error has occurred. Please try again.";
    }
    id("err-display").classList.remove("hidden");
  }

  init();
})();