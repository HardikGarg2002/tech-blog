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
  Image,
  ArrowRight,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const result = await loadDashboardStats();

  if (!result.ok) {
    return (
      <div className="text-destructive text-sm">
        Failed to load stats: {result.error}
      </div>
    );
  }

  const stats = result.data;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your content
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={FileText}
          accent="text-violet-500"
        />
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
          icon={Image}
          accent="text-cyan-500"
        />
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/30">
            <p className="font-semibold text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Recent Posts
            </p>
            <Link
              href="/admin/posts"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {stats.recentPosts.length === 0 ? (
              <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                No posts yet.{" "}
                <Link href="/admin/posts/new" className="text-primary hover:underline">
                  Create one →
                </Link>
              </div>
            ) : (
              stats.recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(post.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
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

        {/* Recent Projects */}
        <div className="border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/30">
            <p className="font-semibold text-sm flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              Recent Projects
            </p>
            <Link
              href="/admin/projects"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {stats.recentProjects.length === 0 ? (
              <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                No projects yet.{" "}
                <Link href="/admin/projects/new" className="text-primary hover:underline">
                  Create one →
                </Link>
              </div>
            ) : (
              stats.recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      /projects/{project.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
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

      {/* Quick actions */}
      <div className="border rounded-xl p-5">
        <p className="font-semibold text-sm mb-4">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <FileText className="h-4 w-4" />
            New Post
          </Link>
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
          >
            <FolderOpen className="h-4 w-4" />
            New Project
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Tag className="h-4 w-4" />
            Manage Categories
          </Link>
          <Link
            href="/admin/media"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Image className="h-4 w-4" />
            Media Library
          </Link>
        </div>
      </div>
    </div>
  );
}
