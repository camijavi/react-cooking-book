import { atom, useAtom } from "jotai";

// Ordered list of texture filenames in public/textures (cover, pages 2–39, back)
const pictures = [
  "book-cover.png",
  ...Array.from({ length: 38 }, (_, i) => `${i + 2}.png`),
  "book-back.png",
];

export const pageAtom = atom(0);
export const pages = [{ front: pictures[0], back: pictures[1] }];
for (let i = 2; i < pictures.length - 1; i += 2) {
  pages.push({
    front: pictures[i],
    back: pictures[i + 1],
  });
}
pages.push({
  front: pictures[pictures.length - 2],
  back: pictures[pictures.length - 1],
});

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);

  return (
    <>
      <main className=" pointer-events-none select-none z-10 fixed  inset-0  flex justify-between flex-col">
        <a
          className="pointer-events-auto mt-10 ml-10"
          // href="https://lessons.wawasensei.dev/courses/react-three-fiber"
        ></a>
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                  index === page
                    ? "bg-white/90 text-black"
                    : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Portada" : `Página ${index}`}
              </button>
            ))}
            <button
              className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                page === pages.length
                  ? "bg-white/90 text-black"
                  : "bg-black/30 text-white"
              }`}
              onClick={() => setPage(pages.length)}
            >
              Contraportada
            </button>
          </div>
        </div>
      </main>
    </>
  );
};
