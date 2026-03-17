import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Logo } from "@/app/components/Logo";
import { fetchItems, updateItem } from "@/lib/actions/database";
import { getUser } from "@/lib/actions/auth";
import { findMatches } from "@/lib/utils/matching";
import { MatchPreview } from "@/app/components/MatchPreview";

interface DbItem {
  id: number;
  name: string;
  description: string;
  type: string;
  location: string[];
  itemdate: string;
  email: string;
  image?: string;
  islost: boolean;
  isresolved: boolean;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

async function markItemResolved(formData: FormData) {
  "use server";

  const id = formData.get("id");
  if (!id) return;

  await updateItem("items", String(id), { isresolved: true });
  revalidatePath("/my-items");
}

async function deleteItemAction(formData: FormData) {
  "use server";

  const id = formData.get("id");
  if (!id) return;

  // item no longer shows up anywhere in the app
  await updateItem("items", String(id), { is_deleted: true });
  revalidatePath("/my-items");
}

export default async function MyItemsPage() {
  const user = await getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const email = user.email as string;

  const [{ data }, { data: allFoundData }] = await Promise.all([
    fetchItems("items", { email, includeResolved: true }),
    fetchItems("items", { islost: false }),
  ]);

  const allItems = (data || []) as DbItem[];
  const allFoundItems = (allFoundData || []) as DbItem[];

  const lostItems = allItems.filter((item) => item.islost && !item.isresolved);
  const foundItems = allItems.filter(
    (item) => !item.islost && !item.isresolved
  );
  const resolvedItems = allItems.filter((item) => item.isresolved);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <div className="max-w-5xl mx-auto py-10 px-4 lg:px-6 space-y-10">
        <div className="flex items-center justify-between mb-2">
          <Logo size="sm" asLink />
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              ← Back to dashboard
            </Link>
            <Link
              href="/settings"
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white">
            My Items
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Items you&apos;ve reported as lost or found with{" "}
            <span className="font-mono">{email}</span>.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Items I&apos;ve lost
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                {lostItems.length} item{lostItems.length === 1 ? "" : "s"}
              </span>
            </div>

            {lostItems.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
                You haven&apos;t reported any lost items yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {lostItems.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-zinc-900 dark:text-white">
                            {item.name}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 capitalize">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          {formatDate(item.itemdate)}
                        </span>
                        <div className="flex items-center gap-2">
                          <form action={markItemResolved}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 text-zinc-100 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
                            >
                              Mark as Resolved
                            </button>
                          </form>
                          <form action={deleteItemAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                    <MatchPreview lostItemName={item.name} matches={findMatches(item, allFoundItems)} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Items I&apos;ve found
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {foundItems.length} item{foundItems.length === 1 ? "" : "s"}
              </span>
            </div>

            {foundItems.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
                You haven&apos;t reported any found items yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {foundItems.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-zinc-900 dark:text-white">
                            {item.name}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 capitalize">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          {formatDate(item.itemdate)}
                        </span>
                        <div className="flex items-center gap-2">
                          <form action={markItemResolved}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 text-zinc-100 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
                            >
                              Mark as Resolved
                            </button>
                          </form>
                          <form action={deleteItemAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              Resolved items
            </h2>
            <span className="text-xs px-2 py-1 rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {resolvedItems.length} item{resolvedItems.length === 1 ? "" : "s"}
            </span>
          </div>

          {resolvedItems.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              You don&apos;t have any resolved items yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {resolvedItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900/40 p-4 shadow-sm opacity-70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 line-through decoration-zinc-400/80">
                          {item.name}
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 capitalize">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-500 whitespace-nowrap">
                        {formatDate(item.itemdate)}
                      </span>
                      <form action={deleteItemAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
