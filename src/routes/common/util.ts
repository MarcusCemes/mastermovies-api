/** Verify if the data is a decodable hex string */
export function isValidHex(data: string): boolean {
  return (
    typeof data === "string" &&
    /^[0-9a-f]*$/.test(data) &&
    data.length % 2 === 0
  );
}
