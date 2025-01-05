import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  LightbulbIcon, 
  PlusCircle, 
  Settings,
  Menu,
  Upload
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

const navigation = [
  {
    name: "ダッシュボード",
    href: "/",
    icon: LayoutDashboard
  },
  {
    name: "プロジェクト一覧",
    href: "/projects",
    icon: LightbulbIcon
  },
  {
    name: "新規アイデア",
    href: "/ideas/new",
    icon: PlusCircle
  },
  {
    name: "アイデアをインポート",
    href: "/ideas/import",
    icon: Upload
  },
  {
    name: "設定",
    href: "/settings",
    icon: Settings
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* モバイル用ハンバーガーメニュー */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <nav className="space-y-4">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                    location === item.href ? "bg-accent" : "transparent"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* デスクトップ用サイドバー */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-semibold">イノベーションプラットフォーム</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <a
                          className={cn(
                            "flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                            location === item.href ? "bg-accent" : "transparent"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}