/**
 * Utility function to decode HTML entities in strings
 * This handles cases where metadata comes with HTML entities like &apos; instead of '
 */
export const decodeHtmlEntities = (text: string): string => {
  if (!text) return text;
  
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};