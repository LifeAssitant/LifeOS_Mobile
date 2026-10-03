let entered = false;

export function hasEnteredChat() {
  return entered;
}

export function enterChat() {
  entered = true;
}
