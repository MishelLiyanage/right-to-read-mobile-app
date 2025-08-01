import { ImageLoadEventData } from 'expo-image';
import { useCallback, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';

export interface ImageDimensions {
  width: number;
  height: number;
}

export function useImageLayout() {
  const [sourceImageDimensions, setSourceImageDimensions] = useState<ImageDimensions | null>(null);
  const [containerDimensions, setContainerDimensions] = useState<ImageDimensions | null>(null);

  const onImageLoad = useCallback((event: ImageLoadEventData) => {
    const { width, height } = event.source;
    setSourceImageDimensions({ width, height });
    console.log(`Source image dimensions: ${width}x${height}`);
  }, []);

  const onImageLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
    console.log(`Image container layout: ${width}x${height}`);
  }, []);

  // Calculate the actual rendered image size with contentFit="contain"
  const getRenderedImageSize = useCallback((): ImageDimensions | null => {
    if (!sourceImageDimensions || !containerDimensions) {
      return null;
    }

    const sourceAspectRatio = sourceImageDimensions.width / sourceImageDimensions.height;
    const containerAspectRatio = containerDimensions.width / containerDimensions.height;

    let renderedWidth: number;
    let renderedHeight: number;

    if (sourceAspectRatio > containerAspectRatio) {
      // Image is wider relative to container, so width is constrained
      renderedWidth = containerDimensions.width;
      renderedHeight = containerDimensions.width / sourceAspectRatio;
    } else {
      // Image is taller relative to container, so height is constrained
      renderedHeight = containerDimensions.height;
      renderedWidth = containerDimensions.height * sourceAspectRatio;
    }

    const result = { width: renderedWidth, height: renderedHeight };
    console.log(`Calculated rendered image size: ${renderedWidth}x${renderedHeight}`);
    return result;
  }, [sourceImageDimensions, containerDimensions]);

  // Calculate the offset for center-aligned image
  const getImageOffset = useCallback(() => {
    if (!sourceImageDimensions || !containerDimensions) {
      return { x: 0, y: 0 };
    }

    const renderedSize = getRenderedImageSize();
    if (!renderedSize) {
      return { x: 0, y: 0 };
    }

    // Calculate how much space is left on each side
    const offsetX = (containerDimensions.width - renderedSize.width) / 2;
    const offsetY = (containerDimensions.height - renderedSize.height) / 2;

    console.log(`Image offset: x=${offsetX}, y=${offsetY}`);
    return { x: offsetX, y: offsetY };
  }, [sourceImageDimensions, containerDimensions, getRenderedImageSize]);

  return {
    sourceImageDimensions,
    containerDimensions,
    getRenderedImageSize,
    getImageOffset,
    onImageLoad,
    onImageLayout
  };
}
