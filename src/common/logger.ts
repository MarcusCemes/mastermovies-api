const colour = process.stdout.isTTY && process.stderr.isTTY;

const [RED, GREEN, BLUE, YELLOW, WHITE, RESET] = [
  "41;97",
  "32",
  "94",
  "103;30",
  "90",
  "0"
].map(i => colour ? "\u001b[" + i + "m" : "");

function pad(number: number, digits: number = 2): string {
  const stringNumber = number.toString();
  let padding = digits - stringNumber.length;
  padding = padding < 0 ? 0 : padding;
  return "0".repeat(padding) + Math.floor(number);
}

function time(): string {
  const date = new Date();
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

export function success(message: string, callback?: (err: Error) => void): void {
  process.stdout.write(`${WHITE} ${time()} ${RESET} ${GREEN}success${RESET}  ${message}\n`, callback);
}

export function error(message: string, callback?: (err: Error) => void): void {
  process.stderr.write(`${WHITE} ${time()} ${RESET}${RED}  error  ${RESET} ${message}\n`, callback);
}

export function info(message: string, callback?: (err: Error) => void): void {
  process.stdout.write(`${WHITE} ${time()} ${RESET}  ${BLUE}info${RESET}    ${message}\n`, callback);
}

export function warning(message: string, callback?: (err: Error) => void): void {
  process.stderr.write(`${WHITE} ${time()} ${RESET}${YELLOW} warning ${RESET} ${message}\n`, callback);
}