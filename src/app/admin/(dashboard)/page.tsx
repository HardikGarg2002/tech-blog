import { loadDashboardStats } from "@/actions/admin-overview";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import {
  FileText,
  CheckCircle,
  Clock,
  FolderOpen,
  Tag,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const result = await loadDashboardStats();

  if (!result.ok) {
    return <div className="text-sm text-destructive">Failed to load stats: {result.error}</div>;
  }

  const stats = result.data;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your content</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Posts" value={stats.totalPosts} icon={FileText} accent="text-violet-500" />
        <StatCard
          title="Published"
          value={stats.publishedPosts}
          icon={CheckCircle}
          accent="text-green-500"
          description="Live on site"
        />
        <StatCard
          title="Drafts"
          value={stats.draftPosts}
          icon={Clock}
          accent="text-amber-500"
          description="In progress"
        />
        <StatCard
          title="Projects"
          value={stats.totalProjects}
          icon={FolderOpen}
          accent="text-blue-500"
          description={`${stats.activeProjects} active`}
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          icon={Tag}
          accent="text-pink-500"
        />
        <StatCard
          title="Media Files"
          value={stats.totalMedia}
          icon={ImageIcon}
          accent="text-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border">
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Recent Posts
            </p>
            <Link
              href="/admin/posts"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {stats.recentPosts.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No posts yet.{" "}
                <Link href="/admin/posts/new" className="text-primary hover:underline">
                  Create one →
                </Link>
              </div>
            ) : (
              stats.recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/20"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(post.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <Badge
                      variant={post.status === "PUBLISHED" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {post.status}
                    </Badge>
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              Recent Projects
            </p>
            <Link
              href="/admin/projects"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {stats.recentProjects.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No projects yet.{" "}
                <Link href="/admin/projects/new" className="text-primary hover:underline">
                  Create one →
                </Link>
              </div>
            ) : (
              stats.recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/20"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{project.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      /projects/{project.slug}
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <Badge
                      variant={project.status === "ACTIVE" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {project.status}
                    </Badge>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-5">
        <p className="mb-4 text-sm font-semibold">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <FileText className="h-4 w-4" />
            New Post
          </Link>
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <FolderOpen className="h-4 w-4" />
            New Project
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Tag className="h-4 w-4" />
            Manage Categories
          </Link>
          <Link
            href="/admin/media"
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ImageIcon className="h-4 w-4" />
            Media Library
          </Link>
        </div>
      </div>
    </div>
  );
}
