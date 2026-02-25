/**
 * Utility to trigger a direct browser download of a file from a URL.
 * It uses fetch to get the blob and then creates a temporary link to trigger the download.
 * @param {string} url - The URL of the file to download.
 * @param {string} filename - The name to save the file as.
 */
export const triggerDirectDownload = async (url, filename) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors', // Ensure CORS is handled if the server supports it
        })

        if (!response.ok) throw new Error('Network response was not ok')

        const blob = await response.blob()
        const blobUrl = window.URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = blobUrl
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()

        // Clean up
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
        console.error('Download failed:', error)
        // Fallback: open in new tab if direct download fails due to CORS or other issues
        window.open(url, '_blank')
    }
}
