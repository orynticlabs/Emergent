"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";

export const HeroParallax = ({ products }) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1000]), springConfig);
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -1000]), springConfig);
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [15, 0]), springConfig);
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2, 1]), springConfig);
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), springConfig);
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-700, 500]), springConfig);

  return (
    <div
      ref={ref}
      className="relative flex h-[300vh] flex-col self-auto overflow-hidden py-40 antialiased [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header />
      <motion.div style={{ rotateX, rotateZ, translateY, opacity }}>
        <motion.div className="mb-20 flex flex-row-reverse space-x-20 space-x-reverse">
          {firstRow.map((product) => (
            <ProductCard product={product} translate={translateX} key={product.id ?? product.title} />
          ))}
        </motion.div>
        <motion.div className="mb-20 flex flex-row space-x-20">
          {secondRow.map((product) => (
            <ProductCard product={product} translate={translateXReverse} key={product.id ?? product.title} />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-20 space-x-reverse">
          {thirdRow.map((product) => (
            <ProductCard product={product} translate={translateX} key={product.id ?? product.title} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

const Header = () => (
  <div className="relative left-0 top-0 mx-auto w-full max-w-7xl px-6 py-20 md:px-10 md:py-40">
    <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-orange">Our Work</p>
    <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight text-white md:text-5xl">
      Products We&apos;ve Shipped <br /> and Are Shipping
    </h1>
    <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/55 md:text-xl">
      A closer look at the platforms, products, and engagements our team has delivered — from
      internal tools to client production systems.
    </p>
  </div>
);

const ProductCard = ({ product, translate }) => (
  <motion.div
    style={{ x: translate }}
    whileHover={{ y: -20 }}
    className="group/product relative h-96 w-[30rem] shrink-0"
  >
    <Link href={product.link} className="block group-hover/product:shadow-2xl">
      <img
        src={product.thumbnail}
        height="600"
        width="600"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-left-top"
        alt={product.title}
      />
    </Link>
    <div className="pointer-events-none absolute inset-0 h-full w-full bg-black opacity-0 group-hover/product:opacity-70" />
    <h2 className="absolute bottom-4 left-4 font-display text-lg font-bold text-white opacity-0 transition-opacity duration-300 group-hover/product:opacity-100">
      {product.title}
    </h2>
  </motion.div>
);
