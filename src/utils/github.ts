/**
 * Converts GitHub web URL to raw.githubusercontent.com URL and fetches file content.
 */
export function convertToRawGitHubUrl(urlInput: string): string {
  let urlStr = urlInput.trim();
  if (!urlStr) {
    throw new Error('Please enter a GitHub URL.');
  }

  // Handle standard github.com URLs
  if (urlStr.includes('github.com')) {
    // Example: https://github.com/facebook/react/blob/main/packages/react/src/React.js
    // Replace domain
    urlStr = urlStr.replace('github.com', 'raw.githubusercontent.com');
    // Remove /blob/
    urlStr = urlStr.replace('/blob/', '/');
  }

  // Basic validation that it looks like a valid http/https URL
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('URL must use HTTP or HTTPS protocol.');
    }
  } catch (err) {
    throw new Error('Invalid URL format. Please paste a valid GitHub file URL.');
  }

  return urlStr;
}

export async function fetchGitHubFile(urlInput: string): Promise<string> {
  const rawUrl = convertToRawGitHubUrl(urlInput);

  const response = await fetch(rawUrl);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('File not found (404). Check repository visibility or file path.');
    }
    throw new Error(`Failed to fetch file from GitHub (${response.status} ${response.statusText}).`);
  }

  const text = await response.text();
  if (!text.trim()) {
    throw new Error('The fetched GitHub file is empty.');
  }

  return text;
}
