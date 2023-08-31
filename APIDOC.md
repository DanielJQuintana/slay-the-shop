# CS 132 Slay the Shop API Documentation
**Author:** Daniel Quintana
**Last Updated:** 06/08/23

The Slay the Shop API provides functionality to retrieve and post data for a fictional card store for the CS 132 Final Project.

Clients can retrieve information about existing products, including descriptions, characteristics, prices, and images. Clients are also able to submit letters to the shop.

All error responses are returned as plain text. Server-side errors are represented by error code 500, along with a basic error message.

Summary of endpoints:
* GET /products
* GET /product
* GET /promotions
* POST /service

## *GET /products*
**Returned Data Format:** Plain text

**Description:**
Returns a plain text list of product image paths for products available in the shop. Optional parameters can be included to filter the products.

**Parameters**
* name (optional)
  * Name of the product
* type (optional)
  * Type of the product (attack, skill, power)
* color (optional)
 * Color of the product (red, green, blue, purple)
* rarity (optional)
  * Rarity of the product (common, uncommon, rare)
* cost (optional)
  * Energy cost of the product

**Example Request:** `/products?type=attack&rarity=common`

**Example Response:**
```headbutt.png,bowling-bash.png```

**Error Handling:**
* 400: Invalid request if given a parameter that the products do not have.

**Example Request:** `/products?fruit=apple`

**Example Response:** 
```Products do not have property "fruit".```


## *GET /product*
**Returned Data Format:** JSON

**Description:**
Returns a JSON object containing information about the product with the name matching the parameter "name".

**Parameters**
* name (required)
  * Name of the product

**Example Request:** `/product?name=footwork`

**Example Response:**
```json
{
  "name": "footwork",
  "type": "power",
  "color": "green",
  "rarity": "uncommon",
  "cost": "1",
  "price": "111",
  "image": "footwork.png",
  "description": "Gain 2 Dexterity."
}
```

**Error Handling:**
* 400: Invalid request if name parameter is missing.
* 404: Invalid request if no product has name matching the parameter.

**Example Request:** `/product?name=apple`

**Example Response:**
```No product named "apple"```

## *GET /promotions*
**Returned Data Format:** JSON

**Description:**
Returns a collection of JSON objects containing information about promotions. An optional parameter can be included to specify the number of promotions returned. Including this parameter also randomizes the returned promotions.

**Parameters**
* count (optional)
  * Number of promotions to return

**Example Request:** `/promotions?count=2`

**Example Response:**
```json
[
  {
    "promotion": "NEW PURPLE CARDS 50% OFF!",
    "image": "wallop.png"
  },
  {
    "promotion": "Get 20% off your first 5 purchases with a Merchants' Guild membership!",
    "image": "hand-of-greed.png"
  }
]
```

**Error Handling:**
* 400: Invalid request if count parameter is out of bounds (1 to number of promotions) or not a number.

**Example Request:** `/promotions?count=-1`

**Example Response:**
```Must request at least 1 promotion.```

## *POST /service*
**Returned Data Format:** Plain text

**Description:**
Sends information to the Slay the Shop web service for a "contact us" endpoint, allowing the user to submit their name, (fictional) guild, reason for contact, and message. Returns a response indicating if the submission was successful or not.

**Parameters**
* POST body parameters:
  * `name` (required) - name of user
  * `guild` (required) - guild of user
  * `type` (required) - reason for contact
  * `message` (required) - message from user

**Example Request:** `/service`
* POST body parameters:
  * `name="King Arthur"`
  * `guild="Camelot"`
  * `type="Question"`
  * `message="How do I purchase a card?"`

**Example Response:**
```The shop has received your message. Please check in with your guild for a response letter!```

**Error Handling:**
* 400: Invalid request missing any of the required parameters.

**Example Request:** `/service`
* POST body parameters:
  * `name="King Arthur"`
  * `guild="Camelot"`
  * `type="Question"`

**Example Response:**
```Missing parameter for /service POST endpoint - parameters: name, guild, type, message```