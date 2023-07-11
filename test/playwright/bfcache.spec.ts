import { test, expect } from "@playwright/test";

test("Bf cache is working with persistent atom", async ({ page }) => {
  await page.goto("http://localhost:4173");

  await page.click("a");

  await page.waitForSelector("button");

  //Add item to local storage
  await page.getByTestId("buttonAtom").click();

  await page.goBack();

  await page.waitForLoadState("networkidle");

  let preAtom = page.getByTestId("atom");
  let inner = await preAtom.innerText();

  let parsed = JSON.parse(inner);

  //Expect to sync on pageshow event
  expect(parsed.length).toEqual(1);
});

test("Bf cache is working with persistent map", async ({ page }) => {
  await page.goto("http://localhost:4173");

  await page.click("a");

  await page.waitForSelector("button");

  //Add item to local storage
  await page.getByTestId("buttonMap").click();

  await page.goBack();

  await page.waitForLoadState("networkidle");

  let preAtom = page.getByTestId("map");
  let inner = await preAtom.innerText();

  let parsed = JSON.parse(inner);

  //Expect to sync on pageshow event
  expect(parsed.a).toBeDefined();
});
