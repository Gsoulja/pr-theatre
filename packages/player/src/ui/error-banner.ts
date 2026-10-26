/** Says what went wrong on the page itself: the viewer may not know the console exists. */
export function showError(host: HTMLElement, message: string): void {
  host.textContent = message;
  host.hidden = false;
}
