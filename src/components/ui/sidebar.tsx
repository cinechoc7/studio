import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const SidebarContext = React.createContext<{ isCollapsed: boolean }>({ isCollapsed: false });

const Sidebar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <aside
        ref={ref}
        className={cn("h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border", className)}
        {...props}
    />
))
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 border-b border-sidebar-border", className)} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto", className)} {...props} />
))
SidebarContent.displayName = "SidebarContent"

const SidebarMenu = React.forwardRef<
    HTMLUListElement,
    React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("space-y-2 p-2", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
    HTMLLIElement,
    React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

type SidebarMenuButtonProps = React.HTMLAttributes<HTMLAnchorElement> & {
    asChild?: boolean,
    tooltip?: string
}

const SidebarMenuButton = React.forwardRef<
    HTMLAnchorElement,
    SidebarMenuButtonProps
>(({ className, children, tooltip, asChild, ...props }, ref) => {

    const Comp = asChild ? "div" : "a";

    const buttonContent = (
         <Comp
            ref={ref}
            className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", className)}
            {...props}
        >
            {children}
        </Comp>
    )

    if (tooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                       {buttonContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return buttonContent;
})
SidebarMenuButton.displayName = "SidebarMenuButton"


export { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton }
