import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { APP } from "@/configs/consts/app.const";
import { images } from "@/configs/paths/images.path";
import { pages } from "@/configs/paths/pages.path";

const benefits = [
  "План переезда по шагам",
  "Коробки и вещи без путаницы",
  "Общий список для всей семьи",
];

export function LandingPage() {
  return (
    <main className="landing-page min-h-screen overflow-hidden bg-[#F5F3EE] text-[#1D2923]">
      <header className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 sm:px-8 2xl:max-w-[1440px]">
        <div className="landing-reveal landing-delay-1 w-[min(12rem,53vw)] sm:w-52 [&_a]:w-full [&_img]:h-auto [&_img]:w-full">
          <Logo href={pages.ROOT} />
        </div>
        <Link
          href={pages.LOGIN}
          className="landing-reveal landing-delay-2 rounded-[7px] px-4 py-3 text-sm font-bold text-[#42664D] transition-colors hover:bg-[#E2E9DD] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#D96B4C]"
        >
          Войти
        </Link>
      </header>

      <section className="mx-auto grid max-w-[1240px] items-center gap-5 px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-12 lg:min-h-[440px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:pb-20 lg:pt-4 2xl:max-w-[1440px] 2xl:gap-14">
        <div className="relative z-10 max-w-[570px]">
          <h1 className="landing-reveal landing-delay-2 max-w-[550px] text-[clamp(3rem,7.5vw,6rem)] leading-[0.96] font-extrabold tracking-[-0.065em]">
            Переезд
            <br />
            по плану
          </h1>
          <p className="landing-reveal landing-delay-3 mt-6 max-w-[460px] text-base leading-7 text-[#4E5752] sm:text-lg sm:leading-8">
            {APP.NAME} собирает задачи, вещи и коробки в одном понятном месте.
          </p>
          <div className="landing-reveal landing-delay-4 mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={pages.LOGIN}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[7px] bg-[#1D2923] px-5 text-sm font-bold text-white transition-[background-color,transform] hover:-translate-y-px hover:bg-[#42664D] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#D96B4C]"
            >
              Начать планирование
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>

        <div className="landing-reveal landing-reveal-image landing-delay-3 mx-auto w-full max-w-[650px]">
          <Image
            src={images.MOVING_BOXES}
            alt="Помощник MoverMate несёт коробки для переезда"
            width={1300}
            height={640}
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="block h-auto w-full"
          />
        </div>
      </section>

      <section
        id="how-it-works"
        className="bg-[#E8E2D5]"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto grid max-w-[1240px] items-center gap-8 px-5 py-16 sm:px-8 sm:py-[76px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-24 2xl:max-w-[1440px]">
          <div className="landing-reveal landing-reveal-image landing-delay-2 order-2 relative mx-auto aspect-[1.94] w-full max-w-[560px] sm:order-1">
            <Image
              src={images.BOXES_READY}
              alt="Готовые коробки и довольный помощник MoverMate"
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-contain"
            />
          </div>
          <div className="order-1 sm:order-2">
            <h2
              id="how-it-works-heading"
              className="landing-reveal landing-delay-2 max-w-[520px] text-4xl leading-[1.02] font-extrabold tracking-[-0.055em] sm:text-5xl"
            >
              От первого списка до последней коробки
            </h2>
            <p className="landing-reveal landing-delay-3 mt-5 max-w-[480px] text-base leading-7 text-[#4E5752]">
              Держите план, вещи и задачи в одном месте — и переезжайте в своём
              темпе.
            </p>
            <ul className="landing-reveal landing-delay-4 mt-7 grid gap-4">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 text-sm font-semibold sm:text-base"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#42664D] text-white">
                    <Check aria-hidden="true" className="size-4" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="landing-reveal landing-delay-2 mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-3 px-5 py-7 text-sm text-[#5C6560] sm:flex-row sm:items-center sm:px-8 2xl:max-w-[1440px]">
        <Logo small />
        <p>MoverMate by team №12</p>
      </footer>
    </main>
  );
}
