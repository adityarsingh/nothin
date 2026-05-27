// Recursive function to extract plain text from TipTap JSON
export function extractPlainText(node: any): string {
  if (!node) return "";
  
  // If it's a text node, return its text
  if (node.type === "text" && node.text) {
    return node.text;
  }

  // If it has content, recurse and join with spaces (or newlines for block nodes)
  if (node.content && Array.isArray(node.content)) {
    const text = node.content.map(extractPlainText).join("");
    // Add newlines after block elements
    if (["paragraph", "heading", "blockquote", "bulletList", "orderedList", "listItem"].includes(node.type)) {
      return text + "\n";
    }
    return text;
  }

  return "";
}
