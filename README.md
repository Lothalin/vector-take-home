# vector-take-home
Cardiac Device Data Scraper


# Provided readme for consideration

# Data Flow Interview Exercise

## Scenario

A product manager has outlined a project. The goals of the project is to maintain an internal database of cardiac devices from Medtronic. The product manager has identified the source of all cardiac devices, and has given you the url. From their assumption tests, they are confident that if new products are added or updated, it will be reflected on that page. There is also talk about reusing this code in other serverless projects, so they want you to keep an open mind about how your code is written so that it can be expanded on and reused.

## Objective

Write a Node.js module that programmatically scrapes and normalizes cardiac device product data from the provided Medtronic [product page url](#urls).

### Requirements

Your task is to write code that:

- Retrieves cardiac device product data from the provided URL.
- Extracts, normalizes, and filters information about cardiac devices, returning the results as a structured object.
- Normalizes product names by removing non-alphanumeric characters and extraneous qualifiers (such as "pacer" or "ICD").
- Extracts and includes the following fields for each product:
  - Name
  - URL
  - Description
  - Type (using the normalized terminology below)
  - Models
- Exports the main functionality as a reusable module.
- Includes an example script that demonstrates how to use the module.

### Bonus Objectives

You can further improve your solution by:

- Extracting model numbers for each product.
- Cleaning up product name strings as described above.
- Including the number of connectors for each model (if available).
- Avoiding external dependencies (e.g., headless browsers).
- Including tests for your code.
- Writing the solution in TypeScript, or providing TypeScript definitions.

---

### Evaluation Criteria

Your submission will be evaluated on:

- How you approach retrieving data from non-API sources.
- How you parse and traverse HTML.
- How you implement mapping and filtering patterns.
- How you handle asynchronous calls (especially when concurrent!).
- How you prepare your code to handle unexpected scenarios.
- How you parse and normalize data.
- How you structure your code for reusability as a module.
- How you anticipate what functionality or features might be useful for parameterization.
- How you interpret and process technical, industry-specific information about cardiac devices.

---

## References

### URLs

Product Page to Scrape: https://www.medtronic.com/en-us/healthcare-professionals/products/cardiac-rhythm.html

### Cardiac Device Terminology

| Industry Term / Acronym                | Known Internally As |
|----------------------------------------|---------------------|
| Pacemaker                             | Pacer               |
| CRT-P (Cardiac Resynchronization Therapy - Pacemaker) | Pacer         |
| ICM (Implantable Cardiac Monitor)     | Loop                |
| ICD (Implantable Cardioverter Defibrillator) | ICD         |
| CRT-D (Cardiac Resynchronization Therapy - Defibrillator) | ICD         |
---

### Example Output Format

```json
[
  {
    "name": "Reveal LINQ",
    "url": "https://www.medtronic.com/en-us/healthcare-professionals/products/cardiac-rhythm/EXAMPLE_PRODUCT_PAGE_PLACEHOLDER_URL",
    "description": "The Reveal LINQ ICM with AccuRhythm AI algorithms is for patients with infrequent symptoms requiring long-term cardiac monitoring.",
    "type": "Loop",
    "models": ["LNQ11"]
  },
  {
    "name": "Cobalt XT MRI SureScan",
    "url": "https://www.medtronic.com/en-us/healthcare-professionals/products/cardiac-rhythm/EXAMPLE_PRODUCT_PAGE_PLACEHOLDER_URL",
    "description": "Cobalt XT ICDs are used to treat sudden cardiac arrest and abnormal heart rhythms.",
    "type": "ICD",
    "models": ["DDPA2D1", "DDPA2D4", "DVPA2D1", "DVPA2D4"]
  },
  {
    "name": "Azure MRI SureScan",
    "url": "https://www.medtronic.com/en-us/healthcare-professionals/products/cardiac-rhythm/EXAMPLE_PRODUCT_PAGE_PLACEHOLDER_URL",
    "description": "The Azure™ MRI SureScan™ pacemaker manages atrial fibrillation (AF) in pacemaker patients with tablet-based programming and app-based remote monitoring.",
    "type": "Pacer",
    "models": ["W3DR01", "W3SR01", "W2DR01", "W1SR01"]
  }
]
```
