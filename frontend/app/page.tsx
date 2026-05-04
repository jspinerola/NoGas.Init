import { AppSidebar, MobileNav } from "@/components/app-sidebar"
import DashboardClient from "@/components/dashboard/dashboard-client"

// TODO: CHANGE THIS PAGE TO OUR HOME PAGE PROVIDING AND OVERVIEW OF THE APP

export default function Page() {
  const currentDateTime = new Date().toLocaleString()
  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:h-16 md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div>
              <h1 className="text-lg font-semibold text-foreground md:text-xl">
                Dashboard
              </h1>
              <p className="hidden text-sm text-muted-foreground sm:block">
                Welcome! Here&apos;s your car maintenance overview.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden text-muted-foreground lg:block">
              Last Updated: {currentDateTime}
            </span>
          </div>
        </header>
        <div className="space-y-4 p-4 md:space-y-6 md:p-6">
          <DashboardClient />
        </div>
      </main>
    </div>
  )
}
