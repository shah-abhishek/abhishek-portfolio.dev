
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Eye, Star, Loader2, Lock } from "lucide-react";
import { fetchGithubRepos, GITHUB_USERNAME } from "@/lib/github";

// Portfolio projects, shown first. `repo` links an entry to its GitHub repo so
// live data (URL, stars, homepage) comes from the API when available.
const featuredProjects = [
  {
    title: "AI-Powered Dubai Business Assistant (RAG System)",
    description: "An intelligent chatbot built on RAG architecture with hybrid search (database + semantic + web search), conversational memory, personalized responses, and file-based Q&A workflows. Backend powered by FastAPI, pgvector, and automated ingestion pipelines with LLM-based response generation.",
    image: "/projects/github.png",
    tags: ["RAG", "FastAPI", "pgvector", "LLM", "Hybrid Search"],
    liveLink: "#",
    githubLink: "https://github.com/shah-abhishek/rag-bot",
    repo: "rag-bot",
  },
  {
    title: "HRMS Management Portal",
    description: "A full-featured HRMS management portal with employee management, attendance tracking, leave management, and payroll processing. Built with Next.js, TailwindCSS, and MongoDB.",
    image: "/projects/hrms.png",
    tags: ["Next.js", "React", "TailwindCSS", "Antigravity"],
    liveLink: "https://internalhrms.developerbudy.in/",
    private: true,
  },
  {
    title: "Task Management App",
    description: "A collaborative task management tool with project boards, progress tracking, and real-time updates using React and Firebase.",
    image: "/projects/github.png",
    tags: ["React", "Firebase", "Framer Motion"],
    liveLink: "#",
    githubLink: "#",
  },
  {
    title: "Portfolio Website",
    description: "My personal portfolio site built using Vite, React, and TailwindCSS to showcase projects and skills.",
    image: "/projects/portfolio.png",
    tags: ["React", "Vite", "TailwindCSS", "Framer Motion"],
    liveLink: "https://abhishekportfolio.developerbudy.com",
    githubLink: "https://github.com/shah-abhishek/abhishek-portfolio.dev",
    repo: "abhishek-portfolio.dev",
  },
  {
    title: "Gaming Site",
    description: "A web platform to explore and play simple games. Built with HTML, CSS, and JavaScript.",
    image: "/projects/gaming-site.png",
    tags: ["JavaScript", "HTML", "CSS"],
    liveLink: "https://developerbudy.com/",
    githubLink: "https://github.com/shah-abhishek/arcade-hub-ui",
    repo: "arcade-hub-ui",
  },
  {
    title: "NPM Trend UI",
    description: "A React-based dashboard to visualize trends of npm packages. Includes filtering and charting capabilities.",
    image: "/projects/github.png",
    tags: ["React", "TypeScript", "Chart.js"],
    liveLink: "#",
    private: true,
  },
  {
    title: "NPM Trend API",
    description: "The backend API for npm trend analysis using Node.js and Express, serves data for the UI dashboard.",
    image: "/projects/github.png",
    tags: ["Node.js", "Express", "REST API"],
    liveLink: "#",
    private: true,
  },
  {
    title: "Express Passport Auth",
    description: "A starter template demonstrating user authentication with Passport.js in an Express app.",
    image: "/projects/github.png",
    tags: ["Express", "Passport.js", "Authentication"],
    liveLink: "#",
    githubLink: "https://github.com/shah-abhishek/auth-demo-express",
    repo: "auth-demo-express",
  },
  {
    title: "Download Chart as Image",
    description: "A utility to export charts and graphs as images or PDFs using Vega-Lite.",
    image: "/projects/github.png",
    tags: ["Vega-Lite", "Export", "HTML"],
    liveLink: "#",
    githubLink: "https://github.com/shah-abhishek/chart-download-tool-or-vega-lite-exporter",
    repo: "chart-download-tool-or-vega-lite-exporter",
  },
];

// Repos never shown in the "more from GitHub" list.
const EXCLUDED_REPOS = new Set(["github-profile-config"]);

const hasLink = (url) => Boolean(url) && url !== "#";

const prettifyRepoName = (name) =>
  name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function mergeWithRepo(project, repo) {
  if (!repo) return project;
  return {
    ...project,
    githubLink: repo.htmlUrl,
    liveLink: hasLink(project.liveLink) ? project.liveLink : repo.homepage || "#",
    stars: repo.stars,
  };
}

function repoToProject(repo) {
  return {
    title: prettifyRepoName(repo.name),
    description: repo.description || "No description provided.",
    image: "/projects/github.png",
    tags: [repo.language, ...repo.topics].filter(Boolean).slice(0, 5),
    liveLink: repo.homepage || "#",
    githubLink: repo.htmlUrl,
    stars: repo.stars,
  };
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Projects() {
  const [repos, setRepos] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [showAll, setShowAll] = useState(false);
  const gridRef = useRef(null);
  const gridInView = useInView(gridRef, { once: true });

  useEffect(() => {
    const controller = new AbortController();
    fetchGithubRepos(controller.signal)
      .then((data) => {
        setRepos(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, []);

  const { featured, moreRepos } = useMemo(() => {
    const byName = new Map((repos || []).map((r) => [r.name.toLowerCase(), r]));
    const featuredNames = new Set(
      featuredProjects.filter((p) => p.repo).map((p) => p.repo.toLowerCase())
    );
    return {
      featured: featuredProjects.map((p) =>
        mergeWithRepo(p, p.repo && byName.get(p.repo.toLowerCase()))
      ),
      moreRepos: (repos || [])
        .filter(
          (r) =>
            !r.fork &&
            !r.archived &&
            !EXCLUDED_REPOS.has(r.name) &&
            !featuredNames.has(r.name.toLowerCase())
        )
        .map(repoToProject),
    };
  }, [repos]);

  const projects = showAll ? [...featured, ...moreRepos] : featured;

  return (
    <section id="projects" className="py-20 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            My <span className="gradient-text">Projects</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            A selection of projects I've worked on, showcasing my skills and passion for development.
          </motion.p>
        </div>

        {/* Driven by `animate` rather than `whileInView`: cards added later via
            "Show more" only inherit the parent's `animate` variant. */}
        <motion.div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate={gridInView ? "show" : "hidden"}
        >
          {projects.map((project) => (
            <motion.div
              key={project.title}
              variants={item}
              className="h-full"
            >
              <Card className="flex flex-col h-full overflow-hidden shadow-lg card-hover service-card">
                <div className="aspect-video overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" alt={project.title} src={project.image} />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    {typeof project.stars === "number" && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                        <Star className="h-4 w-4" /> {project.stars}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{project.description}</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 p-4 border-t">
                  {project.private && (
                    <span
                      className="flex items-start gap-1 mr-auto text-xs text-muted-foreground"
                      title="This is a private project. The source code and live demo may not be publicly accessible."
                    >
                      <Lock className="h-3.5 w-3.5 shrink-0 mt-px" />
                      <span>Private project — code and live demo may not be publicly accessible.</span>
                    </span>
                  )}
                  {hasLink(project.liveLink) && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-1" /> Live
                      </a>
                    </Button>
                  )}
                  {hasLink(project.githubLink) && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-1" /> Code
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex flex-col items-center gap-3 mt-12">
          {status === "loading" && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading repositories from GitHub…
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-muted-foreground">
              Couldn't load live data from GitHub right now.
            </p>
          )}
          {status === "ready" && moreRepos.length > 0 && (
            <Button variant="outline" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show featured only" : `Show ${moreRepos.length} more from GitHub`}
            </Button>
          )}
          <Button variant="link" asChild>
            <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-1" /> View all on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
