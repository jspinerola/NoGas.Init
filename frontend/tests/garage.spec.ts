// http://localhost:3000/garage
import { test, expect } from "./auth.setup"
const uniqueName = `Betsy-${Math.floor(Math.random() * 10000)}`
const mockVehicle = {
  id: 1,
  name: uniqueName,
  year: 2020,
  make: "Toyota",
  model: "Corolla",
  licensePlate: "ABC-1234",
  miles: 15000,
  vinPrefix: "1NXBR32E",
  mpg: 32,
  nextService: new Date().toISOString(),
  isDefault: true,
}

test.describe("Garage Page", () => {
  test("User should be able to add a vehicle and see it displayed on the dashboard", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/garage")
    await page.click("text=Add a Car")

    // Use placeholders or labels with proper relationship
    await page.getByPlaceholder("e.g., Bob").fill(mockVehicle.name)
    await page.getByPlaceholder("e.g., Nissan").fill(mockVehicle.make)
    await page.getByPlaceholder("e.g., Kicks").fill(mockVehicle.model)
    await page.getByPlaceholder("2023").fill(mockVehicle.year.toString())
    await page.getByPlaceholder("45678").fill(mockVehicle.miles.toString())
    await page.getByPlaceholder("ABC 1234").fill(mockVehicle.licensePlate)
    await page.getByPlaceholder("1HGBH41JXMN109186").fill(mockVehicle.vinPrefix)
    await page.getByPlaceholder("28.5").fill(mockVehicle.mpg.toString())

    await page.getByRole("button", { name: "Add Vehicle" }).click()
    await page.waitForTimeout(1000) 

    // Verify the vehicle appears on garage
    await expect(page.getByText(`Vehicle: ${mockVehicle.name}`)).toBeVisible()
  })
})
