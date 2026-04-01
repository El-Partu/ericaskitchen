"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { HeroSlide } from "@/types";

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative h-[500px] w-full sm:h-[600px] lg:h-[750px]">
      {/* Rounded container for the image + overlay */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[50px]">
        {/* Background Image */}
        <Image
          src={slide.image}
          alt={slide.title?.replace("\\n", " ") ?? ""}
          fill
          className="object-cover transition-opacity duration-500"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 lg:px-12">
        <div className="max-w-[900px]">
          <h1 className="font-heading text-4xl font-black leading-tight text-white sm:text-5xl lg:text-[64px] lg:leading-[1.1]">
            {slide.title?.split("\\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < (slide.title?.split("\\n").length ?? 0) - 1 && <br />}
              </span>
            ))}
          </h1>
          <div className="mt-10">
            <Button href={slide.ctaHref} size="lg">
              {slide.ctaLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
            aria-label="Previous slide"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
            aria-label="Next slide"
          >
            <ChevronRight size={28} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-14 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-3 w-3 rounded-full transition-colors ${
                  i === current ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
