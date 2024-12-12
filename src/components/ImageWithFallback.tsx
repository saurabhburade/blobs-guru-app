import Image, { ImageProps } from "next/image";
import { useEffect } from "react";
import { useState } from "react";

interface ExtendedImageProps extends ImageProps {
  fallback?: string;
}
const ImageWithFallback = ({
  fallback = "https://solutions-image-fallback.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffallback.7b9af9ee.jpg&w=640&q=75",
  alt,
  src,
  ...props
}: ExtendedImageProps) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  return (
    <Image
      alt={alt}
      onError={() => setError(true)}
      src={error ? fallback : src}
      {...props}
    />
  );
};
export default ImageWithFallback;
