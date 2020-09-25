export function isInsideIframe(): boolean {
  return window.location !== window.parent.location;
}

export default {
  isInsideIframe,
};
