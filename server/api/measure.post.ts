export default defineEventHandler(async (event) => {
  const { address } = validateMeasureInput(await readBody(event))
  return measureRoof(address)
})
