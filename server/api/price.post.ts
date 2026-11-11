export default defineEventHandler(async (event) => {
  return computePrice(validatePriceInput(await readBody(event)))
})
