// Offers a Blob to the user as a downloaded file
export function saveBlob(blob: Blob, filename: string): void {
    const url: string = URL.createObjectURL(blob);
    const link: HTMLAnchorElement = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
