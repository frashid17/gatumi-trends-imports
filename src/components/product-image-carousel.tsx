"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  images: string[];
  alt: string;
  soldOut: boolean;
  sizes: string;
  priority?: boolean;
};

export function ProductImageCarousel({ images, alt, soldOut, sizes, priority }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const i = Math.round(el.scrollLeft / w);
    setIndex(Math.min(Math.max(i, 0), images.length - 1));
  }, [images.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll, images]);

  if (images.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--foreground-muted)]">No image</div>
    );
  }

  if (images.length === 1) {
    return (
      <>
        <Image
          src={images[0]}
          alt={alt}
          fill
          className={soldOut ? "object-cover opacity-90 saturate-[0.85]" : "object-cover"}
          priority={priority}
          sizes={sizes}
        />
      </>
    );
  }

  return (
    <>
      <div
        ref={scrollRef}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <div key={`${i}-${src}`} className="relative h-full min-w-full shrink-0 snap-center">
            <Image
              src={src}
              alt={`${alt} — ${i + 1} of ${images.length}`}
              fill
              className={soldOut ? "object-cover opacity-90 saturate-[0.85]" : "object-cover"}
              priority={priority && i === 0}
              sizes={sizes}
            />
          </div>
        ))}
      </div>
      <div
        className="pointer-events-none absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5 px-2"
        aria-hidden
      >
        {images.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-[width,background] duration-200 ${
              i === index ? "w-5 bg-[var(--gold)]" : "w-1.5 bg-[var(--foreground-muted)]/45"
            }`}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Image {index + 1} of {images.length}. Swipe horizontally to see more.
      </p>
    </>
  );
}
