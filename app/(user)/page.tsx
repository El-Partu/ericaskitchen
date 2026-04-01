import HeroSection from "@/components/shared/HeroSection";
import AboutSection from "@/components/shared/AboutSection";
import MenuOfTheDay from "@/components/shared/MenuOfTheDay";
import MenuGrid from "@/components/shared/MenuGrid";
import TestimonialsSection from "@/components/shared/TestimonialsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection
        title={
          <>
            Delicious Food
            <br />
            Is Waiting
            <br />
            For You
          </>
        }
        subtitle="Authentic Ghanaian flavours, made fresh daily. Order online or dine in."
        ctaLabel="View Menu"
        ctaHref="/menu"
      />
      <AboutSection />
      <MenuOfTheDay />
      <MenuGrid />
      <TestimonialsSection />
    </>
  );
}
