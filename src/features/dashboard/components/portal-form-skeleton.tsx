import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils/cn"

export type PortalFormSkeletonSection = {
  fields: number
  title?: boolean
  description?: boolean
  columns?: 1 | 2 | 3
}

type PortalFormSkeletonProps = {
  className?: string
  fields?: number
  sections?: PortalFormSkeletonSection[]
  columns?: 1 | 2
  showActions?: boolean
  showDescription?: boolean
  showTitle?: boolean
}

function FieldSkeleton() {
  return (
    <div className="space-y-2.5">
      <Skeleton className="h-3.5 w-28 rounded-md" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  )
}

function FieldsGrid({
  fields,
  columns,
}: {
  fields: number
  columns: 1 | 2 | 3
}) {
  return (
    <div
      className={cn(
        "grid gap-5",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {Array.from({ length: fields }, (_, index) => (
        <FieldSkeleton key={index} />
      ))}
    </div>
  )
}

export function PortalFormSkeleton({
  className,
  fields = 6,
  sections,
  columns = 2,
  showActions = true,
  showDescription = true,
  showTitle = true,
}: PortalFormSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-card text-card-foreground overflow-hidden rounded-2xl border shadow-sm",
        className,
      )}
    >
      {(showTitle || showDescription) && (
        <div className="bg-muted/15 space-y-2 border-b p-5 sm:p-6">
          {showTitle ? <Skeleton className="h-6 w-52 rounded-md" /> : null}
          {showDescription ? (
            <Skeleton className="h-4 w-full max-w-xl rounded-md" />
          ) : null}
        </div>
      )}

      <div className="space-y-7 p-5 sm:p-6">
        {sections?.length ? (
          sections.map((section, sectionIndex) => (
            <section key={sectionIndex} className="space-y-4">
              {sectionIndex > 0 ? <div className="border-t" /> : null}
              {section.title || section.description ? (
                <div className="space-y-2 pt-1">
                  {section.title ? (
                    <Skeleton className="h-5 w-44 rounded-md" />
                  ) : null}
                  {section.description ? (
                    <Skeleton className="h-3.5 w-full max-w-md rounded-md" />
                  ) : null}
                </div>
              ) : null}
              <FieldsGrid
                fields={section.fields}
                columns={section.columns ?? columns}
              />
            </section>
          ))
        ) : (
          <FieldsGrid fields={fields} columns={columns} />
        )}
      </div>

      {showActions ? (
        <div className="bg-muted/10 flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Skeleton className="h-10 w-full rounded-xl sm:w-24" />
          <Skeleton className="h-10 w-full rounded-xl sm:w-32" />
        </div>
      ) : null}
    </div>
  )
}
