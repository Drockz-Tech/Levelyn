import { Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export async function exportView(ref: any, filename = 'levelyn-card.png', options?: { width?: number; height?: number; transparent?: boolean }) {
  if (Platform.OS === 'web') {
    // Web Fallback: Try to serialize and download as PNG/SVG
    try {
      const svgElement = ref.current?.querySelector('svg');
      if (!svgElement) {
        console.warn('SVG element not found for export');
        return;
      }
      
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = options?.width || svgElement.clientWidth || 1080;
        canvas.height = options?.height || svgElement.clientHeight || 1920;
        const context = canvas.getContext('2d');
        if (context) {
          if (!options?.transparent) {
            context.fillStyle = '#05040A';
            context.fillRect(0, 0, canvas.width, canvas.height);
          } else {
            context.clearRect(0, 0, canvas.width, canvas.height);
          }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          try {
            const png = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = png;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          } catch (e) {
            // Fallback to vector SVG download
            downloadSvgFile(svgBlob, filename.replace('.png', '.svg'));
          }
        }
        URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch (err) {
      console.warn('Web PNG capture fallback failed, trying SVG download', err);
      try {
        const svgElement = ref.current?.querySelector('svg');
        if (svgElement) {
          const svgString = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          downloadSvgFile(svgBlob, filename.replace('.png', '.svg'));
        }
      } catch (svgErr) {
        console.error('Web SVG download failed:', svgErr);
      }
    }
    return;
  }

  // Native platform implementation
  const captureOpts: any = { format: 'png', quality: 0.95 };
  if (options?.width) captureOpts.width = options.width;
  if (options?.height) captureOpts.height = options.height;
  const uri = await captureRef(ref, captureOpts);
  const dest = FileSystem.cacheDirectory + filename;
  await FileSystem.copyAsync({ from: uri, to: dest });
  await Sharing.shareAsync(dest);
}

function downloadSvgFile(blob: Blob, filename: string) {
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobURL;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(blobURL);
}

