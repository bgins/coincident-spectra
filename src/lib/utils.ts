export const halve = <T>(array: T[]): { firstHalf: T[]; secondHalf: T[] } => {
  const half = Math.ceil(array.length / 2)
  const firstHalf = array.slice(0, half)
  const secondHalf = array.slice(-half)

  return { firstHalf, secondHalf }
}