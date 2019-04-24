const isTTY = process.stdout.isTTY && process.stderr.isTTY;

const [ERROR, SUCCESS, INFO, WARN, WAIT, GREY, RESET] = [
  "41;97",
  "32",
  "94",
  "103;30",
  "36",
  "90",
  "0"
].map(i => isTTY ? "\u001b[" + i + "m" : "");

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
  return `${GREY} ${hours}:${minutes}:${seconds} ${RESET}`;
}

function center(text: string, width: number): string {
  if (text.length >= width) {
    return text.substring(0, width + 1);
  }
  const sidePadding = (width - text.length) / 2;
  const leftPadding = " ".repeat(Math.floor(sidePadding));
  const rightPadding = " ".repeat(Math.ceil(sidePadding));
  return leftPadding + text + rightPadding;
}

let shouldOverwrite = false;

export function ok(msg: string, callback?: (err?: Error) => any): void {
  _log(msg, "ok", SUCCESS, process.stdout, callback);
}

export function info(msg: string, callback?: (err?: Error) => any): void {
  _log(msg, "info", INFO, process.stdout, callback);
}

export function warn(msg: string, callback?: (err?: Error) => any): void {
  _log(msg, "warn", WARN, process.stderr, callback);
}

export function error(msg: string, callback?: (err?: Error) => any): void {
  _log(msg, "error", ERROR, process.stderr, callback);
}

export function noStatus(msg: string, callback?: (err?: Error) => any): void {
  _log(msg, "", "", process.stdout, callback);
}

export function wait(msg: string, callback?: (err?: Error) => any): void {
  _log(msg, "wait", WAIT, process.stdout, callback);
  shouldOverwrite = true;
}

function _overwrite(stream: NodeJS.WriteStream): void {
  if (stream.isTTY && shouldOverwrite === true) {
    stream.write("\x1b[A\x1b[K");
    shouldOverwrite = false;
  }
}

function _log(msg: string, status: string, colour: string, stream: NodeJS.WriteStream, callback?: (err?: Error) => void): void {
  _overwrite(stream);
  const indentedMsg = msg.replace("\n", "\n" + " ".repeat(20));
  stream.write(`${time()} ${colour}${center(status, 8)}${RESET} ${indentedMsg}\n`, callback);
}