import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import { createPageMetadata } from "@/config/seo";
import { getProject, projects } from "@/data/projects";

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export const generateStaticParams = () =>
  projects.map((project) => ({ slug: project.slug }));

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return {};
  }

  return createPageMetadata({
    title: project.title,
    description: project.summary,
    path: `/work/${project.slug}`,
    image: {
      url: project.image,
      alt: project.imageAlt,
    },
  });
}

export default async function ProjectPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const currentIndex = projects.findIndex((item) => item.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  return (
    <main className="pb-24 pt-36 md:pt-44">
      <Container>
        <Link
          href="/work"
          className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-(--muted) transition hover:text-(--primary)"
        >
          ← All work
        </Link>

        <header className="grid gap-8 pb-12 pt-8 md:grid-cols-[1fr_0.55fr] md:items-end md:pb-16">
          <div>
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-(--primary)">
              {project.category} · {project.year}
            </p>
            <h1 className="max-w-5xl font-heading text-6xl font-black uppercase leading-[0.9] tracking-[-0.04em] md:text-8xl lg:text-9xl">
              {project.title}
            </h1>
          </div>
          <div className="md:pb-2">
            <p className="max-w-xl text-lg leading-7 text-(--muted) md:text-xl">
              {project.summary}
            </p>
            <Link
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-(--foreground) px-5 py-3 text-sm font-bold uppercase tracking-wide text-(--background) transition hover:bg-(--primary) hover:text-black"
            >
              View live site <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </header>

        <div className="relative aspect-3/2 overflow-hidden rounded-xl bg-(--surface)">
          <Image
            src={project.image}
            alt={project.imageAlt}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
        </div>

        <section className="mt-5 grid gap-10 rounded-xl border border-black/5 bg-[color-mix(in_srgb,var(--foreground)_4%,var(--background))] p-6 md:grid-cols-[1.25fr_0.75fr] md:p-10 lg:p-14">
          <div>
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-(--primary)">
              About the project
            </p>
            <h2 className="font-heading text-4xl font-black uppercase md:text-5xl">
              The brief
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-(--muted) md:text-lg">
              {project.about}
            </p>
          </div>
          <dl className="grid grid-cols-2 content-start gap-x-5 gap-y-8 border-t border-current/10 pt-7 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            <div>
              <dt className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-(--muted)">
                Status
              </dt>
              <dd className="mt-2 font-heading text-3xl font-black uppercase">
                {project.status}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-(--muted)">
                Team
              </dt>
              <dd className="mt-2 font-heading text-3xl font-black uppercase">
                {project.team}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-(--muted)">
                Services
              </dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {project.services.map((service) => (
                  <span
                    key={service}
                    className="rounded-full border border-current/12 px-3 py-1.5 text-sm text-(--muted)"
                  >
                    {service}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </section>

        <section className="grid gap-12 py-20 md:grid-cols-2 md:gap-20 md:py-28">
          <div>
            <span className="font-mono text-xs font-semibold text-(--primary)">
              01
            </span>
            <h2 className="mt-4 font-heading text-4xl font-black uppercase md:text-6xl">
              The challenge
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-(--muted)">
              {project.challenge}
            </p>
          </div>
          <div className="md:pt-24">
            <span className="font-mono text-xs font-semibold text-(--primary)">
              02
            </span>
            <h2 className="mt-4 font-heading text-4xl font-black uppercase md:text-6xl">
              The outcome
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-(--muted)">
              {project.outcome}
            </p>
          </div>
        </section>

        <Link
          href={`/work/${nextProject.slug}`}
          className="group block border-y border-current/10 py-10 md:py-14"
        >
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-(--muted)">
            Next project
          </span>
          <span className="mt-3 flex items-center justify-between gap-6 font-heading text-4xl font-black uppercase transition group-hover:text-(--primary) md:text-7xl">
            {nextProject.title}
            <i className="font-sans text-3xl font-normal not-italic md:text-5xl">
              ↗
            </i>
          </span>
        </Link>
      </Container>
    </main>
  );
}
